const fs = require('fs');

let dbContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
if (!dbContent.includes('reportTemplates')) {
  dbContent = dbContent.replace(
    'const leads = useAppContext(s => s.leads);',
    'const leads = useAppContext(s => s.leads);\n  const reportTemplates = useAppContext(s => (s as any).reportTemplates || []);'
  );
  
  dbContent = dbContent.replace(
    'invoices: invoices || []',
    'invoices: invoices || [],\n           customTemplate: (reportTemplates.find((t: any) => t.isActive) || {}).structure'
  );
  
  fs.writeFileSync('src/pages/Dashboard.tsx', dbContent);
}

