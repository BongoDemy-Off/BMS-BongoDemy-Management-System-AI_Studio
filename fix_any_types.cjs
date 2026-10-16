const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Generic replacements for `: any` where we know the type from context
  const replaceMap = [
    { regex: /\(newInvoice: any\)/g, replacement: '(newInvoice: Invoice)' },
    { regex: /\(newDocument: any\)/g, replacement: '(newDocument: Document)' },
    { regex: /const canEdit = \(doc: any\)/g, replacement: 'const canEdit = (doc: Document)' },
    { regex: /const canDelete = \(doc: any\)/g, replacement: 'const canDelete = (doc: Document)' },
    { regex: /notifications\.filter\(\(n: any\)/g, replacement: 'notifications.filter((n: Notification)' },
    { regex: /notifications\.map\(\(notif: any\)/g, replacement: 'notifications.map((notif: Notification)' },
    { regex: /scores\.find\(\(s: any\)/g, replacement: 'scores.find((s: { id: number | string; aiScore: number })' },
    { regex: /\(act: any\)/g, replacement: '(act: LeadActivity | ClientActivity)' },
    { regex: /\(newExpense: any\)/g, replacement: '(newExpense: Expense)' },
    { regex: /\(r: any\)/g, replacement: '(r: { id: string; date: string; note: string })' },
    { regex: /\(rem: any\)/g, replacement: '(rem: { id: string; date: string; note: string })' },
    { regex: /catch \(error: any\)/g, replacement: 'catch (error: unknown)' },
    { regex: /catch \(err: any\)/g, replacement: 'catch (err: unknown)' },
    { regex: /getMemberName = \(m: any\)/g, replacement: "getMemberName = (m: string | { name?: string })" },
    { regex: /getMemberNames = \(team: any\[\]\)/g, replacement: "getMemberNames = (team: (string | { name?: string })[])" },
    { regex: /onChange=\{\(e: any\)/g, replacement: "onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)" },
    { regex: /onChange: \(e: any\) => void;/g, replacement: "onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;" },
    { regex: /setClients\(\(prev: any\)/g, replacement: "setClients((prev: Client[])" },
    { regex: /\(c: any\)/g, replacement: "(c: Client)" },
    { regex: /setSelectedClient\(\(prev: any\)/g, replacement: "setSelectedClient((prev: Client | null)" },
    { regex: /\(newClient: any\)/g, replacement: "(newClient: Client)" },
    { regex: /\(contact: any\)/g, replacement: "(contact: ClientContact)" },
    { regex: /\(deal: any\)/g, replacement: "(deal: Deal)" },
    { regex: /let interval: any;/g, replacement: "let interval: NodeJS.Timeout | null = null;" },
    { regex: /value: any/g, replacement: "value: string | number | boolean | any" }, // Can't easily fix all value: any without context, leave as is if tough
    { regex: /\(\{ active, payload, label \}: any\)/g, replacement: "({ active, payload, label }: { active?: boolean, payload?: any[], label?: string })" },
    { regex: /\(p: any, i: number\)/g, replacement: "(p: any, i: number)" },
    { regex: /\(asset: any\)/g, replacement: "(asset: any)" },
    { regex: /\(member: any\)/g, replacement: "(member: TeamMember)" },
    { regex: /\.sort\(\(a: any, b: any\)/g, replacement: ".sort((a: any, b: any)" }, // Leave for now
    { regex: /useState<any\s*\|\s*null>/g, replacement: "useState<any>" },
    { regex: /useState<any\[\]>/g, replacement: "useState<any[]>" },
  ];

  replaceMap.forEach(({ regex, replacement }) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  });

  // Adding required imports
  if (changed) {
    if (file.includes('Invoices.tsx') && !content.includes('import { Invoice }')) {
      content = content.replace("import React", "import { Invoice } from '../types';\nimport React");
    }
    if (file.includes('Documents.tsx') && !content.includes('import { Document }')) {
      content = content.replace("import React", "import { Document } from '../types';\nimport React");
    }
    if (file.includes('ClientPortal.tsx') && !content.includes('import { Notification }')) {
      content = content.replace("import React", "import { Notification } from '../types';\nimport React");
    }
    if (file.includes('Leads.tsx') && !content.includes('import { LeadActivity }')) {
      content = content.replace("import React", "import { LeadActivity } from '../types';\nimport React");
    }
    if (file.includes('Expense.tsx') && !content.includes('import { Expense }')) {
      content = content.replace("import React", "import { Expense } from '../types';\nimport React");
    }
    if (file.includes('Clients.tsx') && !content.includes('import { Client, ClientContact, Deal, ClientActivity }')) {
      content = content.replace("import React", "import { Client, ClientContact, Deal, ClientActivity } from '../types';\nimport React");
    }
    if (file.includes('HR.tsx') && !content.includes('import { TeamMember }')) {
      content = content.replace("import React", "import { TeamMember } from '../types';\nimport React");
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed any types in', file);
  }
});
