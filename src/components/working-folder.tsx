"use client";

import Link from "next/link";
import type { ProfileState, Trip } from "@/lib/types";
import { flightOptions, profileBrain, stayOptions, tripDates, tripDestination, type CoworkState, type FolderView } from "@/lib/cowork";

const tabClass = (active: boolean) => `rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${active ? "bg-ink text-paper" : "text-muted hover:bg-white hover:text-ink"}`;

function Status({ children }: { children: string }) {
  const tone = children === "Booked" || children === "Complete" ? "bg-[#e7f1e8] text-[#35543c]" : children === "Tracked" ? "bg-[#eeedf8] text-[#4a4f91]" : children === "Selected" ? "bg-accent-tint text-accent" : "bg-surface-2 text-muted";
  return <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${tone}`}>{children}</span>;
}

function PlanView({ trip, cowork, setCowork }: { trip: Trip; cowork: CoworkState; setCowork: (next: CoworkState) => void }) {
  const destination = tripDestination(trip);
  const flights = flightOptions(destination);
  const stays = stayOptions(destination, cowork.fixedEvents);
  const selectedFlight = flights.find((item) => item.id === cowork.selectedFlightId);
  const selectedStay = stays.find((item) => item.id === cowork.selectedStayId);

  const moveFree = (day: number) => setCowork({ ...cowork, flexibleDay: day });

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-hair bg-white/70 p-4">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-faint">Trip foundations</p><h3 className="mt-1 font-display text-[19px] font-semibold tracking-[-.025em]">{destination}</h3><p className="mt-1 text-[11px] text-muted">{tripDates(trip)} · {trip.travelers} traveler{trip.travelers === 1 ? "" : "s"}</p></div><span className="rounded-full border border-hair bg-white px-2.5 py-1 text-[9.5px] font-semibold text-muted">{trip.lifecycle.replace("-", " ")}</span></div>
      </div>

      <section>
        <div className="mb-2 flex items-center gap-2"><span className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-faint">Plan</span><div className="h-px flex-1 bg-hair-2" /></div>
        <div className="space-y-2">
          <article className="rounded-[15px] border border-hair bg-white p-3.5">
            <div className="flex items-start gap-3"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-surface-2 text-[12px]">✈</span><div className="min-w-0 flex-1"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Flight</p><p className="mt-0.5 truncate text-[12px] font-semibold text-ink">{selectedFlight ? `${selectedFlight.airline} · ${selectedFlight.route}` : `Flight to ${destination.split(",")[0]}`}</p><p className="mt-1 text-[10.5px] text-muted">{selectedFlight ? `${selectedFlight.depart} → ${selectedFlight.arrive} · ${selectedFlight.stops}` : "Undecided — recommendation will appear on the left"}</p></div><Status>{cowork.flightStatus}</Status></div>
          </article>
          <article className="rounded-[15px] border border-hair bg-white p-3.5">
            <div className="flex items-start gap-3"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-surface-2 text-[12px]">⌂</span><div className="min-w-0 flex-1"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Stay</p><p className="mt-0.5 truncate text-[12px] font-semibold text-ink">{selectedStay ? selectedStay.name : "Hotel area undecided"}</p><p className="mt-1 text-[10.5px] text-muted">{selectedStay ? `${selectedStay.area} · ${selectedStay.room}` : "AITA will reason from fixed events and the rest of the trip"}</p></div><Status>{cowork.stayStatus}</Status></div>
          </article>
          {cowork.fixedEvents.map((event) => <article key={event.id} className="rounded-[15px] border border-[#d9c9b1] bg-[#f6efe3] p-3.5"><div className="flex items-start gap-3"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-white/70 text-[12px]">●</span><div className="min-w-0 flex-1"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Fixed event</p><p className="mt-0.5 text-[12px] font-semibold text-ink">{event.title}</p><p className="mt-1 text-[10.5px] text-muted">{event.place} · {event.when}</p></div><span className="text-[9px] font-semibold text-[#7c5a35]">Fixed</span></div></article>)}
          <article draggable onDragStart={(event) => event.dataTransfer.setData("text/free-time", "free")} className="cursor-grab rounded-[15px] border border-dashed border-hair bg-white/45 p-3.5 active:cursor-grabbing"><div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Flexible placeholder</p><p className="mt-0.5 text-[12px] font-semibold text-ink">Free afternoon · Day {cowork.flexibleDay}</p></div><span className="text-[10px] text-faint">⋮⋮</span></div></article>
        </div>
      </section>

      {cowork.stage === "review" && <section><div className="mb-2 flex items-center gap-2"><span className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-faint">Days</span><div className="h-px flex-1 bg-hair-2" /></div><div className="grid grid-cols-3 gap-2">{[1,2,3].map((day) => <button key={day} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { if (event.dataTransfer.getData("text/free-time")) moveFree(day); }} onClick={() => moveFree(day)} className={`rounded-[13px] border px-2 py-3 text-[10.5px] font-semibold ${cowork.flexibleDay === day ? "border-accent bg-accent-tint text-accent" : "border-hair bg-white text-muted"}`}>Day {day}{cowork.flexibleDay === day ? <span className="mt-1 block text-[9px] font-normal">Free afternoon</span> : null}</button>)}</div></section>}

      <Link href={`/trips/${trip.id}/itinerary?handoff=otterway`} className="block rounded-full border border-hair bg-white px-4 py-2.5 text-center text-[11px] font-semibold text-ink transition hover:border-ink/30">Open full itinerary →</Link>
    </div>
  );
}

function MapView({ trip, cowork }: { trip: Trip; cowork: CoworkState }) {
  const destination = tripDestination(trip);
  const stays = stayOptions(destination, cowork.fixedEvents);
  const selected = stays.find((item) => item.id === cowork.selectedStayId) ?? stays[0];
  const la = /los angeles|california/i.test(destination);
  return (
    <div>
      <div className="relative aspect-[4/5] min-h-[360px] overflow-hidden rounded-[20px] border border-hair bg-[#e9e5da]">
        <div className="absolute inset-0 opacity-55" style={{ backgroundImage: "linear-gradient(rgba(45,43,38,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(45,43,38,.08) 1px,transparent 1px)", backgroundSize: "34px 34px" }} />
        <div className="absolute left-[8%] top-[18%] h-px w-[86%] rotate-[18deg] bg-[#cbc5b7]" /><div className="absolute left-[16%] top-[58%] h-px w-[76%] -rotate-[12deg] bg-[#cbc5b7]" />
        {la && <><span className="absolute left-[23%] top-[32%] rounded-full bg-[#f6efe3] px-2.5 py-1 text-[9px] font-semibold text-[#7c5a35]">UCLA</span><span className="absolute left-[40%] top-[48%] rounded-full bg-[#f6efe3] px-2.5 py-1 text-[9px] font-semibold text-[#7c5a35]">Century City</span><span className="absolute left-[65%] top-[58%] text-[9px] font-semibold text-faint">Downtown</span></>}
        {stays.map((stay) => <div key={stay.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${stay.map.x}%`, top: `${stay.map.y}%` }}><span className={`block h-3 w-3 rounded-full border-2 border-white shadow ${stay.id === selected.id ? "bg-accent" : "bg-ink-soft"}`} /><span className={`mt-1 block -translate-x-[42%] whitespace-nowrap rounded-full px-2 py-1 text-[8.5px] font-semibold ${stay.id === selected.id ? "bg-ink text-paper" : "bg-white/90 text-muted"}`}>{stay.area}</span></div>)}
        <div className="absolute bottom-3 left-3 rounded-full bg-white/80 px-2.5 py-1 text-[8.5px] font-semibold text-faint backdrop-blur">Illustrative map · prototype travel times</div>
      </div>
      <div className="mt-4 rounded-[16px] border border-hair bg-white p-4"><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Why this area</p><p className="mt-1 text-[12px] font-semibold text-ink">{selected.area}</p><p className="mt-2 text-[11px] leading-relaxed text-muted">{selected.why}</p><div className="mt-3 space-y-1">{selected.eventTimes.map((time) => <p key={time} className="text-[10.5px] text-ink-soft">↗ {time}</p>)}</div></div>
    </div>
  );
}

function BrainView({ trip, cowork, profile, setCowork }: { trip: Trip; cowork: CoworkState; profile: ProfileState; setCowork: (next: CoworkState) => void }) {
  const profileItems = profileBrain(profile);
  return (
    <div className="space-y-5">
      <section><p className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-faint">Current-trip context</p><div className="mt-2 space-y-2">{cowork.brain.length === 0 ? <p className="rounded-[14px] border border-dashed border-hair p-4 text-[11px] text-muted">AITA will collect small, confirmed trip-specific preferences here as you make decisions.</p> : cowork.brain.map((entry) => <article key={entry.id} className="rounded-[14px] border border-hair bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.09em] text-faint">{entry.category}</p><p className="mt-1 text-[11.5px] font-medium leading-snug text-ink">{entry.statement}</p></div><select value={entry.scope} onChange={(event) => setCowork({ ...cowork, brain: cowork.brain.map((item) => item.id === entry.id ? { ...item, scope: event.target.value as "this-trip" | "similar" | "all" } : item) })} className="rounded-full border border-hair bg-surface-2 px-2 py-1 text-[9px] font-semibold text-muted outline-none"><option value="this-trip">This trip only</option><option value="similar">Trips like this</option><option value="all">All trips</option></select></div></article>)}</div></section>
      <section><p className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-faint">Traveler Profile</p><p className="mt-1 text-[10.5px] leading-relaxed text-muted">Only preferences you explicitly chose to keep beyond this trip appear here.</p><div className="mt-2 space-y-2">{profileItems.length ? profileItems.map((entry) => <article key={entry.id} className="rounded-[14px] border border-hair bg-white/70 p-3"><p className="text-[9px] font-semibold uppercase tracking-[.09em] text-faint">{entry.category}</p><p className="mt-1 text-[11.5px] font-medium text-ink">{entry.statement}</p><p className="mt-1 text-[9.5px] text-faint">{entry.scope === "all" ? "All trips" : entry.scope === "similar" ? "Trips like this" : "This trip only"}</p></article>) : <p className="rounded-[14px] border border-dashed border-hair p-4 text-[11px] text-muted">No reusable preferences saved yet. You can keep using AITA without building a profile.</p>}</div></section>
      <Link href="/calibrate" className="inline-flex text-[11px] font-semibold text-accent">Improve my recommendations →</Link>
    </div>
  );
}

export function WorkingFolder({ trip, cowork, setCowork, profile, mobile = false, onClose }: { trip: Trip; cowork: CoworkState; setCowork: (next: CoworkState) => void; profile: ProfileState; mobile?: boolean; onClose?: () => void }) {
  const setView = (view: FolderView) => setCowork({ ...cowork, folderView: view });
  return (
    <aside className={`${mobile ? "fixed inset-0 z-[85] bg-[#f8f6f0]" : "sticky top-[80px] h-[calc(100dvh-96px)] rounded-[24px] border border-hair bg-[rgba(248,246,240,.92)]"} flex min-h-0 flex-col overflow-hidden shadow-[var(--shadow-card)]`} aria-label="Trip working folder">
      <header className="shrink-0 border-b border-hair-2 px-4 py-4 sm:px-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[9.5px] font-semibold uppercase tracking-[.13em] text-faint">Working folder</p><h2 className="mt-1 font-display text-[20px] font-semibold tracking-[-.025em]">Your trip, while you decide</h2></div>{mobile && <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-hair bg-white text-lg text-muted" aria-label="Close trip folder">×</button>}</div><div className="mt-3 flex items-center gap-1 rounded-full bg-paper-2/70 p-1">{(["plan","map","brain"] as FolderView[]).map((view) => <button key={view} onClick={() => setView(view)} className={tabClass(cowork.folderView === view)}>{view === "brain" ? "Trip Brain" : view[0].toUpperCase() + view.slice(1)}</button>)}</div></header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">{cowork.folderView === "plan" ? <PlanView trip={trip} cowork={cowork} setCowork={setCowork} /> : cowork.folderView === "map" ? <MapView trip={trip} cowork={cowork} /> : <BrainView trip={trip} cowork={cowork} profile={profile} setCowork={setCowork} />}</div>
    </aside>
  );
}
