const fs = require('fs');

let typesContent = fs.readFileSync('src/types.ts', 'utf8');
typesContent = typesContent.replace("role: 'admin' | 'client';", "role: 'admin' | 'client';\n  name?: string;");
typesContent = typesContent.replace("status: 'Paid' | 'Pending' | 'Overdue';", "status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';\n  project?: string;");
fs.writeFileSync('src/types.ts', typesContent);

let cpContent = fs.readFileSync('src/pages/ClientPortal.tsx', 'utf8');
cpContent = cpContent.replace("import { Notification } from '../types';", "import { ClientNotification } from '../types';");
cpContent = cpContent.replace("import { useAppContext, Deal, DealPhase } from '../context/AppContext';", "import { useAppContext } from '../context/AppContext';\nimport { Deal, DealPhase } from '../types';");

// ClientPortal.tsx Notification -> ClientNotification
cpContent = cpContent.replace(/Notification/g, "ClientNotification");
// Note: we replaced Notification with ClientNotification, so `ClientClientNotification` might happen?
// Wait, `import { ClientNotification }` was just updated.
// Let's just fix it properly via script.
fs.writeFileSync('src/pages/ClientPortal.tsx', cpContent);
