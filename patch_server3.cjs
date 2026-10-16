const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
  // Feature 8: AI Team Impact Dossier
  app.post("/api/generate-team-dossier", async (req, res) => {
    try {
      const { member, tasks } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: \`You are an expert HR Data Analyst and Performance Manager at BongoDemy. 
Write an objective, data-driven "Impact & Activity Dossier" for the team member "\${member.name}" (Role: \${member.role}).
Here is the data:
Member Details: \${JSON.stringify(member)}
Assigned Tasks: \${JSON.stringify(tasks)}

Analyze their task completion rate, active projects, skill coverage, and general workload. 
Format the output in Markdown. Use headings, bullet points, and a clear, objective tone. Include sections for: 
1. Executive Summary
2. Task Velocity & Completion 
3. Skill Utilization
4. Recommendations/Next Steps.\`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              markdownText: { type: Type.STRING },
            },
            required: ["markdownText"],
          },
        },
      });
      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

`;

content = content.replace('  // Vite middleware for development', newEndpoint + '  // Vite middleware for development');
fs.writeFileSync('server.ts', content);
