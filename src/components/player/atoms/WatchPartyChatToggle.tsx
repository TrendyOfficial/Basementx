import { Icons } from "@/components/Icon";
import { VideoPlayerButton } from "@/components/player/internals/Button";
import { useWatchPartyStore } from "@/stores/watchParty";

export function WatchPartyChatToggle() {
  const {
    enabled,
    isChatOpen,
    setIsChatOpen,
    hasUnreadMessages,
    setHasUnreadMessages,
  } = useWatchPartyStore();

  if (!enabled) return null;

  return (
    <div className="relative inline-block">
      <VideoPlayerButton
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen) setHasUnreadMessages(false);
        }}
        icon={Icons.WATCH_PARTY}
      />
      {hasUnreadMessages && !isChatOpen && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-background-main pointer-events-none" />
      )}
    </div>
  );
}
