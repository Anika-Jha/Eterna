// Seed script to add initial data to the database
import { db } from "./db";
import { artifacts, comments } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");
  
  const existingArtifacts = await db.select().from(artifacts);
  if (existingArtifacts.length > 0) {
    console.log("Database already seeded. Skipping.");
    process.exit(0);
  }

  // Add 3 sample artifacts
  const a1 = await db.insert(artifacts).values({
    title: "Grandma's Sourdough Bread",
    type: "recipe",
    description: "A 100-year old sourdough starter recipe passed down through generations. Requires daily feeding and a warm environment.",
    imageUrl: "https://images.unsplash.com/photo-1589367920969-ab8e050bf0ef?q=80&w=1000&auto=format&fit=crop",
    tags: ["baking", "family", "tradition"],
    extinctionRisk: 85,
    fadeLevel: 40,
    supportCount: 12,
    aiNarrative: "The warmth of a kitchen, the smell of yeast and time. A legacy that only survives if hands are willing to knead.",
  }).returning();

  const a2 = await db.insert(artifacts).values({
    title: "Watchmaking by Hand",
    type: "skill",
    description: "The delicate art of assembling mechanical timepieces without digital assistance. A meditative practice requiring immense focus.",
    imageUrl: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=1000&auto=format&fit=crop",
    tags: ["craftsmanship", "time", "focus"],
    extinctionRisk: 92,
    fadeLevel: 75,
    supportCount: 5,
    aiNarrative: "Tiny gears and springs, a heartbeat built from metal. As the digital age races forward, the metronome of the past slows.",
  }).returning();

  const a3 = await db.insert(artifacts).values({
    title: "The Summer Solstice Bonfire",
    type: "ritual",
    description: "An annual gathering to celebrate the longest day of the year. Involves leaping over the flames and singing old folk songs.",
    imageUrl: "https://images.unsplash.com/photo-1525087740718-9e0f2c58c7ef?q=80&w=1000&auto=format&fit=crop",
    tags: ["community", "nature", "celebration"],
    extinctionRisk: 45,
    fadeLevel: 10,
    supportCount: 38,
    aiNarrative: "Flames reaching for the brief night sky. A primal echo of when we gathered not around screens, but around the fire.",
  }).returning();

  // Add some comments
  await db.insert(comments).values({
    artifactId: a1[0].id,
    content: "I remember my own grandmother making this. We need to keep these recipes alive!",
    supportCount: 4,
  });

  await db.insert(comments).values({
    artifactId: a1[0].id,
    content: "Is the starter difficult to maintain?",
    supportCount: 1,
  });

  await db.insert(comments).values({
    artifactId: a2[0].id,
    content: "Such a beautiful and lost art.",
    supportCount: 7,
  });

  console.log("Database seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
