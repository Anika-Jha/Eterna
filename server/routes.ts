import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function generateAINarrative(artifactTitle: string, artifactType: string, description: string): Promise<string> {
  try {
    const prompt = `You are the archivist of Eterna, a digital museum of human memory. 
    Write a short (2-3 sentences) poetic and somewhat melancholic narrative about the following artifact being preserved before it fades into obscurity.
    Artifact Title: ${artifactTitle}
    Type: ${artifactType}
    Description: ${description}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 150,
    });

    return response.choices[0]?.message?.content || "A memory suspended in digital amber, waiting for someone to care.";
  } catch (error) {
    console.error("Failed to generate AI narrative:", error);
    return "This artifact hums with a quiet energy, hoping not to be forgotten.";
  }
}

// Background task to simulate fading over time
function simulateFading() {
  setInterval(async () => {
    try {
      const allArtifacts = await storage.getArtifacts();
      const now = new Date();
      
      for (const artifact of allArtifacts) {
        // Calculate hours since last support
        const hoursSinceSupport = (now.getTime() - new Date(artifact.lastSupportedAt!).getTime()) / (1000 * 60 * 60);
        
        // If more than 1 hour passed without support, increase fade level
        // The higher the extinction risk, the faster it fades
        if (hoursSinceSupport > 1) {
           const fadeIncrease = Math.ceil(artifact.extinctionRisk / 10); // 1 to 10 points depending on risk
           const newFade = Math.min(100, artifact.fadeLevel + fadeIncrease);
           
           if (newFade !== artifact.fadeLevel) {
              await storage.updateArtifact(artifact.id, { fadeLevel: newFade } as any);
           }
        }
      }
    } catch (error) {
      console.error("Error in fade simulation:", error);
    }
  }, 1000 * 60 * 5); // Run every 5 minutes
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Artifacts
  app.get(api.artifacts.list.path, async (req, res) => {
    const artifacts = await storage.getArtifacts();
    res.json(artifacts);
  });

  app.get(api.artifacts.get.path, async (req, res) => {
    const artifact = await storage.getArtifact(Number(req.params.id));
    if (!artifact) {
      return res.status(404).json({ message: 'Artifact not found' });
    }
    res.json(artifact);
  });

  app.post(api.artifacts.create.path, async (req, res) => {
    try {
      const input = api.artifacts.create.input.parse(req.body);
      const artifact = await storage.createArtifact(input);
      
      // Generate narrative asynchronously
      generateAINarrative(input.title, input.type, input.description).then(async (narrative) => {
         await storage.updateArtifact(artifact.id, { aiNarrative: narrative } as any);
      });

      res.status(201).json(artifact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.artifacts.support.path, async (req, res) => {
    try {
      const { action } = api.artifacts.support.input.parse(req.body);
      const artifact = await storage.supportArtifact(Number(req.params.id), action);
      
      if (!artifact) {
        return res.status(404).json({ message: 'Artifact not found' });
      }
      
      res.json(artifact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Comments
  app.get(api.artifacts.comments.list.path, async (req, res) => {
    const artifact = await storage.getArtifact(Number(req.params.id));
    if (!artifact) {
      return res.status(404).json({ message: 'Artifact not found' });
    }
    
    const comments = await storage.getComments(artifact.id);
    res.json(comments);
  });

  app.post(api.artifacts.comments.create.path, async (req, res) => {
    try {
      const artifactId = Number(req.params.id);
      const artifact = await storage.getArtifact(artifactId);
      
      if (!artifact) {
        return res.status(404).json({ message: 'Artifact not found' });
      }

      const input = api.artifacts.comments.create.input.parse(req.body);
      const comment = await storage.createComment({
        ...input,
        artifactId
      });
      
      res.status(201).json(comment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.artifacts.comments.support.path, async (req, res) => {
    const comment = await storage.supportComment(Number(req.params.id));
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json(comment);
  });

  app.post("/api/comments/:id/react", async (req, res) => {
    try {
      const { emoji } = z.object({ emoji: z.string() }).parse(req.body);
      const comment = await (storage as any).reactToComment(Number(req.params.id), emoji);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      res.json(comment);
    } catch (err) {
      res.status(400).json({ message: "Invalid reaction" });
    }
  });

  // Dashboard Stats
  app.get(api.dashboard.stats.path, async (req, res) => {
    const artifactsList = await storage.getArtifacts();
    
    const totalArtifacts = artifactsList.length;
    let totalFade = 0;
    let artifactsAtRisk = 0;
    let totalInteractions = 0;

    for (const a of artifactsList) {
      totalFade += a.fadeLevel;
      if (a.fadeLevel > 80) artifactsAtRisk++;
      totalInteractions += a.supportCount;
      
      const comments = await storage.getComments(a.id);
      totalInteractions += comments.length;
    }

    const averageFadeLevel = totalArtifacts > 0 ? Math.round(totalFade / totalArtifacts) : 0;

    res.json({
      totalArtifacts,
      averageFadeLevel,
      totalInteractions,
      artifactsAtRisk
    });
  });

  // Start the fading simulation
  simulateFading();

  return httpServer;
}
