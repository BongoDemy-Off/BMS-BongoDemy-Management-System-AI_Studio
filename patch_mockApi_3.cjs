const fs = require('fs');

// 1. Fix AppContext.tsx mockApi missing
let context = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
context = context.replace(
  "  // Sync Report Templates to Storage\n  useEffect(() => {\n    mockApi.setCollection('reportTemplates' as any, reportTemplates).catch(console.error);\n  }, [reportTemplates]);\n",
  ""
);
fs.writeFileSync('src/context/AppContext.tsx', context);

// 2. Fix mockApi defaultState missing reportTemplates
let mockApi = fs.readFileSync('src/services/mockApi.ts', 'utf8');
mockApi = mockApi.replace(
  "contentCalendar: []\n};",
  "contentCalendar: [],\n  reportTemplates: []\n};"
);
fs.writeFileSync('src/services/mockApi.ts', mockApi);
