import { 
  type User, 
  type InsertUser,
  type SavedStyle,
  type InsertSavedStyle,
  type ImageHistory,
  type InsertImageHistory,
  type ReferenceUpload,
  type InsertReferenceUpload
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<void>;
  updateUserPreferences(userId: string, preferences: any): Promise<void>;

  // Saved Styles
  getSavedStyles(userId: string): Promise<SavedStyle[]>;
  getSavedStyle(id: string): Promise<SavedStyle | undefined>;
  createSavedStyle(style: InsertSavedStyle): Promise<SavedStyle>;
  updateSavedStyle(id: string, updates: Partial<SavedStyle>): Promise<SavedStyle | undefined>;
  deleteSavedStyle(id: string): Promise<void>;
  incrementStyleUsage(id: string): Promise<void>;

  // Image History
  getImageHistory(userId: string, limit?: number): Promise<ImageHistory[]>;
  createImageHistory(history: InsertImageHistory): Promise<ImageHistory>;
  getImageHistoryItem(id: string): Promise<ImageHistory | undefined>;

  // Reference Uploads
  getReferenceUploads(userId: string): Promise<ReferenceUpload[]>;
  createReferenceUpload(upload: InsertReferenceUpload): Promise<ReferenceUpload>;
  deleteReferenceUpload(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private savedStyles: Map<string, SavedStyle>;
  private imageHistory: Map<string, ImageHistory>;
  private referenceUploads: Map<string, ReferenceUpload>;

  constructor() {
    this.users = new Map();
    this.savedStyles = new Map();
    this.imageHistory = new Map();
    this.referenceUploads = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      credits: 120, 
      preferences: null 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserCredits(userId: string, credits: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.credits = credits;
      this.users.set(userId, user);
    }
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.preferences = preferences;
      this.users.set(userId, user);
    }
  }

  // Saved Styles
  async getSavedStyles(userId: string): Promise<SavedStyle[]> {
    return Array.from(this.savedStyles.values()).filter(style => style.userId === userId);
  }

  async getSavedStyle(id: string): Promise<SavedStyle | undefined> {
    return this.savedStyles.get(id);
  }

  async createSavedStyle(insertStyle: InsertSavedStyle): Promise<SavedStyle> {
    const id = randomUUID();
    const style: SavedStyle = {
      ...insertStyle,
      id,
      usageCount: 0,
      createdAt: new Date(),
    };
    this.savedStyles.set(id, style);
    return style;
  }

  async updateSavedStyle(id: string, updates: Partial<SavedStyle>): Promise<SavedStyle | undefined> {
    const style = this.savedStyles.get(id);
    if (style) {
      const updated = { ...style, ...updates };
      this.savedStyles.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteSavedStyle(id: string): Promise<void> {
    this.savedStyles.delete(id);
  }

  async incrementStyleUsage(id: string): Promise<void> {
    const style = this.savedStyles.get(id);
    if (style) {
      style.usageCount += 1;
      this.savedStyles.set(id, style);
    }
  }

  // Image History
  async getImageHistory(userId: string, limit = 50): Promise<ImageHistory[]> {
    return Array.from(this.imageHistory.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
      .slice(0, limit);
  }

  async createImageHistory(insertHistory: InsertImageHistory): Promise<ImageHistory> {
    const id = randomUUID();
    const history: ImageHistory = {
      ...insertHistory,
      id,
      generatedAt: new Date(),
    };
    this.imageHistory.set(id, history);
    return history;
  }

  async getImageHistoryItem(id: string): Promise<ImageHistory | undefined> {
    return this.imageHistory.get(id);
  }

  // Reference Uploads
  async getReferenceUploads(userId: string): Promise<ReferenceUpload[]> {
    return Array.from(this.referenceUploads.values()).filter(upload => upload.userId === userId);
  }

  async createReferenceUpload(insertUpload: InsertReferenceUpload): Promise<ReferenceUpload> {
    const id = randomUUID();
    const upload: ReferenceUpload = {
      ...insertUpload,
      id,
      uploadedAt: new Date(),
    };
    this.referenceUploads.set(id, upload);
    return upload;
  }

  async deleteReferenceUpload(id: string): Promise<void> {
    this.referenceUploads.delete(id);
  }
}

export const storage = new MemStorage();
