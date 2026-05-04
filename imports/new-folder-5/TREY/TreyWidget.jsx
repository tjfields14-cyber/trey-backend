import React, { useState, useEffect, useRef } from "react";
import TreyAvatar from "./assets/avatars/avatar_trey.svg";

// Your Ubuntu backend Trey API
const TREY_API_URL = "http://192.168.137.2:3000/trey";

export default function TreyWidget() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "trey",
      text:
        "I'm here. What do you want to work on next — loops, functions, errors, or something in Chapterhouse?",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle"); // idle | online | offline
  const [mood, setMood] = useState("neutral"); // neutral | thinking | error (for future use)

  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const hasError = connectionStatus === "offline";

  const statusText =
    connectionStatus === "offline"
      ? "Trey is unreachable."
      : connectionStatus === "online"
      ? isTyping
        ? "Trey is thinking…"
        : "Trey is online."
      : "Ready.";

  // For now we always use the same avatar image
  function currentAvatar() {
    return TreyAvatar;
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    // Show user's message immediately
    setMessages((prev) => [...prev, { from: "user", text: userText }]);

    // Trey starts "thinking"
    setIsTyping(true);
    setConnectionStatus("online");
    setMood("thinking");

    try {
      const res = await fetch(TREY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setIsTyping(false);
      setConnectionStatus("online");
      setMood("neutral");

      setMessages((prev) => [
        ...prev,
        {
          from: "trey",
          text: data.reply || data.response || "(no reply)",
        },
      ]);
    } catch (err) {
      console.error("Trey fetch error:", err);
      setIsTyping(false);
      setConnectionStatus("offline");
      setMood("error");

      setMessages((prev) => [
        ...prev,
        {
          from: "system",
          text: "⚠️ Trey is unreachable. (Failed to contact backend.)",
        },
      ]);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-[60vh] bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl text-xs sm:text-sm flex flex-col overflow-hidden backdrop-blur-md z-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border border-zinc-700 shadow-md overflow-hidden bg-zinc-800 flex items-center justify-center">
            <img
              src={currentAvatar()}
              alt="Trey avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-zinc-900 ${
              hasError ? "bg-amber-500" : "bg-emerald-400"
            }`}
          />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-amber-300">Trey Assistant</div>
          <div className="text-[0.7rem] text-zinc-400 truncate">
            {statusText}
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 no-scrollbar bg-gradient-to-b from-zinc-950 to-zinc-900">
        {messages.map((m, idx) => {
          const isUser = m.from === "user";
          const isSystem = m.from === "system";

          if (isSystem) {
            return (
              <div
                key={idx}
                className="text-[0.7rem] text-amber-300 text-center px-2"
              >
                {m.text}
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`flex gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar on Trey messages */}
              {!isUser && (
                <div className="w-7 h-7 rounded-full border border-zinc-700 overflow-hidden bg-zinc-800 mt-1 flex-shrink-0">
                  <img
                    src={currentAvatar()}
                    alt="Trey avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`px-3 py-2 rounded-2xl max-w-[75%] leading-snug ${
                  isUser
                    ? "bg-amber-400 text-black rounded-br-sm"
                    : "bg-zinc-800/80 text-zinc-100 border border-zinc-700 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 rounded-full border border-zinc-700 overflow-hidden bg-zinc-800 flex-shrink-0">
              <img
                src={currentAvatar()}
                alt="Trey typing"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-3 py-2 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse [animation-delay:100ms]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse [animation-delay:200ms]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-zinc-800 bg-zinc-900/90 px-3 py-2 flex items-center gap-2">
        <input
          className="flex-1 bg-zinc-950/70 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs outline-none placeholder:text-zinc-500 focus:border-amber-400"
          placeholder="Ask Trey…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-semibold hover:bg-amber-300 active:scale-95 transition"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
