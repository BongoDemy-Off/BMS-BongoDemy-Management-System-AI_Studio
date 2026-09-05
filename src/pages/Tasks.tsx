import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, CheckCircle2, Circle, Clock, LayoutDashboard, List, AlertCircle, MoreHorizontal, ChevronDown, Flame, AlertTriangle, ArrowDown, X, User, Folder, Calendar, Bell, Mail, Smartphone, MessageSquare, Send, Link as LinkIcon, Lock, Activity, FileText, MessageCircle, Shield } from 'lucide-react';
import { format, parseISO, subHours, subDays, subMinutes, isValid } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { Task } from '../data/initialData';
import { MindMap } from '../components/MindMap';
import { DebouncedInput, DebouncedTextarea } from '../components/DebouncedInputs';

const formatDueDate = (dateString: string) => {
  if (!dateString) return 'No date';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (e) {
    return dateString;
  }
};

const calculateReminderTimestamp = (dueDate: string, offset: string): number | null => {
  try {
    const date = parseISO(dueDate);
    if (!isValid(date)) return null;
    
    const match = offset.match(/^(\d+)\s+(minute|hour|day)s?\s+before$/i);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === 'minute') return subMinutes(date, amount).getTime();
      if (unit === 'hour') return subHours(date, amount).getTime();
      if (unit === 'day') return subDays(date, amount).getTime();
    }
    
    if (offset === '1 hour before') return subHours(date, 1).getTime();
    if (offset === '1 day before') return subDays(date, 1).getTime();
  } catch (e) {
    return null;
  }
  return null;
};

const calculateReminderTime = (dueDate: string, offset: string) => {
  try {
    const date = parseISO(dueDate);
    if (!isValid(date)) return offset;
    
    const match = offset.match(/^(\d+)\s+(minute|hour|day)s?\s+before$/i);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === 'minute') return format(subMinutes(date, amount), 'MMM d, h:mm a');
      if (unit === 'hour') return format(subHours(date, amount), 'MMM d, h:mm a');
      if (unit === 'day') return format(subDays(date, amount), 'MMM d, h:mm a');
    }
    
    if (offset === '1 hour before') return format(subHours(date, 1), 'MMM d, h:mm a');
    if (offset === '1 day before') return format(subDays(date, 1), 'MMM d, h:mm a');
  } catch (e) {
    return offset;
  }
  return offset;
};

const PRIORITIES = ['high', 'medium', 'low'];
const STATUSES = ['Not Started', 'In Progress', 'Review', 'Completed'];

export function Tasks() {
  const { addNotification, userPreferences, tasks, setTasks, currentUser, teamMembers } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(userPreferences?.defaultTaskView || 'list');
  const [activeTab, setActiveTab] = useState('all');
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  
  const [openPriorityDropdown, setOpenPriorityDropdown] = useState<number | null>(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
  
  // Bulk actions state
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [bulkReassignTarget, setBulkReassignTarget] = useState("");
  
  // Task details modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedTask)) {
        setSelectedTask(updated);
      }
    }
  }, [tasks]);

  const [showReminderOptions, setShowReminderOptions] = useState(false);
  const [showAddDependency, setShowAddDependency] = useState(false);
  
  // Add task modal state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string; project: string; assignee: string; priority: string; startDate: string; dueDate: string;
    workflows: string; instructions: string; guidelines: string; tools: string; notes: string; estimatedTime?: number;
  }>({
    title: '',
    project: '',
    assignee: '',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    workflows: '',
    instructions: '',
    guidelines: '',
    tools: '',
    notes: '',
    estimatedTime: undefined
  });

  const logActivity = (taskId: number, actionType: string, actionText: string) => {
    const actor = currentUser?.email ? currentUser.email.split('@')[0] : 'User';
    const newActivity = {
      id: Date.now() + Math.random(),
      type: actionType,
      text: `${actionText} (by ${actor})`,
      time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, activity: [newActivity, ...(t.activity || [])] };
      }
      return t;
    }));
  };
  const [sortByPriority, setSortByPriority] = useState<'none' | 'desc' | 'asc'>(userPreferences?.defaultTaskSort || 'none');
  const [notification, setNotification] = useState<string | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasUpdates = false;

      setTasks(prevTasks => {
        const nextTasks = prevTasks.map(task => {
          if (!task.reminders || task.status === 'Completed') return task;
          
          let taskUpdated = false;
          const nextReminders = task.reminders.map(rem => {
            if (!rem.triggered && rem.timestamp && now >= rem.timestamp) {
              addNotification({
                message: `Reminder: Task "${task.title}" is due at ${formatDueDate(task.dueDate)}`,
                type: 'info'
              });
              taskUpdated = true;
              return { ...rem, triggered: true };
            }
            return rem;
          });

          if (taskUpdated) {
            hasUpdates = true;
            return { ...task, reminders: nextReminders };
          }
          return task;
        });

        return hasUpdates ? nextTasks : prevTasks;
      });
    }, 10000); // check every 10 seconds

    return () => clearInterval(interval);
  }, [addNotification, selectedTask]);

  const isTaskBlocked = (task: Task) => {
    if (!task.dependencies || task.dependencies.length === 0) return false;
    return task.dependencies.some(depId => {
      const dep = tasks.find(t => t.id === depId);
      if (!dep) return false;
      if (dep.status !== 'Completed') return true;
      const delayDays = task.dependencyDelays?.[depId] || 0;
      if (delayDays > 0 && dep.completedAt) {
        const completedDate = new Date(dep.completedAt);
        const now = new Date();
        const daysPassed = (now.getTime() - completedDate.getTime()) / (1000 * 3600 * 24);
        if (daysPassed < delayDays) return true;
      }
      return false;
    });
  };

  const isDependencyMet = (taskId: number, depId: number) => {
    const task = tasks.find(t => t.id === taskId);
    const dep = tasks.find(t => t.id === depId);
    if (!task || !dep) return true;
    if (dep.status !== 'Completed') return false;
    const delayDays = task.dependencyDelays?.[depId] || 0;
    if (delayDays > 0 && dep.completedAt) {
      const completedDate = new Date(dep.completedAt);
      const now = new Date();
      if ((now.getTime() - completedDate.getTime()) / (1000 * 3600 * 24) < delayDays) return false;
    }
    return true;
  };
  
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [timeToLog, setTimeToLog] = useState('');
  const [timeLogDescription, setTimeLogDescription] = useState('');

  const [activeTaskTimer, setActiveTaskTimer] = useState<{
    taskId: number;
    isRunning: boolean;
    sessionStart: number;
    accumulatedSeconds: number;
  } | null>(null);
  const [currentTimerDisplay, setCurrentTimerDisplay] = useState(0);

  // Focus / blur logic
  useEffect(() => {
    const handleFocus = () => {
       setActiveTaskTimer(prev => {
         if (prev && !prev.isRunning) {
            return { ...prev, isRunning: true, sessionStart: Date.now() };
         }
         return prev;
       });
    };

    const handleBlur = () => {
       setActiveTaskTimer(prev => {
          if (prev && prev.isRunning) {
             const addedSeconds = Math.floor((Date.now() - prev.sessionStart) / 1000);
             return { ...prev, isRunning: false, accumulatedSeconds: prev.accumulatedSeconds + addedSeconds };
          }
          return prev;
       });
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Timer interval and auto-commit
  useEffect(() => {
    let interval: any;
    if (activeTaskTimer?.isRunning) {
      interval = setInterval(() => {
         const addedSeconds = Math.floor((Date.now() - activeTaskTimer.sessionStart) / 1000);
         const totalSeconds = activeTaskTimer.accumulatedSeconds + addedSeconds;
         setCurrentTimerDisplay(totalSeconds);
         
         // Auto-commit every 60 seconds
         if (totalSeconds >= 60) {
            const minsToCommit = Math.floor(totalSeconds / 60);
            const remainingSecs = totalSeconds % 60;
            
            setTasks(prev => prev.map(t => 
              t.id === activeTaskTimer.taskId ? { ...t, timeSpent: (t.timeSpent || 0) + minsToCommit } : t
            ));
            
            setActiveTaskTimer(curr => curr ? {
               ...curr,
               sessionStart: Date.now(),
               accumulatedSeconds: remainingSecs
            } : null);
         }
      }, 1000);
    } else if (activeTaskTimer) {
      setCurrentTimerDisplay(activeTaskTimer.accumulatedSeconds);
    } else {
      setCurrentTimerDisplay(0);
    }
    return () => clearInterval(interval);
  }, [activeTaskTimer, setTasks]);

  const toggleTimer = (taskId: number) => {
    if (activeTaskTimer?.taskId === taskId) {
      if (activeTaskTimer.isRunning) {
        // Stop timer
        const currentMs = Date.now();
        const addedSeconds = Math.floor((currentMs - activeTaskTimer.sessionStart) / 1000);
        const totalSeconds = activeTaskTimer.accumulatedSeconds + addedSeconds;
        
        const minsToCommit = Math.floor(totalSeconds / 60);
        if (minsToCommit > 0) {
           setTasks(prev => prev.map(t => 
             t.id === taskId ? { ...t, timeSpent: (t.timeSpent || 0) + minsToCommit } : t
           ));
        }
        setActiveTaskTimer(null);
      } else {
        // Shouldn't really happen since it is paused by blur but we can support resume
        setActiveTaskTimer({
          ...activeTaskTimer,
          isRunning: true,
          sessionStart: Date.now()
        });
      }
    } else {
      // Start fresh or switch tasks
      if (activeTaskTimer) {
         // Commit previous
         const currentMs = Date.now();
         const addedSeconds = activeTaskTimer.isRunning ? Math.floor((currentMs - activeTaskTimer.sessionStart) / 1000) : 0;
         const totalSeconds = activeTaskTimer.accumulatedSeconds + addedSeconds;
         const minsToCommit = Math.floor(totalSeconds / 60);
         if (minsToCommit > 0) {
            setTasks(prev => prev.map(t => 
              t.id === activeTaskTimer.taskId ? { ...t, timeSpent: (t.timeSpent || 0) + minsToCommit } : t
            ));
         }
      }
      setActiveTaskTimer({
        taskId,
        isRunning: true,
        sessionStart: Date.now(),
        accumulatedSeconds: 0
      });
    }
  };

  const handleLogTime = () => {
    const mins = parseInt(timeToLog);
    if (!isNaN(mins) && mins > 0 && selectedTask) {
      setTasks(prev => prev.map(t => 
        t.id === selectedTask.id ? { ...t, timeSpent: (t.timeSpent || 0) + mins } : t
      ));
      setTimeToLog('');
      const desc = timeLogDescription.trim() ? `Logged ${mins} mins: ${timeLogDescription.trim()}` : `Logged ${mins} mins`;
      logActivity(selectedTask.id, 'time_logged', desc);
      setTimeLogDescription('');
    }
  };

  const handleUpdateSelectedTask = (field: keyof Task, value: any) => {
    setTasks(prev => prev.map(t => t.id === selectedTask?.id ? { ...t, [field]: value } : t));
    if (selectedTask) {
      logActivity(selectedTask.id, 'update', `Updated ${field.toString()}`);
    }
  };

  const handlePriorityChange = (taskId: number, newPriority: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));
    setOpenPriorityDropdown(null);
    logActivity(taskId, 'priority_change', `Changed priority to ${newPriority}`);
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (newStatus !== 'Not Started' && newStatus !== task.status) {
      if (task.dependencies && task.dependencies.length > 0) {
        let notificationMsg = '';
        const incompleteDeps = task.dependencies.filter(depId => {
          const dep = tasks.find(t => t.id === depId);
          if (!dep) return false;
          if (dep.status !== 'Completed') {
            if (!notificationMsg) notificationMsg = `Cannot start task. Prerequisite tasks must be completed first.`;
            return true;
          }
          const delayDays = task.dependencyDelays?.[depId] || 0;
          if (delayDays > 0 && dep.completedAt) {
            const completedDate = new Date(dep.completedAt);
            const now = new Date();
            const daysPassed = (now.getTime() - completedDate.getTime()) / (1000 * 3600 * 24);
            if (daysPassed < delayDays) {
              if (!notificationMsg) notificationMsg = `Must wait ${delayDays} day(s) after prerequisite "${dep.title}" is completed.`;
              return true;
            }
          }
          return false;
        });
        
        if (incompleteDeps.length > 0) {
          setNotification(notificationMsg);
          setTimeout(() => setNotification(null), 5000);
          setOpenStatusDropdown(null);
          return;
        }
      }
    }

    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        let newProgress = t.progress;
        let newLastActiveProgress = t.lastActiveProgress ?? t.progress ?? 50;

        if (t.status !== 'Completed' && t.status !== 'Not Started') {
            newLastActiveProgress = t.progress ?? 50;
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

        return {
          ...t,
          status: newStatus,
          progress: newProgress,
          lastActiveProgress: newLastActiveProgress,
          completedAt: newStatus === 'Completed' ? now : (newStatus === t.status ? t.completedAt : undefined)
        };
      }
      return t;
    }));
    setOpenStatusDropdown(null);
    logActivity(taskId, 'status_change', `Status changed to ${newStatus}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flame className="w-3 h-3" />;
      case 'medium': return <AlertTriangle className="w-3 h-3" />;
      case 'low': return <ArrowDown className="w-3 h-3" />;
      default: return null;
    }
  };

  const getPriorityWeight = (priority: string) => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-amber-400" />;
      default: return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;
    
    logActivity(selectedTask.id, 'Comment', newComment);
    setNewComment('');
  };

  const handleAddReminder = (taskId: number, type: 'in-app' | 'email' | 'whatsapp', offset: string) => {
    const taskDueDate = tasks.find(t => t.id === taskId)?.dueDate || '';
    const calculatedTime = calculateReminderTime(taskDueDate, offset);
    const timestamp = calculateReminderTimestamp(taskDueDate, offset) || undefined;
    const newReminder = { id: Date.now() + Math.random(), type, offset, calculatedTime, timestamp, triggered: false };
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, reminders: [...(t.reminders || []), newReminder] };
      }
      return t;
    }));
    logActivity(taskId, 'reminder_added', `Added a ${type} reminder for ${calculatedTime}`);

    setNotification(`${type === 'email' ? 'Email' : type === 'whatsapp' ? 'WhatsApp' : 'In-App'} reminder set for ${calculatedTime}`);
    setTimeout(() => setNotification(null), 5000);
    setShowReminderOptions(false);
  };

  const handleRemoveReminder = (taskId: number, reminderId: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, reminders: (t.reminders || []).filter(r => r.id !== reminderId) };
      }
      return t;
    }));
    logActivity(taskId, 'reminder_removed', 'Removed a reminder');
  };

  const handleAddSubtask = (taskId: number, title: string) => {
    if (!title.trim()) return;
    const newSubtask = { id: Date.now() + Math.random(), title, completed: false };
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSubtasks = [...(t.subtasks || []), newSubtask];
        const newProgress = newSubtasks.length > 0 ? Math.round((newSubtasks.filter(s => s.completed).length / newSubtasks.length) * 100) : 0;
        let newStatus = t.status;
        if (newProgress === 100) newStatus = 'Completed';
        else if (newProgress === 0) newStatus = 'Not Started';
        else if (t.status === 'Completed' || t.status === 'Not Started') newStatus = 'In Progress';
        return { ...t, subtasks: newSubtasks, progress: newProgress, status: newStatus };
      }
      return t;
    }));
    logActivity(taskId, 'subtask_added', `Added subtask "${title}"`);
  };

  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  const handleAIGenerateSubtasks = async (taskId: number, title: string, description?: string) => {
    setIsGeneratingSubtasks(true);
    addNotification({ type: 'info', message: 'AI is generating subtasks...' });
    
    try {
      const response = await fetch('/api/generate-subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      
      if (!response.ok) throw new Error('Failed to generate subtasks');
      
      const { subtasks } = await response.json();
      
      if (subtasks && subtasks.length > 0) {
        setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            const newSubtasks = [...(t.subtasks || []), ...subtasks.map((st: string) => ({ id: Date.now() + Math.random(), title: st, completed: false }))];
            const newProgress = newSubtasks.length > 0 ? Math.round((newSubtasks.filter(s => s.completed).length / newSubtasks.length) * 100) : 0;
            let newStatus = t.status;
            if (newProgress === 100) newStatus = 'Completed';
            else if (newProgress === 0) newStatus = 'Not Started';
            else if (t.status === 'Completed' || t.status === 'Not Started') newStatus = 'In Progress';
            
            return { ...t, subtasks: newSubtasks, progress: newProgress, status: newStatus };
          }
          return t;
        }));
        logActivity(taskId, 'subtasks_generated', 'AI generated subtasks');
        addNotification({ type: 'success', message: 'Subtasks generated successfully' });
      }
    } catch (error: any) {
      addNotification({ type: 'error', message: error.message || 'AI generation failed' });
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleToggleSubtask = (taskId: number, subtaskId: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSubtasks = (t.subtasks || []).map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
        const newProgress = newSubtasks.length > 0 ? Math.round((newSubtasks.filter(s => s.completed).length / newSubtasks.length) * 100) : 0;
        let newStatus = t.status;
        if (newProgress === 100) newStatus = 'Completed';
        else if (newProgress === 0) newStatus = 'Not Started';
        else if (t.status === 'Completed' || t.status === 'Not Started') newStatus = 'In Progress';
        
        // Handle lastActiveProgress
        let newLastActiveProgress = t.lastActiveProgress ?? (t.progress || 0);
        if (newProgress > 0 && newProgress < 100) {
            newLastActiveProgress = newProgress;
        }

        return { 
          ...t, 
          subtasks: newSubtasks,
          progress: newProgress,
          status: newStatus,
          lastActiveProgress: newLastActiveProgress
        };
      }
      return t;
    }));
    logActivity(taskId, 'subtask_toggled', 'Toggled subtask status');
  };

  const handleRemoveSubtask = (taskId: number, subtaskId: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSubtasks = (t.subtasks || []).filter(s => s.id !== subtaskId);
        const newProgress = newSubtasks.length > 0 ? Math.round((newSubtasks.filter(s => s.completed).length / newSubtasks.length) * 100) : 0;
        let newStatus = t.status;
        if (newProgress === 100) newStatus = 'Completed';
        else if (newProgress === 0) newStatus = 'Not Started';
        else if (t.status === 'Completed' || t.status === 'Not Started') newStatus = 'In Progress';
        return { ...t, subtasks: newSubtasks, progress: newProgress, status: newStatus };
      }
      return t;
    }));
    logActivity(taskId, 'subtask_removed', 'Removed a subtask');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
    const workflowsArray = newTask.workflows ? newTask.workflows.split(',').map(name => name.trim()).filter(Boolean) : [];
    const toolsArray = newTask.tools ? newTask.tools.split(',').map(name => name.trim()).filter(Boolean) : [];

    const taskToAdd: Task = {
      id: newId,
      title: newTask.title,
      project: newTask.project || 'Unassigned Project',
      assignee: newTask.assignee || 'Unassigned',
      status: 'Not Started',
      priority: newTask.priority,
      startDate: newTask.startDate || 'No date',
      dueDate: newTask.dueDate || 'No date',
      dependencies: [],
      dependencyDelays: {},
      reminders: [],
      workflows: workflowsArray,
      instructions: newTask.instructions,
      guidelines: newTask.guidelines,
      tools: toolsArray,
      notes: newTask.notes,
      estimatedTime: newTask.estimatedTime
    };

    setTasks([...tasks, taskToAdd]);
    setIsAddTaskModalOpen(false);
    
    if (taskToAdd.assignee && taskToAdd.assignee !== 'Unassigned') {
      setNotification(`Notification sent to ${taskToAdd.assignee}: You have been assigned to "${taskToAdd.title}"`);
      setTimeout(() => setNotification(null), 5000);
    }
    
    setNewTask({
      title: '',
      project: '',
      assignee: '',
      priority: 'medium',
      startDate: '',
      dueDate: '',
      workflows: '',
      instructions: '',
      guidelines: '',
      tools: '',
      notes: '',
      estimatedTime: undefined
    });
  };

  const handleDelayChange = (taskId: number, depId: number, delayString: string) => {
    const delay = parseInt(delayString) || 0;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          dependencyDelays: { ...t.dependencyDelays, [depId]: delay }
        };
      }
      return t;
    }));
  };

  const addDependency = (taskId: number, depId: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dependencies: [...(t.dependencies || []), depId] } : t));
    setShowAddDependency(false);
    logActivity(taskId, 'dependency_added', 'Added a prerequisite task');
  };

  const removeDependency = (taskId: number, depId: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dependencies: (t.dependencies || []).filter(id => id !== depId) } : t));
    logActivity(taskId, 'dependency_removed', 'Removed a prerequisite task');
  };

  const toggleTaskSelection = (id: number) => {
    setSelectedTaskIds(prev => prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]);
  };

  const handleBulkStatusChange = (status: string) => {
    if (selectedTaskIds.length === 0) return;
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => {
      if (selectedTaskIds.includes(t.id)) {
        let newProgress = t.progress;
        let newLastActiveProgress = t.lastActiveProgress ?? t.progress ?? 50;

        if (t.status !== 'Completed' && t.status !== 'Not Started') {
            newLastActiveProgress = t.progress ?? 50;
        }

        if (status === 'Completed') {
            newProgress = 100;
        } else if (status === 'Not Started') {
            newProgress = 0;
        } else if (t.status === 'Completed' || t.status === 'Not Started') {
            if (newLastActiveProgress > 0 && newLastActiveProgress < 100) {
                newProgress = newLastActiveProgress;
            } else {
                newProgress = 50;
            }
        }

        return {
          ...t,
          status,
          progress: newProgress,
          lastActiveProgress: newLastActiveProgress,
          completedAt: status === 'Completed' ? now : (status === t.status ? t.completedAt : undefined)
        };
      }
      return t;
    }));
    setSelectedTaskIds([]);
    addNotification({ type: 'success', message: `${selectedTaskIds.length} tasks marked as ${status}` });
    selectedTaskIds.forEach(id => logActivity(id, 'status_change', `Status bulk changed to ${status}`));
  };

  const handleBulkReassignTasks = () => {
    if (selectedTaskIds.length === 0 || !bulkReassignTarget) return;
    
    setTasks(prev => prev.map(t => {
      if (selectedTaskIds.includes(t.id)) {
        return { ...t, assignee: bulkReassignTarget };
      }
      return t;
    }));
    
    addNotification({ type: 'success', message: `Reassigned ${selectedTaskIds.length} tasks to ${bulkReassignTarget}` });
    selectedTaskIds.forEach(id => logActivity(id, 'reassignment', `Bulk reassigned to ${bulkReassignTarget}`));
    
    setSelectedTaskIds([]);
    setBulkReassignTarget("");
  };

  const displayedTasks = tasks.filter(task => activeTab === 'all' || task.status === activeTab);
  if (sortByPriority !== 'none') {
    displayedTasks.sort((a, b) => {
      const weightA = getPriorityWeight(a.priority);
      const weightB = getPriorityWeight(b.priority);
      if (sortByPriority === 'desc') {
        return weightB - weightA;
      } else {
        return weightA - weightB;
      }
    });
  }

  const handleAIPrioritize = async () => {
    setIsPrioritizing(true);
    addNotification({ type: 'info', message: 'AI is analyzing and prioritizing your tasks...' });
    
    try {
      const response = await fetch('/api/prioritize-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, date: new Date().toISOString() })
      });
      
      if (!response.ok) throw new Error('Failed to prioritize tasks');
      
      const { orderedTaskIds } = await response.json();
      
      if (orderedTaskIds && orderedTaskIds.length > 0) {
        setTasks(prev => {
          const newTasks = [...prev];
          newTasks.sort((a, b) => {
            const idxA = orderedTaskIds.indexOf(a.id);
            const idxB = orderedTaskIds.indexOf(b.id);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });
          return newTasks;
        });
        addNotification({ type: 'success', message: 'Tasks prioritized successfully by AI' });
      }
    } catch (error: any) {
      addNotification({ type: 'error', message: error.message || 'AI prioritization failed' });
    } finally {
      setIsPrioritizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Tasks
            <button 
              onClick={handleAIPrioritize}
              disabled={isPrioritizing || tasks.length === 0}
              className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 transition-colors ${
                isPrioritizing 
                  ? 'bg-purple-500/20 text-purple-400 cursor-not-allowed opacity-70' 
                  : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
              }`}
              title="Use AI to re-order tasks based on deadlines and estimated time"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isPrioritizing ? 'animate-pulse' : ''}`} />
              {isPrioritizing ? 'Prioritizing...' : 'AI Prioritize'}
            </button>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage your daily tasks and to-dos.</p>
        </div>
        <button 
          onClick={() => setIsAddTaskModalOpen(true)}
          className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/50 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {['all', 'Not Started', 'In Progress', 'Review', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-[#1E2D40] text-white border border-slate-700/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 mr-2 border border-slate-700/50">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              title="Kanban View"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setSortByPriority(prev => prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-colors ${
              sortByPriority !== 'none' 
                ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            Sort by Priority
            {sortByPriority === 'desc' && <ArrowDown className="w-4 h-4 ml-1" />}
            {sortByPriority === 'asc' && <ArrowDown className="w-4 h-4 ml-1 transform rotate-180" />}
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
      <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 overflow-hidden">
        {selectedTaskIds.length > 0 && (
          <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-400">{selectedTaskIds.length} tasks selected</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">Mark as:</span>
              <button 
                onClick={() => handleBulkStatusChange('Completed')}
                className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors"
               >
                 Completed
               </button>
               <button 
                onClick={() => handleBulkStatusChange('In Progress')}
                className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors"
               >
                 In Progress
               </button>
               <div className="h-4 w-px bg-slate-700 mx-2"></div>
               <span className="text-xs text-slate-400">Reassign:</span>
               <select
                 value={bulkReassignTarget}
                 onChange={(e) => setBulkReassignTarget(e.target.value)}
                 className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#0ED7A8] transition-all max-w-[120px]"
               >
                 <option value="">Select Team Member</option>
                 {teamMembers.map((memberRaw, i) => (
                   <option key={`m-${i}`} value={memberRaw.name}>{memberRaw.name}</option>
                 ))}
               </select>
               <button
                 onClick={handleBulkReassignTasks}
                 disabled={!bulkReassignTarget}
                 className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
               >
                 Apply
               </button>
            </div>
          </div>
        )}
        <div className="divide-y divide-slate-700/50">
          {displayedTasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-800/50 transition-colors flex items-center gap-4 group cursor-pointer" onClick={(e) => {
              // Prevent opening modal if clicking on dropdowns or checkbox
              if ((e.target as HTMLElement).closest('.relative') || (e.target as HTMLElement).closest('.bulk-checkbox')) return;
              setSelectedTask(task);
              setShowReminderOptions(false);
              setShowAddDependency(false);
            }}>
              <div className="bulk-checkbox flex items-center" onClick={(e) => e.stopPropagation()}>
                 <input 
                   type="checkbox" 
                   checked={selectedTaskIds.includes(task.id)}
                   onChange={() => toggleTaskSelection(task.id)}
                   className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-[#0ED7A8] focus:ring-[#0ED7A8] focus:ring-offset-slate-900 cursor-pointer"
                 />
              </div>
              <div className="relative flex-shrink-0 mt-1">
                <button 
                  onClick={() => {
                    const hasUnmetDeps = isTaskBlocked(task);
                    if (task.status === 'Not Started' && hasUnmetDeps) {
                       setNotification("Cannot start task. Prerequisite tasks must be completed first.");
                       setTimeout(() => setNotification(null), 3000);
                       return;
                    }
                    setOpenStatusDropdown(openStatusDropdown === task.id ? null : task.id);
                  }}
                  className={`hover:scale-110 transition-transform ${task.status === 'Not Started' && isTaskBlocked(task) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={task.status === 'Not Started' && isTaskBlocked(task) ? "Blocked by incomplete prerequisites" : ""}
                >
                  {task.status === 'Not Started' && isTaskBlocked(task) ? (
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-slate-600 text-slate-500 bg-slate-800">
                      <Lock className="w-4 h-4" />
                    </div>
                  ) : getStatusIcon(task.status)}
                </button>
                {openStatusDropdown === task.id && (
                  <div className="absolute top-full left-0 mt-2 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
                    {STATUSES.map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(task.id, status)}
                        className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-700 transition-colors flex items-center gap-2 ${
                          task.status === status ? 'text-[#0ED7A8] bg-slate-700/50' : 'text-slate-300'
                        }`}
                      >
                        {getStatusIcon(status)}
                        {status.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-sm font-medium truncate ${
                    task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-white'
                  }`}>
                    {task.title}
                  </h3>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenPriorityDropdown(openPriorityDropdown === task.id ? null : task.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider flex items-center gap-1 hover:opacity-80 transition-opacity ${getPriorityColor(task.priority)}`}
                    >
                      {getPriorityIcon(task.priority)}
                      {task.priority}
                      <ChevronDown className="w-3 h-3 ml-0.5" />
                    </button>
                    {openPriorityDropdown === task.id && (
                      <div className="absolute top-full left-0 mt-1 w-28 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
                        {PRIORITIES.map(priority => (
                          <button
                            key={priority}
                            onClick={() => handlePriorityChange(task.id, priority)}
                            className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-wider font-medium hover:bg-slate-700 transition-colors flex items-center gap-1.5 ${
                              task.priority === priority ? 'bg-slate-700/50' : ''
                            } ${getPriorityColor(priority).split(' ')[0]}`}
                          >
                            {getPriorityIcon(priority)}
                            {priority}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="truncate">{task.project}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span className="flex items-center gap-1" title="Dates">
                    <AlertCircle className="w-3 h-3" />
                    {formatDueDate(task.startDate)} - {formatDueDate(task.dueDate)}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block"></span>
                  {!task.estimatedTime ? (
                    <span className="hidden sm:flex items-center gap-1" title="Time Tracked">
                      <Clock className="w-3 h-3" />
                      {task.timeSpent ? `${Math.floor(task.timeSpent / 60)}h ${task.timeSpent % 60}m` : '0m'}
                    </span>
                  ) : (
                    <div className="hidden sm:flex items-center gap-2" title="Time vs Estimated">
                      <Clock className="w-3 h-3" />
                      <div className="w-24 h-1.5 bg-slate-700/50 rounded-full overflow-hidden relative">
                         <div 
                           className={`absolute top-0 left-0 bottom-0 transition-all ${((task.timeSpent || 0) > task.estimatedTime) ? 'bg-rose-500' : 'bg-[#0ED7A8]'}`}
                           style={{ width: `${Math.min(((task.timeSpent || 0) / task.estimatedTime) * 100, 100)}%` }}
                         />
                      </div>
                      <span className={`text-[10px] ${((task.timeSpent || 0) > task.estimatedTime) ? 'text-rose-400' : ''}`}>
                         {task.timeSpent ? `${Math.floor(task.timeSpent / 60)}h ${task.timeSpent % 60}m` : '0m'} / {Math.floor(task.estimatedTime / 60)}h
                      </span>
                    </div>
                  )}
                  {task.dependencies && task.dependencies.length > 0 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block"></span>
                      <div className="hidden sm:flex items-center gap-2">
                        {task.dependencies.map(depId => {
                          const dep = tasks.find(t => t.id === depId);
                          if (!dep) return null;
                          const isMet = isDependencyMet(task.id, depId);
                          
                          let tooltipMsg = `Prerequisite: ${dep.title} (Not Completed)`;
                          const delayDays = task.dependencyDelays?.[depId] || 0;
                          
                          if (dep.status === 'Completed' && !isMet) {
                            if (dep.completedAt) {
                              const completedDate = new Date(dep.completedAt);
                              const now = new Date();
                              const daysPassed = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 3600 * 24));
                              const daysLeft = Math.max(0, delayDays - daysPassed);
                              tooltipMsg = `Wait: ${daysLeft} day(s) remaining after "${dep.title}" completion`;
                            } else {
                              tooltipMsg = `Wait: Delay period not met for "${dep.title}"`;
                            }
                          } else if (isMet) {
                            tooltipMsg = `Prerequisite met: ${dep.title}`;
                          }
                          
                          return (
                            <span key={depId} className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${isMet ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`} title={tooltipMsg}>
                              {isMet ? <CheckCircle2 className="w-3 h-3" /> : (dep.status === 'Completed' && !isMet) ? <Clock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              <span className="max-w-[80px] truncate">{dep.title}</span>
                            </span>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block"></span>
                      <span className="hidden sm:flex items-center gap-1 text-[#0ED7A8] font-medium" title={`${task.subtasks.filter(s => s.completed).length} of ${task.subtasks.length} subtasks completed`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-medium text-white">
                    {task.assignee.charAt(0)}
                  </div>
                  <span className="text-sm text-slate-300">{task.assignee}</span>
                </div>
                <button className="text-slate-400 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {displayedTasks.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No tasks found in this category.
            </div>
          )}
        </div>
      </div>
      )}

      {viewMode === 'kanban' && (
      <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {STATUSES.map((statusColumn) => (
          <div 
             key={statusColumn} 
             className="w-[320px] shrink-0 flex flex-col bg-[#1E2D40] rounded-xl border border-slate-700/50"
             onDragOver={(e) => {
               e.preventDefault();
               e.currentTarget.classList.add('bg-slate-800/50');
             }}
             onDragLeave={(e) => {
               e.currentTarget.classList.remove('bg-slate-800/50');
             }}
             onDrop={(e) => {
               e.preventDefault();
               e.currentTarget.classList.remove('bg-slate-800/50');
               const taskId = parseInt(e.dataTransfer.getData('taskId'));
               if (!isNaN(taskId)) {
                 handleStatusChange(taskId, statusColumn);
               }
             }}
          >
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(statusColumn)}
                <h3 className="font-semibold text-white capitalize">{statusColumn.replace('-', ' ')}</h3>
              </div>
              <span className="bg-slate-800 text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
                {displayedTasks.filter(t => t.status === statusColumn).length}
              </span>
            </div>
            <div className="p-4 space-y-4 flex-1 min-h-[200px]">
              {displayedTasks.filter(t => t.status === statusColumn).map((task) => (
                <div 
                  key={task.id} 
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('taskId', task.id.toString());
                  }}
                  className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-grab active:cursor-grabbing shadow-sm transition-all hover:border-slate-600 group"
                  onClick={() => {
                    setSelectedTask(task);
                    setShowReminderOptions(false);
                    setShowAddDependency(false);
                  }}
                >
                  <div className="flex items-start justify-between mb-3 gap-2 pointer-events-none">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider flex items-center gap-1 shrink-0 ${getPriorityColor(task.priority)}`}>
                       {getPriorityIcon(task.priority)}
                       {task.priority}
                     </span>
                     {task.dependencies && task.dependencies.length > 0 && task.status === 'Not Started' && isTaskBlocked(task) && (
                       <Lock className="w-4 h-4 text-slate-500 shrink-0" title="Blocked by prerequisites" />
                     )}
                  </div>
                  <h4 className={`text-sm font-medium mb-3 pointer-events-none ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-white'}`}>{task.title}</h4>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 pointer-events-none mb-3">
                     <div className="flex items-center gap-2">
                       <Folder className="w-3 h-3" />
                       <span className="truncate max-w-[80px]">{task.project}</span>
                     </div>
                     {!task.estimatedTime && (
                       <div className="flex items-center gap-1" title="Time Tracked">
                         <Clock className="w-3 h-3" />
                         <span>{task.timeSpent ? `${Math.floor(task.timeSpent / 60)}h ${task.timeSpent % 60}m` : '0m'}</span>
                       </div>
                     )}
                     <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-medium text-white text-[10px]">
                           {task.assignee.charAt(0)}
                        </div>
                     </div>
                  </div>
                  
                  {task.estimatedTime ? (
                    <div className="pointer-events-none w-full">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1 items-center">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.timeSpent ? `${Math.floor(task.timeSpent / 60)}h ${task.timeSpent % 60}m` : '0m'} / {Math.floor(task.estimatedTime / 60)}h</span>
                        </div>
                        <span className={((task.timeSpent || 0) > task.estimatedTime) ? 'text-rose-400' : ''}>
                          {Math.round(((task.timeSpent || 0) / task.estimatedTime) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full transition-all ${((task.timeSpent || 0) > task.estimatedTime) ? 'bg-rose-500' : 'bg-[#0ED7A8]'}`} 
                           style={{ width: `${Math.min(((task.timeSpent || 0) / task.estimatedTime) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
              {displayedTasks.filter(t => t.status === statusColumn).length === 0 && (
                <div className="text-center p-4 text-xs text-slate-500 font-medium border-2 border-dashed border-slate-700/50 rounded-lg pointer-events-none">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-lg relative z-10 shadow-2xl">
            <div className="p-6 border-b border-slate-700/50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-2.5">
                  {getStatusIcon(selectedTask.status)}
                </div>
                <div className="flex-1">
                  <DebouncedInput
                    type="text"
                    value={selectedTask.title}
                    onChange={(e) => handleUpdateSelectedTask('title', e.target.value)}
                    className="w-full bg-transparent text-lg font-semibold text-white focus:outline-none border-b border-transparent focus:border-[#0ED7A8] leading-tight px-1 py-0.5 -ml-1 transition-colors"
                  />
                  
                  <div className="mt-4 mb-2 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium uppercase tracking-wider">Progress</span>
                      <span className="text-[#0ED7A8] font-bold">{selectedTask.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ease-out ${(selectedTask.progress || 0) === 100 ? 'bg-emerald-400' : 'bg-[#0ED7A8]'}`}
                        style={{ width: `${selectedTask.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="relative flex items-center">
                      <select 
                        value={selectedTask.priority}
                        onChange={(e) => handleUpdateSelectedTask('priority', e.target.value)}
                        className={`appearance-none cursor-pointer outline-none bg-transparent pl-6 pr-7 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${getPriorityColor(selectedTask.priority)}`}
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                      <div className="absolute left-2 pointer-events-none">
                         {getPriorityIcon(selectedTask.priority)}
                      </div>
                      <ChevronDown className="absolute right-2 w-3 h-3 pointer-events-none opacity-50" />
                    </div>
                    
                    <div className="relative flex items-center">
                      <select
                        value={selectedTask.status}
                        onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                        className="appearance-none cursor-pointer outline-none text-xs text-slate-300 uppercase tracking-wider font-medium bg-slate-800 border-none pl-3 pr-7 py-1 rounded"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <ChevronDown className="absolute right-2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Folder className="w-4 h-4" />
                    <span>Project</span>
                  </div>
                  <DebouncedInput
                     type="text"
                     value={selectedTask.project}
                     onChange={(e) => handleUpdateSelectedTask('project', e.target.value)}
                     className="text-sm font-medium text-white bg-transparent outline-none border-b border-transparent focus:border-slate-600 pl-6 w-full"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <User className="w-4 h-4" />
                    <span>Assignee</span>
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-medium text-white flex-shrink-0">
                      {selectedTask.assignee.charAt(0)}
                    </div>
                    <DebouncedInput
                      type="text"
                      value={selectedTask.assignee}
                      onChange={(e) => handleUpdateSelectedTask('assignee', e.target.value)}
                      className="text-sm font-medium text-white bg-transparent outline-none border-b border-transparent focus:border-slate-600 w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Start Date</span>
                  </div>
                  <div className="pl-6">
                    <input
                      type="date"
                      value={selectedTask.startDate}
                      onChange={(e) => handleUpdateSelectedTask('startDate', e.target.value)}
                      className="text-sm font-medium text-slate-300 bg-transparent outline-none border-b border-transparent focus:border-slate-600 w-[140px] appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Due Date</span>
                  </div>
                  <div className="pl-6">
                    <input
                      type="date"
                      value={selectedTask.dueDate}
                      onChange={(e) => handleUpdateSelectedTask('dueDate', e.target.value)}
                      className="text-sm font-medium text-slate-300 bg-transparent outline-none border-b border-transparent focus:border-slate-600 w-[140px] appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>Estimated Time</span>
                  </div>
                  <div className="text-sm font-medium text-white pl-6 flex items-center">
                    <input 
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Hours..."
                      value={selectedTask.estimatedTime ? selectedTask.estimatedTime / 60 : ''}
                      onChange={(e) => handleUpdateSelectedTask('estimatedTime', e.target.value ? parseFloat(e.target.value) * 60 : undefined)}
                      className="bg-transparent border-b border-transparent focus:border-slate-600 w-20 outline-none text-white transition-colors"
                    />
                    <span className="text-slate-500 ml-1">hours</span>
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col w-full max-w-xs">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>Time Tracked</span>
                  </div>
                  <div className="text-sm font-medium text-white pl-6">
                    {!selectedTask.estimatedTime ? (
                      selectedTask.timeSpent ? (
                        <span>{Math.floor(selectedTask.timeSpent / 60)}h {selectedTask.timeSpent % 60}m</span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )
                    ) : (
                      <div className="flex flex-col gap-2 relative mt-1">
                        <div className="flex justify-between items-center text-xs">
                          <span>{selectedTask.timeSpent ? `${Math.floor(selectedTask.timeSpent / 60)}h ${selectedTask.timeSpent % 60}m` : '0m'}</span>
                          <span className={`${((selectedTask.timeSpent || 0) > selectedTask.estimatedTime) ? 'text-rose-400' : 'text-slate-400'}`}>
                             {Math.floor(selectedTask.estimatedTime / 60)}h {selectedTask.estimatedTime % 60}m estimated
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                           <div 
                             className={`h-full rounded-full transition-all ${((selectedTask.timeSpent || 0) > selectedTask.estimatedTime) ? 'bg-rose-500' : 'bg-[#0ED7A8]'}`}
                             style={{ width: `${Math.min(((selectedTask.timeSpent || 0) / selectedTask.estimatedTime) * 100, 100)}%` }}
                           />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2 space-y-1.5 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <span>Description</span>
                  </div>
                  <DebouncedTextarea
                    value={selectedTask.description || ''}
                    onChange={(e) => handleUpdateSelectedTask('description', e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white resize-y min-h-[80px]"
                  />
                </div>
              </div>

              {/* Time Logging */}
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>Log Time</span>
                  </div>
                  {selectedTask && (
                    <button
                      onClick={() => toggleTimer(selectedTask.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                        activeTaskTimer?.taskId === selectedTask.id
                          ? activeTaskTimer.isRunning
                            ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                          : 'bg-[#0ED7A8]/20 text-[#0ED7A8] hover:bg-[#0ED7A8]/30'
                      }`}
                    >
                      {activeTaskTimer?.taskId === selectedTask.id ? (
                        <>
                          <div className={`w-2 h-2 rounded-full ${activeTaskTimer.isRunning ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'}`}></div>
                          {activeTaskTimer.isRunning ? 'Stop Tracker' : 'Tracker Paused'} ({Math.floor(currentTimerDisplay / 60)}:{(currentTimerDisplay % 60).toString().padStart(2, '0')})
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-[#0ED7A8]"></div>
                          Start Tracker
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Minutes"
                      value={timeToLog}
                      onChange={e => setTimeToLog(e.target.value)}
                      className="w-24 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={timeLogDescription}
                      onChange={e => setTimeLogDescription(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleLogTime();
                      }}
                      className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#0ED7A8] text-white"
                    />
                    <button
                      onClick={handleLogTime}
                      disabled={!timeToLog || parseInt(timeToLog) <= 0}
                      className="px-3 py-1.5 bg-[#0ED7A8] text-slate-900 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Log
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Subtasks</span>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {(selectedTask.subtasks || []).filter(s => s.completed).length}/{(selectedTask.subtasks || []).length} completed
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {(selectedTask.subtasks || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No subtasks. Add one below!</p>
                  ) : (
                    (selectedTask.subtasks || []).map(subtask => (
                      <div key={subtask.id} className="flex items-center justify-between bg-slate-800/50 p-2.5 rounded-lg border border-slate-700 group">
                        <label className="flex items-center gap-3 cursor-pointer w-full">
                          <input 
                            type="checkbox" 
                            checked={subtask.completed} 
                            onChange={() => handleToggleSubtask(selectedTask.id, subtask.id)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-[#0ED7A8] focus:ring-[#0ED7A8]"
                          />
                          <span className={`text-sm select-none transition-colors ${subtask.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                            {subtask.title}
                          </span>
                        </label>
                        <button 
                          onClick={() => handleRemoveSubtask(selectedTask.id, subtask.id)} 
                          className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-2"
                          title="Remove subtask"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="text" 
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask(selectedTask.id, newSubtaskTitle);
                        setNewSubtaskTitle('');
                      }
                    }}
                    placeholder="Add a new subtask..." 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] text-white transition-all placeholder-slate-500"
                  />
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        handleAddSubtask(selectedTask.id, newSubtaskTitle);
                        setNewSubtaskTitle('');
                      }}
                      disabled={!newSubtaskTitle.trim()}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAIGenerateSubtasks(selectedTask.id, selectedTask.title, selectedTask.description)}
                      disabled={isGeneratingSubtasks}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      title="Auto-generate subtasks with AI"
                    >
                      <Sparkles className={`w-4 h-4 ${isGeneratingSubtasks ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dependencies Section */}
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                    <span>Dependencies</span>
                  </div>
                  <button 
                    onClick={() => setShowAddDependency(!showAddDependency)}
                    className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                <div className="space-y-2 mb-3">
                  {(selectedTask.dependencies || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No dependencies. This task can be started immediately.</p>
                  ) : (
                    (selectedTask.dependencies || []).map(depId => {
                      const depTask = tasks.find(t => t.id === depId);
                      if (!depTask) return null;
                      const delay = selectedTask.dependencyDelays?.[depId] || 0;
                      return (
                        <div key={depId} className="flex items-center justify-between bg-slate-800/50 p-2.5 rounded-lg border border-slate-700 group flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(depTask.status)}
                            <span className={`text-sm ${depTask.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-300 font-medium'}`}>
                              {depTask.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 ml-auto">
                            <div className="flex items-center gap-1.5 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                              <label className="text-xs text-slate-400 whitespace-nowrap">Delay (days):</label>
                              <input 
                                type="number" 
                                min="0" 
                                value={delay} 
                                onChange={(e) => handleDelayChange(selectedTask.id, depId, e.target.value)}
                                className="w-16 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#0ED7A8]"
                              />
                            </div>
                            <button 
                              onClick={() => removeDependency(selectedTask.id, depId)} 
                              className="text-slate-500 hover:text-rose-400 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Remove dependency"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {showAddDependency && (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 max-h-40 overflow-y-auto custom-scrollbar shadow-lg mt-2">
                    {tasks.filter(t => t.id !== selectedTask.id && !(selectedTask.dependencies || []).includes(t.id)).length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-2">No other tasks available to link.</p>
                    ) : (
                      tasks.filter(t => t.id !== selectedTask.id && !(selectedTask.dependencies || []).includes(t.id)).map(t => (
                        <button 
                          key={t.id} 
                          onClick={() => addDependency(selectedTask.id, t.id)} 
                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg flex items-center gap-3 transition-colors"
                        >
                          {getStatusIcon(t.status)}
                          <span className="truncate">{t.title}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Reminder Section */}
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Bell className="w-4 h-4" />
                    <span>Reminders</span>
                  </div>
                  <button 
                    onClick={() => setShowReminderOptions(!showReminderOptions)}
                    className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                <div className="space-y-2 mb-3">
                  {(selectedTask.reminders || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No reminders set for this task.</p>
                  ) : (
                    (selectedTask.reminders || []).map(reminder => (
                      <div key={reminder.id} className="flex items-center justify-between bg-slate-800/50 p-2.5 rounded-lg border border-slate-700 group">
                        <div className="flex items-center gap-3">
                          {reminder.type === 'email' ? <Mail className="w-4 h-4 text-slate-400" /> : reminder.type === 'whatsapp' ? <MessageCircle className="w-4 h-4 text-emerald-400" /> : <Smartphone className="w-4 h-4 text-slate-400" />}
                          <div>
                            <span className="text-sm text-slate-300 font-medium block">
                              {reminder.offset}
                            </span>
                            <span className="text-xs text-slate-500">
                              {reminder.calculatedTime}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveReminder(selectedTask.id, reminder.id)} 
                          className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          title="Remove reminder"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {showReminderOptions && (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mt-2">
                    <p className="text-xs text-slate-400 mb-3 font-medium">Configure reminder:</p>
                    <div className="flex flex-col gap-3">
                      <select 
                        id="task-reminder-time"
                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0ED7A8]"
                      >
                        <option value="1 hour">1 hour before</option>
                        <option value="1 day">1 day before</option>
                      </select>
                      
                      <div className="flex items-center gap-4 py-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" id="task-reminder-email" className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-700" />
                          <span className="text-sm text-slate-300">Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" id="task-reminder-whatsapp" className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700" />
                          <span className="text-sm text-slate-300">WhatsApp</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" id="task-reminder-app" className="w-4 h-4 rounded text-[#0ED7A8] bg-slate-900 border-slate-700" defaultChecked />
                          <span className="text-sm text-slate-300">In-App</span>
                        </label>
                      </div>

                      <button
                        onClick={() => {
                          const time = (document.getElementById('task-reminder-time') as HTMLSelectElement).value;
                          const hasEmail = (document.getElementById('task-reminder-email') as HTMLInputElement).checked;
                          const hasWhatsapp = (document.getElementById('task-reminder-whatsapp') as HTMLInputElement).checked;
                          const hasApp = (document.getElementById('task-reminder-app') as HTMLInputElement).checked;
                          
                          if (hasEmail) handleAddReminder(selectedTask.id, 'email', `${time} before`);
                          if (hasWhatsapp) handleAddReminder(selectedTask.id, 'whatsapp', `${time} before`);
                          if (hasApp) handleAddReminder(selectedTask.id, 'in-app', `${time} before`);
                          
                          if (hasEmail || hasWhatsapp || hasApp) {
                            (document.getElementById('task-reminder-email') as HTMLInputElement).checked = false;
                            (document.getElementById('task-reminder-whatsapp') as HTMLInputElement).checked = false;
                            (document.getElementById('task-reminder-app') as HTMLInputElement).checked = true;
                          }
                        }}
                        className="w-full text-xs font-medium text-slate-900 bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        Add Reminder
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Task Automation & Guidelines Section */}
              <div className="pt-4 border-t border-slate-700/50 space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                   <Shield className="w-4 h-4" />
                   <span>Operations & Task Setup</span>
                </div>
                
                {/* Workflows */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Automated Workflows</label>
                  <ul className="text-xs text-slate-300 list-disc list-inside">
                    {(selectedTask.workflows || []).length > 0
                      ? selectedTask.workflows?.map((w, i) => <li key={i}>{w}</li>)
                      : <span className="text-slate-500 italic">No automated workflows applied.</span>}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Instructions</label>
                  <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700 text-xs text-slate-300 min-h-[40px]">
                    {selectedTask.instructions || <span className="text-slate-500 italic">No specific instructions.</span>}
                  </div>
                </div>

                {/* Guidelines */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quality Guidelines</label>
                  <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700 text-xs text-slate-300 min-h-[40px]">
                    {selectedTask.guidelines || <span className="text-slate-500 italic">No special guidelines.</span>}
                  </div>
                </div>

                {/* Tools */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Required Tools</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(selectedTask.tools || []).length > 0
                      ? selectedTask.tools?.map((t, i) => <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded border border-indigo-500/20 font-medium uppercase">{t}</span>)
                      : <span className="text-xs text-slate-500 italic">No specific tools bound.</span>}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">General Notes</label>
                  <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700 text-xs text-slate-300 min-h-[40px]">
                     {selectedTask.notes || <span className="text-slate-500 italic">No additional notes.</span>}
                  </div>
                </div>
              </div>

              {/* Mind Map Section */}
              <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-300 mb-4 pb-2 border-b border-slate-700/50">
                  Task Mind Map
                </h3>
                <MindMap id={selectedTask.id.toString()} type="task" title={selectedTask.title} />
              </div>

              {/* Notify Assignee Section */}
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                   <Send className="w-4 h-4" />
                   <span>Push Notification to Assignee</span>
                </div>
                <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 border-dashed space-y-3 mb-2">
                  <p className="text-xs text-slate-400">Send an instant alert regarding task update, modification or delivery.</p>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const msg = (document.getElementById('task-notify-msg') as HTMLInputElement).value;
                      if (!msg) return;
                      const hasEmail = (document.getElementById('task-notify-email') as HTMLInputElement).checked;
                      const hasWhatsapp = (document.getElementById('task-notify-whatsapp') as HTMLInputElement).checked;
                      const hasApp = (document.getElementById('task-notify-app') as HTMLInputElement).checked;
                      
                      const channels = [];
                      if (hasEmail) channels.push('Email');
                      if (hasWhatsapp) channels.push('WhatsApp');
                      if (hasApp) channels.push('In-App');

                      if (channels.length === 0) return;
                      
                      setNotification(`Notification sent to ${selectedTask.assignee} via: ${channels.join(', ')}`);
                      setTimeout(() => setNotification(null), 5000);
                      (document.getElementById('task-notify-msg') as HTMLInputElement).value = '';
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="task-notify-email" className="w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-700" defaultChecked />
                        <span className="text-xs text-slate-300 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="task-notify-whatsapp" className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700" defaultChecked />
                        <span className="text-xs text-slate-300 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="task-notify-app" className="w-4 h-4 rounded text-[#0ED7A8] bg-slate-900 border-slate-700" defaultChecked />
                        <span className="text-xs text-slate-300 flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> In-App</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        required
                        type="text" 
                        id="task-notify-msg"
                        placeholder={`Message to ${selectedTask.assignee}...`} 
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#0ED7A8] text-white transition-all placeholder-slate-500"
                      />
                      <button 
                        type="submit"
                        className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 flex-shrink-0"
                      >
                        <Send className="w-3 h-3" />
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Activity & Comments History */}
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                  <Activity className="w-4 h-4" />
                  <span>Activity Log</span>
                </div>
                
                {/* Add Comment Input */}
                <div className="flex bg-slate-900 border border-slate-700 focus-within:border-[#0ED7A8] rounded-xl p-1 mb-4 transition-all">
                   <input
                     type="text"
                     id="task-comment-input"
                     placeholder="Add a comment or update..."
                     className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none px-3 py-2 placeholder-slate-500"
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         e.preventDefault();
                         const input = e.currentTarget;
                         if (input.value.trim()) {
                           logActivity(selectedTask.id, 'Comment', input.value.trim());
                           input.value = '';
                         }
                       }
                     }}
                   />
                   <button
                     onClick={() => {
                       const input = document.getElementById('task-comment-input') as HTMLInputElement;
                       if (input && input.value.trim()) {
                         logActivity(selectedTask.id, 'Comment', input.value.trim());
                         input.value = '';
                       }
                     }}
                     className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                   >
                     <MessageCircle className="w-4 h-4" />
                     Post
                   </button>
                </div>

                <div className="space-y-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar mb-4">
                  {(selectedTask.activity || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No activity recorded yet. Be the first to add an update!</p>
                  ) : (
                    (selectedTask.activity || []).map(act => (
                      <div key={act.id} className="flex gap-3">
                        {act.type === 'Comment' ? (
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-medium text-white flex-shrink-0 mt-0.5">
                            {act.text.includes('(by ') ? act.text.split('(by ')[1].charAt(0) : 'U'}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Activity className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                        <div>
                          {act.type === 'Comment' ? (
                             <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                               <div className="flex items-center justify-between mb-1">
                                 <span className="text-xs font-medium text-white">
                                    {act.text.includes('(by ') ? act.text.substring(act.text.lastIndexOf('(by ') + 4, act.text.length - 1) : 'User'}
                                 </span>
                                 <span className="text-[10px] text-slate-500 ml-4">{act.time}</span>
                               </div>
                               <p className="text-xs text-slate-300 leading-relaxed">
                                  {act.text.includes('(by ') ? act.text.substring(0, act.text.lastIndexOf('(by ')).trim() : act.text}
                               </p>
                             </div>
                          ) : (
                             <>
                               <p className="text-xs text-slate-300">
                                  <span className="font-medium text-white">{act.type}</span> {act.text}
                               </p>
                               <span className="text-[10px] text-slate-500">{act.time}</span>
                             </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Post an update..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white placeholder-slate-500 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0ED7A8] disabled:opacity-50 disabled:hover:text-slate-400 transition-colors p-1"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddTaskModalOpen(false)} />
          <div className="bg-[#1E2D40] rounded-2xl border border-slate-700/50 w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">Create New Task</h2>
                <p className="text-sm text-slate-400 mt-1">Add a new task and assign it to a team member.</p>
              </div>
              <button type="button" onClick={() => setIsAddTaskModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-6">
                  <h3 className="text-sm font-medium text-slate-200 border-b border-slate-700/50 pb-2">Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-slate-300">Task Title</label>
                      <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. Update firewall rules" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Project</label>
                      <input required type="text" value={newTask.project} onChange={e => setNewTask({...newTask, project: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. Network Security" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Assignee</label>
                      <input type="text" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. Alice" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Priority</label>
                      <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Start Date & Time</label>
                      <input required type="datetime-local" value={newTask.startDate} onChange={e => setNewTask({...newTask, startDate: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Due Date & Time</label>
                      <input required type="datetime-local" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Estimated Time (Hours)</label>
                      <input type="number" min="0" step="0.5" value={newTask.estimatedTime ? newTask.estimatedTime / 60 : ''} onChange={e => setNewTask({...newTask, estimatedTime: e.target.value ? parseFloat(e.target.value) * 60 : undefined})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all [color-scheme:dark]" placeholder="e.g. 5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-medium text-slate-200 border-b border-slate-700/50 pb-2">Operations & Setup</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Automated Workflows (comma separated)</label>
                      <input type="text" value={newTask.workflows} onChange={e => setNewTask({...newTask, workflows: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. Code Review Workflow, Automated Build" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Required Tools (comma separated)</label>
                      <input type="text" value={newTask.tools} onChange={e => setNewTask({...newTask, tools: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all" placeholder="e.g. AWS Console, Docker, Git" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Instructions</label>
                        <textarea rows={3} value={newTask.instructions} onChange={e => setNewTask({...newTask, instructions: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all resize-none" placeholder="Provide link to SOP or clear step-by-step..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Quality Guidelines</label>
                        <textarea rows={3} value={newTask.guidelines} onChange={e => setNewTask({...newTask, guidelines: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all resize-none" placeholder="What determines success?" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Notes</label>
                      <textarea rows={2} value={newTask.notes} onChange={e => setNewTask({...newTask, notes: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#0ED7A8] focus:ring-1 focus:ring-[#0ED7A8] text-white transition-all resize-none" placeholder="Context or extra notes..." />
                    </div>
                  </div>
                </div>

              </div>
              <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3 rounded-b-2xl flex-shrink-0">
                <button type="button" onClick={() => setIsAddTaskModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#0ED7A8] hover:bg-[#0ED7A8]/90 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">Create Task</button>
              </div>
            </form>
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
