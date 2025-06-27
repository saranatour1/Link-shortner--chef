import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// Generate a random short code using crypto for better randomness
function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  return result;
}

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export const createShortLink = mutation({
  args: {
    originalUrl: v.string(),
    customCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if (!isValidUrl(args.originalUrl)) {
      throw new Error("Invalid URL format");
    }

    let shortCode: string;

    if (args.customCode) {
      const customCode = args.customCode;
      // Validate custom code
      if (customCode.length > 32) {
        throw new Error("Custom code cannot exceed 32 characters");
      }
      
      if (!/^[a-zA-Z0-9-]+$/.test(customCode)) {
        throw new Error("Custom code can only contain letters, numbers, and hyphens");
      }

      // Check if custom code is already taken
      const existing = await ctx.db
        .query("links")
        .withIndex("by_short_code", (q) => q.eq("shortCode", customCode))
        .first();
      
      if (existing) {
        throw new Error("This short code is already taken");
      }
      
      shortCode = customCode;
    } else {
      // Generate unique short code
      let attempts = 0;
      do {
        shortCode = generateShortCode();
        const existing = await ctx.db
          .query("links")
          .withIndex("by_short_code", (q) => q.eq("shortCode", shortCode))
          .first();
        
        if (!existing) break;
        attempts++;
        
        if (attempts > 10) {
          throw new Error("Unable to generate unique short code");
        }
      } while (true);
    }

    const linkId = await ctx.db.insert("links", {
      originalUrl: args.originalUrl,
      shortCode,
      userId: userId || undefined,
      clicks: 0,
      createdAt: Date.now(),
    });

    return { linkId, shortCode };
  },
});

export const updateLink = mutation({
  args: {
    linkId: v.id("links"),
    originalUrl: v.string(),
    customCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const link = await ctx.db.get(args.linkId);
    
    if (!link) {
      throw new ConvexError("Link not found");
    }
    
    if (link.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    if (!isValidUrl(args.originalUrl)) {
      throw new Error("Invalid URL format");
    }

    let shortCode = link.shortCode; // Keep existing code by default

    if (args.customCode && args.customCode !== link.shortCode) {
      const customCode = args.customCode;
      // Validate custom code
      if (customCode.length > 32) {
        throw new Error("Custom code cannot exceed 32 characters");
      }
      
      if (!/^[a-zA-Z0-9-]+$/.test(customCode)) {
        throw new Error("Custom code can only contain letters, numbers, and hyphens");
      }

      // Check if custom code is already taken
      const existing = await ctx.db
        .query("links")
        .withIndex("by_short_code", (q) => q.eq("shortCode", customCode))
        .first();
      
      if (existing) {
        throw new Error("This short code is already taken");
      }
      
      shortCode = customCode;
    }

    await ctx.db.patch(args.linkId, {
      originalUrl: args.originalUrl,
      shortCode,
    });

    return { linkId: args.linkId, shortCode };
  },
});

export const getLinkByShortCode = query({
  args: {
    shortCode: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("links")
      .withIndex("by_short_code", (q) => q.eq("shortCode", args.shortCode))
      .first();
  },
});

export const incrementClicks = mutation({
  args: {
    linkId: v.id("links"),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.linkId);
    if (!link) {
      throw new Error("Link not found");
    }

    await ctx.db.patch(args.linkId, {
      clicks: link.clicks + 1,
    });
  },
});

export const getUserLinks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const deleteLink = mutation({
  args: {
    linkId: v.id("links"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const link = await ctx.db.get(args.linkId);
    
    if (!link) {
      throw new ConvexError("Link not found");
    }
    
    if (link.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.delete(args.linkId);
  },
});
