const fs = require('fs');

let serverContent = fs.readFileSync('server.ts', 'utf8');
if (!serverContent.includes('node-cron')) {
  serverContent = 'import cron from "node-cron";\n' + serverContent;
  const cronJob = `
  // Scheduled Weekly Executive Briefing
  cron.schedule("0 9 * * 4", async () => {
    console.log("CRON: Generating Thursday Weekly Briefing");
    // Mock the email logic
    console.log("CRON: Briefing generated. Simulating email to bongodemy.official@gmail.com...");
  });
`;
  serverContent = serverContent.replace('// Vite middleware', cronJob + '\n  // Vite middleware');
  fs.writeFileSync('server.ts', serverContent);
}
