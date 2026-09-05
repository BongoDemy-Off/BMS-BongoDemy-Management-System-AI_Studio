import React, { useState } from 'react';
import { ShieldAlert, Heart, HeartHandshake, AlertTriangle, CheckCircle2, Clock, Plus, Search, Filter, Users, MapPin } from 'lucide-react';

const initialVictimCases = [
  { id: 'VIC-001', name: 'Anonymous Student', issue: 'Cyberbullying on Facebook', status: 'Resolved', date: '2024-03-10', priority: 'High', type: 'Cyberbullying' },
  { id: 'VIC-002', name: 'Local Business Owner', issue: 'Page Hijacked/Phishing', status: 'In Progress', date: '2024-03-12', priority: 'Critical', type: 'Phishing' },
  { id: 'VIC-003', name: 'Female Professional', issue: 'Harassment/Blackmail via WhatsApp', status: 'Resolved', date: '2024-02-28', priority: 'Critical', type: 'Harassment' },
  { id: 'VIC-004', name: 'High School Student', issue: 'Fake Profile Impersonation', status: 'Pending Review', date: '2024-03-15', priority: 'Medium', type: 'Impersonation' },
];

const initialBongoAidProjects = [
  { id: 'AID-001', title: 'Winter Clothing Distribution', location: 'Jessore', status: 'Completed', beneficiaries: 150, budget: '$500' },
  { id: 'AID-002', title: 'Ramadan Food Support', location: 'Dhaka Slum Areas', status: 'Active', beneficiaries: 500, budget: '$1200' },
  { id: 'AID-003', title: 'Free Medical Camp', location: 'Rural Jessore', status: 'Planning', beneficiaries: 300, budget: '$800' },
];

const initialVolunteers = [
  { id: 'VOL-001', name: 'Alamin Hossain', track: 'Cyber Awareness', hours: 45, assignments: 'Workshop at DU', status: 'Active' },
  { id: 'VOL-002', name: 'Nusrat Jahan', track: 'Victim Support', hours: 120, assignments: 'Case VIC-003, VIC-005', status: 'Active' },
  { id: 'VOL-003', name: 'Fahim Rahman', track: 'BongoAid', hours: 32, assignments: 'Winter Clothing Drive', status: 'On Leave' },
  { id: 'VOL-004', name: 'Sadia Islam', track: 'Cyber Awareness', hours: 15, assignments: 'Content translation', status: 'Active' },
];

export function SocialImpact() {
  const [activeTab, setActiveTab] = useState<'cases' | 'bongoaid' | 'volunteers'>('cases');
  const [cases] = useState(initialVictimCases);
  const [aidProjects] = useState(initialBongoAidProjects);
  const [volunteers] = useState(initialVolunteers);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Impact & BongoAid</h1>
          <p className="text-sm text-slate-400">Managing victim support operations and charitable programs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Victims Supported</p>
            <p className="text-2xl font-bold text-white">100+</p>
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Resolved Cases</p>
            <p className="text-2xl font-bold text-white">85</p>
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Relief Beneficiaries</p>
            <p className="text-2xl font-bold text-white">950</p>
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">BongoAid Funds</p>
            <p className="text-2xl font-bold text-white">$2,500</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1E2D40] border border-slate-700 rounded-2xl overflow-hidden">
        <div className="border-b border-slate-700 bg-slate-800/30 flex items-center p-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'cases' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Victim Support Cases
          </button>
          <button
            onClick={() => setActiveTab('bongoaid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'bongoaid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            BongoAid Relief Ops
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'volunteers' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Volunteer Roster
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'cases' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search cases..." className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]" />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#0ED7A8]/90 transition-colors">
                  <Plus className="w-4 h-4" /> New Case
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                      <th className="pb-3 font-medium">Case ID</th>
                      <th className="pb-3 font-medium">Victim / Entity</th>
                      <th className="pb-3 font-medium">Issue</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Priority</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {cases.map((c) => (
                      <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 text-slate-300">{c.id}</td>
                        <td className="py-4 font-medium text-white">{c.name}</td>
                        <td className="py-4 text-slate-300">{c.issue}</td>
                        <td className="py-4 text-slate-300">{c.type}</td>
                        <td className="py-4 text-slate-300">{c.date}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                            c.priority === 'Critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                            c.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="py-4">
                           <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${
                             c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                             c.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                             'bg-slate-700 text-slate-300 border-slate-600'
                           }`}>
                             {c.status === 'Resolved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5"/>}
                             {c.status}
                           </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-sm font-medium text-[#0ED7A8] hover:text-[#0ED7A8]/80 transition-colors">
                            Manage Case
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'bongoaid' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div className="bg-[#1E2D40] border border-slate-700 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Company Profit Allocation (10%)</p>
                      <p className="text-2xl font-bold text-[#0ED7A8] mt-1">$4,250</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#0ED7A8]/10 flex items-center justify-center text-[#0ED7A8]">
                       <HeartHandshake className="w-6 h-6" />
                    </div>
                 </div>
                 <div className="bg-[#1E2D40] border border-slate-700 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">External CSR Donations</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-1">$1,800</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                       <Heart className="w-6 h-6" />
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search projects..." className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]" />
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#0ED7A8]/90 transition-colors">
                  <Plus className="w-4 h-4" /> Add Operation
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aidProjects.map((p) => (
                  <div key={p.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${
                        p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        p.status === 'Active' ? 'bg-[#0ED7A8]/10 text-[#0ED7A8] border-[#0ED7A8]/20' :
                        'bg-slate-700 text-slate-300 border-slate-600'
                      }`}>
                        {p.status}
                      </span>
                      <span className="text-xs text-slate-500">{p.id}</span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1 group-hover:text-[#0ED7A8] transition-colors">{p.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> {p.location}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Budget</p>
                        <p className="text-sm font-medium text-white">{p.budget}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Beneficiaries</p>
                        <p className="text-sm font-medium text-white">{p.beneficiaries} People</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search volunteers..." className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]" />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#0ED7A8]/90 transition-colors">
                  <Plus className="w-4 h-4" /> Add Volunteer
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                      <th className="pb-3 font-medium">Volunteer ID</th>
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Track</th>
                      <th className="pb-3 font-medium text-center">Active Hours</th>
                      <th className="pb-3 font-medium">Current Assignments</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {volunteers.map((v) => (
                      <tr key={v.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 text-slate-400 font-mono text-xs">{v.id}</td>
                        <td className="py-4 font-medium text-white">{v.name}</td>
                        <td className="py-4">
                           <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap ${
                             v.track === 'Cyber Awareness' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                             v.track === 'Victim Support' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                             'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                           }`}>
                             {v.track}
                           </span>
                        </td>
                        <td className="py-4 text-slate-300 text-center font-bold">{v.hours}</td>
                        <td className="py-4 text-slate-300">{v.assignments}</td>
                        <td className="py-4">
                           <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center justify-center gap-1.5 w-fit ${
                             v.status === 'Active' ? 'bg-[#0ED7A8]/10 text-[#0ED7A8] border-[#0ED7A8]/20' :
                             'bg-slate-700 text-slate-300 border-slate-600'
                           }`}>
                             {v.status === 'Active' && <CheckCircle2 className="w-3.5 h-3.5" />}
                             {v.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
