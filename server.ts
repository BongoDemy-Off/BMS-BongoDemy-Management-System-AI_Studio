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
