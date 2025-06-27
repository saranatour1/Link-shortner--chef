import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  links: defineTable({
    originalUrl: v.string(),
    shortCode: v.string(),
    userId: v.optional(v.id("users")),
    clicks: v.number(),
    createdAt: v.number(),
  })
    .index("by_short_code", ["shortCode"])
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"])
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
