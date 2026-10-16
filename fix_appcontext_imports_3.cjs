const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
  "import { Role, PermissionCategory, TeamMember, Notification, UserPreferences, Lead, Client, CurrentUser } from '../types';",
  "import { Role, PermissionCategory, TeamMember, Notification, UserPreferences, Lead, Client, CurrentUser, ReportTemplate } from '../types';"
);
fs.writeFileSync('src/context/AppContext.tsx', content);

let reports = fs.readFileSync('src/pages/Reports.tsx', 'utf8');
reports = reports.replace(
  "totalProjects = Number(activeProjects) + Number(completedProjects)",
  "totalProjects = Number(activeProjects) + Number(completedProjects) as number"
);
reports = reports.replace(
  "projectProgress = (Number(completedProjects) / totalProjects) * 100",
  "projectProgress = (Number(completedProjects) / Number(totalProjects)) * 100"
);
fs.writeFileSync('src/pages/Reports.tsx', reports);
