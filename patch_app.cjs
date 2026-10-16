const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "import { ClientPortal } from './pages/ClientPortal';",
  "import { ClientPortal } from './pages/ClientPortal';\nimport { PublicClientPortal } from './pages/PublicClientPortal';"
);

// Add to !currentUser routes
content = content.replace(
  '<Route path="*" element={<Navigate to="/login" replace />} />',
  '<Route path="/portal/:projectId" element={<PublicClientPortal />} />\n          <Route path="*" element={<Navigate to="/login" replace />} />'
);

// Add to client routes
content = content.replace(
  '<Route path="/" element={<ClientPortal />} />',
  '<Route path="/" element={<ClientPortal />} />\n          <Route path="/portal/:projectId" element={<PublicClientPortal />} />'
);

// Add to main routes
content = content.replace(
  '<Route path="/lead-capture" element={<LeadCapture />} />',
  '<Route path="/lead-capture" element={<LeadCapture />} />\n        <Route path="/portal/:projectId" element={<PublicClientPortal />} />'
);

fs.writeFileSync('src/App.tsx', content);
