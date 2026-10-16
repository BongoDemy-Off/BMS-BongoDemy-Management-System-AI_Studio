
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
  type: 'info' | 'warning' | 'success' | 'error';
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
  aiScore?: number;
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
  value: string | number;
  stage: string;
  probability: number;
  startDate?: string;
  deliveryDate?: string;
  driveLink?: string;
  targetClientName?: string;
  phases: DealPhase[];
};

export type ClientNotification = {
  createdAt?: string;
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
  totalBilled: string | number;
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
  name?: string;
  clientId?: number | string;
};

export type Invoice = {
  id: string;
  client: string;
  amount: string | number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  project?: string;
  items?: { description: string; quantity: number; price: number }[];
};

export type Expense = {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  receipt?: string;
  reminders?: { id: string; date: string; note: string }[];
};

export type Document = {
  id: string;
  title: string;
  category: string;
  type: string;
  size: string;
  updated: string;
  access: string;
  author: string;
};

export type ReportTemplate = {
  id: string;
  name: string;
  structure: string;
  isActive: boolean;
};
