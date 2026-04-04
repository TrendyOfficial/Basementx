import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Icon, Icons } from "@/components/Icon";
import { useIptvStore } from "@/stores/iptv";

export function IptvPlayerView() {
  const { index } = useParams<{ index: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { playlists, activePlaylistId } = useIptvStore();
  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
  const channel = activePlaylist?.channels[parseInt(index || "0", 10)];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleMouseMove);

    handleMouseMove();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = channel.url;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError(`Fatal error: ${data.type}`);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else {
      setError("HLS is not supported in this browser.");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [channel]);

  if (!channel) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Channel not found</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-white text-black rounded-xl font-bold"
          >
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden group">
      <video
        ref={videoRef}
        autoPlay
        className="w-full h-full object-contain"
        onClick={() => setShowControls(true)}
      />

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8 text-center z-50">
          <div>
            <Icon icon={Icons.WARNING} className="text-6xl text-red-500 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Playback Error</h2>
            <p className="text-white/60 mb-8">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-white text-black rounded-xl font-bold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div
        className={`absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus:ring-4 focus:ring-white outline-none"
          >
            <Icon icon={Icons.ARROW_LEFT} className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tighter truncate max-w-xl">
              {channel.name}
            </h1>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
              {channel.category || "General"}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls (Mini) */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex justify-between items-end">
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-red-600 rounded-lg text-xs font-black tracking-widest animate-pulse">
              LIVE
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold tracking-widest">
              HLS / AUTO
            </div>
          </div>

          <div className="flex gap-4 text-xs font-bold text-white/20 uppercase tracking-widest">
            <span>Powered by Basement IPTV</span>
          </div>
        </div>
      </div>
    </div>
  );
}
