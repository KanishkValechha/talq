import { create } from "zustand";

interface ProfileState {
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  openProfile: () => void;
  closeProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  showProfile: false,
  setShowProfile: (show) => set({ showProfile: show }),
  openProfile: () => set({ showProfile: true }),
  closeProfile: () => set({ showProfile: false }),
}));
