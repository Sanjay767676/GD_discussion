import { sessions, participants, messages, type Session, type InsertSession, type Participant, type InsertParticipant, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Session management
  getSession(sessionId: string): Promise<Session | undefined>;
  createSession(session: InsertSession, sessionId: string, joinLink: string): Promise<Session>;
  updateSession(sessionId: string, updates: Partial<Session>): Promise<Session>;
  getSessionsByStatus(status: string): Promise<Session[]>;
  
  // Participant management
  getParticipants(sessionId: string): Promise<Participant[]>;
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipant(participantId: number, updates: Partial<Participant>): Promise<Participant>;
  
  // Message management
  getMessages(sessionId: string): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;
  getMessagesByTimeRange(sessionId: string, startTime: Date, endTime: Date): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private participants: Map<string, Participant[]>;
  private messages: Map<string, Message[]>;
  private currentSessionId: number;
  private currentParticipantId: number;
  private currentMessageId: number;

  constructor() {
    this.sessions = new Map();
    this.participants = new Map();
    this.messages = new Map();
    this.currentSessionId = 1;
    this.currentParticipantId = 1;
    this.currentMessageId = 1;
  }

  // Session management
  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async createSession(insertSession: InsertSession, sessionId: string, joinLink: string): Promise<Session> {
    const session: Session = {
      id: this.currentSessionId++,
      ...insertSession,
      sessionId,
      joinLink,
      aiCount: insertSession.aiCount || 2,
      realCount: insertSession.realCount || 3,
      status: "scheduled",
      participants: insertSession.participants || [],
      transcript: insertSession.transcript || [],
      feedback: insertSession.feedback || null,
      startedAt: insertSession.startedAt || null,
      completedAt: insertSession.completedAt || null,
      duration: insertSession.duration || null,
    };
    
    this.sessions.set(session.sessionId, session);
    return session;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const updatedSession = { ...session, ...updates };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async getSessionsByStatus(status: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(session => session.status === status);
  }

  // Participant management
  async getParticipants(sessionId: string): Promise<Participant[]> {
    return this.participants.get(sessionId) || [];
  }

  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const participant: Participant = {
      id: this.currentParticipantId++,
      ...insertParticipant,
      aiPersonality: insertParticipant.aiPersonality || null,
      joinedAt: new Date(),
      isActive: insertParticipant.isActive ?? true,
    };

    const sessionParticipants = this.participants.get(insertParticipant.sessionId) || [];
    sessionParticipants.push(participant);
    this.participants.set(insertParticipant.sessionId, sessionParticipants);

    return participant;
  }

  async updateParticipant(participantId: number, updates: Partial<Participant>): Promise<Participant> {
    for (const [sessionId, participants] of Array.from(this.participants.entries())) {
      const index = participants.findIndex((p: Participant) => p.id === participantId);
      if (index !== -1) {
        participants[index] = { ...participants[index], ...updates };
        return participants[index];
      }
    }
    throw new Error(`Participant ${participantId} not found`);
  }

  // Message management
  async getMessages(sessionId: string): Promise<Message[]> {
    return this.messages.get(sessionId) || [];
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.currentMessageId++,
      ...insertMessage,
      type: insertMessage.type || "text",
      isAi: insertMessage.isAi ?? false,
      timestamp: new Date(),
    };

    const sessionMessages = this.messages.get(insertMessage.sessionId) || [];
    sessionMessages.push(message);
    this.messages.set(insertMessage.sessionId, sessionMessages);

    return message;
  }

  async getMessagesByTimeRange(sessionId: string, startTime: Date, endTime: Date): Promise<Message[]> {
    const messages = this.messages.get(sessionId) || [];
    return messages.filter(msg => 
      msg.timestamp && msg.timestamp >= startTime && msg.timestamp <= endTime
    );
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getSession(sessionId: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId));
    return session || undefined;
  }

  async createSession(insertSession: InsertSession, sessionId: string, joinLink: string): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values({
        ...insertSession,
        sessionId,
        joinLink,
        status: "scheduled",
      })
      .returning();
    return session;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
    const [session] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.sessionId, sessionId))
      .returning();
    return session;
  }

  async getSessionsByStatus(status: string): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.status, status));
  }

  async getParticipants(sessionId: string): Promise<Participant[]> {
    return await db.select().from(participants).where(eq(participants.sessionId, sessionId));
  }

  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const [participant] = await db
      .insert(participants)
      .values(insertParticipant)
      .returning();
    return participant;
  }

  async updateParticipant(participantId: number, updates: Partial<Participant>): Promise<Participant> {
    const [participant] = await db
      .update(participants)
      .set(updates)
      .where(eq(participants.id, participantId))
      .returning();
    return participant;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.sessionId, sessionId));
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessagesByTimeRange(sessionId: string, startTime: Date, endTime: Date): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
