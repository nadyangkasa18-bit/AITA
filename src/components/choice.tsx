"use client";

import { useState } from "react";
import type { ChoiceValue } from "@/lib/types";
import type { Round, RoundOption } from "@/lib/calibration";
import { Photo } from "@/components/photo";
import { Eyebrow } from "@/components/ui";

function Itinerary({ it }: { it: NonNullable<RoundOption["itinerary"]> }) {
  return (
    <div className="rounded-lg bg-surface-2 p-4 ring-1 ring-hair-2">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
        {it.label}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="font-display text-lg leading-none">{it.depart}</div>
          <div className="mt-1 text-[10.5px] uppercase tracking-wide text-faint">Dep</div>
        </div>
        <div className="flex-1">
          <div className="relative h-px bg-hair">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-surface-2 px-2 text-[10.5px] text-muted">
              {it.duration} · {it.stops}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="font-display text-lg leading-none">{it.arrive}</div>
          <div className="mt-1 text-[10.5px] uppercase tracking-wide text-faint">Arr</div>
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: RoundOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const [more, setMore] = useState(false);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex w-full flex-col overflow-hidden rounded-card border bg-surface text-left transition-all duration-200 ${
        selected
          ? "border-accent ring-2 ring-accent"
          : "border-hair hover:-translate-y-0.5 hover:border-ink hover:shadow-[var(--shadow-card)]"
      }`}
    >
      {option.image ? (
        <Photo image={option.image} ratio="4/3" width={800} rounded="rounded-none" />
      ) : option.itinerary ? (
        <div className="p-5 pb-0">
          <Itinerary it={option.itinerary} />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-xl tracking-[-0.02em]">{option.title}</h3>
          <span
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[13px] transition ${
              selected ? "border-accent bg-accent text-[#f3f6f1]" : "border-hair text-transparent"
            }`}
            aria-hidden
          >
            ✓
          </span>
        </div>
        <ul className="mt-3 grid gap-1.5">
          {option.points.slice(0, 3).map((p) => (
            <li key={p} className="flex items-start gap-2 text-[14.5px] leading-snug text-ink-soft">
              <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
              {p}
            </li>
          ))}
        </ul>
        {option.more && (
          <div className="mt-3">
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setMore((m) => !m);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  setMore((m) => !m);
                }
              }}
              className="text-[13px] font-medium text-accent"
            >
              {more ? "Less" : "See more"}
            </span>
            {more && <p className="disclose mt-2 text-[13.5px] text-muted">{option.more}</p>}
          </div>
        )}
      </div>
    </button>
  );
}

export function ComparisonRound({
  round,
  index,
  total,
  selected,
  onSelect,
  onBack,
}: {
  round: Round;
  index: number; // 0-based
  total: number;
  selected: ChoiceValue | null;
  onSelect: (v: ChoiceValue) => void;
  onBack?: () => void;
}) {
  return (
    <div className="mx-auto max-w-[880px] px-5 py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-[13px] font-medium text-muted transition hover:text-ink"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <Eyebrow>
          {index + 1} of {total}
        </Eyebrow>
      </div>

      {/* progress bar */}
      <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-hair-2" aria-hidden>
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <h1 className="mb-7 max-w-[20ch] font-display text-[clamp(26px,4.5vw,40px)] leading-[1.05] tracking-[-0.035em]">
        {round.question}
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <OptionCard option={round.a} selected={selected === "A"} onSelect={() => onSelect("A")} />
        <OptionCard option={round.b} selected={selected === "B"} onSelect={() => onSelect("B")} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => onSelect("depends")}
          aria-pressed={selected === "depends"}
          className={`rounded-full border px-4 py-2 text-[13.5px] font-medium transition ${
            selected === "depends" ? "border-accent bg-accent-tint text-accent" : "border-hair text-muted hover:border-ink"
          }`}
        >
          It depends
        </button>
        <button
          onClick={() => onSelect("none")}
          aria-pressed={selected === "none"}
          className={`rounded-full border px-4 py-2 text-[13.5px] font-medium transition ${
            selected === "none" ? "border-accent bg-accent-tint text-accent" : "border-hair text-muted hover:border-ink"
          }`}
        >
          No preference
        </button>
      </div>
    </div>
  );
}
