"use client";

import { useParams } from "next/navigation";
import { useTrip } from "@/lib/store";
import { TripBrief } from "@/components/brief";
import { PrototypeBadge } from "@/components/ui";

export default function BriefPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, hydrated } = useTrip(tripId);

  if (!hydrated || !trip) {
    return (
      <div className="grid gap-4">
        <div className="h-8 w-64 rounded-lg shimmer" />
        <div className="h-40 rounded-card shimmer" />
        <div className="h-40 rounded-card shimmer" />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-7 max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Here&apos;s what I understood
          </p>
          <PrototypeBadge />
        </div>
        <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">Your Trip Brief</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          This is what I took from{" "}
          <span className="editorial text-ink">&ldquo;{trip.originalPrompt}&rdquo;</span> — plus a
          little of what I already know. Change the importance of anything, edit it, or add a detail.
          Nothing is locked.
        </p>
      </header>
      <TripBrief trip={trip} />
    </div>
  );
}
