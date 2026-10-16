import cron from "node-cron";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/prioritize-tasks", async (req, res) => {
    try {
      const { tasks, date } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an AI task prioritizer. Here is a list of tasks. Re-order them based on deadlines, dependencies, and estimated time. The most critical items for today (${new Date(date).toDateString()}) should be at the top. The output MUST be a JSON array of task IDs representing the new order.
        
Tasks:
${JSON.stringify(tasks, null, 2)}
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.NUMBER,
            },
          },
        },
      });

      const orderedTaskIds = JSON.parse(response.text.trim());
      res.json({ orderedTaskIds });
    } catch (error: any) {
      console.error('Error prioritizing tasks:', error);
      res.status(500).json({ error: error.message || 'Failed to prioritize tasks' });
    }
  });

  // Feature 1: AI Generate Subtasks
  app.post("/api/generate-subtasks", async (req, res) => {
    try {
      const { title, description } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Break down the following task into 3-5 logical subtasks.
Task: ${title}
Description: ${description || "No description provided."}

Return ONLY a JSON array of strings representing the subtask titles.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });
      res.json({ subtasks: JSON.parse(response.text.trim()) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Score Leads Feature
  app.post("/api/score-leads", async (req, res) => {
    try {
      const { leads } = req.body;
      const prompt = `You are an expert sales AI. Review the following list of sales leads and give each one a score from 1 to 99 based on their engagement, value, probability, stage, and activities.
      
Leads: ${JSON.stringify(leads, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER, description: "Lead ID" },
                aiScore: { type: Type.INTEGER, description: "Lead Score between 1 and 99" }
              },
              required: ["id", "aiScore"]
            }
          }
        }
      });
      
      res.json({ scores: JSON.parse(response.text.trim()) });
    } catch (error: any) {
      console.error("Error scoring leads API:", error);
      res.status(500).json({ error: error.message || 'Failed to score leads' });
    }
  });

  // Feature 2: AI Project Risk Assessor
  app.post("/api/analyze-project-risk", async (req, res) => {
    try {
      const { project, tasks } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this project and its tasks to assess risk level. Look at deadlines, time spent vs estimated time, and unassigned/blocked tasks.
Project:
${JSON.stringify(project)}

Tasks:
${JSON.stringify(tasks)}

Return a JSON object with 'riskLevel' ("High", "Medium", or "Low") and 'reasoning' (1-2 sentences).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
            required: ["riskLevel", "reasoning"],
          },
        },
      });
      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Feature 3: AI Meeting Summarizer
  app.post("/api/summarize-meeting", async (req, res) => {
    try {
      const { notes } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Summarize the following meeting notes and extract a list of action items.
Notes:
${notes}

Return a JSON object with 'summary' (a brief paragraph) and 'actionItems' (an array of strings).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["summary", "actionItems"],
          },
        },
      });
      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Feature 4: AI Daily Standup Generator
  app.post("/api/generate-standup", async (req, res) => {
    try {
      const { user, activity, tasks } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a short "Daily Standup" update for ${user.email}.
Recent Activity:
${JSON.stringify(activity)}
Assigned Tasks:
${JSON.stringify(tasks)}

Return a JSON object with 'standupText' (a 2-3 paragraph casual update outlining what they did, what they are doing, and any blockers based on status).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              standupText: { type: Type.STRING },
            },
            required: ["standupText"],
          },
        },
      });
      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Feature 5: AI Skill Gap Analyzer
  app.post("/api/analyze-skill-gaps", async (req, res) => {
    try {
      const { teamMembers, projects } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze the team's skills against current project requirements. Find potential skill gaps or bottlenecks.
Team:
${JSON.stringify(teamMembers)}
Projects:
${JSON.stringify(projects)}

Return a JSON object with 'analysis' (1 paragraph summary) and 'recommendations' (array of strings for specific training/hiring).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["analysis", "recommendations"],
          },
        },
      });
      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // Feature 6: Executive AI Synthesis (Weekly Briefing)
  app.post("/api/generate-weekly-report", async (req, res) => {
    try {
      const { projects = [], tasks = [], leads = [], invoices = [], customTemplate } = req.body;
      const instructions = customTemplate || `Focus on high-level progress, financial health, and actionable items. Do not use overly robotic language.\nReturn formatted nicely in Markdown with headings like 🌟 Highlights, 📊 Financial Pulse, ⚠️ Attention Required.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert executive assistant for the CEO of BongoDemy, who is an introverted founder and prefers concise, calm, and highly readable updates. Write a Thursday Weekly Executive Briefing. 
${instructions}

Projects Data:
${JSON.stringify(projects.slice(0, 10))}

Tasks Data (only showing subset):
${JSON.stringify(tasks.slice(0, 20))}

Leads Data:
${JSON.stringify(leads.slice(0, 10))}

Invoices Data:
${JSON.stringify(invoices.slice(0, 10))}

Return a JSON object with 'briefingText' containing the final Markdown report.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              briefingText: { type: Type.STRING },
            },
            required: ["briefingText"],
          },
        },
      });
      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // Feature 7: AI Client Ghostwriter (Project Update)
  app.post("/api/generate-client-update", async (req, res) => {
    try {
      const { project } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert, highly professional Project Manager at BongoDemy. 
Write a polished, concise, and optimistic project update for the client "${project.client}" regarding the project "${project.name}".
Current Status: ${project.status}
Health: ${project.health || 'On Track'}
Progress: ${project.progress}%

Include any recent completed tasks or milestones if available. Keep the tone warm, confident, and professional. Format the output in Markdown. Use headings, bullet points for accomplishments, and a clear next steps section.`,
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


  // Feature 8: AI Team Impact Dossier
  app.post("/api/generate-team-dossier", async (req, res) => {
    try {
      const { member, tasks } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert HR Data Analyst and Performance Manager at BongoDemy. 
Write an objective, data-driven "Impact & Activity Dossier" for the team member "${member.name}" (Role: ${member.role}).
Here is the data:
Member Details: ${JSON.stringify(member)}
Assigned Tasks: ${JSON.stringify(tasks)}

Analyze their task completion rate, active projects, skill coverage, and general workload. 
Format the output in Markdown. Use headings, bullet points, and a clear, objective tone. Include sections for: 
1. Executive Summary
2. Task Velocity & Completion 
3. Skill Utilization
4. Recommendations/Next Steps.`,
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

  
  // Scheduled Weekly Executive Briefing
  cron.schedule("0 9 * * 4", async () => {
    console.log("CRON: Generating Thursday Weekly Briefing");
    // Mock the email logic
    console.log("CRON: Briefing generated. Simulating email to bongodemy.official@gmail.com...");
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
