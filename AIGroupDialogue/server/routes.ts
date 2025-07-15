import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertParticipantSchema, insertMessageSchema } from "@shared/schema";
import { generateAIResponse, generateFeedback, AI_PERSONALITIES } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session management routes
  app.post("/api/sessions", async (req, res) => {
    try {
      // Parse and transform data
      const sessionData = insertSessionSchema.parse(req.body);
      
      // Generate unique session ID
      const sessionId = Math.random().toString(36).substring(2, 8);
      
      // Create session
      const session = await storage.createSession(
        sessionData,
        sessionId,
        `${req.protocol}://${req.get('host')}/join/${sessionId}`
      );

      // Add AI participants
      const aiPersonalities = AI_PERSONALITIES.slice(0, sessionData.aiCount || 2);
      for (const personality of aiPersonalities) {
        await storage.addParticipant({
          sessionId,
          name: personality.name,
          type: "ai",
          aiPersonality: personality.type,
        });
      }

      res.json(session);
    } catch (error) {
      console.error("Session creation error:", error);
      res.status(400).json({ error: "Invalid session data", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.patch("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      
      const session = await storage.updateSession(sessionId, updates);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Failed to update session" });
    }
  });

  // Participant management routes
  app.get("/api/sessions/:sessionId/participants", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const participants = await storage.getParticipants(sessionId);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  app.post("/api/sessions/:sessionId/participants", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const participantData = insertParticipantSchema.parse({
        ...req.body,
        sessionId,
      });
      
      const participant = await storage.addParticipant(participantData);
      res.json(participant);
    } catch (error) {
      res.status(400).json({ error: "Invalid participant data" });
    }
  });

  // Message management routes
  app.get("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        sessionId,
      });
      
      const message = await storage.addMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // AI response generation
  app.post("/api/sessions/:sessionId/ai-response", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { personality, context } = req.body;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const messages = await storage.getMessages(sessionId);
      const recentMessages = messages.slice(-10).map(m => `${m.speaker}: ${m.message}`);
      
      const aiPersonality = AI_PERSONALITIES.find(p => p.type === personality);
      if (!aiPersonality) {
        return res.status(400).json({ error: "Invalid personality type" });
      }

      const response = await generateAIResponse(
        session.topic,
        aiPersonality,
        recentMessages,
        context
      );

      // Save the AI response as a message
      await storage.addMessage({
        sessionId,
        speaker: aiPersonality.name,
        message: response,
        isAi: true,
        type: "text",
      });

      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Feedback generation
  app.post("/api/sessions/:sessionId/feedback", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const messages = await storage.getMessages(sessionId);
      const participants = await storage.getParticipants(sessionId);
      
      const feedback = await generateFeedback(
        session.topic,
        messages,
        participants
      );

      // Update session with feedback
      await storage.updateSession(sessionId, { feedback });

      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate feedback" });
    }
  });

  // Session transcript
  app.get("/api/sessions/:sessionId/transcript", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessages(sessionId);
      
      const transcript = messages.map(msg => ({
        speaker: msg.speaker,
        message: msg.message,
        timestamp: msg.timestamp ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));

      res.json(transcript);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transcript" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
