import React, { useState, useRef, useEffect } from 'react';
import { Plus, Target, CheckSquare, FileText, Users, DollarSign, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function QuickAddFab() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addNotification } = useAppContext();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (path: string, actionName: string) => {
    navigate(path);
    setIsOpen(false);
    // Ideally this would open the precise "Add" modal on those pages, 
    // but navigating and showing a hint is a good fast step.
    addNotification({ type: 'info', message: `Navigated to ${actionName}. Use the "Add" button to create.` });
  };

  const actions = [
    { name: 'Add Task', icon: CheckSquare, path: '/tasks', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { name: 'Add Lead', icon: Target, path: '/leads', color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { name: 'Add Client', icon: Users, path: '/clients', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Add Expense', icon: DollarSign, path: '/expense', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { name: 'Add Invoice', icon: FileText, path: '/invoices', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" ref={menuRef}>
      {isOpen && (
        <div className="mb-4 flex flex-col gap-3 items-end animate-in slide-in-from-bottom-4 fade-in duration-200">
          {actions.map((action, idx) => (
            <button
              key={action.name}
              onClick={() => handleAction(action.path, action.name)}
              className="flex items-center gap-3 group"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <span className="bg-slate-800 text-slate-200 text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                {action.name}
              </span>
              <div className={`w-12 h-12 rounded-full shadow-lg ${action.bg} border border-slate-700/50 flex items-center justify-center hover:scale-110 transition-transform backdrop-blur-sm`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-slate-700 rotate-45' : 'bg-gradient-to-r from-[#0ED7A8] to-emerald-500 hover:scale-110'
        }`}
      >
        <Plus className={`w-6 h-6 ${isOpen ? 'text-white' : 'text-slate-900'}`} />
      </button>
    </div>
  );
}
