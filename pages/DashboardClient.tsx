import React, { useEffect, useState } from 'react';
import { User, Appointment, AppointmentStatus } from '../types';
import { db } from '../services/mockDb';
import { Calendar } from '../components/Calendar';
import { Button } from '../components/Button';
import { Clock, Calendar as CalIcon, XCircle, AlertCircle, Info, Check, AlertTriangle, X, ArrowLeft, Scissors, Shovel, Stethoscope, FileText, HelpCircle, TreePine } from 'lucide-react';
import { ToastType } from '../components/Toast';

interface Props {
  user: User;
  notify: (msg: string, type: ToastType) => void;
}

const PREDEFINED_REASONS = [
  "Conseil aménagement jardin",
  "Plantation d'arbres/arbustes",
  "Diagnostic plantes malades",
  "Devis aménagement complet",
  "Entretien / Taille",
  "Autre demande..."
];

export const DashboardClient: React.FC<Props> = ({ user, notify }) => {
  const [activeTab, setActiveTab] = useState<'my-appointments' | 'book'>('my-appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<{ date: string, time: string } | null>(null);
  
  // Booking Form State
  const [reasonType, setReasonType] = useState(PREDEFINED_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  
  // New Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    const apps = await db.getAppointments({ userId: user.id });
    const clientApps = apps.filter(a => a.status !== AppointmentStatus.BLOCKED);
    setAppointments(clientApps.reverse());
    setLoading(false);
  };

  const handleSlotSelect = (date: string, time: string) => {
    setBookingDetails({ date, time });
  };

  const confirmBooking = async () => {
    if (!bookingDetails) return;
    
    // VALIDATION STRICTE: Si "Autre", le champ texte est obligatoire
    if (reasonType === "Autre demande..." && !customReason.trim()) {
        notify("Veuillez détailler votre demande dans le champ texte ci-dessous.", 'error');
        return;
    }

    // Construct final reason
    const finalReason = reasonType === "Autre demande..." ? customReason : reasonType;
    
    if (!finalReason.trim()) {
        notify("Veuillez préciser le motif de la consultation.", 'error');
        return;
    }

    setSubmitting(true);
    try {
      await db.createAppointment(user.id, user.name, bookingDetails.date, bookingDetails.time, finalReason);
      notify("Rendez-vous confirmé ! Un email a été envoyé.", 'success');
      setBookingDetails(null);
      setReasonType(PREDEFINED_REASONS[0]);
      setCustomReason('');
      setActiveTab('my-appointments');
      fetchAppointments();
    } catch (e: any) {
      notify(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open the modal instead of window.confirm
  const initiateCancel = (id: string) => {
    setAppointmentToCancel(id);
    setCancelModalOpen(true);
  };

  const proceedWithCancellation = async () => {
    if (!appointmentToCancel) return;
    
    setSubmitting(true);
    try {
      await db.updateStatus(appointmentToCancel, AppointmentStatus.CANCELLED, "Annulé par le client");
      notify("Rendez-vous annulé avec succès.", 'info');
      await fetchAppointments();
      setCancelModalOpen(false);
      setAppointmentToCancel(null);
    } catch (error) {
      notify("Erreur lors de l'annulation.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptReschedule = async (id: string) => {
      try {
          await db.updateStatus(id, AppointmentStatus.CONFIRMED);
          notify("Nouvel horaire accepté !", 'success');
          fetchAppointments();
      } catch (error) {
          notify("Erreur lors de la confirmation", 'error');
      }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
        case AppointmentStatus.CONFIRMED: return { text: 'Confirmé', class: 'bg-green-100 text-green-800 border border-green-200' };
        case AppointmentStatus.PENDING: return { text: 'En attente', class: 'bg-amber-100 text-amber-800 border border-amber-200' };
        case AppointmentStatus.RESCHEDULED_PENDING: return { text: 'Action Requise', class: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse' };
        case AppointmentStatus.CANCELLED: return { text: 'Annulé', class: 'bg-red-50 text-red-700 border border-red-100' };
        case AppointmentStatus.COMPLETED: return { text: 'Terminé', class: 'bg-slate-100 text-slate-800 border border-slate-200' };
        default: return { text: status, class: 'bg-gray-100' };
    }
  };

  // Helper to get Icon based on reason
  const getReasonIcon = (reason: string) => {
      if (reason.includes("Taille") || reason.includes("Entretien")) return <Scissors className="text-orange-500" />;
      if (reason.includes("Plantation")) return <Shovel className="text-emerald-600" />;
      if (reason.includes("Diagnostic") || reason.includes("malades")) return <Stethoscope className="text-red-500" />;
      if (reason.includes("Devis")) return <FileText className="text-blue-500" />;
      if (reason.includes("Conseil")) return <TreePine className="text-green-600" />;
      return <HelpCircle className="text-slate-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800">Espace Client</h1>
           <p className="text-slate-500">Bienvenue, {user.name}</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button 
            onClick={() => setActiveTab('my-appointments')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'my-appointments' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Mes Rendez-vous
          </button>
          <button 
            onClick={() => setActiveTab('book')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'book' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
          >
            + Nouveau RDV
          </button>
        </div>
      </div>

      {activeTab === 'my-appointments' && (
        <div className="space-y-4">
          {loading ? (
             <div className="flex justify-center py-10">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
             </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <CalIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500">Vous n'avez aucun rendez-vous programmé.</p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab('book')}>Réserver maintenant</Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map((app, index) => {
                const statusStyle = getStatusLabel(app.status);
                const isRescheduled = app.status === AppointmentStatus.RESCHEDULED_PENDING;
                
                // Add staggered animation delay
                const animStyle = { animationDelay: `${index * 0.1}s` };

                return (
                  <div key={app.id} style={animStyle} className={`bg-white p-5 rounded-xl shadow-sm border flex flex-col hover:shadow-md transition-all animate-fade-in ${isRescheduled ? 'border-blue-300 ring-2 ring-blue-50' : 'border-slate-200'}`}>
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <div className={`p-1.5 rounded-full bg-slate-50 border border-slate-100`}>
                             <CalIcon size={14} />
                          </div>
                          <span className={isRescheduled ? 'font-bold text-blue-800' : 'font-medium'}>{app.date}</span>
                          <span className="text-slate-300">•</span>
                          <span className={isRescheduled ? 'font-bold text-blue-800' : 'font-medium'}>{app.time}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyle.class}`}>
                          {statusStyle.text}
                        </span>
                     </div>
                     
                     <div className="flex gap-3 mb-4 mt-1">
                        <div className="mt-1 p-2 bg-slate-50 rounded-lg h-fit border border-slate-100">
                            {getReasonIcon(app.reason)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 leading-tight">{app.reason}</h3>
                            <p className="text-xs text-slate-400 mt-1">ID: {app.id.substring(0,6)}</p>
                        </div>
                     </div>
                     
                     {/* Client notification for Reschedule */}
                     {isRescheduled && (
                        <div className="mt-auto mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                            <div className="flex items-center gap-2 font-bold mb-1">
                                <AlertTriangle size={16} className="text-blue-600"/> Nouveau créneau ?
                            </div>
                            <p className="text-xs mb-2 text-blue-800">L'artisan propose cet horaire. Merci de valider.</p>
                            <Button 
                                onClick={() => handleAcceptReschedule(app.id)} 
                                size="sm" 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
                            >
                                <Check size={16} className="mr-1"/> Accepter
                            </Button>
                        </div>
                     )}

                     {app.cancellationReason && (
                       <div className="mt-auto mb-3 p-2 bg-red-50 border border-red-100 rounded text-sm text-red-700 flex gap-2 items-start">
                         <Info size={16} className="shrink-0 mt-0.5" />
                         <p className="text-xs"><span className="font-bold">Annulé:</span> {app.cancellationReason}</p>
                       </div>
                     )}

                     <div className="mt-auto pt-2 flex gap-2">
                       {app.status !== AppointmentStatus.CANCELLED && app.status !== AppointmentStatus.COMPLETED && (
                         <button 
                           onClick={() => initiateCancel(app.id)}
                           className="text-red-500 hover:bg-red-50 hover:text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 w-full border border-transparent hover:border-red-100"
                         >
                           <XCircle size={16} /> {isRescheduled ? 'Refuser / Annuler' : 'Annuler le RDV'}
                         </button>
                       )}
                     </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Tab - REINSTATED */}
      {activeTab === 'book' && (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setActiveTab('my-appointments')}
                    className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition"
                >
                    <ArrowLeft size={20} /> Retour
                </button>
                <h2 className="text-xl font-bold text-slate-800">Nouvelle Réservation</h2>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1">
                    <Calendar onSelectSlot={handleSlotSelect} />
                </div>

                <div className="w-full xl:w-1/3">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Détails du Rendez-vous</h3>
                        
                        {!bookingDetails ? (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <Clock size={32} className="mx-auto mb-2 opacity-30" />
                                <p>Sélectionnez une date et une heure dans le calendrier.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-emerald-900">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Date</span>
                                        <span className="font-semibold">{bookingDetails.date}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Heure</span>
                                        <span className="font-semibold">{bookingDetails.time}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Motif de la consultation <span className="text-red-500">*</span>
                                    </label>
                                    
                                    <div className="relative">
                                        <select 
                                            value={reasonType}
                                            onChange={(e) => setReasonType(e.target.value)}
                                            className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-slate-900 mb-2 appearance-none"
                                        >
                                            {PREDEFINED_REASONS.map(r => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-3.5 pointer-events-none">
                                            {getReasonIcon(reasonType)}
                                        </div>
                                    </div>

                                    {reasonType === "Autre demande..." && (
                                        <textarea
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none min-h-[100px] bg-white text-slate-900"
                                            placeholder="Précisez votre demande..."
                                            required
                                        />
                                    )}
                                </div>

                                <Button 
                                    onClick={confirmBooking} 
                                    isLoading={submitting}
                                    className="w-full shadow-lg shadow-emerald-100"
                                >
                                    Confirmer le Rendez-vous
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => { setCancelModalOpen(false); setAppointmentToCancel(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900">Êtes-vous sûr ?</h3>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                 <p className="font-bold flex items-center justify-center gap-1 mb-1">
                   <Info size={14} /> Note importante
                 </p>
                 <p>
                   Si possible, merci d'annuler votre rendez-vous au moins <strong>24 heures à l'avance</strong> pour nous permettre de nous organiser.
                 </p>
              </div>

              <p className="text-slate-500 text-sm">
                Cette action est irréversible. Le créneau sera libéré immédiatement.
              </p>

              <div className="flex gap-3 w-full mt-2">
                <Button 
                  variant="secondary" 
                  onClick={() => { setCancelModalOpen(false); setAppointmentToCancel(null); }}
                  className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Non, conserver
                </Button>
                <Button 
                  variant="danger" 
                  onClick={proceedWithCancellation}
                  isLoading={submitting}
                  className="flex-1"
                >
                  Oui, annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};