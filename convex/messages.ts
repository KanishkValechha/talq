import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const send = mutation({
  args: {
    channelId: v.optional(v.id("channels")),
    dmParticipants: v.optional(v.array(v.id("users"))),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const messageId = await ctx.db.insert("messages", {
      channelId: args.channelId,
      dmParticipants: args.dmParticipants,
      authorId: userId,
      content: args.content,
    });

    return messageId;
  },
});

export const listByChannel = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    const messagesWithDetails = await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", message.authorId))
          .first();

        const avatarUrl = profile?.avatarId
          ? await ctx.storage.getUrl(profile.avatarId)
          : null;

        const receipts = await ctx.db
          .query("readReceipts")
          .withIndex("by_message", (q) => q.eq("messageId", message._id))
          .collect();

        const userReceipt = receipts.find((r) => r.userId === userId);

        return {
          ...message,
          authorName: profile?.displayName || author?.email || "Unknown",
          avatarUrl,
          isRead: !!userReceipt,
          readCount: receipts.length,
        };
      })
    );

    return messagesWithDetails;
  },
});

export const listByDM = query({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const allMessages = await ctx.db.query("messages").collect();
    
    const dmMessages = allMessages.filter((msg) => {
      if (!msg.dmParticipants || msg.dmParticipants.length !== 2) {
        return false;
      }
      return (
        msg.dmParticipants.includes(userId) &&
        msg.dmParticipants.includes(args.otherUserId)
      );
    });

    const messagesWithDetails = await Promise.all(
      dmMessages.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", message.authorId))
          .first();

        const avatarUrl = profile?.avatarId
          ? await ctx.storage.getUrl(profile.avatarId)
          : null;

        const receipts = await ctx.db
          .query("readReceipts")
          .withIndex("by_message", (q) => q.eq("messageId", message._id))
          .collect();

        const userReceipt = receipts.find((r) => r.userId === userId);

        return {
          ...message,
          authorName: profile?.displayName || author?.email || "Unknown",
          avatarUrl,
          isRead: !!userReceipt,
          readCount: receipts.length,
        };
      })
    );

    return messagesWithDetails.sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const markAsRead = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_user_and_message", (q) =>
        q.eq("userId", userId).eq("messageId", args.messageId)
      )
      .first();

    if (!existing) {
      await ctx.db.insert("readReceipts", {
        messageId: args.messageId,
        userId,
        readAt: Date.now(),
      });
    }
  },
});

export const search = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    if (!args.searchTerm.trim()) {
      return [];
    }

    const results = await ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q) => q.search("content", args.searchTerm))
      .take(20);

    const messagesWithDetails = await Promise.all(
      results.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", message.authorId))
          .first();

        const avatarUrl = profile?.avatarId
          ? await ctx.storage.getUrl(profile.avatarId)
          : null;

        let channelName = null;
        if (message.channelId) {
          const channel = await ctx.db.get(message.channelId);
          channelName = channel?.name || null;
        }

        return {
          ...message,
          authorName: profile?.displayName || author?.email || "Unknown",
          avatarUrl,
          channelName,
        };
      })
    );

    return messagesWithDetails;
  },
});
