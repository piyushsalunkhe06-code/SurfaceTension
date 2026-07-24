"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Waves, Send, ChevronDown, Droplets, Fish, Thermometer } from "lucide-react";

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
    color: "#4ECDC4",
  },
];

const SUGGESTIONS = [
  "What is happening to coral reefs right now?",
  "Which ocean is warming fastest?",
  "How does ocean acidification affect marine life?",
  "Show me the healthiest ocean region.",
];

export default function OceanInsights() {
  const [input,    setInput]    = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [messages, setMessages] = useState<{ from: "user" | "ocean"; text: string }[]>([]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const responses: Record<string, string> = {
      default: "Reading ocean sensor streams... Equatorial sea surface temperatures remain elevated 0.4°C above baseline. Reef systems in the Indian Ocean are showing increased thermal stress. The Southern Ocean remains the healthiest biome with strong biodiversity indices.",
      "What is happening to coral reefs right now?": "Current data shows 58% of monitored coral reefs are experiencing thermal stress. The Maldives Arc and Great Barrier Reef are under the highest pressure. Bleaching alerts are active for 14 major reef systems. Some recovery is observed in Marine Protected Areas.",
      "Which ocean is warming fastest?": "The Arctic Ocean is warming 4× faster than the global average. The Indian Ocean has seen the largest persistent anomaly over the past decade. The Southern Ocean remains relatively stable due to natural thermal buffering from Antarctic currents.",
    };
    const reply = responses[text] ?? responses.default;
    setMessages(m => [...m, { from: "user", text }, { from: "ocean", text: reply }]);
    setInput("");
  };

  return (
    <div className="glass-ocean rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl border border-seafoam/30 bg-seafoam/8 flex items-center justify-center">
          <Waves className="w-4.5 h-4.5 text-seafoam" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-pearl text-sm">Ocean Insights</h3>
          <p className="text-[0.58rem] text-mist font-mono flex items-center gap-1">
            <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-kelp">●</motion.span>
            {" "}All sensor feeds connected
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Left — insight cards */}
        <div className="md:w-1/2 border-r border-white/5 p-5 space-y-3">
          <div className="text-[0.58rem] font-mono text-mist uppercase tracking-wider mb-3">What the Ocean is Telling Us</div>

          <p className="text-sm text-mist leading-relaxed">
            <span className="text-pearl font-medium">Good afternoon.</span> Ocean systems are operational. {" "}
            <span className="text-coral">Three conditions</span> require attention. Weekly reef thermal report is ready.
          </p>

          <div className="space-y-2 mt-3">
            {INSIGHTS.map((ins, i) => (
              <div
                key={ins.title}
                className="rounded-xl border overflow-hidden cursor-pointer"
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
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 space-y-2">
                        <p className="text-xs text-mist leading-relaxed">{ins.body}</p>
                        <span className="text-[0.58rem] font-mono" style={{ color: ins.color }}>→ {ins.action}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Right — ocean query */}
        <div className="md:w-1/2 p-5 flex flex-col gap-3">
          <div className="text-[0.58rem] font-mono text-mist uppercase tracking-wider">Ask About the Ocean</div>

          {/* Suggestions */}
          {messages.length === 0 && (
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left text-xs text-mist px-3.5 py-2.5 rounded-xl border border-white/5 hover:border-seafoam/30 hover:text-pearl hover:bg-seafoam/5 transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Message thread */}
          {messages.length > 0 && (
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-52 pr-1 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
                    style={{
                      background: msg.from === "user" ? "rgba(78,205,196,0.15)" : "rgba(10,30,55,0.8)",
                      border: msg.from === "user" ? "1px solid rgba(78,205,196,0.25)" : "1px solid rgba(255,255,255,0.04)",
                      color: msg.from === "user" ? "#E0F7FF" : "#94A3B8",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 mt-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask about ocean health, reefs, species..."
              className="flex-1 bg-white/[0.03] border border-white/8 rounded-xl px-3.5 py-2.5 text-xs text-pearl placeholder:text-mist/40 focus:outline-none focus:border-seafoam/40 transition-colors"
            />
            <button
              onClick={() => send(input)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #4ECDC4, #0096B7)" }}
            >
              <Send className="w-3.5 h-3.5 text-abyss" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
