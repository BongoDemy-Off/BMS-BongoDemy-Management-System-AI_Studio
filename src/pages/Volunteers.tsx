import React, { useState } from 'react';
import { Users, GraduationCap, MapPin, Award, Star, Search, Plus, UserPlus, Briefcase, Link as LinkIcon, Percent } from 'lucide-react';

const ambassadors = [
  { id: 'AMB-01', name: 'Rakib Hasan', institution: 'Daffodil International University', role: 'Campus Ambassador', joined: '2023-08-15', events: 5, recruits: 42, kpiTarget: 50, kpiAchieved: 45 },
  { id: 'AMB-02', name: 'Sumaiya Akter', institution: 'North South University', role: 'Campus Ambassador', joined: '2023-09-01', events: 3, recruits: 28, kpiTarget: 30, kpiAchieved: 25 },
  { id: 'AMB-03', name: 'Tanvir Ahmed', institution: 'BRAC University', role: 'Campus Ambassador', joined: '2024-01-10', events: 1, recruits: 12, kpiTarget: 20, kpiAchieved: 5 },
];

const partners = [
  { id: 'PRT-01', name: 'TechForBD', type: 'Technology Partner', joined: '2023-05-12', status: 'Active' },
  { id: 'PRT-02', name: 'CyberShield', type: 'Security Partner', joined: '2023-11-20', status: 'Active' },
];

export function Volunteers() {
  const [activeTab, setActiveTab] = useState<'ambassadors' | 'volunteers' | 'partners'>('partners');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Partner & Ambassador Program</h1>
          <p className="text-sm text-slate-400">Managing BongoDemy's ecosystem and community network</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Partners</p>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Active Affiliates</p>
            <p className="text-2xl font-bold text-white">45</p>
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Campus Ambassadors</p>
            <p className="text-2xl font-bold text-white">100+</p>
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Referral Conv.</p>
            <p className="text-2xl font-bold text-white">8.5%</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1E2D40] border border-slate-700 rounded-2xl overflow-hidden">
        <div className="border-b border-slate-700 bg-slate-800/30 flex items-center p-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'partners' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Partners
          </button>
          <button
            onClick={() => setActiveTab('ambassadors')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'ambassadors' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Campus Ambassadors
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'volunteers' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            General Volunteers
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder={`Search ${activeTab}...`} className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]" />
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0ED7A8] text-slate-900 rounded-lg text-sm font-medium hover:bg-[#0ED7A8]/90 transition-colors w-full sm:w-auto justify-center">
              <UserPlus className="w-4 h-4" /> Add New
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  {activeTab === 'partners' && (
                    <>
                      <th className="pb-3 font-medium">Partner Name</th>
                      <th className="pb-3 font-medium">Partnership Type</th>
                      <th className="pb-3 font-medium">Joined Date</th>
                      <th className="pb-3 font-medium">Status</th>
                    </>
                  )}
                  {(activeTab === 'ambassadors' || activeTab === 'volunteers') && (
                    <>
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Institution</th>
                      <th className="pb-3 font-medium">Joined</th>
                      <th className="pb-3 font-medium text-center">Events</th>
                      {activeTab === 'ambassadors' && (
                        <>
                          <th className="pb-3 font-medium text-center">Recruits</th>
                          <th className="pb-3 font-medium">KPI Progress</th>
                        </>
                      )}
                      <th className="pb-3 font-medium">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-sm">
                {activeTab === 'partners' && partners.map((prt) => (
                  <tr key={prt.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-white font-medium shadow-sm">
                          {prt.name.charAt(0)}
                        </div>
                        <span className="font-medium text-white">{prt.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{prt.type}</td>
                    <td className="py-4 text-slate-300">{prt.joined}</td>
                    <td className="py-4">
                       <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">{prt.status}</span>
                    </td>
                  </tr>
                ))}
                
                {activeTab === 'ambassadors' && ambassadors.map((amb) => (
                  <tr key={amb.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                          {amb.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{amb.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{amb.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{amb.institution}</td>
                    <td className="py-4 text-slate-300">{amb.joined}</td>
                    <td className="py-4 text-slate-300 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-medium">
                        <Award className="w-4 h-4 text-amber-400" />
                        {amb.events}
                      </div>
                    </td>
                    <td className="py-4 text-slate-300 text-center font-medium">
                      <div className="flex items-center justify-center gap-1.5 font-medium">
                        <Users className="w-4 h-4 text-blue-400" />
                        {amb.recruits}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1.5 w-32">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{amb.kpiAchieved} / {amb.kpiTarget}</span>
                          <span className="text-[#0ED7A8] font-medium">{Math.round((amb.kpiAchieved / amb.kpiTarget) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#0ED7A8] rounded-full"
                            style={{ width: `${Math.min(100, (amb.kpiAchieved / amb.kpiTarget) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                       <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">Active</span>
                    </td>
                  </tr>
                ))}
                
                {activeTab === 'volunteers' && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                      Volunteer records syncing...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
