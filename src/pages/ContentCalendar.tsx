import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Filter, Search, Globe, Instagram, Facebook, Youtube, Github, AlignLeft, Send, CheckCircle2 } from 'lucide-react';

const contentList = [
  { id: 'CNT-01', title: '5 Phishing Signs to Watch For', date: '2026-05-22', platform: 'Facebook', status: 'Scheduled', author: 'Rafiq M.' },
  { id: 'CNT-02', title: 'BongoDemy SafeNet V2 Launch Video', date: '2026-05-24', platform: 'YouTube', status: 'Draft', author: 'Media Team' },
  { id: 'CNT-03', title: 'Cybersecurity Tips for Students', date: '2026-05-25', platform: 'LinkedIn', status: 'In Review', author: 'CEO' },
  { id: 'CNT-04', title: 'How to Secure Your WhatsApp', date: '2026-05-20', platform: 'BongoBrief', status: 'Published', author: 'Editorial Team' },
  { id: 'CNT-05', title: 'Interactive Cyber Threats Map', date: '2026-05-28', platform: 'Media Lab', status: 'In Review', author: 'Lab Team' },
];

export function ContentCalendar() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('list');

  return (
    <div className="space-y-6 flex flex-col h-full max-h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-sm text-slate-400">Manage BongoBrief, Social Media, and PR publications</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#0ED7A8]/90 transition-colors">
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-700/50 shrink-0">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'list' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
        >
          <AlignLeft className="w-4 h-4" /> List View
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'calendar' ? 'border-[#0ED7A8] text-[#0ED7A8]' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
        >
          <CalendarIcon className="w-4 h-4" /> Calendar View
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-[#1E2D40] rounded-2xl border border-slate-700">
        {activeTab === 'list' ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search content..." className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8] w-64" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors border border-slate-600">
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="space-y-4">
                {contentList.map(item => (
                  <div key={item.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-[#0ED7A8]/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 shadow-inner">
                        {item.platform === 'Facebook' && <Facebook className="w-5 h-5 text-blue-500" />}
                        {item.platform === 'YouTube' && <Youtube className="w-5 h-5 text-red-500" />}
                        {item.platform === 'LinkedIn' && <div className="font-bold text-blue-400">in</div>}
                        {item.platform === 'BongoBrief' && <Globe className="w-5 h-5 text-[#0ED7A8]" />}
                        {item.platform === 'Media Lab' && <CalendarIcon className="w-5 h-5 text-purple-400" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-[#0ED7A8] transition-colors">{item.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" /> {item.date}</span>
                          <span>•</span>
                          <span>{item.platform}</span>
                          <span>•</span>
                          <span>Author: {item.author}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        item.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        item.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        item.status === 'In Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-700 text-slate-300 border-slate-600'
                      }`}>
                        {item.status}
                      </span>
                      <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors border border-slate-600 hover:border-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-slate-900/50">
             <div className="flex items-center justify-center h-full text-slate-400 gap-2 flex-col">
                <CalendarIcon className="w-12 h-12 opacity-50 mb-2" />
                <p>Calendar visualization will be implemented here.</p>
                <button onClick={() => setActiveTab('list')} className="text-[#0ED7A8] hover:underline text-sm font-medium mt-2">Switch back to List View</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
