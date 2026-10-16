const fs = require('fs');
let cpContent = fs.readFileSync('src/pages/ClientPortal.tsx', 'utf8');
cpContent = cpContent.replace(/ClientClientNotification/g, "ClientNotification");
fs.writeFileSync('src/pages/ClientPortal.tsx', cpContent);
