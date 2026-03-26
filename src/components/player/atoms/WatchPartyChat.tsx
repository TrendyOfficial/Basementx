import classNames from "classnames";
import { useEffect, useRef, useState } from "react";

import { Icon, Icons } from "@/components/Icon";
import { useAuthStore } from "@/stores/auth";
import { useWatchPartyStore } from "@/stores/watchParty";

export function WatchPartyChat() {
  const { enabled, messages, pushMessage } = useWatchPartyStore();
  const account = useAuthStore((s) => s.account);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!enabled) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    pushMessage({
      type: "chat",
      text: chatInput.trim(),
      time: Date.now(),
      author: account?.nickname || "Guest",
    });
    setChatInput("");
  };

  return (
    <div className="fixed top-0 bottom-0 right-0 w-80 bg-black/80 backdrop-blur-md border-l border-white/10 z-[100] flex flex-col pointer-events-auto shadow-xl transition-transform duration-300">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Icon icon={Icons.WATCH_PARTY} className="text-type-logo" />
          Live Chat
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-type-secondary text-sm">
            Welcome to the Watch Party!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={`${msg.time}-${msg.author}-${msg.text.substring(0, 10)}`}
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
        className="p-3 border-t border-white/10 bg-black/40"
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
