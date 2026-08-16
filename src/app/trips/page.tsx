"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button, buttonClass, EmptyState, PrototypeBadge } from "@/components/ui";
import type { Trip } from "@/lib/types";

function StateChip({ label, done = false, watch = false }: { label: string; done?: boolean; watch?: boolean }) {
  const cls = done ? "bg-[#dfe9df] text-[#34523b]" : watch ? "bg-accent-tint text-accent" : "bg-paper-2 text-muted";
  return <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${cls}`}>{label}</span>;
}

function TripRow({ trip }: { trip: Trip }) {
  const selected = trip.destinationProposals.find((p) => p.id === trip.selectedProposalId);
  const flight = trip.componentStates.flight;
  const stay = trip.componentStates.stay;
  const secured = Number(flight === "confirmed") + Number(stay === "confirmed");
  const primaryHref = trip.selectedProposalId ? `/trips/${trip.id}/home` : `/trips/${trip.id}/brief`;
  const planningLabel = trip.selectedProposalId ? (secured === 2 ? "Core booked" : secured === 1 ? "Partially booked" : "Planning") : "Choosing a direction";

  return (
    <article className="rounded-[22px] border border-hair bg-surface p-5 transition hover:border-ink/20 hover:shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2"><span className="text-[10.5px] font-semibold uppercase tracking-[0.11em] text-faint">{planningLabel}</span><span className="text-[11.5px] text-faint">· {trip.travelers} travelers · updated {new Date(trip.updatedAt).toLocaleDateString()}</span></div>
          <h3 className="truncate font-display text-[24px] font-semibold tracking-[-0.03em]">{trip.name}</h3>
          <p className="mt-1 max-w-[65ch] truncate text-[13.5px] text-muted">{selected ? `${selected.destination} — ${selected.conceptTitle}` : trip.originalPrompt}</p>
          {selected && (
            <div className="mt-4 flex flex-wrap gap-2">
              <StateChip label={flight === "confirmed" ? "Flights booked" : flight === "tracked" ? "Flight tracking" : "Flights not booked"} done={flight === "confirmed"} watch={flight === "tracked"} />
              <StateChip label={stay === "confirmed" ? "Stay booked" : "Stay not booked"} done={stay === "confirmed"} />
              <StateChip label={`${secured}/2 core secured`} done={secured === 2} />
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2"><Link href={primaryHref} className={buttonClass("ink", "sm")}>{selected ? "Open trip" : "Continue"} →</Link></div>
      </div>
    </article>
  );
}

export default function TripsPage() {
  const store = useStore();
  const router = useRouter();
  if (!store.hydrated) return <div className="mx-auto max-w-[1000px] px-5 py-10"><div className="mb-6 h-10 w-56 rounded-lg shimmer" /><div className="grid gap-4"><div className="h-28 rounded-card shimmer" /><div className="h-28 rounded-card shimmer" /></div></div>;
  const trips = Object.values(store.trips).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-10 md:py-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-3"><p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">Everything you&apos;re planning</p><PrototypeBadge /></div><h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">Your Trips</h1><p className="mt-2 text-[13.5px] text-muted">See what&apos;s booked without opening every trip.</p></div><Button variant="ink" onClick={() => router.push("/")}>+ New trip</Button></header>
      {trips.length === 0 ? <EmptyState title="No trips yet" body="Describe a trip you're thinking about — even a vague one — and I'll turn it into a brief and a short, opinionated shortlist." action={<Link href="/" className={buttonClass("ink", "sm")}>Start a trip →</Link>} /> : <div className="grid gap-4">{trips.map((trip) => <TripRow key={trip.id} trip={trip} />)}</div>}
    </div>
  );
}
