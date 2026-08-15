"use client";

import Link from "next/link";
import { useState } from "react";
import type { DestinationProposal, FitReasons, RuledOut } from "@/lib/types";
import {
  buttonClass,
  Card,
  ConfidenceLabel,
  PrototypeBadge,
  RecommendationLabel,
  TradeoffNote,
} from "@/components/ui";

/* -------------------- Why this fits -------------------- */
export function WhyThisFits({ reasons }: { reasons: FitReasons }) {
  const cols: { key: keyof FitReasons; title: string; note: string }[] = [
    { key: "you", title: "You", note: "Long-term profile" },
    { key: "thisTrip", title: "This trip", note: "Your brief" },
    { key: "rightNow", title: "Right now", note: "Prototype context" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cols.map((c) => (
        <div key={c.key} className="rounded-lg border border-hair bg-surface-2 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[12.5px] font-semibold uppercase tracking-[0.1em] text-accent">
              {c.title}
            </span>
            <span className="text-[11px] text-faint">{c.note}</span>
          </div>
          <ul className="grid gap-2">
            {reasons[c.key].map((r) => (
              <li key={r} className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-soft">
                <span aria-hidden className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* -------------------- Fact line -------------------- */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hair-2 py-2.5 last:border-b-0">
      <span className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-faint">{label}</span>
      <span className="text-right text-[14px] text-ink-soft">{value}</span>
    </div>
  );
}

/* -------------------- Proposal card -------------------- */
export function DestinationProposalCard({
  tripId,
  proposal,
  saved,
  onToggleSave,
  featured,
}: {
  tripId: string;
  proposal: DestinationProposal;
  saved: boolean;
  onToggleSave: () => void;
  featured?: boolean;
}) {
  const href = `/trips/${tripId}/destinations/${proposal.id}`;
  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* hero */}
        <Link href={href} className="group relative block">
          <div
            className={`relative ${proposal.heroTone} ${featured ? "min-h-[280px]" : "min-h-[220px]"} h-full`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,22,18,0.55)] to-transparent" />
            <div className="absolute left-5 top-5">
              <RecommendationLabel type={proposal.recommendationType} />
            </div>
            <div className="absolute inset-x-5 bottom-5 text-white">
              <div className="text-[12px] uppercase tracking-[0.12em] opacity-85">{proposal.region}</div>
              <div className="font-display text-3xl tracking-[-0.03em]">{proposal.destination}</div>
              <div className="mt-1 text-[13px] opacity-90">{proposal.recommendedWindow}</div>
            </div>
          </div>
        </Link>

        {/* body */}
        <div className="p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <ConfidenceLabel confidence={proposal.confidence} />
            <PrototypeBadge />
          </div>
          <Link href={href}>
            <p className="editorial text-[19px] leading-snug text-ink hover:text-accent">
              {proposal.conceptTitle}
            </p>
          </Link>

          <div className="mt-4">
            <Fact label="Weather" value={proposal.weatherComfort} />
            <Fact label="Journey" value={proposal.journeyEffort} />
            <Fact label="Car-free" value={proposal.mobilityFit} />
            <Fact label="Resort fit" value={proposal.resortFit} />
            <Fact label="Indicative" value={proposal.indicativePrice} />
          </div>

          <div className="mt-4">
            {proposal.tradeoffs.slice(0, 1).map((t) => (
              <TradeoffNote key={t}>{t}</TradeoffNote>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href={href} className={buttonClass("ink", "sm")}>
              Open proposal →
            </Link>
            <button
              onClick={onToggleSave}
              className={`${buttonClass(saved ? "accent" : "ghost", "sm")}`}
              aria-pressed={saved}
            >
              {saved ? "Saved ✓" : "Save this direction"}
            </button>
          </div>
        </div>
      </div>

      {/* why this fits */}
      <div className="border-t border-hair px-6 py-5">
        <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
          Why this fits
        </p>
        <WhyThisFits reasons={proposal.fitReasons} />
      </div>
    </Card>
  );
}

/* -------------------- Ruled out -------------------- */
export function RuledOutSection({ items }: { items: RuledOut[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-card border border-hair bg-surface-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-lg tracking-[-0.02em]">What I ruled out</span>
        <span className="text-faint">{open ? "–" : "+"}</span>
      </button>
      {open && (
        <ul className="grid gap-3 px-6 pb-6">
          {items.map((r) => (
            <li key={r.place} className="text-[14.5px] text-ink-soft">
              <span className="font-semibold text-ink">{r.place}</span> — {r.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
