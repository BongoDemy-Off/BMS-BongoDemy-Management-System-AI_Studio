const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const useEff = `
  useEffect(() => {
    // Automated Thursday Weekly Briefing (Client-Side Simulation)
    const today = new Date();
    if (today.getDay() === 4) { // 4 is Thursday
      const dateStr = today.toISOString().split('T')[0];
      const storageKey = \`weeklyBriefingDelivered_\${dateStr}\`;
      
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, 'true');
        // Auto-generate
        handleAIGenerateBriefing().then(() => {
          addNotification({ 
            type: 'success', 
            message: 'Your automated Thursday Executive Briefing is ready, and a copy has been emailed to bongodemy.official@gmail.com!' 
          });
        });
      }
    }
  }, []);
`;

if (!content.includes('useEffect(() => {')) {
  // Add import { useEffect }
  content = content.replace("import React, { useState }", "import React, { useState, useEffect }");
  // Insert useEffect
  content = content.replace("const handleAIGenerateBriefing = async () => {", useEff + "\n  const handleAIGenerateBriefing = async () => {");
  fs.writeFileSync('src/pages/Dashboard.tsx', content);
}
