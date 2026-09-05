import React, { useState } from 'react';
import { DollarSign, Search, Filter, Plus, FileText, CheckCircle2, Clock, Globe, ArrowRight } from 'lucide-react';

const grants = [
  { id: 'GRN-01', title: 'UNDP Cyber Awareness Grant', organization: 'UNDP Bangladesh', amount: '$15,000', status: 'Submitted', deadline: '2026-06-15', tags: ['Awareness', 'Youth'] },
  { id: 'GRN-02', title: 'AWS Startup Credits', organization: 'Amazon Web Services', amount: '$5,000', status: 'Approved', deadline: '2026-05-10', tags: ['Tech', 'Cloud'] },
  { id: 'GRN-03', title: 'National ICT Innovation Fund', organization: 'ICT Division, BD', amount: '৳1,000,000', status: 'Drafting', deadline: '2026-07-01', tags: ['Innovation', 'Local'] },
  { id: 'GRN-04', title: 'GIZ Capacity Development', organization: 'GIZ Bangladesh', amount: '€20,000', status: 'Drafting', deadline: '2026-08-20', tags: ['Training', 'Capacity Building'] },
  { id: 'GRN-05', title: 'USAID Digital Empowerment', organization: 'USAID', amount: '$25,000', status: 'Submitted', deadline: '2026-07-15', tags: ['Digital', 'Empowerment'] },
];

export function Grants() {
  return (
    <div className="space-y-6 flex flex-col h-full max-h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Grants & Funding Pipeline</h1>
          <p className="text-sm text-slate-400">Manage applications for international grants and startup credits</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#0ED7A8]/90 transition-colors">
            <Plus className="w-4 h-4" /> New Application
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-[#1E2D40] border border-slate-700 p-5 rounded-2xl flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-slate-400 mb-1">Total Funding Secured</p>
             <p className="text-2xl font-bold text-emerald-400">$12,500</p>
           </div>
           <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
             <DollarSign className="w-6 h-6" />
           </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-5 rounded-2xl flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-slate-400 mb-1">Pending Applications</p>
             <p className="text-2xl font-bold text-blue-400">4</p>
           </div>
           <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
             <FileText className="w-6 h-6" />
           </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-5 rounded-2xl flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-slate-400 mb-1">Drafting Phase</p>
             <p className="text-2xl font-bold text-amber-400">2</p>
           </div>
           <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
             <Clock className="w-6 h-6" />
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-[#1E2D40] rounded-2xl border border-slate-700">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search funding sources..." className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8] w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors border border-slate-600">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {grants.map(grant => (
              <div key={grant.id} className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 hover:border-[#0ED7A8]/50 transition-colors group flex flex-col">
                 <div className="flex items-start justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                      grant.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      grant.status === 'Submitted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                       {grant.status === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                        grant.status === 'Submitted' ? <Globe className="w-3.5 h-3.5" /> : 
                        <Clock className="w-3.5 h-3.5" />}
                       {grant.status}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-700/50">{grant.id}</span>
                 </div>
                 
                 <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[#0ED7A8] transition-colors">{grant.title}</h3>
                 <p className="text-sm text-slate-400 mb-4">{grant.organization}</p>
                 
                 <div className="flex flex-wrap items-center gap-2 mb-6">
                    {grant.tags.map(tag => (
                       <span key={tag} className="text-[10px] font-medium text-slate-300 bg-slate-700/50 px-2.5 py-1 rounded border border-slate-600/50 uppercase tracking-wider">
                          {tag}
                       </span>
                    ))}
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-auto">
                    <div>
                       <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Expected Amount</p>
                       <p className="text-sm font-bold text-white">{grant.amount}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Deadline</p>
                       <p className="text-sm font-medium text-slate-300">{grant.deadline}</p>
                    </div>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-end">
                    <button className="text-sm font-medium text-[#0ED7A8] hover:text-[#0ED7A8]/80 flex items-center gap-1.5 transition-colors">
                       View Application <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
