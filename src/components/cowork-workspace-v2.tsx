"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/photo";
import { WorkingFolderV2, type WorkspaceSection } from "@/components/working-folder-v2";
import {
  COWORK_STORAGE_KEY,
  defaultCoworkState,
  flightOptions,
  stayOptions,
  tripDates,
  tripDestination,
  type CoworkState,
  type FixedEvent,
} from "@/lib/cowork";
import { useTrip } from "@/lib/store";
import type { BriefLevel, Trip, TripBriefItem } from "@/lib/types";

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const NAV: { id: WorkspaceSection; label: string }[] = [
  { id: "brief", label: "Trip" },
  { id: "flights", label: "Flight" },
  { id: "hotel", label: "Stay" },
  { id: "review", label: "Ready" },
  { id: "ask", label: "Ask" },
];

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
    /* browser-local prototype persistence only */
  }
}

function stageFor(section: WorkspaceSection): CoworkState["stage"] {
  if (section === "flights") return "flights";
  if (section === "hotel") return "hotel";
  if (section === "review") return "review";
  return "brief";
}

function levelLabel(level: BriefLevel) {
  if (level === "must") return "Fixed";
  if (level === "avoid") return "Avoid";
  return "Preference";
}

function BriefItemRow({ item, editing, onEdit, onMove, onRemove }: {
  item: TripBriefItem;
  editing: boolean;
  onEdit: () => void;
  onMove: (level: BriefLevel) => void;
  onRemove: () => void;
}) {
  return (
    <article className="group rounded-[14px] border border-hair bg-white/76 p-3.5 transition hover:border-ink/18 hover:bg-white">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-surface-2 px-2 py-1 text-[8px] font-semibold uppercase tracking-[.08em] text-faint">{levelLabel(item.level)}</span>
          <p className="mt-2 text-[11.5px] font-medium leading-relaxed text-ink">{item.statement}</p>
        </div>
        <button onClick={onEdit} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hair bg-white text-[11px] text-muted transition hover:border-ink/30 hover:bg-surface-2 hover:text-ink ${editing ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus:opacity-100"}`} aria-label={`Edit ${item.statement}`}>✎</button>
      </div>
      {editing && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hair-2 pt-3">
          <span className="mr-1 text-[8.5px] font-semibold uppercase tracking-[.08em] text-faint">Treat as</span>
          {[{ level: "must" as const, label: "Fixed" }, { level: "prioritize" as const, label: "Preference" }, { level: "avoid" as const, label: "Avoid" }].map((option) => (
            <button key={option.level} onClick={() => onMove(option.level)} className={`rounded-full border px-3 py-1.5 text-[9px] font-semibold transition ${item.level === option.level || (item.level === "flexible" && option.level === "prioritize") ? "border-ink bg-ink text-paper" : "border-hair bg-white text-muted hover:border-ink/25 hover:bg-surface-2 hover:text-ink"}`}>{option.label}</button>
          ))}
          <button onClick={onRemove} className="ml-auto rounded-full px-3 py-1.5 text-[9px] font-semibold text-faint transition hover:bg-[#f7e9e6] hover:text-[#8a4138]">Remove</button>
        </div>
      )}
    </article>
  );
}

function FlightCard({ option, selected, onChoose, onTrack }: { option: ReturnType<typeof flightOptions>[number]; selected?: boolean; onChoose: () => void; onTrack: () => void }) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-ink/15 bg-white shadow-[0_18px_50px_-38px_rgba(27,26,23,.42)]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><span className="rounded-full bg-ink px-2.5 py-1 text-[8.5px] font-semibold text-paper">{selected ? "Your current choice" : "Best fit for this trip"}</span><h3 className="mt-3 font-display text-[24px] font-semibold tracking-[-.03em]">{option.airline}</h3><p className="mt-1 text-[10.5px] text-muted">{option.route}</p></div>
          <div className="text-right"><p className="font-display text-[21px] font-semibold">{IDR.format(option.price)}</p><p className="text-[8.5px] text-faint">per traveler · prototype fare</p></div>
        </div>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center rounded-[14px] bg-surface-2 p-4 text-center">
          <div><b className="block text-[15px]">{option.depart}</b><span className="text-[8.5px] text-faint">Depart</span></div>
          <div className="px-4"><span className="block text-[9.5px] font-semibold text-muted">{option.duration}</span><span className="text-[8px] text-faint">{option.stops}</span></div>
          <div><b className="block text-[15px]">{option.arrive}</b><span className="text-[8.5px] text-faint">Arrive</span></div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div><p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Why I’d take it</p><p className="mt-1 max-w-[62ch] text-[11.5px] leading-relaxed text-ink-soft">{option.why}</p><p className="mt-2 text-[10px] text-muted"><b>Trade-off:</b> {option.tradeoff}</p></div>
          <div className="flex flex-wrap gap-2"><button onClick={onTrack} className="rounded-full border border-hair px-4 py-2.5 text-[10px] font-semibold transition hover:border-ink/25 hover:bg-surface-2">Track price</button><button onClick={onChoose} className="rounded-full bg-ink px-4 py-2.5 text-[10px] font-semibold text-paper">Choose this flight</button></div>
        </div>
      </div>
    </article>
  );
}

function StayCard({ option, chosen, onChoose, onWatch }: { option: ReturnType<typeof stayOptions>[number]; chosen?: boolean; onChoose: () => void; onWatch: () => void }) {
  return (
    <article className="rounded-[22px] border border-ink/15 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(27,26,23,.42)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><span className="rounded-full bg-ink px-2.5 py-1 text-[8.5px] font-semibold text-paper">{chosen ? "Your current choice" : "Selected from the map"}</span><h3 className="mt-3 font-display text-[24px] font-semibold tracking-[-.03em]">{option.name}</h3><p className="mt-1 text-[10.5px] font-semibold text-muted">{option.area}</p></div>
        <div className="text-right"><p className="font-display text-[21px] font-semibold">{IDR.format(option.price)}</p><p className="text-[8.5px] text-faint">full stay · prototype rate</p></div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-[13px] bg-surface-2 p-3"><p className="text-[8px] uppercase tracking-[.08em] text-faint">Room</p><p className="mt-1 text-[10.5px] font-semibold">{option.room}</p></div><div className="rounded-[13px] bg-surface-2 p-3"><p className="text-[8px] uppercase tracking-[.08em] text-faint">Cancellation</p><p className="mt-1 text-[10.5px] font-semibold">{option.cancellation}</p></div></div>
      <div className="mt-4"><p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Why this base</p><p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{option.why}</p>{option.eventTimes.map((time) => <p key={time} className="mt-1 text-[9.5px] text-muted">↗ {time}</p>)}</div>
      <div className="mt-4 flex flex-wrap justify-end gap-2"><button onClick={onWatch} className="rounded-full border border-hair px-4 py-2.5 text-[10px] font-semibold transition hover:border-ink/25 hover:bg-surface-2">Watch this stay</button><button onClick={onChoose} className="rounded-full bg-ink px-4 py-2.5 text-[10px] font-semibold text-paper">Choose this stay</button></div>
    </article>
  );
}

export function CoworkWorkspaceV2({ tripId }: { tripId: string }) {
  const { trip, store, hydrated } = useTrip(tripId);
  const [cowork, setCowork] = useState<CoworkState | null>(null);
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("flights");
  const [folderOpen, setFolderOpen] = useState(true);
  const [mobileFolder, setMobileFolder] = useState(false);
  const [composer, setComposer] = useState("");
  const [editingBrief, setEditingBrief] = useState<string | null>(null);
  const [eventOpen, setEventOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState({ title: "", place: "", when: "" });
  const composerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!hydrated || !trip) return;
    const loaded = loadCowork(trip);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCowork(loaded);
    const start: WorkspaceSection = loaded.contextPrompt.trim() || loaded.fixedEvents.length ? "brief" : "flights";
    setActiveSection(start);
    if (start === "flights") window.requestAnimationFrame(() => document.getElementById("workspace-flights")?.scrollIntoView({ block: "start" }));
  }, [hydrated, trip]);

  useEffect(() => {
    const ids = NAV.map((item) => `workspace-${item.id}`);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id.replace("workspace-", "") as WorkspaceSection;
      setActiveSection(id);
    }, { rootMargin: "-120px 0px -55% 0px", threshold: [0.08, 0.2, 0.4] });
    ids.forEach((id) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [cowork]);

  if (!hydrated || !trip || !cowork) return <div className="mx-auto h-[70dvh] max-w-[1180px] rounded-[24px] shimmer" />;

  const current = cowork;
  const destination = tripDestination(trip);
  const flights = flightOptions(destination);
  const stays = stayOptions(destination, current.fixedEvents);
  const leadFlight = flights.find((item) => item.id === current.selectedFlightId) ?? (current.correctedAssumption && /cheap|price|budget|fare/i.test(current.correctedAssumption) ? flights[1] : current.correctedAssumption && /fast|time|duration/i.test(current.correctedAssumption) ? flights[2] : flights[0]);
  const leadStay = stays.find((item) => item.id === current.selectedStayId) ?? stays[0];
  const flightChosen = current.flightStatus !== "Not started";
  const stayChosen = current.stayStatus !== "Not started";
  const coreChosen = flightChosen && stayChosen;
  const proposal = trip.destinationProposals.find((item) => item.id === trip.selectedProposalId) ?? trip.destinationProposals.find((item) => item.destination.toLowerCase().includes(destination.split(",")[0].toLowerCase())) ?? trip.destinationProposals[0];

  const update = (fn: (value: CoworkState) => CoworkState) => {
    setCowork((previous) => {
      const next = fn(previous ?? current);
      persistCowork(trip.id, next);
      return next;
    });
  };

  const go = (section: WorkspaceSection) => {
    setActiveSection(section);
    if (section === "review") setFolderOpen(false);
    else setFolderOpen(true);
    const view = section === "flights" || section === "hotel" ? "map" : section === "ask" ? "brain" : "plan";
    update((value) => ({ ...value, stage: stageFor(section), folderView: view }));
    document.getElementById(`workspace-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (section === "ask") window.setTimeout(() => composerRef.current?.focus(), 450);
  };

  const addContext = (text: string) => update((value) => ({ ...value, brain: [...value.brain, { id: `decision-${Date.now()}`, statement: text, category: "Decision", scope: "this-trip", source: "decision" }] }));

  const chooseFlight = () => {
    store.patchTrip(trip.id, { componentStates: { ...trip.componentStates, flight: "saved" } });
    update((value) => ({ ...value, selectedFlightId: leadFlight.id, flightStatus: "Selected" }));
    addContext(`${leadFlight.airline} is the current flight choice for this trip.`);
    window.setTimeout(() => go("hotel"), 100);
  };

  const trackFlight = () => {
    store.trackFlight(trip.id, { id: leadFlight.id, airline: leadFlight.airline, route: leadFlight.route, depart: leadFlight.depart, arrive: leadFlight.arrive, duration: leadFlight.duration, stops: leadFlight.stops, originalFare: leadFlight.price, currentFare: leadFlight.price });
    update((value) => ({ ...value, selectedFlightId: leadFlight.id, flightStatus: "Tracked" }));
    addContext(`Track ${leadFlight.airline} before booking; price matters enough to watch.`);
  };

  const chooseStay = () => {
    store.patchTrip(trip.id, { componentStates: { ...trip.componentStates, stay: "saved" } });
    update((value) => ({ ...value, selectedStayId: leadStay.id, stayStatus: "Selected" }));
    addContext(`${leadStay.name} in ${leadStay.area} is the current stay choice.`);
    window.setTimeout(() => go("review"), 100);
  };

  const watchStay = () => {
    store.patchTrip(trip.id, { componentStates: { ...trip.componentStates, stay: "tracked" } });
    update((value) => ({ ...value, selectedStayId: leadStay.id, stayStatus: "Tracked" }));
  };

  const addFixedEvent = () => {
    if (!eventDraft.title.trim() || !eventDraft.place.trim() || !eventDraft.when.trim()) return;
    const event: FixedEvent = { id: `fixed-${Date.now()}`, title: eventDraft.title.trim(), place: eventDraft.place.trim(), when: eventDraft.when.trim(), source: "user" };
    update((value) => ({ ...value, fixedEvents: [...value.fixedEvents, event] }));
    store.addBriefItem(trip.id, `${event.title} · ${event.place} · ${event.when}`, "must");
    setEventDraft({ title: "", place: "", when: "" });
    setEventOpen(false);
  };

  const submitComposer = () => {
    const text = composer.trim();
    if (!text) return;
    store.addBriefItem(trip.id, text, "prioritize");
    update((value) => ({ ...value, correctedAssumption: text, brain: [...value.brain, { id: `ask-${Date.now()}`, statement: text, category: "Trip refinement", scope: "this-trip", source: "trip" }] }));
    setComposer("");
  };

  const visibleBrief = trip.brief.items.slice(0, 8);

  return (
    <div className="mx-auto max-w-[1420px] px-4 pb-20 pt-4 sm:px-5 md:px-7">
      <div className={`transition-[padding] duration-300 ${folderOpen ? "lg:pr-[440px]" : ""}`}>
        <div className="sticky top-[64px] z-40 -mx-2 mb-5 bg-gradient-to-b from-paper via-paper/95 to-paper/0 px-2 pb-5 pt-3 backdrop-blur-[2px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 gap-1 overflow-x-auto rounded-full border border-hair bg-[rgba(238,235,226,.9)] p-1 shadow-sm backdrop-blur-xl">
              {NAV.map((item) => <button key={item.id} onClick={() => go(item.id)} className={`shrink-0 rounded-full px-3.5 py-2 text-[10.5px] font-semibold transition ${activeSection === item.id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{item.label}</button>)}
            </div>
            <button onClick={() => setMobileFolder(true)} className="shrink-0 rounded-full border border-hair bg-white px-3 py-2 text-[10px] font-semibold lg:hidden">Trip folder</button>
          </div>
        </div>

        <main className="mx-auto max-w-[930px]">
          <section id="workspace-brief" className="scroll-mt-[132px] rounded-[26px] border border-hair bg-[rgba(249,247,241,.58)] p-5 sm:p-7">
            <p className="text-[9.5px] font-semibold uppercase tracking-[.13em] text-faint">Trip brief</p>
            <h1 className="mt-2 max-w-[16ch] font-display text-[clamp(35px,5vw,52px)] font-semibold leading-[1] tracking-[-.04em]">Here’s what I’m planning around.</h1>
            <p className="mt-3 max-w-[64ch] text-[12.5px] leading-relaxed text-muted">This is trip context, not a preference questionnaire. Reusable preferences continue to live in your Traveler Profile and can be learned from the decisions you make.</p>

            <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-hair bg-white px-3 py-2 text-[10px] font-semibold">{destination}</span><span className="rounded-full border border-hair bg-white px-3 py-2 text-[10px] font-semibold">{tripDates(trip)}</span><span className="rounded-full border border-hair bg-white px-3 py-2 text-[10px] font-semibold">{trip.travelers} traveler{trip.travelers === 1 ? "" : "s"}</span></div>

            {current.contextPrompt.trim() && <div className="mt-5 rounded-[16px] border border-hair bg-white/72 p-4"><p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">You also told us</p><p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">{current.contextPrompt}</p></div>}

            <div className="mt-6 flex items-end justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">What AITA understood</p><p className="mt-1 text-[10.5px] text-muted">Hover an item to edit how it should be treated.</p></div><Link href="/profile/preferences" className="text-[9.5px] font-semibold text-accent">Traveler preferences →</Link></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">{visibleBrief.map((item) => <BriefItemRow key={item.id} item={item} editing={editingBrief === item.id} onEdit={() => setEditingBrief(editingBrief === item.id ? null : item.id)} onMove={(level) => { store.setBriefLevel(trip.id, item.id, level); setEditingBrief(null); }} onRemove={() => { store.removeBriefItem(trip.id, item.id); setEditingBrief(null); }} />)}</div>

            <div className="mt-5 rounded-[17px] border border-hair bg-white/68 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Fixed events</p><p className="mt-1 text-[11px] font-semibold">Only add things the trip truly has to work around.</p></div><button onClick={() => setEventOpen(!eventOpen)} className="rounded-full border border-hair bg-white px-3 py-2 text-[9.5px] font-semibold transition hover:border-ink/25">{eventOpen ? "Cancel" : "+ Add fixed event"}</button></div>
              {current.fixedEvents.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{current.fixedEvents.map((event) => <span key={event.id} className="rounded-full bg-[#f6efe3] px-3 py-2 text-[9.5px] font-semibold text-[#765638]">{event.title} · {event.place} · {event.when}</span>)}</div>}
              {eventOpen && <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_130px_auto]"><input value={eventDraft.title} onChange={(e) => setEventDraft({ ...eventDraft, title: e.target.value })} placeholder="Graduation" className="rounded-[11px] border border-hair bg-white px-3 py-2 text-[10px] outline-none focus:border-accent"/><input value={eventDraft.place} onChange={(e) => setEventDraft({ ...eventDraft, place: e.target.value })} placeholder="UCLA" className="rounded-[11px] border border-hair bg-white px-3 py-2 text-[10px] outline-none focus:border-accent"/><input value={eventDraft.when} onChange={(e) => setEventDraft({ ...eventDraft, when: e.target.value })} placeholder="Fri 10:00" className="rounded-[11px] border border-hair bg-white px-3 py-2 text-[10px] outline-none focus:border-accent"/><button onClick={addFixedEvent} className="rounded-full bg-ink px-3 py-2 text-[9.5px] font-semibold text-paper">Add</button></div>}
            </div>
            <div className="mt-5 flex justify-end"><button onClick={() => go("flights")} className="rounded-full bg-ink px-5 py-3 text-[10.5px] font-semibold text-paper">See flight recommendation →</button></div>
          </section>

          <section id="workspace-flights" className="scroll-mt-[132px] py-12">
            <div className="mb-5"><p className="text-[9.5px] font-semibold uppercase tracking-[.13em] text-faint">Flight</p><h2 className="mt-2 max-w-[14ch] font-display text-[clamp(34px,4.8vw,48px)] font-semibold leading-[1] tracking-[-.04em]">I’d take this flight.</h2><p className="mt-3 max-w-[62ch] text-[12.5px] leading-relaxed text-muted">The map beside it switches to the arrival airport so the recommendation stays grounded in the actual trip.</p></div>
            <FlightCard option={leadFlight} selected={current.selectedFlightId === leadFlight.id && flightChosen} onChoose={chooseFlight} onTrack={trackFlight} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{flights.filter((item) => item.id !== leadFlight.id).map((option) => <button key={option.id} onClick={() => update((value) => ({ ...value, selectedFlightId: option.id }))} className="group rounded-[16px] border border-hair bg-white/65 p-4 text-left transition hover:border-ink/25 hover:bg-white"><div className="flex justify-between gap-3"><div><p className="text-[8.5px] font-semibold uppercase tracking-[.08em] text-faint">{option.purpose}</p><p className="mt-1 text-[11.5px] font-semibold">{option.airline}</p><p className="mt-1 text-[9.5px] text-muted">{option.depart} · {option.duration} · {option.stops}</p></div><p className="text-[10.5px] font-semibold">{IDR.format(option.price)}</p></div><span className="mt-3 inline-flex text-[9px] font-semibold text-accent opacity-70 group-hover:opacity-100">Preview this option →</span></button>)}</div>
          </section>

          <section id="workspace-hotel" className="scroll-mt-[132px] border-t border-hair-2 py-12">
            <div className="mb-5"><p className="text-[9.5px] font-semibold uppercase tracking-[.13em] text-faint">Stay</p><h2 className="mt-2 max-w-[14ch] font-display text-[clamp(34px,4.8vw,48px)] font-semibold leading-[1] tracking-[-.04em]">Pick the base that makes the trip easier.</h2><p className="mt-3 max-w-[64ch] text-[12.5px] leading-relaxed text-muted">Hotel pins on the right show price on hover. Click a pin and this recommendation updates immediately.</p></div>
            <StayCard option={leadStay} chosen={stayChosen && current.selectedStayId === leadStay.id} onChoose={chooseStay} onWatch={watchStay} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{stays.filter((item) => item.id !== leadStay.id).map((option) => <button key={option.id} onClick={() => { update((value) => ({ ...value, selectedStayId: option.id, folderView: "map" })); setFolderOpen(true); }} className="group rounded-[16px] border border-hair bg-white/65 p-4 text-left transition hover:border-ink/25 hover:bg-white"><div className="flex justify-between gap-3"><div><p className="text-[8.5px] font-semibold uppercase tracking-[.08em] text-faint">{option.purpose}</p><p className="mt-1 text-[11.5px] font-semibold">{option.name}</p><p className="mt-1 text-[9.5px] text-muted">{option.area}</p></div><p className="text-[10.5px] font-semibold">{IDR.format(option.price)}</p></div><span className="mt-3 inline-flex text-[9px] font-semibold text-accent opacity-70 group-hover:opacity-100">Show on map →</span></button>)}</div>
          </section>

          <section id="workspace-review" className="scroll-mt-[132px] border-t border-hair-2 py-12">
            <div className="mb-5"><p className="text-[9.5px] font-semibold uppercase tracking-[.13em] text-faint">Ready</p><h2 className="mt-2 max-w-[15ch] font-display text-[clamp(34px,4.8vw,48px)] font-semibold leading-[1] tracking-[-.04em]">{coreChosen ? "Now it looks like a trip." : "Your trip preview is waiting for two core choices."}</h2></div>
            <div className="overflow-hidden rounded-[25px] bg-ink text-white shadow-[var(--shadow-card)]">
              {proposal && <div className="relative h-[280px] sm:h-[320px]"><Photo image={proposal.heroImage} ratio="hero" tone={proposal.heroTone} width={1500} rounded="rounded-none" priority className="h-full w-full !aspect-auto opacity-75"/><div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,.9)] via-[rgba(8,8,8,.18)] to-transparent"/><div className="absolute inset-x-0 bottom-0 p-5 sm:p-7"><p className="text-[9px] font-semibold uppercase tracking-[.13em] text-white/60">{destination}</p><h3 className="mt-2 font-display text-[clamp(29px,4.5vw,46px)] font-semibold tracking-[-.04em]">{trip.name}</h3><p className="mt-2 max-w-[58ch] text-[11.5px] leading-relaxed text-white/72">{proposal.thesis}</p></div></div>}
              <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2 sm:p-6"><div className="rounded-[15px] border border-white/12 bg-white/[.06] p-4"><p className="text-[8.5px] uppercase tracking-[.1em] text-white/45">Flight</p><p className="mt-1 text-[11.5px] font-semibold">{flightChosen ? `${leadFlight.airline} · ${leadFlight.route}` : "Choose a flight above"}</p><p className="mt-1 text-[9.5px] text-white/55">{current.flightStatus}</p></div><div className="rounded-[15px] border border-white/12 bg-white/[.06] p-4"><p className="text-[8.5px] uppercase tracking-[.1em] text-white/45">Stay</p><p className="mt-1 text-[11.5px] font-semibold">{stayChosen ? `${leadStay.name} · ${leadStay.area}` : "Choose a stay above"}</p><p className="mt-1 text-[9.5px] text-white/55">{current.stayStatus}</p></div></div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-hair bg-white/68 p-4"><div><p className="text-[10.5px] font-semibold">{coreChosen ? "Core trip decisions are set." : "Flight + stay are the only blockers here."}</p><p className="mt-1 text-[9.5px] text-muted">Restaurants, activities, transfers, eSIM and other services stay optional until context makes them useful.</p></div><div className="flex flex-wrap gap-2">{coreChosen && <Link href={`/trips/${trip.id}/itinerary?handoff=otterway`} className="rounded-full border border-hair bg-white px-4 py-2.5 text-[10px] font-semibold">Open OtterWay itinerary</Link>}<Link href={`/trips/${trip.id}/booking-plan`} className="rounded-full bg-ink px-4 py-2.5 text-[10px] font-semibold text-paper">Review booking plan →</Link></div></div>
          </section>

          <section id="workspace-ask" className="scroll-mt-[132px] border-t border-hair-2 pb-32 pt-12">
            <p className="text-[9.5px] font-semibold uppercase tracking-[.13em] text-faint">Ask RoaminRabbit</p><h2 className="mt-2 max-w-[14ch] font-display text-[clamp(32px,4.5vw,46px)] font-semibold leading-[1] tracking-[-.04em]">Keep changing the trip in plain language.</h2><p className="mt-3 max-w-[60ch] text-[12.5px] leading-relaxed text-muted">Correct an assumption, ask for another option, or add context. Consequential actions still require explicit approval.</p>
          </section>

          <div className="sticky bottom-3 z-30 -mx-1 bg-gradient-to-t from-paper via-paper/95 to-transparent px-1 pb-1 pt-8">
            <div className="mb-2 flex gap-1.5 overflow-x-auto">{["Avoid red-eyes", "Keep the first day light", "Show me a cheaper option"].map((chip) => <button key={chip} onClick={() => { setComposer(chip); composerRef.current?.focus(); }} className="shrink-0 rounded-full border border-hair bg-white/88 px-3 py-1.5 text-[9px] font-semibold text-muted transition hover:border-ink/20 hover:text-ink">{chip}</button>)}</div>
            <div className="cowork-composer-shell flex items-center gap-2 rounded-[18px] border border-hair bg-white p-1.5 shadow-[0_14px_40px_-22px_rgba(27,26,23,.42)] focus-within:border-accent">
              <input ref={composerRef} value={composer} onChange={(e) => setComposer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitComposer()} placeholder="What should we change about this trip?" className="cowork-composer-input min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[11.5px] outline-none placeholder:text-faint"/>
              <button onClick={submitComposer} className="grid h-10 w-10 place-items-center rounded-[12px] bg-ink text-paper" aria-label="Send trip refinement">→</button>
            </div>
          </div>
        </main>
      </div>

      {folderOpen ? <WorkingFolderV2 trip={trip} cowork={current} setCowork={(next) => { persistCowork(trip.id, next); setCowork(next); }} profile={store.profile} context={activeSection} onCollapse={() => setFolderOpen(false)} /> : <button onClick={() => setFolderOpen(true)} className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 rounded-full border border-hair bg-white px-2.5 py-4 text-[9.5px] font-semibold text-muted shadow-[var(--shadow-card)] transition hover:border-ink/25 hover:text-ink lg:block" aria-label="Open trip working folder"><span className="block [writing-mode:vertical-rl]">Open trip folder</span></button>}
      {mobileFolder && <WorkingFolderV2 trip={trip} cowork={current} setCowork={(next) => { persistCowork(trip.id, next); setCowork(next); }} profile={store.profile} context={activeSection} mobile onClose={() => setMobileFolder(false)} />}
    </div>
  );
}
