import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  FileText, 
  Settings,
  ShieldAlert,
  Menu,
  X,
  Bell,
  Search,
  UserCog,
  Server,
  Activity,
  DollarSign,
  FolderOpen,
  CalendarDays,
  ShieldCheck,
  ClipboardList,
  Target,
  Flag,
  PieChart,
  GraduationCap,
  Heart,
  Share2,
  Smartphone,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

import { CommandPalette } from './CommandPalette';
import { NotificationPanel } from './NotificationPanel';
import { QuickAddFab } from './QuickAddFab';

const navigationGroups = [
  {
    name: 'Command Center',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Detailed Analytics', href: '/analytics', icon: Activity },
    ]
  },
  {
    name: 'Agency & Services',
    items: [
      { name: 'Leads & CRM', href: '/leads', icon: Target },
      { name: 'Projects (Kanban)', href: '/projects', icon: Briefcase },
      { name: 'Tasks', href: '/tasks', icon: CheckSquare },
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Client Reports (VAPT)', href: '/reports', icon: ClipboardList },
      { name: 'Invoices', href: '/invoices', icon: FileText },
    ]
  },
  {
    name: 'Education Engine',
    items: [
      { name: 'Education & Courses', href: '/education', icon: GraduationCap },
      { name: 'Partners & Ambassadors', href: '/volunteers', icon: Heart },
      { name: 'Affiliate Program', href: '/affiliates', icon: Share2 },
    ]
  },
  {
    name: 'Impact & Volunteers',
    items: [
      { name: 'Social Impact', href: '/social-impact', icon: ShieldAlert },
      { name: 'Awareness Campaigns', href: '/campaigns', icon: ShieldCheck },
    ]
  },
  {
    name: 'Tech Products',
    items: [
      { name: 'Products Backlog', href: '/products', icon: Smartphone },
    ]
  },
  {
    name: 'PR, Media & Grants',
    items: [
      { name: 'Content Calendar', href: '/content', icon: CalendarDays },
      { name: 'Grants & Funding', href: '/grants', icon: DollarSign },
    ]
  },
  {
    name: 'Core Operations & HR',
    items: [
      { name: 'HR & Team', href: '/hr', icon: UserCog },
      { name: 'Financial Hub', href: '/financials', icon: PieChart },
      { name: 'Expenses', href: '/expense', icon: DollarSign },
      { name: 'Tools & Inventory', href: '/assets', icon: Server },
      { name: 'Documents', href: '/documents', icon: FolderOpen },
      { name: 'Team Activity', href: '/activity', icon: Activity },
      { name: 'Meetings', href: '/meetings', icon: CalendarDays },
      { name: 'Goals & OKRs', href: '/goals', icon: Flag },
      { name: 'Settings', href: '/settings', icon: Settings },
    ]
  }
];

interface NavigationItemProps {
  item: {
    name: string;
    href: string;
    icon: React.ElementType;
  };
  onClick?: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ item, onClick }) => {
  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
          isActive 
            ? "bg-[#0ED7A8]/10 text-[#0ED7A8] font-medium" 
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        )
      }
    >
      <item.icon className="w-4 h-4" />
      {item.name}
    </NavLink>
  );
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead, logout } = useAppContext();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNavContent = () => (
    <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-4 pt-2">
      {navigationGroups.map((group) => (
        <div key={group.name}>
          <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {group.name}
          </div>
          <div className="space-y-1">
            {group.items.map((item) => (
              <NavigationItem key={item.name} item={item} onClick={() => setSidebarOpen(false)} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-[#1E2D40] border-r border-slate-700/50 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-[#0ED7A8] font-bold text-xl">
              <ShieldAlert className="w-6 h-6" />
              BongoDemy
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          {renderNavContent()}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-[#1E2D40] border-r border-slate-700/50 p-6 fixed inset-y-0">
        <div className="flex items-center gap-2 text-[#0ED7A8] font-bold text-xl mb-8">
          <ShieldAlert className="w-8 h-8" />
          BongoDemy
        </div>
        {renderNavContent()}
        <div className="mt-auto pt-6 border-t border-slate-700/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-[#0ED7A8] font-bold">
                M
              </div>
              <div>
                <div className="text-sm font-medium text-white">Md. Mudasser</div>
                <div className="text-[10px] text-slate-400">Founder & CEO</div>
              </div>
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-white transition-colors" title="Sign Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-slate-700/50 bg-[#1E2D40]/50 backdrop-blur flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                className="bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-[#0ED7A8] hover:border-[#0ED7A8]/50 text-slate-400 w-64 transition-all text-left flex justify-between items-center"
              >
                <span>Search...</span>
                <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-400 border border-slate-600">⌘K</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 relative" ref={notificationRef}>
            <button 
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-400 hover:text-white transition-colors group"
              onClick={() => {
                const message = Math.random() > 0.5 
                  ? 'Focus Mode activated. All meeting requests deferred to AI.'
                  : 'Deep Work Mode ON. Notifications snoozed for 2 hours.';
                window.dispatchEvent(new CustomEvent('notify', { detail: { type: 'success', message } }));
              }}
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:shadow-[0_0_8px_rgba(99,102,241,0.8)] transition-shadow"></div>
              Focus Mode
            </button>
            <button 
              className="relative p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0ED7A8] rounded-full"></span>
              )}
            </button>
            <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
      <QuickAddFab />
    </div>
  );
}
