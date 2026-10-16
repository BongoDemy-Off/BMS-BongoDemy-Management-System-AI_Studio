import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, TrendingDown, ArrowRight, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function SmartNudges() {
  const tasks = useAppContext(s => s.tasks);
  const leads = useAppContext(s => s.leads);
  const projects = useAppContext(s => s.projects);
  const currentUser = useAppContext(s => s.currentUser);
  
  const navigate = useNavigate();

  const nudges = useMemo(() => {
    const alerts = [];

    // 1. Overdue Tasks (assigned to current user)
    const overdueTasks = tasks.filter(t => 
      t.assignee === currentUser?.name && 
      t.status !== 'Completed' && 
      new Date(t.dueDate) < new Date()
    );
    if (overdueTasks.length > 0) {
      alerts.push({
        id: 'overdue-tasks',
        type: 'warning',
        icon: Clock,
        title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
        description: `You have tasks past their deadline.`,
        actionText: 'Review Tasks',
        onAction: () => navigate('/tasks?filter=overdue'),
        color: 'text-rose-400',
        bg: 'bg-rose-400/10',
        border: 'border-rose-400/20'
      });
    }

    // 2. Stagnant Leads
    const stagnantLeads = leads.filter(l => 
      ['New', 'Contacted', 'Negotiation'].includes(l.stage) &&
      (new Date().getTime() - new Date(l.lastContact).getTime()) > 7 * 24 * 60 * 60 * 1000
    );
    if (stagnantLeads.length > 0) {
      alerts.push({
        id: 'stagnant-leads',
        type: 'alert',
        icon: TrendingDown,
        title: `${stagnantLeads.length} Stalled Lead${stagnantLeads.length > 1 ? 's' : ''}`,
        description: `High-value prospects haven't been contacted in 7+ days.`,
        actionText: 'Follow Up',
        onAction: () => navigate('/leads'),
        color: 'text-amber-400',
        bg: 'bg-amber-400/10',
        border: 'border-amber-400/20'
      });
    }

    // 3. Projects At Risk (Low progress, nearing deadline)
    const atRiskProjects = projects.filter(p => {
      if (p.status === 'Completed') return false;
      const daysLeft = (new Date(p.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return daysLeft < 7 && p.progress < 80;
    });
    if (atRiskProjects.length > 0) {
      alerts.push({
        id: 'at-risk-projects',
        type: 'critical',
        icon: AlertCircle,
        title: 'Project Deadline Risk',
        description: `${atRiskProjects[0].name} is due soon but only ${atRiskProjects[0].progress}% complete.`,
        actionText: 'View Project',
        onAction: () => navigate('/projects'),
        color: 'text-orange-400',
        bg: 'bg-orange-400/10',
        border: 'border-orange-400/20'
      });
    }

    // 4. Overdue Invoices
    const overdueInvoices: any[] = [];
    if (overdueInvoices.length > 0) {
      alerts.push({
        id: 'overdue-invoices',
        type: 'financial',
        icon: Zap,
        title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? 's' : ''}`,
        description: `Action needed to recover outstanding payments.`,
        actionText: 'Send Reminders',
        onAction: () => navigate('/finance'),
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        border: 'border-emerald-400/20'
      });
    }

    // If no negative alerts, give a positive one
    if (alerts.length === 0) {
      alerts.push({
        id: 'all-clear',
        type: 'success',
        icon: CheckCircle2,
        title: 'All Clear!',
        description: 'No urgent items require your attention right now.',
        actionText: 'View Activity',
        onAction: () => navigate('/tasks'),
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/20'
      });
    }

    return alerts.slice(0, 3); // Max 3 nudges at a time
  }, [tasks, leads, projects, currentUser, navigate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {nudges.map(nudge => (
        <div key={nudge.id} className={`p-4 rounded-2xl border ${nudge.border} ${nudge.bg} flex flex-col justify-between relative overflow-hidden group transition-all hover:-translate-y-0.5`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-white/5 ${nudge.color}`}>
              <nudge.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${nudge.color} mb-1`}>{nudge.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{nudge.description}</p>
            </div>
          </div>
          
          <button 
            onClick={nudge.onAction}
            className={`mt-4 flex items-center justify-between w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium ${nudge.color}`}
          >
            {nudge.actionText}
            <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      ))}
    </div>
  );
}
