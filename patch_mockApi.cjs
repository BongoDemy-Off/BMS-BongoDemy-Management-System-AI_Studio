const fs = require('fs');
let content = fs.readFileSync('src/services/mockApi.ts', 'utf8');

// Add reportTemplates to AppState and initial load
if (!content.includes('reportTemplates: ReportTemplate[]')) {
  // It uses Partial<AppState> maybe? Let's check mockApi.ts
}
