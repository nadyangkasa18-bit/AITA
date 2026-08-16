"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button, buttonClass, Card, EmptyState, PrototypeBadge } from "@/components/ui";
import type { Trip, TripStatus } from "@/lib/types";

const STATUS_COPY: Record<TripStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-paper-2 text-ink-soft" },
  proposing: { label: "Choosing a direction", cls: "bg-amber-tint text-amber" },
  "version-selected": { label: "Planning", cls: "bg-accent-tint text-accent" },
  booked: { label: "Core bookings done", cls: "bg-[#dcebdc] text-[#24522c]" },
};

function BookingChip({ children, done = false, watch = false }: { children: React.ReactNode; done?: boolean; watch?: boolean }) {
  const cls = done ? "bg-[#dcebdc] text-[#24522c]" : watch ? "bg-accent-tint text-accent" : "bg-paper-2 text-muted";
  return <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${cls}`}>{children}</span>;
}

function TripRow({ trip }: { trip: Trip }) {
  const selected = trip.destinationProposals.find((p) => p.id === trip.selectedProposalId);
  const status = STATUS_COPY[trip.status];
  const primaryHref = trip.selectedProposalId ? `/trips/${trip.id}/home` : `/trips/${trip.id}/brief`;
  const flight = trip.componentStates.flight;
  const stay = trip.componentStates.stay;

  return (
    <Card className="p-5 md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${status.cls}`}>{trip.lifecycle === "partially-booked" ? "Partially booked" : status.label}</span>
            <span className="text-[11.5px] text-faint">updated {new Date(trip.updatedAt).toLocaleDateString()}</span>
          </div>
          <h3 className="truncate font-display text-[24px] font-semibold tracking-[-0.03em]">{trip.name}</h3>
          <p className="mt-1 max-w-[62ch] truncate text-[13.5px] text-muted">{selected ? `${selected.destination} — ${selected.conceptTitle}` : trip.originalPrompt}</p>

          {selected && (
            <div className="mt-4 flex flex-wrap gap-2">
              <BookingChip done={flight === "confirmed"} watch={flight === "tracked"}>{flight === "confirmed" ? "✓ Flight booked" : flight === "tracked" ? "Flight tracked" : "Flight not booked"}</BookingChip>
              <BookingChip done={stay === "confirmed"} watch={stay === "saved"}>{stay === "confirmed" ? "✓ Stay booked" : stay === "saved" ? "Stay saved" : "Stay not booked"}</BookingChip>
              <BookingChip>{trip.itineraryDraft ? "Itinerary started" : "Itinerary optional"}</BookingChip>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!trip.selectedProposalId && <Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ghost", "sm")}>Compare directions</Link>}
          <Link href={primaryHref} className={buttonClass("ink", "sm")}>Open trip →</Link>
        </div>
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
        <div className="grid gap-4"><div className="h-32 rounded-card shimmer" /><div className="h-32 rounded-card shimmer" /></div>
      </div>
    );
  }

  const trips = Object.values(store.trips).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-10 md:py-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">Everything you&apos;re planning</p>
            <PrototypeBadge />
          </div>
          <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">Your Trips</h1>
          <p className="mt-2 max-w-[54ch] text-[13.5px] leading-relaxed text-muted">See what each trip already has without turning travel into a completion checklist.</p>
        </div>
        <Button variant="ink" onClick={() => router.push("/")}>+ New trip</Button>
      </header>

      {trips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          body="Describe a trip you're thinking about — even a vague one — and I'll turn it into a brief and a short, opinionated shortlist."
          action={<Link href="/" className={buttonClass("ink", "sm")}>Start a trip →</Link>}
        />
      ) : (
        <div className="grid gap-4">{trips.map((trip) => <TripRow key={trip.id} trip={trip} />)}</div>
      )}
    </div>
  );
}
