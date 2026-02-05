import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Lock } from 'lucide-react';
import { db } from '../services/mockDb';
import { Appointment, AppointmentStatus } from '../types';

interface CalendarProps {
  onSelectSlot: (date: string, time: string) => void;
  isAdminView?: boolean;
  refreshTrigger?: number;
}

export const Calendar: React.FC<CalendarProps> = ({ onSelectSlot, isAdminView = false, refreshTrigger = 0 }) => {
  // Default to Feb 2026 as requested by context
  const [currentDate, setCurrentDate] = useState(new Date('2026-02-05'));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, refreshTrigger]);

  const loadAppointments = async () => {
    setLoading(true);
    const apps = await db.getAppointments();
    setAppointments(apps);
    setLoading(false);
  };

  // Helper to get local YYYY-MM-DD string to avoid UTC issues
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const days = getDaysInMonth(currentDate);
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Adjust so Monday is first
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    setSelectedDate(null);
  };

  // JAN/FEB 2026 RULES: Closed Monday (1) and Sunday (0)
  const isClosed = (date: Date) => date.getDay() === 0 || date.getDay() === 1; 
  
  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    // Compare date strings to avoid time issues
    return formatDate(date) < formatDate(today);
  };

  const isToday = (date: Date) => {
      const today = new Date();
      return formatDate(date) === formatDate(today);
  };

  const generateTimeSlots = (date: Date) => {
    const slots = [];
    const isSaturday = date.getDay() === 6;

    // Morning: 8h - 12h
    // Slots: 08:00, 09:00, 10:00, 11:00
    for (let h = 8; h < 12; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    
    // Afternoon: 13h30 - 17h30 (Sat 16h30)
    // Slots: 13:30, 14:30, 15:30.
    // If not Saturday, add 16:30 (ends at 17:30)
    
    slots.push('13:30');
    slots.push('14:30');
    slots.push('15:30');

    if (!isSaturday) {
        slots.push('16:30');
    }

    return slots;
  };

  const getSlotStatus = (date: Date, time: string) => {
    const dateStr = formatDate(date);
    // Find active appointment for this slot
    const app = appointments.find(a => 
      a.date === dateStr && 
      a.time === time && 
      a.status !== AppointmentStatus.CANCELLED
    );
    
    if (app) {
      return app.status === AppointmentStatus.BLOCKED ? 'blocked' : 'booked';
    }
    return 'available';
  };

  const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      // Reset selected slot in parent if needed, handled by not calling onSelectSlot immediately
  };

  const handleTimeClick = (time: string) => {
      if (selectedDate) {
          onSelectSlot(formatDate(selectedDate), time);
      }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-bold text-emerald-900 capitalize">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-emerald-200 rounded-full text-emerald-800 transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-emerald-200 rounded-full text-emerald-800 transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Calendar Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-slate-500 uppercase">
            <div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div><div>Dim</div>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[3rem] md:min-h-[4rem]" />
            ))}
            {days.map((date) => {
              const dateStr = formatDate(date);
              const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
              const closed = isClosed(date);
              const past = isPast(date);
              const today = isToday(date);
              
              // Count appointments
              const dailyApps = appointments.filter(a => a.date === dateStr && a.status !== 'CANCELLED');
              const blockedCount = dailyApps.filter(a => a.status === AppointmentStatus.BLOCKED).length;
              const bookedCount = dailyApps.length - blockedCount;

              return (
                <button
                  key={dateStr}
                  disabled={closed || (past && !isAdminView)}
                  onClick={() => handleDateClick(date)}
                  className={`
                    relative min-h-[4rem] md:min-h-[5rem] lg:min-h-[6rem] p-1 rounded-lg flex flex-col items-center justify-start border transition-all
                    ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50 z-10' : 'border-slate-100 bg-white hover:border-emerald-200'}
                    ${closed || (past && !isAdminView) ? 'bg-slate-50 text-slate-300' : 'text-slate-700 font-medium'}
                    ${today && !isSelected ? 'ring-1 ring-emerald-400 border-emerald-300' : ''}
                  `}
                >
                  <span className={`text-sm md:text-base ${today ? 'bg-emerald-600 text-white rounded-full w-7 h-7 flex items-center justify-center -mt-1 shadow-sm' : ''}`}>
                      {date.getDate()}
                  </span>
                  
                  {!closed && (!past || isAdminView) && (
                    <div className="flex flex-wrap justify-center gap-1 mt-1 w-full px-1">
                      {blockedCount > 0 && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-slate-800" title="Créneaux bloqués"></span>
                      )}
                      {bookedCount > 0 && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400" title="Réservations"></span>
                      )}
                      {dailyApps.length === 0 && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-200"></span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slots Panel */}
        <div className="w-full md:w-80 border-l border-slate-100 bg-slate-50 p-4 flex flex-col shrink-0">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Clock size={18} />
            {selectedDate ? 'Horaires' : 'Sélectionnez une date'}
          </h3>
          
          {selectedDate ? (
            <div className="flex-1 overflow-y-auto max-h-[400px]">
               <p className="text-sm text-slate-500 mb-3 capitalize">
                 {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
               </p>
               
               {isClosed(selectedDate) ? (
                   <div className="text-center p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                       Fermé ce jour.
                   </div>
               ) : (
                   <div className="grid grid-cols-2 gap-2">
                     {generateTimeSlots(selectedDate).map(time => {
                       const status = getSlotStatus(selectedDate, time);
                       const isBlocked = status === 'blocked';
                       const isBooked = status === 'booked';
                       const unavailable = isBlocked || isBooked;
                       
                       return (
                         <button
                            key={time}
                            disabled={unavailable && !isAdminView}
                            onClick={() => handleTimeClick(time)}
                            className={`
                              py-2 px-3 rounded text-sm font-medium border flex items-center justify-center gap-2 transition-all
                              ${isBlocked 
                                ? 'bg-slate-800 text-slate-300 border-slate-700 cursor-pointer hover:bg-slate-700' // Admin can click blocked slots to interact
                                : isBooked
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 cursor-pointer hover:bg-amber-100' // Admin can click booked slots
                                  : 'bg-white text-slate-900 border-emerald-200 hover:bg-emerald-600 hover:text-white shadow-sm'}
                              ${!isAdminView && unavailable ? 'opacity-50 cursor-not-allowed !bg-gray-100 !text-gray-400 !border-gray-200 hover:!bg-gray-100' : ''}
                            `}
                         >
                           {isBlocked ? <Lock size={12} /> : null}
                           {time}
                         </button>
                       );
                     })}
                   </div>
               )}
               
               {isAdminView && (
                 <p className="text-[10px] text-slate-500 mt-4 text-center">
                   <span className="font-bold">Mode Admin:</span><br/>
                   Cliquez sur un créneau libre pour le bloquer.<br/>
                   Cliquez sur un créneau occupé pour voir les détails.
                 </p>
               )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-4">
              <Clock size={48} className="mb-2 opacity-20" />
              <p className="text-sm">Le planning s'affichera ici.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};