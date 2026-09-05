import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, MapPin, Calendar, Users, CheckCircle2, Circle, Plus, 
  MoreVertical, Camera, Award, Megaphone, DollarSign, GraduationCap, 
  X, Clock, Building, Target, Link as LinkIcon, FileText, Bell, Mail, Smartphone
} from 'lucide-react';
import { format, parseISO, isPast, isFuture, subDays, subHours, subMinutes, isValid } from 'date-fns';
import { useAppContext } from '../context/AppContext';

type CampaignTask = {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignee: string;
};

type CampaignReminder = {
  id: number;
  type: 'in-app' | 'email';
  offset: string;
  calculatedTime: string;
  timestamp?: number;
  triggered?: boolean;
};

type Campaign = {
  id: string;
  institution: string;
  location: string;
  date: string;
  expectedAttendees: number;
  status: 'Planning' | 'Confirmed' | 'Completed';
  budget: { allocated: number; spent: number };
  tasks: CampaignTask[];
  reminders?: CampaignReminder[];
  outcomes: {
    actualAttendees: number;
    newsLinks: string[];
    notes: string;
  };
};

const calculateReminderTimestamp = (dueDate: string, offset: string): number | null => {
  try {
    const date = parseISO(dueDate);
    if (!isValid(date)) return null;
    
    const match = offset.match(/^(\d+)\s+(minute|hour|day)s?\s+before$/i);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === 'minute') return subMinutes(date, amount).getTime();
      if (unit === 'hour') return subHours(date, amount).getTime();
      if (unit === 'day') return subDays(date, amount).getTime();
    }
    
    if (offset === '1 hour before') return subHours(date, 1).getTime();
    if (offset === '1 day before') return subDays(date, 1).getTime();
  } catch (e) {
    return null;
  }
  return null;
};

const calculateReminderTime = (dueDate: string, offset: string) => {
  try {
    const date = parseISO(dueDate);
    if (!isValid(date)) return offset;
    
    const match = offset.match(/^(\d+)\s+(minute|hour|day)s?\s+before$/i);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === 'minute') return format(subMinutes(date, amount), 'MMM d, h:mm a');
      if (unit === 'hour') return format(subHours(date, amount), 'MMM d, h:mm a');
      if (unit === 'day') return format(subDays(date, amount), 'MMM d, h:mm a');
    }
    return offset; // Fallback
  } catch (e) {
    return offset;
  }
};

const STANDARD_TASKS = [
  'Campus Ambassador hunting',
  'Sponsorship deals',
  'Venue Finalising',
  'Guest Finalising',
  'Budget Planning',
  'Presentation Prep',
  'Certificate Printing',
  'Medal Preparation',
  'Photographer Booking',
  'News Coverage Setup'
];

const initialCampaigns: Campaign[] = [
  {
    id: 'CAMP-001',
    institution: 'Dhaka University',
    location: 'TSC Auditorium, Dhaka',
    date: '2026-03-15T10:00',
    expectedAttendees: 500,
    status: 'Planning',
    budget: { allocated: 50000, spent: 15000 },
    tasks: STANDARD_TASKS.map((t, i) => ({
      id: `t-${i}`,
      title: t,
      status: i < 3 ? 'completed' : i === 3 ? 'in-progress' : 'pending',
      assignee: i % 2 === 0 ? 'Alice' : 'Bob'
    })),
    outcomes: { actualAttendees: 0, newsLinks: [], notes: '' }
  },
  {
    id: 'CAMP-002',
    institution: 'BRAC University',
    location: 'Mohakhali Campus, Dhaka',
    date: '2026-02-10T11:00',
    expectedAttendees: 300,
    status: 'Completed',
    budget: { allocated: 30000, spent: 28500 },
    tasks: STANDARD_TASKS.map((t, i) => ({
      id: `t2-${i}`,
      title: t,
      status: 'completed',
      assignee: 'Charlie'
    })),
    outcomes: { 
      actualAttendees: 340, 
      newsLinks: ['https://news.example.com/bracu-cyber'], 
      notes: 'Highly interactive session. Students requested a follow-up workshop on ethical hacking.' 
    }
  }
];

export function Campaigns() {
  const { addNotification } = useAppContext();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [activeTab, setActiveTab] = useState<'Active' | 'Completed'>('Active');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailsTab, setDetailsTab] = useState<'logistics' | 'outcomes' | 'reminders'>('logistics');

  const [showReminderOptions, setShowReminderOptions] = useState(false);
  const [customReminderAmount, setCustomReminderAmount] = useState('1');
  const [customReminderUnit, setCustomReminderUnit] = useState('day');
  const [newNewsLink, setNewNewsLink] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasUpdates = false;

      setCampaigns(prevCampaigns => {
        const nextCampaigns = prevCampaigns.map(camp => {
          if (!camp.reminders || camp.status === 'Completed') return camp;
          
          let campUpdated = false;
          const nextReminders = camp.reminders.map(rem => {
            if (!rem.triggered && rem.timestamp && now >= rem.timestamp) {
              addNotification({
                message: `Reminder: Campaign "${camp.institution}" is scheduled for ${format(parseISO(camp.date), 'MMM d, yyyy h:mm a')}`,
                type: 'info'
              });
              campUpdated = true;
              return { ...rem, triggered: true };
            }
            return rem;
          });

          if (campUpdated) {
            hasUpdates = true;
            return { ...camp, reminders: nextReminders };
          }
          return camp;
        });

        if (hasUpdates && selectedCampaign) {
           const updatedSelected = nextCampaigns.find(t => t.id === selectedCampaign.id);
           if (updatedSelected) {
             setSelectedCampaign(prev => prev ? { ...prev, reminders: updatedSelected.reminders } : null);
           }
        }
        
        return hasUpdates ? nextCampaigns : prevCampaigns;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [addNotification, selectedCampaign]);

  // New Campaign Form
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    institution: '',
    location: '',
    date: '',
    expectedAttendees: 100,
    budget: { allocated: 0, spent: 0 }
  });

  const filteredCampaigns = campaigns.filter(c => 
    activeTab === 'Active' ? c.status !== 'Completed' : c.status === 'Completed'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.institution || !newCampaign.date) return;

    const campaign: Campaign = {
      id: `CAMP-${Date.now()}`,
      institution: newCampaign.institution,
      location: newCampaign.location || 'TBD',
      date: newCampaign.date,
      expectedAttendees: newCampaign.expectedAttendees || 100,
      status: 'Planning',
      budget: { allocated: newCampaign.budget?.allocated || 0, spent: 0 },
      tasks: STANDARD_TASKS.map((t, i) => ({
        id: `nt-${Date.now()}-${i}`,
        title: t,
        status: 'pending',
        assignee: 'Unassigned'
      })),
      reminders: [],
      outcomes: { actualAttendees: 0, newsLinks: [], notes: '' }
    };

    setCampaigns([...campaigns, campaign]);
    setIsAddModalOpen(false);
    setNewCampaign({ institution: '', location: '', date: '', expectedAttendees: 100, budget: { allocated: 0, spent: 0 } });
  };

  const handleAddReminder = (campaignId: string, type: 'in-app' | 'email', offset: string) => {
    const campaignDate = campaigns.find(c => c.id === campaignId)?.date || '';
    const calculatedTime = calculateReminderTime(campaignDate, offset);
    const timestamp = calculateReminderTimestamp(campaignDate, offset) || undefined;
    const newReminder: CampaignReminder = { id: Date.now(), type, offset, calculatedTime, timestamp, triggered: false };
    
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return { ...c, reminders: [...(c.reminders || []), newReminder] };
      }
      return c;
    }));
    
    setSelectedCampaign(prev => {
      if (prev && prev.id === campaignId) {
        return { ...prev, reminders: [...(prev.reminders || []), newReminder] };
      }
      return prev;
    });

    addNotification({
      message: `${type === 'email' ? 'Email' : 'In-App'} reminder set for ${calculatedTime}`,
      type: 'success'
    });
    setShowReminderOptions(false);
  };

  const handleRemoveReminder = (campaignId: string, reminderId: number) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return { ...c, reminders: (c.reminders || []).filter(r => r.id !== reminderId) };
      }
      return c;
    }));
    
    setSelectedCampaign(prev => {
      if (prev && prev.id === campaignId) {
        return { ...prev, reminders: (prev.reminders || []).filter(r => r.id !== reminderId) };
      }
      return prev;
    });
  };

  const updateTaskStatus = (campaignId: string, taskId: string, newStatus: CampaignTask['status']) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          tasks: c.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        };
      }
      return c;
    }));
    
    if (selectedCampaign && selectedCampaign.id === campaignId) {
      setSelectedCampaign(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      } : null);
    }
  };

  const updateTaskAssignee = (campaignId: string, taskId: string, assignee: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          tasks: c.tasks.map(t => t.id === taskId ? { ...t, assignee } : t)
        };
      }
      return c;
    }));
    
    if (selectedCampaign && selectedCampaign.id === campaignId) {
      setSelectedCampaign(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, assignee } : t)
      } : null);
    }
  };

  const markAsCompleted = () => {
    if (!selectedCampaign) return;
    setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, status: 'Completed' } : c));
    setSelectedCampaign(prev => prev ? { ...prev, status: 'Completed' } : null);
    setDetailsTab('outcomes');
  };

  const updateOutcomes = (field: keyof Campaign['outcomes'], value: any) => {
    if (!selectedCampaign) return;
    setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { 
      ...c, 
      outcomes: { ...c.outcomes, [field]: value } 
    } : c));
    setSelectedCampaign(prev => prev ? { 
      ...prev, 
      outcomes: { ...prev.outcomes, [field]: value } 
    } : null);
  };

  const addNewsLink = (link: string) => {
    if (!selectedCampaign || !link.trim()) return;
    const newLinks = [...selectedCampaign.outcomes.newsLinks, link];
    updateOutcomes('newsLinks', newLinks);
  };

  const removeNewsLink = (index: number) => {
    if (!selectedCampaign) return;
    const newLinks = selectedCampaign.outcomes.newsLinks.filter((_, i) => i !== index);
    updateOutcomes('newsLinks', newLinks);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Confirmed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Planning': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getTaskIcon = (title: string) => {
    if (title.includes('Sponsorship') || title.includes('Budget')) return <DollarSign className="w-4 h-4" />;
    if (title.includes('Venue')) return <Building className="w-4 h-4" />;
    if (title.includes('Guest') || title.includes('Ambassador')) return <Users className="w-4 h-4" />;
    if (title.includes('Presentation')) return <FileText className="w-4 h-4" />;
    if (title.includes('Certificate') || title.includes('Medal')) return <Award className="w-4 h-4" />;
    if (title.includes('Photographer')) return <Camera className="w-4 h-4" />;
    if (title.includes('News')) return <Megaphone className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#0ED7A8]" />
            Awareness Campaigns
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage cybercrime & cyberbullying awareness events in educational institutions.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#1E2D40] p-5 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="text-sm font-medium text-slate-400 mb-1">Total Campaigns</div>
          <div className="text-2xl font-bold text-white">{campaigns.length}</div>
        </div>
        <div className="bg-[#1E2D40] p-5 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="text-sm font-medium text-slate-400 mb-1">Students Reached</div>
          <div className="text-2xl font-bold text-[#0ED7A8]">
            {campaigns.reduce((acc, c) => acc + (c.status === 'Completed' ? c.outcomes.actualAttendees : 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-[#1E2D40] p-5 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="text-sm font-medium text-slate-400 mb-1">Upcoming Events</div>
          <div className="text-2xl font-bold text-amber-400">
            {campaigns.filter(c => c.status !== 'Completed').length}
          </div>
        </div>
        <div className="bg-[#1E2D40] p-5 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="text-sm font-medium text-slate-400 mb-1">Total Budget</div>
          <div className="text-2xl font-bold text-blue-400">
            ৳{campaigns.reduce((acc, c) => acc + c.budget.spent, 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">spent / ৳{campaigns.reduce((acc, c) => acc + c.budget.allocated, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-px overflow-x-auto custom-scrollbar">
        {['Active', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-[#0ED7A8] text-[#0ED7A8]' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab} Campaigns
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 bg-[#1E2D40] rounded-2xl border border-slate-700/50">
            No {activeTab.toLowerCase()} campaigns found.
          </div>
        ) : (
          filteredCampaigns.map((campaign) => {
            const completedTasks = campaign.tasks.filter(t => t.status === 'completed').length;
            const totalTasks = campaign.tasks.length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            return (
              <div 
                key={campaign.id} 
                onClick={() => {
                  setSelectedCampaign(campaign);
                  setNewNewsLink('');
                  setDetailsTab(campaign.status === 'Completed' ? 'outcomes' : 'logistics');
                }}
                className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 hover:border-[#0ED7A8]/50 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute -right-6 -top-6 text-slate-800/30 transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <GraduationCap className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border flex items-center gap-1.5 uppercase tracking-wider ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
                      {campaign.id}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white group-hover:text-[#0ED7A8] transition-colors mb-1 line-clamp-2">
                    {campaign.institution}
                  </h3>
                  
                  <div className="space-y-2 mb-6 mt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span className="line-clamp-1">{campaign.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>{format(parseISO(campaign.date), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>{campaign.status === 'Completed' ? campaign.outcomes.actualAttendees : campaign.expectedAttendees} Students {campaign.status === 'Completed' ? 'Reached' : 'Expected'}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-700/30">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <DollarSign className="w-4 h-4 text-[#0ED7A8]" />
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex justify-between text-xs">
                            <span>Spent <span className={`font-medium ${campaign.budget.spent > campaign.budget.allocated ? 'text-rose-400' : 'text-white'}`}>৳{campaign.budget.spent.toLocaleString()}</span></span>
                            <span className="text-slate-500">Alloc: ৳{campaign.budget.allocated.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full ${campaign.budget.spent > campaign.budget.allocated ? 'bg-rose-400' : 'bg-[#0ED7A8]'}`}
                              style={{ width: `${Math.min((campaign.budget.spent / (campaign.budget.allocated || 1)) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50 mt-auto">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Logistics Readiness</span>
                      <span className={progress === 100 ? 'text-emerald-400 font-medium' : 'text-[#0ED7A8] font-medium'}>
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-400' : 'bg-[#0ED7A8]'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedCampaign(null)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-4xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/50 flex items-start justify-between gap-4 flex-shrink-0 bg-slate-800/30 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border uppercase tracking-wider ${getStatusColor(selectedCampaign.status)}`}>
                    {selectedCampaign.status}
                  </span>
                  {selectedCampaign.status !== 'Completed' && (
                    <button 
                      onClick={markAsCompleted}
                      className="text-xs font-medium bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark as Completed
                    </button>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-[#0ED7A8]" />
                  {selectedCampaign.institution}
                </h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-slate-300">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-400" /> {selectedCampaign.location}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-400" /> {format(parseISO(selectedCampaign.date), 'MMM d, yyyy h:mm a')}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-400" /> {selectedCampaign.expectedAttendees} Expected</span>
                </div>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-700/50 flex-shrink-0">
              <button
                onClick={() => setDetailsTab('logistics')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${detailsTab === 'logistics' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Logistics & Checklist
              </button>
              <button
                onClick={() => setDetailsTab('outcomes')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${detailsTab === 'outcomes' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Outcomes & Media
                {selectedCampaign.status === 'Completed' && <div className="w-2 h-2 rounded-full bg-emerald-400"></div>}
              </button>
              <button
                onClick={() => setDetailsTab('reminders')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${detailsTab === 'reminders' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Reminders
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/20">
              {detailsTab === 'reminders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-[#0ED7A8]" />
                      Campaign Reminders
                    </h3>
                    <button
                      onClick={() => setShowReminderOptions(!showReminderOptions)}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  {showReminderOptions && (
                    <div className="bg-slate-800/80 border border-[#0ED7A8]/30 rounded-xl p-4 shadow-lg mb-4">
                      <div className="flex justify-between items-center mb-3 text-sm font-medium text-white border-b border-slate-700 pb-2">
                        Add Reminder
                        <button onClick={() => setShowReminderOptions(false)} className="text-slate-400 hover:text-white p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-2 font-medium">Quick add:</p>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {['1 hour before', '1 day before'].map((time) => (
                              <button
                                key={time}
                                onClick={() => handleAddReminder(selectedCampaign.id, 'in-app', time)}
                                className="text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700 hover:border-[#0ED7A8]/50 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-slate-700/50">
                          <p className="text-xs text-slate-400 mb-2 font-medium">Custom time:</p>
                          <div className="flex items-center gap-2 mb-3">
                            <input 
                              type="number" 
                              min="1"
                              value={customReminderAmount}
                              onChange={e => setCustomReminderAmount(e.target.value)}
                              className="w-16 bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#0ED7A8]"
                            />
                            <select 
                              value={customReminderUnit}
                              onChange={e => setCustomReminderUnit(e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#0ED7A8]"
                            >
                              <option value="minute">Minutes</option>
                              <option value="hour">Hours</option>
                              <option value="day">Days</option>
                            </select>
                            <span className="text-xs text-slate-400 ml-1">before</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddReminder(selectedCampaign.id, 'in-app', `${customReminderAmount} ${customReminderUnit}${parseInt(customReminderAmount) !== 1 ? 's' : ''} before`)}
                              className="flex-1 text-xs font-medium text-slate-900 bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              In-App
                            </button>
                            <button
                              onClick={() => handleAddReminder(selectedCampaign.id, 'email', `${customReminderAmount} ${customReminderUnit}${parseInt(customReminderAmount) !== 1 ? 's' : ''} before`)}
                              className="flex-1 text-xs font-medium text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Email
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {(!selectedCampaign.reminders || selectedCampaign.reminders.length === 0) ? (
                      <div className="text-center p-8 bg-slate-800/30 rounded-xl border border-slate-700/50">
                        <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">No reminders set for this campaign.</p>
                      </div>
                    ) : (
                      selectedCampaign.reminders.map(reminder => (
                        <div key={reminder.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700 group">
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-900 p-2 rounded-lg">
                              {reminder.type === 'email' ? <Mail className="w-4 h-4 text-slate-400" /> : <Smartphone className="w-4 h-4 text-slate-400" />}
                            </div>
                            <div>
                              <span className="text-sm text-slate-300 font-medium block">
                                {reminder.offset}
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                {reminder.calculatedTime}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveReminder(selectedCampaign.id, reminder.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove reminder"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {detailsTab === 'logistics' && (
                <div className="space-y-6">
                  {/* Budget Overview */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" /> Budget Overview
                    </h3>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-slate-400">Spent: <span className="text-white font-medium">৳{selectedCampaign.budget.spent.toLocaleString()}</span></span>
                      <span className="text-slate-400">Allocated: <span className="text-white font-medium">৳{selectedCampaign.budget.allocated.toLocaleString()}</span></span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 mb-6">
                      <div 
                        className={`h-2 rounded-full transition-all ${selectedCampaign.budget.spent > selectedCampaign.budget.allocated ? 'bg-rose-400' : 'bg-emerald-400'}`}
                        style={{ width: `${Math.min((selectedCampaign.budget.spent / (selectedCampaign.budget.allocated || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400">Update Allocated (৳)</label>
                        <input 
                          type="number"
                          min="0"
                          value={selectedCampaign.budget.allocated || ''}
                          onChange={(e) => {
                            const allocated = parseInt(e.target.value) || 0;
                            setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, budget: { ...c.budget, allocated } } : c));
                            setSelectedCampaign(prev => prev ? { ...prev, budget: { ...prev.budget, allocated } } : null);
                          }}
                          className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-[#0ED7A8] w-full"
                          placeholder="Allocated Amount"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400">Update Spent (৳)</label>
                        <input 
                          type="number"
                          min="0"
                          value={selectedCampaign.budget.spent || ''}
                          onChange={(e) => {
                            const spent = parseInt(e.target.value) || 0;
                            setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, budget: { ...c.budget, spent } } : c));
                            setSelectedCampaign(prev => prev ? { ...prev, budget: { ...prev.budget, spent } } : null);
                          }}
                          className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-[#0ED7A8] w-full"
                          placeholder="Spent Amount"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Standardized Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0ED7A8]" /> Campaign Preparation Checklist
                      </h3>
                      <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                        {selectedCampaign.tasks.filter(t => t.status === 'completed').length} / {selectedCampaign.tasks.length} Completed
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {selectedCampaign.tasks.map(task => (
                        <div key={task.id} className={`p-3 rounded-xl border transition-colors flex flex-col gap-3 ${
                          task.status === 'completed' ? 'bg-emerald-400/5 border-emerald-400/20' : 
                          task.status === 'in-progress' ? 'bg-amber-400/5 border-amber-400/20' : 
                          'bg-slate-800/50 border-slate-700'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-md ${
                                task.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' : 
                                task.status === 'in-progress' ? 'bg-amber-400/10 text-amber-400' : 
                                'bg-slate-700 text-slate-400'
                              }`}>
                                {getTaskIcon(task.title)}
                              </div>
                              <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-300 line-through' : 'text-white'}`}>
                                {task.title}
                              </span>
                            </div>
                            
                            <select 
                              value={task.status}
                              onChange={(e) => updateTaskStatus(selectedCampaign.id, task.id, e.target.value as any)}
                              className={`text-xs font-medium rounded px-2 py-1 outline-none border-none cursor-pointer ${
                                task.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' : 
                                task.status === 'in-progress' ? 'bg-amber-400/10 text-amber-400' : 
                                'bg-slate-700 text-slate-300'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-slate-700/50 pt-2 mt-auto">
                            <span className="text-xs text-slate-500">Assignee:</span>
                            <input 
                              type="text" 
                              value={task.assignee}
                              onChange={(e) => updateTaskAssignee(selectedCampaign.id, task.id, e.target.value)}
                              className="bg-transparent border-none text-xs text-right text-slate-300 focus:outline-none focus:text-white w-32"
                              placeholder="Unassigned"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {detailsTab === 'outcomes' && (
                <div className="space-y-6">
                  {selectedCampaign.status !== 'Completed' && (
                    <div className="bg-amber-400/10 border border-amber-400/20 text-amber-400 p-4 rounded-xl text-sm flex items-start gap-3">
                      <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Campaign is still active</p>
                        <p className="opacity-80">You can start recording outcomes, but the campaign hasn't been officially marked as completed yet.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" /> Actual Students Reached
                      </label>
                      <input 
                        type="number" 
                        value={selectedCampaign.outcomes.actualAttendees || ''}
                        onChange={(e) => updateOutcomes('actualAttendees', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                        placeholder="e.g. 450"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-rose-400" /> Final Budget Spent (৳)
                      </label>
                      <input 
                        type="number" 
                        value={selectedCampaign.budget.spent || ''}
                        onChange={(e) => {
                          if (!selectedCampaign) return;
                          const newBudget = { ...selectedCampaign.budget, spent: parseInt(e.target.value) || 0 };
                          setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, budget: newBudget } : c));
                          setSelectedCampaign(prev => prev ? { ...prev, budget: newBudget } : null);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                        placeholder="e.g. 48000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-blue-400" /> News Coverage & Media Links
                    </label>
                    <div className="space-y-2 mb-2">
                      {selectedCampaign.outcomes.newsLinks.map((link, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-2 truncate">
                            <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            {link}
                          </a>
                          <button onClick={() => removeNewsLink(i)} className="text-slate-500 hover:text-rose-400 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {selectedCampaign.outcomes.newsLinks.length === 0 && (
                        <p className="text-xs text-slate-500 italic">No media links added yet.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        value={newNewsLink}
                        onChange={(e) => setNewNewsLink(e.target.value)}
                        placeholder="https://news.example.com/article"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newNewsLink.trim()) {
                              addNewsLink(newNewsLink);
                              setNewNewsLink('');
                            }
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (newNewsLink.trim()) {
                            addNewsLink(newNewsLink);
                            setNewNewsLink('');
                          }
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Add Link
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" /> Campaign Notes & Feedback
                    </label>
                    <textarea 
                      value={selectedCampaign.outcomes.notes}
                      onChange={(e) => updateOutcomes('notes', e.target.value)}
                      placeholder="Record student feedback, challenges faced, or ideas for the next campaign..."
                      className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-[#0ED7A8] transition-all resize-none custom-scrollbar"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Campaign Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl relative z-10 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0ED7A8]" />
                  Plan New Awareness Campaign
                </h2>
                <p className="text-sm text-slate-400 mt-1">The standard logistics checklist will be automatically generated.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="add-campaign-form" onSubmit={handleAddCampaign} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Educational Institution</label>
                    <input required type="text" value={newCampaign.institution} onChange={e => setNewCampaign({...newCampaign, institution: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white" placeholder="e.g. Dhaka University" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Location / Venue</label>
                    <input type="text" value={newCampaign.location} onChange={e => setNewCampaign({...newCampaign, location: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white" placeholder="e.g. Main Auditorium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Date & Time</label>
                    <input required type="datetime-local" value={newCampaign.date} onChange={e => setNewCampaign({...newCampaign, date: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white [color-scheme:dark]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Expected Attendees</label>
                    <input type="number" min="10" value={newCampaign.expectedAttendees} onChange={e => setNewCampaign({...newCampaign, expectedAttendees: parseInt(e.target.value) || 0})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Allocated Budget (৳)</label>
                    <input type="number" min="0" value={newCampaign.budget?.allocated || ''} onChange={e => setNewCampaign({...newCampaign, budget: { allocated: parseInt(e.target.value) || 0, spent: 0 }})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white" placeholder="e.g. 50000" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3 flex-shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
              <button type="submit" form="add-campaign-form" className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors">Create Campaign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
