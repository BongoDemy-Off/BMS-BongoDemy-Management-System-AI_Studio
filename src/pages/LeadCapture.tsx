import React, { useState } from 'react';
import { Target, Building2, User, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function LeadCapture() {
  const { leads, setLeads } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    contact: '',
    phone: '',
    requirements: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newId = leads.length > 0 ? Math.max(...leads.map(l => Number(l.id))) + 1 : 1;
    
    const newLead = {
      id: newId,
      name: formData.requirements ? `Inquiry: ${formData.company}` : `Lead: ${formData.name}`,
      company: formData.company,
      contact: formData.contact,
      phone: formData.phone,
      stage: 'New',
      value: 0,
      probability: 20,
      lastContact: new Date().toISOString().split('T')[0],
      assignee: 'Unassigned',
      activities: formData.requirements ? [{
        id: Date.now(),
        type: 'Note',
        date: new Date().toISOString().split('T')[0],
        content: `Customer requirements: ${formData.requirements}`
      }] : []
    };

    setLeads([...leads, newLead]);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="bg-[#1E2D40] border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Thank You!</h2>
          <p className="text-slate-400">
            We've received your request and our team will get back to you shortly.
          </p>
          <button 
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ name: '', company: '', contact: '', phone: '', requirements: '' });
            }}
            className="mt-8 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium w-full"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="bg-[#1E2D40] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Left Side / Branding */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 md:w-2/5 flex flex-col justify-center text-white relative overflow-hidden hidden md:flex">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-6">
            <Target className="w-12 h-12 text-[#0ED7A8]" />
            <h1 className="text-3xl font-bold leading-tight">Partner with BongoDemy</h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              We specialize in advanced technology, enterprise security, and bespoke creative solutions. Let’s build something incredible together.
            </p>
          </div>
        </div>

        {/* Right Side / Form */}
        <div className="p-8 md:w-3/5">
          <div className="mb-8 md:hidden">
            <h1 className="text-2xl font-bold text-white mb-2">Partner with BongoDemy</h1>
            <p className="text-slate-400 text-sm">Fill out the form below and we'll reach out.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input 
                required
                type="text" 
                placeholder="John Doe"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Company
              </label>
              <input 
                required
                type="text" 
                placeholder="Acme Corp"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input 
                  required
                  type="email" 
                  placeholder="john@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                <input 
                  required
                  type="tel" 
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-2">
                <FileText className="w-4 h-4" /> What do you need help with?
              </label>
              <textarea 
                required
                rows={4}
                placeholder="Tell us about your project or requirements..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              ></textarea>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
