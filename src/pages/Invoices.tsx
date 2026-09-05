import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Filter, FileText, Download, MoreHorizontal, ArrowUpRight, ArrowDownRight, Edit2, Trash2, Bell, RefreshCw, AlertTriangle } from 'lucide-react';
import { CreateInvoiceModal } from '../components/CreateInvoiceModal';
import { useAppContext } from '../context/AppContext';

export type InvoiceReminder = {
  id: string;
  daysBefore: number;
  type: 'email' | 'in-app';
};

export type Invoice = {
  id: string;
  client: string;
  project: string;
  amount: number;
  date: string;
  dueDate: string;
  status: string;
  reminders?: InvoiceReminder[];
  recurring?: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'yearly';
};

export const initialInvoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    client: 'TechCorp Inc.',
    project: 'Web Application Pentest',
    amount: 15000,
    date: '2024-03-01',
    dueDate: '2024-03-15',
    status: 'Paid',
    reminders: []
  },
  {
    id: 'INV-2024-002',
    client: 'Global Retail Solutions',
    project: 'Corporate Website Redesign',
    amount: 8500,
    date: '2024-03-05',
    dueDate: '2024-03-20',
    status: 'Pending',
    reminders: []
  },
  {
    id: 'INV-2024-003',
    client: 'FinServe LLC',
    project: 'Network Security Audit',
    amount: 22000,
    date: '2024-02-15',
    dueDate: '2024-03-01',
    status: 'Overdue',
    reminders: []
  },
  {
    id: 'INV-2024-004',
    client: 'BrandBoost Agency',
    project: 'Q2 Marketing Strategy',
    amount: 5000,
    date: '2024-03-10',
    dueDate: '2024-03-25',
    status: 'Draft',
    reminders: []
  }
];

export function Invoices() {
  const { projects, addNotification } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [daysBefore, setDaysBefore] = useState<number>(3);
  const [reminderType, setReminderType] = useState<'email' | 'in-app'>('in-app');
  const [isAutoRemindersEnabled, setIsAutoRemindersEnabled] = useState(false);
  const [isScheduledRemindersModalOpen, setIsScheduledRemindersModalOpen] = useState(false);

  const openReminderModal = (id: string) => {
    setSelectedInvoiceId(id);
    setIsReminderModalOpen(true);
    setActiveDropdown(null);
  };

  const handleSetReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;

    const newReminder: InvoiceReminder = {
      id: `rem-${Date.now()}`,
      daysBefore,
      type: reminderType
    };

    setInvoices(invoices.map(inv => {
      if (inv.id === selectedInvoiceId) {
        return {
          ...inv,
          reminders: [...(inv.reminders || []), newReminder]
        };
      }
      return inv;
    }));

    const invoice = invoices.find(i => i.id === selectedInvoiceId);
    if (invoice) {
      addNotification({
        message: `Reminder set for invoice ${invoice.id} (${daysBefore} days before due)`,
        type: 'success'
      });
    }

    setIsReminderModalOpen(false);
    setSelectedInvoiceId(null);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateInvoice = (newInvoice: any) => {
    setInvoices([newInvoice, ...invoices]);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
    setActiveDropdown(null);
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Overdue': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const discrepancies = invoices.filter(inv => {
    const project = projects.find(p => p.name === inv.project);
    return project && project.budget > 0 && inv.amount > project.budget;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-slate-400 text-sm mt-1">Manage billing and payments.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {discrepancies.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start sm:items-center gap-4 fade-in">
          <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
             <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-400">Budget Discrepancies Detected</h4>
            <p className="text-xs text-amber-300/80 mt-1">
              There {discrepancies.length === 1 ? 'is 1 invoice that exceeds' : `are ${discrepancies.length} invoices that exceed`} the allocated project budget. Please review the highlighted items below.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="text-sm text-slate-400 mb-2">Total Outstanding</div>
          <div className="text-3xl font-bold text-white mb-2">$30,500</div>
          <div className="flex items-center gap-1 text-sm font-medium text-amber-400">
            <ArrowUpRight className="w-4 h-4" />
            2 Invoices Pending
          </div>
        </div>
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="text-sm text-slate-400 mb-2">Total Overdue</div>
          <div className="text-3xl font-bold text-rose-400 mb-2">$22,000</div>
          <div className="flex items-center gap-1 text-sm font-medium text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
            1 Invoice Overdue
          </div>
        </div>
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="text-sm text-slate-400 mb-2">Paid This Month</div>
          <div className="text-3xl font-bold text-emerald-400 mb-2">$15,000</div>
          <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            +12% vs last month
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search invoices..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1E2D40] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-400 transition-all"
          />
        </div>
        <button 
          onClick={() => setIsScheduledRemindersModalOpen(true)}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors border ${isAutoRemindersEnabled ? 'bg-[#0ED7A8]/10 text-[#0ED7A8] border-[#0ED7A8]/30' : 'bg-[#1E2D40] text-slate-300 border-slate-700 hover:bg-slate-800'}`}
        >
          <Bell className="w-5 h-5" />
          Scheduled Reminders
        </button>
        <button className="bg-[#1E2D40] border border-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400 bg-slate-800/30">
                <th className="p-4 font-medium">Invoice ID</th>
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg text-[#0ED7A8]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-white group-hover:text-[#0ED7A8] transition-colors cursor-pointer">
                        {invoice.id}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-white">{invoice.client}</div>
                    <div className="flex items-center gap-2">
                       <span className="text-xs text-slate-400">{invoice.project}</span>
                       {invoice.recurring && (
                         <span className="flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20" title={`Recurring ${invoice.recurringInterval}`}>
                           <RefreshCw className="w-3 h-3" />
                         </span>
                       )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <div className="text-sm font-medium text-white">${invoice.amount.toLocaleString()}</div>
                       {discrepancies.some(d => d.id === invoice.id) && (
                         <div className="group/warning relative">
                           <AlertTriangle className="w-4 h-4 text-amber-500 cursor-help" />
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-xs text-amber-400 rounded-lg whitespace-nowrap opacity-0 group-hover/warning:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-amber-500/20">
                             Exceeds project budget
                           </div>
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span>{new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">Due {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      {invoice.reminders && invoice.reminders.length > 0 && (
                        <div className="flex items-center text-xs text-[#0ED7A8] bg-[#0ED7A8]/10 px-1.5 py-0.5 rounded border border-[#0ED7A8]/20" title={`${invoice.reminders.length} reminder(s)`}>
                           <Bell className="w-3 h-3 mr-1" /> {invoice.reminders.length}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.print();
                        }}
                        className="p-2 text-slate-400 hover:text-[#0ED7A8] transition-colors rounded-lg hover:bg-slate-800"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === invoice.id ? null : invoice.id)}
                        className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {activeDropdown === invoice.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-0 top-full mt-1 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-10 overflow-hidden"
                        >
                          <button 
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors border-b border-slate-700/50"
                            onClick={() => openReminderModal(invoice.id)}
                          >
                            <Bell className="w-4 h-4" />
                            Set Reminder
                          </button>
                          <button 
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                            onClick={() => {
                              // Handle edit
                              setActiveDropdown(null);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Invoice
                          </button>
                          <button 
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 transition-colors border-t border-slate-700/50"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Invoice
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateInvoiceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreateInvoice={handleCreateInvoice} 
      />

      {isReminderModalOpen && selectedInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsReminderModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-md relative z-10 shadow-2xl overflow-hidden p-6">
            <h2 className="text-xl font-bold text-white mb-2">Set Invoice Reminder</h2>
            <p className="text-sm text-slate-400 mb-6">Configure when and how you want to be reminded about this invoice's due date.</p>

            <form onSubmit={handleSetReminder} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 font-medium block mb-2">Days before due date</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="14" 
                    value={daysBefore}
                    onChange={(e) => setDaysBefore(parseInt(e.target.value))}
                    className="w-full accent-[#0ED7A8]"
                  />
                  <div className="w-16 text-center bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-white font-medium">
                    {daysBefore}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300 font-medium block mb-2">Notification Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReminderType('in-app')}
                    className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                      reminderType === 'in-app' ? 'bg-[#0ED7A8]/10 text-[#0ED7A8] border-[#0ED7A8]/50' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Bell className="w-4 h-4" /> In-App
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderType('email')}
                    className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                      reminderType === 'email' ? 'bg-[#0ED7A8]/10 text-[#0ED7A8] border-[#0ED7A8]/50' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Email
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsReminderModalOpen(false)} 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isScheduledRemindersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsScheduledRemindersModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-md relative z-10 shadow-2xl overflow-hidden p-6">
            <h2 className="text-xl font-bold text-white mb-2">Scheduled Reminders</h2>
            <p className="text-sm text-slate-400 mb-6">Automatically send email notification reminders to clients 3 days before an invoice becomes overdue.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                 <div>
                   <h3 className="text-sm font-medium text-white mb-1">Auto-Reminders</h3>
                   <p className="text-xs text-slate-400">Send 3 days before due date</p>
                 </div>
                 <button 
                  onClick={() => setIsAutoRemindersEnabled(!isAutoRemindersEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isAutoRemindersEnabled ? 'bg-[#0ED7A8]' : 'bg-slate-700'}`}
                 >
                   <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isAutoRemindersEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                 </button>
              </div>
              
              {isAutoRemindersEnabled && (
                 <div className="bg-[#0ED7A8]/10 border border-[#0ED7A8]/20 p-4 rounded-xl flex gap-3">
                   <FileText className="w-5 h-5 text-[#0ED7A8] shrink-0" />
                   <div>
                     <p className="text-sm font-medium text-[#0ED7A8]">Reminders are actively scheduled</p>
                     <p className="text-xs text-[#0ED7A8]/80 mt-1">Clients will automatically receive an email alert 3 days prior to the invoice turning overdue.</p>
                   </div>
                 </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 mt-6">
              <button 
                type="button" 
                onClick={() => setIsScheduledRemindersModalOpen(false)} 
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
