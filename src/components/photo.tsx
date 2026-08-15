"use client";

/* eslint-disable @next/next/no-img-element -- prototype uses fixed remote
   Unsplash URLs with a graceful fallback; next/image optimization isn't needed. */

import { useState } from "react";
import type { ImageRef } from "@/lib/types";

type Ratio = "wide" | "hero" | "4/3" | "square" | "tall";

const RATIO_CLASS: Record<Ratio, string> = {
  hero: "aspect-[16/9]",
  wide: "aspect-[3/1]",
  "4/3": "aspect-[4/3]",
  square: "aspect-square",
  tall: "aspect-[3/4]",
};

function withParams(url: string, w: number) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}auto=format&fit=crop&w=${w}&q=70`;
}

/**
 * Fixed-URL Unsplash photo with a skeleton while loading and a calm
 * editorial fallback (tone gradient + label) if the image can't load —
 * so the composition never looks broken.
 */
export function Photo({
  image,
  ratio = "4/3",
  tone = "hero-hakone",
  width = 1200,
  className = "",
  rounded = "rounded-lg",
  priority = false,
}: {
  image: ImageRef;
  ratio?: Ratio;
  tone?: string;
  width?: number;
  className?: string;
  rounded?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${RATIO_CLASS[ratio]} ${rounded} ${className}`}
    >
      {/* fallback / skeleton layer */}
      <div
        className={`absolute inset-0 ${tone} transition-opacity duration-500 ${
          loaded && !errored ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        {!loaded && !errored && <div className="absolute inset-0 shimmer opacity-40" />}
        {errored && (
          <div className="absolute inset-0 flex items-end p-4">
            <span className="text-[12px] font-medium text-white/90 drop-shadow-sm">
              {image.alt}
            </span>
          </div>
        )}
      </div>

      {!errored && (
        <img
          src={withParams(image.url, width)}
          alt={image.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{ objectPosition: image.position ?? "center" }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
