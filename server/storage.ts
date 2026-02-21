import { db } from "./db";
import { artifacts, comments, type InsertArtifact, type InsertComment } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getArtifacts(): Promise<(typeof artifacts.$inferSelect)[]>;
  getArtifact(id: number): Promise<typeof artifacts.$inferSelect | undefined>;
  createArtifact(artifact: InsertArtifact): Promise<typeof artifacts.$inferSelect>;
  updateArtifact(id: number, updates: Partial<InsertArtifact>): Promise<typeof artifacts.$inferSelect>;
  
  getComments(artifactId: number): Promise<(typeof comments.$inferSelect)[]>;
  createComment(comment: InsertComment): Promise<typeof comments.$inferSelect>;
  updateComment(id: number, updates: Partial<InsertComment>): Promise<typeof comments.$inferSelect>;

  supportArtifact(id: number, action: "vote" | "stake" | "interact"): Promise<typeof artifacts.$inferSelect | undefined>;
  supportComment(id: number): Promise<typeof comments.$inferSelect | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getArtifacts(): Promise<(typeof artifacts.$inferSelect)[]> {
    return await db.select().from(artifacts).orderBy(desc(artifacts.createdAt));
  }

  async getArtifact(id: number): Promise<typeof artifacts.$inferSelect | undefined> {
    const [artifact] = await db.select().from(artifacts).where(eq(artifacts.id, id));
    return artifact;
  }

  async createArtifact(insertArtifact: InsertArtifact): Promise<typeof artifacts.$inferSelect> {
    const extinctionRisk = Math.floor(Math.random() * 80) + 20; // 20-100% risk initially
    const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    const tokenId = `ETR-${Math.floor(Math.random() * 1000000).toString(16).toUpperCase()}`;

    const [artifact] = await db
      .insert(artifacts)
      .values({ 
        ...insertArtifact,
        extinctionRisk,
        fadeLevel: 0, 
        supportCount: 0,
        rarity,
        tokenId,
      })
      .returning();
    return artifact;
  }

  async updateArtifact(id: number, updates: Partial<InsertArtifact>): Promise<typeof artifacts.$inferSelect> {
    const [updated] = await db
      .update(artifacts)
      .set(updates)
      .where(eq(artifacts.id, id))
      .returning();
    return updated;
  }

  async getComments(artifactId: number): Promise<(typeof comments.$inferSelect)[]> {
    return await db.select().from(comments).where(eq(comments.artifactId, artifactId)).orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<typeof comments.$inferSelect> {
    const [comment] = await db.insert(comments).values({
      ...insertComment,
      reactions: { "👍": 0, "❤️": 0, "😮": 0, "😢": 0, "🎉": 0 }
    }).returning();
    return comment;
  }

  async updateComment(id: number, updates: Partial<InsertComment>): Promise<typeof comments.$inferSelect> {
     const [updated] = await db
      .update(comments)
      .set(updates)
      .where(eq(comments.id, id))
      .returning();
    return updated;
  }

  async reactToComment(id: number, emoji: string): Promise<typeof comments.$inferSelect | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    if (!comment) return undefined;

    const reactions = comment.reactions as Record<string, number>;
    if (reactions[emoji] !== undefined) {
      reactions[emoji] += 1;
    }

    const [updated] = await db
      .update(comments)
      .set({ reactions })
      .where(eq(comments.id, id))
      .returning();
    return updated;
  }

  async supportArtifact(id: number, action: "vote" | "stake" | "interact"): Promise<typeof artifacts.$inferSelect | undefined> {
    const artifact = await this.getArtifact(id);
    if (!artifact) return undefined;

    // Different actions could have different impacts, but for now they all increase support and reduce fade
    let newFadeLevel = Math.max(0, artifact.fadeLevel - 20); // Decrease fade by 20 on support
    
    // Stakes might reduce risk
    let newExtinctionRisk = artifact.extinctionRisk;
    if (action === "stake") {
       newExtinctionRisk = Math.max(5, artifact.extinctionRisk - 5);
    } else if (action === "vote") {
       newExtinctionRisk = Math.max(5, artifact.extinctionRisk - 2);
    } else {
       newExtinctionRisk = Math.max(5, artifact.extinctionRisk - 1);
    }

    const [updated] = await db
      .update(artifacts)
      .set({ 
        supportCount: artifact.supportCount + 1,
        fadeLevel: newFadeLevel,
        extinctionRisk: newExtinctionRisk,
        lastSupportedAt: new Date()
      })
      .where(eq(artifacts.id, id))
      .returning();
    return updated;
  }

  async supportComment(id: number): Promise<typeof comments.$inferSelect | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    if (!comment) return undefined;

    const [updated] = await db
      .update(comments)
      .set({ supportCount: comment.supportCount + 1 })
      .where(eq(comments.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
