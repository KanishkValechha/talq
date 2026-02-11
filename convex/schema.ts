import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  channels: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
  }).index("by_name", ["name"]),

  messages: defineTable({
    channelId: v.optional(v.id("channels")),
    dmParticipants: v.optional(v.array(v.id("users"))),
    authorId: v.id("users"),
    content: v.string(),
  })
    .index("by_channel", ["channelId"])
    .index("by_dm", ["dmParticipants"])
    .searchIndex("search_content", {
      searchField: "content",
    }),

  readReceipts: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    readAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_user_and_message", ["userId", "messageId"]),

  typingIndicators: defineTable({
    channelId: v.optional(v.id("channels")),
    dmParticipants: v.optional(v.array(v.id("users"))),
    userId: v.id("users"),
    lastTyping: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_dm", ["dmParticipants"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    avatarId: v.optional(v.id("_storage")),
    lastSeen: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
