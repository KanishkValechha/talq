import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const profiles = await ctx.db.query("userProfiles").collect();
    const onlineThreshold = Date.now() - 5 * 60 * 1000;

    const usersWithDetails = await Promise.all(
      profiles
        .filter((profile) => profile.userId !== userId)
        .map(async (profile) => {
          const user = await ctx.db.get(profile.userId);
          const avatarUrl = profile.avatarId
            ? await ctx.storage.getUrl(profile.avatarId)
            : null;

          const dmMessages = await ctx.db.query("messages").collect();
          const userDMs = dmMessages.filter((msg) => {
            if (!msg.dmParticipants || msg.dmParticipants.length !== 2) {
              return false;
            }
            return (
              msg.dmParticipants.includes(userId) &&
              msg.dmParticipants.includes(profile.userId)
            );
          });

          let unreadCount = 0;
          for (const message of userDMs) {
            if (message.authorId === profile.userId) {
              const receipt = await ctx.db
                .query("readReceipts")
                .withIndex("by_user_and_message", (q) =>
                  q.eq("userId", userId).eq("messageId", message._id)
                )
                .first();
              if (!receipt) {
                unreadCount++;
              }
            }
          }

          return {
            userId: profile.userId,
            displayName: profile.displayName,
            email: user?.email,
            avatarUrl,
            isOnline: profile.lastSeen > onlineThreshold,
            unreadCount,
          };
        })
    );

    return usersWithDetails;
  },
});

export const updatePresence = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        lastSeen: Date.now(),
      });
    } else {
      const user = await ctx.db.get(userId);
      await ctx.db.insert("userProfiles", {
        userId,
        displayName: user?.email?.split("@")[0] || "User",
        lastSeen: Date.now(),
      });
    }
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      return null;
    }

    const avatarUrl = profile.avatarId
      ? await ctx.storage.getUrl(profile.avatarId)
      : null;

    return {
      ...profile,
      avatarUrl,
    };
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.string(),
    avatarId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        displayName: args.displayName,
        avatarId: args.avatarId,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        displayName: args.displayName,
        avatarId: args.avatarId,
        lastSeen: Date.now(),
      });
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});
