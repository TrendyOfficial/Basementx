import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface UserProfile {
  id: string;
  name: string;
  icon: string;
  colorA: string;
  colorB: string;
}

interface ProfileStore {
  profiles: Record<string, UserProfile[]>; // Keyed by account.userId
  activeProfileId: string | null;
  hasSelectedProfileThisSession: boolean;
  addProfile: (userId: string, profile: UserProfile) => void;
  removeProfile: (userId: string, profileId: string) => void;
  updateProfile: (
    userId: string,
    profileId: string,
    profile: Partial<UserProfile>,
  ) => void;
  setActiveProfile: (profileId: string | null) => void;
  setHasSelectedProfileThisSession: (hasSelected: boolean) => void;
}

export const useProfileStore = create(
  persist(
    immer<ProfileStore>((set) => ({
      profiles: {},
      activeProfileId: null,
      hasSelectedProfileThisSession: false,
      addProfile: (userId, profile) => {
        set((s) => {
          if (!s.profiles[userId]) s.profiles[userId] = [];
          s.profiles[userId].push(profile);
        });
      },
      removeProfile: (userId, profileId) => {
        set((s) => {
          if (!s.profiles[userId]) return;
          s.profiles[userId] = s.profiles[userId].filter(
            (p) => p.id !== profileId,
          );
        });
      },
      updateProfile: (userId, profileId, profile) => {
        set((s) => {
          if (!s.profiles[userId]) return;
          const index = s.profiles[userId].findIndex((p) => p.id === profileId);
          if (index !== -1) {
            s.profiles[userId][index] = {
              ...s.profiles[userId][index],
              ...profile,
            };
          }
        });
      },
      setActiveProfile: (profileId) => {
        set((s) => {
          s.activeProfileId = profileId;
          s.hasSelectedProfileThisSession = true;
        });
      },
      setHasSelectedProfileThisSession: (hasSelected) => {
        set((s) => {
          s.hasSelectedProfileThisSession = hasSelected;
        });
      },
    })),
    {
      name: "__MW::profiles",
    },
  ),
);
