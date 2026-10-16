const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
  // Feature 7: AI Client Ghostwriter (Project Update)
  app.post("/api/generate-client-update", async (req, res) => {
    try {
      const { project } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: \`You are an expert, highly professional Project Manager at BongoDemy. 
Write a polished, concise, and optimistic project update for the client "\${project.client}" regarding the project "\${project.name}".
Current Status: \${project.status}
Health: \${project.health || 'On Track'}
Progress: \${project.progress}%

Include any recent completed tasks or milestones if available. Keep the tone warm, confident, and professional. Format the output in Markdown. Use headings, bullet points for accomplishments, and a clear next steps section.\`,
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
