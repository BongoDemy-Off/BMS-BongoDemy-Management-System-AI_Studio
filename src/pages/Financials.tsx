import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Feb', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 9800 },
  { name: 'Apr', revenue: 2780, expenses: 3908 },
  { name: 'May', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
  { name: 'Jul', revenue: 4490, expenses: 2300 },
];

const transactions = [
  { id: 1, date: '2026-05-13', client: 'Acme Corp', type: 'Invoice Paid', amount: 15400, status: 'Completed' },
  { id: 2, date: '2026-05-12', client: 'AWS Services', type: 'Expense', amount: -1200, status: 'Completed' },
  { id: 3, date: '2026-05-10', client: 'TechNova', type: 'Invoice Due', amount: 5000, status: 'Pending' },
  { id: 4, date: '2026-05-09', client: 'Team Payroll', type: 'Expense', amount: -28400, status: 'Completed' },
];

export function Financials() {
  const [dateRange, setDateRange] = useState('Last 6 Months');

  const totalRevenue = data.reduce((a, b) => a + b.revenue, 0);
  const totalExpenses = data.reduce((a, b) => a + b.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = Math.round((netProfit / totalRevenue) * 100);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Financial Hub</h1>
          <p className="text-slate-400 mt-1">Track revenue, expenses, and overall profit margin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-[#1E2D40] border border-slate-700 text-slate-300 px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 hover:bg-slate-800">
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-400/10 rounded-lg text-emerald-400 border border-emerald-400/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">${totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-slate-400">Total Revenue</div>
        </div>

        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-400/10 rounded-lg text-rose-400 border border-rose-400/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">${totalExpenses.toLocaleString()}</div>
          <div className="text-sm text-slate-400">Total Expenses</div>
        </div>

        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#0ED7A8]/10 rounded-lg text-[#0ED7A8] border border-[#0ED7A8]/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-bold mb-1 ${netProfit > 0 ? 'text-white' : 'text-rose-400'}`}>
            ${netProfit.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400">Net Profit ({margin}%)</div>
        </div>
      </div>
      
      {/* Social Impact Allocation */}
      <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 shadow-sm p-6">
         <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Profit Allocation</h2>
              <p className="text-sm text-slate-400">Impact tracking for CSR initiatives (10% of net profit)</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#0ED7A8]">${(netProfit * 0.1).toLocaleString()}</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Total CSR Pool</div>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
               <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white">SafeLife</span>
                  <span className="text-sm font-medium text-slate-400">50% of Pool</span>
               </div>
               <div className="flex justify-between items-end mb-2">
                 <span className="text-2xl font-bold text-blue-400">${(netProfit * 0.05).toLocaleString()}</span>
                 <span className="text-xs text-slate-500 mb-1">Allocated to awareness</span>
               </div>
               <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-400 rounded-full w-1/2"></div>
               </div>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
               <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white">BongoAid</span>
                  <span className="text-sm font-medium text-slate-400">50% of Pool</span>
               </div>
               <div className="flex justify-between items-end mb-2">
                 <span className="text-2xl font-bold text-emerald-400">${(netProfit * 0.05).toLocaleString()}</span>
                 <span className="text-xs text-slate-500 mb-1">Allocated to disaster relief</span>
               </div>
               <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-400 rounded-full w-1/2"></div>
               </div>
            </div>
         </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-semibold text-white">Revenue vs Expenses</h2>
             <select className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-[#0ED7A8]">
               <option>Year to Date</option>
               <option>Last 12 Months</option>
             </select>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <defs>
                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#0ED7A8" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#0ED7A8" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                 <Tooltip contentStyle={{ backgroundColor: '#1E2D40', borderColor: '#334155', color: '#f8fafc' }} />
                 <Legend />
                 <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0ED7A8" fillOpacity={1} fill="url(#colorRev)" />
                 <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
         </div>

         <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
           <div className="mb-6">
             <h2 className="text-lg font-semibold text-white">P&L Overview</h2>
             <p className="text-sm text-slate-400">Monthly profit & loss chart</p>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                 <Tooltip contentStyle={{ backgroundColor: '#1E2D40', borderColor: '#334155', color: '#f8fafc' }} />
                 <Legend />
                 <Bar dataKey="revenue" name="Revenue" fill="#0ED7A8" radius={[4, 4, 0, 0]} />
                 <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>
      </div>

      <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400 bg-slate-800/30">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
               {transactions.map(t => (
                 <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                   <td className="p-4 text-sm text-slate-400">
                     <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4" />
                       {new Date(t.date).toLocaleDateString()}
                     </div>
                   </td>
                   <td className="p-4 text-sm font-medium text-white">{t.client}</td>
                   <td className="p-4 text-sm text-slate-300">{t.type}</td>
                   <td className="p-4 text-sm">
                     <span className={`px-2 py-1 flex max-w-fit rounded text-xs font-medium border ${
                       t.status === 'Completed' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                       'bg-amber-400/10 text-amber-400 border-amber-400/20'
                     }`}>
                       {t.status}
                     </span>
                   </td>
                   <td className="p-4 text-right font-bold">
                      <span className={t.amount > 0 ? 'text-[#0ED7A8]' : 'text-slate-300'}>
                         {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </span>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
