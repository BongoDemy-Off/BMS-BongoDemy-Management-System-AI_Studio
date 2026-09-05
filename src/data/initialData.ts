import { Shield, Globe, PenTool, BarChart } from 'lucide-react';

export type Task = {
  id: number;
  title: string;
  project: string;
  assignee: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  dependencies: number[];
  dependencyDelays?: Record<number, number>;
  completedAt?: string;
  reminders?: { id: number, type: 'in-app' | 'email' | 'whatsapp', offset: string, calculatedTime: string, timestamp?: number, triggered?: boolean }[];
  subtasks?: { id: number, title: string, completed: boolean }[];
  estimatedTime?: number; // in minutes
  timeSpent?: number; // in minutes
  description?: string;
  activity?: { id: number, type: string, text: string, time: string }[];
  progress?: number;
  lastActiveProgress?: number;
  workflows?: string[];
  instructions?: string;
  tools?: string[];
  guidelines?: string;
  notes?: string;
};

export const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Run vulnerability scan on main server',
    project: 'Web Application Pentest',
    assignee: 'Alice',
    status: 'In Progress',
    priority: 'High',
    startDate: '2024-03-01',
    dueDate: '2024-03-05',
    dependencies: [],
    subtasks: [
      { id: 101, title: 'Configure scanner', completed: true },
      { id: 102, title: 'Execute scan', completed: false }
    ],
    timeSpent: 120,
    description: 'Perform a comprehensive vulnerability scan using Nessus.',
    activity: [
      { id: 1, type: 'status_change', text: 'Status changed to In Progress', time: '2 hours ago' }
    ],
    workflows: ['Automated Ticket Update', 'Security Audit Trail'],
    instructions: 'Follow standard OWASP Top 10 scanning protocol.',
    tools: ['Nessus', 'Burp Suite', 'Nmap'],
    guidelines: 'Ensure zero-downtime during scan execution. Avoid destructive payloads.',
    notes: 'Client requested specific focus on the authentication endpoints.',
    estimatedTime: 240,
  },
  {
    id: 2,
    title: 'Draft landing page copy',
    project: 'Corporate Website Redesign',
    assignee: 'Eve',
    status: 'Not Started',
    priority: 'Medium',
    startDate: '2024-03-05',
    dueDate: '2024-03-10',
    dependencies: []
  },
  {
    id: 3,
    title: 'Analyze competitor branding',
    project: 'Brand Identity Overhaul',
    assignee: 'Frank',
    status: 'In Progress',
    priority: 'Medium',
    startDate: '2024-03-02',
    dueDate: '2024-03-08',
    dependencies: []
  },
  {
    id: 4,
    title: 'Finalize Q2 budget report',
    project: 'Q2 Marketing Strategy',
    assignee: 'Judy',
    status: 'Review',
    priority: 'High',
    startDate: '2024-02-28',
    dueDate: '2024-03-04',
    dependencies: []
  },
  {
    id: 5,
    title: 'Update client SSL certificates',
    project: 'Internal Infrastructure',
    assignee: 'Bob',
    status: 'Completed',
    priority: 'High',
    startDate: '2024-02-20',
    dueDate: '2024-02-25',
    dependencies: [],
    completedAt: '2024-02-24T14:30:00Z'
  },
  {
    id: 101, title: 'Initial Recon', project: 'Web Application Pentest', startDate: '2024-03-01', dueDate: '2024-03-14', progress: 100, assignee: 'Alice', dependencies: [], status: 'Completed', priority: 'Medium', subtasks: [{ id: 1, title: 'Scan IPs', completed: true }, { id: 2, title: 'OSINT', completed: true }] 
  },
  {
    id: 102, title: 'Active Scanning', project: 'Web Application Pentest', startDate: '2024-03-15', dueDate: '2024-04-09', progress: 80, assignee: 'Bob', dependencies: [101], status: 'In Progress', priority: 'High', subtasks: [{ id: 3, title: 'Port Scan', completed: true }, { id: 4, title: 'Vuln Scan', completed: false }] 
  },
  {
    id: 103, title: 'Exploitation', project: 'Web Application Pentest', startDate: '2024-04-10', dueDate: '2024-04-30', progress: 20, assignee: 'Charlie', dependencies: [102], status: 'In Progress', priority: 'High', subtasks: [] 
  },
  { 
    id: 201, title: 'Wireframing', project: 'Corporate Website Redesign', startDate: '2024-02-15', dueDate: '2024-03-05', progress: 100, assignee: 'Dave', dependencies: [], status: 'Completed', priority: 'High' 
  },
  { 
    id: 202, title: 'Visual Design', project: 'Corporate Website Redesign', startDate: '2024-03-06', dueDate: '2024-03-20', progress: 100, assignee: 'Eve', dependencies: [201], status: 'Completed', priority: 'Medium' 
  },
  { 
    id: 203, title: 'Frontend Dev', project: 'Corporate Website Redesign', startDate: '2024-03-21', dueDate: '2024-04-15', progress: 85, assignee: 'Dave', dependencies: [202], status: 'In Progress', priority: 'High' 
  },
  { 
    id: 301, title: 'Market Research', project: 'Brand Identity Overhaul', startDate: '2024-05-01', dueDate: '2024-05-10', progress: 50, assignee: 'Frank', dependencies: [], status: 'In Progress', priority: 'Medium' 
  },
  { 
    id: 401, title: 'Analytics Review', project: 'Q2 Marketing Strategy', startDate: '2024-01-01', dueDate: '2024-01-15', progress: 100, assignee: 'Ivan', dependencies: [], status: 'Completed', priority: 'Medium' 
  }
];

export const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Web Application Pentest',
    client: 'FinServe LLC',
    category: 'Cybersecurity',
    status: 'In Progress',
    health: 'On Track',
    priority: 'High',
    progress: 65,
    lastActiveProgress: 65,
    startDate: '2024-03-01',
    deadline: '2024-05-15',
    budget: 25000,
    spent: 18000,
    team: ['Alice', 'Bob', 'Charlie'],
    requiredSkills: ['Penetration Testing', 'Python', 'Node.js', 'AWS Certified Developer', 'Network Security'],
    milestones: [{ id: 1, title: 'Reconnaissance', date: '2024-03-15' }, { id: 2, title: 'Vulnerability Scanning', date: '2024-04-10' }],
    tasks: [],
    attachments: [
      { id: 1, name: 'Scope_Document_v2.pdf', size: '2.4 MB', uploadDate: '2024-03-01', type: 'application/pdf' },
      { id: 2, name: 'Client_Requirements.docx', size: '1.1 MB', uploadDate: '2024-03-02', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    ],
    workflows: [
      { id: 1, title: 'Client Onboarding', steps: ['Doc Sign', 'Env Setup'] },
      { id: 2, title: 'Weekly Reports Automator', steps: ['Generate PDF', 'Email Client'] }
    ],
    phases: [
      { id: 1, name: 'Recon & Scoping', status: 'Completed' },
      { id: 2, name: 'Active Testing', status: 'In Progress' },
      { id: 3, name: 'Reporting', status: 'Pending' }
    ],
    instructions: 'Follow standard testing procedures as defined in the master service agreement.',
    tools: ['Nessus', 'Burp Suite Professional', 'Kali Linux', 'Jira'],
    guidelines: 'Code freeze during active testing phase. Do not exploit database layer without explicit permission.',
    notes: 'The client expects a daily sync via email.',
    icon: Shield,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10'
  },
  {
    id: 2,
    name: 'Corporate Website Redesign',
    client: 'TechCorp Inc.',
    category: 'Web Development',
    status: 'Review',
    health: 'Delayed',
    priority: 'Medium',
    progress: 90,
    lastActiveProgress: 90,
    startDate: '2024-02-15',
    deadline: '2024-04-30',
    budget: 40000,
    spent: 32000,
    team: ['Dave', 'Eve'],
    milestones: [{ id: 3, title: 'Design Handoff', date: '2024-03-20' }, { id: 4, title: 'Beta Release', date: '2024-04-15' }],
    tasks: [],
    icon: Globe,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    id: 3,
    name: 'Brand Identity Overhaul',
    client: 'Global Retail',
    category: 'Digital Design',
    status: 'Planning',
    health: 'On Track',
    priority: 'Medium',
    progress: 15,
    lastActiveProgress: 15,
    startDate: '2024-05-01',
    deadline: '2024-06-01',
    budget: 18000,
    spent: 2500,
    team: ['Frank', 'Grace', 'Heidi'],
    milestones: [],
    tasks: [],
    icon: PenTool,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  {
    id: 4,
    name: 'Q2 Marketing Strategy',
    client: 'BrandBoost',
    category: 'Strategy & Insight',
    status: 'Completed',
    health: 'On Track',
    priority: 'Low',
    progress: 100,
    lastActiveProgress: 100,
    startDate: '2024-01-01',
    deadline: '2024-03-31',
    budget: 15000,
    spent: 14500,
    team: ['Ivan', 'Judy'],
    milestones: [{ id: 5, title: 'Kickoff', date: '2024-01-10' }, { id: 6, title: 'Final Review', date: '2024-03-15' }],
    tasks: [],
    icon: BarChart,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  }
];

export type Project = {
  id: number;
  name: string;
  client: string;
  category: string;
  status: string;
  health: string;
  priority: string;
  progress: number;
  lastActiveProgress: number;
  startDate: string;
  deadline: string;
  budget: number;
  spent: number;
  team: any[];
  timeSpent?: number;
  activity?: { id: number; type: string; text: string; time: string; }[];
  milestones: { id: number, title: string, date: string }[];
  tasks: { id: number, title: string, startDate: string, deadline: string, progress: number, assignee: string, dependencies: number[], status?: string, lastActiveProgress?: number, subtasks?: { id: number, title: string, completed: boolean }[] }[];
  attachments?: { id: number, name: string, size: string, uploadDate: string, type: string }[];
  requiredSkills?: string[];
  icon: any;
  color: string;
  bg: string;
  workflows?: { id: number, title: string, steps: string[] }[];
  phases?: { id: number, name: string, status: string }[];
  instructions?: string;
  tools?: string[];
  guidelines?: string;
  notes?: string;
};
