import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

import { Icon, Icons } from "@/components/Icon";
import { useAuthStore } from "@/stores/auth";
import { useProfileStore } from "@/stores/profile";
import { useWatchPartyStore } from "@/stores/watchParty";

/* ─────────────── helpers ─────────────── */

function isUrl(s: string) {
  return s.startsWith("http") || s.startsWith("data:");
}

/* ─────────────── MiniAvatar ─────────────── */

interface MiniAvatarProps {
  iconValue: string;
  colorA: string;
  colorB: string;
}

function MiniAvatar({ iconValue, colorA, colorB }: MiniAvatarProps) {
  if (isUrl(iconValue)) {
    return (
      <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0">
        <img src={iconValue} alt="avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
      style={{
        background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
      }}
    >
      <Icon
        icon={(iconValue as Icons) || Icons.USER}
        className="text-white text-[10px]"
      />
    </div>
  );
}

/* ─────────────── WatchPartyChat ─────────────── */

let socket: Socket | null = null;

export function WatchPartyChat() {
  const {
    enabled,
    messages,
    pushMessage,
    isChatOpen,
    setIsChatOpen,
    roomCode,
    userCount,
    setHasUnreadMessages,
  } = useWatchPartyStore();
  
  const auth = useAuthStore();
  const { profiles, activeProfileId } = useProfileStore();
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get active profile data for current user
  const currentProfile = (() => {
    if (!auth.account) return null;
    if (!activeProfileId || activeProfileId === "main")
      return { ...auth.account.profile, name: auth.account.nickname };
    const userProfiles = profiles[auth.account.userId] || [];
    return userProfiles.find((p) => p.id === activeProfileId) || { ...auth.account.profile, name: auth.account.nickname };
  })();

  const scrollToBottom = (instant = false) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: instant ? "auto" : "smooth",
      });
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
      setHasUnreadMessages(false);
    }
  }, [messages, isChatOpen, setHasUnreadMessages]);

  useEffect(() => {
    if (!enabled || !roomCode) return;

    if (!socket) {
      // Use window.location as fallback for development
      socket = io(window.location.hostname === 'localhost' ? "http://localhost:3001" : window.location.origin);
    }

    socket.emit("join", { room: roomCode });

    const handleMessage = (data: any) => {
      pushMessage({
        type: "chat",
        author: data.author,
        text: data.text,
        time: data.time || Date.now(),
        authorIcon: data.authorIcon,
        authorColor: data.authorColor,
      });
    };

    socket.on("chat_message", handleMessage);

    return () => {
      if (socket) {
        socket.off("chat_message", handleMessage);
      }
    };
  }, [enabled, roomCode, pushMessage]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentProfile) return;

    const newMsg = {
      type: "chat" as const,
      text: chatInput.trim(),
      time: Date.now(),
      author: currentProfile.name || "Guest",
      authorIcon: currentProfile.icon,
      authorColor: currentProfile.colorA,
    };

    pushMessage(newMsg);

    if (socket && roomCode) {
      socket.emit("chat_message", { ...newMsg, room: roomCode });
    }

    setChatInput("");
  };

  if (!enabled) return null;

  return (
    <div
      className={classNames(
        "fixed top-24 bottom-28 right-6 w-80 bg-background-main border border-utils-divider z-[100] flex flex-col shadow-2xl rounded-3xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform overflow-hidden",
        isChatOpen
          ? "translate-x-0 opacity-100 pointer-events-auto"
          : "translate-x-[120%] opacity-0 pointer-events-none",
      )}
    >
      <div className="px-6 py-5 border-b border-utils-divider flex items-center justify-between bg-white/[0.02]">
        <div className="flex flex-col">
          <h2 className="text-white font-black text-sm uppercase tracking-[0.15em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live Party Chat
          </h2>
          <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-1">
            {userCount} connected
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsChatOpen(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
        >
          <Icon icon={Icons.X} className="text-sm" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
            <Icon icon={Icons.WATCH_PARTY} className="text-4xl mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.author === (currentProfile?.name || "Guest");
            const isSystem = msg.type === "system";

            if (isSystem) {
              return (
                <div key={`${msg.time}-${i}`} className="bg-white/5 px-3 py-1.5 rounded-full self-center">
                   <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                     {msg.text}
                   </p>
                </div>
              );
            }

            return (
              <div
                key={`${msg.time}-${i}`}
                className={classNames(
                  "flex flex-col max-w-[85%]",
                  isMe ? "self-end items-end" : "self-start items-start"
                )}
              >
                <div className={classNames(
                  "flex items-center gap-2 mb-1.5",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}>
                  <MiniAvatar 
                    iconValue={msg.authorIcon || Icons.USER} 
                    colorA={msg.authorColor || "#555"} 
                    colorB={msg.authorColor || "#333"} 
                  />
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest truncate max-w-[100px]">
                    {msg.author}
                  </span>
                </div>
                <div className={classNames(
                  "px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                  isMe ? "bg-white text-black font-semibold rounded-tr-sm" : "bg-white/5 text-white/80 border border-white/5 rounded-tl-sm"
                )}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="p-5 border-t border-utils-divider bg-white/[0.02]"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Talk to the party..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all focus:bg-white/[0.08]"
          />
          <button 
            type="submit"
            disabled={!chatInput.trim()}
            className="absolute right-2 p-2 rounded-xl text-white/40 hover:text-white transition-all disabled:opacity-0"
          >
            <Icon icon={Icons.PLAY} className="text-lg rotate-[-90deg]" />
          </button>
        </div>
      </form>
    </div>
  );
}
