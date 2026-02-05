import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Mail, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'email';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    email: 'bg-amber-100 text-amber-800 border-amber-200'
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
    email: <Mail size={20} />
  };

  return (
    <div className={`fixed top-20 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-fade-in ${styles[type]}`}>
      <div className="shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <XCircle size={16} />
      </button>
    </div>
  );
};