import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Shield, Target, Clock, CheckCircle2, Activity, FileText, Calendar, Box, Paperclip } from 'lucide-react';
import { Project } from '../data/initialData';

export function PublicClientPortal() {
  const { projectId } = useParams();
  const projects = useAppContext(s => s.projects);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (projectId && projects) {
      // Allow finding by actual numeric ID (for prototype purposes)
      // In a real app, this would be a secure token/UUID
      const found = projects.find(p => p.id.toString() === projectId || (p as any).magicToken === projectId);
      setProject(found || null);
    }
  }, [projectId, projects]);

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0B1221] flex flex-col items-center justify-center text-slate-400 p-6">
        <Shield className="w-16 h-16 text-rose-500 mb-6 opacity-80" />
        <h1 className="text-2xl font-bold text-white mb-2">Invalid or Expired Link</h1>
        <p className="text-center max-w-md">This project portal link is no longer active. Please contact your BongoDemy project manager for a new link.</p>
      </div>
    );
  }

  const completedTasks = (project.tasks || []).filter(t => t.status === 'Completed').length;
  const totalTasks = (project.tasks || []).length;
  const recentActivity = (project.activity || []).slice(0, 10);
  const attachments = project.attachments || [];

  return (
    <div className="min-h-screen bg-[#0B1221] text-slate-300 font-sans selection:bg-[#0ED7A8]/30">
      {/* Header */}
      <header className="bg-[#1E2D40] border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ED7A8] to-emerald-600 flex items-center justify-center shadow-lg shadow-[#0ED7A8]/20">
              <Box className="w-6 h-6 text-[#0B1221]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">BongoDemy</h1>
              <span className="text-xs font-medium text-[#0ED7A8] tracking-widest uppercase">Client Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-white">{project.client}</span>
              <span className="text-xs text-slate-400">Live Status Overview</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
              {project.client.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        
        {/* Project Title & Status Hero */}
        <div className="bg-slate-800/30 rounded-3xl border border-slate-700/50 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ED7A8]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {project.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                  project.health === 'On Track' ? 'text-emerald-400 bg-emerald-400/10' :
                  project.health === 'At Risk' ? 'text-amber-400 bg-amber-400/10' : 'text-rose-400 bg-rose-400/10'
                }`}>
                  <Activity className="w-3 h-3" />
                  {project.health || 'On Track'}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{project.name}</h2>
            </div>

            <div className="bg-[#1E2D40] rounded-2xl p-6 border border-slate-700/50 w-full md:w-64 flex-shrink-0 shadow-lg">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-slate-400">Progress</span>
                <span className="text-2xl font-bold text-white">{project.progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0ED7A8] to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Timeline & Activity */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-[#1E2D40]/50 rounded-2xl border border-slate-700/50 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">Recent Milestones & Activity</h3>
              </div>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-700 before:via-slate-700 before:to-transparent">
                {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                  <div key={activity.id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Timeline dot */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0B1221] bg-slate-800 text-slate-400 group-hover:text-[#0ED7A8] group-hover:bg-[#0ED7A8]/10 group-hover:border-[#0ED7A8]/30 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm transition-colors z-10">
                      {activity.type === 'milestone_completed' || activity.type === 'task_completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0ED7A8]" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    {/* Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-700/50 bg-[#1E2D40] shadow-sm group-hover:border-slate-600 transition-colors">
                      <div className="flex flex-col gap-1">
                        <time className="text-xs font-medium text-[#0ED7A8]">{activity.time}</time>
                        <p className="text-sm text-slate-300 font-medium">{activity.text.replace(/ \\(by .*?\\)/g, '')}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm ml-12">No recent activity logged yet.</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar: Tasks & Files */}
          <div className="space-y-8">
            <section className="bg-[#1E2D40]/50 rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" /> Task Overview
              </h3>
              
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-bold text-white">{completedTasks}</span>
                <span className="text-slate-400 mb-1">/ {totalTasks} tasks done</span>
              </div>
              
              <div className="space-y-3">
                {(project.tasks || []).slice(0, 6).map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
                    {task.status === 'Completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#0ED7A8] shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {task.title}
                      </span>
                    </div>
                  </div>
                ))}
                {totalTasks > 6 && (
                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-500 font-medium">+{totalTasks - 6} more tasks</span>
                  </div>
                )}
              </div>
            </section>

            {attachments.length > 0 && (
              <section className="bg-[#1E2D40]/50 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-amber-400" /> Latest Deliverables
                </h3>
                <div className="space-y-3">
                  {attachments.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{file.name}</p>
                        <p className="text-xs text-slate-500">{file.size} • {file.uploadDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
