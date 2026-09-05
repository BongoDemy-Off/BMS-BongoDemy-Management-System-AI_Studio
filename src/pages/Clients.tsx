import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MapPin, MoreVertical, Building2, Edit2, Trash2, Download, ChevronLeft, Calendar, FileText, CheckCircle2, Circle, ArrowUpRight, MessageSquare, Briefcase, Link as LinkIcon, DollarSign, Bell } from 'lucide-react';
import { AddClientModal } from '../components/AddClientModal';
import { useAppContext } from '../context/AppContext';

export function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const { clients, setClients, addNotification } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // CRM Detail view state
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clientTab, setClientTab] = useState<'overview' | 'contacts' | 'activities' | 'deals' | 'async-comms' | 'notifications'>('overview');
  const [newActivity, setNewActivity] = useState({ type: 'Note', description: '' });

  const [activityFilter, setActivityFilter] = useState<string>('All');
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [emailError, setEmailError] = useState('');
  
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    sendEmail: true,
    sendWhatsapp: false
  });

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message) return;

    const channels: ('system' | 'email' | 'whatsapp')[] = ['system'];
    if (newNotification.sendEmail) channels.push('email');
    if (newNotification.sendWhatsapp) channels.push('whatsapp');

    const notificationPayload = {
      id: `c-notif-${Date.now()}`,
      type: newNotification.type as any,
      title: newNotification.title,
      message: newNotification.message,
      date: new Date().toISOString(),
      read: false,
      channels
    };

    setClients((prev: any) => prev.map((c: any) => {
      if (c.id === selectedClient.id) {
        return {
          ...c,
          notifications: [notificationPayload, ...(c.notifications || [])]
        };
      }
      return c;
    }));

    setSelectedClient((prev: any) => ({
      ...prev,
      notifications: [notificationPayload, ...(prev.notifications || [])]
    }));

    setNewNotification({ title: '', message: '', type: 'general', sendEmail: true, sendWhatsapp: false });
    addNotification({ type: 'success', message: 'Notification sent successfully to client' });
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

  const handleAddClient = (newClient: any) => {
    setClients([{ ...newClient, about: '', contacts: [], activities: [], deals: [] }, ...clients]);
    addNotification({ type: 'success', message: 'Client added successfully' });
  };

  const handleDeleteClient = (id: number) => {
    setClients(clients.filter(client => client.id !== id));
    setActiveDropdown(null);
    addNotification({ type: 'info', message: 'Client removed from system' });
  };

  const handleAddActivity = () => {
    if (!selectedClient || !newActivity.description) return;
    const act = {
      id: Date.now(),
      type: newActivity.type,
      date: new Date().toISOString().split('T')[0],
      description: newActivity.description
    };
    
    setClients(clients.map(c => {
      if (c.id === selectedClient.id) {
        const updated = { ...c, activities: [act, ...(c.activities || [])] };
        setSelectedClient(updated);
        return updated;
      }
      return c;
    }));
    setNewActivity({ type: 'Note', description: '' });
    addNotification({ type: 'success', message: 'Activity logged successfully' });
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGeneratePortalLink = () => {
    addNotification({ type: 'success', message: 'Client portal magic link generated and copied to clipboard!' });
    navigator.clipboard.writeText(`https://portal.bongodemy.com/c/${selectedClient?.id}?token=magic_a1b2c3d4`);
  };

  if (selectedClient) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedClient(null)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Clients
        </button>

        <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-[#0ED7A8] shadow-inner">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  {selectedClient.name}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    selectedClient.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 'text-slate-400 bg-slate-400/10 border border-slate-500/20'
                  }`}>
                    {selectedClient.status}
                  </span>
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedClient.location}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {selectedClient.projects} Projects</span>
                  <span className="flex items-center gap-1.5 text-emerald-400"><DollarSign className="w-4 h-4" /> {selectedClient.totalBilled} Rev.</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
               <button 
                 onClick={handleGeneratePortalLink}
                 className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
               >
                 <LinkIcon className="w-4 h-4" /> Magic Link
               </button>
               <a 
                 href={`mailto:${selectedClient.email}`}
                 className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
               >
                 <Mail className="w-4 h-4" /> Send Email
               </a>
               <button 
                 onClick={() => { setIsEditingAccount(true); setEditFormData(selectedClient); setEmailError(''); }}
                 className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
               >
                 <Edit2 className="w-4 h-4" /> Edit Account
               </button>
               <button className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-[#0ED7A8]/20 flex items-center justify-center gap-2">
                 <MessageSquare className="w-4 h-4" /> Log Activity
               </button>
            </div>
          </div>

          <div className="flex border-b border-slate-700/50 mt-4 overflow-x-auto custom-scrollbar">
            {['overview', 'contacts', 'deals', 'activities', 'async-comms', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setClientTab(tab as any)}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  clientTab === tab ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'async-comms' ? 'Async Comms 🤖' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="pt-6">
            {clientTab === 'overview' && !isEditingAccount && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">About Company</h3>
                    <p className="text-slate-400 text-sm leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                      {selectedClient.about || "No description provided."}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Primary Contact</h3>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold text-lg">
                        {selectedClient.contact.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="text-white font-medium">{selectedClient.contact}</div>
                        <a href={`mailto:${selectedClient.email}`} className="text-sm text-[#0ED7A8] hover:underline flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {selectedClient.email}</a>
                        <a href={`tel:${selectedClient.phone}`} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selectedClient.phone}</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Recent Activity</h3>
                    <div className="space-y-4">
                      {(selectedClient.activities || []).slice(0, 3).map((act: any) => (
                        <div key={act.id} className="relative pl-6 border-l-2 border-slate-700">
                          <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#0ED7A8]"></span>
                          <div className="text-xs text-[#0ED7A8] font-medium mb-1">{act.type} • {act.date}</div>
                          <div className="text-sm text-slate-300">{act.description}</div>
                        </div>
                      ))}
                      {(selectedClient.activities?.length === 0 || !selectedClient.activities) && (
                        <div className="text-sm text-slate-500 italic">No recent activity.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {clientTab === 'overview' && isEditingAccount && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(editFormData.email)) {
                    setEmailError('Please enter a valid email address');
                    return;
                  }
                  const updatedClients = clients.map(c => c.id === selectedClient.id ? editFormData : c);
                  setClients(updatedClients);
                  setSelectedClient(editFormData);
                  setIsEditingAccount(false);
                  addNotification({ type: 'success', message: 'Account updated successfully' });
                }}
                className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 space-y-4 max-w-2xl animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Edit Account Profile</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Company Name</label>
                    <input 
                      type="text" required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]"
                      value={editFormData?.name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                    <input 
                      type="text" required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]"
                      value={editFormData?.location || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Primary Contact</label>
                    <input 
                      type="text" required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]"
                      value={editFormData?.contact || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                    <input 
                      type="email" required
                      className={`w-full bg-slate-900 border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8] ${emailError ? 'border-rose-500' : 'border-slate-700'}`}
                      value={editFormData?.email || ''}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, email: e.target.value });
                        if (emailError) setEmailError('');
                      }}
                    />
                    {emailError && <p className="text-xs text-rose-400 mt-1">{emailError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                    <input 
                      type="tel" required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]"
                      value={editFormData?.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">About Company</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8] resize-none"
                    value={editFormData?.about || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, about: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditingAccount(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {clientTab === 'contacts' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center hidden">
                  <h3 className="text-lg font-semibold text-white">Contacts</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(selectedClient.contacts || []).map((contact: any) => (
                    <div key={contact.id} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{contact.name}</div>
                          <div className="text-xs text-slate-400">{contact.role}</div>
                        </div>
                      </div>
                      <div className="space-y-2 mt-4 text-sm">
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-slate-400 hover:text-[#0ED7A8] transition-colors"><Mail className="w-4 h-4" /> {contact.email}</a>
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><Phone className="w-4 h-4" /> {contact.phone}</a>
                      </div>
                    </div>
                  ))}
                  <button className="bg-slate-800/20 border border-slate-700/50 border-dashed p-4 rounded-xl hover:border-[#0ED7A8]/50 hover:bg-[#0ED7A8]/5 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-[#0ED7A8] gap-2 min-h-[140px]">
                    <Plus className="w-6 h-6" />
                    <span className="text-sm font-medium">Add Contact</span>
                  </button>
                </div>
              </div>
            )}

            {clientTab === 'deals' && (
              <div className="space-y-4">
                <div className="bg-[#1E2D40] rounded-xl border border-slate-700/50 overflow-hidden">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-800/50 text-slate-400">
                      <tr>
                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Deal Name</th>
                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Value</th>
                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Stage</th>
                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Probability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {(selectedClient.deals || []).map((deal: any) => (
                        <tr key={deal.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">{deal.name}</td>
                          <td className="px-6 py-4 text-emerald-400 font-semibold">{deal.value}</td>
                          <td className="px-6 py-4 text-slate-300">{deal.stage}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-400">
                              <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                                <div className={`h-full ${deal.probability >= 70 ? 'bg-emerald-500' : deal.probability >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${deal.probability}%` }}></div>
                              </div>
                              <span className="text-xs">{deal.probability}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(selectedClient.deals?.length === 0 || !selectedClient.deals) && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No active deals found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {clientTab === 'activities' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-white mb-0">Activity History</h3>
                    <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
                      {['All', 'Note', 'Call', 'Meeting', 'Email'].map((f) => (
                         <button
                           key={f}
                           onClick={() => setActivityFilter(f)}
                           className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                             activityFilter === f ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                           }`}
                         >
                           {f}
                         </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    {(selectedClient.activities || [])
                      .filter((act: any) => activityFilter === 'All' || act.type === activityFilter)
                      .map((act: any) => (
                      <div key={act.id} className="relative pl-8 border-l-2 border-slate-700 pb-2">
                        <span className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-slate-800 border-2 border-[#0ED7A8] flex items-center justify-center"></span>
                        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 hover:border-[#0ED7A8]/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-[#0ED7A8] bg-[#0ED7A8]/10 px-2 py-0.5 rounded mr-1">{act.type}</span>
                            </div>
                            <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3"/> {act.date}</span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">{act.description}</p>
                        </div>
                      </div>
                    ))}
                    {(selectedClient.activities?.length === 0 || !selectedClient.activities) && (
                      <div className="text-center p-8 bg-slate-800/20 rounded-xl border border-slate-700/50 border-dashed">
                        <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No activity logged yet.</p>
                      </div>
                    )}
                    {selectedClient.activities?.length > 0 && activityFilter !== 'All' && 
                     (selectedClient.activities || []).filter((act: any) => act.type === activityFilter).length === 0 && (
                      <div className="text-center p-8 bg-slate-800/20 rounded-xl border border-slate-700/50 border-dashed">
                        <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No activities of type "{activityFilter}" found.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 sticky top-6">
                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Log New Activity</h3>
                    <div className="space-y-4">
                      <select 
                        value={newActivity.type}
                        onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                      >
                        <option>Note</option>
                        <option>Call</option>
                        <option>Meeting</option>
                        <option>Email</option>
                      </select>
                      <textarea 
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                        placeholder="Activity details..."
                        rows={4}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ED7A8] text-white resize-none"
                      />
                      <button 
                        onClick={handleAddActivity}
                        disabled={!newActivity.description}
                        className="w-full bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 disabled:opacity-50 text-slate-900 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Save Activity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {clientTab === 'async-comms' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                         <MessageSquare className="w-4 h-4" />
                       </div>
                       <h3 className="text-lg font-bold text-white">AI Setup: Status Update Draft</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 ml-11">Send a highly professional, comprehensive update without making a phone call. The AI automatically pulls recent deals and activities.</p>
                    
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                       <div className="flex items-center gap-2 mb-3">
                         <span className="text-xs font-semibold text-slate-500 uppercase">To:</span>
                         <span className="text-sm text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-md">{selectedClient.email}</span>
                       </div>
                       <textarea 
                          className="w-full bg-transparent border-none focus:ring-0 text-slate-300 text-sm h-64 resize-none leading-relaxed"
                          defaultValue={`Hi ${selectedClient.contact},\n\nI hope you're having a great week.\n\nI wanted to drop a quick note to keep you in the loop on our progress over the past couple of weeks. Everything is moving along swimmingly to ensure we meet your objectives for the current projects:\n\n1. Project Status: We are in the final review stage for the ongoing scopes.\n2. Recent Deliverables: Our team pushed out the initial audits.\n\nRest assured, our team is fully handling the technical heavy lifting so you don't have to. You can always view live progress anytime via your Magic Link.\n\nLet me know if anything needs clarification, otherwise we will keep pushing forward!\n\nBest regards,\nBongodemy Team`}
                       />
                       <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end gap-3">
                         <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Discard Draft</button>
                         <button 
                           onClick={() => addNotification({ type: 'success', message: 'Update email sent directly to client!' })}
                           className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                         >
                            <Mail className="w-4 h-4" /> Send Email Now
                         </button>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Client Auto-Followup</h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">Turn on automated weekly check-ins to keep them engaged without manual effort.</p>
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-300">Weekly Summary</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0ED7A8]"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Passive Insights</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                        <div>
                          <p className="text-sm text-slate-300">Client viewed Magic Link</p>
                          <p className="text-xs text-slate-500 mt-0.5">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-600 shrink-0"></div>
                        <div>
                          <p className="text-sm text-slate-300">Downloaded Invoice #142</p>
                          <p className="text-xs text-slate-500 mt-0.5">Yesterday, 4:30 PM</p>
                        </div>
                      </div>
                      <p className="text-xs text-indigo-400 mt-4 leading-relaxed bg-indigo-500/10 p-3 rounded-lg">
                        The client is highly engaged asynchronously. No urgent call required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {clientTab === 'notifications' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                       <Bell className="w-4 h-4 text-[#0ED7A8]" /> Send Notification / Reminder
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Notification Type</label>
                          <select 
                            value={newNotification.type}
                            onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                          >
                            <option value="general">General Update</option>
                            <option value="project_update">Project Update</option>
                            <option value="delivery">Delivery / Milestone</option>
                            <option value="payment">Due Amount / Invoice</option>
                            <option value="meeting">Meeting Reminder</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                          <input 
                            type="text"
                            value={newNotification.title}
                            onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                            placeholder="e.g. Project Delivery Available"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                        <textarea 
                          value={newNotification.message}
                          onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                          placeholder="Type your notification message to the client..."
                          rows={4}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0ED7A8] text-white resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newNotification.sendEmail} 
                            onChange={(e) => setNewNotification({...newNotification, sendEmail: e.target.checked})}
                            className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-700/50 focus:ring-1 focus:ring-indigo-500" 
                          />
                          <span className="text-sm text-slate-300">Also send via Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newNotification.sendWhatsapp} 
                            onChange={(e) => setNewNotification({...newNotification, sendWhatsapp: e.target.checked})}
                            className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700/50 focus:ring-1 focus:ring-emerald-500" 
                          />
                          <span className="text-sm text-slate-300">Also send via WhatsApp</span>
                        </label>
                      </div>

                      <button 
                        onClick={handleSendNotification}
                        disabled={!newNotification.title || !newNotification.message}
                        className="w-full bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 disabled:opacity-50 text-slate-900 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Send Notification
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
                     <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Past Notifications</h3>
                     <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {(!selectedClient.notifications || selectedClient.notifications.length === 0) ? (
                          <div className="text-center p-6 bg-slate-900/50 rounded-xl border border-slate-700/50 border-dashed">
                             <Bell className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                             <p className="text-slate-400 text-xs">No notifications sent yet.</p>
                          </div>
                        ) : (
                          selectedClient.notifications.map((notif: any) => (
                             <div key={notif.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 relative">
                                <div className="absolute top-3 right-3 text-xs text-slate-500">{new Date(notif.date).toLocaleDateString()}</div>
                                <h4 className="text-sm font-medium text-white pr-16">{notif.title}</h4>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                                <div className="flex gap-2 mt-2">
                                  {notif.channels?.map((ch: string) => (
                                    <span key={ch} className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded ${ch === 'email' ? 'bg-indigo-500/10 text-indigo-400' : ch === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-300'}`}>
                                      {ch}
                                    </span>
                                  ))}
                                </div>
                             </div>
                          ))
                        )}
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients & Accounts</h1>
          <p className="text-slate-400 text-sm mt-1">Manage CRM accounts, contacts, and relationships.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1E2D40] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-400 transition-all"
          />
        </div>
        <button
          onClick={() => {
             const { exportToCSV } = require('../lib/utils');
             exportToCSV(filteredClients, 'clients.csv');
          }}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 hover:border-[#0ED7A8]/50 transition-colors group cursor-pointer" onClick={() => setSelectedClient(client)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-[#0ED7A8] group-hover:bg-[#0ED7A8]/10 transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#0ED7A8] transition-colors line-clamp-1">
                    {client.name}
                  </h3>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 mt-1 inline-block rounded text-[10px] font-medium uppercase tracking-wider ${
                      client.type === 'Elite' ? 'text-amber-400 bg-amber-400/10' : 
                      client.type === 'Premium' ? 'text-purple-400 bg-purple-400/10' : 
                      'text-blue-400 bg-blue-400/10'
                    }`}>
                      {client.type || 'Standard'}
                    </span>
                    <span className={`px-2 py-0.5 mt-1 inline-block rounded text-[10px] font-medium uppercase tracking-wider ${
                      client.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-slate-400/10'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === client.id ? null : client.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {activeDropdown === client.id && (
                  <div 
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-20 overflow-hidden"
                  >
                    <button 
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                      onClick={() => {
                        setActiveDropdown(null);
                        setSelectedClient(client);
                      }}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      View Details
                    </button>
                    <button 
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors border-t border-slate-700/50"
                      onClick={() => {
                        setActiveDropdown(null);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Client
                    </button>
                    <button 
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 transition-colors border-t border-slate-700/50"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Client
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm border border-slate-700">
                  {client.contact.charAt(0)}
                </div>
                <span className="font-medium">{client.contact}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="truncate">{client.location}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50 bg-slate-800/10 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl mt-auto">
              <div>
                <div className="text-xs text-slate-400 mb-1 font-medium">Active Projects</div>
                <div className="text-lg font-semibold text-white">{client.projects}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1 font-medium">Total Billed</div>
                <div className="text-lg font-semibold text-emerald-400">{client.totalBilled}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddClientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddClient={handleAddClient} 
      />
    </div>
  );
}
