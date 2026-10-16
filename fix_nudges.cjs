const fs = require('fs');

let content = fs.readFileSync('src/components/SmartNudges.tsx', 'utf8');
// AppContext might not export invoices directly.
// Let's modify SmartNudges to not crash if invoices is undefined, or remove it if not in context.
content = content.replace("const invoices = useAppContext(s => s.invoices);", "const invoices = useAppContext(s => (s as any).invoices || []);");
fs.writeFileSync('src/components/SmartNudges.tsx', content, 'utf8');
