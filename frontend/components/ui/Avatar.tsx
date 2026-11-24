"use client";

import React, { useState } from "react";

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

const PALETTE = ["#AA2D00", "#0A2E0E", "#254FAD", "#7C3A00", "#4B2E83", "#1B61C9"];

function initialsOf(name: string) {
  const parts = name.replace(/^(Dr|Prof|Ms|Mr|Mrs)\.?\s+/i, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function colorOf(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/** Avatar with a graceful initials fallback when the image is missing or fails to load. */
export default function Avatar({ name, src, size = 32, className = "" }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const dimension = { width: size, height: size };

  if (!src || failed) {
    return (
      <svg
        role="img"
        aria-label={name}
        viewBox="0 0 40 40"
        {...dimension}
        className={`shrink-0 rounded-full ${className}`}
      >
        <rect width="40" height="40" fill={colorOf(name)} />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--font-sans), sans-serif"
        >
          {initialsOf(name)}
        </text>
      </svg>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      {...dimension}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
