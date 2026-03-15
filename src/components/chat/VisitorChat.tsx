"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import AudioPlayer from "@/components/audio/AudioPlayer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VisitorChatProps {
  username: string;
  displayName: string;
  avatarUrl?: string;
  hasVoice?: boolean;
}

export default function VisitorChat({
  username,
  displayName,
  hasVoice,
}: VisitorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setError(null);
    setTtsUrl(null);

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, message: userMessage, sessionMessages: messages.slice(-8) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get response");
      }
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleListen(text: string) {
    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, username }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      setTtsUrl(URL.createObjectURL(blob));
    } catch {
      setError("Failed to generate audio");
    }
  }

  return (
    <div className="flex flex-col h-[500px] max-h-[70vh]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-5 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center mt-16 space-y-3">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-teal-glow/20 to-transparent mx-auto" />
            <p className="text-lg text-amber-pale/50">Ask {displayName} anything</p>
            <p className="font-mono text-[10px] tracking-[0.3em] text-teal-glow/25 uppercase">
              AI Essence will respond in their voice
            </p>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-teal-glow/20 to-transparent mx-auto" />
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-3 ${
                msg.role === "user"
                  ? "bg-amber-glow/10 border border-amber-glow/15 rounded-sm text-amber-pale/90"
                  : "glass-panel rounded-sm text-[#a09080]"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.role === "assistant" && hasVoice && (
                <button
                  onClick={() => handleListen(msg.content)}
                  className="mt-2 font-mono text-[9px] tracking-wider text-teal-glow/30 hover:text-teal-glow/60 transition-colors cursor-pointer uppercase"
                >
                  Listen
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass-panel rounded-sm px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-1.5 h-1.5 bg-teal-glow/40 rounded-full" style={{ animation: "pulse-teal 1.5s infinite" }} />
                <div className="w-1.5 h-1.5 bg-teal-glow/40 rounded-full" style={{ animation: "pulse-teal 1.5s infinite 0.3s" }} />
                <div className="w-1.5 h-1.5 bg-teal-glow/40 rounded-full" style={{ animation: "pulse-teal 1.5s infinite 0.6s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {ttsUrl && (
        <div className="px-5 pb-2">
          <AudioPlayer src={ttsUrl} />
        </div>
      )}

      {error && (
        <div className="px-5 pb-2">
          <p className="font-mono text-[10px] tracking-wider text-red-400/60 uppercase">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-teal-glow/8">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${displayName} something...`}
            className="flex-1 bg-[#0a0d14] border border-teal-glow/10 rounded-sm px-4 py-3 text-amber-pale text-sm placeholder-[#2a2520] focus:outline-none focus:border-teal-glow/25 focus:shadow-[0_0_15px_rgba(0,180,190,0.05)] transition-all font-light"
            disabled={loading}
          />
          <Button type="submit" loading={loading} disabled={!input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
