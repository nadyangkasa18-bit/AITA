"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { buttonClass, Card, EmptyState, PrototypeBadge, RecommendationLabel } from "@/components/ui";

export default function SavedPage() {
  const store = useStore();

  if (!store.hydrated) {
    return (
      <div className="mx-auto max-w-[1000px] px-5 py-10">
        <div className="mb-6 h-10 w-56 rounded-lg shimmer" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-40 rounded-card shimmer" />
          <div className="h-40 rounded-card shimmer" />
        </div>
      </div>
    );
  }

  const saved = Object.values(store.trips).flatMap((trip) =>
    trip.destinationProposals
      .filter((p) => trip.savedProposalIds.includes(p.id))
      .map((p) => ({ trip, proposal: p }))
  );

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-10 md:py-12">
      <header className="mb-7">
        <div className="mb-2 flex items-center gap-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Directions you&apos;ve kept
          </p>
          <PrototypeBadge />
        </div>
        <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">Saved</h1>
      </header>

      {saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          body="When a destination direction feels right, save it and it lands here — across all your trips, easy to compare later."
          action={
            <Link href="/trips" className={buttonClass("ink", "sm")}>
              Go to your trips →
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {saved.map(({ trip, proposal }) => (
            <Card key={`${trip.id}-${proposal.id}`} className="flex flex-col p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <RecommendationLabel type={proposal.recommendationType} />
                <span className="text-[12px] text-faint">{trip.name}</span>
              </div>
              <h3 className="font-display text-xl tracking-[-0.02em]">{proposal.destination}</h3>
              <p className="mt-1 text-[14px] text-muted">{proposal.conceptTitle}</p>
              <p className="mt-2 font-display text-sm tracking-[-0.01em] text-ink-soft">
                {proposal.indicativePrice}
              </p>
              <div className="mt-auto pt-4">
                <Link
                  href={`/trips/${trip.id}/destinations/${proposal.id}`}
                  className={buttonClass("ghost", "sm")}
                >
                  Open proposal →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
