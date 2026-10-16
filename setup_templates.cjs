const fs = require('fs');

// 1. Update types.ts
let typesContent = fs.readFileSync('src/types.ts', 'utf8');
const reportTemplateType = `
export type ReportTemplate = {
  id: string;
  name: string;
  structure: string;
  isActive: boolean;
};
`;
if (!typesContent.includes('ReportTemplate')) {
  fs.writeFileSync('src/types.ts', typesContent + reportTemplateType);
}

// 2. Update AppContext.tsx
let contextContent = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
if (!contextContent.includes('reportTemplates')) {
  // Add to AppState
  contextContent = contextContent.replace(
    'setTasks: React.Dispatch<React.SetStateAction<Task[]>>;',
    'setTasks: React.Dispatch<React.SetStateAction<Task[]>>;\n  reportTemplates: ReportTemplate[];\n  setReportTemplates: React.Dispatch<React.SetStateAction<ReportTemplate[]>>;'
  );
  
  // Add to AppStore
  const storeDefaults = `
  reportTemplates: [
    {
      id: 'default-template',
      name: 'Default Executive Briefing',
      structure: 'Focus on high-level progress, financial health, and actionable items. Do not use overly robotic language.\\n\\nReturn formatted nicely in Markdown with headings like 🌟 Highlights, 📊 Financial Pulse, ⚠️ Attention Required.',
      isActive: true
    }
  ],
  setReportTemplates: (val) => set(state => ({ reportTemplates: typeof val === 'function' ? val(state.reportTemplates) : val })),
  `;
  
  contextContent = contextContent.replace(
    'setTasks: (val) => set(state => ({ tasks: typeof val === \'function\' ? val(state.tasks) : val })),',
    'setTasks: (val) => set(state => ({ tasks: typeof val === \'function\' ? val(state.tasks) : val })),\n' + storeDefaults
  );
  
  // Also import the type
  contextContent = contextContent.replace(
    "import { Role, PermissionCategory, TeamMember, Notification, UserPreferences, Lead, Client, Deal, Project, Task } from '../types';",
    "import { Role, PermissionCategory, TeamMember, Notification, UserPreferences, Lead, Client, Deal, Project, Task, ReportTemplate } from '../types';"
  );
  
  fs.writeFileSync('src/context/AppContext.tsx', contextContent);
}

