"use client";

import { useEffect, useState } from "react";
import type { ReasoningStep } from "@/lib/types";
import { Orb } from "@/components/ui";

/**
 * Transparent, non-linear reasoning reveal. Deterministic timing, no fake API.
 * Respects prefers-reduced-motion (all shown at once).
 */
export function ReasoningProgress({
  steps,
  onDone,
  headline = "Reading what you told me…",
}: {
  steps: ReasoningStep[];
  onDone?: () => void;
  headline?: string;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = setTimeout(() => {
        setShown(steps.length);
        onDone?.();
      }, 350);
      return () => clearTimeout(t);
    }
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const tick = () => {
      i += 1;
      setShown(i);
      if (i < steps.length) {
        timers.push(setTimeout(tick, 620));
      } else {
        timers.push(setTimeout(() => onDone?.(), 700));
      }
    };
    timers.push(setTimeout(tick, 500));
    return () => timers.forEach(clearTimeout);
  }, [steps.length, onDone]);

  return (
    <div className="mx-auto max-w-xl px-5 py-[12vh]">
      <div className="mb-6 flex items-center gap-3">
        <Orb size={44} busy />
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Working on it
          </p>
          <h1 className="font-display text-[26px] tracking-[-0.03em]">{headline}</h1>
        </div>
      </div>
      <ul className="grid gap-1">
        {steps.map((s, idx) => {
          const isShown = idx < shown;
          const isDone = idx < shown - 1 || shown === steps.length;
          return (
            <li
              key={s.label}
              className={`flex items-center gap-3.5 py-3 transition-all duration-500 ${
                isShown ? "opacity-100 translate-y-0" : "translate-y-2 opacity-0"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs ${
                  isDone
                    ? "border-accent bg-accent text-white"
                    : "border-hair text-accent"
                }`}
              >
                {isDone ? "✓" : <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-accent-line border-t-accent" />}
              </span>
              <span className="text-[15px] text-ink-soft">{s.label}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-[13px] text-faint">
        Roam isn&apos;t querying live systems — this is a transparent, illustrative pass.
      </p>
    </div>
  );
}
