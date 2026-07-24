"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";

const BiolumScene = dynamic(() => import("@/components/3d/BiolumScene"), { ssr: false });

const TESTIMONIALS = [
  {
    quote: "The deep sea is the largest environment on our planet. Yet we know less about it than we do about the surface of Mars.",
    author: "Dr. Sylvia Earle",
    role: "Marine Biologist & Ocean Activist",
    emoji: "🌊",
  },
  {
    quote: "No ocean, no life. No blue, no green. The ocean is the life support system of our planet.",
    author: "Sylvia Earle",
    role: "National Geographic Explorer",
    emoji: "🐳",
  },
  {
    quote: "In every walk with nature, one receives far more than he seeks — and in the ocean, that is multiplied a thousandfold.",
    author: "Jacques Cousteau",
    role: "Legendary Ocean Explorer",
    emoji: "🤿",
  },
];

export default function ProtectTheDeep() {
  return (
    <section className="relative py-32 overflow-hidden" id="why" style={{
      background: "linear-gradient(180deg, #050E1A 0%, #05182F 50%, #050E1A 100%)"
    }}>
      {/* 3D Bioluminescent deep ocean background */}
      <div className="absolute inset-0">
        <BiolumScene height="h-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <span className="font-mono text-[0.65rem] tracking-[0.25em] text-seafoam uppercase">
            Why It Matters
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-display font-bold text-pearl text-center text-[clamp(2rem,4.5vw,3.6rem)] leading-tight mb-5 max-w-3xl mx-auto"
        >
          The Ocean Sustains All Life on Earth
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-mist text-center max-w-2xl mx-auto mb-16 leading-relaxed"
        >
          The ocean regulates climate, feeds billions, and generates half the oxygen we breathe. Protecting it isn't a choice — it's the most important thing we can do.
        </motion.p>

        {/* Stat pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-20">
          {[
            { value: "50%",   label: "of Earth's oxygen comes from the ocean", color: "#4ECDC4" },
            { value: "3B+",   label: "people rely on seafood as their primary protein", color: "#7FFFD4" },
            { value: "30%",   label: "of the world's CO₂ is absorbed by the ocean", color: "#0096B7" },
            { value: "90%",   label: "of the world's trade travels by sea", color: "#2ECC71" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-ocean rounded-2xl p-6 text-center group hover:scale-105 transition-transform duration-300"
            >
              <div
                className="font-display font-bold text-[2.2rem] leading-none"
                style={{ color: s.color, textShadow: `0 0 20px ${s.color}55` }}
              >
                {s.value}
              </div>
              <div className="mt-2 text-xs text-mist leading-relaxed">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quotes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="glass-ocean rounded-2xl p-7 flex flex-col"
            >
              <div className="text-3xl mb-4">{t.emoji}</div>
              <p className="text-mist text-sm leading-relaxed italic flex-1">"{t.quote}"</p>
              <footer className="mt-5 pt-4 border-t border-white/5">
                <div className="text-pearl text-sm font-semibold">{t.author}</div>
                <div className="text-mist/60 text-xs mt-0.5">{t.role}</div>
              </footer>
            </motion.blockquote>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-mist mb-7 text-lg max-w-xl mx-auto">
            Every data point we surface brings us closer to protecting what matters most.
          </p>
          <Link
            href="/explorer"
            className="inline-flex px-12 py-5 rounded-full font-bold text-abyss text-base transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #4ECDC4 0%, #0096B7 60%, #7FFFD4 100%)",
              boxShadow: "0 0 50px -10px rgba(78,205,196,0.7)",
            }}
          >
            Explore the Living Ocean
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
