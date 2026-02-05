import React, { useEffect, useState } from 'react';
import { User, Appointment, AppointmentStatus } from '../types';
import { db } from '../services/mockDb';
import { Calendar } from '../components/Calendar';
import { X, RefreshCw, Phone, Ban, Lock, Edit3, Mail, Trash2, Unlock, AlertTriangle, Info } from 'lucide-react';
import { Button } from '../components/Button';
import { ToastType } from '../components/Toast';

interface Props {
  user: User;
  notify: (msg: string, type: ToastType) => void;
}

const STATUS_LABELS: Record<string, string> = {
  [AppointmentStatus.PENDING]: 'En attente',
  [AppointmentStatus.CONFIRMED]: 'Confirmé',
  [AppointmentStatus.CANCELLED]: 'Annulé',
  [AppointmentStatus.COMPLETED]: 'Terminé',
  [AppointmentStatus.BLOCKED]: 'Bloqué',
  [AppointmentStatus.RESCHEDULED_PENDING]: 'Action Requise'
};

const PREDEFINED_CANCEL_REASONS = [
  "Imprévu personnel",
  "Conditions météorologiques",
  "Indisponibilité matériel",
  "Erreur de planning",
  "Autre"
];

export const DashboardEmployee: React.FC<Props> = ({ user, notify }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'CONFIRMED' | 'BLOCKED' | 'CANCELLED'>('ALL');
  const [loading, setLoading] = useState(false);
  const [blocking, setBlocking] = useState(false);
  
  // Controls calendar reload
  const [refreshCalendar, setRefreshCalendar] = useState(0);
  
  // Inspection State
  const [inspectedSlot, setInspectedSlot] = useState<{
      date: string;
      time: string;
      appointment?: Appointment;
  } | null>(null);

  // Modals
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean, appId: string | null }>({ isOpen: false, appId: null });
  const [cancelReasonType, setCancelReasonType] = useState(PREDEFINED_CANCEL_REASONS[0]);
  const [customCancelReason, setCustomCancelReason] = useState("");

  const [rescheduleModal, setRescheduleModal] = useState<{ isOpen: boolean, appId: string | null }>({ isOpen: false, appId: null });
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // New Unblock Modal State
  const [unblockModal, setUnblockModal] = useState<{ isOpen: boolean, appId: string | null }>({ isOpen: false, appId: null });

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    let apps = await db.getAppointments();
    
    // Apply filters locally for the list view
    if (filter === 'TODAY') {
      const today = new Date().toISOString().split('T')[0];
      apps = apps.filter(a => a.date === today);
    } else if (filter === 'CONFIRMED') {
      apps = apps.filter(a => a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.RESCHEDULED_PENDING);
    } else if (filter === 'BLOCKED') {
      apps = apps.filter(a => a.status === AppointmentStatus.BLOCKED);
    } else if (filter === 'CANCELLED') {
      apps = apps.filter(a => a.status === AppointmentStatus.CANCELLED);
    }
    
    setAppointments(apps.reverse()); 
    setLoading(false);
  };

  // Called when clicking ANY slot in Calendar (Free or Booked)
  const handleCalendarSelect = (date: string, time: string) => {
      // Find valid appointment (not cancelled)
      const existingApp = appointments.find(a => 
          a.date === date && 
          a.time === time && 
          a.status !== AppointmentStatus.CANCELLED
      );

      setInspectedSlot({
          date,
          time,
          appointment: existingApp
      });
  };

  const isShopOpen = (dateStr: string, timeStr: string) => {
      const d = new Date(dateStr);
      const day = d.getDay();
      
      if (day === 0 || day === 1) return false; // Dimanche (0) et Lundi (1) fermés
      
      const [h, m] = timeStr.split(':').map(Number);
      const mins = h * 60 + (m || 0);

      // Morning: 8:00 (480) - 12:00 (720)
      if (mins >= 480 && mins < 720) return true;
      
      // Afternoon: 13:30 (810) - 17:30 (1050) / 16:30 Sat (990)
      const endMins = day === 6 ? 990 : 1050; // Saturday closes 16:30, others 17:30
      
      if (mins >= 810 && mins < endMins) return true;
      
      return false;
  };

  const handleBlockSlot = async () => {
      if (!inspectedSlot) return;
      if (inspectedSlot.appointment) {
          notify("Impossible de bloquer : créneau déjà occupé.", 'error');
          return;
      }

      setBlocking(true);
      try {
          const newApp = await db.createAppointment(user.id, "Admin", inspectedSlot.date, inspectedSlot.time, "BLOQUÉ", true);
          notify("Créneau bloqué avec succès.", 'success');
          
          // IMMEDIATE UI UPDATE: Force the blocked state locally so the user sees feedback instantly
          setInspectedSlot(prev => prev ? ({ ...prev, appointment: newApp }) : null);

          // Background Refresh
          setRefreshCalendar(p => p + 1);
          fetchAppointments(); 
          
      } catch (error: any) {
          notify(error.message, 'error');
      } finally {
          setBlocking(false);
      }
  };

  // Trigger Confirmation Modal
  const promptUnblock = (id: string) => {
      setUnblockModal({ isOpen: true, appId: id });
  };

  // Execute Unblock
  const confirmUnblock = async () => {
      if (!unblockModal.appId) return;
      
      try {
          await db.updateStatus(unblockModal.appId, AppointmentStatus.CANCELLED, "Débloqué par l'admin");
          notify("Créneau libéré avec succès.", 'success');
          
          setRefreshCalendar(prev => prev + 1);
          await fetchAppointments();
          setInspectedSlot(null); // Clear Inspector
      } catch (e: any) {
          notify(e.message || "Erreur lors du déblocage.", 'error');
      } finally {
          setUnblockModal({ isOpen: false, appId: null });
      }
  };

  const openCancelModal = (id: string) => {
    setCancelModal({ isOpen: true, appId: id });
    setCancelReasonType(PREDEFINED_CANCEL_REASONS[0]);
    setCustomCancelReason("");
  };

  const handleEditClick = (app: Appointment) => {
      setNewDate(app.date);
      setNewTime(app.time);
      setRescheduleModal({ isOpen: true, appId: app.id });
  };

  const submitCancellation = async () => {
    if (cancelModal.appId) {
      const finalReason = cancelReasonType === "Autre" ? customCancelReason : cancelReasonType;
      
      if (!finalReason.trim()) {
        notify("Veuillez indiquer un motif.", 'error');
        return;
      }

      await db.updateStatus(cancelModal.appId, AppointmentStatus.CANCELLED, finalReason);
      setCancelModal({ isOpen: false, appId: null });
      notify("Action confirmée.", 'info');
      
      setRefreshCalendar(prev => prev + 1);
      await fetchAppointments();
      setInspectedSlot(null); // Clear inspection
    }
  };
  
  const submitReschedule = async () => {
      if (rescheduleModal.appId && newDate && newTime) {
          // Shop Hours Validation
          if (!isShopOpen(newDate, newTime)) {
              notify("Action impossible: La pépinière est fermée à cet horaire.\nHoraires: Mar-Sam 8h-12h / 13h30-17h30 (Sam 16h30). Fermé Lun/Dim.", 'error');
              return;
          }

          try {
             // Look up current appointment to check status
             const app = appointments.find(a => a.id === rescheduleModal.appId) || inspectedSlot?.appointment;
             
             if (!app) {
                 notify("Erreur: RDV introuvable.", 'error');
                 return;
             }

             const isBlocked = app.status === AppointmentStatus.BLOCKED;

             await db.updateAppointment(rescheduleModal.appId, { 
               date: newDate, 
               time: newTime,
               // If it was blocked, keep it blocked. If it was a client app, set to RESCHEDULED_PENDING
               status: isBlocked ? AppointmentStatus.BLOCKED : AppointmentStatus.RESCHEDULED_PENDING 
             });
             
             setRescheduleModal({ isOpen: false, appId: null });
             notify(isBlocked ? "Blocage déplacé avec succès." : "Proposition envoyée au client.", 'success');
             setRefreshCalendar(prev => prev + 1);
             fetchAppointments();
             setInspectedSlot(null);
          } catch (e: any) { notify("Erreur: Créneau peut-être déjà pris.", 'error'); }
      }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Administration</h1>
           <p className="text-slate-500">Pépinières Jean Gissinger - Gestion des RDV</p>
        </div>
        <Button variant="secondary" onClick={() => fetchAppointments()} className="text-sm">
           <RefreshCw size={16} className="mr-2" /> Actualiser
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* LEFT COLUMN: INSPECTOR & CALENDAR */}
        <div className="xl:w-1/3 flex flex-col gap-6">
            
            {/* INSPECTION PANEL - ALWAYS DARK THEME FOR ADMIN */}
            <div className={`p-6 rounded-xl shadow-lg border transition-all duration-300 ${inspectedSlot ? 'translate-y-0 opacity-100' : 'opacity-50 grayscale' } bg-slate-700 text-white border-slate-600 ring-4 ring-slate-100`}>
                
                {!inspectedSlot ? (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-center">
                        <Lock size={32} className="mb-2 opacity-20"/>
                        <p className="text-sm">Cliquez sur une heure dans le calendrier<br/>pour voir les détails ou bloquer.</p>
                    </div>
                ) : (
                    // SLOT SELECTED
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-3">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-amber-400">
                                <Lock size={20} /> Action sur créneau
                            </h3>
                            <button onClick={() => setInspectedSlot(null)} className="text-slate-400 hover:text-white transition"><X size={20}/></button>
                        </div>
                        
                        <p className="text-2xl font-light mb-6 text-slate-200">
                            {inspectedSlot.date} à {inspectedSlot.time}
                        </p>

                        {inspectedSlot.appointment ? (
                            // SHOW DETAILS
                            <div className="space-y-4 animate-fade-in">
                                {inspectedSlot.appointment.status === 'BLOCKED' ? (
                                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600 mb-4">
                                        <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                                            <Ban size={18} /> CRÉNEAU BLOQUÉ
                                        </div>
                                        <p className="text-xs text-slate-400">Les clients ne peuvent pas réserver ce créneau.</p>
                                    </div>
                                ) : (
                                    <div className="bg-slate-800 p-4 rounded border border-slate-600 text-slate-100">
                                        <p className="font-bold text-lg text-emerald-400">{inspectedSlot.appointment.userName}</p>
                                        <div className="text-sm space-y-2 mt-3 text-slate-300">
                                            <p className="flex items-center gap-2"><Phone size={14} className="text-slate-500"/> {inspectedSlot.appointment.userPhone || 'N/A'}</p>
                                            <p className="flex items-center gap-2"><Mail size={14} className="text-slate-500"/> {inspectedSlot.appointment.userEmail || 'N/A'}</p>
                                            <p className="flex items-center gap-2 italic bg-slate-900/50 p-2 rounded"><Info size={14}/> {inspectedSlot.appointment.reason}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button 
                                        variant="secondary" 
                                        className="flex-1 text-xs bg-slate-600 text-white hover:bg-slate-500 border-none" 
                                        onClick={() => handleEditClick(inspectedSlot.appointment!)}
                                    >
                                        <Edit3 size={16} className="mr-2"/> Modifier
                                    </Button>

                                    {inspectedSlot.appointment.status === 'BLOCKED' ? (
                                        <Button 
                                            variant="secondary" 
                                            className="flex-1 text-xs bg-red-600 text-white hover:bg-red-500 border-none" 
                                            onClick={() => promptUnblock(inspectedSlot.appointment!.id)}
                                        >
                                            <Unlock size={16} className="mr-2"/> Débloquer
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="danger" 
                                            className="flex-1 text-xs" 
                                            onClick={() => openCancelModal(inspectedSlot.appointment!.id)}
                                        >
                                            <Trash2 size={16} className="mr-2"/> Annuler RDV
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // SHOW BLOCK ACTION (FREE SLOT)
                            <div className="animate-fade-in">
                                <Button 
                                    onClick={handleBlockSlot} 
                                    isLoading={blocking}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 font-bold shadow-lg shadow-red-900/20 transform transition active:scale-95 border border-red-500"
                                >
                                    <Ban size={18} className="mr-2"/> BLOQUER CE CRÉNEAU
                                </Button>
                                <p className="text-xs text-slate-400 mt-3 text-center">
                                    Cette action empêchera les clients de prendre rendez-vous à cette heure.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* CALENDAR COMPONENT */}
            <div className="bg-white p-4 rounded-xl shadow border border-slate-200 min-h-[400px]">
                <Calendar 
                  onSelectSlot={handleCalendarSelect} 
                  isAdminView={true}
                  refreshTrigger={refreshCalendar} 
                />
            </div>
        </div>

        {/* RIGHT COLUMN: LIST VIEW */}
        <div className="xl:w-2/3">
           <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col h-[800px]">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto">
                   <button onClick={() => setFilter('ALL')} className={`px-3 py-1 rounded-full text-xs font-bold ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white border'}`}>Tous</button>
                   <button onClick={() => setFilter('TODAY')} className={`px-3 py-1 rounded-full text-xs font-bold ${filter === 'TODAY' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Aujourd'hui</button>
                   <button onClick={() => setFilter('CONFIRMED')} className={`px-3 py-1 rounded-full text-xs font-bold ${filter === 'CONFIRMED' ? 'bg-green-600 text-white' : 'bg-white border'}`}>Confirmés</button>
                   <button onClick={() => setFilter('BLOCKED')} className={`px-3 py-1 rounded-full text-xs font-bold ${filter === 'BLOCKED' ? 'bg-slate-500 text-white' : 'bg-white border'}`}>Bloqués</button>
                   <button onClick={() => setFilter('CANCELLED')} className={`px-3 py-1 rounded-full text-xs font-bold ${filter === 'CANCELLED' ? 'bg-red-500 text-white' : 'bg-white border'}`}>Annulés</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? <p className="text-center text-slate-400 mt-10">Chargement...</p> : 
                     appointments.length === 0 ? <p className="text-center text-slate-400 mt-10">Aucun résultat.</p> :
                     appointments.map(app => (
                         <div key={app.id} className={`flex items-center justify-between p-4 rounded-lg border ${app.status === 'BLOCKED' ? 'bg-slate-100 border-slate-300 opacity-75' : app.status === 'CANCELLED' ? 'bg-red-50 border-red-100 opacity-60' : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'} transition-all`}>
                             <div className="flex items-center gap-4">
                                 <div className={`w-2 h-12 rounded-full ${app.status === 'CONFIRMED' ? 'bg-emerald-500' : app.status === 'BLOCKED' ? 'bg-slate-500' : app.status === 'CANCELLED' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                         <span className="font-mono text-sm font-bold text-slate-500">{app.date} {app.time}</span>
                                         <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 border">
                                            {STATUS_LABELS[app.status] || app.status}
                                         </span>
                                     </div>
                                     <h4 className="font-bold text-slate-800">{app.userName}</h4>
                                     <p className="text-sm text-slate-500">{app.reason}</p>
                                 </div>
                             </div>
                             {app.status !== 'CANCELLED' && (
                                 <button 
                                    onClick={() => handleEditClick(app)} 
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-emerald-600 transition"
                                    title="Modifier / Déplacer"
                                 >
                                     <Edit3 size={18}/>
                                 </button>
                             )}
                         </div>
                     ))
                    }
                </div>
           </div>
        </div>
      </div>

      {/* MODALS (Cancel/Reschedule) */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
             <h3 className="font-bold text-lg mb-4 text-red-700">Confirmer l'action</h3>
             <p className="text-sm text-slate-600 mb-2">Veuillez sélectionner un motif :</p>
             
             <select 
               className="w-full border p-2 rounded mb-4 bg-white text-slate-900 focus:ring-2 focus:ring-red-500 outline-none"
               value={cancelReasonType}
               onChange={(e) => setCancelReasonType(e.target.value)}
             >
                {PREDEFINED_CANCEL_REASONS.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
             </select>

             {cancelReasonType === 'Autre' && (
                <div className="mb-4">
                   <p className="text-xs text-slate-500 mb-1">Précisez le motif :</p>
                   <textarea 
                      className="w-full border border-slate-300 p-2 rounded bg-white text-slate-900 focus:ring-2 focus:ring-red-500 outline-none" 
                      rows={3} 
                      value={customCancelReason} 
                      onChange={e => setCustomCancelReason(e.target.value)} 
                      autoFocus 
                      placeholder="Détails de l'annulation..."
                   ></textarea>
                </div>
             )}

             <div className="flex gap-2 justify-end">
                 <Button variant="secondary" onClick={() => setCancelModal({isOpen:false, appId:null})}>Retour</Button>
                 <Button variant="danger" onClick={submitCancellation}>Confirmer</Button>
             </div>
          </div>
        </div>
      )}
      
      {rescheduleModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                <h3 className="font-bold mb-4 text-slate-800">Changer l'horaire</h3>
                <input 
                    type="date" 
                    value={newDate} 
                    onChange={e=>setNewDate(e.target.value)} 
                    className="w-full border p-2 rounded mb-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input 
                    type="time" 
                    value={newTime} 
                    onChange={e=>setNewTime(e.target.value)} 
                    className="w-full border p-2 rounded mb-4 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Button className="w-full" onClick={submitReschedule}>Valider</Button>
                <button onClick={() => setRescheduleModal({isOpen:false, appId:null})} className="w-full text-center text-sm text-slate-400 mt-2 hover:text-slate-600">Annuler</button>
            </div>
          </div>
      )}

      {/* Unblock Confirmation Modal */}
      {unblockModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setUnblockModal({isOpen:false, appId:null})}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900">Êtes-vous sûr ?</h3>
              
              <p className="text-slate-600">
                Voulez-vous vraiment débloquer ce créneau ? <br/>
                <span className="font-bold text-emerald-600">Il sera de nouveau disponible pour les clients.</span>
              </p>

              <div className="flex gap-3 w-full mt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setUnblockModal({isOpen:false, appId:null})}
                  className="flex-1"
                >
                  Non, annuler
                </Button>
                <Button 
                  variant="primary" 
                  onClick={confirmUnblock}
                  className="flex-1"
                >
                  Oui, débloquer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};