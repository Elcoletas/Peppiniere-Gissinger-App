export enum UserRole {
  CLIENT = 'CLIENT',
  EMPLOYEE = 'EMPLOYEE'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  RESCHEDULED_PENDING = 'RESCHEDULED_PENDING' // Employee changed time, waiting for client confirmation
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isVerified?: boolean; // New: Email verification status
  verificationToken?: string; // New: Token for email link
}

export interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string; // Added for contact
  userPhone?: string; // Added for contact
  date: string; // ISO String for date part YYYY-MM-DD
  time: string; // HH:mm
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
  notes?: string; // Internal notes
  cancellationReason?: string; // Reason sent to client
}

export interface ProductInfo {
  category: string;
  items: string[];
  tips: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}