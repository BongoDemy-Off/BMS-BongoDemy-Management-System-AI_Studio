const fs = require('fs');
let code = fs.readFileSync('src/components/NotificationPanel.tsx', 'utf8');

// Remove hardcoded notifications
code = code.replace(/const notifications = \[[\s\S]*?\];/m, '');
code = code.replace(/import \{ format, subMinutes, subHours, subDays \} from 'date-fns';/m, `import { format } from 'date-fns';\nimport { useAppContext } from '../context/AppContext';`);

code = code.replace('export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {', 
`export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const notifications = useAppContext(s => s.notifications);
  const markAllNotificationsRead = useAppContext(s => s.markAllNotificationsRead);
  const markNotificationRead = useAppContext(s => s.markNotificationRead);
`);

code = code.replace(/onClick=\{onClose\}/, `onClick={() => { markAllNotificationsRead(); onClose(); }}`);

// Replace mapping 
code = code.replace(/notif\.bg/g, `(notif.type === 'success' ? 'bg-emerald-400/10' : notif.type === 'error' ? 'bg-rose-400/10' : notif.type === 'warning' ? 'bg-amber-400/10' : 'bg-blue-400/10')`);
code = code.replace(/notif\.color/g, `(notif.type === 'success' ? 'text-emerald-400' : notif.type === 'error' ? 'text-rose-400' : notif.type === 'warning' ? 'text-amber-400' : 'text-blue-400')`);
code = code.replace(/<notif\.icon/g, `{(notif.type === 'success' ? CheckCircle2 : notif.type === 'error' ? Plus : notif.type === 'warning' ? Target : MessageSquare) as any}`);
code = code.replace(/<\/notif\.icon>/g, ``);
code = code.replace(/notif\.time/g, `new Date(notif.createdAt)`);
code = code.replace(/<notif\.icon([^>]+)\/>/g, `{React.createElement(notif.type === 'success' ? CheckCircle2 : notif.type === 'error' ? FileText : notif.type === 'warning' ? Target : MessageSquare, { className: $1 } )}`);


fs.writeFileSync('src/components/NotificationPanel.tsx', code);
