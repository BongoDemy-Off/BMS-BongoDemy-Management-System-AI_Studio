const fs = require('fs');

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// The file is huge, let's just surgically replace the AppContext implementation

const startMarker = 'const AppContext = createContext<AppContextType | undefined>(undefined);';

const newImpl = `
import { create } from 'zustand';

export const useAppStore = create<AppContextType>((set, get) => ({
  currentUser: { id: 'admin', email: 'admin@bongodemy.com', role: 'admin' },
  login: (email, pass) => {
    const { clients } = get();
    if (email === 'admin@bongodemy.com' && pass === 'admin') {
      set({ currentUser: { id: 'admin', email, role: 'admin' } });
      return;
    }
    const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === pass);
    if (client) {
      set({ currentUser: { id: String(client.id), email: client.email, role: 'client', clientId: client.id } });
    } else {
      throw new Error('Invalid email or password');
    }
  },
  logout: () => set({ currentUser: null }),

  roles: initialRoles,
  setRoles: (val) => set(state => ({ roles: typeof val === 'function' ? val(state.roles) : val })),

  rolePermissions: initialRolePermissions,
  setRolePermissions: (val) => set(state => ({ rolePermissions: typeof val === 'function' ? val(state.rolePermissions) : val })),

  teamMembers: initialTeamMembers,
  setTeamMembers: (val) => set(state => ({ teamMembers: typeof val === 'function' ? val(state.teamMembers) : val })),

  notifications: [
    {
      id: 'noti-1',
      message: 'System maintenance scheduled for tonight at 12 AM.',
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false
    }
  ],
  addNotification: (notification) => set(state => ({
    notifications: [
      {
        ...notification,
        id: \`noti-\${Date.now()}\`,
        createdAt: new Date().toISOString(),
        read: false
      },
      ...state.notifications
    ]
  })),
  markNotificationRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllNotificationsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  userPreferences: {
    defaultTaskView: 'kanban',
    defaultTaskSort: 'none'
  },
  setUserPreferences: (val) => set(state => ({ userPreferences: typeof val === 'function' ? val(state.userPreferences) : val })),

  leads: initialLeads,
  setLeads: (val) => set(state => ({ leads: typeof val === 'function' ? val(state.leads) : val })),

  clients: initialClients,
  setClients: (val) => set(state => ({ clients: typeof val === 'function' ? val(state.clients) : val })),

  projects: initialProjects,
  setProjects: (val) => set(state => ({ projects: typeof val === 'function' ? val(state.projects) : val })),

  tasks: initialTasks,
  setTasks: (val) => set(state => ({ tasks: typeof val === 'function' ? val(state.tasks) : val })),
}));

export const useAppContext = useAppStore;

export function AppProvider({ children }: { children: ReactNode }) {
  const tasks = useAppStore(s => s.tasks);
  const projects = useAppStore(s => s.projects);
  const setProjects = useAppStore(s => s.setProjects);
  const setTasks = useAppStore(s => s.setTasks);

  // Sync Global Tasks -> Projects
  useEffect(() => {
    setProjects(prevProjects => {
      let changed = false;
      const next = prevProjects.map(p => {
        const pTasks = tasks.filter(t => t.project === p.name).map(t => ({
          id: t.id,
          title: t.title,
          startDate: t.startDate,
          deadline: t.dueDate,
          progress: t.progress || 0,
          assignee: t.assignee,
          dependencies: t.dependencies,
          status: t.status,
          lastActiveProgress: t.lastActiveProgress,
          subtasks: t.subtasks
        }));

        const projectTaskStr = JSON.stringify(p.tasks);
        const gTasksStr = JSON.stringify(pTasks);

        if (projectTaskStr !== gTasksStr) {
          changed = true;
          const tot = pTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
          let newProg = pTasks.length > 0 ? Math.round(tot / pTasks.length) : 0;
          let newStatus = p.status;
          if (newProg === 100) newStatus = 'Completed';
          else if (newProg === 0) newStatus = 'Not Started';
          else if (p.status === 'Completed' || p.status === 'Not Started') newStatus = 'In Progress';
          return { ...p, tasks: pTasks, progress: newProg, status: newStatus };
        }
        return p;
      });
      return changed ? next : prevProjects;
    });
  }, [tasks, setProjects]);

  // Sync Projects -> Global Tasks
  useEffect(() => {
    setTasks(prevTasks => {
      let changed = false;
      let nextTasks = [...prevTasks];

      projects.forEach(p => {
        (p.tasks || []).forEach(pt => {
          const tIdx = nextTasks.findIndex(t => t.id === pt.id);
          if (tIdx !== -1) {
            const t = nextTasks[tIdx];
            if (t.progress !== pt.progress || t.status !== pt.status || JSON.stringify(t.subtasks) !== JSON.stringify(pt.subtasks)) {
              changed = true;
              nextTasks[tIdx] = { 
                ...t, 
                progress: pt.progress, 
                status: pt.status || t.status, 
                subtasks: pt.subtasks, 
                lastActiveProgress: pt.lastActiveProgress 
              };
            }
          }
        });
      });
      return changed ? nextTasks : prevTasks;
    });
  }, [projects, setTasks]);

  return <>{children}</>;
}
`;

const index = content.indexOf(startMarker);
if (index !== -1) {
  content = content.substring(0, index) + newImpl;
  content = content.replace("import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';", "import React, { ReactNode, useEffect } from 'react';");
  fs.writeFileSync('src/context/AppContext.tsx', content, 'utf8');
  console.log("Replaced successfully!");
} else {
  console.error("Marker not found!");
}
