import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  UserCheck,
  Heart,
  Globe,
  Code,
  BrainCircuit,
  AlertTriangle,
  Lightbulb,
  BarChart2,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  X,
} from 'lucide-react';

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  ComposedChart,
  Line
} from 'recharts';
import { useNavigate } from 'react-router-dom';

import { useAppContext } from '../context/AppContext';

const overviewData = [
  { name: 'Jan', revenue: 4000, pipeline: 2400, impact: 40 },
  { name: 'Feb', revenue: 3000, pipeline: 1398, impact: 30 },
  { name: 'Mar', revenue: 2000, pipeline: 9800, impact: 20 },
  { name: 'Apr', revenue: 2780, pipeline: 3908, impact: 27 },
  { name: 'May', revenue: 1890, pipeline: 4800, impact: 18 },
  { name: 'Jun', revenue: 2390, pipeline: 3800, impact: 23 },
  { name: 'Jul', revenue: 3490, pipeline: 4300, impact: 34 },
];

const impactPipelineData = [
  { stage: 'Volunteers', value: 1000, count: 15 },
  { stage: 'Victims Supported', value: 150, count: 8 },
  { stage: 'Students Trained', value: 400, count: 4 },
  { stage: 'Donations Raised', value: 300, count: 2 },
];

const getHealthIndicator = (health: string) => {
  switch (health) {
    case 'On Track': return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2 };
    case 'At Risk': return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: AlertTriangle };
    case 'Delayed': return { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', icon: Clock };
    case 'Off Track': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle };
    default: return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2 };
  }
};

export function Dashboard() {
  const { projects, currentUser, addNotification, activityLog, tasks } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Cybersecurity' | 'Education' | 'Impact' | 'Tech Products'>('Overview');
  
  const [isGeneratingStandup, setIsGeneratingStandup] = useState(false);
  const [standupText, setStandupText] = useState<string | null>(null);

  const handleAIGenerateStandup = async () => {
    setIsGeneratingStandup(true);
    addNotification({ type: 'info', message: 'AI is drafting your daily standup...' });
    
    try {
      const myActivity = activityLog.filter(a => a.actorId === currentUser?.id).slice(0, 5);
      const myTasks = tasks.filter(t => t.assignee === currentUser?.name).slice(0, 5);
      
      const response = await fetch('/api/generate-standup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser, activity: myActivity, tasks: myTasks })
      });
      
      if (!response.ok) throw new Error('Failed to generate standup');
      
      const { standupText } = await response.json();
      setStandupText(standupText);
      addNotification({ type: 'success', message: 'Daily standup drafted!' });
    } catch (error: any) {
      addNotification({ type: 'error', message: error.message || 'AI standup generation failed' });
    } finally {
      setIsGeneratingStandup(false);
    }
  };

  const recentProjects = projects.slice(0, 4);
  const overBudgetProjects = projects.filter(p => p.budget > 0 && p.spent / p.budget >= 0.9 && p.status !== 'Completed');

  const getStats = () => {
    switch (activeTab) {
       case 'Cybersecurity':
          return [
             { name: 'Active VAPTs', value: projects.filter(p => p.status === 'In Progress').length.toString(), change: '+3 this week', trend: 'up', icon: ShieldAlert },
             { name: 'Threat Alerts Validated', value: '142', change: '8 Critical', trend: 'down', icon: Target },
             { name: 'Consulting Hours', value: '89', change: '+22% vs last month', trend: 'up', icon: Briefcase },
             { name: 'Forensics Cases', value: '12', change: '2 closed this week', trend: 'up', icon: CheckSquare },
          ];
       case 'Education':
          return [
             { name: 'Students Trained', value: '250+', change: '+12% this month', trend: 'up', icon: Users },
             { name: 'Campus Ambassadors', value: '100+', change: '20+ Institutions', trend: 'up', icon: Target },
             { name: 'Active Courses', value: '4', change: 'New course added', trend: 'up', icon: Briefcase },
             { name: 'Webinars Held', value: '12', change: '+2 this month', trend: 'up', icon: Globe },
          ];
       case 'Impact':
          return [
             { name: 'Victims Supported', value: '100+', change: 'Free consulting provided', trend: 'up', icon: Heart },
             { name: 'Volunteers Active', value: '350', change: 'Across 3 tracks', trend: 'up', icon: Users },
             { name: 'BongoAid Funds', value: '$2,450', change: '+15% this month', trend: 'up', icon: Target },
             { name: 'Awareness Campaigns', value: '18', change: 'Reached 15k+ people', trend: 'up', icon: Globe },
          ];
       case 'Tech Products':
          return [
             { name: 'SafeNet BD Status', value: 'Beta', change: 'Expected launch Q3', trend: 'up', icon: Code },
             { name: 'Parental App Dev', value: '65%', change: 'Sprint 4 active', trend: 'up', icon: Code },
             { name: 'Alert Bot Users', value: '1.2k', change: '+120 this week', trend: 'up', icon: Users },
             { name: 'AutoParts Pro Installs', value: '45', change: 'Active subscriptions', trend: 'up', icon: Briefcase },
          ];
       default: // Overview
          return [
             { name: 'Total Revenue (MRR)', value: '$12.4k', change: '+15% this quarter', trend: 'up', icon: Target },
             { name: 'Active Projects', value: projects.length.toString(), change: 'Across all divisions', trend: 'up', icon: Briefcase },
             { name: 'Team Size', value: '47', change: 'Core + Interns + Freelance', trend: 'up', icon: Users },
             { name: 'Social Impact Score', value: '94/100', change: 'Steady growth', trend: 'up', icon: Heart },
          ];
    }
  }

  const roleStats = getStats();
  
  const getAiAnalysis = () => {
    const categories = Array.from(new Set(projects.map(p => p.category)));
    const stats = categories.map(cat => {
       const catProjects = projects.filter(p => p.category === cat);
       const delayed = catProjects.filter(p => p.health === 'Delayed' || p.health === 'Off Track').length;
       const risk = catProjects.filter(p => p.health === 'At Risk').length;
       const total = catProjects.length;
       return {
           category: cat,
           total,
           delayed,
           risk,
           score: (delayed * 2 + risk) / (total || 1)
       };
    });
    const bottlenecks = stats.filter(c => c.score > 0).sort((a, b) => b.score - a.score);
    return { bottlenecks, stats };
  };

  const { bottlenecks } = getAiAnalysis();
  const topBottleneck = bottlenecks.length > 0 ? bottlenecks[0] : null;
  
  const projectPerformanceData = projects
    .filter((p) => p.status !== 'Completed')
    .slice(0, 6)
    .map((p) => {
      const budgetUtilization = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
      
      const start = new Date(p.startDate).getTime();
      const end = new Date(p.deadline).getTime();
      const now = new Date().getTime();
      
      let deadlineAdherence = 100;
      if (end > start) {
         deadlineAdherence = Math.round(((now - start) / (end - start)) * 100);
         // if it's over 100, we're late, which is bad deadline adherence, but usually it's plotted as total time consumed
         if (deadlineAdherence < 0) deadlineAdherence = 0;
         if (deadlineAdherence > 150) deadlineAdherence = 150; 
      }

      return {
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        'Task Completion': p.progress || 0,
        'Budget Utilization': budgetUtilization,
        'Time Elapsed': deadlineAdherence
      };
    });

  const projectPerformanceSummaryData = projects
    .filter((p) => p.status !== 'Completed')
    .slice(0, 6)
    .map((p) => {
      return {
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        'Task Completion': p.progress || 0,
        'Allocated Budget': p.budget || 0,
        'Total Spent': p.spent || 0,
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              BongoDemy Command Center
              <button
                onClick={handleAIGenerateStandup}
                disabled={isGeneratingStandup}
                className={`ml-2 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border ${
                  isGeneratingStandup
                    ? 'text-purple-400 bg-purple-500/10 border-purple-500/20 opacity-70 cursor-not-allowed'
                    : 'text-purple-400 hover:text-white hover:bg-purple-500/10 border-purple-500/20'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingStandup ? 'animate-pulse' : ''}`} />
                AI Standup
              </button>
            </h1>
            <p className="text-sm text-[#0ED7A8] mt-1">The fortress of our digital future</p>
          </div>
        </div>

        {standupText && (
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl relative">
            <button 
              onClick={() => setStandupText(null)}
              className="absolute top-2 right-2 p-1 text-purple-400/50 hover:text-purple-400"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Your Daily Standup Summary
            </h3>
            <div className="whitespace-pre-wrap text-sm text-slate-300">
              {standupText}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between w-full flex-wrap gap-4">
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1 shadow-sm w-fit overflow-x-auto max-w-full">
            {['Overview', 'Cybersecurity', 'Education', 'Tech Products', 'Impact'].map((r) => (
              <button
                key={r}
                onClick={() => setActiveTab(r as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  activeTab === r 
                    ? 'bg-[#0ED7A8]/20 text-[#0ED7A8] border border-[#0ED7A8]/30 shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI AI Executive Summary */}
      {activeTab === 'Overview' && (
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <BrainCircuit className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">AI Executive Summary</h2>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">Live Analysis</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            <div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Overall project portfolio health is stable, but there are early indicators of resource constraints in specific divisions based on recent velocity metrics and delayed task distributions.
              </p>
              {topBottleneck ? (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex gap-4">
                  <div className="mt-0.5 rounded-full bg-rose-500/20 p-1.5 h-fit">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-rose-300 mb-1">Attention Required: {topBottleneck.category}</h4>
                    <p className="text-xs text-rose-200/70 mb-2">
                       This division has {topBottleneck.delayed} delayed {topBottleneck.delayed === 1 ? 'project' : 'projects'} and {topBottleneck.risk} at risk out of {topBottleneck.total} total active projects.
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/20 px-2 py-1 rounded">
                       <Lightbulb className="w-3.5 h-3.5" />
                       Consider reallocating {topBottleneck.category} resources from lower priority initiatives.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex gap-4">
                  <div className="mt-0.5 rounded-full bg-emerald-500/20 p-1.5 h-fit">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-300 mb-1">All Divisions Optimized</h4>
                    <p className="text-xs text-emerald-200/70">
                       No significant bottlenecks detected. Portfolio is executing smoothly.
                    </p>
                  </div>
                </div>
              )}
              {overBudgetProjects.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-4 mt-4">
                  <div className="mt-0.5 rounded-full bg-amber-500/20 p-1.5 h-fit">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-300 mb-1">Budget Threshold Exceeded</h4>
                    <p className="text-xs text-amber-200/70 mb-2">
                       {overBudgetProjects.length} {overBudgetProjects.length === 1 ? 'project is' : 'projects are'} approaching or exceeding allocated budget limits (≥90%).
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {overBudgetProjects.map(p => {
                         const health = getHealthIndicator(p.health || 'At Risk');
                         return (
                           <div key={p.id} className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded text-[10px] border border-slate-700/50 text-slate-300 hover:border-amber-400/50 cursor-pointer transition-colors" onClick={() => navigate('/projects')}>
                             <health.icon className={`w-3 h-3 ${health.color}`} />
                             <span className="truncate max-w-[120px]">{p.name}</span>
                             <span className="font-mono text-amber-400">{Math.round((p.spent/p.budget)*100)}%</span>
                           </div>
                         );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col justify-center">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Health Distribution</h4>
              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                     <span className="text-sm text-slate-300">On Track</span>
                   </div>
                   <span className="text-sm font-mono text-white">{projects.filter(p => p.health === 'On Track').length}</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                   <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${(projects.filter(p => p.health === 'On Track').length / Math.max(1, projects.length)) * 100}%` }}></div>
                 </div>
                 
                 <div className="flex items-center justify-between mt-1">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                     <span className="text-sm text-slate-300">At Risk</span>
                   </div>
                   <span className="text-sm font-mono text-white">{projects.filter(p => p.health === 'At Risk').length}</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                   <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(projects.filter(p => p.health === 'At Risk').length / Math.max(1, projects.length)) * 100}%` }}></div>
                 </div>
                 
                 <div className="flex items-center justify-between mt-1">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                     <span className="text-sm text-slate-300">Delayed</span>
                   </div>
                   <span className="text-sm font-mono text-white">{projects.filter(p => p.health === 'Delayed' || p.health === 'Off Track').length}</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                   <div className="bg-rose-400 h-1.5 rounded-full" style={{ width: `${(projects.filter(p => p.health === 'Delayed' || p.health === 'Off Track').length / Math.max(1, projects.length)) * 100}%` }}></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Brief for Overview */}
      {activeTab === 'Overview' && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-2xl border border-indigo-500/30">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-300">Grant & Funding</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-md">AWS Credits Included</span>
               </div>
               <div className="text-3xl font-bold text-white mb-1">$14,500</div>
               <div className="text-sm text-indigo-200/70">Pipeline: Pending UNDP Grant</div>
               <div className="mt-4 h-2 w-full bg-indigo-950 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: '40%' }}></div>
               </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#0ED7A8]/20 to-emerald-500/20 p-6 rounded-2xl border border-[#0ED7A8]/30">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#0ED7A8]">MRR (Commercial)</span>
                  <span className="flex items-center text-xs font-semibold text-emerald-400">
                     <ArrowUpRight className="w-3 h-3 mr-1" /> +15.2%
                  </span>
               </div>
               <div className="text-3xl font-bold text-white mb-1">$12,400</div>
               <div className="text-sm text-[#0ED7A8]/70">Annualized Run Rate: $148.8k</div>
               <div className="mt-4 flex items-center gap-1 text-xs text-emerald-400/80">
                  <TrendingUp className="w-4 h-4" /> Driven by VAPT services
               </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-6 rounded-2xl border border-amber-500/30">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-300">Community Metrics</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-amber-500/20 text-amber-300 rounded-md">Growing</span>
               </div>
               <div className="text-3xl font-bold text-white mb-1">100+</div>
               <div className="text-sm text-amber-200/70">Cyberbullying victims aided</div>
               <div className="mt-4 flex gap-2">
                  <div className="h-2 flex-1 bg-emerald-500/60 rounded-full" title="Victim Support"></div>
                  <div className="h-2 flex-[2] bg-indigo-500/60 rounded-full" title="Trained Students"></div>
               </div>
            </div>
         </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleStats.map((stat, i) => (
          <div key={i} className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-800/50 rounded-lg text-[#0ED7A8]">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Growth Metrics
            </h2>
            <select className="bg-slate-800/50 border border-slate-700 text-sm rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-[#0ED7A8]">
              <option>Last 7 months</option>
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ED7A8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ED7A8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E2D40', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#0ED7A8' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Commercial Revenue" stroke="#0ED7A8" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area yAxisId="right" type="monotone" dataKey="impact" name="Social Impact Metric" stroke="#fb7185" strokeWidth={2} fillOpacity={1} fill="url(#colorImpact)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Impact & Community</h2>
          </div>
          <div className="h-[200px] w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactPipelineData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={110} />
                <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#1E2D40', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {impactPipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#94a3b8', '#818cf8', '#34d399', '#0ED7A8'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
            <div>
              <div className="text-xs text-slate-400 mb-1">Campus Reps</div>
              <div className="text-lg font-semibold text-white">100+</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Partnerships</div>
              <div className="text-lg font-semibold text-white">DIU & AWS</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Project Performance Indicators */}
      <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Project Performance Indicators
          </h2>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} barGap={2} barSize={15}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E2D40', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ fontSize: '13px' }}
                cursor={{fill: '#334155', opacity: 0.4}}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
              <Bar dataKey="Task Completion" fill="#0ED7A8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Budget Utilization" fill="#818cf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Time Elapsed" fill="#fb7185" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Performance Summary */}
      <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            Project Performance Summary
          </h2>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={projectPerformanceSummaryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} barGap={2} barSize={25}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E2D40', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ fontSize: '13px' }}
                cursor={{fill: '#334155', opacity: 0.4}}
                formatter={(value, name) => {
                  if (name === 'Task Completion') return [`${value}%`, name];
                  return [`$${value.toLocaleString()}`, name];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
              <Bar yAxisId="left" dataKey="Allocated Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="Total Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="Task Completion" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Projects Row */}
      <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Active Operational Projects</h2>
          <button onClick={() => navigate('/projects')} className="text-sm text-[#0ED7A8] hover:text-[#0ED7A8]/80 font-medium">View All Matrix</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProjects.map((project) => (
            <div key={project.id} className="group bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-[#0ED7A8] transition-colors line-clamp-1">
                    {project.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{project.client}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{project.status}</span>
                <span className="text-xs font-medium text-white">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-emerald-400' : 'bg-[#0ED7A8]'}`} 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
