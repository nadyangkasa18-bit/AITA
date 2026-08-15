"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Photo } from "@/components/photo";
import { Button, buttonClass, EmptyState, Eyebrow, PrototypeBadge } from "@/components/ui";
import type { DestinationProposal, Trip } from "@/lib/types";

type Saved = { trip: Trip; proposal: DestinationProposal };

const RECO: Record<string, string> = {
  top: "Top pick",
  easier: "Easier",
  wildcard: "Wildcard",
};

function CompareTable({ items }: { items: Saved[] }) {
  const cols = items.slice(0, 3);
  const rows: { label: string; get: (p: DestinationProposal) => string }[] = [
    { label: "Dates", get: (p) => p.recommendedWindow },
    { label: "Approx. total", get: (p) => p.indicativePrice },
    { label: "Flight", get: (p) => p.flightTime },
    {
      label: "Weather",
      get: (p) => p.externalSignals.find((s) => /weather/i.test(s.label))?.value ?? p.weatherComfort,
    },
    { label: "Getting around", get: () => "No car needed" },
    { label: "Resort fit", get: (p) => p.resortFit },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr>
            <th className="w-32 pb-4 align-bottom" />
            {cols.map(({ trip, proposal }) => (
              <th key={proposal.id} className="pb-4 pr-6 align-bottom">
                <Photo
                  image={proposal.heroImage}
                  ratio="4/3"
                  tone={proposal.heroTone}
                  width={520}
                  rounded="rounded-lg"
                />
                <div className="mt-2 font-display text-lg tracking-[-0.02em]">
                  {proposal.destination}
                </div>
                <Link
                  href={`/trips/${trip.id}/destinations/${proposal.id}`}
                  className="text-[13px] font-medium text-accent"
                >
                  Open →
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-hair-2 align-top">
              <th className="py-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
                {r.label}
              </th>
              {cols.map(({ proposal }) => (
                <td key={proposal.id} className="py-3 pr-6 text-[14px] text-ink-soft">
                  {r.get(proposal)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SavedPage() {
  const store = useStore();
  const [comparing, setComparing] = useState(false);

  if (!store.hydrated) {
    return (
      <div className="mx-auto max-w-[1180px] px-5 py-12 md:px-8">
        <div className="mb-6 h-10 w-56 rounded-lg shimmer" />
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="h-64 rounded-card shimmer" />
          <div className="h-64 rounded-card shimmer" />
        </div>
      </div>
    );
  }

  const saved: Saved[] = Object.values(store.trips).flatMap((trip) =>
    trip.destinationProposals
      .filter((p) => trip.savedProposalIds.includes(p.id))
      .map((p) => ({ trip, proposal: p }))
  );

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-12 md:px-8 md:py-16">
      <header className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Eyebrow>Directions you&apos;ve kept</Eyebrow>
            <PrototypeBadge />
          </div>
          <h1 className="font-display text-[clamp(30px,5vw,46px)] tracking-[-0.035em]">Saved ideas</h1>
        </div>
        {/* Compare is an intentional mode, only once there are 2+ ideas */}
        {saved.length >= 2 && (
          <Button variant={comparing ? "ink" : "ghost"} onClick={() => setComparing((c) => !c)}>
            {comparing ? "Back to ideas" : "Compare saved ideas"}
          </Button>
        )}
      </header>

      {saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          body="When a direction feels right, use “Save idea” on the proposal and it lands here — ready to revisit or compare later."
          action={
            <Link href="/trips" className={buttonClass("accent", "sm")}>
              Go to your trips →
            </Link>
          }
        />
      ) : comparing ? (
        <CompareTable items={saved} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {saved.map(({ trip, proposal }) => (
            <Link
              key={`${trip.id}-${proposal.id}`}
              href={`/trips/${trip.id}/destinations/${proposal.id}`}
              className="group overflow-hidden rounded-card border border-hair bg-surface transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
            >
              <Photo
                image={proposal.heroImage}
                ratio="4/3"
                tone={proposal.heroTone}
                width={900}
              />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-accent">
                    {RECO[proposal.recommendationType]}
                  </span>
                  <span className="text-[12px] text-faint">{proposal.recommendedWindow}</span>
                </div>
                <h2 className="mt-1.5 font-display text-2xl tracking-[-0.02em]">
                  {proposal.destination}
                </h2>
                <p className="mt-1 text-[14.5px] leading-snug text-muted">{proposal.thesis}</p>
                <div className="mt-3 font-display text-[15px] tracking-[-0.01em] text-ink-soft">
                  {proposal.indicativePrice}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
