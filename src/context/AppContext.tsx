import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Role = {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
};

export type PermissionCategory = {
  name: string;
  permissions: { id: string; name: string }[];
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  type: string;
  compensation: {
    amount: number;
    period: string;
    currency: string;
  };
  accessLevel: string;
  status: string;
  email: string;
  attendanceStatus: 'checked-in' | 'checked-out' | 'absent';
  checkInTime?: string;
  checkOutTime?: string;
  skills?: { name: string; level: 'Novice' | 'Intermediate' | 'Expert' }[];
  certifications?: string[];
  workLogs?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }[];
};

export type Notification = {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  createdAt: string;
  read: boolean;
};

export type UserPreferences = {
  defaultTaskView: 'list' | 'kanban';
  defaultTaskSort: 'none' | 'desc' | 'asc';
};

export type LeadActivity = {
  id: number | string;
  type: string;
  date: string;
  description: string;
};

export type Lead = {
  id: number | string;
  name: string;
  company: string;
  contact: string;
  phone: string;
  stage: string;
  value: number;
  probability: number;
  lastContact: string;
  assignee: string;
  activities: LeadActivity[];
};

export type ClientContact = {
  id: number | string;
  name: string;
  role: string;
  email: string;
  phone: string;
};

export type ClientActivity = {
  id: number | string;
  type: string;
  date: string;
  description: string;
};

export type DealPhase = {
  name: string;
  status: string;
  startDate?: string;
  estimatedDelivery?: string;
  date?: string;
};

export type Deal = {
  id: number | string;
  name: string;
  value: string;
  stage: string;
  probability: number;
  startDate?: string;
  deliveryDate?: string;
  driveLink?: string;
  targetClientName?: string;
  phases: DealPhase[];
};

export type ClientNotification = {
  id: string;
  type: 'project_update' | 'delivery' | 'meeting' | 'payment' | 'general';
  title: string;
  message: string;
  date: string;
  read: boolean;
  channels: ('system' | 'email' | 'whatsapp')[];
};

export type Client = {
  id: number | string;
  name: string;
  type?: 'Standard' | 'Premium' | 'Elite' | string;
  contact: string;
  email: string;
  password?: string;
  phone: string;
  location: string;
  status: string;
  projects: number;
  totalBilled: string;
  about: string;
  contacts: ClientContact[];
  activities: ClientActivity[];
  deals: Deal[];
  notifications?: ClientNotification[];
};

export type CurrentUser = {
  id: string;
  email: string;
  role: 'admin' | 'client';
  clientId?: number | string;
};

import { initialTasks, initialProjects, Task, Project } from '../data/initialData';

export type { Task, Project };

type AppContextType = {
  currentUser: CurrentUser | null;
  login: (email: string, pass: string) => void;
  logout: () => void;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  rolePermissions: Record<string, string[]>;
  setRolePermissions: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

const initialRoles: Role[] = [
  { id: 'admin', name: 'Administrator', description: 'Full access to all system features and settings.', isCustom: false },
  { id: 'manager', name: 'Project Manager', description: 'Can manage projects, tasks, and clients.', isCustom: false },
  { id: 'editor', name: 'Editor', description: 'Can view and edit content but cannot delete or manage users.', isCustom: false },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to assigned projects and tasks.', isCustom: false },
  { id: 'finance', name: 'Finance', description: 'Access to invoices, billing, and payroll.', isCustom: false },
];

export const permissionCategories: PermissionCategory[] = [
  {
    name: 'Projects & Tasks',
    permissions: [
      { id: 'view_projects', name: 'View Projects' },
      { id: 'manage_projects', name: 'Create & Edit Projects' },
      { id: 'delete_projects', name: 'Delete Projects' },
      { id: 'view_tasks', name: 'View Tasks' },
      { id: 'manage_tasks', name: 'Manage Tasks' },
    ]
  },
  {
    name: 'Clients & Invoices',
    permissions: [
      { id: 'view_clients', name: 'View Clients' },
      { id: 'manage_clients', name: 'Manage Clients' },
      { id: 'view_invoices', name: 'View Invoices' },
      { id: 'manage_invoices', name: 'Manage Invoices' },
    ]
  },
  {
    name: 'System & HR',
    permissions: [
      { id: 'view_hr', name: 'View Team Members' },
      { id: 'manage_hr', name: 'Manage Team & Payroll' },
      { id: 'view_assets', name: 'View Assets' },
      { id: 'manage_assets', name: 'Manage Assets' },
      { id: 'manage_settings', name: 'Manage System Settings' },
      { id: 'manage_roles', name: 'Manage Roles & Permissions' },
    ]
  }
];

const initialRolePermissions: Record<string, string[]> = {
  'admin': permissionCategories.flatMap(c => c.permissions.map(p => p.id)),
  'manager': ['view_projects', 'manage_projects', 'view_tasks', 'manage_tasks', 'view_clients', 'manage_clients', 'view_assets'],
  'editor': ['view_projects', 'view_tasks', 'manage_tasks', 'view_clients'],
  'viewer': ['view_projects', 'view_tasks'],
  'finance': ['view_clients', 'view_invoices', 'manage_invoices', 'view_hr'],
};

const initialTeamMembers: TeamMember[] = [
  {
    id: 'EMP-001',
    name: 'Alice Security',
    role: 'Lead Penetration Tester',
    department: 'Cybersecurity',
    type: 'Full-time',
    compensation: { amount: 8500, period: 'Monthly', currency: '$' },
    accessLevel: 'Administrator',
    status: 'Active',
    email: 'alice@bongodemy.com',
    attendanceStatus: 'checked-in',
    checkInTime: '08:45 AM',
    skills: [
      { name: 'Cybersecurity', level: 'Expert' },
      { name: 'Penetration Testing', level: 'Expert' },
      { name: 'Python', level: 'Intermediate' },
      { name: 'Go', level: 'Intermediate' },
      { name: 'Network Security', level: 'Expert' }
    ],
    certifications: ['CEH', 'OSCP']
  },
  {
    id: 'EMP-002',
    name: 'Bob Developer',
    role: 'Senior Web Developer',
    department: 'Engineering',
    type: 'Full-time',
    compensation: { amount: 7200, period: 'Monthly', currency: '$' },
    accessLevel: 'Editor',
    status: 'Active',
    email: 'bob@bongodemy.com',
    attendanceStatus: 'checked-out',
    checkOutTime: '05:30 PM',
    skills: [
      { name: 'React', level: 'Expert' },
      { name: 'TypeScript', level: 'Expert' },
      { name: 'Node.js', level: 'Intermediate' },
      { name: 'PostgreSQL', level: 'Intermediate' },
      { name: 'Tailwind CSS', level: 'Expert' }
    ],
    certifications: ['AWS Certified Developer'],
    workLogs: [
      {
        id: 'wl-1',
        date: '2026-05-12',
        startTime: '09:00 AM',
        endTime: '05:30 PM',
        description: 'Frontend development, addressed bug in the projects module.'
      }
    ]
  },
  {
    id: 'INT-015',
    name: 'Charlie Intern',
    role: 'Security Analyst Intern',
    department: 'Cybersecurity',
    type: 'Intern',
    compensation: { amount: 1500, period: 'Monthly', currency: '$' },
    accessLevel: 'Viewer',
    status: 'Active',
    email: 'charlie@bongodemy.com',
    attendanceStatus: 'absent'
  },
  {
    id: 'INT-016',
    name: 'David Design Intern',
    role: 'UX/UI Intern',
    department: 'Design',
    type: 'Intern',
    compensation: { amount: 1200, period: 'Monthly', currency: '$' },
    accessLevel: 'Viewer',
    status: 'Active',
    email: 'david@bongodemy.com',
    attendanceStatus: 'checked-in',
    checkInTime: '09:00 AM'
  },
  {
    id: 'PRJ-089',
    name: 'Eve Consultant',
    role: 'Cloud Architect',
    department: 'Infrastructure',
    type: 'Contractor',
    compensation: { amount: 85, period: 'Hourly', currency: '$' },
    accessLevel: 'Project Manager',
    status: 'Active',
    email: 'eve.c@external.com',
    attendanceStatus: 'checked-in',
    checkInTime: '09:15 AM'
  },
  {
    id: 'PRJ-090',
    name: 'Frank Freelancer',
    role: 'Content Writer',
    department: 'Marketing',
    type: 'Contractor',
    compensation: { amount: 50, period: 'Hourly', currency: '$' },
    accessLevel: 'Editor',
    status: 'Active',
    email: 'frank@external.com',
    attendanceStatus: 'absent'
  }
];

const initialLeads: Lead[] = [
  { id: 1, name: 'Enterprise Security Audit', company: 'TechCorp', contact: 'john@techcorp.com', phone: '555-0101', stage: 'Proposal Sent', value: 25000, probability: 70, lastContact: '2026-05-14', assignee: 'Alice', activities: [] },
  { id: 2, name: 'Cloud Migration Pentest', company: 'Global Retail', contact: 'sarah@globalretail.com', phone: '555-0202', stage: 'Negotiation', value: 15000, probability: 90, lastContact: '2026-05-15', assignee: 'Bob', activities: [] },
  { id: 3, name: 'Compliance Assessment', company: 'FinServe', contact: 'mbrown@finserve.com', phone: '555-0303', stage: 'New', value: 12000, probability: 30, lastContact: '2026-05-12', assignee: 'Alice', activities: [] },
  { id: 4, name: 'E-commerce SEO', company: 'StyleStore', contact: 'emma@stylestore.com', phone: '555-0404', stage: 'Contacted', value: 8000, probability: 50, lastContact: '2026-05-11', assignee: 'Charlie', activities: [] },
];

const initialClients: Client[] = [
  {
    id: 1,
    name: 'Luxury Family',
    type: 'Elite',
    contact: 'John Smith',
    email: 'luxuryfamily@bongodemy.com',
    password: 'LuxuryFamily',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    status: 'Active',
    projects: 3,
    totalBilled: '$45,000',
    about: 'Luxury Family focuses on premium B2B solutions.',
    contacts: [
      { id: 1, name: 'John Smith', role: 'CEO', email: 'luxuryfamily@bongodemy.com', phone: '+1 (555) 123-4567' }
    ],
    activities: [
      { id: 1, type: 'Meeting', date: '2026-05-10', description: 'Quarterly review and Q3 planning.' }
    ],
    deals: [
      { 
        id: 1, 
        name: 'Phase 2: Platform Integration', 
        value: '$25,000', 
        stage: 'In Progress', 
        probability: 65,
        startDate: '2026-05-15',
        deliveryDate: '2026-07-30',
        driveLink: 'https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J?usp=sharing',
        phases: [
           { name: 'Requirements & Planning', status: 'Completed', startDate: '2026-05-15', estimatedDelivery: '2026-05-20' },
           { name: 'Design & Prototyping', status: 'In Progress', startDate: '2026-05-22', estimatedDelivery: '2026-06-15' },
           { name: 'Development', status: 'Upcoming', startDate: '2026-06-20', estimatedDelivery: '2026-07-10' },
           { name: 'Testing & Delivery', status: 'Upcoming', startDate: '2026-07-15', estimatedDelivery: '2026-07-30' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'TechCorp Inc.',
    type: 'Standard',
    contact: 'Jane Doe',
    email: 'jane@techcorp.com',
    password: 'password123',
    phone: '+1 (555) 987-6543',
    location: 'San Francisco, USA',
    status: 'Active',
    projects: 1,
    totalBilled: '$10,000',
    about: 'TechCorp Inc. software development.',
    contacts: [],
    activities: [],
    deals: [
      { 
        id: 1, 
        name: 'Initial Consultation & Strategy', 
        value: '$10,000', 
        stage: 'Completed', 
        probability: 100,
        startDate: '2026-04-10',
        deliveryDate: '2026-05-05',
        driveLink: 'https://drive.google.com/drive/folders/9Z8Y7X6W5V4U3T2S1R0Q?usp=sharing',
        phases: [
           { name: 'Kickoff', status: 'Completed', startDate: '2026-04-10', estimatedDelivery: '2026-04-12' },
           { name: 'Market Analysis', status: 'Completed', startDate: '2026-04-13', estimatedDelivery: '2026-04-20' },
           { name: 'Strategy Document', status: 'Completed', startDate: '2026-04-22', estimatedDelivery: '2026-05-01' },
           { name: 'Final Delivery', status: 'Completed', startDate: '2026-05-02', estimatedDelivery: '2026-05-05' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Modina Family',
    type: 'Elite',
    contact: 'Faruq Uncle',
    email: 'modina_family@bongodemy.com',
    password: 'ModinaFamily',
    phone: '+1 (555) 789-0123',
    location: 'Dhaka, Bangladesh',
    status: 'Active',
    projects: 2,
    totalBilled: '$35,000',
    about: 'Modina Family includes Modina Rim & Parts Ltd. and Modina Auto Parts Ltd.',
    contacts: [
      { id: 1, name: 'Faruq Uncle', role: 'Founder', email: 'faruq@modinaparts.com', phone: '+1 (555) 789-0123' }
    ],
    activities: [],
    deals: [
      { 
        id: 1, 
        name: 'Modina Rim & Parts Website Redesign', 
        value: '$15,000', 
        stage: 'In Progress', 
        probability: 80,
        startDate: '2026-06-01',
        deliveryDate: '2026-08-30',
        driveLink: 'https://drive.google.com/drive/folders/MODINA_1?usp=sharing',
        phases: [
           { name: 'Design', status: 'In Progress', startDate: '2026-06-01', estimatedDelivery: '2026-06-30' }
        ]
      },
      { 
        id: 2, 
        name: 'Modina Auto Parts Delivery App', 
        value: '$20,000', 
        stage: 'Upcoming', 
        probability: 40,
        startDate: '2026-09-01',
        deliveryDate: '2026-12-15',
        driveLink: '',
        phases: []
      }
    ]
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>({ id: 'admin', email: 'admin@bongodemy.com', role: 'admin' });
  const [clients, setClients] = useState<Client[]>(initialClients);

  const login = (email: string, pass: string) => {
    if (email === 'admin@bongodemy.com' && pass === 'admin') {
      setCurrentUser({ id: 'admin', email, role: 'admin' });
      return;
    }
    const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === pass);
    if (client) {
      setCurrentUser({ id: String(client.id), email: client.email, role: 'client', clientId: client.id });
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(initialRolePermissions);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'noti-1',
      message: 'System maintenance scheduled for tonight at 12 AM.',
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false
    }
  ]);

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    defaultTaskView: 'kanban',
    defaultTaskSort: 'none'
  });
  
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

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
          // Auto-adjust project status based on task progress
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
  }, [tasks]);

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
  }, [projects]);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    setNotifications(prev => [
      {
        ...notification,
        id: `noti-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      roles, setRoles,
      rolePermissions, setRolePermissions,
      teamMembers, setTeamMembers,
      notifications, addNotification, markNotificationRead, markAllNotificationsRead,
      userPreferences, setUserPreferences,
      leads, setLeads,
      clients, setClients,
      projects, setProjects,
      tasks, setTasks
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
