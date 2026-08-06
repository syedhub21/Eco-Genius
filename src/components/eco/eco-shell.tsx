"use client";

import { useEffect, type ReactNode } from "react";
import { LensBackground } from "./lens-background";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

/**
 * Client-side shell that mounts the WebGL lens background + scroll-reveal.
 *
 * Layer order (back → front):
 *   1. LensBackground  (fixed, z -20, cursor:none) — forest photo with a
 *      glass refraction lens that follows the cursor, revealing the vivid
 *      warm grade beneath the cool desaturated surface. This is the ORIGINAL
 *      prompt1's code design: background + cursor in one.
 *   2. Content         (relative, z 10) — the actual UI sections.
 */
export function EcoShell({ children }: { children: ReactNode }) {
  useScrollReveal();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      document.querySelectorAll(".reveal:not(.revealed)").forEach((el) => {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const e = entry.target as HTMLElement;
                const delay = Number(e.dataset.revealDelay ?? 0);
                window.setTimeout(() => e.classList.add("revealed"), delay);
                io.unobserve(e);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
        );
        io.observe(el);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <LensBackground />
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
    </>
  );
}
