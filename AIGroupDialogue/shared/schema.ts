import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  topic: text("topic").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  aiCount: integer("ai_count").notNull().default(2),
  realCount: integer("real_count").notNull().default(3),
  joinLink: text("join_link").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, active, completed
  createdBy: text("created_by").notNull(),
  participants: jsonb("participants").default([]),
  transcript: jsonb("transcript").default([]),
  feedback: jsonb("feedback"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // in seconds
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "real" or "ai"
  aiPersonality: text("ai_personality"), // "confident", "emotional", "data-driven"
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  speaker: text("speaker").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  type: text("type").notNull().default("text"), // "text", "voice"
  isAi: boolean("is_ai").default(false),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  sessionId: true,
  joinLink: true,
  status: true,
}).extend({
  scheduledAt: z.union([z.date(), z.string().transform((str) => new Date(str))]),
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  joinedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
