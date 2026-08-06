"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Adds the `revealed` class to elements with the `reveal` class once they
 * enter the viewport. Supports staggered children via the `data-reveal-delay`
 * attribute (in ms).
 *
 * Usage: call `useScrollReveal()` once near the top of a page. Then mark any
 * element with `className="reveal"` (and optionally `data-reveal-delay="150"`)
 * and it will animate in on scroll.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = Number(el.dataset.revealDelay ?? 0);
            window.setTimeout(() => el.classList.add("revealed"), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    const els = document.querySelectorAll(".reveal:not(.revealed)");
    els.forEach((el) => observer.observe(el));

    // Re-scan after a tick in case content rendered late
    const t = window.setTimeout(() => {
      document.querySelectorAll(".reveal:not(.revealed)").forEach((el) => observer.observe(el));
    }, 200);

    return () => {
      observer.disconnect();
      window.clearTimeout(t);
    };
  }, []);
}

/**
 * Reveal a single ref'd element. Useful for components that mount after
 * the initial scan.
 */
export function useRevealRef<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return { ref, shown };
}
