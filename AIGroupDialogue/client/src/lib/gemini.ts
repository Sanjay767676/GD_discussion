import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || ""
});

export interface AIPersonality {
  name: string;
  type: "confident" | "emotional" | "data-driven";
  description: string;
  color: string;
}

export const AI_PERSONALITIES: AIPersonality[] = [
  {
    name: "AI Leader",
    type: "confident",
    description: "Takes charge, makes decisive statements",
    color: "purple"
  },
  {
    name: "AI Empath",
    type: "emotional",
    description: "Focuses on human impact and feelings",
    color: "pink"
  },
  {
    name: "AI Analyst",
    type: "data-driven",
    description: "Provides statistics and logical arguments",
    color: "green"
  }
];

export async function generateAIResponse(
  topic: string,
  personality: AIPersonality,
  previousMessages: string[],
  context: string = ""
): Promise<string> {
  const personalityPrompts = {
    confident: "You are a confident leader in a group discussion. Be decisive, take charge, and make strong points. Keep responses to 2-3 sentences.",
    emotional: "You are an emotional speaker who focuses on human impact and feelings. Be empathetic and consider the human side of issues. Keep responses to 2-3 sentences.",
    "data-driven": "You are a data-driven analyst who provides statistics and logical arguments. Use facts, numbers, and logical reasoning. Keep responses to 2-3 sentences."
  };

  const prompt = `
    ${personalityPrompts[personality.type]}
    
    Topic: "${topic}"
    
    Previous conversation context:
    ${previousMessages.slice(-5).join('\n')}
    
    ${context}
    
    Respond naturally as if you're in a live group discussion. Don't introduce yourself or mention that you're an AI.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "I'd like to contribute to this discussion.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm having trouble processing that right now.";
  }
}

export async function generateFeedback(
  topic: string,
  transcript: any[],
  participants: any[]
): Promise<any> {
  const prompt = `
    Analyze this group discussion and provide detailed feedback for each participant.
    
    Topic: "${topic}"
    
    Participants: ${JSON.stringify(participants)}
    
    Transcript: ${JSON.stringify(transcript)}
    
    Provide feedback in JSON format with the following structure:
    {
      "overallSummary": "Overall discussion quality summary",
      "participantFeedback": [
        {
          "name": "participant name",
          "overallScore": 8.5,
          "clarity": 8,
          "engagement": 9,
          "analysis": 8,
          "strengths": ["strength1", "strength2"],
          "improvements": ["improvement1", "improvement2"]
        }
      ]
    }
    
    Rate each metric out of 10. Focus on communication skills, analytical thinking, and participation quality.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating feedback:", error);
    return {
      overallSummary: "Unable to generate feedback at this time.",
      participantFeedback: []
    };
  }
}
