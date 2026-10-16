const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const useEffBlock = `
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

// Remove the old useEffect block
if (content.includes("useEffect(() => {")) {
  const parts = content.split("useEffect(() => {");
  const before = parts[0];
  const afterUseEffect = parts[1].split("  }, []);")[1];
  
  content = before + afterUseEffect;
  
  // Re-insert it AFTER handleAIGenerateBriefing
  const insertPos = content.indexOf("const handleAIGenerateStandup = async () => {");
  if (insertPos !== -1) {
    const newContent = content.slice(0, insertPos) + useEffBlock + "\n  " + content.slice(insertPos);
    fs.writeFileSync('src/pages/Dashboard.tsx', newContent);
  }
}

