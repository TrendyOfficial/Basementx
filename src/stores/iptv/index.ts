import parser from "iptv-playlist-parser";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IptvChannel {
  name: string;
  url: string;
  logo?: string;
  category?: string;
  tvgId?: string;
  // Specific properties for TMDB integration
  tmdbId?: string;
  mediaType?: "movie" | "show";
}

export interface IptvPlaylist {
  id: string;
  name: string;
  url?: string;
  type: "m3u" | "xtream" | "tmdb-vod";
  channels: IptvChannel[];
  lastUpdated: number;
}

interface IptvState {
  playlists: IptvPlaylist[];
  activePlaylistId: string | null;
  virtualPlaylist: IptvPlaylist | null;

  // Settings
  arabicMode: boolean;
  parentalPin: string | null;
  theme: string;

  // Actions
  addPlaylist: (
    playlist: Omit<IptvPlaylist, "channels" | "lastUpdated">,
    m3uContent: string,
  ) => void;
  removePlaylist: (id: string) => void;
  setActivePlaylist: (id: string | null) => void;
  updatePlaylistChannels: (id: string, m3uContent: string) => void;
  setArabicMode: (val: boolean) => void;
  setParentalPin: (pin: string | null) => void;
  setTheme: (theme: string) => void;

  fetchVirtualPlaylist: () => Promise<void>;
}

export const useIptvStore = create<IptvState>()(
  persist(
    (set, get) => ({
      playlists: [],
      activePlaylistId: null,
      virtualPlaylist: null,
      arabicMode: false,
      parentalPin: null,
      theme: "default",

      addPlaylist: (playlist, m3uContent) => {
        const result = parser.parse(m3uContent);
        const channels: IptvChannel[] = result.items.map((item) => ({
          name: item.name,
          url: item.url,
          logo: item.tvg.logo,
          category: item.group.title,
          tvgId: item.tvg.id,
        }));

        const newPlaylist: IptvPlaylist = {
          ...playlist,
          channels,
          lastUpdated: Date.now(),
        };

        set((state) => ({
          playlists: [...state.playlists, newPlaylist],
          activePlaylistId: state.activePlaylistId || newPlaylist.id,
        }));
      },

      removePlaylist: (id) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
          activePlaylistId:
            state.activePlaylistId === id ? null : state.activePlaylistId,
        }));
      },

      setActivePlaylist: (id) => {
        set({ activePlaylistId: id });
      },

      updatePlaylistChannels: (id, m3uContent) => {
        const result = parser.parse(m3uContent);
        const channels: IptvChannel[] = result.items.map((item) => ({
          name: item.name,
          url: item.url,
          logo: item.tvg.logo,
          category: item.group.title,
          tvgId: item.tvg.id,
        }));

        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === id ? { ...p, channels, lastUpdated: Date.now() } : p,
          ),
        }));
      },

      setArabicMode: (val) => {
        set({ arabicMode: val });
        if (val) {
          get().fetchVirtualPlaylist();
        }
      },
      setParentalPin: (pin) => set({ parentalPin: pin }),
      setTheme: (theme) => set({ theme }),

      fetchVirtualPlaylist: async () => {
        const { generateArabicVODPlaylist } =
          await import("./virtualProviders");
        const playlist = await generateArabicVODPlaylist();
        set({ virtualPlaylist: playlist });
      },
    }),
    {
      name: "basement-iptv-storage",
      partialize: (state) => ({
        playlists: state.playlists,
        activePlaylistId: state.activePlaylistId,
        arabicMode: state.arabicMode,
        parentalPin: state.parentalPin,
        theme: state.theme,
      }),
    },
  ),
);
