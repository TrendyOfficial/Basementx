import classNames from "classnames";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Icon, Icons } from "@/components/Icon";
import { useIptvStore } from "@/stores/iptv";

export function CategoryExplorer() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { playlists, activePlaylistId, virtualPlaylist, arabicMode } =
    useIptvStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const activePlaylist = arabicMode
    ? virtualPlaylist
    : playlists.find((p) => p.id === activePlaylistId);

  const channels = useMemo(() => {
    if (!activePlaylist) return [];
    let filtered = activePlaylist.channels;

    if (type === "movies") {
      filtered = filtered.filter((c) =>
        c.category?.toLowerCase().includes("movie"),
      );
    } else if (type === "series") {
      filtered = filtered.filter((c) =>
        c.category?.toLowerCase().includes("series"),
      );
    } else {
      filtered = filtered.filter(
        (c) =>
          !c.category?.toLowerCase().includes("movie") &&
          !c.category?.toLowerCase().includes("series"),
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [activePlaylist, type, searchQuery]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [channels]);

  const displayedChannels = useMemo(() => {
    if (!selectedCategory) return channels;
    return channels.filter((c) => c.category === selectedCategory);
  }, [channels, selectedCategory]);

  return (
    <div className="min-h-screen bg-background-main text-white flex flex-col overflow-hidden">
      {/* Sidebar - Categories */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-black/20 border-r border-white/10 flex flex-col p-6 overflow-y-auto">
          <button
            type="button"
            onClick={() => navigate("/iptv")}
            className="flex items-center gap-3 text-white/40 hover:text-white font-bold mb-10 transition-colors"
          >
            <Icon icon={Icons.ARROW_LEFT} />
            <span>BACK TO HOME</span>
          </button>

          <h2 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-6">
            Categories
          </h2>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={classNames(
                "w-full text-left px-5 py-3 rounded-2xl font-bold transition-all",
                !selectedCategory
                  ? "bg-white text-black scale-105 shadow-xl"
                  : "text-white/40 hover:bg-white/5",
              )}
            >
              ALL CHANNELS
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={classNames(
                  "w-full text-left px-5 py-3 rounded-2xl font-bold transition-all truncate",
                  selectedCategory === cat
                    ? "bg-white text-black scale-105 shadow-xl"
                    : "text-white/40 hover:bg-white/5",
                )}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content - Channel Grid */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-gradient-to-br from-transparent to-black/40">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              {type}{" "}
              <span className="text-type-secondary opacity-30">
                / {selectedCategory || "All"}
              </span>
            </h1>

            <div className="relative w-96">
              <Icon
                icon={Icons.SEARCH}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20"
              />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-14 pr-6 focus:outline-none focus:border-white/30 transition-colors font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {displayedChannels.map((channel, i) => (
              <button
                key={channel.url + i}
                type="button"
                onClick={() => {
                  if (
                    activePlaylist?.type === "tmdb-vod" &&
                    channel.tmdbId &&
                    channel.mediaType
                  ) {
                    navigate(
                      `/media/tmdb-${channel.mediaType === "movie" ? "movie" : "tv"}-${channel.tmdbId}-${channel.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                    );
                  } else {
                    navigate(
                      `/iptv/player/${activePlaylist?.channels.indexOf(channel)}`,
                    );
                  }
                }}
                className="group flex flex-col gap-4 focus:outline-none"
              >
                <div className="aspect-video rounded-2xl bg-white/5 border border-white/5 overflow-hidden group-hover:scale-105 group-focus:ring-4 group-focus:ring-white transition-all duration-300 relative">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt=""
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <Icon icon={Icons.TV} className="text-4xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-bold text-sm text-center truncate px-2 group-hover:text-white transition-colors text-white/60">
                  {channel.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
