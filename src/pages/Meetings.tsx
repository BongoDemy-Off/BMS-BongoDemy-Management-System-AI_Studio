import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Calendar, Clock, Users, Building, Shield, Star, FileText, CheckSquare, Square, ChevronRight, X, AlertCircle, CheckCircle2, MessageSquare, ListTodo, Save, Bell } from 'lucide-react';
import { format, parseISO, isPast, isFuture } from 'date-fns';

type PrepItem = { id: string; task: string; completed: boolean };
type ActionItem = { id: string; task: string; assignee: string; completed: boolean };
type MeetingReminder = { id: string; timeBefore: '1_hour' | '1_day'; channels: ('system' | 'email' | 'whatsapp')[] };

type Meeting = {
  id: string;
  title: string;
  type: 'Internal' | 'Government' | 'NGO' | 'High-Profile' | 'Client';
  date: string;
  duration: number;
  attendees: string;
  status: 'Scheduled' | 'Completed' | 'Canceled';
  agenda: string;
  prepItems: PrepItem[];
  notes: string;
  actionItems: ActionItem[];
  reminders?: MeetingReminder[];
};

const initialMeetings: Meeting[] = [
  {
    id: 'MTG-001',
    title: 'Q3 Security Compliance Review',
    type: 'Government',
    date: '2026-03-02T10:00',
    duration: 90,
    attendees: 'Alice, Bob, Gov Auditor',
    status: 'Scheduled',
    agenda: 'Reviewing recent pentest results and compliance with national cybersecurity frameworks.',
    prepItems: [
      { id: 'p1', task: 'Prepare Final Audit Report', completed: true },
      { id: 'p2', task: 'Print Compliance Certificates', completed: false }
    ],
    notes: '',
    actionItems: []
  },
  {
    id: 'MTG-002',
    title: 'Partnership Kickoff',
    type: 'NGO',
    date: '2026-03-05T14:00',
    duration: 60,
    attendees: 'Charlie, Dave, NGO Director',
    status: 'Scheduled',
    agenda: 'Discussing pro-bono security training for NGO staff.',
    prepItems: [
      { id: 'p3', task: 'Draft Training Proposal', completed: false },
      { id: 'p4', task: 'Prepare Presentation Deck', completed: false }
    ],
    notes: '',
    actionItems: []
  },
  {
    id: 'MTG-003',
    title: 'Board of Directors Briefing',
    type: 'High-Profile',
    date: '2026-02-25T09:00',
    duration: 120,
    attendees: 'Alice, CEO, Board Members',
    status: 'Completed',
    agenda: 'Quarterly cybersecurity posture update.',
    prepItems: [
      { id: 'p5', task: 'Q1 Threat Landscape Deck', completed: true }
    ],
    notes: 'The board was highly satisfied with the zero-trust implementation. Requested a roadmap for AI-driven threat hunting by next quarter. Approved budget for new SIEM tool.',
    actionItems: [
      { id: 'a1', task: 'Draft AI Threat Hunting Roadmap', assignee: 'Alice', completed: false },
      { id: 'a2', task: 'Initiate SIEM procurement process', assignee: 'Dave', completed: true }
    ]
  }
];

export function Meetings() {
  const { addNotification } = useAppContext();
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'Calendar'>('Upcoming');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailsTab, setDetailsTab] = useState<'prep' | 'outcomes' | 'ai-bot' | 'reminders'>('prep');

  // New Meeting Form
  const [newMeeting, setNewMeeting] = useState<Partial<Meeting>>({
    title: '',
    type: 'Internal',
    date: '',
    duration: 60,
    attendees: '',
    agenda: '',
  });
  const [newPrepTask, setNewPrepTask] = useState('');
  const [tempPrepItems, setTempPrepItems] = useState<PrepItem[]>([]);
  const [tempReminders, setTempReminders] = useState<MeetingReminder[]>([]);

  // Details Form State
  const [newActionTask, setNewActionTask] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'High-Profile': return { color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: Star };
      case 'Government': return { color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: Building };
      case 'NGO': return { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: Users };
      case 'Client': return { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Shield };
      default: return { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Users };
    }
  };

  const filteredMeetings = meetings.filter(m => {
    try {
      const date = parseISO(m.date);
      if (activeTab === 'Upcoming') return isFuture(date) || m.status === 'Scheduled';
      return isPast(date) || m.status === 'Completed';
    } catch {
      return true;
    }
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.date) return;

    const meeting: Meeting = {
      id: `MTG-${Date.now()}`,
      title: newMeeting.title,
      type: newMeeting.type as Meeting['type'],
      date: newMeeting.date,
      duration: newMeeting.duration || 60,
      attendees: newMeeting.attendees || '',
      status: 'Scheduled',
      agenda: newMeeting.agenda || '',
      prepItems: tempPrepItems,
      notes: '',
      actionItems: [],
      reminders: tempReminders
    };

    setMeetings([...meetings, meeting]);
    setIsAddModalOpen(false);
    setNewMeeting({ title: '', type: 'Internal', date: '', duration: 60, attendees: '', agenda: '' });
    setTempPrepItems([]);
    setTempReminders([]);
  };

  const togglePrepItem = (meetingId: string, prepId: string) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          prepItems: m.prepItems.map(p => p.id === prepId ? { ...p, completed: !p.completed } : p)
        };
      }
      return m;
    }));
    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting(prev => prev ? {
        ...prev,
        prepItems: prev.prepItems.map(p => p.id === prepId ? { ...p, completed: !p.completed } : p)
      } : null);
    }
  };

  const toggleActionItem = (meetingId: string, actionId: string) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          actionItems: m.actionItems.map(a => a.id === actionId ? { ...a, completed: !a.completed } : a)
        };
      }
      return m;
    }));
    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting(prev => prev ? {
        ...prev,
        actionItems: prev.actionItems.map(a => a.id === actionId ? { ...a, completed: !a.completed } : a)
      } : null);
    }
  };

  const addActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTask.trim() || !selectedMeeting) return;

    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      task: newActionTask,
      assignee: newActionAssignee || 'Unassigned',
      completed: false
    };

    setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? { ...m, actionItems: [...m.actionItems, newItem] } : m));
    setSelectedMeeting(prev => prev ? { ...prev, actionItems: [...prev.actionItems, newItem] } : null);
    setNewActionTask('');
    setNewActionAssignee('');
  };

  const saveNotes = () => {
    if (!selectedMeeting) return;
    setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? { ...m, notes: editNotes } : m));
    setSelectedMeeting(prev => prev ? { ...prev, notes: editNotes } : null);
  };

  const markAsCompleted = () => {
    if (!selectedMeeting) return;
    setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? { ...m, status: 'Completed' } : m));
    setSelectedMeeting(prev => prev ? { ...prev, status: 'Completed' } : null);
    setDetailsTab('outcomes');
  };

  const openMeetingDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setEditNotes(meeting.notes);
    setDetailsTab(meeting.status === 'Completed' ? 'outcomes' : 'prep');
  };

  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleAISummarize = async () => {
    if (!selectedMeeting || !editNotes.trim()) return;
    setIsSummarizing(true);
    addNotification({ type: 'info', message: 'AI is summarizing meeting notes...' });
    
    try {
      const response = await fetch('/api/summarize-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes })
      });
      
      if (!response.ok) throw new Error('Failed to summarize notes');
      
      const { summary, actionItems } = await response.json();
      
      // Update notes with summary
      const updatedNotes = `${editNotes}\n\n=== AI Summary ===\n${summary}`;
      
      // Convert new action items to our format
      const newActionItems = actionItems.map((task: string) => ({
        id: `ai-${Date.now()}-${Math.random()}`,
        task,
        assignee: 'Unassigned',
        completed: false
      }));

      const mergedActionItems = [...selectedMeeting.actionItems, ...newActionItems];

      setMeetings(prev => prev.map(m => 
        m.id === selectedMeeting.id 
          ? { ...m, notes: updatedNotes, actionItems: mergedActionItems } 
          : m
      ));
      
      setSelectedMeeting(prev => prev ? { 
        ...prev, 
        notes: updatedNotes, 
        actionItems: mergedActionItems 
      } : null);
      
      setEditNotes(updatedNotes);
      
      addNotification({ type: 'success', message: 'Notes summarized and action items extracted.' });
    } catch (error: any) {
      addNotification({ type: 'error', message: error.message || 'AI summarization failed' });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Meeting Schedule</h1>
          <p className="text-slate-400 text-sm mt-1">Prepare for high-profile meetings and track outcomes.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Schedule Meeting
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-400/10 rounded-lg text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-300">Upcoming Meetings</h3>
          </div>
          <div className="text-3xl font-bold text-white">{meetings.filter(m => m.status === 'Scheduled').length}</div>
        </div>
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-400/10 rounded-lg text-rose-400">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-300">High-Profile / Gov</h3>
          </div>
          <div className="text-3xl font-bold text-white">
            {meetings.filter(m => (m.type === 'High-Profile' || m.type === 'Government') && m.status === 'Scheduled').length}
          </div>
        </div>
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-400/10 rounded-lg text-amber-400">
              <ListTodo className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-300">Pending Action Items</h3>
          </div>
          <div className="text-3xl font-bold text-white">
            {meetings.reduce((acc, m) => acc + m.actionItems.filter(a => !a.completed).length, 0)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-px overflow-x-auto custom-scrollbar">
        {['Upcoming', 'Past', 'Calendar'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-[#0ED7A8] text-[#0ED7A8]' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'Calendar' ? tab : `${tab} Meetings`}
          </button>
        ))}
      </div>

      {activeTab === 'Calendar' ? (
        <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden p-6">
           <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{day}</div>
              ))}
           </div>
           <div className="grid grid-cols-7 gap-2 auto-rows-[100px]">
              {Array.from({ length: 30 }).map((_, i) => {
                 const day = i + 1;
                 const dayMeetings = meetings.filter(m => new Date(m.date).getDate() === day && new Date(m.date).getMonth() === new Date().getMonth());
                 return (
                    <div key={i} className="border border-slate-700/50 rounded-lg p-2 flex flex-col gap-1 overflow-hidden hover:border-slate-500 transition-colors">
                       <span className="text-sm font-medium text-slate-300 mb-1">{day}</span>
                       <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                         {dayMeetings.map(m => {
                            const config = getTypeConfig(m.type);
                            return (
                               <div 
                                 key={m.id} 
                                 onClick={() => openMeetingDetails(m)}
                                 className={`text-[10px] truncate px-1.5 py-0.5 rounded cursor-pointer ${config.color} border-none bg-opacity-20 hover:bg-opacity-30`}
                               >
                                 {format(parseISO(m.date), 'HH:mm')} - {m.title}
                               </div>
                            )
                         })}
                       </div>
                    </div>
                 )
              })}
           </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMeetings.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 bg-[#1E2D40] rounded-2xl border border-slate-700/50">
            No {activeTab.toLowerCase()} meetings found.
          </div>
        ) : (
          filteredMeetings.map((meeting) => {
            const typeConfig = getTypeConfig(meeting.type);
            const TypeIcon = typeConfig.icon;
            const prepCompleted = meeting.prepItems.filter(p => p.completed).length;
            const prepTotal = meeting.prepItems.length;
            const prepProgress = prepTotal === 0 ? 100 : Math.round((prepCompleted / prepTotal) * 100);

            return (
              <div 
                key={meeting.id} 
                onClick={() => openMeetingDetails(meeting)}
                className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 hover:border-[#0ED7A8]/50 transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border flex items-center gap-1.5 uppercase tracking-wider ${typeConfig.color}`}>
                    <TypeIcon className="w-3 h-3" />
                    {meeting.type}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${meeting.status === 'Completed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                    {meeting.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white group-hover:text-[#0ED7A8] transition-colors mb-2 line-clamp-2">
                  {meeting.title}
                </h3>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{format(parseISO(meeting.date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{format(parseISO(meeting.date), 'h:mm a')} ({meeting.duration} min)</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-400">
                    <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{meeting.attendees}</span>
                  </div>
                </div>

                {meeting.status === 'Scheduled' && prepTotal > 0 && (
                  <div className="pt-4 border-t border-slate-700/50">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Preparation</span>
                      <span className={prepProgress === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                        {prepCompleted}/{prepTotal} Done
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${prepProgress === 100 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                        style={{ width: `${prepProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {meeting.status === 'Scheduled' && meeting.reminders && meeting.reminders.length > 0 && (
                  <div className="pt-3 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Bell className="w-3.5 h-3.5 text-[#0ED7A8]" /> {meeting.reminders.length} Reminder{meeting.reminders.length > 1 ? 's' : ''} Set
                  </div>
                )}
                
                {meeting.status === 'Completed' && (
                  <div className="pt-4 border-t border-slate-700/50 flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {meeting.notes ? 'Notes saved' : 'No notes'}
                    </div>
                    <div className="flex items-center gap-1">
                      <ListTodo className="w-3.5 h-3.5" />
                      {meeting.actionItems.length} Action Items
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedMeeting(null)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-3xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/50 flex items-start justify-between gap-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border flex items-center gap-1.5 uppercase tracking-wider ${getTypeConfig(selectedMeeting.type).color}`}>
                    {React.createElement(getTypeConfig(selectedMeeting.type).icon, { className: "w-3 h-3" })}
                    {selectedMeeting.type}
                  </span>
                  {selectedMeeting.status === 'Scheduled' ? (
                    <button 
                      onClick={markAsCompleted}
                      className="text-xs font-medium bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark Completed
                    </button>
                  ) : (
                    <span className="text-xs font-medium bg-emerald-400/10 text-emerald-400 px-2 py-1 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedMeeting.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(parseISO(selectedMeeting.date), 'MMM d, yyyy h:mm a')}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedMeeting.attendees}</span>
                </div>
              </div>
              <button onClick={() => setSelectedMeeting(null)} className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-700/50 flex-shrink-0">
              <button
                onClick={() => setDetailsTab('prep')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${detailsTab === 'prep' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Preparation & Agenda
              </button>
              <button
                onClick={() => setDetailsTab('outcomes')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${detailsTab === 'outcomes' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Outcomes & Roadmaps
                {selectedMeeting.status === 'Completed' && <div className="w-2 h-2 rounded-full bg-emerald-400"></div>}
              </button>
              <button
                onClick={() => setDetailsTab('reminders')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${detailsTab === 'reminders' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Reminders
              </button>
              <button
                onClick={() => setDetailsTab('ai-bot')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${detailsTab === 'ai-bot' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                🤖 AI Surrogate
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {detailsTab === 'prep' ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Agenda / Topics
                    </h3>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm text-slate-300 whitespace-pre-wrap">
                      {selectedMeeting.agenda || 'No agenda provided.'}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" /> Required Preparation (Documents/Presentations)
                    </h3>
                    {selectedMeeting.prepItems.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No preparation items required.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedMeeting.prepItems.map(item => (
                          <div 
                            key={item.id} 
                            onClick={() => togglePrepItem(selectedMeeting.id, item.id)}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${item.completed ? 'bg-emerald-400/5 border-emerald-400/20' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
                          >
                            <button className={`mt-0.5 ${item.completed ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {item.completed ? <CheckCircle2 className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                            </button>
                            <span className={`text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedMeeting.status !== 'Completed' && (
                    <div className="bg-amber-400/10 border border-amber-400/20 text-amber-400 p-3 rounded-xl text-sm flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>This meeting hasn't been marked as completed yet. You can still take draft notes.</p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Meeting Minutes & Roadmaps
                      </h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleAISummarize}
                          disabled={isSummarizing || !editNotes.trim()}
                          className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 disabled:opacity-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-pulse' : ''}`} /> AI Summarize
                        </button>
                        <button onClick={saveNotes} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                          <Save className="w-3.5 h-3.5" /> Save Notes
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Record important information, new versions, working processes, or roadmaps discussed..."
                      className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] transition-all resize-none custom-scrollbar"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                      <ListTodo className="w-4 h-4" /> Action Items / Next Steps
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      {selectedMeeting.actionItems.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No action items recorded.</p>
                      ) : (
                        selectedMeeting.actionItems.map(item => (
                          <div 
                            key={item.id} 
                            onClick={() => toggleActionItem(selectedMeeting.id, item.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${item.completed ? 'bg-emerald-400/5 border-emerald-400/20' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
                          >
                            <div className="flex items-center gap-3">
                              <button className={`${item.completed ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {item.completed ? <CheckCircle2 className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                              </button>
                              <span className={`text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                {item.task}
                              </span>
                            </div>
                            <span className="text-xs font-medium bg-slate-700 text-slate-300 px-2 py-1 rounded">
                              {item.assignee}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={addActionItem} className="flex gap-2">
                      <input
                        type="text"
                        value={newActionTask}
                        onChange={(e) => setNewActionTask(e.target.value)}
                        placeholder="New action item..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                      />
                      <input
                        type="text"
                        value={newActionAssignee}
                        onChange={(e) => setNewActionAssignee(e.target.value)}
                        placeholder="Assignee"
                        className="w-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                      />
                      <button 
                        type="submit"
                        disabled={!newActionTask.trim()}
                        className="bg-[#0ED7A8] text-slate-900 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {detailsTab === 'reminders' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                  <div className="bg-[#1E2D40] rounded-xl p-5 border border-slate-700/50">
                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                       <Bell className="w-4 h-4 text-[#0ED7A8]" /> Configured Reminders
                    </h3>
                    <div className="space-y-3 mb-6">
                      {(!selectedMeeting.reminders || selectedMeeting.reminders.length === 0) ? (
                        <div className="text-center p-6 bg-slate-900/50 rounded-xl border border-slate-700/50 border-dashed">
                           <Bell className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                           <p className="text-slate-400 text-xs text-center block">No reminders configured for this meeting.</p>
                        </div>
                      ) : (
                        selectedMeeting.reminders.map(rem => (
                          <div key={rem.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div>
                              <p className="text-sm font-medium text-white">{rem.timeBefore === '1_hour' ? '1 Hour Before' : '1 Day Before'}</p>
                              <div className="flex gap-2 mt-1.5">
                                {rem.channels.map(ch => (
                                  <span key={ch} className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                    ch === 'email' ? 'bg-indigo-500/10 text-indigo-400' :
                                    ch === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-400' :
                                    'bg-amber-500/10 text-amber-400'
                                  }`}>
                                    {ch === 'system' ? 'in-app' : ch}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const action = () => {
                                  const updatedReminders = selectedMeeting.reminders!.filter(r => r.id !== rem.id);
                                  setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? { ...m, reminders: updatedReminders } : m));
                                  setSelectedMeeting(prev => prev ? { ...prev, reminders: updatedReminders } : null);
                                };
                                action();
                              }}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Add Reminder</h3>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <select id="modalReminderTimeBefore" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white">
                          <option value="1_hour">1 Hour Before</option>
                          <option value="1_day">1 Day Before</option>
                        </select>
                        
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" id="modal-reminder-email" className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-700 focus:ring-indigo-500" />
                            <span className="text-sm text-slate-300">Email</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" id="modal-reminder-whatsapp" className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500" />
                            <span className="text-sm text-slate-300">WhatsApp</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" id="modal-reminder-system" className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500" defaultChecked />
                            <span className="text-sm text-slate-300">In-App</span>
                          </label>
                        </div>
                        
                        <button 
                          type="button"
                          onClick={() => {
                            const timeBefore = (document.getElementById('modalReminderTimeBefore') as HTMLSelectElement).value as '1_hour' | '1_day';
                            const hasEmail = (document.getElementById('modal-reminder-email') as HTMLInputElement).checked;
                            const hasWhatsapp = (document.getElementById('modal-reminder-whatsapp') as HTMLInputElement).checked;
                            const hasSystem = (document.getElementById('modal-reminder-system') as HTMLInputElement).checked;
                            
                            const channels: ('system'|'email'|'whatsapp')[] = [];
                            if (hasEmail) channels.push('email');
                            if (hasWhatsapp) channels.push('whatsapp');
                            if (hasSystem) channels.push('system');
                            
                            if (channels.length > 0) {
                              const newReminder: MeetingReminder = { id: `r-${Date.now()}`, timeBefore, channels };
                              const updatedReminders = [...(selectedMeeting.reminders || []), newReminder];
                              setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? { ...m, reminders: updatedReminders } : m));
                              setSelectedMeeting(prev => prev ? { ...prev, reminders: updatedReminders } : null);
                              
                              (document.getElementById('modal-reminder-email') as HTMLInputElement).checked = false;
                              (document.getElementById('modal-reminder-whatsapp') as HTMLInputElement).checked = false;
                              (document.getElementById('modal-reminder-system') as HTMLInputElement).checked = true;
                            }
                          }}
                          className="sm:ml-auto bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailsTab === 'ai-bot' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                  <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                          <span className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg"><MessageSquare className="w-5 h-5" /></span>
                          Deploy AI Surrogate
                        </h3>
                        <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
                          Protect your focus time. The AI Surrogate will join the meeting on your behalf, record the transcript, capture sentiment, and synthesize actionable items for your review.
                        </p>
                      </div>
                      {selectedMeeting.status === 'Scheduled' && (
                        <button onClick={() => addNotification({ type: 'success', message: 'Surrogate dispatched successfully.' })} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2">
                           <Calendar className="w-4 h-4" /> Send Surrogate
                        </button>
                      )}
                    </div>

                    {selectedMeeting.status === 'Completed' && (
                      <div className="mt-8 space-y-4">
                        <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2">Surrogate Report Ready</h4>
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                          <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                             <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Executive Summary
                          </h5>
                          <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            The meeting went smoothly. The board praised the new firewall architecture. They requested a focus on the AI threat-hunting roadmap scaling capabilities for next quarter. No major incidents were reported.
                          </p>
                          <h5 className="font-semibold text-white mb-3 mt-6 flex items-center gap-2">
                             <ListTodo className="w-4 h-4 text-amber-400" /> AI-Extracted Action Items
                          </h5>
                          <div className="space-y-2">
                            <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                               <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-400"></div>
                               <div>
                                 <p className="text-sm text-slate-200">Prepare SIEM timeline.</p>
                                 <p className="text-xs text-slate-500">Mentioned by CEO (14:32)</p>
                               </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                               <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-400"></div>
                               <div>
                                 <p className="text-sm text-slate-200">Schedule vendor sync.</p>
                                 <p className="text-xs text-slate-500">Mentioned by Alice (21:10)</p>
                               </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex gap-3">
                             <button onClick={() => addNotification({ type: 'info', message: 'Full transcript will be available soon.' })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-sm py-2 rounded-lg transition-colors border border-slate-700">View Full Transcript</button>
                             <button onClick={() => addNotification({ type: 'success', message: 'Extracted items added to Task Board.' })} className="flex-1 bg-[#0ED7A8]/10 hover:bg-[#0ED7A8]/20 text-[#0ED7A8] border border-[#0ED7A8]/20 text-sm py-2 rounded-lg transition-colors">Add Items to Task Board</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Meeting Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">Schedule New Meeting</h2>
                <p className="text-sm text-slate-400 mt-1">Set up a meeting and define required preparation.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="add-meeting-form" onSubmit={handleAddMeeting} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Meeting Title</label>
                    <input required type="text" value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white" placeholder="e.g. Q4 Security Audit Kickoff" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Meeting Type</label>
                    <select value={newMeeting.type} onChange={e => setNewMeeting({...newMeeting, type: e.target.value as any})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white">
                      <option value="Internal">Internal Team</option>
                      <option value="Government">Government / Regulatory</option>
                      <option value="NGO">NGO / Non-Profit</option>
                      <option value="High-Profile">High-Profile / Board</option>
                      <option value="Client">Client</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Date & Time</label>
                    <input required type="datetime-local" value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white [color-scheme:dark]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Duration (minutes)</label>
                    <input type="number" min="15" step="15" value={newMeeting.duration} onChange={e => setNewMeeting({...newMeeting, duration: parseInt(e.target.value)})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Attendees</label>
                    <input type="text" value={newMeeting.attendees} onChange={e => setNewMeeting({...newMeeting, attendees: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white" placeholder="e.g. Alice, Bob, External Auditor" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Agenda / Topics</label>
                    <textarea value={newMeeting.agenda} onChange={e => setNewMeeting({...newMeeting, agenda: e.target.value})} className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white resize-none" placeholder="What will be discussed?" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                  <label className="text-sm font-medium text-slate-300 block mb-2">Preparation Checklist (Documents, Presentations)</label>
                  <div className="space-y-2 mb-3">
                    {tempPrepItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-800 p-2 rounded-lg border border-slate-700">
                        <span className="text-sm text-slate-300">{item.task}</span>
                        <button type="button" onClick={() => setTempPrepItems(tempPrepItems.filter(p => p.id !== item.id))} className="text-slate-500 hover:text-rose-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPrepTask}
                      onChange={(e) => setNewPrepTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newPrepTask.trim()) {
                            setTempPrepItems([...tempPrepItems, { id: `p-${Date.now()}`, task: newPrepTask, completed: false }]);
                            setNewPrepTask('');
                          }
                        }
                      }}
                      placeholder="Add a preparation task..."
                      className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (newPrepTask.trim()) {
                          setTempPrepItems([...tempPrepItems, { id: `p-${Date.now()}`, task: newPrepTask, completed: false }]);
                          setNewPrepTask('');
                        }
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                  <label className="text-sm font-medium text-slate-300 block mb-2">Meeting Reminders</label>
                  <div className="space-y-2 mb-3">
                    {tempReminders.map(rem => (
                      <div key={rem.id} className="flex items-center justify-between bg-slate-800 p-2 rounded-lg border border-slate-700">
                        <span className="text-sm text-slate-300 font-medium">
                          <Bell className="w-4 h-4 inline-block mr-2 text-slate-400" />
                          {rem.timeBefore === '1_hour' ? '1 Hour Before' : '1 Day Before'}
                        </span>
                        <div className="flex items-center gap-2">
                          {rem.channels.map(ch => (
                            <span key={ch} className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                              ch === 'email' ? 'bg-indigo-500/10 text-indigo-400' :
                              ch === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                              {ch === 'system' ? 'in-app' : ch}
                            </span>
                          ))}
                          <button type="button" onClick={() => setTempReminders(tempReminders.filter(r => r.id !== rem.id))} className="text-slate-500 hover:text-rose-400 ml-2">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {tempReminders.length === 0 && <p className="text-sm text-slate-500">No reminders set.</p>}
                  </div>
                  
                  <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <select id="newReminderTimeBefore" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white">
                        <option value="1_hour">1 Hour Before</option>
                        <option value="1_day">1 Day Before</option>
                      </select>
                      
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" id="reminder-channel-email" className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-700 focus:ring-indigo-500" />
                          <span className="text-sm text-slate-300">Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" id="reminder-channel-whatsapp" className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500" />
                          <span className="text-sm text-slate-300">WhatsApp</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" id="reminder-channel-system" className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500" defaultChecked />
                          <span className="text-sm text-slate-300">In-App</span>
                        </label>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => {
                          const timeBefore = (document.getElementById('newReminderTimeBefore') as HTMLSelectElement).value as '1_hour' | '1_day';
                          const hasEmail = (document.getElementById('reminder-channel-email') as HTMLInputElement).checked;
                          const hasWhatsapp = (document.getElementById('reminder-channel-whatsapp') as HTMLInputElement).checked;
                          const hasSystem = (document.getElementById('reminder-channel-system') as HTMLInputElement).checked;
                          
                          const channels: ('system'|'email'|'whatsapp')[] = [];
                          if (hasEmail) channels.push('email');
                          if (hasWhatsapp) channels.push('whatsapp');
                          if (hasSystem) channels.push('system');
                          
                          if (channels.length > 0) {
                            setTempReminders([...tempReminders, { id: `r-${Date.now()}`, timeBefore, channels }]);
                            (document.getElementById('reminder-channel-email') as HTMLInputElement).checked = false;
                            (document.getElementById('reminder-channel-whatsapp') as HTMLInputElement).checked = false;
                            (document.getElementById('reminder-channel-system') as HTMLInputElement).checked = true;
                          }
                        }}
                        className="sm:ml-auto bg-slate-700 hover:bg-[#0ED7A8]/20 hover:text-[#0ED7A8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3 flex-shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
              <button type="submit" form="add-meeting-form" className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors">Schedule Meeting</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
