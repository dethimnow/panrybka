"use client";

import { useId } from "react";

function Star({ filled, partial }: { filled: boolean; partial?: number }) {
  const gid = useId();
  if (partial != null && partial > 0 && partial < 1) {
    return (
      <svg className="h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 20 20" aria-hidden>
        <defs>
          <linearGradient id={gid}>
            <stop offset={`${partial * 100}%`} stopColor="currentColor" />
            <stop offset={`${partial * 100}%`} stopColor="transparent" />
          </linearGradient>
        </defs>
        <path fill={`url(#${gid})`} stroke="currentColor" strokeWidth={0.5} d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.51L10 13.9l-4.94 2.6.94-5.51-4-3.9 5.53-.8L10 1.5z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1}
        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.51L10 13.9l-4.94 2.6.94-5.51-4-3.9 5.53-.8L10 1.5z"
      />
    </svg>
  );
}

/** `rating` w skali 0–10 → wizualnie 5 gwiazdek */
export function StarRating({ rating, className }: { rating: number; className?: string }) {
  const stars = Math.min(5, Math.max(0, rating / 2));
  const full = Math.floor(stars);
  const frac = stars - full;
  const empty = 5 - full - (frac > 0.15 ? 1 : 0);
  return (
    <div className={`flex items-center gap-0.5 ${className ?? ""}`} title={`${rating.toFixed(1)}/10`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} filled />
      ))}
      {frac > 0.15 ? <Star filled={false} partial={frac} /> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} filled={false} />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}/10</span>
    </div>
  );
}
