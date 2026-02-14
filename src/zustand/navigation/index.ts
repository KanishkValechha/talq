import { create } from "zustand";
import { Id } from "../../convex/_generated/dataModel";

interface NavigationState {
  selectedChannel: Id<"channels"> | null;
  selectedDM: Id<"users"> | null;
  setSelectedChannel: (channelId: Id<"channels"> | null) => void;
  setSelectedDM: (userId: Id<"users"> | null) => void;
  selectChannel: (channelId: Id<"channels"> | null) => void;
  selectDM: (userId: Id<"users"> | null) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  selectedChannel: null,
  selectedDM: null,
  setSelectedChannel: (channelId) => set({ selectedChannel: channelId }),
  setSelectedDM: (userId) => set({ selectedDM: userId }),
  selectChannel: (channelId) =>
    set({ selectedChannel: channelId, selectedDM: null }),
  selectDM: (userId) => set({ selectedDM: userId, selectedChannel: null }),
}));
