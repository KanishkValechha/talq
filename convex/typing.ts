import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const setTyping = mutation({
  args: {
    channelId: v.optional(v.id("channels")),
    dmParticipants: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("typingIndicators")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        channelId: args.channelId,
        dmParticipants: args.dmParticipants,
        lastTyping: Date.now(),
      });
    } else {
      await ctx.db.insert("typingIndicators", {
        channelId: args.channelId,
        dmParticipants: args.dmParticipants,
        userId,
        lastTyping: Date.now(),
      });
    }
  },
});

export const getTypingUsers = query({
  args: {
    channelId: v.optional(v.id("channels")),
    dmParticipants: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const cutoff = Date.now() - 3000;
    let indicators;

    if (args.channelId) {
      indicators = await ctx.db
        .query("typingIndicators")
        .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
        .filter((q) => q.gt(q.field("lastTyping"), cutoff))
        .collect();
    } else if (args.dmParticipants) {
      const allIndicators = await ctx.db.query("typingIndicators").collect();
      indicators = allIndicators.filter((ind) => {
        if (!ind.dmParticipants || ind.dmParticipants.length !== 2) {
          return false;
        }
        return (
          ind.dmParticipants.includes(args.dmParticipants![0]) &&
          ind.dmParticipants.includes(args.dmParticipants![1]) &&
          ind.lastTyping > cutoff
        );
      });
    } else {
      return [];
    }

    const typingUsers = await Promise.all(
      indicators
        .filter((ind) => ind.userId !== userId)
        .map(async (ind) => {
          const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", ind.userId))
            .first();
          const user = await ctx.db.get(ind.userId);
          return profile?.displayName || user?.email || "Someone";
        })
    );

    return typingUsers;
  },
});
