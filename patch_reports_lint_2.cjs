const fs = require('fs');
let content = fs.readFileSync('src/pages/Reports.tsx', 'utf8');

// The lint error was about "Operator '+' cannot be applied to types 'number' and 'string | number'." at lines 68 and 79.
// But they aren't lines 68 and 79 in Reports.tsx, let's search for reduce functions in Reports.tsx
const allContent = content;

// Wait, the errors were:
// src/pages/Reports.tsx(68,95): error TS2365: Operator '+' cannot be applied to types 'number' and 'string | number'.
// src/pages/Reports.tsx(79,137): error TS2365: Operator '+' cannot be applied to types 'number' and 'string | number'.
// Wait, looking at lines 68 and 79 above:
// const revenue = initialInvoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0); -> sum + inv.amount (inv.amount might be string | number)
// const accountsReceivable = initialInvoices.filter(inv => inv.status === 'Pending' || inv.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0);

content = content.replace(
  "reduce((sum, inv) => sum + inv.amount, 0);",
  "reduce((sum, inv) => sum + Number(inv.amount), 0);"
);

content = content.replace(
  "reduce((sum, inv) => sum + inv.amount, 0);",
  "reduce((sum, inv) => sum + Number(inv.amount), 0);"
);

fs.writeFileSync('src/pages/Reports.tsx', content);

