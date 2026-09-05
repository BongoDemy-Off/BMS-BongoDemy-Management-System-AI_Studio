import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordExpense: (expense: any) => void;
  initialData?: any;
}

export function RecordExpenseModal({ isOpen, onClose, onRecordExpense, initialData }: RecordExpenseModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    category: 'Office',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    submittedBy: '',
    status: 'Pending',
    receipt: false,
    receiptFile: null as null | { name: string; type: string; size: number },
    isRecurring: false,
    frequency: 'monthly',
    endDate: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        description: initialData.description || '',
        category: initialData.category || 'Office',
        amount: initialData.amount ? String(initialData.amount) : '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        submittedBy: initialData.submittedBy || '',
        status: initialData.status || 'Pending',
        receipt: initialData.receipt || false,
        receiptFile: initialData.receiptFile || null,
        isRecurring: initialData.isRecurring || false,
        frequency: initialData.frequency || 'monthly',
        endDate: initialData.endDate || '',
      });
    } else if (isOpen) {
      setFormData({
        description: '',
        category: 'Office',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        submittedBy: '',
        status: 'Pending',
        receipt: false,
        receiptFile: null,
        isRecurring: false,
        frequency: 'monthly',
        endDate: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        receipt: true,
        receiptFile: {
          name: file.name,
          type: file.type,
          size: file.size
        }
      });
    }
  };

  const removeFile = () => {
    setFormData({
      ...formData,
      receipt: false,
      receiptFile: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordExpense({
      ...initialData,
      ...formData,
      id: initialData?.id || `EXP-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      amount: parseFloat(formData.amount) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1E2D40] rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">{initialData ? 'Edit Expense' : 'Record Expense'}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
              placeholder="e.g. Office Supplies"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
            >
              <option value="Marketing">Marketing</option>
              <option value="Hardware">Hardware</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Training & Events">Training & Events</option>
              <option value="Software">Software</option>
              <option value="Office">Office</option>
            </select>
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
              placeholder="e.g. 145.50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Submitted By</label>
            <input
              type="text"
              required
              value={formData.submittedBy}
              onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Receipt Attachment</label>
            {!formData.receiptFile ? (
              <div 
                className="w-full border-2 border-dashed border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#0ED7A8]/50 hover:bg-[#0ED7A8]/5 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-[#0ED7A8]', 'bg-[#0ED7A8]/5');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-[#0ED7A8]', 'bg-[#0ED7A8]/5');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-[#0ED7A8]', 'bg-[#0ED7A8]/5');
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    setFormData({
                      ...formData,
                      receipt: true,
                      receiptFile: { name: file.name, type: file.type, size: file.size }
                    });
                  }
                }}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-[#0ED7A8]/10 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#0ED7A8]" />
                </div>
                <p className="text-sm font-medium text-slate-300">Click or drag to upload receipt</p>
                <p className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[200px]">{formData.receiptFile.name}</p>
                    <p className="text-xs text-slate-500">{(formData.receiptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800/50 text-[#0ED7A8] focus:ring-[#0ED7A8] focus:ring-offset-slate-900"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-slate-300">
              Recurring Expense
            </label>
          </div>

          {formData.isRecurring && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
                />
              </div>
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
              {initialData ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
