import React, { useState } from 'react';
import { DollarSign, ExternalLink, Link as LinkIcon, Plus, Search, TrendingUp, Users, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const performanceData = [
  { name: 'Jan', referrals: 45, clicks: 800 },
  { name: 'Feb', referrals: 52, clicks: 950 },
  { name: 'Mar', referrals: 38, clicks: 600 },
  { name: 'Apr', referrals: 65, clicks: 1200 },
  { name: 'May', referrals: 89, clicks: 1500 },
  { name: 'Jun', referrals: 104, clicks: 1800 },
];

const affiliatesList = [
  { id: 'AFF-001', name: 'LearnIT Academy', code: 'LEARNIT20', clicks: 4200, referrals: 145, conversion: '3.4%', earnings: 1250, pendingAmount: 450, status: 'Active' },
  { id: 'AFF-002', name: 'CyberShield Blog', code: 'CSHIELD', clicks: 2800, referrals: 89, conversion: '3.1%', earnings: 800, pendingAmount: 120, status: 'Active' },
  { id: 'AFF-003', name: 'TechCraft BD', code: 'TCRAFT25', clicks: 1500, referrals: 45, conversion: '3.0%', earnings: 450, pendingAmount: 0, status: 'Active' },
  { id: 'AFF-004', name: 'Programming Squad', code: 'PSQUAD', clicks: 800, referrals: 12, conversion: '1.5%', earnings: 120, pendingAmount: 120, status: 'Pending Review' },
];

const pendingPayouts = [
  { id: 'PAY-101', affiliate: 'LearnIT Academy', amount: 450, period: 'May 2026', status: 'Pending' },
  { id: 'PAY-102', affiliate: 'CyberShield Blog', amount: 120, period: 'May 2026', status: 'Pending' },
  { id: 'PAY-103', affiliate: 'Programming Squad', amount: 120, period: 'May 2026', status: 'Pending' },
];

export function Affiliates() {
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'payouts'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Affiliate Program Management</h1>
          <p className="text-sm text-slate-400">Track referrals, commissions, and partner performance.</p>
        </div>
        <button className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Create Affiliate
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#0ED7A8]/10 rounded-lg text-[#0ED7A8]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[#0ED7A8] text-xs font-medium bg-[#0ED7A8]/10 px-2 py-1 rounded">+12%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">124</div>
          <div className="text-sm text-slate-400">Active Affiliates</div>
        </div>
        
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <LinkIcon className="w-5 h-5" />
            </div>
            <span className="text-[#0ED7A8] text-xs font-medium bg-[#0ED7A8]/10 px-2 py-1 rounded">+24%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">9,300</div>
          <div className="text-sm text-slate-400">Total Link Clicks</div>
        </div>

        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[#0ED7A8] text-xs font-medium bg-[#0ED7A8]/10 px-2 py-1 rounded">+18%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">393</div>
          <div className="text-sm text-slate-400">Total Referrals</div>
        </div>

        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-slate-400 text-xs font-medium bg-slate-800 px-2 py-1 rounded">Pending</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">$690</div>
          <div className="text-sm text-slate-400">Pending Payouts</div>
        </div>
      </div>

      <div className="bg-[#1E2D40] border border-slate-700 rounded-2xl overflow-hidden">
        <div className="border-b border-slate-700 bg-slate-800/30 flex items-center p-2 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'manage' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Manage Affiliates
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'payouts' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Commissions & Payouts
            <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#0ED7A8]" />
                  Referral Growth
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ED7A8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0ED7A8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E2D40', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="referrals" stroke="#0ED7A8" strokeWidth={2} fillOpacity={1} fill="url(#colorReferrals)" name="Successful Referrals" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Link Clicks Volume
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E2D40', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                        cursor={{ fill: '#334155', opacity: 0.4 }}
                      />
                      <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Link Clicks" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search affiliates..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="pb-3 font-medium">Affiliate Details</th>
                      <th className="pb-3 font-medium">Affiliate Code</th>
                      <th className="pb-3 font-medium text-right">Clicks</th>
                      <th className="pb-3 font-medium text-right">Referrals</th>
                      <th className="pb-3 font-medium text-right">Conv. Rate</th>
                      <th className="pb-3 font-medium text-right">Total Earnings</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {affiliatesList.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map((aff) => (
                      <tr key={aff.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-white font-medium shadow-sm">
                              {aff.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-white">{aff.name}</div>
                              <div className="text-xs text-slate-400">{aff.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-mono text-[#0ED7A8] text-xs">
                           <span className="bg-[#0ED7A8]/10 px-2 py-1 rounded">{aff.code}</span>
                        </td>
                        <td className="py-4 text-slate-300 text-right">{aff.clicks}</td>
                        <td className="py-4 text-slate-300 text-right">{aff.referrals}</td>
                        <td className="py-4 text-slate-300 text-right">{aff.conversion}</td>
                        <td className="py-4 text-white font-medium text-right">${aff.earnings.toLocaleString()}</td>
                        <td className="py-4">
                           <span className={`px-2 py-1 rounded text-xs font-medium ${
                             aff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                           }`}>
                             {aff.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                 <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                 <div>
                    <h4 className="text-amber-500 font-medium">Pending Payouts Requires Action</h4>
                    <p className="text-sm text-amber-500/80 mt-1">There are 3 pending commission payouts for the May 2026 period. Please review and process payments.</p>
                 </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="pb-3 font-medium">Payout ID</th>
                      <th className="pb-3 font-medium">Affiliate</th>
                      <th className="pb-3 font-medium">Period</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {pendingPayouts.map((payout) => (
                      <tr key={payout.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 text-slate-400 font-mono text-xs">{payout.id}</td>
                        <td className="py-4 text-white font-medium">{payout.affiliate}</td>
                        <td className="py-4 text-slate-300">{payout.period}</td>
                        <td className="py-4 text-white font-medium text-right">${payout.amount.toLocaleString()}</td>
                        <td className="py-4">
                           <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-medium">
                             {payout.status}
                           </span>
                        </td>
                        <td className="py-4 text-right">
                           <button className="text-xs bg-[#0ED7A8]/10 text-[#0ED7A8] hover:bg-[#0ED7A8]/20 px-3 py-1.5 rounded font-medium transition-colors">
                              Approve & Pay
                           </button>
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
