const fs = require('fs');
let content = fs.readFileSync('src/services/mockApi.ts', 'utf8');

// The AppState here doesn't have reportTemplates, so it doesn't get saved to localStorage
if (!content.includes('reportTemplates:')) {
  content = content.replace(
    'contentCalendar: unknown[];',
    'contentCalendar: unknown[];\n  reportTemplates: unknown[];'
  );
  content = content.replace(
    'contentCalendar: [],',
    'contentCalendar: [],\n  reportTemplates: [],'
  );
  fs.writeFileSync('src/services/mockApi.ts', content);
}
