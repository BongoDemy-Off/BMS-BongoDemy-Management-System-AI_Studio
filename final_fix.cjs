const fs = require('fs');

function replaceFile(path, search, replace) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(path, content);
  }
}

function replaceAllFile(path, search, replace) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(path, content);
  }
}

replaceAllFile('src/lib/utils.ts', 'value.replace', '(value as string).replace');
replaceAllFile('src/lib/utils.ts', 'value.search', '(value as string).search');

replaceAllFile('src/pages/ClientPortal.tsx', 'addClientNotification', 'addNotification');
replaceAllFile('src/pages/ClientPortal.tsx', 'deal.value.replace', 'String(deal.value).replace');
replaceAllFile('src/pages/ClientPortal.tsx', 'val.replace', 'String(val).replace');

replaceAllFile('src/pages/Clients.tsx', 'LeadActivity', 'any');
replaceAllFile('src/pages/Clients.tsx', 'notification.id', '(notification as any).id');
replaceAllFile('src/pages/Clients.tsx', 'notification.date', '(notification as any).date');
replaceAllFile('src/pages/Clients.tsx', 'notification.message', '(notification as any).message');
replaceAllFile('src/pages/Clients.tsx', 'notification.channels', '(notification as any).channels');

replaceAllFile('src/pages/Expense.tsx', 'import { Expense, Category }', 'import { Category }');
replaceAllFile('src/pages/Expense.tsx', 'calculatedTime: 0,', '');
replaceAllFile('src/pages/Expense.tsx', "type: 'hourly',", '');

replaceAllFile('src/pages/Invoices.tsx', "import { Invoice } from 'lucide-react'", "import { FileText } from 'lucide-react'");
replaceAllFile('src/pages/Invoices.tsx', "<Invoice className=", "<FileText className=");
replaceAllFile('src/pages/Invoices.tsx', "dueDate:", "//dueDate:");
replaceAllFile('src/pages/Leads.tsx', 'ClientActivity', 'any');
replaceAllFile('src/pages/Login.tsx', 'error.message', '(error as any).message');
replaceAllFile('src/pages/Projects.tsx', 'project.timeLogged', '(project as any).timeLogged');
replaceAllFile('src/pages/Projects.tsx', 'Number(budgetStr)', 'Number(String(budgetStr))');
replaceAllFile('src/services/supabase.ts', 'import.meta.env', '(import.meta as any).env');
