"use client";

import { useState } from "react";
import type { ChoiceValue } from "@/lib/types";
import type { Round, RoundOption } from "@/lib/calibration";
import { Photo } from "@/components/photo";
import { Eyebrow } from "@/components/ui";

function Itinerary({ it }: { it: NonNullable<RoundOption["itinerary"]> }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3 ring-1 ring-hair-2 sm:p-4">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint sm:mb-3 sm:text-[11px]">
        {it.label}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-center">
          <div className="font-display text-base leading-none sm:text-lg">{it.depart}</div>
          <div className="mt-1 text-[9.5px] uppercase tracking-wide text-faint sm:text-[10.5px]">Dep</div>
        </div>
        <div className="flex-1">
          <div className="relative h-px bg-hair">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-surface-2 px-1.5 text-[9.5px] text-muted sm:px-2 sm:text-[10.5px]">
              {it.duration} · {it.stops}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="font-display text-base leading-none sm:text-lg">{it.arrive}</div>
          <div className="mt-1 text-[9.5px] uppercase tracking-wide text-faint sm:text-[10.5px]">Arr</div>
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
        <Photo
          image={option.image}
          ratio="4/3"
          width={800}
          rounded="rounded-none"
          className="h-[76px] !aspect-auto sm:h-auto sm:!aspect-[4/3]"
        />
      ) : option.itinerary ? (
        <div className="p-3 pb-0 sm:p-5 sm:pb-0">
          <Itinerary it={option.itinerary} />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-[17px] tracking-[-0.02em] sm:text-xl">{option.title}</h3>
          <span
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] transition sm:h-6 sm:w-6 sm:text-[13px] ${
              selected ? "border-accent bg-accent text-[#f3f6f1]" : "border-hair text-transparent"
            }`}
            aria-hidden
          >
            ✓
          </span>
        </div>
        <ul className="mt-2 grid gap-1 sm:mt-3 sm:gap-1.5">
          {option.points.slice(0, 3).map((p) => (
            <li key={p} className="flex items-start gap-1.5 text-[12.5px] leading-snug text-ink-soft sm:gap-2 sm:text-[14.5px]">
              <span aria-hidden className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent sm:mt-[7px]" />
              {p}
            </li>
          ))}
        </ul>
        {option.more && (
          <div className="mt-2 sm:mt-3">
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
              className="text-[12px] font-medium text-accent sm:text-[13px]"
            >
              {more ? "Less" : "See more"}
            </span>
            {more && <p className="disclose mt-2 text-[12.5px] text-muted sm:text-[13.5px]">{option.more}</p>}
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
  index: number;
  total: number;
  selected: ChoiceValue | null;
  onSelect: (v: ChoiceValue) => void;
  onBack?: () => void;
}) {
  return (
    <div className="mx-auto max-w-[880px] px-4 py-4 sm:px-5 sm:py-8 md:py-14">
      <div className="mb-3 flex items-center justify-between sm:mb-5 md:mb-6">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-[12.5px] font-medium text-muted transition hover:text-ink sm:text-[13px]"
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

      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-hair-2 sm:mb-6 md:mb-8" aria-hidden>
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <h1 className="mb-4 max-w-[22ch] font-display text-[24px] leading-[1.03] tracking-[-0.035em] sm:mb-6 sm:text-[clamp(26px,4.5vw,40px)] md:mb-7">
        {round.question}
      </h1>

      <div className="grid gap-2.5 sm:gap-4 md:grid-cols-2">
        <OptionCard option={round.a} selected={selected === "A"} onSelect={() => onSelect("A")} />
        <OptionCard option={round.b} selected={selected === "B"} onSelect={() => onSelect("B")} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
        <button
          onClick={() => onSelect("depends")}
          aria-pressed={selected === "depends"}
          className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition sm:px-4 sm:py-2 sm:text-[13.5px] ${
            selected === "depends" ? "border-accent bg-accent-tint text-accent" : "border-hair text-muted hover:border-ink"
          }`}
        >
          It depends
        </button>
        <button
          onClick={() => onSelect("none")}
          aria-pressed={selected === "none"}
          className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition sm:px-4 sm:py-2 sm:text-[13.5px] ${
            selected === "none" ? "border-accent bg-accent-tint text-accent" : "border-hair text-muted hover:border-ink"
          }`}
        >
          No preference
        </button>
      </div>
    </div>
  );
}
