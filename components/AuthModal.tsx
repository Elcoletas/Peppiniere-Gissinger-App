import React, { useState } from 'react';
import { X, User, UserPlus, AlertTriangle, Check, Globe, Eye, EyeOff } from 'lucide-react';
import { db } from '../services/mockDb';
import { Button } from './Button';
import { UserRole } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  notify: (msg: string, type: 'success' | 'error' | 'email') => void;
}

// Lista exhaustiva de países con banderas y prefijos
const COUNTRY_CODES = [
  { code: '+33', country: 'FR', label: 'France', flag: '🇫🇷' },
  { code: '+32', country: 'BE', label: 'Belgique', flag: '🇧🇪' },
  { code: '+41', country: 'CH', label: 'Suisse', flag: '🇨🇭' },
  { code: '+352', country: 'LU', label: 'Luxembourg', flag: '🇱🇺' },
  { code: '+49', country: 'DE', label: 'Allemagne', flag: '🇩🇪' },
  { code: '+34', country: 'ES', label: 'Espagne', flag: '🇪🇸' },
  { code: '+44', country: 'UK', label: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '+1', country: 'US', label: 'États-Unis/Canada', flag: '🇺🇸' },
  { code: '+39', country: 'IT', label: 'Italie', flag: '🇮🇹' },
  { code: '+351', country: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { code: '+31', country: 'NL', label: 'Pays-Bas', flag: '🇳🇱' },
  { code: '+48', country: 'PL', label: 'Pologne', flag: '🇵🇱' },
  { code: '+43', country: 'AT', label: 'Autriche', flag: '🇦🇹' },
  { code: '+46', country: 'SE', label: 'Suède', flag: '🇸🇪' },
  { code: '+47', country: 'NO', label: 'Norvège', flag: '🇳🇴' },
  { code: '+45', country: 'DK', label: 'Danemark', flag: '🇩🇰' },
  { code: '+358', country: 'FI', label: 'Finlande', flag: '🇫🇮' },
  { code: '+30', country: 'GR', label: 'Grèce', flag: '🇬🇷' },
  { code: '+353', country: 'IE', label: 'Irlande', flag: '🇮🇪' },
  { code: '+7', country: 'RU', label: 'Russie', flag: '🇷🇺' },
  { code: '+86', country: 'CN', label: 'Chine', flag: '🇨🇳' },
  { code: '+81', country: 'JP', label: 'Japon', flag: '🇯🇵' },
  { code: '+82', country: 'KR', label: 'Corée du Sud', flag: '🇰🇷' },
  { code: '+91', country: 'IN', label: 'Inde', flag: '🇮🇳' },
  { code: '+55', country: 'BR', label: 'Brésil', flag: '🇧🇷' },
  { code: '+52', country: 'MX', label: 'Mexique', flag: '🇲🇽' },
  { code: '+54', country: 'AR', label: 'Argentine', flag: '🇦🇷' },
  { code: '+57', country: 'CO', label: 'Colombie', flag: '🇨🇴' },
  { code: '+56', country: 'CL', label: 'Chili', flag: '🇨🇱' },
  { code: '+212', country: 'MA', label: 'Maroc', flag: '🇲🇦' },
  { code: '+213', country: 'DZ', label: 'Algérie', flag: '🇩🇿' },
  { code: '+216', country: 'TN', label: 'Tunisie', flag: '🇹🇳' },
  { code: '+20', country: 'EG', label: 'Égypte', flag: '🇪🇬' },
  { code: '+27', country: 'ZA', label: 'Afrique du Sud', flag: '🇿🇦' },
  { code: '+221', country: 'SN', label: 'Sénégal', flag: '🇸🇳' },
  { code: '+225', country: 'CI', label: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '+971', country: 'AE', label: 'Émirats Arabes Unis', flag: '🇦🇪' },
  { code: '+966', country: 'SA', label: 'Arabie Saoudite', flag: '🇸🇦' },
  { code: '+972', country: 'IL', label: 'Israël', flag: '🇮🇱' },
  { code: '+90', country: 'TR', label: 'Turquie', flag: '🇹🇷' },
  { code: '+61', country: 'AU', label: 'Australie', flag: '🇦🇺' },
  { code: '+64', country: 'NZ', label: 'Nouvelle-Zélande', flag: '🇳🇿' },
  { code: '+66', country: 'TH', label: 'Thaïlande', flag: '🇹🇭' },
  { code: '+84', country: 'VN', label: 'Vietnam', flag: '🇻🇳' },
  { code: '+62', country: 'ID', label: 'Indonésie', flag: '🇮🇩' },
  { code: '+60', country: 'MY', label: 'Malaisie', flag: '🇲🇾' },
  { code: '+65', country: 'SG', label: 'Singapour', flag: '🇸🇬' },
  { code: '+63', country: 'PH', label: 'Philippines', flag: '🇵🇭' }
].sort((a, b) => a.label.localeCompare(b.label));

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLoginSuccess, notify }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  
  // Phone State
  // Default to France
  const [phoneCountry, setPhoneCountry] = useState('+33');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validations
  const validatePassword = (pwd: string) => {
    // Min 8 chars, 1 uppercase, 1 number
    const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    return score; // Max 3
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'login') {
        if (!email.includes('@')) throw new Error("Email invalide");
        const user = await db.login(email);
        if (user) {
          onLoginSuccess(user);
          notify(`Bienvenue ${user.name} !`, 'success');
          onClose();
        } else {
          // db.login throws if verified is false or user not found, but we catch it here
          throw new Error("Erreur de connexion");
        }
      } else {
        // Register Logic
        if (!email || !name || !phoneNumber || !password) throw new Error("Tous les champs sont obligatoires");
        
        // Validate Password
        if (!validatePassword(password)) {
            throw new Error("Le mot de passe ne respecte pas les critères de sécurité.");
        }

        // Clean phone number (remove leading 0 if present because we add country code)
        let cleanNumber = phoneNumber.replace(/\s/g, '');
        if (cleanNumber.startsWith('0')) {
            cleanNumber = cleanNumber.substring(1);
        }
        
        // Validate basic digits
        if (!/^\d+$/.test(cleanNumber)) {
             throw new Error("Le numéro de téléphone ne doit contenir que des chiffres.");
        }

        const fullPhone = `${phoneCountry} ${cleanNumber}`;

        await db.register(name, email, fullPhone);
        
        // Registration successful
        notify("Compte créé ! Veuillez cliquer sur le lien envoyé par email.", 'email');
        onClose();
        // Reset form
        setEmail(''); setPassword(''); setName(''); setPhoneNumber('');
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Helper for testing
  const fillCredentials = (role: UserRole) => {
    if (role === UserRole.EMPLOYEE) {
        setEmail('admin@gissinger.fr');
        setPassword('Admin123');
        setActiveTab('login');
    } else {
        setEmail('michel@demo.fr');
        setPassword('User1234');
        setActiveTab('login');
    }
  };

  const passwordScore = getPasswordStrength(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
          <X size={24} />
        </button>
        
        {/* Header Tabs */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'login' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
                Connexion
            </button>
            <button 
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'register' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
                Inscription
            </button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                {activeTab === 'login' ? <User size={32} /> : <UserPlus size={32} />}
            </div>
            <h2 className="text-xl font-bold text-slate-800">
                {activeTab === 'login' ? 'Espace Personnel' : 'Rejoignez les Artisans'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
                {activeTab === 'login' 
                    ? 'Connectez-vous pour gérer vos rendez-vous.' 
                    : 'Créez un compte pour réserver votre consultation.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom Complet</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Téléphone <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="relative w-5/12">
                        <select 
                            value={phoneCountry}
                            onChange={(e) => setPhoneCountry(e.target.value)}
                            className="w-full h-full pl-2 pr-6 py-2 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none appearance-none text-sm truncate"
                        >
                            {COUNTRY_CODES.map((c) => (
                                <option key={c.country} value={c.code}>
                                    {c.flag} {c.label} ({c.code})
                                </option>
                            ))}
                        </select>
                        <Globe size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <input
                        type="tel"
                        className="w-7/12 px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="6 12 34 56 78"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nom@exemple.fr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mot de passe</label>
              <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-4 py-2 bg-white text-slate-900 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition pr-10 ${activeTab === 'register' && password && !validatePassword(password) ? 'border-amber-300' : 'border-slate-300'}`}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••"
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {activeTab === 'register' && (
                  <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1 w-full rounded-full overflow-hidden bg-slate-100">
                          <div className={`h-full w-1/3 transition-colors ${passwordScore >= 1 ? 'bg-red-400' : 'bg-transparent'}`}></div>
                          <div className={`h-full w-1/3 transition-colors ${passwordScore >= 2 ? 'bg-amber-400' : 'bg-transparent'}`}></div>
                          <div className={`h-full w-1/3 transition-colors ${passwordScore >= 3 ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 pt-1">
                          <span className={password.length >= 8 ? "text-emerald-600 font-bold" : ""}>• Min 8 caractères</span>
                          <span className={/[A-Z]/.test(password) ? "text-emerald-600 font-bold" : ""}>• 1 Majuscule</span>
                          <span className={/\d/.test(password) ? "text-emerald-600 font-bold" : ""}>• 1 Chiffre</span>
                      </div>
                  </div>
              )}
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex gap-2 items-start"><AlertTriangle size={16} className="shrink-0 mt-0.5" /> <span>{error}</span></div>}

            <Button type="submit" className="w-full shadow-lg shadow-emerald-200" isLoading={loading}>
              {activeTab === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </Button>
          </form>

          {/* Testing Shortcuts */}
          <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
            <p className="text-xs text-center text-slate-400 mb-2 font-mono">--- MODE DÉMO : ACCÈS RAPIDE ---</p>
            <div className="flex gap-2 justify-center">
                <button 
                    onClick={() => fillCredentials(UserRole.CLIENT)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600 transition"
                >
                    👤 Client
                </button>
                <button 
                    onClick={() => fillCredentials(UserRole.EMPLOYEE)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600 transition"
                >
                    🛡️ Employé (Admin)
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};