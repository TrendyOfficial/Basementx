import classNames from "classnames";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Icon, Icons } from "@/components/Icon";
import { useIptvStore } from "@/stores/iptv";

export function IboDashboard() {
  const navigate = useNavigate();
  const {
    playlists,
    activePlaylistId,
    virtualPlaylist,
    arabicMode,
    fetchVirtualPlaylist,
  } = useIptvStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (arabicMode && !virtualPlaylist) {
      fetchVirtualPlaylist();
    }
  }, [arabicMode, virtualPlaylist, fetchVirtualPlaylist]);

  const activePlaylist = arabicMode
    ? virtualPlaylist
    : playlists.find((p) => p.id === activePlaylistId);

  const tiles = [
    {
      id: "live",
      title: "LIVE TV",
      icon: Icons.TV,
      color: "from-blue-600 to-blue-800",
      count:
        activePlaylist?.channels.filter(
          (c) =>
            !c.category?.toLowerCase().includes("movie") &&
            !c.category?.toLowerCase().includes("series"),
        ).length || 0,
      path: "/iptv/live",
    },
    {
      id: "movies",
      title: "MOVIES",
      icon: Icons.FILM,
      color: "from-purple-600 to-purple-800",
      count:
        activePlaylist?.channels.filter((c) =>
          c.category?.toLowerCase().includes("movie"),
        ).length || 0,
      path: "/iptv/movies",
    },
    {
      id: "series",
      title: "SERIES",
      icon: Icons.CLAPPER_BOARD,
      color: "from-pink-600 to-pink-800",
      count:
        activePlaylist?.channels.filter((c) =>
          c.category?.toLowerCase().includes("series"),
        ).length || 0,
      path: "/iptv/series",
    },
  ];

  return (
    <div className="min-h-screen bg-background-main text-white flex flex-col p-8 md:p-12">
      {/* Header */}
      <div className="flex justify-between items-start mb-16">
        <div className="flex flex-col">
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
            BASEMENT{" "}
            <span className="text-type-secondary opacity-50">IPTV</span>
          </h1>
          <div className="flex items-center gap-2 text-type-secondary font-bold uppercase tracking-widest text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Connected: {activePlaylist?.name || "No Playlist"}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-4xl font-black tracking-tighter">
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-type-secondary font-bold uppercase tracking-widest text-xs mt-1">
            {time.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => navigate(tile.path)}
              className={classNames(
                "group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-white focus:outline-none",
                "bg-gradient-to-br",
                tile.color,
              )}
            >
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Icon
                    icon={tile.icon}
                    className="text-6xl text-white drop-shadow-2xl"
                  />
                </div>

                <h2 className="text-4xl font-black tracking-tighter mb-2">
                  {tile.title}
                </h2>
                <p className="text-white/60 font-bold uppercase tracking-widest text-sm">
                  {tile.count} Channels
                </p>
              </div>

              {/* Bottom Decoration */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/20 group-hover:w-20 group-hover:bg-white/40 transition-all duration-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer / Settings bar */}
      <div className="mt-16 flex justify-between items-center bg-white/5 rounded-3xl p-6 border border-white/10">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => navigate("/iptv/settings")}
            className="flex items-center gap-3 text-white/40 hover:text-white font-bold transition-colors"
          >
            <Icon icon={Icons.SETTINGS} className="text-xl" />
            <span>TV SETTINGS</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-3 text-white/40 hover:text-white font-bold transition-colors"
          >
            <Icon icon={Icons.SEARCH} className="text-xl" />
            <span>SEARCH</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-white/20 uppercase tracking-widest">
          <span>
            Expiry: <span className="text-white/40">Lifetime</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>
            Device ID: <span className="text-white/40">88:A1:C2:E4</span>
          </span>
        </div>
      </div>
    </div>
  );
}
