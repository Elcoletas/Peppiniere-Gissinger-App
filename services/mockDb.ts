import { User, Appointment, UserRole, AppointmentStatus } from '../types';
import { emailService } from './emailService';
import { APP_CONFIG } from '../config';

const USERS_KEY = 'gissinger_users';
const APPOINTMENTS_KEY = 'gissinger_appointments';

// Initial Data - Minimal for production readiness
const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Jean Gissinger (Admin)',
    email: 'admin@gissinger.fr', 
    role: UserRole.EMPLOYEE,
    phone: APP_CONFIG.COMPANY_PHONE,
    isVerified: true // Admin always verified
  }
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDatabase {
  private users: User[];
  private appointments: Appointment[];
  private currentUser: User | null = null;

  constructor() {
    // Try to load from local storage first (simulating persistence)
    const storedUsers = localStorage.getItem(USERS_KEY);
    const storedApps = localStorage.getItem(APPOINTMENTS_KEY);

    this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
    this.appointments = storedApps ? JSON.parse(storedApps) : [];
  }

  private save() {
    localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(this.appointments));
  }

  // Auth
  async login(email: string): Promise<User | null> {
    await delay(500);
    // Case insensitive login
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      if (user.role === UserRole.CLIENT && !user.isVerified) {
        throw new Error("Veuillez vérifier votre email avant de vous connecter.");
      }
      this.currentUser = user;
      return user;
    }
    return null;
  }

  async register(name: string, email: string, phone: string): Promise<User> {
    await delay(800);
    if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Cet email est déjà enregistré');
    }

    // Generate simple token
    const verificationToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      role: UserRole.CLIENT,
      isVerified: false, // Must verify first
      verificationToken
    };
    
    this.users.push(newUser);
    // Do NOT set current user immediately, they must login after verification
    this.save();

    // Send Verification Email
    await emailService.sendVerification(newUser.email, newUser.name, verificationToken);

    return newUser;
  }

  async verifyUser(token: string): Promise<boolean> {
      await delay(500);
      const userIndex = this.users.findIndex(u => u.verificationToken === token);
      
      if (userIndex > -1) {
          this.users[userIndex].isVerified = true;
          this.users[userIndex].verificationToken = undefined; // Clear token
          this.save();
          return true;
      }
      return false;
  }

  logout() {
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Appointments
  async getAppointments(filters?: { userId?: string, date?: string }): Promise<Appointment[]> {
    await delay(300);
    let filtered = [...this.appointments];
    if (filters?.userId) {
      filtered = filtered.filter(a => a.userId === filters.userId);
    }
    if (filters?.date) {
      filtered = filtered.filter(a => a.date === filters.date);
    }
    return filtered.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }

  async createAppointment(userId: string, userName: string, date: string, time: string, reason: string, isBlock: boolean = false): Promise<Appointment> {
    await delay(600);
    
    // Check availability (ignore cancelled)
    const isTaken = this.appointments.some(a => 
      a.date === date && 
      a.time === time && 
      a.status !== AppointmentStatus.CANCELLED
    );

    if (isTaken) {
      throw new Error('Ce créneau n\'est plus disponible.');
    }

    // Get user details for contact info if it's a real user
    const user = this.users.find(u => u.id === userId);

    const newApp: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName: isBlock ? "⛔ INDISPONIBLE" : userName,
      userEmail: user?.email,
      userPhone: user?.phone,
      date,
      time,
      reason: isBlock ? "Créneau bloqué par l'administration" : reason,
      // Clients are now CONFIRMED by default
      status: isBlock ? AppointmentStatus.BLOCKED : AppointmentStatus.CONFIRMED,
      createdAt: new Date().toISOString()
    };

    this.appointments.push(newApp);
    this.save();
    
    if (!isBlock && user && user.email) {
        // Email to Client
        emailService.sendBookingConfirmation(user.email, user.name, date, time, reason);
        // Email to Admin
        emailService.sendAdminNotification(user.name, date, time, reason, user.phone);
    }
    
    return newApp;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    await delay(400);
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error("RDV non trouvé");
    
    const oldApp = this.appointments[index];
    const updatedApp = { ...oldApp, ...updates };
    this.appointments[index] = updatedApp;
    this.save();

    // Check if status or time changed to notify user
    if (updatedApp.userEmail && (updates.status || updates.date || updates.time)) {
        // If Rescheduled by Admin
        if (updates.status === AppointmentStatus.RESCHEDULED_PENDING) {
             emailService.sendStatusUpdate(
                 updatedApp.userEmail, 
                 updatedApp.userName, 
                 updatedApp.date, 
                 updatedApp.time, 
                 updatedApp.status, 
                 "Nouvel horaire proposé."
             );
        }
    }

    return this.appointments[index];
  }

  async updateStatus(appointmentId: string, status: AppointmentStatus, cancelReason?: string): Promise<void> {
    await delay(400);
    const appIndex = this.appointments.findIndex(a => a.id === appointmentId);
    if (appIndex > -1) {
      const app = this.appointments[appIndex];
      const previousStatus = app.status;
      
      this.appointments[appIndex].status = status;
      if (cancelReason) {
        this.appointments[appIndex].cancellationReason = cancelReason;
      }
      this.save();
      
      // Notifications logic
      if (app.userEmail) {
          // 1. Admin confirms or cancels a Client appointment
          if (previousStatus !== status) {
              emailService.sendStatusUpdate(
                  app.userEmail, 
                  app.userName, 
                  app.date, 
                  app.time, 
                  status, 
                  cancelReason
              );
          }
      }

      // 2. Client cancels their own appointment -> Notify Admin
      if (status === AppointmentStatus.CANCELLED && cancelReason === "Annulé par le client") {
          emailService.sendCancellationToAdmin(app.userName, app.date, app.time, cancelReason);
      }
    }
  }

  // Public getter for knowledge base
  getShopInfo() {
    return {
      name: APP_CONFIG.COMPANY_NAME,
      address: APP_CONFIG.COMPANY_ADDRESS,
      phone: APP_CONFIG.COMPANY_PHONE,
      hours: "Mardi-Samedi: 8h00-12h00 et 13h30-17h30 (Samedi fermeture 16h30). Fermé le Lundi et Dimanche.",
      products: [
        { category: "Arbres Fruitiers", items: ["Pommiers anciennes variétés", "Cerisiers", "Petits fruits (groseilles, framboises)"], tips: "Planter de préférence en automne/hiver hors gel." },
        { category: "Plantes d'Ornement", items: ["Rosiers", "Vivaces", "Arbustes à fleurs"], tips: "Bien arroser la première année de plantation." },
        { category: "Aménagement", items: ["Haies champêtres", "Arbres d'ombrage", "Plantes de rocaille"], tips: "Pensez aux distances de plantation." }
      ]
    };
  }
}

export const db = new MockDatabase();