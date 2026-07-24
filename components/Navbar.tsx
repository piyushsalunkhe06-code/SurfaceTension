"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/",           label: "Home",        icon: "🏠" },
  { href: "/explorer",   label: "Explorer",    icon: "🌍" },
  { href: "/dashboard",  label: "Dashboard",   icon: "📡" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  // Hide on scroll-down, reveal on scroll-up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < 60 || y < lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] transition-transform duration-300"
      style={{ transform: visible ? "translateY(0)" : "translateY(-100%)" }}
    >
      <div
        className="mx-4 mt-3 rounded-2xl flex items-center justify-between px-5 py-2.5"
        style={{
          background: "rgba(4, 13, 20, 0.82)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(133, 236, 212, 0.10)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #133A52 0%, #0A2033 100%)",
              border: "1px solid rgba(133, 236, 212, 0.22)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#85ECD4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <span
            className="font-display font-semibold text-sm tracking-tight text-pearl group-hover:text-seafoam transition-colors duration-200"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            DeepSea<span style={{ color: "#85ECD4" }}>.</span>Guardian
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 select-none"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: isActive ? "#85ECD4" : "rgba(242,240,237,0.55)",
                  background: isActive ? "rgba(133, 236, 212, 0.08)" : "transparent",
                  border: isActive ? "1px solid rgba(133, 236, 212, 0.18)" : "1px solid transparent",
                }}
              >
                <span className="text-[0.7rem]">{icon}</span>
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-[2px] rounded-full"
                    style={{ background: "#85ECD4" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Status Badge */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[0.6rem] font-mono uppercase tracking-widest"
          style={{
            background: "rgba(133, 236, 212, 0.06)",
            border: "1px solid rgba(133, 236, 212, 0.12)",
            color: "rgba(133, 236, 212, 0.7)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#85ECD4] animate-pulse flex-shrink-0" />
          Ocean Live
        </div>
      </div>
    </header>
  );
}
