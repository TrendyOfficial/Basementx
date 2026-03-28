import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import {
  DEFAULT_KEYBOARD_SHORTCUTS,
  KeyboardShortcuts,
} from "@/utils/keyboardShortcuts";

export interface PreferencesStore {
  enableThumbnails: boolean;
  enableAutoplay: boolean;
  enableSkipCredits: boolean;
  enableAutoSkipSegments: boolean;
  enableDiscover: boolean;
  enableFeatured: boolean;
  enableDetailsModal: boolean;
  enableImageLogos: boolean;
  enableCarouselView: boolean;
  enableMinimalCards: boolean;
  forceCompactEpisodeView: boolean;
  sourceOrder: string[];
  enableSourceOrder: boolean;
  lastSuccessfulSource: string | null;
  enableLastSuccessfulSource: boolean;
  embedOrder: string[];
  enableEmbedOrder: boolean;
  proxyTmdb: boolean;
  febboxKey: string | null;
  febboxUseMp4: boolean;
  debridToken: string | null;
  debridService: string;
  tidbKey: string | null;
  enableLowPerformanceMode: boolean;
  enableNativeSubtitles: boolean;
  enableHoldToBoost: boolean;
  homeSectionOrder: string[];
  manualSourceSelection: boolean;
  enableDoubleClickToSeek: boolean;
  enableAutoResumeOnPlaybackError: boolean;
  enableNumberKeySeeking: boolean;
  enableAutoSkipSegmentsAtStart: boolean;
  enablePauseOverlay: boolean;
  pauseOverlayInactivityTime: number;
  enablePauseOverlayHoverHide: boolean;
  timeFormat12Hour: boolean | null;
  enableGamepadControls: boolean;
  gamepadSetupComplete: boolean;
  gamepadInputMode: "controller" | "kbm" | "both";
  gamepadMapping: Record<string, string>;
  keyboardShortcuts: KeyboardShortcuts;
  ignoreHeader: boolean;
  isGamepadActive: boolean;

  // Profile management
  profiles: Record<string, any>;
  switchProfile(profileId: string | null): void;

  setEnableThumbnails(v: boolean): void;
  setEnableAutoplay(v: boolean): void;
  setEnableSkipCredits(v: boolean): void;
  setEnableAutoSkipSegments(v: boolean): void;
  setEnableDiscover(v: boolean): void;
  setEnableFeatured(v: boolean): void;
  setEnableDetailsModal(v: boolean): void;
  setEnableImageLogos(v: boolean): void;
  setEnableCarouselView(v: boolean): void;
  setEnableMinimalCards(v: boolean): void;
  setForceCompactEpisodeView(v: boolean): void;
  setSourceOrder(v: string[]): void;
  setEnableSourceOrder(v: boolean): void;
  setLastSuccessfulSource(v: string | null): void;
  setEnableLastSuccessfulSource(v: boolean): void;
  setEmbedOrder(v: string[]): void;
  setEnableEmbedOrder(v: boolean): void;
  setProxyTmdb(v: boolean): void;
  setFebboxKey(v: string | null): void;
  setFebboxUseMp4(v: boolean): void;
  setdebridToken(v: string | null): void;
  setdebridService(v: string): void;
  setTIDBKey(v: string | null): void;
  setEnableLowPerformanceMode(v: boolean): void;
  setEnableNativeSubtitles(v: boolean): void;
  setEnableHoldToBoost(v: boolean): void;
  setHomeSectionOrder(v: string[]): void;
  setManualSourceSelection(v: boolean): void;
  setEnableDoubleClickToSeek(v: boolean): void;
  setEnableAutoResumeOnPlaybackError(v: boolean): void;
  setEnableNumberKeySeeking(v: boolean): void;
  setEnablePauseOverlay(v: boolean): void;
  setPauseOverlayInactivityTime(v: number): void;
  setEnablePauseOverlayHoverHide(v: boolean): void;
  setTimeFormat12Hour(v: boolean | null): void;
  setEnableGamepadControls(v: boolean): void;
  setGamepadSetupComplete(v: boolean): void;
  setEnableAutoSkipSegmentsAtStart(v: boolean): void;
  setGamepadInputMode(v: "controller" | "kbm" | "both"): void;
  setGamepadMapping(v: Record<string, string>): void;
  setKeyboardShortcuts(v: KeyboardShortcuts): void;
  setIgnoreHeader(v: boolean): void;
  setGamepadActive(v: boolean): void;
}

const DEFAULT_PREFERENCES = {
  enableThumbnails: false,
  enableAutoplay: true,
  enableSkipCredits: true,
  enableAutoSkipSegments: false,
  enableDiscover: true,
  enableFeatured: false,
  enableDetailsModal: false,
  enableImageLogos: true,
  enableCarouselView: false,
  enableMinimalCards: false,
  forceCompactEpisodeView: false,
  sourceOrder: [],
  enableSourceOrder: false,
  lastSuccessfulSource: null,
  enableLastSuccessfulSource: false,
  embedOrder: [],
  enableEmbedOrder: false,
  proxyTmdb: false,
  febboxKey: null,
  febboxUseMp4: false,
  debridToken: null,
  debridService: "realdebrid",
  tidbKey: null,
  enableLowPerformanceMode: false,
  enableNativeSubtitles: false,
  enableHoldToBoost: true,
  homeSectionOrder: ["watching", "bookmarks"],
  manualSourceSelection: false,
  enableDoubleClickToSeek: false,
  enableAutoResumeOnPlaybackError: true,
  enableNumberKeySeeking: true,
  enableAutoSkipSegmentsAtStart: false,
  enablePauseOverlay: false,
  pauseOverlayInactivityTime: 2,
  enablePauseOverlayHoverHide: false,
  timeFormat12Hour: null,
  enableGamepadControls: false,
  gamepadSetupComplete: false,
  gamepadInputMode: "both" as const,
  gamepadMapping: {},
  keyboardShortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
  ignoreHeader: false,
  isGamepadActive: false,
};

function syncStoreWithProfile(s: any) {
  const profileId = (window as any).__PSTREAM_PROFILE_ID__ || "main";
  if (!s.profiles[profileId]) s.profiles[profileId] = {};

  // Update all root properties into the profile storage
  Object.keys(DEFAULT_PREFERENCES).forEach((key) => {
    s.profiles[profileId][key] = (s as any)[key];
  });
}

export const usePreferencesStore = create(
  persist(
    immer<PreferencesStore>((set, get) => ({
      ...DEFAULT_PREFERENCES,
      profiles: {},

      switchProfile(profileId) {
        if (!profileId) {
          set((s) => {
            Object.assign(s, DEFAULT_PREFERENCES);
          });
          return;
        }
        set((s) => {
          const profilePrefs = s.profiles[profileId] || DEFAULT_PREFERENCES;
          Object.assign(s, profilePrefs);
        });
      },

      setEnableThumbnails(v) {
        set((s) => {
          s.enableThumbnails = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableAutoplay(v) {
        set((s) => {
          s.enableAutoplay = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableSkipCredits(v) {
        set((s) => {
          s.enableSkipCredits = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableAutoSkipSegments(v) {
        set((s) => {
          s.enableAutoSkipSegments = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableAutoSkipSegmentsAtStart(v) {
        set((s) => {
          s.enableAutoSkipSegmentsAtStart = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableDiscover(v) {
        set((s) => {
          s.enableDiscover = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableFeatured(v) {
        set((s) => {
          s.enableFeatured = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableDetailsModal(v) {
        set((s) => {
          s.enableDetailsModal = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableImageLogos(v) {
        set((s) => {
          s.enableImageLogos = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableCarouselView(v) {
        set((s) => {
          s.enableCarouselView = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableMinimalCards(v) {
        set((s) => {
          s.enableMinimalCards = v;
          syncStoreWithProfile(s);
        });
      },
      setForceCompactEpisodeView(v) {
        set((s) => {
          s.forceCompactEpisodeView = v;
          syncStoreWithProfile(s);
        });
      },
      setSourceOrder(v) {
        set((s) => {
          s.sourceOrder = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableSourceOrder(v) {
        set((s) => {
          s.enableSourceOrder = v;
          syncStoreWithProfile(s);
        });
      },
      setLastSuccessfulSource(v) {
        set((s) => {
          s.lastSuccessfulSource = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableLastSuccessfulSource(v) {
        set((s) => {
          s.enableLastSuccessfulSource = v;
          syncStoreWithProfile(s);
        });
      },
      setEmbedOrder(v) {
        set((s) => {
          s.embedOrder = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableEmbedOrder(v) {
        set((s) => {
          s.enableEmbedOrder = v;
          syncStoreWithProfile(s);
        });
      },
      setProxyTmdb(v) {
        set((s) => {
          s.proxyTmdb = v;
          syncStoreWithProfile(s);
        });
      },
      setFebboxKey(v) {
        set((s) => {
          s.febboxKey = v;
          syncStoreWithProfile(s);
        });
      },
      setFebboxUseMp4(v) {
        set((s) => {
          s.febboxUseMp4 = v;
          syncStoreWithProfile(s);
        });
      },
      setdebridToken(v) {
        set((s) => {
          s.debridToken = v;
          syncStoreWithProfile(s);
        });
      },
      setdebridService(v) {
        set((s) => {
          s.debridService = v;
          syncStoreWithProfile(s);
        });
      },
      setTIDBKey(v) {
        set((s) => {
          s.tidbKey = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableLowPerformanceMode(v) {
        set((s) => {
          s.enableLowPerformanceMode = v;
          if (v) {
            s.enableThumbnails = false;
            s.enableAutoplay = false;
          }
          syncStoreWithProfile(s);
        });
      },
      setEnableNativeSubtitles(v) {
        set((s) => {
          s.enableNativeSubtitles = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableHoldToBoost(v) {
        set((s) => {
          s.enableHoldToBoost = v;
          syncStoreWithProfile(s);
        });
      },
      setHomeSectionOrder(v) {
        set((s) => {
          s.homeSectionOrder = v.length > 0 ? v : ["watching", "bookmarks"];
          syncStoreWithProfile(s);
        });
      },
      setManualSourceSelection(v) {
        set((s) => {
          s.manualSourceSelection = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableDoubleClickToSeek(v) {
        set((s) => {
          s.enableDoubleClickToSeek = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableAutoResumeOnPlaybackError(v) {
        set((s) => {
          s.enableAutoResumeOnPlaybackError = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableNumberKeySeeking(v) {
        set((s) => {
          s.enableNumberKeySeeking = v;
          syncStoreWithProfile(s);
        });
      },
      setEnablePauseOverlay(v) {
        set((s) => {
          s.enablePauseOverlay = v;
          syncStoreWithProfile(s);
        });
      },
      setPauseOverlayInactivityTime(v) {
        set((s) => {
          s.pauseOverlayInactivityTime = v;
          syncStoreWithProfile(s);
        });
      },
      setEnablePauseOverlayHoverHide(v) {
        set((s) => {
          s.enablePauseOverlayHoverHide = v;
          syncStoreWithProfile(s);
        });
      },
      setTimeFormat12Hour(v) {
        set((s) => {
          s.timeFormat12Hour = v;
          syncStoreWithProfile(s);
        });
      },
      setEnableGamepadControls(v) {
        set((s) => {
          s.enableGamepadControls = v;
          syncStoreWithProfile(s);
        });
      },
      setGamepadSetupComplete(v) {
        set((s) => {
          s.gamepadSetupComplete = v;
          syncStoreWithProfile(s);
        });
      },
      setGamepadInputMode(v) {
        set((s) => {
          s.gamepadInputMode = v;
          syncStoreWithProfile(s);
        });
      },
      setGamepadMapping(v) {
        set((s) => {
          s.gamepadMapping = v;
          syncStoreWithProfile(s);
        });
      },
      setKeyboardShortcuts(v) {
        set((s) => {
          s.keyboardShortcuts = v;
          syncStoreWithProfile(s);
        });
      },
      setIgnoreHeader(v) {
        set((s) => {
          s.ignoreHeader = v;
          syncStoreWithProfile(s);
        });
      },
      setGamepadActive(v) {
        set((s) => {
          s.isGamepadActive = v;
          syncStoreWithProfile(s);
        });
      },
    })),
    {
      name: "__MW::preferences",
    },
  ),
);
