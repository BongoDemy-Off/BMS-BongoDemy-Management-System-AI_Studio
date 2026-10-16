const fs = require('fs');

let content = fs.readFileSync('src/components/SmartNudges.tsx', 'utf8');
content = content.replace("const invoices = useAppContext(s => (s as any).invoices || []);", "");
content = content.replace("const overdueInvoices = (invoices || []).filter(i => i.status === 'Overdue');", "const overdueInvoices: any[] = [];");
content = content.replace("[tasks, leads, projects, invoices, currentUser, navigate]", "[tasks, leads, projects, currentUser, navigate]");

fs.writeFileSync('src/components/SmartNudges.tsx', content, 'utf8');
