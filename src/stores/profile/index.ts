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
  forceShowProfileSelector: boolean;
  addProfile: (userId: string, profile: UserProfile) => void;
  removeProfile: (userId: string, profileId: string) => void;
  updateProfile: (
    userId: string,
    profileId: string,
    profile: Partial<UserProfile>,
  ) => void;
  setActiveProfile: (profileId: string | null) => void;
  setHasSelectedProfileThisSession: (hasSelected: boolean) => void;
  setForceShowProfileSelector: (force: boolean) => void;
}

const getStoredSessionFlag = () => {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("__MW::profile_selected") === "true";
};

const setStoredSessionFlag = (val: boolean) => {
  if (typeof window === "undefined") return;
  if (val) sessionStorage.setItem("__MW::profile_selected", "true");
  else sessionStorage.removeItem("__MW::profile_selected");
};

export const useProfileStore = create(
  persist(
    immer<ProfileStore>((set) => ({
      profiles: {},
      activeProfileId: null,
      hasSelectedProfileThisSession: getStoredSessionFlag(),
      forceShowProfileSelector: false,
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
          setStoredSessionFlag(true);
          s.forceShowProfileSelector = false;

          if (typeof window !== "undefined") {
            (window as any).__PSTREAM_PROFILE_ID__ = profileId;
          }
        });
      },
      setHasSelectedProfileThisSession: (hasSelected) => {
        set((s) => {
          s.hasSelectedProfileThisSession = hasSelected;
          setStoredSessionFlag(hasSelected);
        });
      },
      setForceShowProfileSelector: (force) => {
        set((s) => {
          s.forceShowProfileSelector = force;
          // When manually opening the selector, also reset the session flag
          if (force) {
            s.hasSelectedProfileThisSession = false;
            setStoredSessionFlag(false);
          }
        });
      },
    })),
    {
      name: "__MW::profiles",
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
      }),
    },
  ),
);
