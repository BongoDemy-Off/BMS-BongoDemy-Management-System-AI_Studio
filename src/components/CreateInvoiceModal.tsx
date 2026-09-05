import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (invoice: any) => void;
}

export function CreateInvoiceModal({ isOpen, onClose, onCreateInvoice }: CreateInvoiceModalProps) {
  const [formData, setFormData] = useState({
    client: '',
    project: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'Draft',
    recurring: false,
    recurringInterval: 'monthly' as 'weekly' | 'monthly' | 'yearly',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateInvoice({
      ...formData,
      id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      amount: parseFloat(formData.amount) || 0,
    });
    setFormData({
      client: '',
      project: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'Draft',
      recurring: false,
      recurringInterval: 'monthly',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1E2D40] rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">Create New Invoice</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Client Name</label>
            <input
              type="text"
              required
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
              placeholder="e.g. TechCorp Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
              placeholder="e.g. Web Application Pentest"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Amount ($)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
              placeholder="e.g. 15000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Invoice Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
            >
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
             <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-300">
               <input
                 type="checkbox"
                 checked={formData.recurring}
                 onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                 className="rounded border-slate-700 bg-slate-800/50 text-[#0ED7A8] focus:ring-[#0ED7A8] focus:ring-offset-slate-900"
               />
               This is a recurring invoice
             </label>
          </div>

          {formData.recurring && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Billing Interval</label>
              <select
                value={formData.recurringInterval}
                onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value as any })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
