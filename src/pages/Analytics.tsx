import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { DollarSign, ShieldAlert, BookOpen, Activity, Calendar as CalendarIcon, ChevronDown, Download, Users, Briefcase } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const allRevenueExpenseData = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Feb', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 9800 },
  { name: 'Apr', revenue: 2780, expenses: 3908 },
  { name: 'May', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
  { name: 'Jul', revenue: 3490, expenses: 4300 },
  { name: 'Aug', revenue: 4000, expenses: 2400 },
  { name: 'Sep', revenue: 3000, expenses: 1398 },
  { name: 'Oct', revenue: 2000, expenses: 9800 },
  { name: 'Nov', revenue: 2780, expenses: 3908 },
  { name: 'Dec', revenue: 3890, expenses: 4800 },
];

const studentEnrollmentData = [
  { name: 'Jan', students: 20 },
  { name: 'Feb', students: 45 },
  { name: 'Mar', students: 85 },
  { name: 'Apr', students: 120 },
  { name: 'May', students: 180 },
  { name: 'Jun', students: 250 },
  { name: 'Jul', students: 300 },
  { name: 'Aug', students: 380 },
  { name: 'Sep', students: 420 },
  { name: 'Oct', students: 490 },
  { name: 'Nov', students: 510 },
  { name: 'Dec', students: 600 },
];

const victimCasesData = [
  { name: 'Cyberbullying', value: 45 },
  { name: 'Phishing/Scam', value: 25 },
  { name: 'Impersonation', value: 20 },
  { name: 'Harassment', value: 10 },
];

const caseColors = ['#0ED7A8', '#3b82f6', '#f59e0b', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-sm">
        <p className="text-white font-semibold mb-2 border-b border-slate-700 pb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm flex items-center justify-between gap-4" style={{ color: p.color }}>
            <span className="capitalize">{p.name}:</span>
            <span className="font-bold">{p.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Analytics() {
  const { leads, teamMembers, addNotification } = useAppContext();
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1Y'>('6M');

  // Filter Data based on time range
  const filteredRevExpData = useMemo(() => {
    if (timeRange === '3M') return allRevenueExpenseData.slice(-3);
    if (timeRange === '6M') return allRevenueExpenseData.slice(-6);
    return allRevenueExpenseData;
  }, [timeRange]);

  const filteredStudentData = useMemo(() => {
    if (timeRange === '3M') return studentEnrollmentData.slice(-3);
    if (timeRange === '6M') return studentEnrollmentData.slice(-6);
    return studentEnrollmentData;
  }, [timeRange]);

  // Derived Stats
  const selectedPeriodRevenue = filteredRevExpData.reduce((acc, curr) => acc + curr.revenue, 0);
  const selectedPeriodExpenses = filteredRevExpData.reduce((acc, curr) => acc + curr.expenses, 0);
  const netRevenue = selectedPeriodRevenue - selectedPeriodExpenses;
  const currentStudents = filteredStudentData[filteredStudentData.length - 1]?.students || 0;
  
  // Pipeline Stats from Context
  const totalPipelineValue = leads.reduce((acc, lead) => acc + (lead.value || 0), 0);
  const activeLeads = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Detailed Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Comprehensive insights across the BongoDemy ecosystem</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="appearance-none bg-[#1E2D40] border border-slate-700 hover:border-slate-600 text-white pl-4 pr-10 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-colors"
            >
              <option value="3M">Last 3 Months</option>
              <option value="6M">Last 6 Months</option>
              <option value="1Y">Last Year</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-white transition-colors" />
          </div>
          <button 
            onClick={() => addNotification({ type: 'success', message: `Exporting ${timeRange} report. The download will begin shortly.` })}
            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Net Revenue */}
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
               <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-slate-400 font-medium tracking-wide text-sm">Net P&L</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2 tracking-tight">
            ${netRevenue.toLocaleString()}
          </p>
          <div className="text-xs text-slate-500 font-medium">Based on selected <span className="text-white">{timeRange}</span> period</div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner">
               <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-slate-400 font-medium tracking-wide text-sm">Sales Pipeline</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2 tracking-tight">
            ${totalPipelineValue.toLocaleString()}
          </p>
          <div className="text-xs text-slate-500 font-medium">Across <span className="text-[#0ED7A8]">{activeLeads} active</span> deals</div>
        </div>

        {/* Education Impact */}
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-inner">
               <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-slate-400 font-medium tracking-wide text-sm">Students Enrolled</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2 tracking-tight">{currentStudents.toLocaleString()}</p>
          <div className="text-xs text-slate-500 font-medium">Total active learners</div>
        </div>

        {/* Social Impact */}
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors flex flex-col justify-center relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shadow-inner">
               <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-slate-400 font-medium tracking-wide text-sm">Victims Supported</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2 tracking-tight">100+</p>
          <div className="text-xs text-slate-500 font-medium">Across 15 districts</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Flow */}
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Financial Flow</h3>
              <p className="text-sm text-slate-400">Revenue vs Expenses over time</p>
            </div>
            <div className="bg-slate-800 p-2 rounded-lg flex items-center gap-4 text-xs font-medium">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#0ED7A8]"></div> Revenue</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-400"></div> Expenses</div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredRevExpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ED7A8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ED7A8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#0ED7A8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" activeDot={{ r: 6, fill: '#0ED7A8' }} />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" activeDot={{ r: 6, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Enrollment */}
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700 shadow-xl">
           <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Education Growth</h3>
              <p className="text-sm text-slate-400">Student enrollment trajectory</p>
            </div>
            <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-semibold">
               Active Learners
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredStudentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={4} dot={{ fill: '#1E2D40', strokeWidth: 2, stroke: '#3b82f6', r: 5 }} activeDot={{ r: 8, fill: '#3b82f6' }} name="Students Enrolled" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Social Impact Distribution */}
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-white mb-1">Impact Distribution</h3>
            <p className="text-sm text-slate-400">Victim cases resolved by category</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={victimCasesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {victimCasesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={caseColors[index % caseColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Activity Dummy */}
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700 shadow-xl">
           <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Delivery Velocity</h3>
              <p className="text-sm text-slate-400">Tasks closed vs reported blockers</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Week 1', tasks: 45, blockers: 5 },
                { name: 'Week 2', tasks: 52, blockers: 3 },
                { name: 'Week 3', tasks: 38, blockers: 8 },
                { name: 'Week 4', tasks: 65, blockers: 2 },
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.2}} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey="tasks" fill="#0ED7A8" name="Tasks Closed" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="blockers" fill="#f59e0b" name="Blockers Reported" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

