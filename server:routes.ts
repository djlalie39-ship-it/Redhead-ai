import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertSavedStyleSchema, 
  insertImageHistorySchema, 
  insertReferenceUploadSchema 
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client with validation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Validate required environment variables
const validateEnvironment = () => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("Warning: OPENAI_API_KEY not found. Image generation will not work.");
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  validateEnvironment();
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate and sanitize user input
      const userData = insertUserSchema.extend({
        username: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
        email: z.string().email().max(255),
      }).parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username, email: user.email, credits: user.credits } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, username } = req.body;
      
      let user;
      if (email) {
        user = await storage.getUserByEmail(email);
      } else if (username) {
        user = await storage.getUserByUsername(username);
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({ user: { id: user.id, username: user.username, email: user.email, credits: user.credits } });
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { id: user.id, username: user.username, email: user.email, credits: user.credits } });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id/credits", async (req, res) => {
    try {
      const { credits } = req.body;
      await storage.updateUserCredits(req.params.id, credits);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update credits" });
    }
  });

  // Image generation route
  app.post("/api/generate", async (req, res) => {
    try {
      const generateSchema = z.object({
        prompt: z.string().min(1).max(4000), // Generous limit but prevent abuse
        style: z.string().max(100),
        refinement: z.string().max(1000).optional(),
        dimension: z.enum(["1:1", "4:5", "9:11", "16:9"]),
        userId: z.string().max(100),
        styleId: z.string().max(100).optional(),
        applyMyStyle: z.boolean().optional(),
      });

      const data = generateSchema.parse(req.body);
      
      // Basic input sanitization - remove potentially harmful content while preserving creativity
      const sanitizeText = (text: string) => text.replace(/[<>]/g, '').trim();
      data.prompt = sanitizeText(data.prompt);
      if (data.refinement) data.refinement = sanitizeText(data.refinement);

      // Get user and check credits
      const user = await storage.getUser(data.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.credits < 4) {
        return res.status(400).json({ message: "Insufficient credits" });
      }

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      let enhancedPrompt = data.prompt;
      
      // Apply user style if requested and user has preferences
      if (data.applyMyStyle && user.preferences && typeof user.preferences === 'object') {
        const prefs = user.preferences as any;
        if (prefs.styleDescription) {
          enhancedPrompt += `, ${prefs.styleDescription}`;
        }
      }

      // Add style refinement
      if (data.refinement) {
        enhancedPrompt += `, ${data.refinement}`;
      }

      // Add base style to prompt
      const styleDescriptions: Record<string, string> = {
        dreamcore: "dreamlike, surreal, ethereal atmosphere",
        realism: "photorealistic, highly detailed, professional photography",
        anime: "anime style, vibrant colors, detailed illustration",
        editorial: "editorial photography, high fashion, professional lighting"
      };
      
      const styleDesc = styleDescriptions[data.style] || data.style;
      enhancedPrompt += `, ${styleDesc}`;

      // Map dimensions to DALL-E size format
      const sizeMap: Record<string, "1024x1024" | "1024x1792" | "1792x1024"> = {
        "1:1": "1024x1024",
        "4:5": "1024x1792", // Closest to 4:5 ratio
        "9:11": "1024x1792", // Closest available
        "16:9": "1792x1024"
      };

      try {
        console.log(`Generating image with prompt: "${enhancedPrompt}"`);
        
        // Generate image with DALL-E 3
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1, // DALL-E 3 only supports n=1
          size: sizeMap[data.dimension] || "1024x1024",
          quality: "standard",
        });

        const imageUrls = response.data?.map(img => img.url).filter(Boolean) as string[] || [];
        
        if (imageUrls.length === 0) {
          return res.status(500).json({ message: "No images generated" });
        }

        console.log(`Successfully generated ${imageUrls.length} image(s)`);
        
        // For now, we'll generate one image but return it multiple times to match the UI expectation
        // In the future, you could make multiple API calls for more variations
        const finalImageUrls = [imageUrls[0], imageUrls[0], imageUrls[0], imageUrls[0]];

        // Save to history
        const historyData = {
          userId: data.userId,
          prompt: data.prompt,
          style: data.style,
          refinement: data.refinement,
          dimension: data.dimension,
          imageUrls: finalImageUrls,
          styleId: data.styleId,
        };

        const history = await storage.createImageHistory(historyData);

        // Deduct credits
        await storage.updateUserCredits(data.userId, user.credits - 4);

        // Increment style usage if styleId provided
        if (data.styleId) {
          await storage.incrementStyleUsage(data.styleId);
        }

        res.json({ 
          images: finalImageUrls, 
          historyId: history.id,
          creditsRemaining: user.credits - 4
        });

      } catch (error) {
        console.error("OpenAI API error:", error);
        return res.status(500).json({ 
          message: "Image generation failed", 
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ message: "Image generation failed" });
    }
  });

  // Saved styles routes
  app.get("/api/styles/:userId", async (req, res) => {
    try {
      const styles = await storage.getSavedStyles(req.params.userId);
      res.json({ styles });
    } catch (error) {
      res.status(500).json({ message: "Failed to get styles" });
    }
  });

  app.post("/api/styles", async (req, res) => {
    try {
      const styleData = insertSavedStyleSchema.parse(req.body);
      const style = await storage.createSavedStyle(styleData);
      res.json({ style });
    } catch (error) {
      res.status(400).json({ message: "Invalid style data" });
    }
  });

  app.delete("/api/styles/:id", async (req, res) => {
    try {
      await storage.deleteSavedStyle(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete style" });
    }
  });

  // Image history routes
  app.get("/api/history/:userId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const history = await storage.getImageHistory(req.params.userId, limit);
      res.json({ history });
    } catch (error) {
      res.status(500).json({ message: "Failed to get history" });
    }
  });

  app.get("/api/history/item/:id", async (req, res) => {
    try {
      const item = await storage.getImageHistoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "History item not found" });
      }
      res.json({ item });
    } catch (error) {
      res.status(500).json({ message: "Failed to get history item" });
    }
  });

  // Reference upload routes
  app.get("/api/references/:userId", async (req, res) => {
    try {
      const references = await storage.getReferenceUploads(req.params.userId);
      res.json({ references });
    } catch (error) {
      res.status(500).json({ message: "Failed to get references" });
    }
  });

  app.post("/api/references", async (req, res) => {
    try {
      const referenceData = insertReferenceUploadSchema.parse(req.body);
      const reference = await storage.createReferenceUpload(referenceData);
      res.json({ reference });
    } catch (error) {
      res.status(400).json({ message: "Invalid reference data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
