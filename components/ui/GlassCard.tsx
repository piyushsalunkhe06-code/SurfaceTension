"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function GlassCard({
  children,
  className = "",
  glow = "#00E5FF",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass rounded-2xl p-6 ${className}`}
      style={{ boxShadow: `0 0 40px -12px ${glow}44, inset 0 1px 0 rgba(255,255,255,0.06)` }}
    >
      {children}
    </motion.div>
  );
}
