"use client";

import { cn } from "@/lib/utils";

interface FlagProps {
  code: string; // ISO 3166-1 alpha-2 country code, e.g. "US", "IN"
  alt?: string;
  className?: string;
}

/**
 * Renders a country flag as an SVG image from flagcdn.com.
 *
 * Use this instead of emoji flags (🇺🇸) because emoji flags don't render on
 * Windows / most Linux distros — they show as letter pairs ("US"). The CDN
 * image renders identically on every OS.
 */
export function Flag({ code, alt, className }: FlagProps) {
  const url = `https://flagcdn.com/${code.toLowerCase()}.svg`;
  return (
    <img
      src={url}
      alt={alt ?? code}
      className={cn("inline-block object-cover rounded-sm", className)}
      loading="lazy"
      draggable={false}
    />
  );
}
