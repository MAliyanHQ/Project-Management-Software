import { GoogleGenAI, Type } from "@google/genai";
import { Task, Project, User, Status } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProjectSummary = async (
  project: Project,
  tasks: Task[],
  users: User[]
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Prepare context data
    const projectContext = `
      Project: ${project.name}
      Description: ${project.description}
      Total Tasks: ${tasks.length}
      Completed: ${tasks.filter(t => t.status === Status.DONE).length}
      Team Size: ${project.members.length}
    `;

    const taskDetails = tasks.map(t => {
      const assignees = t.assignedTo.map(id => users.find(u => u.id === id)?.fullName || 'Unknown').join(', ');
      return `- ${t.title} (${t.status}): Assigned to [${assignees || 'Unassigned'}]`;
    }).join('\n');

    const prompt = `
      Analyze the following project data and provide a concise executive summary (max 100 words).
      Highlight risks, progress, and suggest 2 actionable next steps.
      
      ${projectContext}
      
      Task Details:
      ${taskDetails}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("AI Error:", error);
    return "AI Service Unavailable. Please check API Key.";
  }
};

export const suggestSubtasks = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `For a task titled "${taskTitle}" with description "${taskDescription}", suggest 3-5 concrete subtasks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    return JSON.parse(response.text);
  } catch (e) {
    console.error("AI Subtask Error", e);
    return ["Review requirements", "Draft initial implementation", "Test functionality"];
  }
};