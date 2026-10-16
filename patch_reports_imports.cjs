const fs = require('fs');

let content = fs.readFileSync('src/pages/Reports.tsx', 'utf8');

// Update activeTab type
content = content.replace(
  "useState<'daily' | 'financial' | 'vapt' | 'scheduled'>('daily');",
  "useState<'daily' | 'financial' | 'vapt' | 'scheduled' | 'templates'>('daily');"
);

// Import what we need
if (!content.includes('useAppContext')) {
  content = content.replace(
    "import { initialInvoices } from './Invoices';",
    "import { initialInvoices } from './Invoices';\nimport { useAppContext } from '../context/AppContext';"
  );
  content = content.replace(
    "import { Plus, Search, Filter",
    "import { Plus, Search, Filter, Settings, FileCode2, Edit3, Trash2"
  );
}

fs.writeFileSync('src/pages/Reports.tsx', content);
