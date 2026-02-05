import React from 'react';
import { Calendar, CheckCircle, Leaf, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '../components/Button';
import { User as UserType } from '../types';

interface HomeProps {
  onBookNow: () => void;
  user: UserType | null;
}

export const Home: React.FC<HomeProps> = ({ onBookNow, user }) => {
  return (
    <div className="space-y-12 pb-12">
      {/* Standard Hero Section */}
      <div className="bg-emerald-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    Pépinières Jean Gissinger<br/>
                    <span className="text-emerald-200">Artisans du Végétal</span>
                </h1>
                <p className="text-lg text-emerald-50 max-w-lg">
                    Depuis 1880, nous cultivons votre passion pour le jardin. Profitez de nos conseils d'experts et réservez votre consultation personnalisée en ligne.
                </p>
                <div className="flex gap-4 pt-4">
                    <Button 
                        size="lg" 
                        onClick={onBookNow} 
                        className="!bg-white !text-emerald-700 hover:!bg-emerald-50 border-none font-bold shadow-lg"
                    >
                        {user ? 'Prendre Rendez-vous' : 'Connexion / Inscription'}
                    </Button>
                </div>
            </div>
            <div className="flex-1 relative">
                <img 
                    src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2664&auto=format&fit=crop" 
                    alt="Pépinière" 
                    className="rounded-2xl shadow-2xl border-4 border-emerald-400/30 object-cover h-80 w-full"
                />
            </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Nos Services</h2>
            <p className="text-slate-500 mt-2">Tout pour votre jardin au même endroit</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:border-emerald-300 transition group">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition">
                    <Calendar size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Rendez-vous Conseil</h3>
                <p className="text-slate-600 leading-relaxed">
                    Un projet d'aménagement ? Réservez un créneau avec nos experts pour en discuter sereinement.
                </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:border-emerald-300 transition group">
                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition">
                    <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Qualité Garantie</h3>
                <p className="text-slate-600 leading-relaxed">
                    Nos végétaux sont acclimatés à la région et cultivés dans le respect de l'environnement.
                </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:border-emerald-300 transition group">
                <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition">
                    <Leaf size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Large Choix</h3>
                <p className="text-slate-600 leading-relaxed">
                    Arbres fruitiers, arbustes d'ornement, vivaces... Découvrez notre production locale.
                </p>
            </div>
        </div>
      </div>

      {/* Info / Footer-ish section */}
      <div className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Besoin de nous trouver ?</h2>
            <div className="bg-white inline-block p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-8 text-left">
                    <div className="flex items-start gap-3">
                        <MapPin className="text-emerald-500 mt-1" />
                        <div>
                            <p className="font-bold text-slate-900">Adresse</p>
                            <p className="text-slate-600">122 rue 4e Rgt de Spahis Marocain<br/>68250 ROUFFACH</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Leaf className="text-emerald-500 mt-1" />
                        <div>
                            <p className="font-bold text-slate-900">Horaires Janvier/Février</p>
                            <p className="text-slate-600">
                                Mar-Sam : 8h-12h / 13h30-17h30 <br/>
                                <span className="text-xs text-slate-400">(Samedi fermeture 16h30)</span><br/>
                                <span className="font-semibold text-red-500">Fermé le Lundi et Dimanche</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};