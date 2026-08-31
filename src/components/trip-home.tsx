"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Photo } from "@/components/photo";
import { WorkingFolderV2 } from "@/components/working-folder-v2";
import { TripStatusIcon, tripStatusItems } from "@/components/trip-status";
import { Button, SidePanel, buttonClass, useToast } from "@/components/ui";
import {
  COWORK_STORAGE_KEY,
  defaultCoworkState,
  flightOptions,
  replacePromptField,
  stayOptions,
  tripDates,
  tripDestination,
  type CoworkState,
} from "@/lib/cowork";
import { useTrip } from "@/lib/store";
import type { Trip, TripComponentState, TripFlightSegment } from "@/lib/types";

const IDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const HOME_AIRPORT = "Jakarta (CGK)";

function loadCowork(trip: Trip): CoworkState {
  const fallback = defaultCoworkState(trip);
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(COWORK_STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Partial<CoworkState>>) : {};
    const stored = all[trip.id] ?? {};
    return {
      ...fallback,
      ...stored,
      selectedFlightId: trip.selectedFlightId ?? stored.selectedFlightId ?? fallback.selectedFlightId,
      selectedStayId: trip.selectedStayId ?? stored.selectedStayId ?? fallback.selectedStayId,
    };
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

function componentLabel(state: TripComponentState) {
  if (state === "confirmed") return "Booked";
  if (state === "tracked") return "Watching";
  if (state === "saved") return "Saved";
  if (state === "needs-review") return "Needs re-check";
  return "Not chosen";
}

function DecisionCard({ eyebrow, title, detail, status, action, secondaryAction, href }: { eyebrow: string; title: string; detail: string; status: string; action: string; secondaryAction?: string; href: string }) {
  const done = status === "Booked";
  const needsReview = status === "Needs re-check";
  const active = status === "Saved" || status === "Tracked" || status === "Watching" || needsReview;
  return <section className="rounded-[22px] border border-hair bg-white p-5 shadow-[0_16px_50px_-42px_rgba(27,26,23,.4)] sm:p-6">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[8.5px] font-semibold uppercase tracking-[.12em] text-faint">{eyebrow}</p><h3 className="mt-2 font-display text-[22px] font-semibold tracking-[-.03em]">{title}</h3></div><span className={`rounded-full px-2.5 py-1 text-[8.5px] font-semibold ${done?"bg-[#e7f1e8] text-[#35543c]":needsReview?"bg-[#f5ead8] text-[#8a6125]":active?"bg-accent-tint text-accent":"bg-surface-2 text-muted"}`}>{status}</span></div>
    <p className="mt-3 text-[11px] leading-relaxed text-muted">{detail}</p>
    <div className="mt-5 flex flex-wrap items-center gap-3"><Link href={href} className="inline-flex text-[10.5px] font-semibold text-accent">{action} →</Link>{secondaryAction&&<span className="text-[9.5px] text-faint">{secondaryAction}</span>}</div>
  </section>;
}

function segmentStatus(state: TripComponentState) {
  if (state === "confirmed") return "Booked";
  if (state === "tracked") return "Watching";
  if (state === "needs-review") return "Needs re-check";
  if (state === "saved") return "Saved";
  return "Not chosen";
}

function buildMultiCitySegments(stops: string[], trip: Trip): TripFlightSegment[] {
  const points = [HOME_AIRPORT, ...stops, HOME_AIRPORT];
  const existing = trip.flightSegments ?? [];
  return points.slice(0, -1).map((from, index) => {
    const to = points[index + 1];
    const matched = existing.find((segment) => segment.from === from && segment.to === to);
    if (matched) return matched;
    const first = index === 0;
    return {
      id: `leg-${index + 1}-${Date.now().toString(36)}`,
      from,
      to,
      label: `${from} → ${to}`,
      status: first ? trip.componentStates.flight : "undecided",
      selectedFlightId: first ? (trip.selectedFlightId ?? trip.trackedFlight?.id ?? null) : null,
      savedFlightIds: first ? (trip.savedFlightIds ?? []) : [],
      trackedFlightIds: first && trip.trackedFlight ? [trip.trackedFlight.id] : [],
    };
  });
}

export function TripHome({ tripId }: { tripId: string }) {
  const { trip, store, hydrated } = useTrip(tripId);
  const { toast } = useToast();
  const [cowork, setCowork] = useState<CoworkState | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editReview, setEditReview] = useState(false);
  const [destinationDraft, setDestinationDraft] = useState("");
  const [datesDraft, setDatesDraft] = useState("");
  const [stopOpen, setStopOpen] = useState(false);
  const [stopDraft, setStopDraft] = useState("");

  useEffect(() => {
    if (!hydrated || !trip) return;
    setCowork(loadCowork(trip));
  }, [hydrated, trip]);

  if (!hydrated || !trip || !cowork) return <div className="mx-auto h-[70dvh] max-w-[1100px] rounded-[26px] shimmer"/>;

  const destination = tripDestination(trip);
  const flights = flightOptions(destination);
  const stays = stayOptions(destination, cowork.fixedEvents);
  const flightId = trip.selectedFlightId ?? cowork.selectedFlightId ?? trip.trackedFlight?.id ?? null;
  const stayId = trip.selectedStayId ?? cowork.selectedStayId ?? null;
  const flight = flights.find((item)=>item.id===flightId) ?? (trip.trackedFlight ? { ...flights[0], id: trip.trackedFlight.id, airline: trip.trackedFlight.airline, route: trip.trackedFlight.route, depart: trip.trackedFlight.depart, arrive: trip.trackedFlight.arrive, duration: trip.trackedFlight.duration, stops: trip.trackedFlight.stops } : undefined) ?? flights[0];
  const stay = stays.find((item)=>item.id===stayId) ?? stays[0];
  const flightChosen = trip.componentStates.flight !== "undecided" || Boolean(flightId) || cowork.flightStatus !== "Not started";
  const stayChosen = trip.componentStates.stay !== "undecided" || Boolean(stayId) || cowork.stayStatus !== "Not started";
  const segments = trip.flightSegments ?? [];
  const multiCityIncomplete = segments.length > 0 && segments.some((segment) => segment.status !== "confirmed");
  const coreChosen = flightChosen && stayChosen;
  const flightBooked = trip.componentStates.flight === "confirmed" && !multiCityIncomplete;
  const stayBooked = trip.componentStates.stay === "confirmed";
  const bothBooked = flightBooked && stayBooked;
  const proposal = trip.destinationProposals.find((item)=>item.id===trip.selectedProposalId) ?? trip.destinationProposals.find((item)=>item.destination.toLowerCase().includes(destination.split(",")[0].toLowerCase())) ?? trip.destinationProposals[0];
  const status = tripStatusItems(trip);
  const setCoworkPersisted = (next:CoworkState) => { persistCowork(trip.id,next); setCowork(next); };
  const stops = cowork.destinationStops.length ? cowork.destinationStops : destination === "Destination open" ? [] : [destination];
  const savedFlightLabels = (trip.savedFlightIds ?? []).map((id) => flights.find((item) => item.id === id)?.airline ?? (trip.trackedFlight?.id === id ? trip.trackedFlight.airline : id));
  const savedStayLabels = (trip.savedStayIds ?? []).map((id) => stays.find((item) => item.id === id)?.name ?? id);

  const headline = bothBooked ? "Your core trip is booked." : coreChosen ? "Your core trip is ready to manage." : "Your trip is taking shape.";
  const body = bothBooked ? "Flights and stay are secured. Manage them here without reopening the original decision flow." : coreChosen ? "Your saved decisions stay attached to this trip. Re-search, track prices or change a product without rebuilding the brief." : "Finish the flight and stay decisions, then this becomes the home for the trip.";

  const openTripEdit = () => {
    setDestinationDraft(destination === "Destination open" ? "" : destination);
    setDatesDraft(tripDates(trip) === "Dates flexible" ? "Flexible" : tripDates(trip));
    setEditReview(false);
    setEditOpen(true);
  };

  const applyTripEdit = () => {
    const nextDestination = destinationDraft.trim() || destination;
    const nextDates = datesDraft.trim() || "Flexible";
    let prompt = replacePromptField(trip.originalPrompt, "Destination", nextDestination);
    prompt = replacePromptField(prompt, "Dates", nextDates);
    const nextFlightState: TripComponentState = trip.componentStates.flight === "confirmed" ? "confirmed" : flightChosen ? "needs-review" : "undecided";
    const nextStayState: TripComponentState = trip.componentStates.stay === "confirmed" ? "confirmed" : stayChosen ? "needs-review" : "undecided";
    const nextStops = stops.length ? [nextDestination, ...stops.slice(1)] : [nextDestination];
    const nextSegments = segments.map((segment, index) => ({ ...segment, ...(index === 0 ? { to: nextStops[0], label: `${segment.from} → ${nextStops[0]}` } : {}), status: segment.status === "confirmed" ? "confirmed" as const : "needs-review" as const }));
    store.patchTrip(trip.id, {
      originalPrompt: prompt,
      name: `${nextStops.join(" + ")} · trip`,
      componentStates: { ...trip.componentStates, flight: nextFlightState, stay: nextStayState },
      flightSegments: nextSegments,
    });
    setCoworkPersisted({ ...cowork, destinationStops: nextStops, flightStatus: nextFlightState === "confirmed" ? "Booked" : nextFlightState === "needs-review" ? "Needs review" : cowork.flightStatus, stayStatus: nextStayState === "confirmed" ? "Booked" : nextStayState === "needs-review" ? "Needs review" : cowork.stayStatus });
    setEditOpen(false);
    toast("Trip details updated. Existing confirmed bookings stayed protected; affected saved choices are marked for re-check.");
  };

  const addStop = () => {
    const stop = stopDraft.trim();
    if (!stop) return;
    const nextStops = Array.from(new Set([...stops, stop]));
    const nextSegments = buildMultiCitySegments(nextStops, trip);
    store.patchTrip(trip.id, { flightSegments: nextSegments, componentStates: { ...trip.componentStates, flight: "needs-review" } });
    setCoworkPersisted({ ...cowork, destinationStops: nextStops, flightStatus: "Needs review" });
    setStopDraft("");
    setStopOpen(false);
    toast(`${stop} added to this trip. The itinerary stays together; each flight leg can now be decided separately.`);
  };

  return <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 sm:px-5 md:px-7 lg:pr-[78px]">
    <div className="mb-4 flex items-center justify-between gap-3"><Link href="/trips" className="text-[10.5px] font-semibold text-muted transition hover:text-ink">← All trips</Link><button onClick={()=>setMobileDrawer(true)} className="rounded-full border border-hair bg-white px-3 py-2 text-[10px] font-semibold lg:hidden">Trip summary</button></div>

    <section className="relative overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_24px_80px_-50px_rgba(27,26,23,.6)]">
      {proposal ? <Photo image={proposal.heroImage} ratio="hero" tone={proposal.heroTone} width={1700} rounded="rounded-none" priority className="h-[360px] w-full !aspect-auto opacity-72 md:h-[420px]"/> : <div className="h-[360px] bg-[linear-gradient(135deg,#2d3932,#5b554a)] md:h-[420px]"/>}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,.9)] via-[rgba(8,8,8,.18)] to-transparent"/>
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8"><div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/18 bg-black/18 px-3 py-1.5 text-[9px] font-semibold text-white/78 backdrop-blur">{tripDates(trip)}</span><span className="rounded-full border border-white/18 bg-black/18 px-3 py-1.5 text-[9px] font-semibold text-white/78 backdrop-blur">{trip.travelers} traveler{trip.travelers===1?"":"s"}</span></div><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-white/55">{stops.join(" · ") || destination}</p><h1 className="mt-2 max-w-[14ch] font-display text-[clamp(38px,6vw,64px)] font-semibold leading-[.95] tracking-[-.05em]">{headline}</h1><p className="mt-4 max-w-[58ch] text-[13px] leading-relaxed text-white/72">{body}</p></div>
    </section>

    <section className="mt-7 rounded-[24px] border border-hair bg-[rgba(249,247,241,.7)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-faint">Route & dates</p><h2 className="mt-1 font-display text-[26px] font-semibold tracking-[-.035em]">The trip structure</h2><p className="mt-2 max-w-[64ch] text-[11px] leading-relaxed text-muted">Change the foundation here. We show what the change affects before touching any saved or confirmed booking.</p></div><div className="flex flex-wrap gap-2"><Button variant="ghost" size="sm" onClick={openTripEdit}>Edit destination or dates</Button><Button variant="ghost" size="sm" onClick={()=>setStopOpen(true)}>+ Add destination</Button></div></div>
      <div className="mt-5 flex flex-wrap items-center gap-2"><span className="rounded-full border border-hair bg-white px-3 py-2 text-[10px] font-semibold">{HOME_AIRPORT}</span>{stops.map((stop)=><span key={stop} className="contents"><span className="text-faint">→</span><span className="rounded-full border border-hair bg-white px-3 py-2 text-[10px] font-semibold">{stop}</span></span>)}{segments.length>0&&<><span className="text-faint">→</span><span className="rounded-full border border-hair bg-white px-3 py-2 text-[10px] font-semibold">{HOME_AIRPORT}</span></>}</div>
      {segments.length>0&&<div className="mt-5 grid gap-2 md:grid-cols-3">{segments.map((segment)=><article key={segment.id} className="rounded-[16px] border border-hair bg-white p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-[8px] font-semibold uppercase tracking-[.1em] text-faint">Flight leg</p><p className="mt-1 text-[11px] font-semibold">{segment.from} → {segment.to}</p></div><span className={`rounded-full px-2 py-1 text-[8px] font-semibold ${segment.status==="confirmed"?"bg-[#e7f1e8] text-[#35543c]":segment.status==="needs-review"?"bg-[#f5ead8] text-[#8a6125]":"bg-surface-2 text-muted"}`}>{segmentStatus(segment.status)}</span></div><Link href={`/trips/${trip.id}/flights?segment=${encodeURIComponent(segment.id)}`} className="mt-3 inline-flex text-[9.5px] font-semibold text-accent">{segment.status==="confirmed"?"Manage / change":"Find flight"} →</Link></article>)}</div>}
    </section>

    <section className="mt-7 grid gap-4 lg:grid-cols-[1fr_1fr]">
      <DecisionCard eyebrow="Flight" title={flightChosen?`${flight.airline} · ${flight.route}`:"Flight not chosen yet"} detail={flightChosen?`${flight.depart} → ${flight.arrive} · ${flight.duration} · ${flight.stops}`:"Open the flight explorer for the opinionated shortlist, nearby dates, price watch and deeper search."} status={componentLabel(trip.componentStates.flight)} href={`/trips/${trip.id}/flights`} action={trip.componentStates.flight==="confirmed"?"Manage booked flight":trip.componentStates.flight==="tracked"?"Open price watch":flightChosen?"Review / find alternatives":"Choose a flight"} secondaryAction="Dates, airlines, stops and price history live here"/>
      <DecisionCard eyebrow="Stay" title={stayChosen?stay.name:"Stay not chosen yet"} detail={stayChosen?`${stay.area} · ${stay.room} · ${IDR.format(stay.price)} full stay`:"Open the stay explorer to review other properties, neighborhoods, room types and cancellation terms."} status={componentLabel(trip.componentStates.stay)} href={`/trips/${trip.id}/stays`} action={trip.componentStates.stay==="confirmed"?"Manage / change stay":stayChosen?"Review / find alternatives":"Choose a stay"} secondaryAction="Different hotel choices stay inside this trip"/>
    </section>

    {(savedFlightLabels.length>0||savedStayLabels.length>0||trip.trackedFlight)&&<section className="mt-7 rounded-[24px] border border-hair bg-white p-5 sm:p-6"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-faint">Saved & watching</p><div className="mt-4 grid gap-3 md:grid-cols-2">{(savedFlightLabels.length>0||trip.trackedFlight)&&<div className="rounded-[16px] bg-surface-2 p-4"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Flights</p><div className="mt-2 flex flex-wrap gap-2">{Array.from(new Set([...savedFlightLabels,...(trip.trackedFlight?[trip.trackedFlight.airline]:[])])).map((label)=><span key={label} className="rounded-full border border-hair bg-white px-3 py-1.5 text-[9.5px] font-semibold">{label}{trip.trackedFlight?.airline===label?" · watching":""}</span>)}</div><Link href={`/trips/${trip.id}/flights`} className="mt-3 inline-flex text-[9.5px] font-semibold text-accent">Open saved flights & price watch →</Link></div>}{savedStayLabels.length>0&&<div className="rounded-[16px] bg-surface-2 p-4"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Stays</p><div className="mt-2 flex flex-wrap gap-2">{savedStayLabels.map((label)=><span key={label} className="rounded-full border border-hair bg-white px-3 py-1.5 text-[9.5px] font-semibold">{label}</span>)}</div><Link href={`/trips/${trip.id}/stays`} className="mt-3 inline-flex text-[9.5px] font-semibold text-accent">Open saved stays →</Link></div>}</div></section>}

    <section className="mt-7 rounded-[24px] border border-hair bg-[rgba(249,247,241,.68)] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-faint">Trip status</p><h2 className="mt-1 font-display text-[26px] font-semibold tracking-[-.035em]">What’s done, and what can wait</h2><p className="mt-2 max-w-[62ch] text-[11px] leading-relaxed text-muted">Only the core decisions need to block you. Entry, connectivity, protection and itinerary planning stay visible without pretending they are urgent.</p></div>{coreChosen?<Link href={`/trips/${trip.id}/booking-plan`} className={buttonClass("ink","sm")}>Review booking plan →</Link>:<Link href={`/trips/${trip.id}/workspace`} className={buttonClass("ink","sm")}>Continue recommendations →</Link>}</div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{status.map((item)=><div key={item.key} className="rounded-[16px] border border-hair bg-white/76 p-4"><TripStatusIcon item={item} showLabel/>{item.key==="itinerary"&&coreChosen&&!trip.itineraryDraft&&<Link href={`/trips/${trip.id}/itinerary?handoff=otterway`} className="mt-3 inline-flex text-[9.5px] font-semibold text-accent">Draft itinerary →</Link>}</div>)}</div>
    </section>

    {coreChosen && <section className="mt-7 grid gap-4 md:grid-cols-[1.2fr_.8fr]"><div className="rounded-[24px] border border-hair bg-white p-5 sm:p-6"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-faint">Next useful step</p><h2 className="mt-2 font-display text-[25px] font-semibold tracking-[-.035em]">Turn the decisions into a trip you can use.</h2><p className="mt-2 max-w-[60ch] text-[11px] leading-relaxed text-muted">Once the core trip is chosen, OtterWay can sketch the first itinerary without inventing plans before you ask for them.</p><div className="mt-5 flex flex-wrap gap-2"><Link href={`/trips/${trip.id}/itinerary?handoff=otterway`} className={buttonClass("ink","sm")}>{trip.itineraryDraft?"Open OtterWay itinerary":"Draft itinerary with AI"} →</Link><Link href={`/trips/${trip.id}/travelers`} className={buttonClass("ghost","sm")}>Invite travelers</Link></div></div><div className="rounded-[24px] bg-[#20201d] p-5 text-white sm:p-6"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-white/45">Trip summary drawer</p><h3 className="mt-2 font-display text-[21px] font-semibold tracking-[-.03em]">The status rail stays with the trip.</h3><p className="mt-2 text-[10.5px] leading-relaxed text-white/60">Open it any time to see the latest decisions, map context and trip-specific notes without leaving this page.</p><button onClick={()=>setDrawerOpen(true)} className="mt-4 rounded-full border border-white/18 px-3 py-2 text-[9.5px] font-semibold text-white/80">Open trip summary →</button></div></section>}

    <SidePanel open={editOpen} onClose={()=>setEditOpen(false)} title={editReview?"Review trip changes":"Edit trip details"}>{!editReview?<><p className="text-[13px] leading-relaxed text-muted">Change the trip itself here. Product searches stay separate so looking for a different airline never sends you back to the brief.</p><label className="mt-5 block text-[11px] font-semibold text-muted">Destination<div className="composite-field-owner mt-2 rounded-[14px] border border-hair bg-white px-4 py-3 focus-within:border-accent"><input value={destinationDraft} onChange={(event)=>setDestinationDraft(event.target.value)} className="w-full bg-transparent text-[13px] outline-none" placeholder="Tokyo, Japan"/></div></label><label className="mt-4 block text-[11px] font-semibold text-muted">Dates<div className="composite-field-owner mt-2 rounded-[14px] border border-hair bg-white px-4 py-3 focus-within:border-accent"><input value={datesDraft} onChange={(event)=>setDatesDraft(event.target.value)} className="w-full bg-transparent text-[13px] outline-none" placeholder="Flexible, or Oct 22–27"/></div></label><Button variant="ink" className="mt-6 w-full" onClick={()=>setEditReview(true)}>Review what this affects →</Button></>:<><p className="text-[13px] leading-relaxed text-muted">Nothing changes silently. Your confirmed bookings stay protected; recommendations and watches that depend on the old destination or dates are flagged for a re-check.</p><div className="mt-5 grid gap-2"><div className="rounded-[14px] bg-surface-2 p-4"><p className="text-[9px] uppercase tracking-[.1em] text-faint">Trip</p><p className="mt-1 text-[12px] font-semibold">{destination} · {tripDates(trip)}</p><p className="mt-1 text-[11px] text-muted">→ {destinationDraft||destination} · {datesDraft||"Flexible"}</p></div><div className="rounded-[14px] border border-hair p-4"><p className="text-[11px] font-semibold">Flight</p><p className="mt-1 text-[11px] text-muted">{trip.componentStates.flight==="confirmed"?"Booked flight stays untouched. You can review eligible changes from Manage flight.":flightChosen?"Saved / watched flight stays visible but is marked Needs re-check.":"No flight decision to protect."}</p></div><div className="rounded-[14px] border border-hair p-4"><p className="text-[11px] font-semibold">Stay</p><p className="mt-1 text-[11px] text-muted">{trip.componentStates.stay==="confirmed"?"Booked stay stays untouched. Changes happen only after you review replacement terms.":stayChosen?"Saved stay stays visible but is marked Needs re-check.":"No stay decision to protect."}</p></div></div><div className="mt-6 flex gap-2"><Button variant="ghost" className="flex-1" onClick={()=>setEditReview(false)}>Back</Button><Button variant="ink" className="flex-1" onClick={applyTripEdit}>Apply trip changes</Button></div></>}</SidePanel>

    <SidePanel open={stopOpen} onClose={()=>setStopOpen(false)} title="Add another destination"><p className="text-[13px] leading-relaxed text-muted">Keep one itinerary and add the transport needed between stops. For example: Jakarta → Seoul → Tokyo → Jakarta becomes three independently manageable flight legs inside this trip.</p><label className="mt-5 block text-[11px] font-semibold text-muted">Next destination<div className="composite-field-owner mt-2 rounded-[14px] border border-hair bg-white px-4 py-3 focus-within:border-accent"><input value={stopDraft} onChange={(event)=>setStopDraft(event.target.value)} onKeyDown={(event)=>event.key==="Enter"&&addStop()} className="w-full bg-transparent text-[13px] outline-none" placeholder="Seoul, South Korea"/></div></label><div className="mt-4 flex flex-wrap gap-2">{["Seoul, South Korea","Tokyo, Japan","Singapore"].filter((item)=>!stops.includes(item)).map((item)=><button key={item} onClick={()=>setStopDraft(item)} className="rounded-full border border-hair bg-white px-3 py-2 text-[10px] font-semibold text-muted hover:border-ink/25 hover:text-ink">{item}</button>)}</div><Button variant="ink" className="mt-6 w-full" disabled={!stopDraft.trim()} onClick={addStop}>Add destination to this trip</Button></SidePanel>

    <WorkingFolderV2 trip={trip} cowork={cowork} setCowork={setCoworkPersisted} profile={store.profile} context={stayChosen?"hotel":flightChosen?"flights":"brief"} collapsed={!drawerOpen} onToggle={()=>setDrawerOpen(!drawerOpen)}/>
    {mobileDrawer&&<WorkingFolderV2 trip={trip} cowork={cowork} setCowork={setCoworkPersisted} profile={store.profile} context={stayChosen?"hotel":flightChosen?"flights":"brief"} mobile onClose={()=>setMobileDrawer(false)}/>} 
  </div>;
}
