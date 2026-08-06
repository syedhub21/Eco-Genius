"use client";

import { useEffect, useState } from "react";
import { Leaf, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import { Flag } from "./flag";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#stats", label: "Impact" },
  { href: "#calculator", label: "Analysis" },
  { href: "#estimators", label: "Estimators" },
  { href: "#achievements", label: "Achievements" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { symbol, code, name } = useCurrency();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => handleNav("#home")}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Eco<span className="text-cyan-400">Genius</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="relative px-4 py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300 group-hover:w-3/4" />
              </button>
            ))}

            {/* Active currency badge — reflects selected country */}
            <div
              className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-cyan-400/30 text-xs"
              title={`Active currency: ${name}`}
            >
              <Flag code={code} className="w-4 h-3" />
              <span className="font-mono font-bold text-cyan-400">{symbol}</span>
            </div>

            <button
              onClick={() => handleNav("#calculator")}
              className="ml-2 aurora-btn px-5 py-2.5 rounded-xl text-sm"
            >
              Start Analysis
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-slate-200 hover:text-cyan-400 p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex flex-col p-4 gap-1">
            {/* Active currency badge — mobile */}
            <div className="mb-2 flex items-center justify-between px-4 py-2 rounded-lg bg-white/5 border border-cyan-400/30">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Active Currency</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-cyan-400">
                <Flag code={code} className="w-4 h-3" /> {symbol} · {name}
              </span>
            </div>
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="text-left px-4 py-3 text-slate-200 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNav("#calculator")}
              className="mt-2 aurora-btn px-5 py-3 rounded-xl text-sm"
            >
              Start Analysis
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
