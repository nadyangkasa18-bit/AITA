"use client";

import { useState } from "react";
import type { RuledOut } from "@/lib/types";

/** Quiet, collapsed "what I ruled out" — reasoning available, not default. */
export function RuledOutSection({ items }: { items: RuledOut[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-card border border-hair-2 bg-surface-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-lg tracking-[-0.02em]">What I ruled out</span>
        <span aria-hidden className={`text-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && (
        <ul className="disclose grid gap-3 px-6 pb-6">
          {items.map((r) => (
            <li key={r.place} className="text-[14.5px] leading-snug text-ink-soft">
              <span className="font-semibold text-ink">{r.place}</span> — {r.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
