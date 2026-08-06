"use client";

import { useEffect, useState } from "react";

interface GradeGaugeProps {
  grade: string;
  score: number; // 0-100
  color: string;
}

/**
 * Animated SVG circular gauge. The arc fills up to `score`% with a color
 * transition, and the number counts up inside.
 */
export function GradeGauge({ grade, score, color }: GradeGaugeProps) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const [dashOffset, setDashOffset] = useState(circumference);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setDashOffset(circumference - (score / 100) * circumference * 0.75); // 270deg arc
    }, 150);

    const start = performance.now();
    const duration = 1500;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(score * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplayScore(score);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [score, circumference]);

  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg viewBox="0 0 220 220" className="w-full h-full -rotate-[135deg]">
        {/* Track */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeDashoffset="0"
        />
        {/* Progress */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
            filter: `drop-shadow(0 0 12px ${color}80)`,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] text-slate-400 uppercase tracking-widest">Energy Grade</div>
        <div
          className="text-6xl font-black"
          style={{ color, textShadow: `0 0 20px ${color}60` }}
        >
          {grade}
        </div>
        <div className="text-2xl font-bold text-white mt-1">
          {Math.round(displayScore)}
          <span className="text-sm text-slate-400 font-normal">/100</span>
        </div>
      </div>
    </div>
  );
}
