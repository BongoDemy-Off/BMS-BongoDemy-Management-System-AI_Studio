const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

if (!content.includes('ReportTemplate } from \'../types\'')) {
  content = content.replace(
    "import { Role, PermissionCategory, TeamMember, Notification, UserPreferences, Lead, Client, Deal, Project, Task } from '../types';",
    "import { Role, PermissionCategory, TeamMember, Notification, UserPreferences, Lead, Client, Deal, Project, Task, ReportTemplate } from '../types';"
  );
  fs.writeFileSync('src/context/AppContext.tsx', content);
}
