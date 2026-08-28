"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Photo } from "@/components/photo";
import { WorkingFolderV2 } from "@/components/working-folder-v2";
import { TripStatusIcon, tripStatusItems } from "@/components/trip-status";
import { buttonClass } from "@/components/ui";
import {
  COWORK_STORAGE_KEY,
  defaultCoworkState,
  flightOptions,
  stayOptions,
  tripDates,
  tripDestination,
  type CoworkState,
} from "@/lib/cowork";
import { useTrip } from "@/lib/store";
import type { Trip } from "@/lib/types";

const IDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function loadCowork(trip: Trip): CoworkState {
  const fallback = defaultCoworkState(trip);
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(COWORK_STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Partial<CoworkState>>) : {};
    return { ...fallback, ...(all[trip.id] ?? {}) };
  } catch {
    return fallback;
  }
}

function persistCowork(tripId: string, value: CoworkState) {
  try {
    const raw = localStorage.getItem(COWORK_STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, CoworkState>) : {};
    localStorage.setItem(COWORK_STORAGE_KEY, JSON.stringify({ ...all, [tripId]: value }));
  } catch {
    /* prototype-only persistence */
  }
}

function DecisionCard({ eyebrow, title, detail, status, action, href }: { eyebrow: string; title: string; detail: string; status: string; action: string; href: string }) {
  const done = status === "Booked";
  const active = status === "Selected" || status === "Tracked" || status === "Watching";
  return <section className="rounded-[22px] border border-hair bg-white p-5 shadow-[0_16px_50px_-42px_rgba(27,26,23,.4)] sm:p-6">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[8.5px] font-semibold uppercase tracking-[.12em] text-faint">{eyebrow}</p><h3 className="mt-2 font-display text-[22px] font-semibold tracking-[-.03em]">{title}</h3></div><span className={`rounded-full px-2.5 py-1 text-[8.5px] font-semibold ${done?"bg-[#e7f1e8] text-[#35543c]":active?"bg-accent-tint text-accent":"bg-surface-2 text-muted"}`}>{status}</span></div>
    <p className="mt-3 text-[11px] leading-relaxed text-muted">{detail}</p>
    <Link href={href} className="mt-5 inline-flex text-[10.5px] font-semibold text-accent">{action} →</Link>
  </section>;
}

export function TripHome({ tripId }: { tripId: string }) {
  const { trip, store, hydrated } = useTrip(tripId);
  const [cowork, setCowork] = useState<CoworkState | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);

  useEffect(() => {
    if (!hydrated || !trip) return;
    setCowork(loadCowork(trip));
  }, [hydrated, trip]);

  if (!hydrated || !trip || !cowork) return <div className="mx-auto h-[70dvh] max-w-[1100px] rounded-[26px] shimmer"/>;

  const destination = tripDestination(trip);
  const flights = flightOptions(destination);
  const stays = stayOptions(destination, cowork.fixedEvents);
  const flight = flights.find((item)=>item.id===cowork.selectedFlightId) ?? (trip.trackedFlight ? flights.find((item)=>item.id===trip.trackedFlight?.id) : undefined) ?? flights[0];
  const stay = stays.find((item)=>item.id===cowork.selectedStayId) ?? stays[0];
  const flightChosen = trip.componentStates.flight !== "undecided" || cowork.flightStatus !== "Not started";
  const stayChosen = trip.componentStates.stay !== "undecided" || cowork.stayStatus !== "Not started";
  const coreChosen = flightChosen && stayChosen;
  const flightBooked = trip.componentStates.flight === "confirmed";
  const stayBooked = trip.componentStates.stay === "confirmed";
  const bothBooked = flightBooked && stayBooked;
  const proposal = trip.destinationProposals.find((item)=>item.id===trip.selectedProposalId) ?? trip.destinationProposals.find((item)=>item.destination.toLowerCase().includes(destination.split(",")[0].toLowerCase())) ?? trip.destinationProposals[0];
  const status = tripStatusItems(trip);
  const setCoworkPersisted = (next:CoworkState) => { persistCowork(trip.id,next); setCowork(next); };

  const headline = bothBooked ? "Your core trip is booked." : coreChosen ? "Your core trip is ready to review." : "Your trip is taking shape.";
  const body = bothBooked ? "Flights and stay are secured. Everything else can be added when it becomes useful." : coreChosen ? "The flight and stay decisions are set. Review them together before anything is purchased." : "Finish the flight and stay decisions, then this becomes the home for the trip.";

  return <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 sm:px-5 md:px-7 lg:pr-[78px]">
    <div className="mb-4 flex items-center justify-between gap-3"><Link href="/trips" className="text-[10.5px] font-semibold text-muted transition hover:text-ink">← All trips</Link><button onClick={()=>setMobileDrawer(true)} className="rounded-full border border-hair bg-white px-3 py-2 text-[10px] font-semibold lg:hidden">Trip summary</button></div>

    <section className="relative overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_24px_80px_-50px_rgba(27,26,23,.6)]">
      {proposal ? <Photo image={proposal.heroImage} ratio="hero" tone={proposal.heroTone} width={1700} rounded="rounded-none" priority className="h-[360px] w-full !aspect-auto opacity-72 md:h-[420px]"/> : <div className="h-[360px] bg-[linear-gradient(135deg,#2d3932,#5b554a)] md:h-[420px]"/>}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,.9)] via-[rgba(8,8,8,.18)] to-transparent"/>
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8"><div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/18 bg-black/18 px-3 py-1.5 text-[9px] font-semibold text-white/78 backdrop-blur">{tripDates(trip)}</span><span className="rounded-full border border-white/18 bg-black/18 px-3 py-1.5 text-[9px] font-semibold text-white/78 backdrop-blur">{trip.travelers} traveler{trip.travelers===1?"":"s"}</span></div><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-white/55">{destination}</p><h1 className="mt-2 max-w-[14ch] font-display text-[clamp(38px,6vw,64px)] font-semibold leading-[.95] tracking-[-.05em]">{headline}</h1><p className="mt-4 max-w-[58ch] text-[13px] leading-relaxed text-white/72">{body}</p></div>
    </section>

    <section className="mt-7 grid gap-4 lg:grid-cols-[1fr_1fr]">
      <DecisionCard eyebrow="Flight" title={flightChosen?`${flight.airline} · ${flight.route}`:"Flight not chosen yet"} detail={flightChosen?`${flight.depart} → ${flight.arrive} · ${flight.duration} · ${flight.stops}`:"Return to the decision workspace to choose or track a flight."} status={flightBooked?"Booked":cowork.flightStatus} href={`/trips/${trip.id}/workspace`} action={flightChosen?"Review flight choice":"Choose a flight"}/>
      <DecisionCard eyebrow="Stay" title={stayChosen?stay.name:"Stay not chosen yet"} detail={stayChosen?`${stay.area} · ${stay.room} · ${IDR.format(stay.price)} full stay`:"Return to the decision workspace to compare the stay options on the map."} status={stayBooked?"Booked":cowork.stayStatus} href={`/trips/${trip.id}/workspace`} action={stayChosen?"Review stay choice":"Choose a stay"}/>
    </section>

    <section className="mt-7 rounded-[24px] border border-hair bg-[rgba(249,247,241,.68)] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-faint">Trip status</p><h2 className="mt-1 font-display text-[26px] font-semibold tracking-[-.035em]">What’s done, and what can wait</h2><p className="mt-2 max-w-[62ch] text-[11px] leading-relaxed text-muted">Only the core decisions need to block you. Entry, connectivity, protection and itinerary planning stay visible without pretending they are urgent.</p></div>{coreChosen?<Link href={`/trips/${trip.id}/booking-plan`} className={buttonClass("ink","sm")}>Review booking plan →</Link>:<Link href={`/trips/${trip.id}/workspace`} className={buttonClass("ink","sm")}>Continue planning →</Link>}</div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{status.map((item)=><div key={item.key} className="rounded-[16px] border border-hair bg-white/76 p-4"><TripStatusIcon item={item} showLabel/>{item.key==="itinerary"&&coreChosen&&!trip.itineraryDraft&&<Link href={`/trips/${trip.id}/itinerary?handoff=otterway`} className="mt-3 inline-flex text-[9.5px] font-semibold text-accent">Draft itinerary →</Link>}</div>)}</div>
    </section>

    {coreChosen && <section className="mt-7 grid gap-4 md:grid-cols-[1.2fr_.8fr]"><div className="rounded-[24px] border border-hair bg-white p-5 sm:p-6"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-faint">Next useful step</p><h2 className="mt-2 font-display text-[25px] font-semibold tracking-[-.035em]">Turn the decisions into a trip you can use.</h2><p className="mt-2 max-w-[60ch] text-[11px] leading-relaxed text-muted">Once the core trip is chosen, OtterWay can sketch the first itinerary without inventing plans before you ask for them.</p><div className="mt-5 flex flex-wrap gap-2"><Link href={`/trips/${trip.id}/itinerary?handoff=otterway`} className={buttonClass("ink","sm")}>{trip.itineraryDraft?"Open OtterWay itinerary":"Draft itinerary with AI"} →</Link><Link href={`/trips/${trip.id}/travelers`} className={buttonClass("ghost","sm")}>Invite travelers</Link></div></div><div className="rounded-[24px] bg-[#20201d] p-5 text-white sm:p-6"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-white/45">Trip summary drawer</p><h3 className="mt-2 font-display text-[21px] font-semibold tracking-[-.03em]">The status rail stays with the trip.</h3><p className="mt-2 text-[10.5px] leading-relaxed text-white/60">Open it any time to see the latest decisions, map context and trip-specific notes without leaving this page.</p><button onClick={()=>setDrawerOpen(true)} className="mt-4 rounded-full border border-white/18 px-3 py-2 text-[9.5px] font-semibold text-white/80">Open trip summary →</button></div></section>}

    <WorkingFolderV2 trip={trip} cowork={cowork} setCowork={setCoworkPersisted} profile={store.profile} context={stayChosen?"hotel":flightChosen?"flights":"brief"} collapsed={!drawerOpen} onToggle={()=>setDrawerOpen(!drawerOpen)}/>
    {mobileDrawer&&<WorkingFolderV2 trip={trip} cowork={cowork} setCowork={setCoworkPersisted} profile={store.profile} context={stayChosen?"hotel":flightChosen?"flights":"brief"} mobile onClose={()=>setMobileDrawer(false)}/>} 
  </div>;
}
