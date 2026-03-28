import classNames from "classnames";
import { useEffect, useRef, useState, useCallback } from "react";
import { Socket, io } from "socket.io-client";

import { Icon, Icons } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { useAuthStore } from "@/stores/auth";
import { useProfileStore } from "@/stores/profile";
import { useWatchPartyStore } from "@/stores/watchParty";

/* ─────────────── WatchPartyChat ─────────────── */

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
  const socketRef = useRef<Socket | null>(null);

  // Get active profile data for current user
  const currentProfile = (() => {
    if (!auth.account) return null;
    if (!activeProfileId || activeProfileId === "main")
      return { ...auth.account.profile, name: auth.account.nickname };
    const userProfiles = profiles[auth.account.userId] || [];
    return userProfiles.find((p) => p.id === activeProfileId) || { ...auth.account.profile, name: auth.account.nickname };
  })();

  const scrollToBottom = useCallback((instant = false) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: instant ? "auto" : "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom(true);
      setHasUnreadMessages(false);
    }
  }, [isChatOpen, setHasUnreadMessages, scrollToBottom]);

  useEffect(() => {
    // Scroll whenever new messages arrive if chat is open
    if (isChatOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isChatOpen, scrollToBottom]);

  useEffect(() => {
    if (!enabled || !roomCode) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? "http://localhost:3001" 
        : window.location.origin;
      
      console.log(`[Chat] Connecting to ${socketUrl}...`);
      socketRef.current = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        console.log("[Chat] Connected to server");
        socketRef.current?.emit("join", { room: roomCode });
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("[Chat] Connection error:", err);
      });

      socketRef.current.on("chat_message", (data: any) => {
        console.log("[Chat] Received message:", data);
        pushMessage({
          type: "chat",
          author: data.author,
          text: data.text,
          time: data.time || Date.now(),
          authorIcon: data.authorIcon,
          authorColor: data.authorColor,
        });
      });
    } else {
      // Room code changed but socket exists
      socketRef.current.emit("join", { room: roomCode });
    }

    return () => {
      // Keep socket alive across short unmounts if enabled
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

    console.log("[Chat] Sending message:", newMsg);
    pushMessage(newMsg);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("chat_message", { ...newMsg, room: roomCode });
    } else {
      console.warn("[Chat] Socket not connected, could not emit message");
    }

    setChatInput("");
  };

  if (!enabled) return null;

  return (
    <div
      className={classNames(
        "fixed top-24 bottom-28 right-6 w-85 bg-background-main border border-utils-divider z-[200] flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] rounded-[2.5rem] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) transform overflow-hidden",
        isChatOpen
          ? "translate-x-0 opacity-100 pointer-events-auto"
          : "translate-x-[120%] opacity-0 pointer-events-none",
      )}
    >
      {/* Header */}
      <div className="px-8 py-7 border-b border-utils-divider flex items-center justify-between bg-white/[0.03]">
        <div className="flex flex-col">
          <h2 className="text-white font-black text-xs uppercase tracking-[0.25em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
            Watch Party
          </h2>
          <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5">
            {userCount} members connected
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsChatOpen(false)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all transform active:scale-95"
        >
          <Icon icon={Icons.X} className="text-lg" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-6 space-y-6 flex flex-col scrollbar-none"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
              <Icon icon={Icons.WATCH_PARTY} className="text-3xl text-white/20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10">Waiting for messages</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.author === (currentProfile?.name || "Guest");
            const isSystem = msg.type === "system";

            if (isSystem) {
              return (
                <div key={`${msg.time}-${i}`} className="bg-white/5 px-4 py-2 rounded-full self-center">
                   <p className="text-[9px] font-black uppercase text-white/30 tracking-widest text-center">
                     {msg.text}
                   </p>
                </div>
              );
            }

            return (
              <div
                key={`${msg.time}-${i}`}
                className={classNames(
                  "flex items-end gap-3 max-w-[90%]",
                  isMe ? "self-end flex-row-reverse" : "self-start flex-row"
                )}
              >
                {/* Profile Icon Primary */}
                <div className="flex-shrink-0 mb-1">
                  <Avatar 
                    profile={{
                      icon: msg.authorIcon || Icons.USER,
                      colorA: msg.authorColor || "#555",
                      colorB: msg.authorColor || "#333",
                      name: msg.author
                    }}
                    sizeClass="w-8 h-8"
                    iconClass="text-[10px]"
                  />
                </div>

                <div className={classNames(
                  "flex flex-col gap-1.5",
                  isMe ? "items-end" : "items-start"
                )}>
                  <span className="text-[9px] font-black text-white/15 uppercase tracking-[0.15em] px-1">
                    {msg.author}
                  </span>
                  <div className={classNames(
                    "px-5 py-3 rounded-2xl text-[13px] font-medium leading-relaxed shadow-lg",
                    isMe 
                      ? "bg-white text-black rounded-br-none" 
                      : "bg-white/5 text-white/90 border border-white/5 rounded-bl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-8 border-t border-utils-divider bg-white/[0.01]"
      >
        <div className="relative flex items-center group">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Send a message..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-white/10 focus:outline-none focus:border-white/30 transition-all focus:bg-white/[0.08]"
          />
          <button 
            type="submit"
            disabled={!chatInput.trim()}
            className="absolute right-3 w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center transition-all disabled:opacity-0 hover:scale-105 active:scale-95 shadow-xl"
          >
            <Icon icon={Icons.PLAY} className="text-lg rotate-[-90deg]" />
          </button>
        </div>
      </form>
    </div>
  );
}
