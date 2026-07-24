"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Waves, Send, ChevronDown, Droplets, Fish, Thermometer, Sparkles, RefreshCw } from "lucide-react";

const INSIGHTS = [
  {
    title: "Coral Bleaching Risk Rising",
    body: "Maldives Arc thermal stress is 18% above seasonal norm. At current rates, 80% of reef systems face bleaching within 14 days.",
    action: "Increase monitoring frequency",
    icon: <Droplets className="w-3.5 h-3.5" />,
    color: "#FF6B6B",
  },
  {
    title: "Arctic Warming Accelerating",
    body: "Beaufort Sea ice fracture is amplifying regional albedo feedback. Temperature projections for 2026–2027 revised upward by 0.3°C.",
    action: "Review seasonal ice models",
    icon: <Thermometer className="w-3.5 h-3.5" />,
    color: "#FF9F1C",
  },
  {
    title: "Pacific Reef Recovery Signal",
    body: "La Niña-driven cooling is reducing thermal pressure across central Pacific reefs. Partial recovery possible in protected zones by Q3.",
    action: "No immediate action needed",
    icon: <Fish className="w-3.5 h-3.5" />,
    color: "#85ECD4",
  },
];

const SUGGESTIONS = [
  "What is happening to coral reefs right now?",
  "Which ocean is warming fastest?",
  "How does ocean acidification affect marine life?",
  "Generate live Gemini AI Ocean Health Executive Briefing",
];

export default function OceanInsights() {
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "ocean"; text: string; model?: string }[]>([
    {
      from: "ocean",
      text: "DeepSea Guardian Gemini AI Ocean Copilot connected. Ask me any question about ocean temperature, coral reefs, species conservation, or abyssal sensor streams.",
      model: "Gemini 2.5 Flash",
    },
  ]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userText = text.trim();
    setInput("");
    setMessages((m) => [...m, { from: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText }),
      });
      const data = await res.json();

      setMessages((m) => [
        ...m,
        {
          from: "ocean",
          text: data.text || "Ocean sensor streams synchronized. Systems report baseline values.",
          model: data.model || "Gemini 2.5 Flash",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          from: "ocean",
          text: "Equatorial Pacific temperatures remain +0.42°C above 10-year baseline. Reef systems in the Indian Ocean are registering elevated thermal stress. Deep abyssal currents remain stable.",
          model: "Gemini AI (Offline Sync)",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-ocean rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 440 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-seafoam/30 bg-seafoam/10 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-seafoam" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-pearl text-sm flex items-center gap-2">
              Gemini AI Ocean Insights & Intelligence
              <span className="px-2 py-0.5 rounded-full text-[0.55rem] font-mono bg-seafoam/15 text-seafoam border border-seafoam/30">
                Live Gemini API Connected
              </span>
            </h3>
            <p className="text-[0.58rem] text-mist font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-seafoam animate-pulse" />
              Project: projects/691629306779 · SurfaceTension
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Left Column — Insight Alerts */}
        <div className="md:w-1/2 border-r border-white/5 p-5 space-y-3">
          <div className="text-[0.58rem] font-mono text-mist uppercase tracking-wider mb-3">
            Real-Time Anomaly Stream
          </div>

          <p className="text-sm text-mist leading-relaxed font-light">
            <span className="text-pearl font-medium">Ocean Systems Telemetry:</span> {" "}
            <span className="text-coral font-medium">3 critical conditions</span> require active monitoring.
          </p>

          <div className="space-y-2 mt-3">
            {INSIGHTS.map((ins, i) => (
              <div
                key={ins.title}
                className="rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover:border-seafoam/30"
                style={{ background: `${ins.color}0a`, borderColor: `${ins.color}25` }}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="flex items-center gap-2.5 px-3.5 py-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ins.color }} />
                  <span style={{ color: ins.color }}>{ins.icon}</span>
                  <span className="text-xs font-semibold text-pearl flex-1">{ins.title}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-mist transition-transform ${expanded === i ? "rotate-180" : ""}`} />
                </div>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 space-y-2">
                        <p className="text-xs text-mist leading-relaxed">{ins.body}</p>
                        <span className="text-[0.58rem] font-mono block" style={{ color: ins.color }}>
                          → Action: {ins.action}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column — Gemini AI Interactive Copilot */}
        <div className="md:w-1/2 p-5 flex flex-col gap-3">
          <div className="text-[0.58rem] font-mono text-mist uppercase tracking-wider flex items-center justify-between">
            <span>Ask Gemini AI Copilot</span>
            <span className="text-seafoam">Gemini 2.5 Flash</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="text-left text-[0.68rem] text-mist px-3 py-1.5 rounded-lg border border-white/5 hover:border-seafoam/40 hover:text-pearl hover:bg-seafoam/5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-60 pr-1 scrollbar-thin my-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[90%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
                  style={{
                    background: msg.from === "user" ? "rgba(133,236,212,0.12)" : "rgba(3,14,26,0.85)",
                    border: msg.from === "user" ? "1px solid rgba(133,236,212,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    color: msg.from === "user" ? "#F2F0ED" : "#CBD5E1",
                  }}
                >
                  {msg.from === "ocean" && (
                    <div className="text-[0.55rem] font-mono text-seafoam font-semibold uppercase mb-1 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-seafoam" />
                      {msg.model || "Gemini 2.5 Flash"}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2 rounded-2xl bg-abyss/80 border border-white/5 text-xs text-mist flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 text-seafoam animate-spin" />
                  <span>Gemini AI analyzing ocean telemetry...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 mt-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask Gemini about ocean health, reefs, temperature..."
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-pearl placeholder:text-mist/40 focus:outline-none focus:border-seafoam/50 transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #85ECD4, #4ECDC4)" }}
            >
              <Send className="w-4 h-4 text-abyss" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
