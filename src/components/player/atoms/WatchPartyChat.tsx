import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

import { Avatar } from "@/components/Avatar";
import { Icon, Icons } from "@/components/Icon";
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
    return (
      userProfiles.find((p) => p.id === activeProfileId) || {
        ...auth.account.profile,
        name: auth.account.nickname,
      }
    );
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
      const socketUrl =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
          ? "http://localhost:3001"
          : window.location.origin;

      socketRef.current = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        socketRef.current?.emit("join", { room: roomCode });
      });

      socketRef.current.on("chat_message", (data: any) => {
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

    pushMessage(newMsg);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("chat_message", { ...newMsg, room: roomCode });
    }

    setChatInput("");
  };

  if (!enabled) return null;

  return (
    <div
      className={classNames(
        "fixed bottom-28 right-6 top-24 z-[200] flex w-85 transform flex-col overflow-hidden rounded-[2.5rem] border border-utils-divider bg-background-main shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)",
        isChatOpen
          ? "translate-x-0 opacity-100 pointer-events-auto"
          : "translate-x-[120%] opacity-0 pointer-events-none",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-utils-divider bg-white/[0.03] px-8 py-7">
        <div className="flex flex-col">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-white">
            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
            Watch Party
          </h2>
          <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
            {userCount} members connected
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsChatOpen(false)}
          className="flex h-10 w-10 transform items-center justify-center rounded-2xl bg-white/5 text-white/40 transition-all active:scale-95 hover:bg-white/10 hover:text-white"
        >
          <Icon icon={Icons.X} className="text-lg" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="scrollbar-none flex flex-1 flex-col space-y-6 overflow-y-auto px-8 py-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5">
              <Icon
                icon={Icons.WATCH_PARTY}
                className="text-3xl text-white/20"
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10">
              Waiting for messages
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.author === (currentProfile?.name || "Guest");
            const isSystem = msg.type === "system";

            if (isSystem) {
              return (
                <div
                  key={`${msg.time}-${msg.text.length}`}
                  className="self-center rounded-full bg-white/5 px-4 py-2"
                >
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-white/30">
                    {msg.text}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={`${msg.time}-${msg.author}-${msg.text.slice(0, 10)}`}
                className={classNames(
                  "flex max-w-[90%] items-end gap-3",
                  isMe ? "flex-row-reverse self-end" : "flex-row self-start",
                )}
              >
                {/* Profile Icon Primary */}
                <div className="mb-1 flex-shrink-0">
                  <Avatar
                    profile={{
                      icon: msg.authorIcon || Icons.USER,
                      colorA: msg.authorColor || "#555",
                      colorB: msg.authorColor || "#333",
                      name: msg.author,
                    }}
                    sizeClass="w-8 h-8"
                    iconClass="text-[10px]"
                  />
                </div>

                <div
                  className={classNames(
                    "flex flex-col gap-1.5",
                    isMe ? "items-end" : "items-start",
                  )}
                >
                  <span className="px-1 text-[9px] font-black uppercase tracking-[0.15em] text-white/15">
                    {msg.author}
                  </span>
                  <div
                    className={classNames(
                      "rounded-2xl px-5 py-3 text-[13px] font-medium leading-relaxed shadow-lg",
                      isMe
                        ? "rounded-br-none bg-white text-black"
                        : "rounded-bl-none border border-white/5 bg-white/5 text-white/90",
                    )}
                  >
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
        className="border-t border-utils-divider bg-white/[0.01] p-8"
      >
        <div className="group relative flex items-center">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Send a message..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white transition-all placeholder:text-white/10 focus:border-white/30 focus:bg-white/[0.08] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="absolute right-3 flex h-10 w-10 transform items-center justify-center rounded-xl bg-white text-black shadow-xl transition-all active:scale-95 disabled:opacity-0 hover:scale-105"
          >
            <Icon icon={Icons.PLAY} className="rotate-[-90deg] text-lg" />
          </button>
        </div>
      </form>
    </div>
  );
}
