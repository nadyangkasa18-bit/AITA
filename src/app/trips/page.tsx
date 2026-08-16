"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button, buttonClass, Card, EmptyState, PrototypeBadge } from "@/components/ui";
import type { Trip, TripStatus } from "@/lib/types";

const STATUS_COPY: Record<TripStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-paper-2 text-ink-soft" },
  proposing: { label: "Choosing a direction", cls: "bg-amber-tint text-amber" },
  "version-selected": { label: "Version building", cls: "bg-accent-tint text-accent" },
  booked: { label: "Booked", cls: "bg-accent text-[#f3f6f1]" },
};

function TripRow({ trip }: { trip: Trip }) {
  const selected = trip.destinationProposals.find((p) => p.id === trip.selectedProposalId);
  const status = STATUS_COPY[trip.status];
  const primaryHref = trip.selectedProposalId
    ? `/trips/${trip.id}/home`
    : `/trips/${trip.id}/brief`;
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.cls}`}>
            {status.label}
          </span>
          <span className="text-[12px] text-faint">
            {trip.travelers} travelers · updated {new Date(trip.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="truncate font-display text-xl tracking-[-0.02em]">{trip.name}</h3>
        <p className="mt-1 max-w-[60ch] truncate text-[14px] text-muted">
          {selected ? `${selected.destination} — ${selected.conceptTitle}` : trip.originalPrompt}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ghost", "sm")}>
          Destinations
        </Link>
        <Link href={primaryHref} className={buttonClass("ink", "sm")}>
          Open →
        </Link>
      </div>
    </Card>
  );
}

export default function TripsPage() {
  const store = useStore();
  const router = useRouter();

  if (!store.hydrated) {
    return (
      <div className="mx-auto max-w-[1000px] px-5 py-10">
        <div className="mb-6 h-10 w-56 rounded-lg shimmer" />
        <div className="grid gap-4">
          <div className="h-28 rounded-card shimmer" />
          <div className="h-28 rounded-card shimmer" />
        </div>
      </div>
    );
  }

  const trips = Object.values(store.trips).sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
  );

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-10 md:py-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
              Everything you&apos;re planning
            </p>
            <PrototypeBadge />
          </div>
          <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">Your Trips</h1>
        </div>
        <Button variant="ink" onClick={() => router.push("/")}>
          + New trip
        </Button>
      </header>

      {trips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          body="Describe a trip you're thinking about — even a vague one — and I'll turn it into a brief and a short, opinionated shortlist."
          action={
            <Link href="/" className={buttonClass("ink", "sm")}>
              Start a trip →
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {trips.map((t) => (
            <TripRow key={t.id} trip={t} />
          ))}
        </div>
      )}
    </div>
  );
}
