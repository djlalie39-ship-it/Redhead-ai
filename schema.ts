import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  credits: integer("credits").notNull().default(120),
  preferences: jsonb("preferences"), // Store AI learning data
});

export const savedStyles = pgTable("saved_styles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  baseStyle: text("base_style").notNull(), // Realism, Dreamcore, etc.
  refinement: text("refinement"), // Custom style description
  referenceImageUrl: text("reference_image_url"),
  tags: text("tags").array(),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const imageHistory = pgTable("image_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  prompt: text("prompt").notNull(),
  style: text("style").notNull(),
  refinement: text("refinement"),
  dimension: text("dimension").notNull(), // "1:1", "4:5", "16:9"
  imageUrls: text("image_urls").array().notNull(),
  styleId: varchar("style_id").references(() => savedStyles.id),
  generatedAt: timestamp("generated_at").notNull().default(sql`now()`),
});

export const referenceUploads = pgTable("reference_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  credits: true,
  preferences: true,
});

export const insertSavedStyleSchema = createInsertSchema(savedStyles).omit({
  id: true,
  usageCount: true,
  createdAt: true,
});

export const insertImageHistorySchema = createInsertSchema(imageHistory).omit({
  id: true,
  generatedAt: true,
});

export const insertReferenceUploadSchema = createInsertSchema(referenceUploads).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SavedStyle = typeof savedStyles.$inferSelect;
export type InsertSavedStyle = z.infer<typeof insertSavedStyleSchema>;

export type ImageHistory = typeof imageHistory.$inferSelect;
export type InsertImageHistory = z.infer<typeof insertImageHistorySchema>;

export type ReferenceUpload = typeof referenceUploads.$inferSelect;
export type InsertReferenceUpload = z.infer<typeof insertReferenceUploadSchema>;
