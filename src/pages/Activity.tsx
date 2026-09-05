import React, { useState } from 'react';
import { Activity as ActivityIcon, Clock, CheckCircle2, Trophy, Flame, TrendingUp, Calendar, User, Shield, Target, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const teamPerformance = [
  { id: 'EMP-001', name: 'Alice Security', role: 'Lead Pentester', dayHours: 8.5, weekHours: 42, monthHours: 168, tasksCompleted: 12, projectsCompleted: 2, impactScore: 98, avatar: 'A' },
  { id: 'EMP-002', name: 'Bob Developer', role: 'Senior Web Dev', dayHours: 7.2, weekHours: 38, monthHours: 152, tasksCompleted: 15, projectsCompleted: 1, impactScore: 92, avatar: 'B' },
  { id: 'INT-015', name: 'Charlie Intern', role: 'Security Analyst', dayHours: 6.0, weekHours: 30, monthHours: 120, tasksCompleted: 8, projectsCompleted: 0, impactScore: 75, avatar: 'C' },
  { id: 'PRJ-089', name: 'Dave Consultant', role: 'Cloud Architect', dayHours: 9.0, weekHours: 45, monthHours: 180, tasksCompleted: 5, projectsCompleted: 3, impactScore: 95, avatar: 'D' },
];

const activityFeed = [
  { id: 1, user: 'Alice Security', action: 'completed a high-priority task', target: 'Run vulnerability scan on main server', time: '2 hours ago', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 2, user: 'Bob Developer', action: 'checked in for the day', target: '', time: '4 hours ago', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 3, user: 'Dave Consultant', action: 'completed the project', target: 'Q2 Marketing Strategy', time: '1 day ago', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 4, user: 'Charlie Intern', action: 'logged 6 hours on', target: 'Security Audit Prep', time: '1 day ago', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 5, user: 'Alice Security', action: 'earned the "Bug Hunter" badge', target: '', time: '2 days ago', icon: Award, color: 'text-rose-400', bg: 'bg-rose-400/10' },
];

const weeklyHoursData = [
  { name: 'Mon', Alice: 8, Bob: 7.5, Charlie: 6, Dave: 9 },
  { name: 'Tue', Alice: 8.5, Bob: 8, Charlie: 6, Dave: 9 },
  { name: 'Wed', Alice: 9, Bob: 7, Charlie: 6, Dave: 8.5 },
  { name: 'Thu', Alice: 8, Bob: 8, Charlie: 6, Dave: 9.5 },
  { name: 'Fri', Alice: 8.5, Bob: 7.5, Charlie: 6, Dave: 9 },
];

const completedTasks = [
  { id: 1, title: 'Run vulnerability scan on main server', project: 'Web Application Pentest', assignee: 'Alice Security', completedAt: '2024-03-15 14:30', priority: 'high' },
  { id: 2, title: 'Review social media content calendar', project: 'Q2 Marketing Strategy', assignee: 'Charlie Intern', completedAt: '2024-03-14 16:45', priority: 'low' },
  { id: 3, title: 'Setup AWS IAM Roles', project: 'AWS Cloud Infrastructure', assignee: 'Dave Consultant', completedAt: '2024-03-12 11:20', priority: 'high' },
  { id: 4, title: 'Fix login page bug', project: 'Corporate Website Redesign', assignee: 'Bob Developer', completedAt: '2024-03-10 09:15', priority: 'medium' },
];

const completedProjects = [
  { id: 1, name: 'Q2 Marketing Strategy', client: 'BrandBoost', completedAt: '2024-03-14', team: ['I', 'J'], impact: 'High' },
  { id: 2, name: 'Legacy System Migration', client: 'FinServe LLC', completedAt: '2024-02-28', team: ['A', 'D'], impact: 'Critical' },
];

const productivityHoursData = [
  { name: 'Alice', worked: 42, target: 40 },
  { name: 'Bob', worked: 38, target: 40 },
  { name: 'Charlie', worked: 30, target: 30 },
  { name: 'Dave', worked: 45, target: 40 },
];

const taskCompletionRateData = [
  { week: 'Week 1', Alice: 90, Bob: 85, Charlie: 70, Dave: 95 },
  { week: 'Week 2', Alice: 95, Bob: 80, Charlie: 75, Dave: 92 },
  { week: 'Week 3', Alice: 88, Bob: 88, Charlie: 80, Dave: 96 },
  { week: 'Week 4', Alice: 92, Bob: 90, Charlie: 85, Dave: 98 },
];

export function Activity() {
  const [activeTab, setActiveTab] = useState('overview');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Activity & Performance</h1>
          <p className="text-slate-400 text-sm mt-1">Track working hours, completed tasks, and team impact.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-4 overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: ActivityIcon },
          { id: 'productivity', label: 'Productivity', icon: Target },
          { id: 'hours', label: 'Working Hours', icon: Clock },
          { id: 'tasks', label: 'Completed Tasks', icon: CheckCircle2 },
          { id: 'projects', label: 'Completed Projects', icon: Trophy },
          { id: 'audit', label: 'Audit Logs', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-[#1E2D40] text-white border border-slate-700/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamPerformance.map((member) => (
              <div key={member.id} className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group hover:border-[#0ED7A8]/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Flame className="w-24 h-24 text-[#0ED7A8]" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-[#1E2D40] flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{member.name}</h3>
                      <p className="text-xs text-slate-400">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Impact Score</span>
                      <span className="text-lg font-bold text-[#0ED7A8]">{member.impactScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Tasks Done</span>
                      <span className="text-sm font-medium text-white">{member.tasksCompleted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Week Hours</span>
                      <span className="text-sm font-medium text-white">{member.weekHours}h</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0ED7A8]" />
                Team Weekly Hours
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Alice" stroke="#0ED7A8" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Bob" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Charlie" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Dave" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-[#0ED7A8]" />
                Live Activity Feed
              </h3>
              <div className="space-y-6">
                {activityFeed.map((activity, index) => (
                  <div key={activity.id} className="relative">
                    {index !== activityFeed.length - 1 && (
                      <div className="absolute top-8 left-4 bottom-[-24px] w-px bg-slate-700/50"></div>
                    )}
                    <div className="flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.bg} ${activity.color} relative z-10`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">
                          <span className="font-medium text-white">{activity.user}</span> {activity.action}
                          {activity.target && <span className="font-medium text-white"> {activity.target}</span>}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'productivity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0ED7A8]" />
                Hours Worked vs Target
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityHoursData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      cursor={{ fill: '#334155', opacity: 0.4 }}
                    />
                    <Legend />
                    <Bar dataKey="worked" name="Hours Worked" fill="#0ED7A8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Target Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#3b82f6]" />
                Task Completion Rate (%)
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={taskCompletionRateData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Alice" stroke="#0ED7A8" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Bob" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Charlie" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Dave" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hours' && (
        <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400 bg-slate-800/30">
                  <th className="p-4 font-medium">Team Member</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium text-right">Today (Hrs)</th>
                  <th className="p-4 font-medium text-right">This Week (Hrs)</th>
                  <th className="p-4 font-medium text-right">This Month (Hrs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {teamPerformance.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-white">
                          {member.avatar}
                        </div>
                        <span className="font-medium text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{member.role}</td>
                    <td className="p-4 text-sm text-white text-right font-mono">{member.dayHours.toFixed(1)}</td>
                    <td className="p-4 text-sm text-white text-right font-mono">{member.weekHours.toFixed(1)}</td>
                    <td className="p-4 text-sm text-white text-right font-mono">{member.monthHours.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400 bg-slate-800/30">
                  <th className="p-4 font-medium">Task Title</th>
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Completed By</th>
                  <th className="p-4 font-medium">Priority</th>
                  <th className="p-4 font-medium text-right">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {completedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium text-white">{task.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{task.project}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-medium text-white">
                          {task.assignee.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-300">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400 text-right">{task.completedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400 bg-slate-800/30">
                  <th className="p-4 font-medium">Project Name</th>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Team</th>
                  <th className="p-4 font-medium">Impact</th>
                  <th className="p-4 font-medium text-right">Completed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {completedProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="font-medium text-white">{project.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{project.client}</td>
                    <td className="p-4">
                      <div className="flex -space-x-2">
                        {project.team.map((member, i) => (
                          <div 
                            key={i} 
                            className="w-6 h-6 rounded-full bg-slate-700 border-2 border-[#1E2D40] flex items-center justify-center text-[10px] font-medium text-white"
                          >
                            {member}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        project.impact === 'Critical' ? 'bg-rose-400/10 text-rose-400 border-rose-400/20' : 'bg-[#0ED7A8]/10 text-[#0ED7A8] border-[#0ED7A8]/20'
                      }`}>
                        {project.impact}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400 text-right">{project.completedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0ED7A8]" />
                System Audit Logs
              </h2>
              <p className="text-sm text-slate-400">Track changes to sensitive data and access.</p>
            </div>
            <button className="text-sm font-medium text-[#0ED7A8] hover:text-[#0ED7A8]/80 transition-colors">
              Export Log
            </button>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-sm text-slate-400">
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Resource</th>
                  <th className="p-4 font-medium text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                <tr className="hover:bg-slate-800/50 transition-colors">
                   <td className="p-4 text-slate-400">2026-05-15 18:45:12</td>
                   <td className="p-4"><span className="text-white font-medium">Md. Mudasser</span></td>
                   <td className="p-4"><span className="text-amber-400 font-medium bg-amber-400/10 px-2 py-1 rounded">MODIFIED</span></td>
                   <td className="p-4 text-slate-300">Settings - Access Control</td>
                   <td className="p-4 text-slate-400 text-right font-mono text-xs">192.168.1.42</td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                   <td className="p-4 text-slate-400">2026-05-15 14:20:05</td>
                   <td className="p-4"><span className="text-white font-medium">Alice Security</span></td>
                   <td className="p-4"><span className="text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded">ACCESSED</span></td>
                   <td className="p-4 text-slate-300">Victim Support Case #4201</td>
                   <td className="p-4 text-slate-400 text-right font-mono text-xs">10.0.0.15</td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                   <td className="p-4 text-slate-400">2026-05-14 09:12:33</td>
                   <td className="p-4"><span className="text-white font-medium">System Admin</span></td>
                   <td className="p-4"><span className="text-rose-400 font-medium bg-rose-400/10 px-2 py-1 rounded">DELETED</span></td>
                   <td className="p-4 text-slate-300">User Profile (EMP-012)</td>
                   <td className="p-4 text-slate-400 text-right font-mono text-xs">192.168.1.1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
