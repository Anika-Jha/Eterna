import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const artifacts = pgTable("artifacts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // recipe, skill, ritual, profession, etc.
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  extinctionRisk: integer("extinction_risk").notNull(), // 0-100
  fadeLevel: integer("fade_level").default(50).notNull(), // 0-100, 100 is fully faded
  aiNarrative: text("ai_narrative"),
  supportCount: integer("support_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastSupportedAt: timestamp("last_supported_at").defaultNow(),
  tokenId: text("token_id"),
  rarity: text("rarity"),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  artifactId: integer("artifact_id").notNull(),
  content: text("content").notNull(),
  supportCount: integer("support_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  reactions: jsonb("reactions").default({ "👍": 0, "❤️": 0, "😮": 0, "😢": 0, "🎉": 0 }).notNull(),
});

export const insertArtifactSchema = createInsertSchema(artifacts).omit({
  id: true,
  createdAt: true,
  lastSupportedAt: true,
  extinctionRisk: true,
  fadeLevel: true,
  supportCount: true,
  aiNarrative: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  supportCount: true,
});

export type Artifact = typeof artifacts.$inferSelect;
export type InsertArtifact = z.infer<typeof insertArtifactSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type CreateArtifactRequest = InsertArtifact;
export type CreateCommentRequest = InsertComment;

export type SupportAction = "vote" | "stake" | "interact";

export type SupportRequest = {
  action: SupportAction;
};

export interface DashboardStats {
  totalArtifacts: number;
  averageFadeLevel: number;
  totalInteractions: number;
  artifactsAtRisk: number; // fadeLevel > 80
}
