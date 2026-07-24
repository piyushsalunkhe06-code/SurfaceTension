"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Ocean Explorer", href: "/explorer" },
  { label: "Ocean Watch",    href: "/dashboard" },
  { label: "Marine Life",    href: "#coral" },
  { label: "About",          href: "#why" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.1 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(5, 14, 26, 0.88)" : "linear-gradient(180deg, rgba(5,14,26,0.65), transparent)",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(78, 205, 196, 0.1)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-seafoam/60" style={{ boxShadow: "0 0 12px rgba(78,205,196,0.4)" }} />
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-seafoam to-shallow" />
          </div>
          <span className="font-display font-bold text-pearl text-sm tracking-tight">DeepSea Guardian</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-8 items-center">
          {links.map((l) =>
            l.href.startsWith("#") ? (
              <a key={l.label} href={l.href} className="text-sm text-mist hover:text-pearl tracking-wide transition-colors duration-200">
                {l.label}
              </a>
            ) : (
              <Link key={l.label} href={l.href} className="text-sm text-mist hover:text-pearl tracking-wide transition-colors duration-200">
                {l.label}
              </Link>
            )
          )}
        </div>

        {/* CTA */}
        <Link
          href="/explorer"
          className="hidden md:inline-flex px-6 py-2.5 rounded-full font-semibold text-sm text-abyss transition-all duration-300 hover:scale-105"
          style={{ background: "linear-gradient(135deg, #4ECDC4, #0096B7)", boxShadow: "0 0 20px -5px rgba(78,205,196,0.5)" }}
        >
          Explore Now
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-mist hover:text-pearl"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 pb-6 space-y-4 border-t border-white/5" style={{ background: "rgba(5,14,26,0.97)" }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} className="block text-sm text-mist hover:text-pearl py-2" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <Link href="/explorer" className="block text-center px-6 py-3 rounded-full text-sm font-bold text-abyss" style={{ background: "linear-gradient(135deg, #4ECDC4, #0096B7)" }}>
            Explore Now
          </Link>
        </div>
      )}
    </motion.nav>
  );
}
