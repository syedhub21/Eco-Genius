"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt angle in degrees. Default 8. */
  maxTilt?: number;
  /** Show a glare spot that follows the cursor. Default true. */
  glare?: boolean;
}

/**
 * 3D parallax tilt card. Rotates on X/Y axes based on cursor position
 * relative to card center, with a moving glare spot.
 */
export function TiltCard({ children, className, maxTilt = 8, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width; // 0..1
    const py = y / rect.height; // 0..1
    const rotY = (px - 0.5) * 2 * maxTilt;
    const rotX = -(py - 0.5) * 2 * maxTilt;
    setTransform(
      `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`
    );
    setGlarePos({ x: px * 100, y: py * 100, opacity: 0.25 });
  };

  const handleLeave = () => {
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)");
    setGlarePos((g) => ({ ...g, opacity: 0 }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn("relative transition-transform duration-200 ease-out will-change-transform", className)}
      style={{ transform }}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.4), transparent 60%)`,
            opacity: glarePos.opacity,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
