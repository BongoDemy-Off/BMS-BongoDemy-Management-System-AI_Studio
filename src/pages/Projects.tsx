import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Search, Filter, MoreVertical, Shield, Globe, PenTool, BarChart, ChevronDown, X, Bell, Calendar, UserPlus, FileText, Download, Paperclip, DollarSign, CheckCircle2, AlertTriangle, Clock, XCircle, Mail, MessageCircle, Smartphone, Send, FolderOpen, Activity, Sparkles, CheckSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { mockApi } from '../services/mockApi';
import { Project } from '../data/initialData';
import { MindMap } from '../components/MindMap';
import { DebouncedInput, DebouncedTextarea } from '../components/DebouncedInputs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATUSES = ['Not Started', 'Planning', 'In Progress', 'Review', 'On Hold', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const getHealthIndicator = (health: string) => {
  switch (health) {
    case 'On Track': return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2 };
    case 'At Risk': return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: AlertTriangle };
    case 'Delayed': return { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', icon: Clock };
    case 'Off Track': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle };
    default: return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2 };
  }
};

const getRelativeDeadlineFormat = (deadline: string, status: string) => {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  
  // ignore time component for pure day calculation
  const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const timeDiff = deadlineDay.getTime() - nowDay.getTime();
  const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));
  
  if (status === 'Completed') {
    return { text: `Completed`, color: 'text-emerald-400' };
  }

  if (daysDiff < 0) {
    return { text: `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'}`, color: 'text-rose-400', overdue: true };
  } else if (daysDiff === 0) {
    return { text: `Due today`, color: 'text-amber-400' };
  } else {
    return { text: `Due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`, color: 'text-slate-400' };
  }
};

const calculateProjectHealth = (project: Project): string => {
  if (project.status === 'Completed') return 'On Track';
  if (project.status === 'On Hold') return project.health || 'On Track';

  let healthScore = 0; // 0 = On Track, 1 = At Risk, 2 = Delayed, 3 = Off Track

  // 1. Budget Utilization
  if (project.budget && project.budget > 0) {
    const budgetRatio = (project.spent || 0) / project.budget;
    if (budgetRatio > 1.05) healthScore = Math.max(healthScore, 3);
    else if (budgetRatio > 1.0) healthScore = Math.max(healthScore, 2);
    else if (budgetRatio > 0.9) healthScore = Math.max(healthScore, 1);
  }

  // 2. Schedule and Progress (Task Completion)
  if (project.startDate && project.deadline) {
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.deadline).getTime();
    const now = Date.now();
    const totalDuration = end - start;

    if (totalDuration > 0) {
      // End date has passed and project is not complete
      if (now > end && project.progress < 100) {
         healthScore = Math.max(healthScore, 3);
      } else {
         const elapsed = now - start;
         let timeRatio = elapsed / totalDuration;
         timeRatio = Math.max(0, Math.min(1, timeRatio));
         const progressRatio = (project.progress || 0) / 100;

         if (timeRatio - progressRatio > 0.4) {
             healthScore = Math.max(healthScore, 2);
         } else if (timeRatio - progressRatio > 0.2) {
             healthScore = Math.max(healthScore, 1);
         }
      }
    }
  }

  if (healthScore === 3) return 'Off Track';
  if (healthScore === 2) return 'Delayed';
  if (healthScore === 1) return 'At Risk';
  return 'On Track';
};

export function Projects() {
  const { clients, setClients, addNotification, projects, setProjects, tasks, setTasks, currentUser, teamMembers, setTeamMembers } = useAppContext();

  const [isAssessingRisk, setIsAssessingRisk] = useState(false);

  const handleAIAssessRisk = async (project: Project) => {
    setIsAssessingRisk(true);
    addNotification({ type: 'info', message: 'AI is analyzing project risk...' });
    
    try {
      const response = await fetch('/api/analyze-project-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, tasks: project.tasks })
      });
      
      if (!response.ok) throw new Error('Failed to analyze project risk');
      
      const { riskLevel, reasoning } = await response.json();
      
      // Update project health based on AI risk assessment
      let mappedHealth = project.health;
      if (riskLevel === 'High') mappedHealth = 'Off Track';
      else if (riskLevel === 'Medium') mappedHealth = 'Delayed';
      else if (riskLevel === 'Low') mappedHealth = 'On Track';
      
      const updatedProjects = projects.map(p => 
        p.id === project.id ? { ...p, health: mappedHealth, riskReasoning: reasoning } : p
      );
      
      setProjects(updatedProjects);
      if (selectedProject?.id === project.id) {
        setSelectedProject(prev => prev ? { ...prev, health: mappedHealth, riskReasoning: reasoning } : null);
      }
      mockApi.setCollection('projects', updatedProjects).catch(console.error);
      
      addNotification({ type: 'success', message: 'AI risk assessment complete.' });
    } catch (error: any) {
      addNotification({ type: 'error', message: error.message || 'AI risk assessment failed' });
    } finally {
      setIsAssessingRisk(false);
    }
  };

  useEffect(() => {
    let needsUpdate = false;
    const computedProjects = projects.map(p => {
      const autoHealth = calculateProjectHealth(p);
      if (p.health !== autoHealth) {
        needsUpdate = true;
        return { ...p, health: autoHealth };
      }
      return p;
    });

    if (needsUpdate) {
      setProjects(computedProjects);
      mockApi.setCollection('projects', computedProjects).catch(console.error);
    }
  }, [projects, setProjects]);

  const getMemberName = (m: any) => typeof m === 'string' ? m : m?.name || 'Unknown';
  const getMemberNames = (team: any[]) => team.map(getMemberName);

  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'kanban'>('kanban');
  const [expandedProjects, setExpandedProjects] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  
  const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
  const [draggedTask, setDraggedTask] = useState<{projectId: number, taskId: number} | null>(null);
  
  // Project details modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [bulkReassignTarget, setBulkReassignTarget] = useState("");
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [timeToLog, setTimeToLog] = useState('');
  const [timeLogDescription, setTimeLogDescription] = useState('');
  const [showLogTimeConfirm, setShowLogTimeConfirm] = useState(false);
  const [showRemediationDialog, setShowRemediationDialog] = useState(false);
  const [isGeneratingRemediation, setIsGeneratingRemediation] = useState(false);
  const [remediationPlan, setRemediationPlan] = useState('');
  const [showCostSavingDialog, setShowCostSavingDialog] = useState(false);
  const [isGeneratingCostSaving, setIsGeneratingCostSaving] = useState(false);
  const [costSavingPlan, setCostSavingPlan] = useState('');
  
  const [isUpdateHRModalOpen, setIsUpdateHRModalOpen] = useState(false);
  const [updateHROptionMember, setUpdateHROptionMember] = useState("");
  const [updateHRSkill, setUpdateHRSkill] = useState("");
  const [updateHRLevel, setUpdateHRLevel] = useState("Intermediate");
  const [expandedTeamMember, setExpandedTeamMember] = useState<string | null>(null);

  const logActivity = (projectId: number, actionType: string, actionText: string) => {
    const actor = currentUser?.email ? currentUser.email.split('@')[0] : 'User';
    const newActivity = {
      id: Date.now() + Math.random(),
      type: actionType,
      text: `${actionText} (by ${actor})`,
      time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, activity: [newActivity, ...(p.activity || [])] };
      }
      return p;
    }));
  };

  const confirmLogTime = () => {
    const mins = parseInt(timeToLog);
    if (!isNaN(mins) && mins > 0 && selectedProject) {
      const updatedProjects = projects.map(p => 
        p.id === selectedProject.id ? { ...p, timeSpent: (p.timeSpent || 0) + mins } : p
      );
      setProjects(updatedProjects);
      mockApi.setCollection('projects', updatedProjects).catch(console.error);
      
      const desc = timeLogDescription.trim() ? `Logged ${mins} mins: ${timeLogDescription.trim()}` : `Logged ${mins} mins`;
      logActivity(selectedProject.id, 'time_logged', desc);
      
      setTimeToLog('');
      setTimeLogDescription('');
      setShowLogTimeConfirm(false);
    }
  };

  const handleLogTime = () => {
    const mins = parseInt(timeToLog);
    if (!isNaN(mins) && mins > 0 && selectedProject) {
      setShowLogTimeConfirm(true);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find(p => p.id === selectedProject.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedProject)) {
        setSelectedProject(updated);
      }
    }
  }, [projects]);

  useEffect(() => {
    setSelectedTaskIds([]);
    setBulkReassignTarget("");
  }, [selectedProject?.id]);

  const [newResourceMember, setNewResourceMember] = useState("");
  const [newResourceRole, setNewResourceRole] = useState("Lead");
  const [newResourceCapacity, setNewResourceCapacity] = useState("100");
  const [newMilestone, setNewMilestone] = useState({ title: '', date: '' });
  
  // Add project modal state
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    category: 'Web Development',
    status: 'Not Started',
    health: 'On Track',
    priority: 'Medium',
    startDate: '',
    deadline: '',
    budget: 0,
    spent: 0,
    team: '',
    workflows: '',
    phases: '',
    instructions: '',
    guidelines: '',
    tools: '',
    notes: ''
  });
  const [notification, setNotification] = useState<string | null>(null);
  
  // Progress dragging state
  const [draggingProjectId, setDraggingProjectId] = useState<number | null>(null);
  const progressBarsRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  
  const [draggingTaskId, setDraggingTaskId] = useState<{projectId: number, taskId: number} | null>(null);
  const taskProgressBarsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const [dateDraggingState, setDateDraggingState] = useState<{
    projectId: number;
    taskId: number;
    edge: 'start' | 'end' | 'both';
    initialStartX: number;
    initialStartMs: number;
    initialEndMs: number;
  } | null>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = (projectId: number, newStatus: string) => {
    let updatedProjects = projects;
    let updatedClients = clients;
    
    setProjects(prevProjects => {
      updatedProjects = prevProjects.map(p => {
        if (p.id === projectId) {
          let newProgress = p.progress;
          let newLastActiveProgress = p.lastActiveProgress ?? p.progress;
          
          // Save the intermediate progress before changing to Completion/Not Started
          if (p.status !== 'Completed' && p.status !== 'Not Started') {
            newLastActiveProgress = p.progress;
          }

          // Auto-update progress based on certain statuses
          if (newStatus === 'Completed') {
            newProgress = 100;
          } else if (newStatus === 'Not Started') {
            newProgress = 0;
          } else if (p.tasks && p.tasks.length > 0) {
            // Auto-update progress based on task completion if available
            const totalProgress = p.tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
            newProgress = Math.round(totalProgress / p.tasks.length);
          } else if (p.status === 'Completed' || p.status === 'Not Started') {
            // Restore progress when moving from Completed/Not Started to an intermediate status
            if (newLastActiveProgress > 0 && newLastActiveProgress < 100) {
              newProgress = newLastActiveProgress;
            } else {
              // Fallback if there was no valid intermediate progress
               newProgress = newStatus === 'Planning' ? 10 : 50;
            }
          }
          
          if (p.status !== newStatus) {
            addNotification({
              message: `Project "${p.name}" status updated to ${newStatus}. Notifications sent to project owner and team.`,
              type: 'info'
            });
            setNotification(`Notification sent to project owner and team members via In-App/Email/WhatsApp: Project "${p.name}" changed to ${newStatus}.`);
            setTimeout(() => setNotification(null), 5000);

            if (p.client && p.client !== 'Internal') {
              setClients(prevClients => {
                updatedClients = prevClients.map(c => {
                  if (c.name === p.client) {
                    const newClientNotification = {
                      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                      type: 'project_update' as const,
                      title: `Project Status: ${newStatus}`,
                      message: `Your project "${p.name}" has been updated to ${newStatus} status.`,
                      date: new Date().toISOString(),
                      read: false
                    };
                    return {
                      ...c,
                      notifications: [newClientNotification, ...(c.notifications || [])]
                    };
                  }
                  return c;
                });
                mockApi.setCollection('clients', updatedClients).catch(console.error);
                return updatedClients;
              });
              addNotification({
                message: `Automated notification sent to client ${p.client} regarding status change.`,
                type: 'success'
              });
            }
          }
          
          return { ...p, status: newStatus, progress: newProgress, lastActiveProgress: newLastActiveProgress };
        }
        return p;
      });
      mockApi.setCollection('projects', updatedProjects).catch(console.error);
      return updatedProjects;
    });
    setOpenStatusDropdown(null);
  };

  const handleTaskDragStart = (e: React.DragEvent, projectId: number, taskId: number) => {
    setDraggedTask({projectId, taskId});
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent the dragged element from immediately snapping back
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleTaskDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    setDraggedTask(null);
  };

  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTaskDrop = (e: React.DragEvent, targetProjectId: number, targetTaskId: number) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.projectId !== targetProjectId) return;
    if (draggedTask.taskId === targetTaskId) return;

    let updatedProjects = projects;

    setProjects(prev => {
      updatedProjects = prev.map(p => {
        if (p.id === targetProjectId) {
          const newTasks = [...(p.tasks || [])];
          const draggedIdx = newTasks.findIndex(t => t.id === draggedTask.taskId);
          const targetIdx = newTasks.findIndex(t => t.id === targetTaskId);
          
          if (draggedIdx !== -1 && targetIdx !== -1) {
            const [movedTask] = newTasks.splice(draggedIdx, 1);
            newTasks.splice(targetIdx, 0, movedTask);
            return { ...p, tasks: newTasks };
          }
        }
        return p;
      });
      
      mockApi.setCollection('projects', updatedProjects).catch(console.error);
      
      if (selectedProject?.id === targetProjectId) {
        const p = updatedProjects.find(p => p.id === targetProjectId);
        if (p) setSelectedProject(p);
      }
      
      return updatedProjects;
    });

    setDraggedTask(null);
  };

  const generateTechnicalDocumentation = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Simulate AI generation delay
    addNotification({ type: 'info', message: 'Analyzing project documents to generate technical documentation...' });
    
    setTimeout(() => {
      const newAttachment = {
        id: Date.now(),
        name: `${project.name.replace(/\s+/g, '_')}_Tech_Doc_Draft.md`,
        size: '15 KB',
        uploadDate: new Date().toISOString().split('T')[0],
        type: 'text/markdown'
      };
      
      const updatedAttachments = [...(project.attachments || []), newAttachment];
      const updatedProjects = projects.map(p => p.id === projectId ? { ...p, attachments: updatedAttachments } : p);
      
      setProjects(updatedProjects);
      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...project, attachments: updatedAttachments });
      }
      mockApi.setCollection('projects', updatedProjects).catch(console.error);
      
      addNotification({ type: 'success', message: 'Technical documentation generated successfully!' });
    }, 2000);
  };

  const generateSummaryReport = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Simulate AI generation delay
    addNotification({ type: 'info', message: 'Generating summary report using AI...' });
    
    setTimeout(() => {
      const taskCount = (project.tasks || []).length;
      const completedTasks = (project.tasks || []).filter(t => t.status === 'Completed').length;
      const totalTime = project.timeLogged || '0h';
      const activityCount = (project.activity || []).length;
      
      const newAttachment = {
        id: Date.now(),
        name: `${project.name.replace(/\s+/g, '_')}_Summary_Report.txt`,
        size: '2 KB',
        uploadDate: new Date().toISOString().split('T')[0],
        type: 'text/plain'
      };
      
      const updatedAttachments = [...(project.attachments || []), newAttachment];
      const updatedProjects = projects.map(p => p.id === projectId ? { ...p, attachments: updatedAttachments } : p);
      
      setProjects(updatedProjects);
      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...project, attachments: updatedAttachments });
      }
      mockApi.setCollection('projects', updatedProjects).catch(console.error);
      
      addNotification({ type: 'success', message: 'Summary report generated and added to attachments!' });
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'In Progress': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'Review': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
      case 'On Hold': return 'bg-rose-400/10 text-rose-400 border-rose-400/20';
      case 'Planning': return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-rose-400/10 text-rose-400 border-rose-400/20';
      case 'Medium': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
      case 'Low': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const PROJECT_TEMPLATES: Record<string, Partial<typeof newProject>> = {
    vapt: {
      category: 'Cybersecurity',
      phases: 'Reconnaissance, Scanning, Vulnerability Assessment, Exploitation, Reporting',
      workflows: 'Client Onboarding, Weekly Scans, Final Report Generation',
      tools: 'Nmap, Nessus, Burp Suite, Metasploit',
      instructions: 'Follow standard OWASP Top 10 testing procedures. Ensure all findings are documented with steps to reproduce.',
      guidelines: 'Critical vulnerabilities must be reported immediately. All data must be handled securely.'
    },
    development: {
      category: 'Web Development',
      phases: 'Requirements, Design, Implementation, Testing, Deployment',
      workflows: 'Sprint Planning, Daily Standups, Code Review, CI/CD Pipeline',
      tools: 'VS Code, Git, Jira, Figma, Docker',
      instructions: 'Adhere to clean code principles. Ensure high test coverage and proper documentation.',
      guidelines: 'All code must pass CI pipelines before merging. Maintain strict version control.'
    },
    strategy: {
      category: 'Strategy & Insight',
      phases: 'Discovery, Market Research, Analysis, Strategy Formulation, Presentation',
      workflows: 'Stakeholder Interviews, Data Collection, Insight Synthesis',
      tools: 'Miro, Excel, PowerPoint, Google Analytics',
      instructions: 'Focus on actionable insights. Align strategy with business goals.',
      guidelines: 'Ensure data sources are verified. Presentations must be clear and concise.'
    }
  };

  const handleTemplateSelection = (templateKey: string) => {
    if (templateKey && PROJECT_TEMPLATES[templateKey]) {
      setNewProject(prev => ({ ...prev, ...PROJECT_TEMPLATES[templateKey] }));
      addNotification({ type: 'info', message: 'Project fields populated from template.'});
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    
    let initialProgress = 0;
    if (newProject.status === 'Completed') initialProgress = 100;
    else if (newProject.status === 'In Progress') initialProgress = 10;
    
    const teamArray = newProject.team.split(',').map(name => name.trim()).filter(Boolean);
    const workflowsArray = newProject.workflows ? newProject.workflows.split(',').map(name => name.trim()).filter(Boolean).map((title, i) => ({ id: i + 1, title, steps: []})) : [];
    const phasesArray = newProject.phases ? newProject.phases.split(',').map(name => name.trim()).filter(Boolean).map((name, i) => ({ id: i + 1, name, status: 'Pending'})) : [];
    const toolsArray = newProject.tools ? newProject.tools.split(',').map(name => name.trim()).filter(Boolean) : [];

    const projectToAdd = {
      id: newId,
      name: newProject.name,
      client: newProject.client || 'Internal',
      category: newProject.category,
      status: newProject.status,
      health: newProject.health,
      priority: newProject.priority,
      progress: initialProgress,
      lastActiveProgress: initialProgress > 0 && initialProgress < 100 ? initialProgress : 50,
      startDate: newProject.startDate || new Date().toISOString().split('T')[0],
      deadline: newProject.deadline || new Date().toISOString().split('T')[0],
      budget: newProject.budget || 0,
      spent: newProject.spent || 0,
      team: teamArray.length > 0 ? teamArray : ['Unassigned'],
      workflows: workflowsArray,
      phases: phasesArray,
      instructions: newProject.instructions,
      guidelines: newProject.guidelines,
      tools: toolsArray,
      notes: newProject.notes,
      milestones: [],
      tasks: [],
      attachments: [],
      icon: Globe, // Default icon
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    };

    setProjects([...projects, projectToAdd]);
    
    if (newProject.client && newProject.client !== 'Internal') {
      const selectedClient = clients.find(c => c.name === newProject.client);
      if (selectedClient) {
        const newDeal = {
          id: Math.max(...(selectedClient.deals?.map(d => d.id) || []), 0) + 1,
          name: newProject.name,
          value: `$${(newProject.budget || 0).toLocaleString()}`,
          stage: newProject.status,
          probability: initialProgress,
          startDate: newProject.startDate || new Date().toISOString().split('T')[0],
          deliveryDate: newProject.deadline || new Date().toISOString().split('T')[0],
          driveLink: '',
          phases: []
        };
        
        setClients(prevClients => prevClients.map(c => 
          c.id === selectedClient.id 
            ? { ...c, deals: [...(c.deals || []), newDeal], projects: (c.projects || 0) + 1 }
            : c
        ));
      }
    }
    
    setIsAddProjectModalOpen(false);
    
    setNotification(`Project "${projectToAdd.name}" created successfully.`);
    setTimeout(() => setNotification(null), 5000);
    
    setNewProject({
      name: '',
      client: '',
      category: 'Web Development',
      status: 'Not Started',
      health: 'On Track',
      priority: 'Medium',
      startDate: '',
      deadline: '',
      budget: 0,
      spent: 0,
      team: '',
      workflows: '',
      phases: '',
      instructions: '',
      guidelines: '',
      tools: '',
      notes: ''
    });
  };

  const handleUpdateBudget = (projectId: number, newBudget: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, budget: newBudget };
      }
      return p;
    }));
  };

  const handleUpdateSpent = (projectId: number, newSpent: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, spent: newSpent };
      }
      return p;
    }));
  };

  // Handle progress bar dragging
  const handleProgressMouseDown = (e: React.MouseEvent, projectId: number) => {
    e.preventDefault();
    setDraggingProjectId(projectId);
    updateProgress(e.clientX, projectId);
  };

  const handleTaskProgressMouseDown = (e: React.MouseEvent, projectId: number, taskId: number) => {
    e.preventDefault();
    setDraggingTaskId({projectId, taskId});
    updateTaskProgress(e.clientX, projectId, taskId);
  };

  const updateTaskProgress = (clientX: number, projectId: number, taskId: number) => {
    const bar = taskProgressBarsRef.current[`${projectId}-${taskId}`];
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);

    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === projectId) {
        const newTasks = (p.tasks || []).map(t => {
          if (t.id === taskId) {
            let newStatus = t.status || 'Not Started';
            if (percentage === 100) newStatus = 'Completed';
            else if (percentage === 0) newStatus = 'Not Started';
            else if (t.status === 'Completed' || t.status === 'Not Started') newStatus = 'In Progress';
            
            let newLastActiveProgress = t.lastActiveProgress ?? (t.progress || 0);
            if (percentage > 0 && percentage < 100) {
              newLastActiveProgress = percentage;
            }
            return { ...t, progress: percentage, status: newStatus, lastActiveProgress: newLastActiveProgress };
          }
          return t;
        });

        const totalProgress = newTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
        const newProjectProgress = newTasks.length > 0 ? Math.round(totalProgress / newTasks.length) : p.progress;

        let newProjectStatus = p.status;
        if (newProjectProgress === 100) newProjectStatus = 'Completed';
        else if (newProjectProgress === 0) newProjectStatus = 'Not Started';
        else if (p.status === 'Completed' || p.status === 'Not Started') newProjectStatus = 'In Progress';

        return { ...p, tasks: newTasks, progress: newProjectProgress, status: newProjectStatus };
      }
      return p;
    }));
  };

  const handleManualTaskProgressChange = (projectId: number, taskId: number, newProgress: number) => {
    const percentage = Math.max(0, Math.min(100, newProgress));
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === projectId) {
        const newTasks = (p.tasks || []).map(t => {
          if (t.id === taskId) {
            let newStatus = t.status || 'Not Started';
            if (percentage === 100) newStatus = 'Completed';
            else if (percentage === 0) newStatus = 'Not Started';
            else if (t.status === 'Completed' || t.status === 'Not Started') newStatus = 'In Progress';
            
            let newLastActiveProgress = t.lastActiveProgress ?? (t.progress || 0);
            if (percentage > 0 && percentage < 100) {
              newLastActiveProgress = percentage;
            }
            return { ...t, progress: percentage, status: newStatus, lastActiveProgress: newLastActiveProgress };
          }
          return t;
        });

        const totalProgress = newTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
        const newProjectProgress = newTasks.length > 0 ? Math.round(totalProgress / newTasks.length) : p.progress;

        let newProjectStatus = p.status;
        if (newProjectProgress === 100) newProjectStatus = 'Completed';
        else if (newProjectProgress === 0) newProjectStatus = 'Not Started';
        else if (p.status === 'Completed' || p.status === 'Not Started') newProjectStatus = 'In Progress';

        return { ...p, tasks: newTasks, progress: newProjectProgress, status: newProjectStatus };
      }
      return p;
    }));
  };

  const [newTaskSubtaskTitle, setNewTaskSubtaskTitle] = useState<{taskId: number, title: string} | null>(null);

  const handleToggleTaskSubtask = (projectId: number, taskId: number, subtaskId: number) => {
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === projectId) {
        const newTasks = (p.tasks || []).map(t => {
          if (t.id === taskId) {
            const newSubtasks = (t.subtasks || []).map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
            const newProgress = newSubtasks.length > 0 ? Math.round((newSubtasks.filter(s => s.completed).length / newSubtasks.length) * 100) : 0;
            let newStatus = t.status || 'Not Started';
            if (newProgress === 100) newStatus = 'Completed';
            else if (newProgress === 0) newStatus = 'Not Started';
            else if (t.status === 'Completed' || t.status === 'Not Started') newStatus = 'In Progress';
            
            let newLastActiveProgress = t.lastActiveProgress ?? (t.progress || 0);
            if (newProgress > 0 && newProgress < 100) {
                newLastActiveProgress = newProgress;
            }
            return { ...t, subtasks: newSubtasks, progress: newProgress, status: newStatus, lastActiveProgress: newLastActiveProgress };
          }
          return t;
        });

        const totalProgress = newTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
        const newProjectProgress = newTasks.length > 0 ? Math.round(totalProgress / newTasks.length) : p.progress;

        let newProjectStatus = p.status;
        if (newProjectProgress === 100) newProjectStatus = 'Completed';
        else if (newProjectProgress === 0) newProjectStatus = 'Not Started';
        else if (p.status === 'Completed' || p.status === 'Not Started') newProjectStatus = 'In Progress';

        return { ...p, tasks: newTasks, progress: newProjectProgress, status: newProjectStatus };
      }
      return p;
    }));
  };

  const handleAddTaskSubtask = (projectId: number, taskId: number, title: string) => {
    if (!title.trim()) return;
    const newSubtask = { id: Date.now() + Math.random(), title, completed: false };
    
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === projectId) {
        const newTasks = (p.tasks || []).map(t => {
          if (t.id === taskId) {
            const newSubtasks = [...(t.subtasks || []), newSubtask];
            const newProgress = newSubtasks.length > 0 ? Math.round((newSubtasks.filter(s => s.completed).length / newSubtasks.length) * 100) : 0;
            let newStatus = t.status || 'Not Started';
            if (newProgress === 100) newStatus = 'Completed';
            else if (newProgress === 0) newStatus = 'Not Started';
            else if (t.status === 'Completed' || t.status === 'Not Started') newStatus = 'In Progress';
            return { ...t, subtasks: newSubtasks, progress: newProgress, status: newStatus };
          }
          return t;
        });
        const totalProgress = newTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
        const newProjectProgress = newTasks.length > 0 ? Math.round(totalProgress / newTasks.length) : p.progress;
        let newProjectStatus = p.status;
        if (newProjectProgress === 100) newProjectStatus = 'Completed';
        else if (newProjectProgress === 0) newProjectStatus = 'Not Started';
        else if (p.status === 'Completed' || p.status === 'Not Started') newProjectStatus = 'In Progress';

        return { ...p, tasks: newTasks, progress: newProjectProgress, status: newProjectStatus };
      }
      return p;
    }));
  };

  const handleRemoveTaskSubtask = (projectId: number, taskId: number, subtaskId: number) => {
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === projectId) {
        const newTasks = (p.tasks || []).map(t => {
          if (t.id === taskId) {
            const newSubtasks = (t.subtasks || []).filter(s => s.id !== subtaskId);
            const newProgress = newSubtasks.length > 0 ? Math.round((newSubtasks.filter(s => s.completed).length / newSubtasks.length) * 100) : 0;
            let newStatus = t.status || 'Not Started';
            if (newProgress === 100) newStatus = 'Completed';
            else if (newProgress === 0) newStatus = 'Not Started';
            else if (t.status === 'Completed' || t.status === 'Not Started') newStatus = 'In Progress';
            return { ...t, subtasks: newSubtasks, progress: newProgress, status: newStatus };
          }
          return t;
        });

        const totalProgress = newTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
        const newProjectProgress = newTasks.length > 0 ? Math.round(totalProgress / newTasks.length) : p.progress;

        let newProjectStatus = p.status;
        if (newProjectProgress === 100) newProjectStatus = 'Completed';
        else if (newProjectProgress === 0) newProjectStatus = 'Not Started';
        else if (p.status === 'Completed' || p.status === 'Not Started') newProjectStatus = 'In Progress';

        return { ...p, tasks: newTasks, progress: newProjectProgress, status: newProjectStatus };
      }
      return p;
    }));
  };

  const handleTaskStatusChange = (projectId: number, taskId: number, newStatus: string) => {
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === projectId) {
        const newTasks = (p.tasks || []).map(t => {
          if (t.id === taskId) {
            let newProgress = t.progress || 0;
            let newLastActiveProgress = t.lastActiveProgress ?? newProgress;

            if (t.status !== 'Completed' && t.status !== 'Not Started') {
              newLastActiveProgress = newProgress;
            }

            if (newStatus === 'Completed') {
              newProgress = 100;
            } else if (newStatus === 'Not Started') {
              newProgress = 0;
            } else if (t.status === 'Completed' || t.status === 'Not Started') {
              if (newLastActiveProgress > 0 && newLastActiveProgress < 100) {
                newProgress = newLastActiveProgress;
              } else {
                newProgress = 50;
              }
            }

            return { ...t, status: newStatus, progress: newProgress, lastActiveProgress: newLastActiveProgress };
          }
          return t;
        });

        const totalProgress = newTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
        const newProjectProgress = newTasks.length > 0 ? Math.round(totalProgress / newTasks.length) : p.progress;

        let newProjectStatus = p.status;
        if (newProjectProgress === 100) newProjectStatus = 'Completed';
        else if (newProjectProgress === 0) newProjectStatus = 'Not Started';
        else if (p.status === 'Completed' || p.status === 'Not Started') newProjectStatus = 'In Progress';

        return { ...p, tasks: newTasks, progress: newProjectProgress, status: newProjectStatus };
      }
      return p;
    }));
  };

  const updateProgress = (clientX: number, projectId: number) => {
    const bar = progressBarsRef.current[projectId];
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        // Auto-update status based on progress
        let newStatus = p.status;
        if (percentage === 100) newStatus = 'Completed';
        else if (percentage === 0) newStatus = 'Not Started';
        else if (p.status === 'Completed' || p.status === 'Not Started') newStatus = 'In Progress';
        
        // Track the last intermediate progress state
        let newLastActiveProgress = p.lastActiveProgress ?? p.progress;
        if (percentage > 0 && percentage < 100) {
          newLastActiveProgress = percentage;
        }

        if (p.status !== newStatus) {
            addNotification({
              message: `Project "${p.name}" status auto-updated to ${newStatus} based on progress. Notifications sent to project owner and team.`,
              type: 'info'
            });
            setNotification(`Notification sent to project owner and team members via In-App/Email/WhatsApp: Project "${p.name}" changed to ${newStatus}.`);
            setTimeout(() => setNotification(null), 5000);

            if (p.client && p.client !== 'Internal') {
              setClients(prevClients => prevClients.map(c => {
                if (c.name === p.client) {
                  const newClientNotification = {
                    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    type: 'project_update' as const,
                    title: `Project Status: ${newStatus}`,
                    message: `Your project "${p.name}" has been updated to ${newStatus} status.`,
                    date: new Date().toISOString(),
                    read: false
                  };
                  return {
                    ...c,
                    notifications: [newClientNotification, ...(c.notifications || [])]
                  };
                }
                return c;
              }));
            }
        }

        return { ...p, progress: percentage, status: newStatus, lastActiveProgress: newLastActiveProgress };
      }
      return p;
    }));

    setSelectedProject(prev => {
        if (prev && prev.id === projectId) {
            let newStatus = prev.status;
            if (percentage === 100) newStatus = 'Completed';
            else if (percentage === 0) newStatus = 'Not Started';
            else if (prev.status === 'Completed' || prev.status === 'Not Started') newStatus = 'In Progress';
            let newLastActiveProgress = prev.lastActiveProgress ?? prev.progress;
            if (percentage > 0 && percentage < 100) newLastActiveProgress = percentage;
            return { ...prev, progress: percentage, status: newStatus, lastActiveProgress: newLastActiveProgress };
        }
        return prev;
    });
  };

  const handleManualProgressChange = (projectId: number, newProgress: number) => {
    const percentage = Math.max(0, Math.min(100, newProgress));

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        let newStatus = p.status;
        if (percentage === 100) newStatus = 'Completed';
        else if (percentage === 0) newStatus = 'Not Started';
        else if (p.status === 'Completed' || p.status === 'Not Started') newStatus = 'In Progress';
        
        let newLastActiveProgress = p.lastActiveProgress ?? p.progress;
        if (percentage > 0 && percentage < 100) {
          newLastActiveProgress = percentage;
        }

        if (p.status !== newStatus) {
            addNotification({
              message: `Project "${p.name}" status auto-updated to ${newStatus} based on progress. Notifications sent to project owner and team.`,
              type: 'info'
            });
            setNotification(`Notification sent to project owner and team members via In-App/Email/WhatsApp: Project "${p.name}" changed to ${newStatus}.`);
            setTimeout(() => setNotification(null), 5000);

            if (p.client && p.client !== 'Internal') {
              setClients(prevClients => prevClients.map(c => {
                if (c.name === p.client) {
                  const newClientNotification = {
                    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    type: 'project_update' as const,
                    title: `Project Status: ${newStatus}`,
                    message: `Your project "${p.name}" has been updated to ${newStatus} status.`,
                    date: new Date().toISOString(),
                    read: false
                  };
                  return {
                    ...c,
                    notifications: [newClientNotification, ...(c.notifications || [])]
                  };
                }
                return c;
              }));
            }
        }

        return { ...p, progress: percentage, status: newStatus, lastActiveProgress: newLastActiveProgress };
      }
      return p;
    }));

    setSelectedProject(prev => {
        if (prev && prev.id === projectId) {
            let newStatus = prev.status;
            if (percentage === 100) newStatus = 'Completed';
            else if (percentage === 0) newStatus = 'Not Started';
            else if (prev.status === 'Completed' || prev.status === 'Not Started') newStatus = 'In Progress';
            let newLastActiveProgress = prev.lastActiveProgress ?? prev.progress;
            if (percentage > 0 && percentage < 100) newLastActiveProgress = percentage;
            return { ...prev, progress: percentage, status: newStatus, lastActiveProgress: newLastActiveProgress };
        }
        return prev;
    });
  };



  const allAssignees = Array.from(new Set(projects.flatMap(p => p.team.map(t => typeof t === 'string' ? t : t.name)))).sort();
  const allCategories = Array.from(new Set(projects.map(p => p.category))).sort();

  const filteredProjects = projects
    .filter(p => statusFilter === 'All' || p.status === statusFilter)
    .filter(p => priorityFilter === 'All' || p.priority === priorityFilter)
    .filter(p => categoryFilter === 'All' || p.category === categoryFilter)
    .filter(p => assigneeFilter === 'All' || p.team.some(t => (typeof t === 'string' ? t : t.name) === assigneeFilter))
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.client.toLowerCase().includes(searchTerm.toLowerCase()));

  // Timeline (Gantt) Calculations
  const allDates = filteredProjects.flatMap(p => {
    const s = new Date(p.startDate).getTime();
    const e = new Date(p.deadline).getTime();
    return [isNaN(s) ? Date.now() : s, isNaN(e) ? Date.now() : e];
  });
  
  const minDateRaw = allDates.length > 0 ? Math.min(...allDates) : Date.now();
  const maxDateRaw = allDates.length > 0 ? Math.max(...allDates) : Date.now();
  
  const timelineStart = new Date(minDateRaw);
  timelineStart.setDate(1); // align to start of month
  timelineStart.setMonth(timelineStart.getMonth() - 1);
  const timelineEnd = new Date(maxDateRaw);
  timelineEnd.setDate(28); // aim for end of month roughly
  timelineEnd.setMonth(timelineEnd.getMonth() + 2);
  
  const totalTimelineDuration = timelineEnd.getTime() - timelineStart.getTime();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingProjectId !== null) {
        updateProgress(e.clientX, draggingProjectId);
      }
      if (draggingTaskId !== null) {
        updateTaskProgress(e.clientX, draggingTaskId.projectId, draggingTaskId.taskId);
      }
      
      if (dateDraggingState && timelineHeaderRef.current) {
        const rect = timelineHeaderRef.current.getBoundingClientRect();
        const pxPerMs = rect.width / totalTimelineDuration;
        
        const deltaX = e.clientX - dateDraggingState.initialStartX;
        const deltaMs = deltaX / pxPerMs;
        
        let newStartMs = dateDraggingState.initialStartMs;
        let newEndMs = dateDraggingState.initialEndMs;
        
        if (dateDraggingState.edge === 'start') {
          newStartMs = Math.min(dateDraggingState.initialStartMs + deltaMs, newEndMs - 86400000); // Max safe 1 day duration
        } else if (dateDraggingState.edge === 'end') {
          newEndMs = Math.max(dateDraggingState.initialEndMs + deltaMs, newStartMs + 86400000); 
        } else if (dateDraggingState.edge === 'both') {
          newStartMs = dateDraggingState.initialStartMs + deltaMs;
          newEndMs = dateDraggingState.initialEndMs + deltaMs;
        }

        const formatIsoStr = (ms: number) => {
           let d = new Date(ms);
           if (isNaN(d.getTime())) d = new Date();
           return d.toISOString().split('T')[0];
        };

        setProjects(prevProjects => prevProjects.map(p => {
          if (p.id === dateDraggingState.projectId) {
             const updatedTasks = p.tasks.map(t => {
               if (t.id === dateDraggingState.taskId) {
                 return {
                   ...t,
                   startDate: formatIsoStr(newStartMs),
                   deadline: formatIsoStr(newEndMs)
                 };
               }
               return t;
             });

             const taskStarts = updatedTasks.map(t => new Date(t.startDate).getTime()).filter(ms => !isNaN(ms));
             const taskEnds = updatedTasks.map(t => new Date(t.deadline).getTime()).filter(ms => !isNaN(ms));
             
             let newProjStart = p.startDate;
             let newProjEnd = p.deadline;
             
             if (taskStarts.length > 0) {
                const minTaskStart = Math.min(...taskStarts);
                const currProjStartMs = new Date(p.startDate).getTime();
                if (isNaN(currProjStartMs) || minTaskStart < currProjStartMs) {
                   newProjStart = formatIsoStr(minTaskStart);
                }
             }
             if (taskEnds.length > 0) {
                const maxTaskEnd = Math.max(...taskEnds);
                const currProjEndMs = new Date(p.deadline).getTime();
                if (isNaN(currProjEndMs) || maxTaskEnd > currProjEndMs) {
                   newProjEnd = formatIsoStr(maxTaskEnd);
                } else if (maxTaskEnd < currProjEndMs && p.tasks.length > 0) {
                   // If project end is much larger, but tasks are all finished earlier, re-adjust it closer so health behaves dynamically based on tasks.
                   newProjEnd = formatIsoStr(maxTaskEnd);
                }
             }

             return { ...p, tasks: updatedTasks, startDate: newProjStart, deadline: newProjEnd };
          }
          return p;
        }));
      }
    };

    const handleMouseUp = () => {
      setDraggingProjectId(null);
      setDraggingTaskId(null);
      if (dateDraggingState) {
         setDateDraggingState(null);
         setProjects(prev => {
            mockApi.setCollection('projects', prev).catch(console.error);
            return prev;
         });
      }
    };

    if (draggingProjectId !== null || draggingTaskId !== null || dateDraggingState !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingProjectId, draggingTaskId, dateDraggingState, totalTimelineDuration]);

  const getTimelineMonths = () => {
    const months = [];
    const current = new Date(timelineStart);
    while (current < timelineEnd) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const criticalProjectsCount = projects.filter(p => p.health === 'At Risk' || p.health === 'Off Track').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all active and past projects.</p>
        </div>
        <button 
          onClick={() => setIsAddProjectModalOpen(true)}
          className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        <div className="bg-[#1E2D40] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Allocated</p>
            <p className="text-xl font-bold text-white mt-1">${totalBudget.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <BarChart className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Spent</p>
            <p className="text-xl font-bold text-white mt-1">${totalSpent.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
             <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 rounded-xl p-4 relative overflow-hidden group">
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-800">
            <div 
              className={`h-full ${totalSpent / totalBudget > 0.9 ? 'bg-rose-500' : 'bg-[#0ED7A8]'}`} 
              style={{ width: `${Math.min(100, Math.max(0, (totalSpent / (totalBudget || 1)) * 100))}%` }} 
            />
          </div>
          <div className="w-full flex-col">
            <p className="text-sm text-slate-400 font-medium flex items-center justify-between w-full">
              Budget Utilization
              <span className={`text-xs px-2 py-0.5 rounded-full ${totalSpent / totalBudget > 0.9 ? 'bg-rose-500/10 text-rose-400' : 'bg-[#0ED7A8]/10 text-[#0ED7A8]'}`}>
                {Math.round((totalSpent / (totalBudget || 1)) * 100)}% Spent
              </span>
            </p>
            <p className="text-xl font-bold text-white mt-1">${totalRemaining.toLocaleString()} <span className="text-sm font-normal text-slate-400 font-medium">Remaining</span></p>
          </div>
        </div>
        <div className="bg-[#1E2D40] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">At Risk / Off Track</p>
            <p className="text-xl font-bold text-white mt-1">{criticalProjectsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <DebouncedInput 
            type="text" 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1E2D40] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-400 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
          <div className="relative shrink-0">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1E2D40] border border-slate-700 text-slate-300 pl-9 pr-7 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] appearance-none"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#1E2D40] border border-slate-700 text-slate-300 pl-3 pr-7 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] appearance-none"
            >
              <option value="All">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative shrink-0">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#1E2D40] border border-slate-700 text-slate-300 pl-3 pr-7 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] appearance-none"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative shrink-0">
            <UserPlus className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-[#1E2D40] border border-slate-700 text-slate-300 pl-9 pr-7 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] appearance-none"
            >
              <option value="All">All Assignees</option>
              {allAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex bg-[#1E2D40] border border-slate-700 rounded-lg overflow-hidden shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-l border-slate-700 ${viewMode === 'kanban' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              Kanban
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-l border-slate-700 ${viewMode === 'timeline' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
          <div key={project.id} className="bg-[#1E2D40] p-6 rounded-2xl border border-slate-700/50 hover:border-[#0ED7A8]/50 transition-colors group cursor-pointer" onClick={(e) => {
            // Prevent opening modal if clicking on certain interactive elements
            if ((e.target as HTMLElement).closest('.relative') || (e.target as HTMLElement).closest('.group\\/progress')) return;
            setSelectedProject(project);
          }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${project.bg} ${project.color}`}>
                <project.icon className="w-6 h-6" />
              </div>
              <button onClick={(e) => { e.stopPropagation(); addNotification({ type: 'info', message: 'Context menu coming soon' }); }} className="text-slate-400 hover:text-white p-1">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white group-hover:text-[#0ED7A8] transition-colors line-clamp-1">
                {project.name}
              </h3>
              <div className="flex items-center justify-between mt-1 text-sm">
                <p className="text-slate-400">{project.client}</p>
                {(() => {
                  const deadlineFormat = getRelativeDeadlineFormat(project.deadline, project.status);
                  if (!deadlineFormat) return null;
                  return (
                    <span className={`text-xs font-medium flex items-center gap-1.5 ${deadlineFormat.color}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {deadlineFormat.text}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                {project.category}
              </span>
              
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                {project.priority} Priority
              </span>

              {(() => {
                const health = getHealthIndicator(project.health || 'On Track');
                const HealthIcon = health.icon;
                return (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${health.bg} ${health.color} ${health.border}`}>
                    <HealthIcon className="w-3.5 h-3.5" />
                    {project.health || 'On Track'}
                  </span>
                );
              })()}
              
              <div className="relative">
                <button 
                  onClick={() => setOpenStatusDropdown(openStatusDropdown === project.id ? null : project.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 transition-colors hover:opacity-80 ${getStatusColor(project.status)}`}
                >
                  {project.status}
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {openStatusDropdown === project.id && (
                  <div className="absolute top-full left-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
                    {STATUSES.map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(project.id, status)}
                        className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-700 transition-colors ${
                          project.status === status ? 'text-[#0ED7A8] bg-slate-700/50' : 'text-slate-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Allocated Budget</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <span className="text-slate-400 text-xs">${(project.spent || 0).toLocaleString()} spent</span>
                  <span>/</span>
                  <span>${(project.budget || 0).toLocaleString()}</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4 relative overflow-hidden">
                <div 
                  className={`absolute inset-y-0 left-0 rounded-full ${((project.spent || 0) / (project.budget || 1)) > 0.9 ? 'bg-rose-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, Math.max(0, ((project.spent || 0) / (project.budget || 1)) * 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-white font-medium">{project.progress}%</span>
              </div>
              <div 
                className="w-full bg-slate-800 rounded-full h-2 cursor-pointer relative group/progress py-2 -my-2"
                onMouseDown={(e) => handleProgressMouseDown(e, project.id)}
                ref={el => progressBarsRef.current[project.id] = el}
              >
                <div className="absolute inset-y-2 left-0 right-0 bg-slate-800 rounded-full pointer-events-none"></div>
                <div 
                  className={`absolute inset-y-2 left-0 rounded-full pointer-events-none ${
                    draggingProjectId === project.id ? 'transition-none' : 'transition-all duration-300'
                  } ${
                    project.progress === 100 ? 'bg-emerald-400' : 'bg-[#0ED7A8]'
                  }`}
                  style={{ width: `${project.progress}%` }}
                >
                  {/* Drag handle */}
                  <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 ${draggingProjectId === project.id ? 'opacity-100 scale-125' : ''} transition-all`}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div className="flex -space-x-2">
                {project.team.map((memberRaw, i) => {
                  const member = getMemberName(memberRaw);
                  return (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#1E2D40] flex items-center justify-center text-xs font-medium text-white"
                    title={member}
                  >
                    {member.substring(0, 1).toUpperCase()}
                  </div>
                )})}
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${
                new Date(project.deadline) < new Date() && project.status !== 'Completed'
                  ? 'bg-rose-400/10 text-rose-400 border-rose-400/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700'
              }`}>
                <Calendar className={`w-3.5 h-3.5 ${
                  new Date(project.deadline) < new Date() && project.status !== 'Completed'
                    ? 'text-rose-400'
                    : 'text-[#0ED7A8]'
                }`} />
                Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        ))}
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar snap-x snap-mandatory">
          {STATUSES.map(status => {
            const statusProjects = filteredProjects.filter(p => p.status === status);
            return (
              <div key={status} className="bg-[#1E2D40]/50 rounded-2xl border border-slate-700/50 flex-shrink-0 w-[320px] snap-center flex flex-col max-h-[calc(100vh-200px)]">
                <div className="p-4 border-b border-slate-700/50 flex items-center justify-between sticky top-0 bg-[#1E2D40] rounded-t-2xl z-10 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: 
                          status === 'Completed' ? '#34d399' : 
                          status === 'In Progress' ? '#0ED7A8' : 
                          status === 'Review' ? '#f59e0b' : 
                          status === 'On Hold' ? '#ef4444' : 
                          status === 'Planning' ? '#818cf8' : '#94a3b8'
                      }}
                    />
                    <h3 className="font-semibold text-white whitespace-nowrap">{status}</h3>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full font-medium shadow-inner">
                    {statusProjects.length}
                  </span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-[150px]">
                  {statusProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 border-2 border-dashed border-slate-700/50 rounded-xl opacity-50">
                      <p className="text-sm text-slate-400">No projects</p>
                    </div>
                  ) : (
                    statusProjects.map(project => (
                      <div 
                        key={project.id} 
                        className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 hover:border-[#0ED7A8]/50 transition-all cursor-pointer group"
                        onClick={() => setSelectedProject(project)}
                      >
                       <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-semibold text-white text-sm line-clamp-2 leading-snug">{project.name}</h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 border ${
                            project.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            project.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {project.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                           <FolderOpen className="w-3.5 h-3.5" />
                           <span className="truncate">{project.category}</span>
                        </div>
                        
                        <div className="space-y-1.5 mb-3">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Progress</span>
                            <span className="text-[#0ED7A8] font-medium">{project.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(14,215,168,0.4)] ${
                                project.status === 'Completed' ? 'bg-emerald-400' : 'bg-[#0ED7A8]'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 mt-1">
                          <div className="flex -space-x-1.5">
                            {project.team.slice(0, 3).map((memberRaw, i) => {
                              const member = getMemberName(memberRaw);
                              return (
                              <div 
                                key={i} 
                                className="w-6 h-6 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-[10px] font-medium text-white shadow-sm"
                                title={member}
                              >
                                {member.charAt(0).toUpperCase()}
                              </div>
                            )})}
                            {project.team.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-medium text-slate-300">
                                   +{project.team.length - 3}
                                </div>
                            )}
                          </div>
                          
                          <div className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            new Date(project.deadline) < new Date() && project.status !== 'Completed'
                              ? 'text-rose-400 bg-rose-400/10'
                              : 'text-slate-400 bg-slate-800'
                          }`}>
                             <Calendar className="w-3 h-3" />
                             {new Date(project.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden overflow-x-auto min-h-[400px]">
          <div className="min-w-[800px]">
            {/* Timeline Header */}
            <div className="flex border-b border-slate-700/50">
              <div className="w-64 flex-shrink-0 p-4 border-r border-slate-700/50 bg-slate-800/50 flex items-center font-semibold text-slate-300">
                Project Name
              </div>
              <div className="flex-1 relative h-14 bg-slate-800/30 flex" ref={timelineHeaderRef}>
                {getTimelineMonths().map((month, i) => {
                  const percentLeft = ((month.getTime() - timelineStart.getTime()) / totalTimelineDuration) * 100;
                  const monthEnd = new Date(month);
                  monthEnd.setMonth(monthEnd.getMonth() + 1);
                  const percentWidth = ((monthEnd.getTime() - month.getTime()) / totalTimelineDuration) * 100;
                  
                  return (
                    <div 
                      key={i} 
                      className="absolute top-0 bottom-0 border-r border-slate-700/50 flex flex-col items-center justify-center text-xs text-slate-400 font-medium"
                      style={{ left: `${percentLeft}%`, width: `${percentWidth}%` }}
                    >
                      <span>{month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Timeline Body */}
            <div>
              {filteredProjects.map((project, index) => {
                const s = new Date(project.startDate).getTime();
                const e = new Date(project.deadline).getTime();
                const safeS = isNaN(s) ? Date.now() : s;
                const safeE = isNaN(e) ? Math.max(Date.now(), safeS + 86400000) : Math.max(e, safeS + 86400000); // ensure at least 1 day duration
                
                const percentLeft = Math.max(0, ((safeS - timelineStart.getTime()) / totalTimelineDuration) * 100);
                const percentWidth = Math.min(100 - percentLeft, ((safeE - safeS) / totalTimelineDuration) * 100);
                
                const isExpanded = expandedProjects.includes(project.id);
                return (
                  <React.Fragment key={project.id}>
                    <div className="flex border-b border-slate-700/50 group hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setSelectedProject(project)}>
                      <div className="w-64 flex-shrink-0 p-4 border-r border-slate-700/50 flex flex-col justify-center gap-1 bg-slate-800/10 relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedProjects(prev => isExpanded ? prev.filter(id => id !== project.id) : [...prev, project.id]);
                          }}
                          className={`absolute left-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        >
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                        <div className="flex items-center gap-2 pl-4">
                           <div className={`p-1.5 rounded-md ${project.bg} ${project.color} flex-shrink-0`}>
                             <project.icon className="w-4 h-4" />
                           </div>
                           <h4 className="text-sm font-medium text-slate-200 truncate" title={project.name}>{project.name}</h4>
                        </div>
                        <div className="flex items-center justify-between mt-1 pl-4 gap-2">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className={`text-[10px] w-fit px-1.5 py-0.5 rounded border ${getStatusColor(project.status).split('text-')[0]} text-slate-300`} title={project.status}>
                              <span className="truncate max-w-[60px] inline-block align-bottom">{project.status}</span>
                            </span>
                            {(() => {
                              const health = getHealthIndicator(project.health || 'On Track');
                              const HealthIcon = health.icon;
                              return (
                                <span className={`text-[10px] w-fit px-1.5 py-0.5 rounded border flex items-center gap-1 flex-shrink-0 ${health.bg} ${health.color} ${health.border}`} title={`Health: ${project.health}`}>
                                  <HealthIcon className="w-3 h-3" />
                                  <span className="hidden sm:inline">{project.health || 'On Track'}</span>
                                </span>
                              );
                            })()}
                          </div>
                          <div className="flex -space-x-1.5 flex-shrink-0">
                            {project.team.map((memberRaw, i) => {
                              const member = getMemberName(memberRaw);
                              return (
                              <div key={i} className="w-5 h-5 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-[8px] font-medium text-white" title={member}>
                                {member.substring(0, 1).toUpperCase()}
                              </div>
                            )})}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 relative py-4 bg-slate-800/5">
                        {/* Grid Lines */}
                        {getTimelineMonths().map((month, i) => {
                          const mLeft = ((month.getTime() - timelineStart.getTime()) / totalTimelineDuration) * 100;
                          return (
                            <div key={`grid-${i}`} className="absolute top-0 bottom-0 border-l border-slate-700/30 pointer-events-none" style={{ left: `${mLeft}%` }} />
                          );
                        })}
                        
                        {/* Gantt Bar */}
                        <div 
                          className={`absolute top-4 bottom-4 rounded-md border shadow-lg overflow-hidden group-hover:brightness-110 transition-all cursor-pointer ${project.bg} ${project.color.replace('text-', 'border-').replace('-400', '-500/50')}`}
                          style={{ left: `${percentLeft}%`, width: `${percentWidth}%` }}
                          onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}
                          title={`${project.name}\n${project.startDate} to ${project.deadline}\nTeam: ${project.team.length > 0 ? getMemberNames(project.team).join(', ') : 'Unassigned'}\nProgress: ${project.progress}%`}
                        >
                           <div className="absolute inset-y-0 left-0 bg-white/20" style={{ width: `${project.progress}%` }} />
                           <div className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-white whitespace-nowrap overflow-hidden text-shadow-sm pointer-events-none">
                             {project.progress}% 
                           </div>
                        </div>
                        
                        {/* Milestones */}
                        {(project.milestones || []).map(milestone => {
                          const mTime = new Date(milestone.date).getTime();
                          if (isNaN(mTime)) return null;
                          const mLeft = ((mTime - timelineStart.getTime()) / totalTimelineDuration) * 100;
                          const isCompleted = mTime <= Date.now();
                          return (
                            <div 
                              key={milestone.id}
                              className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 border border-slate-900 shadow-md transform -translate-x-1/2 z-10 cursor-pointer ${isCompleted ? 'bg-[#0ED7A8]' : 'bg-amber-400'}`}
                              style={{ left: `${mLeft}%` }}
                              title={`Milestone: ${milestone.title}\nDate: ${milestone.date}`}
                              onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    {isExpanded && project.tasks && (
                      <div className="relative">
                        {project.tasks.map((task, taskIndex) => {
                          const ts = new Date(task.startDate).getTime();
                          const te = new Date(task.deadline).getTime();
                          const safeTs = isNaN(ts) ? safeS : ts;
                          const safeTe = isNaN(te) ? Math.max(Date.now(), safeTs + 86400000) : te;
                          const tPercentLeft = Math.max(0, ((safeTs - timelineStart.getTime()) / totalTimelineDuration) * 100);
                          const tPercentWidth = Math.min(100 - tPercentLeft, ((safeTe - safeTs) / totalTimelineDuration) * 100);
                          
                          return (
                            <div 
                              key={`task-${task.id}`} 
                              className={`flex border-b border-slate-700/30 group/task hover:bg-slate-800/20 transition-colors ${draggedTask?.taskId === task.id ? 'opacity-50' : ''}`}
                              draggable
                              onDragStart={(e) => handleTaskDragStart(e, project.id, task.id)}
                              onDragEnd={handleTaskDragEnd}
                              onDragOver={handleTaskDragOver}
                              onDrop={(e) => handleTaskDrop(e, project.id, task.id)}
                            >
                              <div className="w-64 flex-shrink-0 p-3 border-r border-slate-700/50 pl-10 bg-slate-800/5 cursor-grab active:cursor-grabbing">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0"></span>
                                  <h5 className="text-xs font-medium text-slate-300 truncate" title={task.title}>{task.title}</h5>
                                </div>
                                <div className="flex items-center justify-between mt-1 pl-3.5">
                                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <UserPlus className="w-3 h-3" />
                                    {task.assignee}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">{task.progress}%</span>
                                </div>
                              </div>
                              <div className="flex-1 relative py-3 bg-slate-800/10">
                                {/* Grid Lines */}
                                {getTimelineMonths().map((month, i) => {
                                  const mLeft = ((month.getTime() - timelineStart.getTime()) / totalTimelineDuration) * 100;
                                  return (
                                    <div key={`task-grid-${i}`} className="absolute top-0 bottom-0 border-l border-slate-700/30 pointer-events-none opacity-50" style={{ left: `${mLeft}%` }} />
                                  );
                                })}
                                
                                {/* Task Bar */}
                                <div 
                                  className={`absolute top-3 bottom-3 rounded flex flex-col justify-center bg-slate-700 border border-slate-600 overflow-visible group-hover/task:brightness-110 transition-all z-10 ${dateDraggingState?.taskId === task.id ? 'transition-none cursor-grabbing' : 'cursor-grab'}`}
                                  style={{ left: `${tPercentLeft}%`, width: `${tPercentWidth}%` }}
                                  title={`${task.title}\n${task.startDate} to ${task.deadline}\nAssignee: ${task.assignee}\nProgress: ${task.progress}%`}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDateDraggingState({
                                      projectId: project.id,
                                      taskId: task.id,
                                      edge: 'both',
                                      initialStartX: e.clientX,
                                      initialStartMs: safeTs,
                                      initialEndMs: safeTe
                                    });
                                  }}
                                >
                                  <div className="absolute inset-y-0 left-0 bg-[#0ED7A8]/30 pointer-events-none rounded" style={{ width: `${task.progress}%`, maxWidth: '100%' }} />
                                  
                                  {/* Left Handle */}
                                  <div 
                                    className="absolute top-0 bottom-0 left-0 w-2 cursor-col-resize hover:bg-white/20 transition-colors z-20 rounded-l"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDateDraggingState({
                                        projectId: project.id,
                                        taskId: task.id,
                                        edge: 'start',
                                        initialStartX: e.clientX,
                                        initialStartMs: safeTs,
                                        initialEndMs: safeTe
                                      });
                                    }}
                                  />
                                  
                                  {/* Right Handle */}
                                  <div 
                                    className="absolute top-0 bottom-0 right-0 w-2 cursor-col-resize hover:bg-white/20 transition-colors z-20 rounded-r"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDateDraggingState({
                                        projectId: project.id,
                                        taskId: task.id,
                                        edge: 'end',
                                        initialStartX: e.clientX,
                                        initialStartMs: safeTs,
                                        initialEndMs: safeTe
                                      });
                                    }}
                                  />
                                </div>
                                
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Dependency SVG Layer */}
                        <svg className="absolute inset-0 pointer-events-none" style={{ left: '16rem', width: 'calc(100% - 16rem)', height: '100%', zIndex: 5, overflow: 'visible' }}>
                          <defs>
                            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                              <polygon points="0 0, 6 3, 0 6" fill="#94a3b8" />
                            </marker>
                          </defs>
                          {project.tasks.map((task, taskIndex) => {
                            if (!task.dependencies || task.dependencies.length === 0) return null;
                            
                            const ts = new Date(task.startDate).getTime();
                            const safeTs = isNaN(ts) ? safeS : ts;
                            const tPercentLeft = Math.max(0, ((safeTs - timelineStart.getTime()) / totalTimelineDuration) * 100);
                            
                            return task.dependencies.map(depId => {
                              const depTaskIndex = project.tasks.findIndex(t => t.id === depId);
                              if (depTaskIndex === -1) return null;
                              
                              const depTask = project.tasks[depTaskIndex];
                              const dtE = new Date(depTask.deadline).getTime();
                              const safeDtE = isNaN(dtE) ? safeS : dtE;
                              const dtPercentLeft = Math.max(0, ((safeDtE - timelineStart.getTime()) / totalTimelineDuration) * 100);
                              
                              // Approximate row height based on padding and content (py-3 = 24px + 34px content = ~58px)
                              // We use 57 pixels per row average.
                              const rowHeight = 57; 
                              const yFrom = depTaskIndex * rowHeight + (rowHeight / 2);
                              const yTo = taskIndex * rowHeight + (rowHeight / 2);
                              
                              const midPercent = (dtPercentLeft + tPercentLeft) / 2;

                              return (
                                <g key={`dep-${task.id}-${depId}`}>
                                  {/* Draw using lines instead of path since paths do not support relative percentage dimensions */}
                                  <line x1={`${dtPercentLeft}%`} y1={yFrom} x2={`${midPercent}%`} y2={yFrom} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.6" />
                                  <line x1={`${midPercent}%`} y1={yFrom} x2={`${midPercent}%`} y2={yTo} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.6" />
                                  <line x1={`${midPercent}%`} y1={yTo} x2={`${tPercentLeft}%`} y2={yTo} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrowhead)" opacity="0.6" />
                                </g>
                              );
                            });
                          })}
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredProjects.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  No projects matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddProjectModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">Create New Project</h2>
                <p className="text-sm text-slate-400 mt-1">Add a new project and configure its settings.</p>
              </div>
              <button type="button" onClick={() => setIsAddProjectModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/50 pb-2 gap-4">
                    <h3 className="text-sm font-medium text-slate-200">Basic Details</h3>
                    <div className="flex items-center gap-2">
                       <label className="text-xs text-slate-400 whitespace-nowrap">Load Template:</label>
                       <select 
                         onChange={(e) => handleTemplateSelection(e.target.value)}
                         className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all"
                         defaultValue=""
                       >
                         <option value="" disabled>Select template...</option>
                         <option value="vapt">VAPT (Cybersecurity)</option>
                         <option value="development">Software Development</option>
                         <option value="strategy">Strategy & Insight</option>
                       </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-slate-300">Project Name</label>
                      <input required type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. Mobile App Development" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Client</label>
                      <select required value={newProject.client} onChange={e => setNewProject({...newProject, client: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all">
                        <option value="" disabled>Select a client</option>
                        <option value="Internal">Internal Project (No Client)</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Category</label>
                      <select value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all">
                        <option value="Web Development">Web Development</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Digital Design">Digital Design</option>
                        <option value="Strategy & Insight">Strategy & Insight</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Status</label>
                      <select value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Health</label>
                      <select value={newProject.health} onChange={e => setNewProject({...newProject, health: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all">
                        <option value="On Track">On Track</option>
                        <option value="At Risk">At Risk</option>
                        <option value="Delayed">Delayed</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Priority</label>
                      <select value={newProject.priority} onChange={e => setNewProject({...newProject, priority: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all">
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Start Date</label>
                      <input required type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Deadline</label>
                      <input required type="date" value={newProject.deadline} onChange={e => setNewProject({...newProject, deadline: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Allocated Budget ($)</label>
                      <input type="number" min="0" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. 10000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Spent ($)</label>
                      <input type="number" min="0" value={newProject.spent} onChange={e => setNewProject({...newProject, spent: Number(e.target.value)})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. 2000" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-medium text-slate-200 border-b border-slate-700/50 pb-2">Operations & Setup</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Team Members (comma separated)</label>
                      <input type="text" value={newProject.team} onChange={e => setNewProject({...newProject, team: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. Alice, Bob, Charlie" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Phases (comma separated)</label>
                      <input type="text" value={newProject.phases} onChange={e => setNewProject({...newProject, phases: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. Recon & Scoping, Active Testing, Reporting" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Automated Workflows (comma separated)</label>
                      <input type="text" value={newProject.workflows} onChange={e => setNewProject({...newProject, workflows: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. Client Onboarding, Weekly Reports Automator" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Required Tools (comma separated)</label>
                      <input type="text" value={newProject.tools} onChange={e => setNewProject({...newProject, tools: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. Jira, Nessus, Burp Suite" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Instructions</label>
                        <textarea rows={3} value={newProject.instructions} onChange={e => setNewProject({...newProject, instructions: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all resize-none" placeholder="Enter standard testing procedures..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Quality Guidelines</label>
                        <textarea rows={3} value={newProject.guidelines} onChange={e => setNewProject({...newProject, guidelines: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all resize-none" placeholder="Enter quality and testing guidelines..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Notes</label>
                      <textarea rows={2} value={newProject.notes} onChange={e => setNewProject({...newProject, notes: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all resize-none" placeholder="Additional notes about the project..." />
                    </div>
                  </div>
                </div>

              </div>
              <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3 rounded-b-2xl flex-shrink-0">
                <button type="button" onClick={() => setIsAddProjectModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${selectedProject.bg} ${selectedProject.color}`}>
                  <selectedProject.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedProject.name}</h2>
                  <p className="text-sm text-slate-400 mt-0.5">{selectedProject.client}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAIAssessRisk(selectedProject)}
                  disabled={isAssessingRisk}
                  className={`flex items-center gap-2 text-sm transition-colors px-3 py-1.5 rounded-lg border ${
                    isAssessingRisk 
                      ? 'text-purple-400 bg-purple-500/10 border-purple-500/20 opacity-70 cursor-not-allowed' 
                      : 'text-purple-400 hover:text-white hover:bg-purple-500/10 border-purple-500/20'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${isAssessingRisk ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline">AI Assess Risk</span>
                </button>
                <button 
                  onClick={() => generateTechnicalDocumentation(selectedProject.id)}
                  className="flex items-center gap-2 text-sm text-indigo-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-indigo-400/10 rounded-lg border border-indigo-400/20"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Docs</span>
                </button>
                <button 
                  onClick={() => generateSummaryReport(selectedProject.id)}
                  className="flex items-center gap-2 text-sm text-purple-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-purple-400/10 rounded-lg border border-purple-400/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Report</span>
                </button>
                <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              {/* Alert Banner for At Risk Projects */}
              {(selectedProject.health === 'Off Track' || selectedProject.health === 'Delayed') && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start sm:items-center gap-4 fade-in flex-col sm:flex-row">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-rose-500/20 rounded-lg shrink-0">
                       <AlertTriangle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-rose-400">Project is {selectedProject.health}</h4>
                      <p className="text-xs text-rose-300/80 mt-1">
                        {selectedProject.riskReasoning 
                          ? `AI Asessment: ${selectedProject.riskReasoning}`
                          : 'This project has deviated from its baseline metrics. Generate an AI remediation plan to realign milestones and resource allocation.'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowRemediationDialog(true)}
                    className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Generate Plan
                  </button>
                </div>
              )}

              {/* Alert Banner for Budget Overrun */}
              {(selectedProject.budget > 0 && selectedProject.spent / selectedProject.budget >= 0.8) && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start sm:items-center gap-4 fade-in flex-col sm:flex-row">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                       {React.createElement(getHealthIndicator('At Risk').icon, { className: "w-5 h-5 text-amber-400" })}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-400">Budget Warning</h4>
                      <p className="text-xs text-amber-300/80 mt-1">This project has utilized {Math.round((selectedProject.spent/selectedProject.budget)*100)}% of its allocated budget. Generate a cost-saving plan to prevent an overrun.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCostSavingDialog(true)}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Generate Cost-Saving Plan
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Status</span>
                  <span className="text-sm text-white font-medium">{selectedProject.status}</span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Health</span>
                  {(() => {
                    const health = getHealthIndicator(selectedProject.health || 'On Track');
                    const HealthIcon = health.icon;
                    return (
                      <span className={`text-sm font-medium flex items-center gap-1.5 ${health.color}`}>
                        <HealthIcon className="w-4 h-4" />
                        {selectedProject.health || 'On Track'}
                      </span>
                    )
                  })()}
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Priority</span>
                  <span className={`text-sm font-medium ${getPriorityColor(selectedProject.priority).replace('border', 'text-').replace('bg-', 'text-').replace('/10', '')}`}>{selectedProject.priority}</span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Start Date</span>
                  <span className="text-sm text-white font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Deadline</span>
                  <span className="text-sm text-white font-medium">{new Date(selectedProject.deadline).toLocaleDateString()}</span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 group relative">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Time Tracked</span>
                  <span className="text-sm text-white font-medium items-center gap-1 flex flex-wrap">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedProject.timeSpent ? `${Math.floor(selectedProject.timeSpent / 60)}h ${selectedProject.timeSpent % 60}m` : '0m'}</span>
                  </span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 group relative">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Allocated Budget</span>
                  <div className="flex items-center">
                    <span className="text-sm text-slate-400 mr-1">$</span>
                    <DebouncedInput 
                      type="number"
                      value={selectedProject.budget?.toString() || "0"}
                      onChange={(e: any) => handleUpdateBudget(selectedProject.id, Number(e.target.value))}
                      className="w-full bg-transparent border-none p-0 text-sm font-medium text-white focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 group relative">
                  <span className="block text-xs font-medium text-slate-400 mb-1">Spent Amount</span>
                  <div className="flex items-center">
                    <span className="text-sm text-slate-400 mr-1">$</span>
                    <DebouncedInput 
                      type="number"
                      value={selectedProject.spent?.toString() || "0"}
                      onChange={(e: any) => handleUpdateSpent(selectedProject.id, Number(e.target.value))}
                      className="w-full bg-transparent border-none p-0 text-sm font-medium text-white focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-slate-300 font-medium tracking-wide text-xs">TASKS PROGRESS</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleManualProgressChange(selectedProject.id, selectedProject.progress - 5)}
                      className="p-1 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                      title="Decrease Progress (5%)"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-[#0ED7A8] font-bold text-lg min-w-[3rem] text-center">{selectedProject.progress}%</span>
                    <button 
                      onClick={() => handleManualProgressChange(selectedProject.id, selectedProject.progress + 5)}
                      className="p-1 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                      title="Increase Progress (5%)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div 
                  className="w-full bg-slate-800 rounded-full h-3 cursor-pointer relative group/progress py-2 -my-2"
                  onMouseDown={(e) => handleProgressMouseDown(e, selectedProject.id)}
                  ref={el => progressBarsRef.current[selectedProject.id] = el}
                >
                  <div className="absolute inset-y-2 left-0 right-0 bg-slate-900 rounded-full pointer-events-none shadow-inner border border-slate-700/30"></div>
                  <div 
                    className={`absolute inset-y-2 left-0 rounded-full pointer-events-none shadow-[0_0_15px_-3px_rgba(14,215,168,0.3)] ${
                      draggingProjectId === selectedProject.id ? 'transition-none' : 'transition-all duration-300'
                    } ${
                      selectedProject.progress === 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-[#0ED7A8]/80 to-[#0ED7A8]'
                    }`}
                    style={{ width: `${selectedProject.progress}%` }}
                  >
                    {/* Drag handle */}
                    <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white border-2 border-[#0ED7A8] rounded-full shadow-[0_0_10px_rgba(14,215,168,0.5)] opacity-0 group-hover/progress:opacity-100 ${draggingProjectId === selectedProject.id ? 'opacity-100 scale-125' : ''} transition-all`}></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50 flex items-center justify-between">
                  Task Completion Trend
                </h3>
                <div className="h-48 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { day: 'Day 1', completed: 2 },
                      { day: 'Day 2', completed: 3 },
                      { day: 'Day 3', completed: 5 },
                      { day: 'Day 4', completed: 4 },
                      { day: 'Day 5', completed: 7 },
                      { day: 'Day 6', completed: 6 },
                      { day: 'Day 7', completed: 9 },
                    ]}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ED7A8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ED7A8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E2D40', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                        itemStyle={{ color: '#0ED7A8' }}
                      />
                      <Area type="monotone" dataKey="completed" stroke="#0ED7A8" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50 flex items-center justify-between">
                  Team Attributes
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{selectedProject.team.length} members</span>
                </h3>
                
                <div className="flex flex-col gap-3 mb-4">
                  {selectedProject.team.map((memberRaw, i) => {
                    const memberName = getMemberName(memberRaw);
                    const memberRole = typeof memberRaw === 'object' && memberRaw.role ? memberRaw.role : 'Member';
                    const memberCap = typeof memberRaw === 'object' && memberRaw.capacity ? memberRaw.capacity : 100;
                    const isExpanded = expandedTeamMember === memberName;
                    
                    // Additional info for expanded state
                    const assignedTasks = (selectedProject.tasks || []).filter(t => t.assignee === memberName);
                    const tm = teamMembers.find(m => m.name === memberName);
                    const skills = tm?.skills || [];

                    return (
                    <div key={i} className="flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden group">
                       <div 
                         className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
                         onClick={() => setExpandedTeamMember(isExpanded ? null : memberName)}
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white shadow-sm">
                             {memberName.substring(0, 1).toUpperCase()}
                           </div>
                           <div className="flex flex-col justify-center">
                             <div className="flex items-center gap-2">
                               <span className="text-sm text-slate-200 font-medium leading-tight">{memberName}</span>
                             </div>
                             <span className="text-xs text-slate-400 leading-tight mt-0.5">{memberRole}</span>
                           </div>
                         </div>
                         <div className="flex items-center gap-4">
                           <div className="flex flex-col items-end gap-1 min-w-[80px]">
                             <span className="text-xs font-bold leading-tight" style={{ color: memberCap > 100 ? '#ef4444' : '#0ED7A8' }}>{memberCap}% Capacity</span>
                             <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden border border-slate-700/30">
                               <div className="h-full rounded-full bg-gradient-to-r from-[#0ED7A8]/80 to-[#0ED7A8]" style={{ width: `${Math.min(memberCap, 100)}%`, backgroundColor: memberCap > 100 ? '#ef4444' : undefined }} />
                             </div>
                           </div>
                           <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                         </div>
                       </div>
                       
                       {isExpanded && (
                         <div className="p-4 bg-slate-900/50 border-t border-slate-700/50 flex flex-col gap-4">
                           <div className="flex justify-between items-start gap-4">
                             <div className="flex-1">
                               <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Assigned Tasks</h4>
                               {assignedTasks.length > 0 ? (
                                 <ul className="space-y-1.5">
                                   {assignedTasks.map(t => (
                                     <li key={t.id} className="text-sm text-slate-300 flex items-start gap-2">
                                       <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${t.status === 'Completed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                       <span className={t.status === 'Completed' ? 'line-through text-slate-500' : ''}>{t.title}</span>
                                     </li>
                                   ))}
                                 </ul>
                               ) : (
                                 <p className="text-sm text-slate-500 italic">No tasks assigned yet.</p>
                               )}
                             </div>
                             <div className="flex-1">
                               <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Skills</h4>
                               {skills.length > 0 ? (
                                 <div className="flex flex-wrap gap-1.5">
                                   {skills.map((s, idx) => (
                                     <span key={idx} className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs">
                                       {s.name}
                                     </span>
                                   ))}
                                 </div>
                               ) : (
                                 <p className="text-sm text-slate-500 italic">No skills listed.</p>
                               )}
                             </div>
                           </div>
                           
                           <div className="flex justify-end pt-2 border-t border-slate-700/30">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 const updatedTeam = selectedProject.team.filter((_, index) => index !== i);
                                 const updatedProjects = projects.map(p => p.id === selectedProject.id ? { ...p, team: updatedTeam } : p);
                                 setProjects(updatedProjects);
                                 setSelectedProject(prev => prev ? { ...prev, team: updatedTeam } : null);
                                 mockApi.setCollection('projects', updatedProjects).catch(console.error);
                                 addNotification({ type: 'info', message: `${memberName} removed from project.` });
                               }}
                               className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 px-2 py-1 bg-rose-400/10 rounded border border-rose-400/20"
                             >
                               <X className="w-3 h-3" />
                               Remove from Project
                             </button>
                           </div>
                         </div>
                       )}
                    </div>
                  )})}
                  {selectedProject.team.length === 0 && (
                    <p className="text-sm text-slate-500 italic py-2">No team members allocated yet.</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 border-dashed">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <select
                      value={newResourceMember}
                      onChange={(e) => setNewResourceMember(e.target.value)}
                      className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#0ED7A8] transition-all"
                    >
                      <option value="">Select team member...</option>
                      {teamMembers
                        ?.filter(m => !selectedProject.team.some(t => getMemberName(t) === m.name))
                        .map(member => (
                          <option key={member.id} value={member.name}>
                            {member.name} ({member.role})
                          </option>
                        ))}
                    </select>
                    
                    <input 
                      type="text"
                      placeholder="Role (e.g. Lead)"
                      value={newResourceRole}
                      onChange={(e) => setNewResourceRole(e.target.value)}
                      className="w-full sm:w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#0ED7A8] transition-all"
                    />
                    
                    <div className="flex items-center w-full sm:w-auto relative">
                      <input 
                        type="number"
                        placeholder="100"
                        min="1"
                        max="100"
                        value={newResourceCapacity}
                        onChange={(e) => setNewResourceCapacity(e.target.value)}
                        className="w-full sm:w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#0ED7A8] transition-all"
                      />
                      <span className="absolute right-3 text-slate-500 text-sm">%</span>
                    </div>

                    <button 
                      onClick={() => {
                        if (newResourceMember.trim()) {
                          const newResource = {
                            name: newResourceMember,
                            role: newResourceRole || 'Member',
                            capacity: parseInt(newResourceCapacity) || 100
                          };
                          const updatedTeam = [...selectedProject.team, newResource];
                          const updatedProjects = projects.map(p => p.id === selectedProject.id ? { ...p, team: updatedTeam } : p);
                          setProjects(updatedProjects);
                          setSelectedProject(prev => prev ? { ...prev, team: updatedTeam } : null);
                          mockApi.setCollection('projects', updatedProjects).catch(console.error);
                          addNotification({ type: 'success', message: `${newResourceMember} has been allocated as ${newResource.role}.` });
                          addNotification({ type: 'info', message: `Notification sent to ${newResourceMember} regarding assignment.` });
                          
                          setNewResourceMember("");
                          setNewResourceRole("Lead");
                          setNewResourceCapacity("100");
                        }
                      }}
                      disabled={!newResourceMember}
                      className="w-full sm:w-auto bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 disabled:opacity-50 disabled:hover:bg-[#0ED7A8] text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Resource
                    </button>
                  </div>
                </div>
              </div>

              {/* Team Capability Summary Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50 flex flex-wrap items-center justify-between gap-4">
                  Team Capability Summary
                  <button 
                    onClick={() => setIsUpdateHRModalOpen(true)}
                    className="text-xs font-medium text-[#0ED7A8] hover:text-[#0ED7A8]/80 transition-colors flex items-center gap-1.5 bg-[#0ED7A8]/10 px-2.5 py-1.5 rounded-lg border border-[#0ED7A8]/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Update HR Matrix
                  </button>
                </h3>
                {(() => {
                  if (!selectedProject.requiredSkills || selectedProject.requiredSkills.length === 0) {
                    return <p className="text-sm text-slate-500 italic">No specific skills required for this project.</p>;
                  }
                  
                  const teamSkillsRaw = teamMembers
                    .filter(m => selectedProject.team.some(t => getMemberName(t) === m.name))
                    .flatMap(m => m.skills || [])
                    .map(s => s.name);
                    
                  const teamSkills = new Set(teamSkillsRaw.map(s => s.toLowerCase()));
                  const coveredSkills = selectedProject.requiredSkills.filter(s => teamSkills.has(s.toLowerCase()));
                  const missingSkills = selectedProject.requiredSkills.filter(s => !teamSkills.has(s.toLowerCase()));
                  
                  const coveragePercent = Math.round((coveredSkills.length / selectedProject.requiredSkills.length) * 100);

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300 font-medium">Skill Coverage Match:</span>
                        <span className={`font-bold ${coveragePercent >= 80 ? 'text-[#0ED7A8]' : coveragePercent >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{coveragePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${coveragePercent >= 80 ? 'bg-[#0ED7A8]' : coveragePercent >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                          style={{ width: `${coveragePercent}%` }} 
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                          <h4 className="text-xs font-semibold text-emerald-400 mb-3 flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5" /> Covered Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {coveredSkills.length > 0 ? coveredSkills.map(skill => (
                              <span key={skill} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-medium">
                                {skill}
                              </span>
                            )) : <span className="text-xs text-slate-500 italic">No required skills covered</span>}
                          </div>
                        </div>
                        
                        <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                          <h4 className="text-xs font-semibold text-rose-400 mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Missing Critical Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {missingSkills.length > 0 ? missingSkills.map(skill => (
                              <span key={skill} className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-xs font-medium">
                                {skill}
                              </span>
                            )) : <span className="text-xs text-slate-500 italic">All critical skills covered</span>}
                          </div>
                        </div>
                      </div>
                      
                      {missingSkills.length > 0 && (
                        <div className="text-xs flex items-center gap-2 text-rose-400 bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>Consider allocating team members with the missing skills to mitigate execution risks.</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Notify Team Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50 flex flex-wrap items-center justify-between gap-4">
                  Notify Team Updates
                </h3>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 border-dashed space-y-4">
                  <p className="text-xs text-slate-400">Push notification or reminder to team members. Useful for project updates, modification, and imminent deliveries.</p>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const msg = (document.getElementById('notify-msg') as HTMLInputElement).value;
                      if (!msg) return;
                      const hasEmail = (document.getElementById('notify-email') as HTMLInputElement).checked;
                      const hasWhatsapp = (document.getElementById('notify-whatsapp') as HTMLInputElement).checked;
                      const hasApp = (document.getElementById('notify-app') as HTMLInputElement).checked;
                      
                      const channels = [];
                      if (hasEmail) channels.push('Email');
                      if (hasWhatsapp) channels.push('WhatsApp');
                      if (hasApp) channels.push('In-App');

                      if (channels.length === 0) return;
                      
                      setNotification(`Notification sent to team via: ${channels.join(', ')}`);
                      setTimeout(() => setNotification(null), 5000);
                      (document.getElementById('notify-msg') as HTMLInputElement).value = '';
                    }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="notify-email" className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-700" defaultChecked />
                        <span className="text-sm text-slate-300 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="notify-whatsapp" className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700" defaultChecked />
                        <span className="text-sm text-slate-300 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="notify-app" className="w-4 h-4 rounded text-[#0ED7A8] bg-slate-900 border-slate-700" defaultChecked />
                        <span className="text-sm text-slate-300 flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> In-App</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        required
                        type="text" 
                        id="notify-msg"
                        placeholder="e.g. Project deadline extended by 2 days." 
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all placeholder-slate-500"
                      />
                      <button 
                        type="submit"
                        className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                        Send Alert
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50 flex items-center justify-between">
                  Log Time & Activity
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Time Logging */}
                  <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>Log Time</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          placeholder="Minutes"
                          value={timeToLog}
                          onChange={e => setTimeToLog(e.target.value)}
                          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={timeLogDescription}
                          onChange={e => setTimeLogDescription(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleLogTime();
                          }}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all"
                        />
                        <button
                          onClick={handleLogTime}
                          disabled={!timeToLog || parseInt(timeToLog) <= 0}
                          className="px-4 py-2 bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 transition-colors text-slate-900 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Log Time
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Activity History */}
                  <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                      <Activity className="w-4 h-4" />
                      <span>Activity History</span>
                    </div>
                    <div className="space-y-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {(selectedProject.activity || []).length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No activity recorded yet.</p>
                      ) : (
                        (selectedProject.activity || []).map(act => (
                          <div key={act.id} className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-700/50">
                              <Activity className="w-3 h-3 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-300">
                                <span className="font-medium text-white">{act.type}</span> {act.text}
                              </p>
                              <span className="text-[10px] text-slate-500 mt-0.5 block">{act.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50 flex items-center justify-between">
                  Project Tasks
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{(selectedProject.tasks || []).length} tasks</span>
                </h3>
                
                {selectedTaskIds.length > 0 && (
                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between mb-4 fade-in">
                    <span className="text-sm font-medium text-[#0ED7A8]">
                      {selectedTaskIds.length} task{selectedTaskIds.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-3">
                      <select
                        value={bulkReassignTarget}
                        onChange={(e) => setBulkReassignTarget(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-[#0ED7A8] transition-all max-w-[160px]"
                      >
                        <option value="">Reassign to...</option>
                        {selectedProject.team.map((memberRaw, i) => {
                          const memberName = getMemberName(memberRaw);
                          return (
                            <option key={`m-${i}`} value={memberName}>{memberName}</option>
                          );
                        })}
                      </select>
                      <button
                        onClick={() => {
                          if (bulkReassignTarget) {
                            const updatedTasks = (selectedProject.tasks || []).map(t => 
                              selectedTaskIds.includes(t.id) ? { ...t, assignee: bulkReassignTarget } : t
                            );
                            const updatedProjects = projects.map(p => 
                              p.id === selectedProject.id ? { ...p, tasks: updatedTasks } : p
                            );
                            setProjects(updatedProjects);
                            setSelectedProject(prev => prev ? { ...prev, tasks: updatedTasks } : null);
                            mockApi.setCollection('projects', updatedProjects).catch(console.error);
                            
                            addNotification({
                              type: 'success',
                              message: `Reassigned ${selectedTaskIds.length} tasks to ${bulkReassignTarget}`
                            });
                            
                            setSelectedTaskIds([]);
                            setBulkReassignTarget("");
                          }
                        }}
                        disabled={!bulkReassignTarget}
                        className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 disabled:opacity-50 text-slate-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 mb-8">
                  {(selectedProject.tasks || []).map((task) => (
                    <div 
                      key={task.id} 
                      className={`bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 transition-colors ${draggedTask?.taskId === task.id ? 'opacity-50 scale-[0.98]' : 'hover:border-slate-600'}`}
                      draggable
                      onDragStart={(e) => handleTaskDragStart(e, selectedProject.id, task.id)}
                      onDragEnd={handleTaskDragEnd}
                      onDragOver={handleTaskDragOver}
                      onDrop={(e) => handleTaskDrop(e, selectedProject.id, task.id)}
                    >
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="flex gap-3">
                          <input
                            type="checkbox"
                            checked={selectedTaskIds.includes(task.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTaskIds(prev => [...prev, task.id]);
                              } else {
                                setSelectedTaskIds(prev => prev.filter(id => id !== task.id));
                              }
                            }}
                            className="mt-1 w-4 h-4 rounded border-slate-600 text-[#0ED7A8] focus:ring-[#0ED7A8] focus:ring-offset-slate-900 bg-slate-700 cursor-pointer"
                          />
                          <div>
                            <h4 className="text-sm font-medium text-white">{task.title}</h4>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                               <UserPlus className="w-3.5 h-3.5" />
                               {task.assignee}
                            </p>
                          </div>
                        </div>
                        <select
                          value={task.status || 'Not Started'}
                          onChange={(e) => handleTaskStatusChange(selectedProject.id, task.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                            (task.status || 'Not Started') === 'Completed' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                            (task.status || 'Not Started') === 'In Progress' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                            'bg-slate-700/50 text-slate-300 border-slate-600'
                          }`}
                        >
                          <option value="Not Started" className="bg-slate-800 text-slate-300">Not Started</option>
                          <option value="In Progress" className="bg-slate-800 text-slate-300">In Progress</option>
                          <option value="Completed" className="bg-slate-800 text-slate-300">Completed</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between text-xs mb-2 mt-4">
                        <span className="text-slate-400 font-medium tracking-wide">SPRINT PLANNING (HOURS)</span>
                        {task.estimatedTime ? (
                          <div className="flex flex-col items-end gap-1.5 w-1/2">
                            <span className="font-medium text-slate-300">
                               {task.timeSpent ? `${Math.floor(task.timeSpent / 60)}h ${task.timeSpent % 60}m` : '0m'} / {Math.floor(task.estimatedTime / 60)}h
                            </span>
                            <div className="w-full h-1.5 bg-slate-900 rounded-full shadow-inner border border-slate-700/30 overflow-hidden relative">
                               <div 
                                 className={`absolute top-0 left-0 bottom-0 transition-all ${((task.timeSpent || 0) > task.estimatedTime) ? 'bg-rose-500' : 'bg-blue-400'}`}
                                 style={{ width: `${Math.min(((task.timeSpent || 0) / task.estimatedTime) * 100, 100)}%` }}
                               />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-medium">{task.timeSpent ? `${Math.floor(task.timeSpent / 60)}h ${task.timeSpent % 60}m` : '0m'}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs mb-2 mt-4">
                        <span className="text-slate-400 font-medium tracking-wide">PROGRESS</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleManualTaskProgressChange(selectedProject.id, task.id, (task.progress || 0) - 5)}
                            className="p-0.5 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                            title="Decrease Progress (5%)"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-[#0ED7A8] font-bold min-w-[2.5rem] text-center">{task.progress || 0}%</span>
                          <button 
                            onClick={() => handleManualTaskProgressChange(selectedProject.id, task.id, (task.progress || 0) + 5)}
                            className="p-0.5 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
                            title="Increase Progress (5%)"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div 
                        className="w-full bg-slate-800 rounded-full h-3 cursor-pointer relative group/progress transition-all py-2 -my-2 mt-2"
                        onMouseDown={(e) => handleTaskProgressMouseDown(e, selectedProject.id, task.id)}
                        ref={el => { if (el) taskProgressBarsRef.current[`${selectedProject.id}-${task.id}`] = el; }}
                      >
                        <div className="absolute inset-y-2 left-0 right-0 bg-slate-900 rounded-full pointer-events-none shadow-inner border border-slate-700/30"></div>
                        <div 
                          className={`absolute inset-y-2 left-0 rounded-full pointer-events-none ${
                            draggingTaskId?.taskId === task.id ? 'transition-none' : 'transition-all duration-300'
                          } ${
                            (task.progress || 0) === 100 ? 'bg-emerald-400 shadow-[0_0_10px_-2px_rgba(52,211,153,0.3)]' : 'bg-[#0ED7A8] shadow-[0_0_10px_-2px_rgba(14,215,168,0.3)]'
                          }`}
                          style={{ width: `${task.progress || 0}%` }}
                        >
                          {/* Drag handle */}
                          <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white border-2 border-[#0ED7A8] rounded-full shadow-[0_0_10px_rgba(14,215,168,0.5)] opacity-0 group-hover/progress:opacity-100 ${draggingTaskId?.taskId === task.id ? 'opacity-100 scale-125' : ''} transition-all`}></div>
                        </div>
                      </div>

                      {/* Subtasks block */}
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Subtasks ({(task.subtasks || []).filter(s => s.completed).length}/{(task.subtasks || []).length})
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {(task.subtasks || []).map(subtask => (
                            <div key={subtask.id} className="flex items-center justify-between bg-slate-800/30 p-2 rounded border border-slate-700/30 group/subtask">
                              <label className="flex items-center gap-2 cursor-pointer w-full">
                                <input 
                                  type="checkbox" 
                                  checked={subtask.completed} 
                                  onChange={() => handleToggleTaskSubtask(selectedProject.id, task.id, subtask.id)}
                                  className="w-3.5 h-3.5 rounded border-slate-600 text-[#0ED7A8] focus:ring-[#0ED7A8] focus:ring-offset-slate-900 bg-slate-700 cursor-pointer"
                                />
                                <span className={`text-xs ${subtask.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                                  {subtask.title}
                                </span>
                              </label>
                              <button 
                                onClick={() => handleRemoveTaskSubtask(selectedProject.id, task.id, subtask.id)}
                                className="text-slate-500 hover:text-rose-400 opacity-0 group-hover/subtask:opacity-100 transition-opacity p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          
                          <div className="flex gap-2 mt-2 pt-1">
                            <input 
                              type="text" 
                              value={(newTaskSubtaskTitle?.taskId === task.id ? newTaskSubtaskTitle.title : '')}
                              onChange={(e) => setNewTaskSubtaskTitle({taskId: task.id, title: e.target.value})}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newTaskSubtaskTitle?.title) {
                                  handleAddTaskSubtask(selectedProject.id, task.id, newTaskSubtaskTitle.title);
                                  setNewTaskSubtaskTitle(null);
                                }
                              }}
                              placeholder="Add subtask..." 
                              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#0ED7A8] text-white transition-all placeholder-slate-500"
                            />
                            <button 
                              onClick={() => {
                                if (newTaskSubtaskTitle?.title) {
                                  handleAddTaskSubtask(selectedProject.id, task.id, newTaskSubtaskTitle.title);
                                  setNewTaskSubtaskTitle(null);
                                }
                              }}
                              disabled={!(newTaskSubtaskTitle?.taskId === task.id && newTaskSubtaskTitle?.title.trim())}
                              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-medium transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                  {(selectedProject.tasks || []).length === 0 && (
                    <p className="text-sm text-slate-500 italic py-2">No tasks defined for this project.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50 flex items-center justify-between">
                  Project Milestones
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{(selectedProject.milestones || []).length} milestones</span>
                </h3>
                
                <div className="space-y-3 mb-4">
                  {(selectedProject.milestones || []).map((milestone, i) => {
                    const isPassed = new Date(milestone.date).getTime() <= Date.now();
                    return (
                      <div key={milestone.id || i} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 p-3 rounded-xl group relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPassed ? 'bg-[#0ED7A8]' : 'bg-amber-400'}`}></div>
                        <div className="flex flex-col ml-2">
                           <span className="text-sm text-slate-200 font-medium">{milestone.title}</span>
                           <span className="text-xs text-slate-400 mt-0.5">{new Date(milestone.date).toLocaleDateString()} {isPassed ? '(Completed)' : ''}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const updatedMilestones = (selectedProject.milestones || []).filter((_, index) => index !== i);
                            setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, milestones: updatedMilestones } : p));
                            setSelectedProject(prev => prev ? { ...prev, milestones: updatedMilestones } : null);
                          }}
                          className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                          title="Remove milestone"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  {(selectedProject.milestones || []).length === 0 && (
                    <p className="text-sm text-slate-500 italic py-2">No milestones defined yet.</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 border-dashed">
                  <input 
                    type="text" 
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone(prev => ({...prev, title: e.target.value}))}
                    placeholder="Milestone title" 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all placeholder-slate-500"
                  />
                  <input 
                    type="date" 
                    value={newMilestone.date}
                    onChange={(e) => setNewMilestone(prev => ({...prev, date: e.target.value}))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all [color-scheme:dark]"
                  />
                  <button 
                    onClick={() => {
                      if (newMilestone.title.trim() && newMilestone.date) {
                        const newId = (selectedProject.milestones || []).length > 0 ? Math.max(...(selectedProject.milestones || []).map(m => m.id)) + 1 : 1;
                        const updatedMilestones = [...(selectedProject.milestones || []), { id: newId, title: newMilestone.title.trim(), date: newMilestone.date }];
                        setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, milestones: updatedMilestones } : p));
                        setSelectedProject(prev => prev ? { ...prev, milestones: updatedMilestones } : null);
                        setNewMilestone({ title: '', date: '' });
                      }
                    }}
                    disabled={!newMilestone.title.trim() || !newMilestone.date}
                    className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 disabled:opacity-50 disabled:hover:bg-[#0ED7A8] text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Process Setup Section */}
              <div className="space-y-6 bg-slate-900 border border-slate-700/50 rounded-xl p-5 mb-6">
                <h3 className="text-sm font-medium text-slate-200 mb-4 pb-2 border-b border-slate-700">
                  Operations & Setup Guidelines
                </h3>
                
                {/* Phases */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Phases</label>
                  <p className="text-sm text-slate-300">
                    {(selectedProject.phases || []).length > 0
                      ? selectedProject.phases?.map(p => p.name).join(' → ')
                      : <span className="text-slate-500 italic">No phases configured for this project.</span>}
                  </p>
                </div>
                
                {/* Workflows */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Workflows</label>
                  <ul className="text-sm text-slate-300 list-disc list-inside">
                    {(selectedProject.workflows || []).length > 0
                      ? selectedProject.workflows?.map(w => <li key={w.id}>{w.title}</li>)
                      : <span className="text-slate-500 italic">No automated workflows applied.</span>}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Instructions</label>
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-sm text-slate-300 min-h-[60px]">
                    {selectedProject.instructions || <span className="text-slate-500 italic">No specific instructions provided.</span>}
                  </div>
                </div>

                {/* Guidelines */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quality Guidelines</label>
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-sm text-slate-300 min-h-[60px]">
                    {selectedProject.guidelines || <span className="text-slate-500 italic">No special guidelines provided.</span>}
                  </div>
                </div>

                {/* Tools */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Required Tools</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(selectedProject.tools || []).length > 0
                      ? selectedProject.tools?.map((t, i) => <span key={i} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded border border-indigo-500/20 font-medium">{t}</span>)
                      : <span className="text-sm text-slate-500 italic">No specific tools bound.</span>}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">General Notes</label>
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-sm text-slate-300 min-h-[60px]">
                     {selectedProject.notes || <span className="text-slate-500 italic">No additional notes.</span>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50 flex items-center justify-between">
                  Project Documents
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{(selectedProject.attachments || []).length} files</span>
                </h3>
                
                <div className="space-y-3 mb-4">
                  {(selectedProject.attachments || []).map((attachment, i) => (
                    <div key={attachment.id || i} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 p-3 rounded-xl group relative overflow-hidden">
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col ml-2 flex-grow overflow-hidden">
                           <span className="text-sm text-slate-200 font-medium truncate" title={attachment.name}>{attachment.name}</span>
                           <span className="text-xs text-slate-400 mt-0.5">{attachment.size} • Uploaded {new Date(attachment.uploadDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => addNotification({ type: 'success', message: `Downloading ${attachment.name}...` })} className="text-slate-400 hover:text-[#0ED7A8] p-2 rounded-lg" title="Download">
                             <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              const updatedAttachments = (selectedProject.attachments || []).filter((_, index) => index !== i);
                              const updatedProjects = projects.map(p => p.id === selectedProject.id ? { ...p, attachments: updatedAttachments } : p);
                              setProjects(updatedProjects);
                              setSelectedProject(prev => prev ? { ...prev, attachments: updatedAttachments } : null);
                              mockApi.setCollection('projects', updatedProjects).catch(console.error);
                            }}
                            className="text-slate-500 hover:text-rose-400 p-2 rounded-lg"
                            title="Delete file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(selectedProject.attachments || []).length === 0 && (
                    <p className="text-sm text-slate-500 italic py-2">No documents uploaded yet.</p>
                  )}
                </div>

                <div 
                  className={`flex flex-col items-center gap-3 bg-slate-800/30 p-8 rounded-xl border-2 border-dashed transition-all justify-center ${isDraggingFile ? 'border-[#0ED7A8] bg-[#0ED7A8]/5 scale-[1.02]' : 'border-slate-700/50'}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    const files: File[] = Array.from(e.dataTransfer.files || []);
                    if (files.length > 0) {
                      let currentAttachments = [...(selectedProject.attachments || [])];
                      files.forEach((file) => {
                        const newId = currentAttachments.length > 0 ? Math.max(...currentAttachments.map(a => a.id || 0)) + 1 : 1;
                        const sizeKb = Math.round(file.size / 1024);
                        const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
                        
                        const newAttachment = {
                          id: newId,
                          name: file.name,
                          size: sizeStr,
                          uploadDate: new Date().toISOString().split('T')[0],
                          type: file.type
                        };
                        currentAttachments.push(newAttachment);
                      });
                      
                      const updatedProjects = projects.map(p => p.id === selectedProject.id ? { ...p, attachments: currentAttachments } : p);
                      setProjects(updatedProjects);
                      setSelectedProject(prev => prev ? { ...prev, attachments: currentAttachments } : null);
                      mockApi.setCollection('projects', updatedProjects).catch(console.error);
                      addNotification({ type: 'success', message: `${files.length > 1 ? `${files.length} files` : files[0].name} uploaded successfully.` });
                    }
                  }}
                >
                  <label className="flex flex-col items-center justify-center gap-4 cursor-pointer text-slate-400 hover:text-white group w-full">
                    <input 
                      type="file" 
                      multiple
                      className="hidden" 
                      onChange={(e) => {
                        const files: File[] = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          let currentAttachments = [...(selectedProject.attachments || [])];
                          files.forEach((file) => {
                            const newId = currentAttachments.length > 0 ? Math.max(...currentAttachments.map(a => a.id || 0)) + 1 : 1;
                            const sizeKb = Math.round(file.size / 1024);
                            const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
                            
                            const newAttachment = {
                              id: newId,
                              name: file.name,
                              size: sizeStr,
                              uploadDate: new Date().toISOString().split('T')[0],
                              type: file.type
                            };
                            currentAttachments.push(newAttachment);
                          });
                          
                          const updatedProjects = projects.map(p => p.id === selectedProject.id ? { ...p, attachments: currentAttachments } : p);
                          setProjects(updatedProjects);
                          setSelectedProject(prev => prev ? { ...prev, attachments: currentAttachments } : null);
                          mockApi.setCollection('projects', updatedProjects).catch(console.error);
                          addNotification({ type: 'success', message: `${files.length > 1 ? `${files.length} files` : files[0].name} uploaded successfully.` });
                        }
                      }}
                    />
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-[#0ED7A8]/20 group-hover:text-[#0ED7A8] transition-colors">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium block text-slate-300">Click to upload or drag and drop</span>
                      <span className="text-xs text-slate-500 mt-1 block">PDF, Word, Excel, or Images (max. 10MB)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Mind Map Section */}
              <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50">
                  Project Mind Map
                </h3>
                <MindMap id={selectedProject.id.toString()} type="project" title={selectedProject.name} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogTimeConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowLogTimeConfirm(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-sm relative z-10 shadow-2xl overflow-hidden flex flex-col p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Confirm Time Log</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to log {timeToLog} minutes to this project?
              {timeLogDescription && <span><br/><br/>Description: {timeLogDescription}</span>}
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowLogTimeConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 transition-colors text-white rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogTime}
                className="px-4 py-2 bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 transition-colors text-slate-900 rounded-lg text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showRemediationDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowRemediationDialog(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-rose-500/30 w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
             <div className="p-6 border-b border-rose-500/20 flex items-center justify-between bg-rose-500/10">
               <h3 className="text-lg font-semibold text-rose-400 flex items-center gap-2">
                 <AlertTriangle className="w-5 h-5" />
                 AI Remediation Plan
               </h3>
               <button onClick={() => setShowRemediationDialog(false)} className="text-rose-400 hover:text-rose-300 transition-colors p-1">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {isGeneratingRemediation ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-400 rounded-full animate-spin mb-4"></div>
                    <p className="text-rose-300 font-medium">Analyzing project metrics and generating plan...</p>
                  </div>
                ) : remediationPlan ? (
                  <div className="prose prose-invert prose-rose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: remediationPlan.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                  </div>
                ) : (
                   <p className="text-slate-300">Click generate to create an AI-powered remediation plan based on the current deviations.</p>
                )}
             </div>
             <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
                <button 
                  onClick={() => setShowRemediationDialog(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 rounded-lg text-sm font-medium"
                >
                  Close
                </button>
                {!remediationPlan && !isGeneratingRemediation && (
                  <button 
                    onClick={() => {
                        setIsGeneratingRemediation(true);
                        setTimeout(() => {
                           setRemediationPlan(`**Identified Issues for ${selectedProject?.name}:**\n- Task completion is lagging behind milestone timelines.\n- Resource constraints detected on critical path tasks.\n\n**Recommended Actions:**\n1. **Re-allocate Resources:** Shift available team members to overdue tasks.\n2. **Adjust Deadlines:** Push non-critical phase deadlines back by 1 week.\n3. **Increase Budget:** Allocate 15% supplemental budget to fast-track deliverables.\n\n*Would you like to execute this plan?*`);
                           setIsGeneratingRemediation(false);
                        }, 2000);
                    }}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 transition-colors text-white rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Plan
                  </button>
                )}
                {remediationPlan && !isGeneratingRemediation && (
                  <button 
                    onClick={() => {
                        addNotification({ type: 'success', message: 'Remediation plan applied successfully.' });
                        setShowRemediationDialog(false);
                        setRemediationPlan('');
                    }}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 transition-colors text-white rounded-lg text-sm font-medium"
                  >
                    Execute Plan
                  </button>
                )}
             </div>
          </div>
        </div>
      )}

      {showCostSavingDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowCostSavingDialog(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-amber-500/30 w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
             <div className="p-6 border-b border-amber-500/20 flex items-center justify-between bg-amber-500/10">
               <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                 <AlertTriangle className="w-5 h-5" />
                 AI Cost-Saving Plan
               </h3>
               <button onClick={() => setShowCostSavingDialog(false)} className="text-amber-400 hover:text-amber-300 transition-colors p-1">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {isGeneratingCostSaving ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mb-4"></div>
                    <p className="text-amber-300 font-medium">Analyzing budget data and generating plan...</p>
                  </div>
                ) : costSavingPlan ? (
                  <div className="prose prose-invert prose-amber max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: costSavingPlan.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                  </div>
                ) : (
                   <p className="text-slate-300">Click generate to create an AI-powered cost-saving plan to prevent budget overruns on this project.</p>
                )}
             </div>
             <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
                <button 
                  onClick={() => setShowCostSavingDialog(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 rounded-lg text-sm font-medium"
                >
                  Close
                </button>
                {!costSavingPlan && !isGeneratingCostSaving && (
                  <button 
                    onClick={() => {
                        setIsGeneratingCostSaving(true);
                        setTimeout(() => {
                           setCostSavingPlan(`**Identified Budget Risks for ${selectedProject?.name}:**\n- Spending is at ${Math.round(((selectedProject?.spent || 0)/(selectedProject?.budget || 1))*100)}% with significant remaining tasks.\n- High-cost external tooling overlaps with internal capabilities.\n\n**Recommended Cost-Saving Actions:**\n1. **Consolidate Tools:** Migrate from external paid SaaS tools to internal platform equivalents, saving approximately 10% of remaining budget.\n2. **De-scope Low Priority Tasks:** Pause 'Nice-to-have' phase deliverables pending further review.\n3. **Optimize Resource Allocation:** Reduce senior contractor hours and lean on internal analysts for initial drafting, expecting a 15% reduction in burn rate.\n\n*Would you like to execute this cost-saving plan?*`);
                           setIsGeneratingCostSaving(false);
                        }, 2000);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-colors text-slate-900 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Plan
                  </button>
                )}
                {costSavingPlan && !isGeneratingCostSaving && (
                  <button 
                    onClick={() => {
                        addNotification({ type: 'success', message: 'Cost-saving plan applied successfully.' });
                        setShowCostSavingDialog(false);
                        setCostSavingPlan('');
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-colors text-slate-900 rounded-lg text-sm font-medium"
                  >
                    Execute Plan
                  </button>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Update HR Matrix Modal */}
      {isUpdateHRModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsUpdateHRModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-md relative z-10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Update HR Skill Matrix
              </h3>
              <button onClick={() => setIsUpdateHRModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Team Member</label>
                <select
                  value={updateHROptionMember}
                  onChange={(e) => setUpdateHROptionMember(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#0ED7A8] transition-all"
                >
                  <option value="">Choose member...</option>
                  {selectedProject.team.map((memberRaw, i) => {
                    const memberName = getMemberName(memberRaw);
                    return (
                      <option key={`hr-m-${i}`} value={memberName}>{memberName}</option>
                    );
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">New Skill Attained</label>
                <input
                  type="text"
                  value={updateHRSkill}
                  onChange={(e) => setUpdateHRSkill(e.target.value)}
                  placeholder="e.g. React, Python, Product Management"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#0ED7A8] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Proficiency Level</label>
                <select
                  value={updateHRLevel}
                  onChange={(e) => setUpdateHRLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#0ED7A8] transition-all"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
              <button 
                onClick={() => setIsUpdateHRModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (updateHROptionMember && updateHRSkill.trim()) {
                    setTeamMembers(prevMembers => prevMembers.map(m => {
                      if (m.name === updateHROptionMember) {
                        return {
                          ...m,
                          skills: [...(m.skills || []), { name: updateHRSkill.trim(), level: updateHRLevel }]
                        };
                      }
                      return m;
                    }));
                    addNotification({ type: 'success', message: `${updateHRSkill.trim()} added to ${updateHROptionMember}'s matrix.` });
                    setIsUpdateHRModalOpen(false);
                    setUpdateHROptionMember("");
                    setUpdateHRSkill("");
                    setUpdateHRLevel("Intermediate");
                  }
                }}
                disabled={!updateHROptionMember || !updateHRSkill.trim()}
                className="px-4 py-2 bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 disabled:opacity-50 text-slate-900 transition-colors rounded-lg text-sm font-medium"
              >
                Save to Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50">
          <Bell className="w-5 h-5 text-[#0ED7A8]" />
          <p className="text-sm font-medium">{notification}</p>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
