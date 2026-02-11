import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("Channel already exists");
    }

    return await ctx.db.insert("channels", {
      name: args.name,
      createdBy: userId,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const channels = await ctx.db.query("channels").collect();
    
    const channelsWithUnread = await Promise.all(
      channels.map(async (channel) => {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_channel", (q) => q.eq("channelId", channel._id))
          .collect();

        let unreadCount = 0;
        for (const message of messages) {
          const receipt = await ctx.db
            .query("readReceipts")
            .withIndex("by_user_and_message", (q) =>
              q.eq("userId", userId).eq("messageId", message._id)
            )
            .first();
          if (!receipt && message.authorId !== userId) {
            unreadCount++;
          }
        }

        return {
          ...channel,
          unreadCount,
        };
      })
    );

    return channelsWithUnread;
  },
});
