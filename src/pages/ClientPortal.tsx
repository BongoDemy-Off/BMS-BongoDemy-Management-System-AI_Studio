import React, { useState } from 'react';
import { Target, Search, FileText, Briefcase, CheckSquare, DollarSign, LogOut, Bell, LayoutDashboard, CreditCard, Folder, Users, MessageSquare, Settings } from 'lucide-react';
import { useAppContext, Deal, DealPhase } from '../context/AppContext';

const ProjectDetailsCard: React.FC<{ deal: Deal }> = ({ deal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'overview' | 'finances' | 'tasks' | 'files'>('overview');

  const [driveFolderLink, setDriveFolderLink] = useState('');
  const [driveFolderName, setDriveFolderName] = useState('');
  const [submittedLinks, setSubmittedLinks] = useState<any[]>([]);

  const handleDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveFolderLink || !driveFolderName) return;

    const newLink = {
      id: Date.now(),
      name: driveFolderName,
      url: driveFolderLink,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    setSubmittedLinks([newLink, ...submittedLinks]);
    setDriveFolderLink('');
    setDriveFolderName('');
  };

  const budgetStr = deal.value || '$0';
  const budgetNum = parseInt(budgetStr.replace(/[^0-9]/g, '')) || 0;
  const spentPercent = deal.status === 'Completed' ? 100 : Math.max(20, (deal.probability || 0) - 10);
  const amountSpent = (budgetNum * spentPercent) / 100;
  const remainingBudget = budgetNum - amountSpent;

  return (
    <div className="bg-[#1E2D40] rounded-2xl border border-slate-700 overflow-hidden group hover:border-indigo-500/50 transition-colors">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{deal.name}</h3>
              {deal.targetClientName && (
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] uppercase tracking-wider rounded font-medium">
                  {deal.targetClientName}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">Budget: {deal.value}</p>
          </div>
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs rounded-full font-medium inline-block flex-shrink-0 w-fit">{deal.stage}</span>
        </div>
        
        <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span className="font-medium text-white">Project Progress</span>
              <span className="text-[#0ED7A8] font-bold">{deal.probability || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-[#0ED7A8] h-full rounded-full transition-all duration-1000 ease-in-out relative" style={{ width: `${deal.probability || 0}%` }}>
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" />
              </div>
            </div>
        </div>
        <div className="mt-6 flex justify-center">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors"
            >
              {isExpanded ? 'Hide Details' : 'View Details & Milestones'}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
            </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="bg-slate-800/30 transition-all">
          <div className="flex border-b border-slate-700/50 overflow-x-auto hide-scrollbar">
             <button 
               onClick={() => setActiveDetailsTab('overview')}
               className={`whitespace-nowrap px-6 py-4 text-sm font-bold text-center transition-colors ${activeDetailsTab === 'overview' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
             >
               Overview
             </button>
             <button 
               onClick={() => setActiveDetailsTab('finances')}
               className={`whitespace-nowrap px-6 py-4 text-sm font-bold text-center transition-colors ${activeDetailsTab === 'finances' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
             >
               Finances
             </button>
             <button 
               onClick={() => setActiveDetailsTab('tasks')}
               className={`whitespace-nowrap px-6 py-4 text-sm font-bold text-center transition-colors ${activeDetailsTab === 'tasks' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
             >
               Tasks & Milestones
             </button>
             <button 
               onClick={() => setActiveDetailsTab('files')}
               className={`whitespace-nowrap px-6 py-4 text-sm font-bold text-center transition-colors ${activeDetailsTab === 'files' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
             >
               Files
             </button>
          </div>

          <div className="p-6">
            {activeDetailsTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1E2D40] p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Start Date</p>
                    <p className="text-sm font-bold text-white">{deal.startDate || 'N/A'}</p>
                  </div>
                  <div className="bg-[#1E2D40] p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Expected Delivery</p>
                    <p className="text-sm font-bold text-white">{deal.deliveryDate || 'N/A'}</p>
                  </div>
                </div>
                
                {deal.driveLink && (
                  <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-center">
                    <a href={deal.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 px-6 py-3 rounded-xl font-medium transition-colors text-sm w-full md:w-auto justify-center">
                      <Folder className="w-4 h-4" /> Go to Project Drive Folder
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeDetailsTab === 'tasks' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                  {(deal.phases || []).map((phase: DealPhase, phaseIdx: number) => {
                    const isCompleted = phase.status === 'Completed';
                    const isInProgress = phase.status === 'In Progress';
                    
                    return (
                      <div key={phaseIdx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border bg-[#1E2D40] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 mx-auto ${isCompleted ? 'border-emerald-500 text-emerald-400' : isInProgress ? 'border-indigo-500 text-indigo-400' : 'border-slate-700 bg-slate-800 text-slate-500'}`}>
                            {isCompleted ? <CheckSquare className="w-3 h-3" /> : isInProgress ? <div className="w-2 h-2 bg-indigo-500 rounded-full" /> : null}
                        </div>
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1E2D40] border ${isInProgress ? 'border-indigo-500/50' : isCompleted ? 'border-emerald-500/20' : 'border-slate-700/50 opacity-60'} p-4 rounded-xl shadow relative`}>
                          {isInProgress && <div className="absolute inset-0 bg-indigo-500/5 rounded-xl pointer-events-none" />}
                          <div className="flex items-center justify-between space-x-2 mb-3 relative z-10">
                            <div className="font-bold text-white text-sm">{phase.name}</div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : isInProgress ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>{phase.status}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-700/50 relative z-10">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-0.5">Start Date</div>
                                <div className="text-xs text-slate-300 font-medium">{phase.startDate || 'TBD'}</div>
                            </div>
                            <div className="text-right md:text-left">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-0.5">Estimated Delivery</div>
                                <div className="text-xs text-slate-300 font-medium">{phase.estimatedDelivery || phase.date || 'TBD'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeDetailsTab === 'files' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Provide Files Section */}
                  <div className="bg-[#1E2D40] rounded-xl border border-slate-700 overflow-hidden">
                     <div className="p-5 border-b border-slate-700 bg-slate-800/30">
                       <h3 className="text-white font-bold text-lg">Provide Files</h3>
                       <p className="text-xs text-slate-400 mt-1">Submit links to your assets or Google Drive folders.</p>
                     </div>
                     <div className="p-5">
                       <form onSubmit={handleDriveSubmit} className="space-y-4">
                         <div>
                           <label className="block text-xs font-medium text-slate-400 mb-1.5">Material Description</label>
                           <input 
                             type="text" 
                             placeholder="e.g. Ad Creatives, Branding Assets" 
                             className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                             value={driveFolderName}
                             onChange={(e) => setDriveFolderName(e.target.value)}
                             required
                           />
                         </div>
                         <div>
                           <label className="block text-xs font-medium text-slate-400 mb-1.5">Google Drive Link</label>
                           <input 
                             type="url" 
                             placeholder="https://drive.google.com/drive/folders/..." 
                             className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                             value={driveFolderLink}
                             onChange={(e) => setDriveFolderLink(e.target.value)}
                             required
                           />
                         </div>
                         <button type="submit" className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2">
                           <Folder className="w-4 h-4" /> Submit Link
                         </button>
                       </form>
                     </div>
                  </div>

                  {/* Shared and Submitted Links */}
                  <div className="space-y-6">
                    <div className="bg-[#1E2D40] rounded-xl border border-slate-700 overflow-hidden">
                       <div className="p-5 border-b border-slate-700 bg-slate-800/30">
                         <h3 className="text-white font-bold text-lg">Files Shared With You</h3>
                       </div>
                       <div className="divide-y divide-slate-700">
                         {deal.driveLink ? (
                           <div className="p-5 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                              <div>
                                <h4 className="text-white font-medium text-sm mb-1 group-hover:text-emerald-400 transition-colors">Final Deliverables</h4>
                                <span className="text-xs text-slate-400">Google Drive Folder</span>
                              </div>
                              <a href={deal.driveLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-medium text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Open Folder &rarr;
                              </a>
                           </div>
                         ) : (
                           <div className="p-6 text-center text-xs text-slate-400">
                              No project folders explicitly shared yet.
                           </div>
                         )}
                       </div>
                    </div>

                    <div className="bg-[#1E2D40] rounded-xl border border-slate-700 overflow-hidden">
                       <div className="p-5 border-b border-slate-700 bg-slate-800/30">
                         <h3 className="text-white font-bold text-lg">Your Submitted Links</h3>
                       </div>
                       <div className="divide-y divide-slate-700 max-h-[220px] overflow-y-auto hide-scrollbar">
                         {submittedLinks.map((link) => (
                           <div key={link.id} className="p-5 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                              <div>
                                <h4 className="text-white font-medium text-sm mb-1 group-hover:text-amber-400 transition-colors">{link.name}</h4>
                                <span className="text-xs text-slate-400">Submitted on {link.date}</span>
                              </div>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 font-medium text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Open Link &rarr;
                              </a>
                           </div>
                         ))}
                         {submittedLinks.length === 0 && (
                           <div className="p-6 text-center text-xs text-slate-400">
                              No links have been submitted yet.
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            )}

            {activeDetailsTab === 'finances' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#1E2D40] p-5 rounded-xl border border-slate-700">
                     <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4 text-indigo-400"/> Budget Allocated</p>
                     <p className="text-2xl font-bold text-white">{deal.value}</p>
                  </div>
                  <div className="bg-[#1E2D40] p-5 rounded-xl border border-emerald-500/20">
                     <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-emerald-400"/> Amount Spent</p>
                     <p className="text-2xl font-bold text-emerald-400">${amountSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  <div className="bg-[#1E2D40] p-5 rounded-xl border border-slate-700">
                     <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-2"><Target className="w-4 h-4 text-sky-400"/> Remaining</p>
                     <p className="text-2xl font-bold text-white">${remainingBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                </div>

                <div className="bg-[#1E2D40] rounded-xl border border-slate-700 w-full overflow-hidden">
                  <div className="p-4 border-b border-slate-700 bg-slate-800/50 grid grid-cols-4 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                     <div className="col-span-2">Description</div>
                     <div>Date</div>
                     <div className="text-right">Amount</div>
                  </div>
                  <div className="divide-y divide-slate-700">
                     <div className="p-4 grid grid-cols-4 gap-4 items-center text-sm">
                       <div className="col-span-2 text-white font-medium">Initial Retainer (40%)</div>
                       <div className="text-slate-400">{deal.startDate || 'N/A'}</div>
                       <div className="text-right text-emerald-400 font-bold">${(budgetNum * 0.4).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                     </div>
                     {spentPercent > 40 && (
                       <div className="p-4 grid grid-cols-4 gap-4 items-center text-sm">
                         <div className="col-span-2 text-white font-medium">Mid-Project Billing</div>
                         <div className="text-slate-400">{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                         <div className="text-right text-emerald-400 font-bold">${(amountSpent - (budgetNum * 0.4)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ClientPortal() {
  const { clients, currentUser, logout, projects, addNotification } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'tasks' | 'finances' | 'files' | 'support' | 'settings' | 'notifications'>('dashboard');
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  
  const [driveFolderLink, setDriveFolderLink] = useState('');
  const [driveFolderName, setDriveFolderName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [submittedLinks, setSubmittedLinks] = useState([
    {
      id: 1,
      name: 'Brand Assets & Logos',
      url: '#',
      date: 'May 12, 2026',
      projectName: 'Phase 2: Platform Integration'
    }
  ]);

  const familyClients = clients.filter(c => c.email.toLowerCase() === currentUser?.email.toLowerCase());

  if (familyClients.length === 0) {
    return <div className="text-white p-8">Client data not found.</div>;
  }

  // Aggregate clients into a single virtual client for family portals
  const isFamilyPortal = familyClients.length > 1;
  const clientName = isFamilyPortal ? familyClients[0].email.split('@')[0].split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : familyClients[0].name;

  const clientProjectsCount = projects.filter(p => familyClients.some(fc => fc.name === p.client)).length;

  const client = {
    ...familyClients[0],
    name: clientName,
    type: familyClients.some(c => c.type === 'Elite') ? 'Elite' : familyClients[0].type,
    projects: clientProjectsCount,
    deals: familyClients.flatMap(c => c.deals.map(d => ({ ...d, targetClientName: c.name }))),
    activities: familyClients.flatMap(c => c.activities),
    contacts: familyClients.flatMap(c => c.contacts),
    notifications: familyClients.flatMap(c => c.notifications || []),
  };

  const notifications = client.notifications;
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveFolderLink || !driveFolderName) return;

    const project = client.deals.find((d: Deal) => d.id.toString() === selectedProjectId?.toString()) || client.deals[0];
    const newLink = {
      id: Date.now(),
      name: driveFolderName,
      url: driveFolderLink,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      projectName: project ? project.name : 'General'
    };

    setSubmittedLinks([newLink, ...submittedLinks]);
    setDriveFolderLink('');
    setDriveFolderName('');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">Welcome back, {client.name}</h2>
              {client.type && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                  client.type === 'Elite' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  client.type === 'Premium' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {client.type}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700">
                <Briefcase className="w-8 h-8 text-indigo-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-1">{client.projects}</div>
                <div className="text-sm text-slate-400">Active Projects</div>
              </div>
              <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700">
                <DollarSign className="w-8 h-8 text-emerald-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-1">{client.totalBilled}</div>
                <div className="text-sm text-slate-400">Total Billed</div>
              </div>
              <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700 cursor-pointer hover:border-blue-500/50 transition-colors" onClick={() => setActiveTab('tasks')}>
                <CheckSquare className="w-8 h-8 text-blue-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-1">2</div>
                <div className="text-sm text-slate-400">Action Items</div>
              </div>
              <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700 cursor-pointer hover:border-rose-500/50 transition-colors" onClick={() => setActiveTab('finances')}>
                <FileText className="w-8 h-8 text-rose-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-1">1</div>
                <div className="text-sm text-slate-400">Pending Invoice</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Requires Your Attention */}
                <div className="bg-[#1E2D40] rounded-2xl border border-rose-500/20 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-rose-500/5 pointer-events-none" />
                  <div className="p-6 border-b border-rose-500/10 flex justify-between items-center relative z-10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                       Requires Your Attention
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-700/50 relative z-10">
                    <div className="p-6 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-white font-medium mb-1">Approve Phase 2 Wireframes</h4>
                        <p className="text-sm text-slate-400">Please review the updated wireframes so we can begin UI design.</p>
                      </div>
                      <button onClick={() => addNotification({ type: 'info', message: 'Review feature coming soon.' })} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Review</button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#1E2D40] rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="p-6 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                  </div>
                  <div className="divide-y divide-slate-700">
                    {client.activities.length > 0 ? client.activities.map((act, index) => (
                      <div key={act.id || index} className="p-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{act.description}</p>
                          <p className="text-sm text-slate-400 mt-1">{act.date} • {act.type}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-slate-400">No activity to show.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-6">
                {/* Your Team */}
                <div className="bg-gradient-to-br from-indigo-900/50 to-[#1E2D40] rounded-2xl border border-indigo-500/20 overflow-hidden p-6 relative">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                  <h3 className="text-lg font-bold text-white mb-6 relative z-10">Your Dedicated Team</h3>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <img src="https://ui-avatars.com/api/?name=Md+Mudasser&background=4F46E5&color=fff" alt="Account Manager" className="w-12 h-12 rounded-full border-2 border-indigo-500/30" />
                      <div>
                        <h4 className="text-white font-bold text-sm">Md. Mudasser</h4>
                        <p className="text-xs text-indigo-300">Lead Project Manager</p>
                      </div>
                    </div>
                    <button onClick={() => addNotification({ type: 'info', message: 'Scheduling system coming soon.' })} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
                      Schedule a Call
                    </button>
                    <button onClick={() => addNotification({ type: 'info', message: 'Messaging system coming soon.' })} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors border border-slate-700">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Projects</h2>
            <div className="grid grid-cols-1 gap-6">
              {client.deals.map((deal: Deal, idx: number) => (
                <ProjectDetailsCard key={deal.id || idx} deal={deal} />
              ))}
              {client.deals.length === 0 && <div className="text-slate-400 p-8 text-center bg-[#1E2D40] rounded-2xl border border-slate-700">No active projects found.</div>}
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Tasks & Milestones</h2>
            <div className="space-y-4">
              <div className="bg-[#1E2D40] rounded-xl border border-slate-700 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Initial Requirements Gathering</h4>
                    <p className="text-sm text-slate-400">Completed on May 10, 2026</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full font-medium">Completed</span>
              </div>
              <div className="bg-[#1E2D40] rounded-xl border border-slate-700 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <div className="w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Kickoff Meeting & Planning</h4>
                    <p className="text-sm text-slate-400">Due: May 18, 2026</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full font-medium">In Progress</span>
              </div>
            </div>
          </div>
        );
      case 'finances':
        const totalBudgetAllocated = client.deals.reduce((acc: number, deal: Deal) => acc + (parseInt(deal.value?.replace(/[^0-9]/g, '')) || 0), 0);
        const totalAmountSpent = client.deals.reduce((acc: number, deal: Deal) => {
          const budgetNum = parseInt(deal.value?.replace(/[^0-9]/g, '')) || 0;
          const spentPercent = deal.stage === 'Completed' ? 100 : Math.max(20, (deal.probability || 0) - 10);
          return acc + ((budgetNum * spentPercent) / 100);
        }, 0);
        const totalRemainingBudget = totalBudgetAllocated - totalAmountSpent;
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Finances & Billing</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
               <div className="bg-[#1E2D40] p-5 rounded-2xl border border-slate-700">
                  <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4 text-indigo-400"/> Total Budget Allocated</div>
                  <div className="text-2xl font-bold text-white">${totalBudgetAllocated.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
               </div>
               <div className="bg-[#1E2D40] p-5 rounded-2xl border border-emerald-500/20">
                  <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-emerald-400"/> Total Amount Spent</div>
                  <div className="text-2xl font-bold text-emerald-400">${totalAmountSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
               </div>
               <div className="bg-[#1E2D40] p-5 rounded-2xl border border-slate-700">
                  <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Target className="w-4 h-4 text-sky-400"/> Total Remaining Budget</div>
                  <div className="text-2xl font-bold text-white">${totalRemainingBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
               </div>
            </div>

            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700 overflow-hidden">
               <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                  <h3 className="text-white font-medium">Invoice #INV-2026-042</h3>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full font-medium border border-emerald-500/20">Paid</span>
               </div>
               <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <p className="text-sm text-slate-400 mb-1">Due Date: May 01, 2026</p>
                   <p className="text-2xl font-bold text-white">$15,000.00</p>
                   <p className="text-sm text-slate-500 mt-1">For: Phase 1 Consulting & Strategy</p>
                 </div>
                 <button onClick={() => addNotification({ type: 'success', message: 'Downloading PDF invoice...' })} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2">
                   <FileText className="w-4 h-4" /> Download PDF
                 </button>
               </div>
            </div>

            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700 overflow-hidden">
               <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                  <h3 className="text-white font-medium">Invoice #INV-2026-048</h3>
                  <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs rounded-full font-medium border border-rose-500/20">Overdue</span>
               </div>
               <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <p className="text-sm text-slate-400 mb-1">Due Date: May 15, 2026</p>
                   <p className="text-2xl font-bold text-white">$15,000.00</p>
                   <p className="text-sm text-slate-500 mt-1">For: Phase 2 Implementation</p>
                 </div>
                 <div className="flex flex-wrap gap-3">
                   <button onClick={() => addNotification({ type: 'success', message: 'Downloading PDF invoice...' })} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2">
                     <FileText className="w-4 h-4" /> PDF
                   </button>
                   <button onClick={() => addNotification({ type: 'info', message: 'Payment gateway integration coming soon.' })} className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                     <DollarSign className="w-4 h-4" /> Pay Now
                   </button>
                 </div>
               </div>
            </div>

          </div>
        );
      case 'files':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Project Resources</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1E2D40] rounded-2xl border border-slate-700 overflow-hidden">
                 <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-bold text-white">Provide Project Files</h3>
                     <p className="text-sm text-slate-400 mt-1">Submit your files via Google Drive link.</p>
                   </div>
                 </div>
                 <div className="p-6">
                    <form onSubmit={handleDriveSubmit} className="space-y-4">
                       <div>
                         <label className="block text-sm font-medium text-slate-400 mb-2">Folder / Material Name</label>
                         <input 
                           type="text" 
                           placeholder="e.g. Brand Guidelines, Assets" 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                           value={driveFolderName}
                           onChange={(e) => setDriveFolderName(e.target.value)}
                           required
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-slate-400 mb-2">Google Drive Folder Link</label>
                         <input 
                           type="url" 
                           placeholder="https://drive.google.com/drive/folders/..." 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                           value={driveFolderLink}
                           onChange={(e) => setDriveFolderLink(e.target.value)}
                           required
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-slate-400 mb-2">Select Project</label>
                         <select 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                           value={selectedProjectId}
                           onChange={(e) => setSelectedProjectId(e.target.value)}
                         >
                           {client.deals.map((deal: Deal, idx: number) => (
                             <option key={deal.id || idx} value={deal.id}>
                               {deal.targetClientName ? `[${deal.targetClientName}] ` : ''}{deal.name}
                             </option>
                           ))}
                         </select>
                       </div>
                       <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                         <Folder className="w-5 h-5" /> Submit Drive Link
                       </button>
                    </form>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#1E2D40] rounded-2xl border border-slate-700 overflow-hidden">
                   <div className="p-6 border-b border-slate-700">
                     <h3 className="text-lg font-bold text-white">Files Shared With You</h3>
                     <p className="text-sm text-slate-400 mt-1">Deliverables and assets from our team.</p>
                   </div>
                   <div className="divide-y divide-slate-700">
                     {client.deals.filter((d: Deal) => d.driveLink).map((deal: Deal, idx: number) => (
                       <div key={deal.id || idx} className="p-6 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                          <div>
                            <h4 className="flex items-center gap-2 text-white font-medium mb-1 group-hover:text-emerald-400 transition-colors">
                              {deal.name} Deliverables
                              {deal.targetClientName && (
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] uppercase tracking-wider rounded font-medium">
                                  {deal.targetClientName}
                                </span>
                              )}
                            </h4>
                            <div className="flex gap-4 text-sm text-slate-400">
                              <span>Project: {deal.name}</span>
                            </div>
                          </div>
                          <a href={deal.driveLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Open Folder &rarr;
                          </a>
                       </div>
                     ))}
                     {client.deals.filter((d: Deal) => d.driveLink).length === 0 && (
                       <div className="p-8 text-center text-slate-400">
                          No project folders shared yet.
                       </div>
                     )}
                   </div>
                </div>

                <div className="bg-[#1E2D40] rounded-2xl border border-slate-700 overflow-hidden">
                   <div className="p-6 border-b border-slate-700">
                     <h3 className="text-lg font-bold text-white">Your Submitted Links</h3>
                     <p className="text-sm text-slate-400 mt-1">Links to files you've provided.</p>
                   </div>
                   <div className="divide-y divide-slate-700">
                     {submittedLinks.map((link) => (
                       <div key={link.id} className="p-6 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                          <div>
                            <h4 className="text-white font-medium mb-1 group-hover:text-indigo-400 transition-colors">{link.name}</h4>
                            <div className="flex gap-4 text-sm text-slate-400">
                              <span>Submitted on: {link.date}</span>
                              <span>Project: {link.projectName}</span>
                            </div>
                          </div>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Open Folder &rarr;
                          </a>
                       </div>
                     ))}
                     {submittedLinks.length === 0 && (
                       <div className="p-8 text-center text-slate-400">
                          No links have been submitted yet.
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Support Tickets</h2>
              <button onClick={() => addNotification({ type: 'info', message: 'Ticket creation coming soon.' })} className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> New Ticket
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#1E2D40] rounded-xl border border-slate-700 p-5 flex items-center justify-between group hover:border-indigo-500/50 transition-colors cursor-pointer">
                <div>
                  <h4 className="text-white font-medium mb-1">Need help configuring SSO</h4>
                  <p className="text-sm text-slate-400">Created on May 12, 2026 • Ticket #1042</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full font-medium border border-amber-500/20">Pending Integration</span>
                  <span className="text-xs text-slate-500">Last updated: 2h ago</span>
                </div>
              </div>

              <div className="bg-[#1E2D40] rounded-xl border border-slate-700 p-5 flex items-center justify-between group hover:border-indigo-500/50 transition-colors cursor-pointer opacity-75">
                <div>
                  <h4 className="text-white font-medium mb-1">Update billing address</h4>
                  <p className="text-sm text-slate-400">Created on Apr 28, 2026 • Ticket #1015</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-xs rounded-full font-medium border border-slate-500/20">Resolved</span>
                  <span className="text-xs text-slate-500">Last updated: May 02, 2026</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Account Settings</h2>
            
            <div className="bg-[#1E2D40] rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">Company Profile</h3>
                <p className="text-sm text-slate-400 mt-1">Manage your company details and preferences.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Company Name</label>
                    <input type="text" defaultValue={client.name} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Industry</label>
                    <input type="text" defaultValue="Technology" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Primary Contact</label>
                    <input type="text" defaultValue={client.contact} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={() => addNotification({ type: 'success', message: 'Profile updated successfully' })} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center p-12 bg-[#1E2D40] rounded-2xl border border-slate-700/50 border-dashed">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">No notifications yet</p>
                  <p className="text-slate-400 text-sm">You'll receive updates about your projects and account here.</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div key={notif.id} className={`p-5 rounded-xl border transition-colors ${!notif.read ? 'bg-[#1E2D40] hover:bg-slate-800 border-indigo-500/30 shadow-sm shadow-indigo-500/10' : 'bg-slate-800/40 border-slate-700/50'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h4 className={`text-base font-bold ${!notif.read ? 'text-white' : 'text-slate-200'}`}>{notif.title}</h4>
                          {!notif.read && <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-wider rounded border border-indigo-500/20">New</span>}
                        </div>
                        <p className={`text-sm leading-relaxed ${!notif.read ? 'text-slate-300' : 'text-slate-400'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-3 font-medium">{new Date(notif.date).toLocaleDateString()} at {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {notif.type === 'payment' && <DollarSign className={`w-5 h-5 ${!notif.read ? 'text-indigo-400' : 'text-slate-500'}`} />}
                        {notif.type === 'project_update' && <Briefcase className={`w-5 h-5 ${!notif.read ? 'text-indigo-400' : 'text-slate-500'}`} />}
                        {notif.type === 'delivery' && <CheckSquare className={`w-5 h-5 ${!notif.read ? 'text-indigo-400' : 'text-slate-500'}`} />}
                        {notif.type === 'meeting' && <MessageSquare className={`w-5 h-5 ${!notif.read ? 'text-indigo-400' : 'text-slate-500'}`} />}
                        {notif.type === 'general' && <Bell className={`w-5 h-5 ${!notif.read ? 'text-indigo-400' : 'text-slate-500'}`} />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Client Sidebar */}
      <div className="w-64 bg-[#1E2D40] border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-[#0ED7A8]" />
          <span className="text-xl font-bold text-white tracking-tight">Client Portal</span>
        </div>
        
        <div className="flex-1 py-4 flex flex-col gap-1 px-3 mt-4">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'projects', icon: Briefcase, label: 'Projects' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'finances', icon: DollarSign, label: 'Finances' },
            { id: 'files', icon: Folder, label: 'Files' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'support', icon: MessageSquare, label: 'Support' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
                activeTab === item.id 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#1E2D40] border-b border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-20">
          <div className="flex items-center gap-4">
           {/* Mobile menu could go here */}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#1E2D40]"></span>
              )}
            </button>
            <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {client.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto p-4 sm:p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/8801722769661" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 z-40 group"
        aria-label="Contact us on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path fillRule="evenodd" d="M12.002 2.052A10.026 10.026 0 0 0 2.007 12.04c.002 1.62.408 3.2 1.173 4.596L2.03 21.01l4.526-1.187a10.041 10.041 0 0 0 5.446 1.583c5.529 0 10.015-4.482 10.015-10.012 0-5.529-4.486-10.012-10.015-10.012Zm.003 18.342a8.312 8.312 0 0 1-4.249-1.161l-.304-.18-3.155.828.84-3.076-.198-.316A8.326 8.326 0 0 1 3.69 12.043c0-4.605 3.748-8.35 8.354-8.35s8.352 3.746 8.352 8.352c0 4.604-3.746 8.349-8.35 8.349Zm4.582-6.257c-.252-.126-1.488-.735-1.718-.818-.23-.083-.398-.126-.566.126-.168.252-.647.818-.794.985-.147.168-.293.189-.545.063-.252-.126-1.062-.39-2.023-1.246-.748-.667-1.253-1.492-1.4-1.744-.147-.252-.016-.39.11-.515.114-.113.252-.293.378-.44.126-.147.168-.252.252-.42.084-.168.042-.315-.021-.441-.063-.126-.566-1.365-.776-1.87-.204-.492-.41-.424-.566-.432h-.483c-.168 0-.441.063-.672.315-.23.252-.881.861-.881 2.099 0 1.238.902 2.435 1.028 2.603.126.168 1.774 2.708 4.298 3.796.6.258 1.068.412 1.433.528.602.192 1.15.164 1.583.1.487-.072 1.488-.609 1.698-1.196.21-.588.21-1.092.147-1.197-.063-.105-.23-.168-.482-.294Z" clipRule="evenodd" />
        </svg>
        <span className="absolute right-16 bg-[#1E2D40] text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 shadow-lg">
          Chat with us
        </span>
      </a>
    </div>
  );
}
