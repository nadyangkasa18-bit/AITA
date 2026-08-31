"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TripStatusIcon, tripStatusItems } from "@/components/trip-status";
import type { ProfileState, Trip } from "@/lib/types";
import {
  flightOptions,
  profileBrain,
  stayOptions,
  tripDates,
  tripDestination,
  type CoworkState,
  type FolderView,
} from "@/lib/cowork";

export type WorkspaceSection = "brief" | "flights" | "hotel" | "ask";

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const tabClass = (active: boolean) =>
  `min-w-0 rounded-full px-3 py-2 text-[10.5px] font-semibold transition ${
    active ? "bg-ink text-paper shadow-sm" : "text-muted hover:bg-white/80 hover:text-ink"
  }`;

function StatusPill({ status }: { status: string }) {
  const cls = status === "Booked" || status === "Complete"
    ? "bg-[#e7f1e8] text-[#35543c]"
    : status === "Tracked" || status === "Selected"
      ? "bg-accent-tint text-accent"
      : "bg-surface-2 text-muted";
  return <span className={`rounded-full px-2.5 py-1 text-[8.5px] font-semibold ${cls}`}>{status}</span>;
}

function SummaryView({ trip, cowork }: { trip: Trip; cowork: CoworkState }) {
  const destination = tripDestination(trip);
  const flights = flightOptions(destination);
  const stays = stayOptions(destination, cowork.fixedEvents);
  const selectedFlight = flights.find((item) => item.id === cowork.selectedFlightId);
  const selectedStay = stays.find((item) => item.id === cowork.selectedStayId);
  const status = tripStatusItems(trip);
  const secondary = status.filter((item) => !["flight", "stay"].includes(item.key));

  return (
    <div className="space-y-4">
      <section className="rounded-[18px] border border-hair bg-white/76 p-4">
        <p className="text-[8.5px] font-semibold uppercase tracking-[.12em] text-faint">Trip</p>
        <h3 className="mt-1 font-display text-[21px] font-semibold tracking-[-.03em]">{destination}</h3>
        <p className="mt-1 text-[10.5px] text-muted">{tripDates(trip)} · {trip.travelers} traveler{trip.travelers === 1 ? "" : "s"}</p>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2"><span className="text-[8.5px] font-semibold uppercase tracking-[.12em] text-faint">Core decisions</span><div className="h-px flex-1 bg-hair-2"/></div>
        <div className="space-y-2">
          <article className="rounded-[16px] border border-hair bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-surface-2 text-[13px]">✈</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2"><div><p className="text-[8px] font-semibold uppercase tracking-[.1em] text-faint">Flight</p><p className="mt-1 truncate text-[12px] font-semibold">{selectedFlight ? `${selectedFlight.airline} · ${selectedFlight.route}` : "No flight chosen yet"}</p></div><StatusPill status={cowork.flightStatus}/></div>
                {selectedFlight && <p className="mt-2 text-[9.5px] text-muted">{selectedFlight.depart} → {selectedFlight.arrive} · {selectedFlight.stops}</p>}
              </div>
            </div>
          </article>

          <article className="rounded-[16px] border border-hair bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-surface-2 text-[13px]">⌂</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2"><div><p className="text-[8px] font-semibold uppercase tracking-[.1em] text-faint">Stay</p><p className="mt-1 truncate text-[12px] font-semibold">{selectedStay ? selectedStay.name : "No stay chosen yet"}</p></div><StatusPill status={cowork.stayStatus}/></div>
                {selectedStay && <p className="mt-2 text-[9.5px] text-muted">{selectedStay.area} · {selectedStay.room}</p>}
              </div>
            </div>
          </article>
        </div>
      </section>

      {cowork.fixedEvents.length > 0 && <section><div className="mb-2 flex items-center gap-2"><span className="text-[8.5px] font-semibold uppercase tracking-[.12em] text-faint">Fixed events</span><div className="h-px flex-1 bg-hair-2"/></div><div className="space-y-2">{cowork.fixedEvents.slice(0, 3).map((event) => <div key={event.id} className="rounded-[13px] bg-[#f6efe3] px-3 py-2.5"><p className="text-[10px] font-semibold text-[#6e5033]">{event.title}</p><p className="mt-0.5 text-[8.5px] text-[#886c50]">{event.place} · {event.when}</p></div>)}</div></section>}

      <section>
        <div className="mb-2 flex items-center gap-2"><span className="text-[8.5px] font-semibold uppercase tracking-[.12em] text-faint">Trip status</span><div className="h-px flex-1 bg-hair-2"/></div>
        <div className="grid grid-cols-2 gap-2">{secondary.map((item) => <div key={item.key} className="rounded-[14px] border border-hair bg-white/70 p-3"><TripStatusIcon item={item} showLabel/></div>)}</div>
      </section>

      <Link href={`/trips/${trip.id}/home`} className="block rounded-full border border-hair bg-white px-4 py-2.5 text-center text-[10.5px] font-semibold transition hover:border-ink/25">Open trip overview →</Link>
    </div>
  );
}

function AirportMap({ trip }: { trip: Trip }) {
  const destination = tripDestination(trip);
  const la = /los angeles|california/i.test(destination);
  const tokyo = /tokyo|japan/i.test(destination);
  const airport = la ? { code: "LAX", name: "Los Angeles International", x: 22, y: 68 } : tokyo ? { code: "HND", name: "Haneda Airport", x: 72, y: 62 } : { code: "AIR", name: `${destination.split(",")[0]} airport`, x: 28, y: 67 };
  return <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-3"><div className="relative min-h-[360px] overflow-hidden rounded-[19px] border border-hair bg-[#e9e5da]"><div className="absolute inset-0 opacity-55" style={{backgroundImage:"linear-gradient(rgba(45,43,38,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(45,43,38,.08) 1px,transparent 1px)",backgroundSize:"32px 32px"}}/><div className="absolute left-[14%] top-[24%] h-px w-[74%] rotate-[15deg] bg-[#cbc5b7]"/><div className="absolute left-[16%] top-[62%] h-px w-[72%] -rotate-[11deg] bg-[#cbc5b7]"/><div className="absolute left-[64%] top-[30%] rounded-full bg-white/86 px-2.5 py-1 text-[8.5px] font-semibold text-muted">City center</div>{la && <div className="absolute left-[47%] top-[35%] rounded-full bg-[#f6efe3] px-2.5 py-1 text-[8.5px] font-semibold text-[#7c5a35]">UCLA</div>}<div className="group absolute -translate-x-1/2 -translate-y-1/2" style={{left:`${airport.x}%`,top:`${airport.y}%`}}><span className="block h-4 w-4 rounded-full border-[3px] border-white bg-accent shadow"/><span className="mt-1 block -translate-x-[35%] whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[9px] font-semibold text-paper">{airport.code}</span><div className="pointer-events-none absolute left-1/2 top-[-54px] hidden w-[170px] -translate-x-1/2 rounded-[11px] bg-white p-2.5 text-[9px] shadow-[var(--shadow-card)] group-hover:block"><b>{airport.name}</b><p className="mt-1 text-faint">Arrival airport used by the flight choices.</p></div></div><div className="absolute bottom-3 left-3 rounded-full bg-white/82 px-2.5 py-1 text-[8px] font-semibold text-faint backdrop-blur">Flight context · illustrative</div></div><div className="rounded-[15px] border border-hair bg-white p-3.5"><p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Flight context</p><p className="mt-1 text-[10px] leading-relaxed text-muted">The drawer follows the decision on the left: flights show the arrival airport; stays show the hotel options.</p></div></div>;
}

function StayMap({ trip, cowork, setCowork }: { trip: Trip; cowork: CoworkState; setCowork: (next: CoworkState) => void }) {
  const destination = tripDestination(trip);
  const stays = stayOptions(destination, cowork.fixedEvents);
  const selected = stays.find((item) => item.id === cowork.selectedStayId) ?? stays[0];
  const la = /los angeles|california/i.test(destination);
  return <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-3"><div className="relative min-h-[360px] overflow-hidden rounded-[19px] border border-hair bg-[#e9e5da]"><div className="absolute inset-0 opacity-55" style={{backgroundImage:"linear-gradient(rgba(45,43,38,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(45,43,38,.08) 1px,transparent 1px)",backgroundSize:"32px 32px"}}/><div className="absolute left-[8%] top-[18%] h-px w-[86%] rotate-[18deg] bg-[#cbc5b7]"/><div className="absolute left-[16%] top-[58%] h-px w-[76%] -rotate-[12deg] bg-[#cbc5b7]"/>{la && <><span className="absolute left-[23%] top-[31%] rounded-full bg-[#f6efe3] px-2.5 py-1 text-[8.5px] font-semibold text-[#7c5a35]">UCLA</span><span className="absolute left-[43%] top-[47%] rounded-full bg-[#f6efe3] px-2.5 py-1 text-[8.5px] font-semibold text-[#7c5a35]">Century City</span></>}{stays.map((stay)=>{const active=stay.id===selected.id;return <button key={stay.id} onClick={()=>setCowork({...cowork,selectedStayId:stay.id})} className="group absolute -translate-x-1/2 -translate-y-1/2 text-left" style={{left:`${stay.map.x}%`,top:`${stay.map.y}%`}} aria-label={`Preview ${stay.name}`}><span className={`block h-3.5 w-3.5 rounded-full border-[2.5px] border-white shadow ${active?"bg-accent":"bg-ink-soft"}`}/><span className={`mt-1 block -translate-x-[40%] whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-semibold ${active?"bg-ink text-paper":"bg-white/92 text-muted"}`}>{stay.area}</span><span className="pointer-events-none absolute left-1/2 top-[-68px] hidden w-[175px] -translate-x-1/2 rounded-[11px] border border-hair bg-white p-2.5 shadow-[var(--shadow-card)] group-hover:block"><b className="block truncate text-[9.5px]">{stay.name}</b><span className="mt-1 block text-[9px] font-semibold">{IDR.format(stay.price)}</span><span className="mt-1 block text-[8px] text-faint">Click to preview on the left</span></span></button>})}<div className="absolute bottom-3 left-3 rounded-full bg-white/82 px-2.5 py-1 text-[8px] font-semibold text-faint backdrop-blur">Hotel options · prototype prices</div></div><div className="rounded-[15px] border border-hair bg-white p-3.5"><p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Previewing</p><div className="mt-1 flex items-start justify-between gap-3"><div><p className="text-[11px] font-semibold">{selected.name}</p><p className="mt-0.5 text-[9px] text-muted">{selected.area} · {IDR.format(selected.price)}</p></div><span className="rounded-full bg-accent-tint px-2 py-1 text-[8px] font-semibold text-accent">Map linked</span></div></div></div>;
}

function ContextView({ cowork, profile }: { cowork: CoworkState; profile: ProfileState }) {
  const currentItems = cowork.brain.slice(-5).reverse();
  const profileItems = profileBrain(profile).slice(0, 3);
  return <div className="space-y-4"><section><p className="text-[8.5px] font-semibold uppercase tracking-[.11em] text-faint">This trip</p><div className="mt-2 space-y-2">{currentItems.length?currentItems.map((entry)=><article key={entry.id} className="rounded-[13px] border border-hair bg-white p-3"><p className="text-[8px] font-semibold uppercase tracking-[.08em] text-faint">{entry.category}</p><p className="mt-1 text-[10.5px] font-medium leading-snug">{entry.statement}</p></article>):<div className="rounded-[13px] border border-dashed border-hair p-3 text-[9.5px] leading-relaxed text-muted">Trip-specific context will appear here as you make choices or correct assumptions.</div>}</div></section>{profileItems.length>0&&<section><p className="text-[8.5px] font-semibold uppercase tracking-[.11em] text-faint">From your profile</p><div className="mt-2 space-y-2">{profileItems.map((entry)=><div key={entry.id} className="rounded-[12px] bg-white/68 p-2.5"><p className="text-[8px] font-semibold uppercase tracking-[.08em] text-faint">{entry.category}</p><p className="mt-1 text-[9.5px] leading-snug">{entry.statement}</p></div>)}</div></section>}<Link href="/profile/preferences" className="inline-flex text-[10px] font-semibold text-accent">Manage traveler preferences →</Link></div>;
}

function TripPrompt({ cowork, setCowork }: { cowork: CoworkState; setCowork: (next: CoworkState) => void }) {
  const [draft, setDraft] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setCowork({...cowork,brain:[...cowork.brain,{id:`context-${Date.now()}`,statement:text,category:"Trip context",scope:"this-trip",source:"trip"}]});
    setDraft("");
    setAcknowledged(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAcknowledged(false), 1100);
  };

  return <div className="shrink-0 border-t border-hair-2 bg-[rgba(248,246,240,.94)] px-4 py-3 backdrop-blur-xl">
    <div className={`mb-1.5 h-3 overflow-hidden transition-opacity duration-200 ${acknowledged?"opacity-100":"opacity-0"}`} aria-live="polite"><p className="text-[8.5px] font-semibold text-muted">Added to this trip ✓</p></div>
    <div className="flex items-center gap-2 rounded-full border border-hair bg-white p-1.5 pl-2 shadow-[0_12px_34px_-28px_rgba(27,26,23,.55)] transition focus-within:border-accent">
      <input value={draft} onChange={(e)=>setDraft(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&add()} placeholder="Add something that matters for this trip…" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[10.5px] outline-none placeholder:text-faint"/>
      <button onClick={add} disabled={!draft.trim()} className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper transition disabled:opacity-30" aria-label="Add trip context">→</button>
    </div>
  </div>;
}

export function WorkingFolderV2({
  trip,
  cowork,
  setCowork,
  profile,
  context,
  collapsed = false,
  mobile = false,
  onClose,
  onToggle,
}: {
  trip: Trip;
  cowork: CoworkState;
  setCowork: (next: CoworkState) => void;
  profile: ProfileState;
  context: WorkspaceSection;
  collapsed?: boolean;
  mobile?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}) {
  const status = tripStatusItems(trip);
  const setView = (view: FolderView) => setCowork({ ...cowork, folderView: view });
  const map = context === "flights" ? <AirportMap trip={trip}/> : <StayMap trip={trip} cowork={cowork} setCowork={setCowork}/>;
  const content = cowork.folderView==="plan" ? <SummaryView trip={trip} cowork={cowork}/> : cowork.folderView==="map" ? map : <ContextView cowork={cowork} profile={profile}/>;

  if (mobile) return <aside className="fixed inset-0 z-[85] flex min-h-0 flex-col overflow-hidden bg-[#f8f6f0]" aria-label="Trip summary"><header className="shrink-0 border-b border-hair-2 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.13em] text-faint">Trip summary</p><h2 className="mt-1 font-display text-[22px] font-semibold tracking-[-.03em]">What’s decided so far</h2></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-hair bg-white text-muted">×</button></div><div className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-paper-2/80 p-1">{[["plan","Summary"],["map","Map"],["brain","Context"]].map(([view,label])=><button key={view} onClick={()=>setView(view as FolderView)} className={tabClass(cowork.folderView===view)}>{label}</button>)}</div></header><div className="min-h-0 flex-1 overflow-y-auto p-5">{content}</div><TripPrompt cowork={cowork} setCowork={setCowork}/></aside>;

  return <aside className={`fixed bottom-4 right-0 top-[80px] z-40 hidden overflow-hidden rounded-l-[26px] border border-r-0 border-hair bg-[rgba(248,246,240,.97)] shadow-[0_22px_70px_-36px_rgba(27,26,23,.38)] backdrop-blur-xl transition-[width] duration-300 lg:flex ${collapsed?"w-[58px]":"w-[430px]"}`} aria-label="Trip summary drawer">
    {!collapsed && <div className="flex min-w-0 flex-1 flex-col"><header className="shrink-0 border-b border-hair-2 px-5 py-4"><p className="text-[8.5px] font-semibold uppercase tracking-[.13em] text-faint">Trip summary</p><h2 className="mt-1 font-display text-[20px] font-semibold tracking-[-.03em]">What’s decided so far</h2><div className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-paper-2/80 p-1">{[["plan","Summary"],["map","Map"],["brain","Context"]].map(([view,label])=><button key={view} onClick={()=>setView(view as FolderView)} className={tabClass(cowork.folderView===view)}>{label}</button>)}</div></header><div className="min-h-0 flex-1 overflow-y-auto p-4">{content}</div><TripPrompt cowork={cowork} setCowork={setCowork}/></div>}
    <div className="flex w-[58px] shrink-0 flex-col items-center border-l border-hair-2 bg-white/72 py-3"><button onClick={onToggle} className="mb-3 grid h-9 w-9 place-items-center rounded-[12px] border border-hair bg-white text-[13px] font-semibold text-muted transition hover:border-ink/25 hover:text-ink" aria-label={collapsed?"Open trip summary":"Collapse trip summary"}>{collapsed?"←":"→"}</button><div className="h-px w-7 bg-hair-2"/><div className="mt-3 flex flex-1 flex-col items-center gap-2.5">{status.map((item)=><TripStatusIcon key={item.key} item={item}/>)}</div><span className="mb-1 [writing-mode:vertical-rl] rotate-180 text-[8px] font-semibold uppercase tracking-[.12em] text-faint">Trip status</span></div>
  </aside>;
}
