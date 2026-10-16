const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// I also need to sync reportTemplates to mockApi inside AppContext.
if (!content.includes('// Sync Report Templates to Storage')) {
  const syncEffect = `
  // Sync Report Templates to Storage
  useEffect(() => {
    mockApi.setCollection('reportTemplates' as any, reportTemplates).catch(console.error);
  }, [reportTemplates]);
`;
  content = content.replace(
    'return <>{children}</>;',
    syncEffect + '\n  return <>{children}</>;'
  );
  fs.writeFileSync('src/context/AppContext.tsx', content);
}
