
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getAiResponse(contactName: string, chatHistory: { role: 'user' | 'model', text: string }[]) {
  try {
    const model = 'gemini-3-flash-preview';
    const contents = chatHistory.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: `You are ${contactName}, a real person using the "Flash" messaging app. 
        Your goal is to have a natural, brief, and engaging conversation. 
        Don't mention you are an AI. Use emojis occasionally. Keep responses under 2 sentences.`,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    return response.text || "Sorry, I'm a bit busy right now! ⚡";
  } catch (error) {
    console.error("AI Response Error:", error);
    return "Flash is lightning fast, but my brain lagged! Try again. ⚡";
  }
}
