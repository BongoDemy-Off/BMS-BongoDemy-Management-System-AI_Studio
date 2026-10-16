const fs = require('fs');

let serverContent = fs.readFileSync('server.ts', 'utf8');

const oldLine = `const { projects = [], tasks = [], leads = [], invoices = [] } = req.body;`;
const newLine = `const { projects = [], tasks = [], leads = [], invoices = [], customTemplate } = req.body;
      const instructions = customTemplate || \`Focus on high-level progress, financial health, and actionable items. Do not use overly robotic language.\\nReturn formatted nicely in Markdown with headings like 🌟 Highlights, 📊 Financial Pulse, ⚠️ Attention Required.\`;`;

serverContent = serverContent.replace(oldLine, newLine);

const oldPrompt = `Write a Thursday Weekly Executive Briefing. 
Focus on high-level progress, financial health, and actionable items. Do not use overly robotic language.

Projects Data:`;

const newPrompt = `Write a Thursday Weekly Executive Briefing. 
\${instructions}

Projects Data:`;

serverContent = serverContent.replace(oldPrompt, newPrompt);
serverContent = serverContent.replace(
  "Return a JSON object with 'briefingText' (formatted nicely in Markdown with headings like 🌟 Highlights, 📊 Financial Pulse, ⚠️ Attention Required).`,",
  "Return a JSON object with 'briefingText' containing the final Markdown report.`,"
);

fs.writeFileSync('server.ts', serverContent);
