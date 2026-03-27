import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

import { Icon, Icons } from "@/components/Icon";
import { useAuthStore } from "@/stores/auth";
import { useWatchPartyStore } from "@/stores/watchParty";

// Module-level socket so it persists even if the component unmounts
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
  } = useWatchPartyStore();
  const account = useAuthStore((s) => s.account);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  useEffect(() => {
    if (!enabled || !roomCode) return;

    if (!socket) {
      socket = io("http://localhost:3001");
    }

    socket.emit("join", { room: roomCode });

    const handleMessage = (data: any) => {
      // Receive message from another user
      pushMessage({
        type: "chat",
        author: data.author,
        text: data.text,
        time: data.time,
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
    if (!chatInput.trim()) return;

    const newMsg = {
      type: "chat" as const,
      text: chatInput.trim(),
      time: Date.now(),
      author: account?.nickname || "Guest",
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
        "fixed top-20 bottom-24 right-4 w-80 bg-black/80 backdrop-blur-md border border-white/10 z-[100] flex flex-col shadow-2xl rounded-2xl transition-all duration-300 transform",
        isChatOpen
          ? "translate-x-0 opacity-100 pointer-events-auto"
          : "translate-x-[110%] opacity-0 pointer-events-none",
      )}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Icon icon={Icons.WATCH_PARTY} className="text-type-logo" />
          Live Chat ({userCount} {userCount === 1 ? "member" : "members"})
        </h2>
        <button
          type="button"
          onClick={() => setIsChatOpen(false)}
          className="text-white/60 hover:text-white transition-colors p-1"
        >
          <Icon icon={Icons.X} className="text-xl" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-type-secondary text-sm">
            Welcome to the Watch Party!
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={`${msg.time}-${msg.author}-${i}`}
              className={classNames(
                "p-2 rounded-lg text-sm max-w-[90%]",
                msg.type === "system"
                  ? "bg-type-logo/20 text-type-logo text-center self-center mx-auto text-xs font-semibold"
                  : msg.author === (account?.nickname || "Guest")
                    ? "bg-buttons-purple text-white self-end"
                    : "bg-white/10 text-white self-start",
              )}
            >
              {msg.type === "chat" && (
                <div className="text-[10px] opacity-70 mb-1">{msg.author}</div>
              )}
              <div>{msg.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 border-t border-white/10 bg-black/40 rounded-b-2xl"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type a message..."
          className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-type-logo transition-colors"
        />
      </form>
    </div>
  );
}
