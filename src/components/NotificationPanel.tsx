import React from 'react';
import { Target, MessageSquare, Plus, FileText, CheckCircle2, DollarSign } from 'lucide-react';
import { format, subMinutes, subHours, subDays } from 'date-fns';

const notifications = [
  {
    id: 1,
    type: 'task',
    message: 'Md. Mudasser completed the task "Security review"',
    time: subMinutes(new Date(), 15),
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
  {
    id: 2,
    type: 'invoice',
    message: 'Invoice INV-2026-041 was paid by TechCorp ($4,500)',
    time: subHours(new Date(), 2),
    icon: DollarSign,
    color: 'text-[#0ED7A8]',
    bg: 'bg-[#0ED7A8]/10'
  },
  {
    id: 3,
    type: 'lead',
    message: 'New Lead: Alice Security requested a VAPT quote.',
    time: subHours(new Date(), 5),
    icon: Target,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10'
  },
  {
    id: 4,
    type: 'document',
    message: 'New pentest report uploaded for FinServe LLC.',
    time: subDays(new Date(), 1),
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  }
];

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-0 w-80 sm:w-96 bg-[#1a2636] border border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-semibold text-white">Activity Stream</h3>
        <button 
           className="text-xs text-[#0ED7A8] hover:text-[#0ED7A8]/80 font-medium transition-colors"
           onClick={onClose}
        >
           Mark all as read
        </button>
      </div>
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
             No recent activity.
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-slate-800/50 transition-colors flex gap-4 items-start">
                 <div className={`w-8 h-8 rounded-full ${notif.bg} flex items-center justify-center shrink-0`}>
                    <notif.icon className={`w-4 h-4 ${notif.color}`} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 leading-snug">{notif.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{format(notif.time, 'MMM d, h:mm a')}</p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 border-t border-slate-700 bg-slate-800/30 text-center">
        <button 
          onClick={onClose}
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
           View full history in Settings
        </button>
      </div>
    </div>
  );
}
