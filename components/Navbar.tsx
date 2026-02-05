import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Sprout, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path 
    ? "bg-emerald-700 text-white shadow-sm" 
    : "text-white hover:bg-emerald-500 hover:text-white";

  return (
    <nav className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl group">
            <div className="bg-white p-1.5 rounded-full text-emerald-600 shadow-sm group-hover:scale-110 transition">
                <Sprout size={24} />
            </div>
            <span className="drop-shadow-sm">Jean Gissinger</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className={`px-4 py-2 rounded-lg font-medium transition ${isActive('/')}`}>Accueil</Link>
            
            {user?.role === UserRole.CLIENT && (
              <Link to="/dashboard" className={`px-4 py-2 rounded-lg font-medium transition ${isActive('/dashboard')}`}>Mes Rendez-vous</Link>
            )}
            
            {user?.role === UserRole.EMPLOYEE && (
               <Link to="/admin" className={`px-4 py-2 rounded-lg font-medium transition ${isActive('/admin')}`}>Administration</Link>
            )}
            
            <div className="border-l border-emerald-500 pl-4 ml-2 flex items-center">
                 {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <UserIcon size={16} /> {user.name}
                    </div>
                    <button 
                        onClick={onLogout} 
                        className="p-2 hover:bg-emerald-700 rounded-full transition"
                        title="Se déconnecter"
                    >
                        <LogOut size={18}/>
                    </button>
                  </div>
                 ) : (
                   <button 
                    onClick={onOpenAuth} 
                    className="bg-white text-emerald-600 px-5 py-2 rounded-full font-bold hover:bg-emerald-50 transition shadow-sm"
                   >
                    Connexion
                   </button>
                 )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
             <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-emerald-700 rounded text-white">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-emerald-700 px-4 pt-2 pb-6 space-y-2 shadow-inner">
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-3 border-b border-emerald-600 font-medium">Accueil</Link>
            {user?.role === UserRole.CLIENT && (
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block py-3 border-b border-emerald-600 font-medium">Mes Rendez-vous</Link>
            )}
             {user?.role === UserRole.EMPLOYEE && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block py-3 border-b border-emerald-600 font-medium">Administration</Link>
            )}
            <div className="pt-4">
                {user ? (
                    <button onClick={() => { onLogout(); setIsOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-emerald-800 py-3 rounded-lg">
                        <LogOut size={18} /> Déconnexion
                    </button>
                ) : (
                    <button onClick={() => { onOpenAuth(); setIsOpen(false); }} className="w-full bg-white text-emerald-600 font-bold py-3 rounded-lg">
                        Connexion
                    </button>
                )}
            </div>
        </div>
      )}
    </nav>
  );
};