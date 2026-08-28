"use client";

import Link from "next/link";
import { useState } from "react";
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

export type WorkspaceSection = "brief" | "flights" | "hotel" | "review" | "ask";

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const tabClass = (active: boolean) =>
  `min-w-0 rounded-full px-3 py-2 text-[11px] font-semibold transition ${
    active ? "bg-ink text-paper shadow-sm" : "text-muted hover:bg-white/80 hover:text-ink"
  }`;

function Status({ children }: { children: string }) {
  const tone =
    children === "Booked" || children === "Complete"
      ? "bg-[#e7f1e8] text-[#35543c]"
      : children === "Tracked"
        ? "bg-[#eeedf8] text-[#4a4f91]"
        : children === "Selected"
          ? "bg-accent-tint text-accent"
          : "bg-surface-2 text-muted";
  return <span className={`rounded-full px-2.5 py-1 text-[8.5px] font-semibold ${tone}`}>{children}</span>;
}

function PlanView({ trip, cowork }: { trip: Trip; cowork: CoworkState }) {
  const destination = tripDestination(trip);
  const flights = flightOptions(destination);
  const stays = stayOptions(destination, cowork.fixedEvents);
  const selectedFlight = flights.find((item) => item.id === cowork.selectedFlightId);
  const selectedStay = stays.find((item) => item.id === cowork.selectedStayId);
  const flightChosen = cowork.flightStatus !== "Not started";
  const stayChosen = cowork.stayStatus !== "Not started";
  const coreChosen = flightChosen && stayChosen;

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-3">
      <div className="rounded-[17px] border border-hair bg-white/72 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[.12em] text-faint">Trip foundations</p>
            <h3 className="mt-1 truncate font-display text-[18px] font-semibold tracking-[-.025em]">{destination}</h3>
            <p className="mt-1 text-[10.5px] text-muted">{tripDates(trip)} · {trip.travelers} traveler{trip.travelers === 1 ? "" : "s"}</p>
          </div>
          <span className="rounded-full border border-hair bg-white px-2.5 py-1 text-[8.5px] font-semibold text-muted">{trip.lifecycle.replace("-", " ")}</span>
        </div>
      </div>

      <div className="min-h-0 space-y-2 overflow-hidden">
        <article className="rounded-[15px] border border-hair bg-white p-3.5">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-[12px]">✈</span>
            <div className="min-w-0 flex-1">
              <p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Flight</p>
              <p className="mt-0.5 truncate text-[11.5px] font-semibold text-ink">{selectedFlight ? `${selectedFlight.airline} · ${selectedFlight.route}` : `Flight to ${destination.split(",")[0]}`}</p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-muted">{selectedFlight ? `${selectedFlight.depart} → ${selectedFlight.arrive} · ${selectedFlight.stops}` : "No flight chosen yet"}</p>
            </div>
            <Status>{cowork.flightStatus}</Status>
          </div>
        </article>

        <article className="rounded-[15px] border border-hair bg-white p-3.5">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-[12px]">⌂</span>
            <div className="min-w-0 flex-1">
              <p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Stay</p>
              <p className="mt-0.5 truncate text-[11.5px] font-semibold text-ink">{selectedStay ? selectedStay.name : "Stay not chosen yet"}</p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-muted">{selectedStay ? `${selectedStay.area} · ${selectedStay.room}` : "Hotel options will stay linked to the map"}</p>
            </div>
            <Status>{cowork.stayStatus}</Status>
          </div>
        </article>

        {cowork.fixedEvents.slice(0, 2).map((event) => (
          <article key={event.id} className="rounded-[15px] border border-[#d9c9b1] bg-[#f6efe3] p-3.5">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-white/70 text-[10px]">●</span>
              <div className="min-w-0 flex-1">
                <p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Fixed event</p>
                <p className="mt-0.5 truncate text-[11.5px] font-semibold text-ink">{event.title}</p>
                <p className="mt-1 text-[9.5px] text-muted">{event.place} · {event.when}</p>
              </div>
              <span className="text-[8.5px] font-semibold text-[#7c5a35]">Fixed</span>
            </div>
          </article>
        ))}

        {!coreChosen && (
          <div className="rounded-[15px] border border-dashed border-hair bg-white/38 p-3.5">
            <p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Itinerary later</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">Once flight and stay are chosen, RoaminRabbit can sketch the flexible day-by-day plan. Nothing is invented before then.</p>
          </div>
        )}
      </div>

      {coreChosen ? (
        <Link href={`/trips/${trip.id}/itinerary?handoff=otterway`} className="block rounded-full border border-hair bg-white px-4 py-2.5 text-center text-[10.5px] font-semibold text-ink transition hover:border-ink/30">Open OtterWay itinerary →</Link>
      ) : (
        <p className="px-2 text-center text-[9px] leading-relaxed text-faint">Choose the core trip first. The itinerary will unlock when it has something real to organize.</p>
      )}
    </div>
  );
}

function AirportMap({ trip }: { trip: Trip }) {
  const destination = tripDestination(trip);
  const la = /los angeles|california/i.test(destination);
  const tokyo = /tokyo|japan/i.test(destination);
  const airport = la ? { code: "LAX", name: "Los Angeles International", x: 22, y: 68 } : tokyo ? { code: "HND", name: "Haneda Airport", x: 72, y: 62 } : { code: "AIR", name: `${destination.split(",")[0]} airport`, x: 28, y: 67 };
  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-3">
      <div className="relative min-h-0 overflow-hidden rounded-[19px] border border-hair bg-[#e9e5da]">
        <div className="absolute inset-0 opacity-55" style={{ backgroundImage: "linear-gradient(rgba(45,43,38,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(45,43,38,.08) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute left-[14%] top-[24%] h-px w-[74%] rotate-[15deg] bg-[#cbc5b7]" />
        <div className="absolute left-[16%] top-[62%] h-px w-[72%] -rotate-[11deg] bg-[#cbc5b7]" />
        <div className="absolute left-[64%] top-[30%] rounded-full bg-white/86 px-2.5 py-1 text-[8.5px] font-semibold text-muted">City center</div>
        {la && <div className="absolute left-[47%] top-[35%] rounded-full bg-[#f6efe3] px-2.5 py-1 text-[8.5px] font-semibold text-[#7c5a35]">UCLA</div>}
        <div className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${airport.x}%`, top: `${airport.y}%` }}>
          <span className="block h-4 w-4 rounded-full border-[3px] border-white bg-accent shadow" />
          <span className="mt-1 block -translate-x-[35%] whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[9px] font-semibold text-paper">{airport.code}</span>
          <div className="pointer-events-none absolute left-1/2 top-[-54px] hidden w-[170px] -translate-x-1/2 rounded-[11px] bg-white p-2.5 text-[9px] shadow-[var(--shadow-card)] group-hover:block">
            <b>{airport.name}</b><p className="mt-1 text-faint">Arrival airport used by the flight options on the left.</p>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-white/82 px-2.5 py-1 text-[8px] font-semibold text-faint backdrop-blur">Context map · illustrative prototype</div>
      </div>
      <div className="rounded-[15px] border border-hair bg-white p-3.5">
        <p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Flight context</p>
        <p className="mt-1 text-[11px] font-semibold">The map is showing the airport now.</p>
        <p className="mt-1 text-[9.5px] leading-relaxed text-muted">When you move to stays, these pins switch to hotel options so the right side always explains the decision on the left.</p>
      </div>
    </div>
  );
}

function StayMap({ trip, cowork, setCowork }: { trip: Trip; cowork: CoworkState; setCowork: (next: CoworkState) => void }) {
  const destination = tripDestination(trip);
  const stays = stayOptions(destination, cowork.fixedEvents);
  const selected = stays.find((item) => item.id === cowork.selectedStayId) ?? stays[0];
  const la = /los angeles|california/i.test(destination);

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-3">
      <div className="relative min-h-0 overflow-hidden rounded-[19px] border border-hair bg-[#e9e5da]">
        <div className="absolute inset-0 opacity-55" style={{ backgroundImage: "linear-gradient(rgba(45,43,38,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(45,43,38,.08) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute left-[8%] top-[18%] h-px w-[86%] rotate-[18deg] bg-[#cbc5b7]" />
        <div className="absolute left-[16%] top-[58%] h-px w-[76%] -rotate-[12deg] bg-[#cbc5b7]" />
        {la && <><span className="absolute left-[23%] top-[31%] rounded-full bg-[#f6efe3] px-2.5 py-1 text-[8.5px] font-semibold text-[#7c5a35]">UCLA</span><span className="absolute left-[43%] top-[47%] rounded-full bg-[#f6efe3] px-2.5 py-1 text-[8.5px] font-semibold text-[#7c5a35]">Century City</span></>}
        {stays.map((stay) => {
          const active = stay.id === selected.id;
          return (
            <button
              key={stay.id}
              onClick={() => setCowork({ ...cowork, selectedStayId: stay.id })}
              className="group absolute -translate-x-1/2 -translate-y-1/2 text-left"
              style={{ left: `${stay.map.x}%`, top: `${stay.map.y}%` }}
              aria-label={`Preview ${stay.name}`}
            >
              <span className={`block h-3.5 w-3.5 rounded-full border-[2.5px] border-white shadow ${active ? "bg-accent" : "bg-ink-soft"}`} />
              <span className={`mt-1 block -translate-x-[40%] whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-semibold ${active ? "bg-ink text-paper" : "bg-white/92 text-muted"}`}>{stay.area}</span>
              <span className="pointer-events-none absolute left-1/2 top-[-68px] hidden w-[175px] -translate-x-1/2 rounded-[11px] border border-hair bg-white p-2.5 shadow-[var(--shadow-card)] group-hover:block">
                <b className="block truncate text-[9.5px] text-ink">{stay.name}</b>
                <span className="mt-1 block text-[9px] font-semibold text-ink">{IDR.format(stay.price)}</span>
                <span className="mt-1 block text-[8px] text-faint">Click to preview this hotel on the left</span>
              </span>
            </button>
          );
        })}
        <div className="absolute bottom-3 left-3 rounded-full bg-white/82 px-2.5 py-1 text-[8px] font-semibold text-faint backdrop-blur">Hotel pins · prices simulated</div>
      </div>
      <div className="rounded-[15px] border border-hair bg-white p-3.5">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Selected on map</p><p className="mt-1 truncate text-[11.5px] font-semibold">{selected.name}</p><p className="mt-1 text-[9.5px] text-muted">{selected.area} · {IDR.format(selected.price)}</p></div><span className="rounded-full bg-accent-tint px-2 py-1 text-[8px] font-semibold text-accent">Previewing</span></div>
      </div>
    </div>
  );
}

function MapView({ trip, cowork, setCowork, context }: { trip: Trip; cowork: CoworkState; setCowork: (next: CoworkState) => void; context: WorkspaceSection }) {
  return context === "flights" ? <AirportMap trip={trip} /> : <StayMap trip={trip} cowork={cowork} setCowork={setCowork} />;
}

function ContextView({ cowork, profile, setCowork }: { cowork: CoworkState; profile: ProfileState; setCowork: (next: CoworkState) => void }) {
  const [draft, setDraft] = useState("");
  const profileItems = profileBrain(profile).slice(0, 4);
  const currentItems = cowork.brain.slice(-4).reverse();
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setCowork({
      ...cowork,
      brain: [...cowork.brain, { id: `context-${Date.now()}`, statement: text, category: "Trip context", scope: "this-trip", source: "trip" }],
    });
    setDraft("");
  };
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-3">
      <div className="rounded-[15px] border border-hair bg-white p-2 focus-within:border-accent">
        <div className="flex items-center gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add trip context…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[10.5px] outline-none placeholder:text-faint" />
          <button onClick={add} className="grid h-8 w-8 place-items-center rounded-[9px] bg-ink text-[11px] text-paper" aria-label="Add trip context">→</button>
        </div>
      </div>
      <div className="min-h-0 overflow-hidden">
        <section>
          <p className="text-[8.5px] font-semibold uppercase tracking-[.11em] text-faint">This trip</p>
          <div className="mt-2 space-y-2">
            {currentItems.length ? currentItems.map((entry) => <article key={entry.id} className="rounded-[13px] border border-hair bg-white p-3"><p className="text-[8px] font-semibold uppercase tracking-[.08em] text-faint">{entry.category}</p><p className="mt-1 text-[10.5px] font-medium leading-snug">{entry.statement}</p></article>) : <div className="rounded-[13px] border border-dashed border-hair p-3 text-[9.5px] leading-relaxed text-muted">Trip-specific context will appear here as you correct assumptions or make choices.</div>}
          </div>
        </section>
        {profileItems.length > 0 && <section className="mt-4"><p className="text-[8.5px] font-semibold uppercase tracking-[.11em] text-faint">Reusable traveler context</p><div className="mt-2 grid gap-2">{profileItems.map((entry) => <div key={entry.id} className="rounded-[12px] bg-white/68 p-2.5"><p className="text-[8px] font-semibold uppercase tracking-[.08em] text-faint">{entry.category}</p><p className="mt-1 line-clamp-2 text-[9.5px] leading-snug">{entry.statement}</p></div>)}</div></section>}
      </div>
      <Link href="/profile/preferences" className="inline-flex text-[10px] font-semibold text-accent">Manage traveler preferences →</Link>
    </div>
  );
}

export function WorkingFolderV2({
  trip,
  cowork,
  setCowork,
  profile,
  context,
  mobile = false,
  onClose,
  onCollapse,
}: {
  trip: Trip;
  cowork: CoworkState;
  setCowork: (next: CoworkState) => void;
  profile: ProfileState;
  context: WorkspaceSection;
  mobile?: boolean;
  onClose?: () => void;
  onCollapse?: () => void;
}) {
  const setView = (view: FolderView) => setCowork({ ...cowork, folderView: view });
  return (
    <aside className={`${mobile ? "fixed inset-0 z-[85] bg-[#f8f6f0]" : "fixed bottom-4 right-4 top-[80px] z-40 w-[min(420px,calc(100vw-32px))] rounded-[24px] border border-hair bg-[rgba(248,246,240,.97)]"} flex min-h-0 flex-col overflow-hidden shadow-[0_22px_70px_-36px_rgba(27,26,23,.38)] backdrop-blur-xl`} aria-label="Trip working folder">
      <header className="shrink-0 border-b border-hair-2 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-[.13em] text-faint">Working folder</p><h2 className="mt-1 truncate font-display text-[19px] font-semibold tracking-[-.025em]">Your trip, while you decide</h2></div>
          <button onClick={mobile ? onClose : onCollapse} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hair bg-white text-[13px] text-muted transition hover:border-ink/25 hover:text-ink" aria-label={mobile ? "Close trip folder" : "Collapse trip folder"}>{mobile ? "×" : "→"}</button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-paper-2/80 p-1">
          {(["plan", "map", "brain"] as FolderView[]).map((view) => <button key={view} onClick={() => setView(view)} className={tabClass(cowork.folderView === view)}>{view === "brain" ? "Trip Context" : view[0].toUpperCase() + view.slice(1)}</button>)}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-5">
        {cowork.folderView === "plan" ? <PlanView trip={trip} cowork={cowork} /> : cowork.folderView === "map" ? <MapView trip={trip} cowork={cowork} setCowork={setCowork} context={context} /> : <ContextView cowork={cowork} profile={profile} setCowork={setCowork} />}
      </div>
    </aside>
  );
}
