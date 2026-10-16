const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// The original import might just be ClientNotification instead of Notification due to my previous fix
if (content.includes('ClientNotification')) {
  content = content.replace(
    /import { ([^}]*) } from '\.\.\/types';/g,
    (match, p1) => {
      if (!p1.includes('ReportTemplate')) {
        return `import { ${p1}, ReportTemplate } from '../types';`;
      }
      return match;
    }
  );
  fs.writeFileSync('src/context/AppContext.tsx', content);
}
