import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { DashboardClient } from './pages/DashboardClient';
import { DashboardEmployee } from './pages/DashboardEmployee';
import { VerifyPage } from './pages/VerifyPage';
import { MentionsLegales, CGU, PolitiqueConfidentialite } from './pages/LegalPages';
import { AuthModal } from './components/AuthModal';
import { AgroBot } from './components/AgroBot';
import { Toast, ToastType } from './components/Toast';
import { db } from './services/mockDb';
import { User, UserRole } from './types';
import { Facebook, Instagram, Youtube, Sprout, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from './config';

// Custom Pinterest Icon
const PinterestIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M20 12h2" />
    <path d="M2 12h2" />
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12h1a2 2 0 0 1 0 4H9" />
  </svg>
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Notification System
  const [toast, setToast] = useState<{ msg: string, type: ToastType } | null>(null);

  const showToast = (msg: string, type: ToastType) => {
    setToast({ msg, type });
  };

  useEffect(() => {
    // Check local session
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
    showToast("Vous avez été déconnecté.", 'info');
    window.location.hash = '/'; 
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
       <div className="relative">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
             <Sprout size={32} className="text-emerald-600 animate-bounce" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-400 rounded-full border-2 border-white animate-ping"></div>
       </div>
       <p className="mt-4 text-emerald-800 font-bold text-lg tracking-wide animate-fade-in">Pépinières Jean Gissinger</p>
       <p className="text-slate-400 text-sm">Chargement de votre jardin...</p>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          onOpenAuth={() => setIsAuthOpen(true)} 
        />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home 
              user={user}
              onBookNow={() => {
                if(user) {
                  window.location.hash = '/dashboard';
                } else {
                  showToast("Veuillez vous connecter pour réserver.", 'info');
                  setIsAuthOpen(true);
                }
              }} 
            />} />
            
            <Route path="/dashboard" element={
              user && user.role === UserRole.CLIENT ? (
                <DashboardClient user={user} notify={showToast} />
              ) : (
                <Navigate to="/" replace />
              )
            } />
            
            <Route path="/admin" element={
              user && user.role === UserRole.EMPLOYEE ? (
                <DashboardEmployee user={user} notify={showToast} />
              ) : (
                <Navigate to="/" replace />
              )
            } />

            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          </Routes>
        </main>

        <AgroBot />
        
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onLoginSuccess={handleLogin} 
          notify={showToast}
        />

        {toast && (
          <Toast 
            message={toast.msg} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}

        {/* Extensive Footer Reorganized */}
        <footer className="bg-emerald-900 text-emerald-100 pt-16 pb-8 border-t-4 border-amber-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              
              {/* Column 1: Brand & Socials (Moved here for better visual flow) */}
              <div className="space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 font-bold text-2xl text-white">
                        <div className="bg-white p-1.5 rounded-full text-emerald-900">
                            <Sprout size={24} />
                        </div>
                        <span>Jean Gissinger</span>
                    </div>
                    <p className="text-emerald-200/80 text-sm leading-relaxed">
                        Artisans du Végétal depuis 1880. Nous cultivons la passion du jardin avec des plantes élevées en Alsace, pour l'Alsace.
                    </p>
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <ShieldCheck size={16} /> Production Locale & Responsable
                    </div>
                 </div>

                 {/* Socials Block */}
                 <div>
                     <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">Suivez-nous</p>
                     <div className="flex flex-wrap gap-3">
                        <a 
                            href="https://www.facebook.com/PepinieresJeanGissinger/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 bg-emerald-800 rounded-lg hover:bg-[#1877F2] text-white transition-all transform hover:-translate-y-1 shadow-md"
                            title="Facebook"
                        >
                            <Facebook size={20} />
                        </a>
                        <a 
                            href="https://www.instagram.com/pepinieres.gissinger/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 bg-emerald-800 rounded-lg hover:bg-[#E4405F] text-white transition-all transform hover:-translate-y-1 shadow-md"
                            title="Instagram"
                        >
                            <Instagram size={20} />
                        </a>
                        <a 
                            href="https://www.youtube.com/user/lesartisansduvegetal" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 bg-emerald-800 rounded-lg hover:bg-[#FF0000] text-white transition-all transform hover:-translate-y-1 shadow-md"
                            title="YouTube"
                        >
                            <Youtube size={20} />
                        </a>
                        <a 
                            href="https://www.pinterest.com/lesartisansduvg/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 bg-emerald-800 rounded-lg hover:bg-[#BD081C] text-white transition-all transform hover:-translate-y-1 shadow-md"
                            title="Pinterest"
                        >
                            <PinterestIcon size={20} />
                        </a>
                    </div>
                 </div>
              </div>

              {/* Column 2: Contact */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                   Contactez-nous
                </h3>
                <ul className="space-y-4 text-sm">
                   <li className="flex items-start gap-3">
                      <MapPin className="text-emerald-400 shrink-0 mt-1" size={18} />
                      <span className="opacity-90">
                        122 rue 4e Rgt de Spahis Marocain<br/>
                        68250 ROUFFACH
                      </span>
                   </li>
                   <li className="flex items-center gap-3">
                      <Phone className="text-emerald-400 shrink-0" size={18} />
                      <a href={`tel:${APP_CONFIG.COMPANY_PHONE}`} className="hover:text-white transition opacity-90">{APP_CONFIG.COMPANY_PHONE}</a>
                   </li>
                   <li className="flex items-center gap-3">
                      <Mail className="text-emerald-400 shrink-0" size={18} />
                      <a href={`mailto:${APP_CONFIG.COMPANY_EMAIL}`} className="hover:text-white transition opacity-90">{APP_CONFIG.COMPANY_EMAIL}</a>
                   </li>
                   <li className="flex items-start gap-3 mt-4 pt-4 border-t border-emerald-800">
                      <Clock className="text-amber-400 shrink-0 mt-1" size={18} />
                      <span className="opacity-90 text-xs">
                        Mar-Sam : 8h-12h / 13h30-17h30<br/>
                        (Samedi fermeture 16h30)<br/>
                        Fermé Dimanche & Lundi
                      </span>
                   </li>
                </ul>
              </div>

              {/* Column 3: Quick Navigation (Liens Rapides) */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6">Liens Rapides</h3>
                <ul className="space-y-3 text-sm">
                   <li>
                      <Link 
                        to="/" 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all opacity-80"
                      >
                         <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span> Accueil
                      </Link>
                   </li>
                   <li>
                      <button 
                         onClick={(e) => {
                             e.preventDefault();
                             if (user) {
                                window.location.hash = '/dashboard';
                             } else {
                                setIsAuthOpen(true);
                                showToast("Veuillez vous connecter pour accéder à votre espace.", 'info');
                             }
                         }}
                         className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all opacity-80 text-left w-full"
                      >
                         <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span> Mon Espace Client
                      </button>
                   </li>
                </ul>
              </div>

              {/* Column 4: Legal Information */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6">Informations Légales</h3>
                <ul className="space-y-3 text-sm">
                   <li>
                      <Link to="/mentions-legales" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all opacity-80">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Mentions Légales
                      </Link>
                   </li>
                   <li>
                      <Link to="/cgu" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all opacity-80">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Conditions Générales (CGU)
                      </Link>
                   </li>
                   <li>
                      <Link to="/politique-confidentialite" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all opacity-80">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Politique de Confidentialité
                      </Link>
                   </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-emerald-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-60">
                <p>© {new Date().getFullYear()} Pépinières Jean Gissinger. Tous droits réservés.</p>
                <div className="flex items-center gap-1">
                   <span>Fait avec</span> <span className="text-red-400">♥</span> <span>en Alsace</span>
                </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;