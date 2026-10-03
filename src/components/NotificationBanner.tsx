import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { activeNotification, dismissNotification } = useApp();

  if (!activeNotification) return null;

  const bgColors = {
    ready: 'bg-emerald-600 text-white shadow-emerald-500/25',
    strike: 'bg-rose-600 text-white shadow-rose-500/25',
    success: 'bg-orange-600 text-white shadow-orange-500/25',
    info: 'bg-slate-800 text-white shadow-slate-900/25',
  };

  const icons = {
    ready: <Bell className="w-5 h-5 animate-bounce shrink-0" />,
    strike: <AlertTriangle className="w-5 h-5 shrink-0" />,
    success: <CheckCircle className="w-5 h-5 shrink-0" />,
    info: <Info className="w-5 h-5 shrink-0" />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className={`rounded-2xl p-4 shadow-xl flex items-start gap-3.5 border border-white/20 backdrop-blur-md ${
          bgColors[activeNotification.type]
        }`}
      >
        <div className="p-2 rounded-xl bg-white/15 shrink-0">{icons[activeNotification.type]}</div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm tracking-wide">{activeNotification.title}</h4>
            {activeNotification.tokenNumber && (
              <span className="px-2 py-0.5 text-xs font-black bg-white/25 rounded-full uppercase tracking-wider">
                Token {activeNotification.tokenNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-white/90 mt-1 leading-relaxed">{activeNotification.message}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={dismissNotification}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
