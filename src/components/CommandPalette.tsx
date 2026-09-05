import React, { useState, useEffect } from 'react';
import { Search, LayoutDashboard, CheckSquare, Target, Users, DollarSign, FolderOpen, ShieldAlert, GraduationCap, Heart, Settings, FileText, Smartphone, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const commands = [
  { id: 'dashboard', name: 'Go to Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'analytics', name: 'Detailed Analytics', icon: Target, path: '/analytics' },
  { id: 'projects', name: 'Manage Projects', icon: FolderOpen, path: '/projects' },
  { id: 'tasks', name: 'Task Board', icon: CheckSquare, path: '/tasks' },
  { id: 'leads', name: 'Leads & CRM', icon: Target, path: '/leads' },
  { id: 'clients', name: 'Client Directory', icon: Users, path: '/clients' },
  { id: 'invoices', name: 'Invoices', icon: FileText, path: '/invoices' },
  { id: 'expenses', name: 'Financial Expenses', icon: DollarSign, path: '/expense' },
  { id: 'social_impact', name: 'Victim Support & BongoAid', icon: ShieldAlert, path: '/social-impact' },
  { id: 'education', name: 'Courses & Education', icon: GraduationCap, path: '/education' },
  { id: 'volunteers', name: 'Partners & Ambassadors', icon: Heart, path: '/volunteers' },
  { id: 'affiliates', name: 'Affiliate Program', icon: Share2, path: '/affiliates' },
  { id: 'products', name: 'Tech Products / SaaS', icon: Smartphone, path: '/products' },
  { id: 'settings', name: 'System Settings', icon: Settings, path: '/settings' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setAiMode(false);
        setQuery('');
        setAiResponse(null);
      }
    };
    
    const handleOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpen);
    };
  }, []);

  useEffect(() => {
    if (query.startsWith('?')) {
      setAiMode(true);
      // Simulate AI thinking
      if (query.length > 5) {
        const timeout = setTimeout(() => {
          if (query.toLowerCase().includes('revenue')) {
            setAiResponse('Based on current data, your total revenue this month is $12,450, up 15% from last month.');
          } else if (query.toLowerCase().includes('task') || query.toLowerCase().includes('project')) {
             setAiResponse('You have 3 high-priority tasks due today, and the CyberShield project is currently in the Review phase.');
          } else {
            setAiResponse('I am analyzing your request based on BongoDemy\'s operational data...');
          }
        }, 800);
        return () => clearTimeout(timeout);
      } else {
        setAiResponse(null);
      }
    } else {
      setAiMode(false);
      setAiResponse(null);
    }
  }, [query]);

  if (!isOpen) return null;

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm px-4">
      <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
      <div className="bg-[#1E2D40] w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
          {aiMode ? (
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
               <span className="text-white text-[10px] font-bold">AI</span>
            </div>
          ) : (
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
          )}
          <input
            type="text"
            className={`w-full bg-transparent border-none focus:outline-none placeholder:text-slate-500 text-lg ${aiMode ? 'text-indigo-300' : 'text-white'}`}
            placeholder="Type a command or start with '?' to ask AI..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="text-xs font-semibold text-slate-500 border border-slate-700 rounded px-2 py-1 bg-slate-800 shrink-0">ESC</div>
        </div>
        <div className="overflow-y-auto custom-scrollbar p-2">
          {aiMode ? (
             <div className="p-6">
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg">
                      <span className="text-white text-xs font-bold">AI</span>
                   </div>
                   <div className="bg-slate-800/80 rounded-xl rounded-tl-none p-4 border border-slate-700 w-full">
                      {aiResponse ? (
                         <p className="text-slate-200 leading-relaxed">{aiResponse}</p>
                      ) : (
                         <div className="flex gap-1 items-center h-6">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce cursor-default" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce cursor-default" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce cursor-default" style={{ animationDelay: '300ms' }}></div>
                         </div>
                      )}
                   </div>
                </div>
                {!aiResponse && (
                   <div className="mt-8 flex flex-col gap-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider pl-12">Suggestions</p>
                      <button onClick={() => setQuery('? What is our total revenue?')} className="text-left py-2 px-4 ml-8 rounded-lg hover:bg-slate-800 text-sm text-slate-400 hover:text-slate-200 transition-colors">"What is our total revenue?"</button>
                      <button onClick={() => setQuery('? Show me high priority tasks')} className="text-left py-2 px-4 ml-8 rounded-lg hover:bg-slate-800 text-sm text-slate-400 hover:text-slate-200 transition-colors">"Show me high priority tasks"</button>
                   </div>
                )}
             </div>
          ) : filteredCommands.length === 0 ? (
            <p className="p-4 text-center text-slate-500">No results found.</p>
          ) : (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                className="w-full text-left p-3 rounded-xl flex items-center gap-3 hover:bg-[#0ED7A8]/10 group transition-colors"
                onClick={() => {
                  navigate(cmd.path);
                  setIsOpen(false);
                  setQuery('');
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-[#0ED7A8]/20 transition-colors">
                  <cmd.icon className="w-5 h-5 text-slate-400 group-hover:text-[#0ED7A8]" />
                </div>
                <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                  {cmd.name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
