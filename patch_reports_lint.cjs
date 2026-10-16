const fs = require('fs');
let content = fs.readFileSync('src/pages/Reports.tsx', 'utf8');
content = content.replace(
  "Number(completedProjects) / totalProjects",
  "Number(completedProjects) / Number(totalProjects)"
);
fs.writeFileSync('src/pages/Reports.tsx', content);
