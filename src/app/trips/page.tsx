"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { tripDates, tripDestination } from "@/lib/cowork";
import { TripStatusStrip } from "@/components/trip-status";
import { Button, buttonClass, EmptyState, PrototypeBadge } from "@/components/ui";
import type { Trip } from "@/lib/types";

function TripRow({ trip }: { trip: Trip }) {
  const destination = tripDestination(trip);
  const flight = trip.componentStates.flight;
  const stay = trip.componentStates.stay;
  const flightChosen = flight !== "undecided";
  const stayChosen = stay !== "undecided";
  const coreChosen = flightChosen && stayChosen;
  const booked = Number(flight === "confirmed") + Number(stay === "confirmed");
  const primaryHref = coreChosen ? `/trips/${trip.id}/home` : `/trips/${trip.id}/workspace`;
  const planningLabel = booked === 2 ? "Core booked" : coreChosen ? "Core decisions set" : flightChosen || stayChosen ? "One core decision left" : "Planning";

  return <article className="rounded-[22px] border border-hair bg-surface p-5 transition hover:border-ink/20 hover:shadow-[var(--shadow-card)]">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-faint">{planningLabel}</span><span className="text-[11px] text-faint">· {trip.travelers} traveler{trip.travelers===1?"":"s"} · updated {new Date(trip.updatedAt).toLocaleDateString()}</span></div>
        <h3 className="truncate font-display text-[24px] font-semibold tracking-[-0.03em]">{trip.name}</h3>
        <p className="mt-1 text-[13px] text-muted">{destination} · {tripDates(trip)}</p>
        <div className="mt-4"><TripStatusStrip trip={trip} compact/></div>
      </div>
      <div className="flex shrink-0 items-center gap-2"><Link href={primaryHref} className={buttonClass("ink","sm")}>{coreChosen?"Open trip":"Continue planning"} →</Link></div>
    </div>
  </article>;
}

export default function TripsPage() {
  const store = useStore();
  const router = useRouter();
  if (!store.hydrated) return <div className="mx-auto max-w-[1000px] px-5 py-10"><div className="mb-6 h-10 w-56 rounded-lg shimmer"/><div className="grid gap-4"><div className="h-28 rounded-card shimmer"/><div className="h-28 rounded-card shimmer"/></div></div>;
  const trips = Object.values(store.trips).sort((a,b)=>+new Date(b.updatedAt)-+new Date(a.updatedAt));

  return <div className="mx-auto max-w-[1000px] px-5 py-10 md:py-12">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-3"><p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">Everything you’re planning</p><PrototypeBadge/></div><h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">Your Trips</h1><p className="mt-2 text-[13.5px] text-muted">Every trip uses the same status language, so you can see what is decided before opening it.</p></div><Button variant="ink" onClick={()=>router.push("/")}>+ New trip</Button></header>
    {trips.length===0?<EmptyState title="No trips yet" body="Describe a trip you’re thinking about — even a vague one — and I’ll turn it into a brief and a short, opinionated set of decisions." action={<Link href="/" className={buttonClass("ink","sm")}>Start a trip →</Link>}/>:<div className="grid gap-4">{trips.map((trip)=><TripRow key={trip.id} trip={trip}/>)}</div>}
  </div>;
}
