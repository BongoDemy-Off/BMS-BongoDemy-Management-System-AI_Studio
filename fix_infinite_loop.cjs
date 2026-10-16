const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
content = content.replace(
  'const activityLog = useAppContext(s => (s as any).activityLog || []);',
  'const activityLogRaw = useAppContext(s => (s as any).activityLog);\n  const activityLog = activityLogRaw || [];'
);
fs.writeFileSync('src/pages/Dashboard.tsx', content);
