"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getIdToken } from "@/lib/firebase/auth";
import Button from "@/components/ui/Button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CATEGORIES = [
  { id: "background", label: "Background", icon: "~", description: "Your story, upbringing, and life journey" },
  { id: "values", label: "Values", icon: "#", description: "What you believe in and stand for" },
  { id: "opinions", label: "Opinions", icon: "!", description: "Your takes on topics that matter to you" },
  { id: "expertise", label: "Expertise", icon: ">", description: "What you know deeply and can teach" },
  { id: "stories", label: "Stories", icon: "*", description: "Memorable experiences and anecdotes" },
];

interface TrainingChatProps {
  onEntryCount?: (count: number) => void;
}

export default function TrainingChat({ onEntryCount }: TrainingChatProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = useCallback(async () => {
    setMessages([]);
    setSessionId(null);
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: `I'd like to share about my ${category.id}`, category: category.id, messages: [] }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([
          { role: "user", content: `I'd like to share about my ${category.id}` },
          { role: "assistant", content: data.response },
        ]);
        setSessionId(data.sessionId);
        if (data.entryCount && onEntryCount) onEntryCount(data.entryCount);
      }
    } catch (err) {
      console.error("Failed to start session:", err);
    } finally {
      setLoading(false);
    }
  }, [category, onEntryCount]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      startSession();
    }
  }, [startSession]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const token = await getIdToken();
      const res = await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userMessage, category: category.id, sessionId, messages: newMessages.slice(-10) }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: "assistant", content: data.response }]);
        setSessionId(data.sessionId);
        if (data.entryCount && onEntryCount) onEntryCount(data.entryCount);
      }
    } catch (err) {
      console.error("Training error:", err);
    } finally {
      setLoading(false);
    }
  }

  function switchCategory(cat: (typeof CATEGORIES)[number]) {
    setCategory(cat);
    setMessages([]);
    setSessionId(null);
    initialized.current = false;
    setTimeout(() => {
      initialized.current = true;
      startSession();
    }, 0);
  }

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* Category sidebar */}
      <div className="w-52 border-r border-teal-glow/8 p-4 space-y-1 hidden md:block">
        <p className="font-mono text-[9px] tracking-[0.3em] text-amber-glow/30 uppercase mb-3 px-3">
          Categories
        </p>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => switchCategory(cat)}
            className={`w-full text-left px-3 py-2.5 rounded-sm text-sm transition-all cursor-pointer ${
              category.id === cat.id
                ? "glass-panel-amber text-amber-pale"
                : "text-[#5a5040] hover:text-amber-pale/70 hover:bg-amber-glow/3"
            }`}
          >
            <span className="font-mono text-[10px] mr-2 text-teal-glow/30">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile categories */}
        <div className="md:hidden p-3 border-b border-teal-glow/8 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => switchCategory(cat)}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-mono tracking-wider uppercase whitespace-nowrap cursor-pointer ${
                category.id === cat.id
                  ? "bg-amber-glow/10 text-amber-pale border border-amber-glow/20"
                  : "text-[#4a4035] border border-transparent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="p-3 border-b border-teal-glow/8">
          <p className="font-mono text-[10px] tracking-wider text-teal-glow/25 uppercase">
            {category.description}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-5 scrollbar-thin">
          {messages.map((msg, i) =>
            i === 0 ? null : (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-amber-glow/10 border border-amber-glow/15 rounded-sm text-amber-pale/90"
                      : "glass-panel rounded-sm text-[#a09080]"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )
          )}

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

        {/* Input */}
        <div className="p-4 border-t border-teal-glow/8">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-1 bg-[#0a0d14] border border-teal-glow/10 rounded-sm px-4 py-3 text-amber-pale text-sm placeholder-[#2a2520] focus:outline-none focus:border-teal-glow/25 focus:shadow-[0_0_15px_rgba(0,180,190,0.05)] transition-all font-light"
              disabled={loading}
            />
            <Button type="submit" loading={loading} disabled={!input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
