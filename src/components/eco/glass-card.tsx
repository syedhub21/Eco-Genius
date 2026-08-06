import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Use the animated iridescent border variant. */
  iridescent?: boolean;
  /** Add a colored top accent border. */
  accent?: "cyan" | "emerald" | "violet" | "yellow" | "blue" | "none";
  as?: "div" | "section" | "article";
}

const ACCENT_COLORS: Record<NonNullable<GlassCardProps["accent"]>, string> = {
  cyan: "border-t-cyan-400/70",
  emerald: "border-t-emerald-400/70",
  violet: "border-t-violet-400/70",
  yellow: "border-t-yellow-400/70",
  blue: "border-t-blue-400/70",
  none: "",
};

/**
 * Glassmorphism card. The default eco card style with backdrop blur and
 * subtle border. Optionally iridescent (animated conic-gradient border) or
 * with a colored top accent.
 */
export function GlassCard({
  children,
  className,
  iridescent = false,
  accent = "none",
  as = "div",
}: GlassCardProps) {
  const Comp = as;
  return (
    <Comp
      className={cn(
        iridescent ? "glass-card-iridescent" : "glass-card",
        accent !== "none" && `border-t-4 ${ACCENT_COLORS[accent]}`,
        "p-6",
        className
      )}
    >
      {children}
    </Comp>
  );
}
