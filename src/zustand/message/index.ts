import { create } from "zustand";
import { Id } from "../../convex/_generated/dataModel";

interface MessageState {
  highlightMessageId: Id<"messages"> | null;
  setHighlightMessageId: (messageId: Id<"messages"> | null) => void;
  clearHighlightMessageId: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  highlightMessageId: null,
  setHighlightMessageId: (messageId) => set({ highlightMessageId: messageId }),
  clearHighlightMessageId: () => set({ highlightMessageId: null }),
}));
