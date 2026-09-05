import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: any) => void;
}

export function AddClientModal({ isOpen, onClose, onAddClient }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    type: 'Standard',
    email: '',
    password: '',
    phone: '',
    location: '',
    status: 'Active',
  });

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const cleanName = newName.replace(/[^a-zA-Z0-9]/g, '');
    const emailVal = cleanName ? `${cleanName.toLowerCase()}_family@bongodemy.com` : '';
    const passVal = cleanName ? `${cleanName}Family` : '';
    
    setFormData(prev => ({
      ...prev,
      name: newName,
      email: prev.email === '' || prev.email.endsWith('_family@bongodemy.com') ? emailVal : prev.email,
      password: prev.password === '' || prev.password.endsWith('Family') ? passVal : prev.password,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClient({
      ...formData,
      id: Date.now(),
      projects: 0,
      totalBilled: '$0',
    });
    setFormData({
      name: '',
      contact: '',
      type: 'Standard',
      email: '',
      password: '',
      phone: '',
      location: '',
      status: 'Active',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1E2D40] rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 shrink-0">
          <h2 className="text-xl font-semibold text-white">Add New Client</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Company / Family Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
                placeholder="e.g. Luxury Family"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Client Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
              >
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Elite">Elite</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
                placeholder="e.g. john@acme.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Client Portal Password</label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
                placeholder="Portal access password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
                placeholder="e.g. +1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500"
                placeholder="e.g. New York, USA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

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
                Add Client
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
