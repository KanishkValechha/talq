import { Id } from "../../convex/_generated/dataModel";

export interface SearchResult {
  _id: Id<"messages">;
  _creationTime: number;
  content: string;
  authorName: string;
  avatarUrl: string | null;
  channelName: string | null;
  channelId?: Id<"channels">;
  dmOtherUserId?: Id<"users"> | null;
}

export interface TypingIndicatorProps {
  users?: string[];
}

export interface MessageBubbleProps {
  message: {
    _id: string;
    _creationTime: number;
    authorId: string;
    authorName: string;
    avatarUrl: string | null;
    content: string;
    readCount: number;
    isRead?: boolean;
  };
  isOwn: boolean;
  showAvatar: boolean;
}
