"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTrip } from "@/lib/store";
import type { BriefLevel } from "@/lib/types";
import {
  COWORK_STORAGE_KEY,
  GUIDED_QUESTIONS,
  PENDING_IMPORT_KEY,
  SAMPLE_CALENDAR_EVENTS,
  defaultCoworkState,
  extractBriefItems,
  flightOptions,
  importLevel,
  nearbyDatePrices,
  stayOptions,
  tripDestination,
  type CoworkState,
  type FixedEvent,
  type FlightDecisionOption,
  type ImportGroup,
  type StayDecisionOption,
} from "@/lib/cowork";
import { WorkingFolder } from "@/components/working-folder";
import { PRODUCT } from "@/config/product";

const IDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function loadCowork(trip: Parameters<typeof defaultCoworkState>[0]): CoworkState {
  const fallback = defaultCoworkState(trip);
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(COWORK_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) as Record<string, Partial<CoworkState>> : {};
    return { ...fallback, ...(all[trip.id] ?? {}) };
  } catch { return fallback; }
}

function persistCowork(tripId: string, cowork: CoworkState) {
  try {
    const raw = localStorage.getItem(COWORK_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) as Record<string, CoworkState> : {};
    localStorage.setItem(COWORK_STORAGE_KEY, JSON.stringify({ ...all, [tripId]: cowork }));
  } catch { /* prototype persistence only */ }
}

function StageNav({ stage, onStage }: { stage: CoworkState["stage"]; onStage: (stage: CoworkState["stage"]) => void }) {
  const items: { id: CoworkState["stage"]; label: string }[] = [
    { id: "brief", label: "Trip Brief" }, { id: "flights", label: "Flight" }, { id: "hotel", label: "Stay" }, { id: "review", label: "Ready" },
  ];
  return <div className="flex min-w-0 gap-1 overflow-x-auto rounded-full bg-paper-2/70 p-1">{items.map((item) => <button key={item.id} onClick={() => onStage(item.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-[10.5px] font-semibold transition ${stage === item.id || (stage === "reasoning" && item.id === "brief") ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{item.label}</button>)}</div>;
}

function BriefGroup({ title, level, items, onMove }: { title: string; level: BriefLevel; items: { id: string; statement: string; level: BriefLevel }[]; onMove: (id: string, level: BriefLevel) => void }) {
  const group = items.filter((item) => item.level === level);
  return <section className="rounded-[18px] border border-hair bg-white/72 p-4"><div className="flex items-center justify-between gap-2"><h3 className="text-[10px] font-semibold uppercase tracking-[.11em] text-faint">{title}</h3><span className="text-[9px] text-faint">{group.length}</span></div><div className="mt-2 space-y-2">{group.length ? group.map((item) => <article draggable key={item.id} className="group rounded-[12px] border border-hair-2 bg-surface-2 p-3"><p className="text-[11.5px] font-medium leading-snug text-ink">{item.statement}</p><div className="mt-2 flex flex-wrap gap-1 opacity-70 transition group-hover:opacity-100">{(["must","prioritize","flexible","avoid"] as BriefLevel[]).filter((next) => next !== level).map((next) => <button key={next} onClick={() => onMove(item.id, next)} className="rounded-full bg-white px-2 py-1 text-[8.5px] font-semibold text-faint hover:text-ink">→ {next === "must" ? "protect" : next}</button>)}</div></article>) : <p className="rounded-[11px] border border-dashed border-hair px-3 py-5 text-center text-[10.5px] text-faint">Nothing here yet.</p>}</div></section>;
}

function OptionalQuestion({ question, onAnswer, onDismiss }: { question: string; onAnswer: (answer: string) => void; onDismiss: () => void }) {
  return <section className="mt-6 rounded-[18px] border border-hair bg-white/72 p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Optional question</p><p className="mt-1 text-[13px] font-semibold text-ink">{question}</p></div><button onClick={onDismiss} className="text-[10px] font-semibold text-faint hover:text-ink">Skip</button></div><div className="mt-3 flex flex-wrap gap-2">{["Yes","No","It depends","No preference"].map((answer) => <button key={answer} onClick={() => onAnswer(answer)} className="rounded-full border border-hair bg-white px-3 py-1.5 text-[10.5px] font-semibold text-muted hover:border-ink/30 hover:text-ink">{answer}</button>)}</div></section>;
}

function BriefStage({ tripId, trip, cowork, setCowork, onContinue }: { tripId: string; trip: NonNullable<ReturnType<typeof useTrip>["trip"]>; cowork: CoworkState; setCowork: (next: CoworkState) => void; onContinue: () => void }) {
  const { store } = useTrip(tripId);
  const [eventTitle, setEventTitle] = useState("");
  const [eventPlace, setEventPlace] = useState("");
  const [eventWhen, setEventWhen] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const activeQuestion = GUIDED_QUESTIONS.find((_, index) => index >= cowork.questionIndex && !cowork.dismissedQuestions.includes(index));

  function extract() {
    const extracted = extractBriefItems(cowork.contextPrompt);
    extracted.forEach((item) => {
      if (!trip.brief.items.some((existing) => existing.statement.toLowerCase() === item.statement.toLowerCase())) store.addBriefItem(trip.id, item.statement, item.level);
    });
  }
  function addEvent(event?: FixedEvent) {
    const next = event ?? { id: `event-${Date.now()}`, title: eventTitle.trim(), place: eventPlace.trim(), when: eventWhen.trim(), source: "user" as const };
    if (!next.title || !next.place || !next.when) return;
    setCowork({ ...cowork, fixedEvents: [...cowork.fixedEvents.filter((item) => item.id !== next.id), next] });
    if (!trip.brief.items.some((item) => item.statement.includes(next.title))) store.addBriefItem(trip.id, `${next.title} · ${next.place} · ${next.when}`, "must");
    setEventTitle(""); setEventPlace(""); setEventWhen("");
  }
  function addCalendarSamples() {
    const existing = new Set(cowork.fixedEvents.map((event) => event.id));
    const additions = SAMPLE_CALENDAR_EVENTS.filter((event) => !existing.has(event.id));
    setCowork({ ...cowork, calendarPreviewed: true, fixedEvents: [...cowork.fixedEvents, ...additions] });
    additions.forEach((event) => store.addBriefItem(trip.id, `${event.title} · ${event.place} · ${event.when}`, "must"));
    setCalendarOpen(false);
  }
  function answerQuestion(answer: string) {
    if (!activeQuestion) return;
    const statement = `${activeQuestion.replace(/\?$/, "")}: ${answer}`;
    const currentIndex = GUIDED_QUESTIONS.indexOf(activeQuestion);
    setCowork({ ...cowork, questionIndex: currentIndex + 1, brain: [...cowork.brain, { id: `brain-${Date.now()}`, statement, category: "Trip preference", scope: "this-trip", source: "trip" }] });
  }

  return <div>
    <p className="text-[10.5px] font-semibold uppercase tracking-[.13em] text-faint">Trip Brief</p>
    <h1 className="mt-2 max-w-[16ch] font-display text-[clamp(34px,4.8vw,50px)] font-semibold leading-[1] tracking-[-.04em]">Tell us what you know about this trip.</h1>
    <p className="mt-3 max-w-[58ch] text-[14px] leading-relaxed text-muted">Dates, people, fixed events, preferences, or anything else that matters.</p>
    <div className="mt-6 rounded-[20px] border border-hair bg-white p-2 shadow-[var(--shadow-card)] focus-within:border-accent"><textarea value={cowork.contextPrompt} onChange={(event) => setCowork({ ...cowork, contextPrompt: event.target.value })} rows={5} placeholder="Graduation Friday morning, no red-eyes, hotel near the west side, keep the first afternoon easy…" className="w-full resize-none bg-transparent px-3 py-2 text-[14px] leading-relaxed outline-none placeholder:text-faint"/><div className="flex flex-wrap items-center justify-between gap-2 border-t border-hair-2 px-2 pt-2"><p className="text-[10px] text-faint">Write naturally. You can edit what AITA extracts.</p><button onClick={extract} disabled={!cowork.contextPrompt.trim()} className="rounded-full bg-ink px-4 py-2 text-[10.5px] font-semibold text-paper disabled:opacity-30">Update Trip Brief</button></div></div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2"><BriefGroup title="Must protect" level="must" items={trip.brief.items} onMove={store.setBriefLevel.bind(null, trip.id)} /><BriefGroup title="Prioritize" level="prioritize" items={trip.brief.items} onMove={store.setBriefLevel.bind(null, trip.id)} /><BriefGroup title="Flexible" level="flexible" items={trip.brief.items} onMove={store.setBriefLevel.bind(null, trip.id)} /><BriefGroup title="Avoid" level="avoid" items={trip.brief.items} onMove={store.setBriefLevel.bind(null, trip.id)} /></div>

    <section className="mt-6 rounded-[20px] border border-hair bg-white/70 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Fixed events</p><h3 className="mt-1 font-display text-[19px] font-semibold">Anchor the trip around what cannot move</h3></div><button onClick={() => setCalendarOpen(true)} className="rounded-full border border-hair bg-white px-3 py-2 text-[10.5px] font-semibold text-muted">Connect calendar</button></div>{cowork.fixedEvents.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{cowork.fixedEvents.map((event) => <div key={event.id} className="rounded-[13px] bg-[#f6efe3] p-3"><p className="text-[11.5px] font-semibold text-ink">{event.title}</p><p className="mt-1 text-[10px] text-muted">{event.place} · {event.when}</p><button onClick={() => setCowork({ ...cowork, fixedEvents: cowork.fixedEvents.filter((item) => item.id !== event.id) })} className="mt-2 text-[9px] font-semibold text-faint">Remove</button></div>)}</div>}<div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_130px_auto]"><input value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} placeholder="Graduation" className="rounded-[12px] border border-hair bg-white px-3 py-2.5 text-[11.5px] outline-none focus-visible:border-accent"/><input value={eventPlace} onChange={(event) => setEventPlace(event.target.value)} placeholder="UCLA" className="rounded-[12px] border border-hair bg-white px-3 py-2.5 text-[11.5px] outline-none focus-visible:border-accent"/><input value={eventWhen} onChange={(event) => setEventWhen(event.target.value)} placeholder="Fri 10:00" className="rounded-[12px] border border-hair bg-white px-3 py-2.5 text-[11.5px] outline-none focus-visible:border-accent"/><button onClick={() => addEvent()} className="rounded-full border border-hair bg-white px-3 py-2 text-[10.5px] font-semibold text-ink">Add</button></div></section>

    {calendarOpen && <div className="mt-3 rounded-[18px] border border-[#dfd2bd] bg-[#f6efe3] p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Calendar preview · simulated</p><p className="mt-1 text-[12px] font-semibold">Sample events found for this prototype</p></div><button onClick={() => setCalendarOpen(false)} className="text-faint">×</button></div><div className="mt-3 space-y-2">{SAMPLE_CALENDAR_EVENTS.map((event) => <div key={event.id} className="rounded-[12px] bg-white/70 p-3 text-[11px]"><strong>{event.title}</strong> · {event.place} · {event.when}</div>)}</div><div className="mt-3 flex items-center justify-between gap-3"><p className="text-[9.5px] text-faint">No Google Calendar account is connected. These are deterministic sample events.</p><button onClick={addCalendarSamples} className="shrink-0 rounded-full bg-ink px-4 py-2 text-[10px] font-semibold text-paper">Add sample events</button></div></div>}

    {activeQuestion && <OptionalQuestion question={activeQuestion} onAnswer={answerQuestion} onDismiss={() => { const index = GUIDED_QUESTIONS.indexOf(activeQuestion); setCowork({ ...cowork, dismissedQuestions: [...cowork.dismissedQuestions, index], questionIndex: index + 1 }); }} />}
    <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><Link href="/calibrate" className="text-[11px] font-semibold text-muted">Improve my recommendations</Link><button onClick={onContinue} className="rounded-full bg-ink px-5 py-3 text-[12px] font-semibold text-paper">Build my recommendation →</button></div>
  </div>;
}

const WORK_STEPS = [
  { label: "Understanding your non-negotiables", source: "Trip Brief" },
  { label: "Checking your Trip Brain", source: "Traveler Profile" },
  { label: "Reviewing fixed calendar events", source: "Calendar · sample if connected" },
  { label: "Screening relevant flight and hotel options", source: "Prototype inventory" },
  { label: "Comparing nearby dates", source: "Prototype price patterns" },
  { label: "Checking neighborhoods against your plans", source: "Maps & travel times · simulated" },
  { label: "Cross-referencing timing and travel logistics", source: "Trip context" },
  { label: "Building your recommendation", source: "AITA" },
];

function ReasoningStage({ cowork, setCowork }: { cowork: CoworkState; setCowork: (next: CoworkState) => void }) {
  const [active, setActive] = useState(cowork.reasoningComplete ? WORK_STEPS.length : 0);
  useEffect(() => {
    if (cowork.reasoningComplete) return;
    const timer = window.setInterval(() => setActive((current) => Math.min(WORK_STEPS.length, current + 1)), 430);
    return () => window.clearInterval(timer);
  }, [cowork.reasoningComplete]);
  useEffect(() => {
    if (active !== WORK_STEPS.length || cowork.reasoningComplete) return;
    const timer = window.setTimeout(() => setCowork({ ...cowork, reasoningComplete: true }), 350);
    return () => window.clearTimeout(timer);
  }, [active, cowork, setCowork]);
  const complete = cowork.reasoningComplete || active === WORK_STEPS.length;
  return <div className="mx-auto max-w-[650px] py-5"><p className="text-[10.5px] font-semibold uppercase tracking-[.13em] text-faint">AITA is working across the trip</p><h1 className="mt-2 font-display text-[clamp(32px,4.6vw,46px)] font-semibold leading-[1] tracking-[-.04em]">Cross-checking before I recommend anything.</h1><p className="mt-3 text-[13px] leading-relaxed text-muted">This is a visible work log, not hidden chain-of-thought. Inventory, prices, maps, and calendar data are deterministic prototype signals unless labeled otherwise.</p><div className="mt-7 space-y-1">{WORK_STEPS.map((step, index) => { const done = index < active; const checking = index === active && !complete; return <div key={step.label} className={`grid grid-cols-[26px_1fr_auto] items-center gap-3 rounded-[13px] px-3 py-3 transition ${done || checking ? "bg-white/60" : "opacity-45"}`}><span className={`grid h-6 w-6 place-items-center rounded-full border text-[10px] ${done ? "border-[#b8d1bc] bg-[#e7f1e8] text-[#35543c]" : checking ? "border-accent-line bg-accent-tint text-accent" : "border-hair text-faint"}`}>{done ? "✓" : checking ? "…" : ""}</span><div><p className="text-[12px] font-semibold text-ink">{step.label}</p><p className="mt-0.5 text-[9.5px] text-faint">{step.source}</p></div><span className="text-[9px] font-semibold text-faint">{done ? "Complete" : checking ? "Checking" : "Waiting"}</span></div>; })}</div>{complete && <div className="mt-6 flex justify-end"><button onClick={() => setCowork({ ...cowork, stage: "flights", reasoningComplete: true })} className="rounded-full bg-ink px-5 py-3 text-[12px] font-semibold text-paper">See my flight recommendation →</button></div>}</div>;
}

function PriceBars({ base }: { base: number }) {
  const values = nearbyDatePrices(base); const max = Math.max(...values.map((item) => item.price)); const min = Math.min(...values.map((item) => item.price));
  return <div className="rounded-[16px] border border-hair bg-surface-2 p-4"><div className="flex h-24 items-end gap-2">{values.map((item) => { const height = 32 + ((item.price - min) / Math.max(1, max-min)) * 52; return <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-1"><span className="text-[8.5px] font-semibold text-faint">{IDR.format(item.price).replace("Rp", "").trim().replace(".000.000", "m")}</span><div className={`w-full max-w-10 rounded-t-[5px] ${item.label === "Your dates" ? "bg-ink" : "bg-[#d8d4c9]"}`} style={{ height }} /><span className="text-center text-[8px] text-faint">{item.label}</span></div>; })}</div><p className="mt-3 text-[9px] text-faint">Nearby-date comparison · simulated prototype fares</p></div>;
}

function FlightCard({ option, lead, onChoose, onTrack }: { option: FlightDecisionOption; lead?: boolean; onChoose: () => void; onTrack: () => void }) {
  return <article className={`rounded-[22px] border p-5 ${lead ? "border-ink bg-white shadow-[var(--shadow-card)]" : "border-hair bg-white/70"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-[9.5px] font-semibold ${lead ? "bg-ink text-paper" : "bg-surface-2 text-muted"}`}>{lead ? "Best fit for this trip" : option.purpose}</span><h3 className="mt-3 font-display text-[22px] font-semibold tracking-[-.025em]">{option.airline}</h3><p className="mt-1 text-[11px] text-muted">{option.route}</p></div><p className="font-display text-[21px] font-semibold">{IDR.format(option.price)} <span className="text-[10px] font-normal text-faint">pp</span></p></div><div className="mt-4 grid grid-cols-3 gap-2 rounded-[14px] bg-surface-2 p-3 text-center"><div><strong className="block text-[12px]">{option.depart}</strong><span className="text-[9px] text-faint">Depart</span></div><div><strong className="block text-[12px]">{option.duration}</strong><span className="text-[9px] text-faint">{option.stops}</span></div><div><strong className="block text-[12px]">{option.arrive}</strong><span className="text-[9px] text-faint">Arrive</span></div></div><div className="mt-3 flex flex-wrap gap-1.5">{[option.baggage, option.flexibility].map((tag) => <span key={tag} className="rounded-full border border-hair bg-white px-2.5 py-1 text-[9px] font-semibold text-muted">{tag}</span>)}</div><div className="mt-4 rounded-[13px] border border-hair-2 bg-[#fbfaf6] p-3"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Why it fits</p><p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{option.why}</p><p className="mt-2 text-[10.5px] text-muted"><strong>Trade-off:</strong> {option.tradeoff}</p></div>{lead && <div className="mt-4 flex flex-wrap gap-2"><button onClick={onChoose} className="rounded-full bg-ink px-4 py-2.5 text-[11px] font-semibold text-paper">Choose this flight</button><button onClick={onTrack} className="rounded-full border border-hair bg-white px-4 py-2.5 text-[11px] font-semibold text-ink">Track price</button></div>}</article>;
}

function FlightsStage({ trip, cowork, setCowork, onLearning, onNeedComposer, requestTrackedAction }: { trip: NonNullable<ReturnType<typeof useTrip>["trip"]>; cowork: CoworkState; setCowork: (next: CoworkState) => void; onLearning: (text: string) => void; onNeedComposer: (text: string) => void; requestTrackedAction: (action: string) => void }) {
  const { store } = useTrip(trip.id); const destination = tripDestination(trip); const options = flightOptions(destination);
  const lead = cowork.correctedAssumption && /cheap|price|budget|fare/i.test(cowork.correctedAssumption) ? options[1] : cowork.correctedAssumption && /fast|time|duration/i.test(cowork.correctedAssumption) ? options[2] : options[0];
  const alternatives = options.filter((item) => item.id !== lead.id); const [showAlt, setShowAlt] = useState(false);
  function choose() { store.patchTrip(trip.id, { componentStates: { ...trip.componentStates, flight: "saved" } }); setCowork({ ...cowork, selectedFlightId: lead.id, flightStatus: "Selected", stage: "hotel" }); onLearning(`For this trip, ${lead.airline} was worth choosing because ${lead.why.toLowerCase()}`); }
  return <div><p className="text-[10.5px] font-semibold uppercase tracking-[.13em] text-faint">Flight decision</p><h1 className="mt-2 max-w-[14ch] font-display text-[clamp(34px,4.8vw,50px)] font-semibold leading-[1] tracking-[-.04em]">I’d take this flight.</h1><p className="mt-3 max-w-[58ch] text-[13.5px] leading-relaxed text-muted">One recommendation first. The alternatives are here only when the trade-off is useful.</p><div className="mt-6"><FlightCard option={lead} lead onChoose={choose} onTrack={() => requestTrackedAction(`track:${lead.id}`)} /></div><div className="mt-5 grid gap-4 lg:grid-cols-[1fr_.9fr]"><PriceBars base={lead.price}/><section className="rounded-[18px] border border-hair bg-white/70 p-4"><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">What AITA ruled out</p><div className="mt-3 space-y-2 text-[11px] leading-relaxed text-ink-soft"><p>× Lower fare with an overnight layover — too much journey cost for the saving.</p><p>× A cheaper basic fare without enough checked baggage.</p><p>× Arrival timing that leaves too little recovery before fixed plans.</p></div></section></div><section className="mt-5 rounded-[18px] border border-hair bg-white/70 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Assumption check</p><p className="mt-1 text-[12px] font-semibold text-ink">A usable arrival and reasonable baggage matter more than the absolute lowest fare.</p></div><div className="flex gap-2"><button onClick={() => onLearning("A usable arrival and reasonable baggage matter more than the absolute lowest fare on this trip.")} className="rounded-full border border-hair bg-white px-3 py-1.5 text-[10px] font-semibold">That’s right</button><button onClick={() => onNeedComposer("Not quite — for this flight, what matters more is ")} className="rounded-full border border-hair bg-white px-3 py-1.5 text-[10px] font-semibold">Not quite</button></div></div></section><div className="mt-5"><button onClick={() => setShowAlt((value) => !value)} className="text-[11px] font-semibold text-accent">{showAlt ? "Hide alternatives" : "Show cheapest & fastest reasonable →"}</button>{showAlt && <div className="mt-3 grid gap-3 sm:grid-cols-2">{alternatives.map((item) => <FlightCard key={item.id} option={item} onChoose={() => {}} onTrack={() => {}} />)}</div>}</div><div className="mt-6 flex flex-wrap gap-3 text-[11px]"><button onClick={() => setShowAlt(true)} className="font-semibold text-muted">Show me another flight</button><button onClick={() => onNeedComposer("None of these flights work because ")} className="font-semibold text-muted">None of these work for me</button></div></div>;
}

function StayCard({ stay, lead, onChoose, onWatch }: { stay: StayDecisionOption; lead?: boolean; onChoose: () => void; onWatch: () => void }) {
  return <article className={`rounded-[22px] border p-5 ${lead ? "border-ink bg-white shadow-[var(--shadow-card)]" : "border-hair bg-white/70"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-[9.5px] font-semibold ${lead ? "bg-ink text-paper" : "bg-surface-2 text-muted"}`}>{lead ? "Best fit for this trip" : stay.purpose}</span><h3 className="mt-3 font-display text-[22px] font-semibold tracking-[-.025em]">{stay.name}</h3><p className="mt-1 text-[11px] font-semibold text-muted">{stay.area}</p></div><p className="font-display text-[21px] font-semibold">{IDR.format(stay.price)} <span className="text-[10px] font-normal text-faint">full stay</span></p></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-[13px] bg-surface-2 p-3"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Room</p><p className="mt-1 text-[11px] font-semibold text-ink">{stay.room}</p></div><div className="rounded-[13px] bg-surface-2 p-3"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Cancellation</p><p className="mt-1 text-[11px] font-semibold text-ink">{stay.cancellation}</p></div></div><div className="mt-3 space-y-1">{stay.eventTimes.map((time) => <p key={time} className="text-[10.5px] text-muted">↗ {time}</p>)}</div><div className="mt-4 rounded-[13px] border border-hair-2 bg-[#fbfaf6] p-3"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Why it fits</p><p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{stay.why}</p><p className="mt-2 text-[10.5px] text-muted"><strong>Trade-off:</strong> {stay.tradeoff}</p></div>{lead && <div className="mt-4 flex flex-wrap gap-2"><button onClick={onChoose} className="rounded-full bg-ink px-4 py-2.5 text-[11px] font-semibold text-paper">Choose this stay</button><button onClick={onWatch} className="rounded-full border border-hair bg-white px-4 py-2.5 text-[11px] font-semibold text-ink">Watch this stay</button><button className="rounded-full border border-hair bg-white px-4 py-2.5 text-[11px] font-semibold text-muted">See other rooms</button></div>}</article>;
}

function HotelStage({ trip, cowork, setCowork, onLearning, onNeedComposer, requestTrackedAction }: { trip: NonNullable<ReturnType<typeof useTrip>["trip"]>; cowork: CoworkState; setCowork: (next: CoworkState) => void; onLearning: (text: string) => void; onNeedComposer: (text: string) => void; requestTrackedAction: (action: string) => void }) {
  const { store } = useTrip(trip.id); const destination = tripDestination(trip); const options = stayOptions(destination, cowork.fixedEvents); const lead = options[0]; const [showAlt, setShowAlt] = useState(false);
  function choose() { store.patchTrip(trip.id, { componentStates: { ...trip.componentStates, stay: "saved" } }); setCowork({ ...cowork, selectedStayId: lead.id, stayStatus: "Selected", stage: "review", folderView: "plan" }); onLearning(`For this trip, ${lead.area} is the better base because it reduces travel around the plans that cannot move.`); }
  return <div><p className="text-[10.5px] font-semibold uppercase tracking-[.13em] text-faint">Stay decision</p><h1 className="mt-2 max-w-[14ch] font-display text-[clamp(34px,4.8vw,50px)] font-semibold leading-[1] tracking-[-.04em]">I’d stay here.</h1><p className="mt-3 max-w-[58ch] text-[13.5px] leading-relaxed text-muted">The property only wins if the neighborhood makes the rest of the trip easier.</p><div className="mt-6"><StayCard stay={lead} lead onChoose={choose} onWatch={() => requestTrackedAction(`watch-stay:${lead.id}`)} /></div><section className="mt-5 rounded-[18px] border border-hair bg-white/70 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Neighborhood reasoning</p><p className="mt-1 text-[12px] font-semibold text-ink">{lead.area} keeps your fixed plans in the same orbit.</p></div><button onClick={() => setCowork({ ...cowork, folderView: "map" })} className="rounded-full border border-hair bg-white px-3 py-1.5 text-[10px] font-semibold">Open map →</button></div><p className="mt-2 text-[11px] leading-relaxed text-muted">{lead.why}</p></section><section className="mt-5 rounded-[18px] border border-hair bg-white/70 p-4"><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">What AITA ruled out</p><div className="mt-3 space-y-2 text-[11px] leading-relaxed text-ink-soft">{options.slice(1).map((stay) => <p key={stay.id}>× <strong>{stay.area}:</strong> {stay.tradeoff}</p>)}</div></section><div className="mt-5"><button onClick={() => setShowAlt((value) => !value)} className="text-[11px] font-semibold text-accent">{showAlt ? "Hide alternatives" : "Show other stays →"}</button>{showAlt && <div className="mt-3 grid gap-3">{options.slice(1).map((stay) => <StayCard key={stay.id} stay={stay} onChoose={() => {}} onWatch={() => {}} />)}</div>}</div><div className="mt-5 flex flex-wrap gap-3 text-[11px]"><button onClick={() => setShowAlt(true)} className="font-semibold text-muted">Show me another stay</button><button onClick={() => onNeedComposer("None of these stays work because ")} className="font-semibold text-muted">None of these work for me</button></div></div>;
}

function ReadinessItem({ label, status, href }: { label: string; status: string; href?: string }) { const content = <div className="flex items-center justify-between gap-3 rounded-[13px] border border-hair bg-white/70 px-3 py-3"><span className="text-[11.5px] font-semibold text-ink">{label}</span><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${status === "Booked" || status === "Complete" ? "bg-[#e7f1e8] text-[#35543c]" : status === "Tracked" ? "bg-[#eeedf8] text-[#4a4f91]" : status === "Selected" ? "bg-accent-tint text-accent" : status === "Needs attention" ? "bg-amber-tint text-amber" : "bg-surface-2 text-muted"}`}>{status}</span></div>; return href ? <Link href={href}>{content}</Link> : content; }

function ReviewStage({ trip, cowork, setCowork, requestTrackedAction }: { trip: NonNullable<ReturnType<typeof useTrip>["trip"]>; cowork: CoworkState; setCowork: (next: CoworkState) => void; requestTrackedAction: (action: string) => void }) {
  const { store } = useTrip(trip.id); const [showGroup, setShowGroup] = useState(cowork.invitedSample); const [showOtter, setShowOtter] = useState(false);
  const flightStatus = cowork.flightStatus; const stayStatus = cowork.stayStatus;
  function invite() { requestTrackedAction("invite"); }
  return <div><p className="text-[10.5px] font-semibold uppercase tracking-[.13em] text-faint">Trip readiness</p><h1 className="mt-2 max-w-[14ch] font-display text-[clamp(34px,4.8vw,50px)] font-semibold leading-[1] tracking-[-.04em]">The big decisions are taking shape.</h1><p className="mt-3 max-w-[60ch] text-[13.5px] leading-relaxed text-muted">Keep essentials distinct from things you can plan whenever you feel like it. Nothing optional is made to look urgent.</p><div className="mt-7 grid gap-5 lg:grid-cols-3"><section><p className="mb-2 text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Big decisions</p><div className="space-y-2"><ReadinessItem label="Flights" status={flightStatus}/><ReadinessItem label="Hotels" status={stayStatus}/><ReadinessItem label="Entry requirements / visa" status="Not started"/><ReadinessItem label="Travel insurance" status="Not started"/><ReadinessItem label="eSIM" status="Not started"/><ReadinessItem label="Airport transfer" status="Not started"/></div></section><section><p className="mb-2 text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Time-sensitive reservations</p><div className="space-y-2"><ReadinessItem label="Restaurants" status="Not started"/><ReadinessItem label="Activities" status="Not started"/><ReadinessItem label="Tickets" status="Not started"/><ReadinessItem label="Reservation windows" status="Reviewing"/></div></section><section><p className="mb-2 text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Whenever you’re ready</p><div className="space-y-2"><ReadinessItem label="Add places" status="Not started"/><ReadinessItem label="Fill free time" status="Not started"/><ReadinessItem label="Invite travelers" status={cowork.invitedSample ? "Complete" : "Not started"}/><ReadinessItem label="Share itinerary" status="Not started"/><ReadinessItem label="Personalize Trip Brain" status={cowork.brain.length ? "Reviewing" : "Not started"}/></div></section></div>

    <section className="mt-7 rounded-[22px] border border-hair bg-white/72 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Group-trip prototype</p><h2 className="mt-1 font-display text-[21px] font-semibold">Keep the owner in control, let everyone contribute.</h2><p className="mt-2 max-w-[56ch] text-[11.5px] leading-relaxed text-muted">Share the same Trip Brief, fixed events, and product placeholders. The organizer remains the default purchase approver.</p></div><button onClick={() => showGroup ? setShowGroup(false) : invite()} className="rounded-full border border-hair bg-white px-4 py-2.5 text-[10.5px] font-semibold text-ink">{showGroup ? "Hide group preview" : "Invite sample traveler"}</button></div>{showGroup && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-[15px] bg-surface-2 p-4"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Traveler responses</p><p className="mt-2 text-[11px] font-semibold">Matthew · Joined</p><p className="mt-1 text-[10px] text-muted">“Direct if the difference is reasonable.”</p><p className="mt-3 text-[11px] font-semibold">Stacey · Invited</p><p className="mt-1 text-[10px] text-muted">Traveler details pending</p></div><div className="rounded-[15px] bg-surface-2 p-4"><label className="flex items-center justify-between gap-3 text-[11px] font-semibold"><span>I’m booking for everyone</span><input type="checkbox" checked={cowork.groupBookingForEveryone} onChange={(event) => setCowork({ ...cowork, groupBookingForEveryone: event.target.checked })}/></label><div className="mt-3 rounded-[12px] border border-[#dfd2bd] bg-[#f6efe3] p-3"><p className="text-[10.5px] font-semibold">6 seats left at this fare</p><p className="mt-1 text-[9px] text-faint">Simulated inventory for prototype demonstration only.</p></div><p className="mt-3 text-[9.5px] text-faint">Organizer approval is required before any purchase action.</p></div></div>}</section>

    <section className="mt-7 overflow-hidden rounded-[24px] border border-hair bg-ink text-paper"><div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-paper/55">OtterWay continuation</p><h2 className="mt-2 font-display text-[25px] font-semibold tracking-[-.03em]">Continue planning in OtterWay</h2><p className="mt-2 max-w-[54ch] text-[12px] leading-relaxed text-paper/70">Bring your bookings, places, and plans into one shared itinerary.</p></div><Link href={`/trips/${trip.id}/itinerary?handoff=otterway`} className="rounded-full bg-paper px-5 py-2.5 text-[11px] font-semibold text-ink">Continue planning in OtterWay →</Link></div><div className="border-t border-white/10 bg-white/[.04] p-5"><div className="grid gap-2 sm:grid-cols-4">{["Collaborative itinerary","Saved Instagram & TikTok places","Comments & voting","Route planning & map","Collections","Expenses","Active-trip mode","Bookings carried over"].map((item) => <span key={item} className="rounded-[11px] border border-white/10 bg-white/[.05] px-3 py-2 text-[9.5px] text-paper/75">{item}</span>)}</div><div className="mt-4 flex flex-wrap gap-3 text-[10px] font-semibold text-paper/65"><button onClick={() => setShowOtter(!showOtter)}>Share this itinerary</button><button onClick={() => setShowGroup(true)}>Start collaborating</button><button onClick={() => setShowOtter(!showOtter)}>Download the OtterWay app</button></div>{showOtter && <p className="mt-3 rounded-[12px] bg-white/[.06] p-3 text-[9.5px] leading-relaxed text-paper/60">Prototype preview only — app download, sharing, and cross-product account handoff are not live integrations in this build. The trip context is preserved inside this prototype.</p>}</div></section>
  </div>;
}

function Composer({ stage, value, setValue, onSubmit }: { stage: CoworkState["stage"]; value: string; setValue: (value: string) => void; onSubmit: () => void }) {
  const config = stage === "flights" ? { placeholder: "Refine these flights…", chips: ["Prioritize lower fare","Avoid overnight flying","Arrive earlier"] } : stage === "hotel" ? { placeholder: "Change what we’re looking for in a stay…", chips: ["Closer to fixed events","Better room","Keep cancellation flexible"] } : stage === "review" ? { placeholder: "What should we change about this trip?", chips: ["Keep Saturday open","Invite the group","Review the budget"] } : { placeholder: "What should we change about this trip?", chips: ["Add a fixed event","Keep day one light","Avoid red-eyes"] };
  return <div className="sticky bottom-0 z-30 -mx-2 mt-8 bg-gradient-to-t from-paper via-paper/95 to-transparent px-2 pb-3 pt-7"><div className="mb-2 flex gap-1.5 overflow-x-auto">{config.chips.map((chip) => <button key={chip} onClick={() => setValue(chip)} className="shrink-0 rounded-full border border-hair bg-white/85 px-3 py-1.5 text-[9.5px] font-semibold text-muted">{chip}</button>)}</div><div className="flex items-center gap-2 rounded-[18px] border border-hair bg-white p-1.5 shadow-[0_12px_36px_-20px_rgba(27,26,23,.35)] focus-within:border-accent"><input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onSubmit()} placeholder={config.placeholder} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[12.5px] outline-none placeholder:text-faint"/><button onClick={onSubmit} className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-ink text-paper" aria-label="Apply trip refinement">→</button></div></div>;
}

export function CoworkWorkspace({ tripId }: { tripId: string }) {
  const { trip, store, hydrated } = useTrip(tripId);
  const [cowork, setCoworkState] = useState<CoworkState | null>(null);
  const [mobileFolder, setMobileFolder] = useState(false);
  const [composer, setComposer] = useState("");
  const [learning, setLearning] = useState<string | null>(null);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [previewChange, setPreviewChange] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const setCowork = (next: CoworkState) => { setCoworkState(next); if (trip) persistCowork(trip.id, next); };

  useEffect(() => {
    if (!hydrated || !trip) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoworkState(loadCowork(trip));
  }, [hydrated, trip]);

  useEffect(() => {
    if (!trip || !cowork) return;
    const applyPayload = (payload: { tripId?: string | null; items?: { group: ImportGroup["key"]; item: string }[] }) => {
      if (payload.tripId && payload.tripId !== trip.id) return;
      const items = payload.items ?? [];
      const fixed = items.filter((item) => item.group === "events").map((item, index) => { const [title, rest] = item.item.split(" at "); return { id: `import-event-${index}-${Date.now()}`, title: title || "Fixed event", place: rest?.split(" · ")[0] || "Imported place", when: rest?.split(" · ")[1] || "Time imported", source: "ai-import" as const }; });
      const places = items.filter((item) => item.group === "places").map((item) => item.item);
      setCowork({ ...cowork, imported: true, fixedEvents: [...cowork.fixedEvents, ...fixed], savedPlaces: [...new Set([...cowork.savedPlaces, ...places])] });
    };
    const listener = (event: Event) => applyPayload((event as CustomEvent).detail ?? {});
    window.addEventListener("roaminrabbit:ai-context", listener);
    try { const raw = sessionStorage.getItem(PENDING_IMPORT_KEY); if (raw) { const payload = JSON.parse(raw); applyPayload(payload); sessionStorage.removeItem(PENDING_IMPORT_KEY); } } catch { /* optional */ }
    return () => window.removeEventListener("roaminrabbit:ai-context", listener);
    // cowork intentionally excluded: event listener is refreshed when trip changes, not on every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id]);

  if (!hydrated || !trip || !cowork) return <div className="mx-auto grid min-h-[70dvh] max-w-[1180px] grid-cols-1 gap-4 px-5 py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(330px,.65fr)]"><div className="rounded-[24px] shimmer"/><div className="hidden rounded-[24px] shimmer lg:block"/></div>;

  function addLearning(text: string) {
    setLearning(text);
    const exists = cowork.brain.some((entry) => entry.statement === text);
    if (!exists) setCowork({ ...cowork, brain: [...cowork.brain, { id: `decision-${Date.now()}`, statement: text, category: "Decision", scope: "this-trip", source: "decision" }] });
  }

  function saveLearning(scope: "all" | "similar" | "this-trip" | "none") {
    if (!learning || scope === "none") { setLearning(null); setScopeOpen(false); return; }
    if (scope !== "this-trip") store.addPref({ category: "Flights", statement: learning, priority: "usually", scope, source: "confirmed", confidence: 1 });
    setCowork({ ...cowork, brain: cowork.brain.map((entry) => entry.statement === learning ? { ...entry, scope: scope === "this-trip" ? "this-trip" : scope } : entry) });
    setLearning(null); setScopeOpen(false);
  }

  function submitComposer() {
    const text = composer.trim(); if (!text) return;
    if (/\b(cancel|replace|change dates?|book|pay)\b/i.test(text)) { setPreviewChange(text); return; }
    store.addBriefItem(trip.id, text, "prioritize");
    setCowork({ ...cowork, correctedAssumption: text, brain: [...cowork.brain, { id: `composer-${Date.now()}`, statement: text, category: "Trip refinement", scope: "this-trip", source: "trip" }] });
    setComposer("");
  }

  function confirmPreviewChange() {
    if (!previewChange) return;
    store.addBriefItem(trip.id, `Requested change: ${previewChange}`, "prioritize");
    setCowork({ ...cowork, correctedAssumption: previewChange });
    setComposer(""); setPreviewChange(null);
  }

  function executePending() {
    if (!pendingAction) return;
    const destination = tripDestination(trip);
    if (pendingAction.startsWith("track:")) {
      const id = pendingAction.split(":")[1]; const option = flightOptions(destination).find((item) => item.id === id);
      if (option) { store.trackFlight(trip.id, { id: option.id, airline: option.airline, route: option.route, depart: option.depart, arrive: option.arrive, duration: option.duration, stops: option.stops, originalFare: option.price, currentFare: option.price }); setCowork({ ...cowork, selectedFlightId: id, flightStatus: "Tracked" }); addLearning("Price matters enough on this trip to track the best-fit flight before booking."); }
    } else if (pendingAction.startsWith("watch-stay:")) {
      const id = pendingAction.split(":")[1]; store.patchTrip(trip.id, { componentStates: { ...trip.componentStates, stay: "tracked" } }); setCowork({ ...cowork, selectedStayId: id, stayStatus: "Tracked", stage: "review" });
    } else if (pendingAction === "invite") {
      const collaborator = { id: "traveler-matt", name: "Matthew", email: "matt@example.com", status: "joined" as const };
      store.patchTrip(trip.id, { collaborators: trip.collaborators.some((item) => item.id === collaborator.id) ? trip.collaborators : [...trip.collaborators, collaborator] });
      setCowork({ ...cowork, invitedSample: true });
    }
    setPendingAction(null);
  }

  const decision = cowork.stage === "brief" ? <BriefStage tripId={trip.id} trip={trip} cowork={cowork} setCowork={setCowork} onContinue={() => setCowork({ ...cowork, stage: "reasoning" })}/> : cowork.stage === "reasoning" ? <ReasoningStage cowork={cowork} setCowork={setCowork}/> : cowork.stage === "flights" ? <FlightsStage trip={trip} cowork={cowork} setCowork={setCowork} onLearning={addLearning} onNeedComposer={(text) => setComposer(text)} requestTrackedAction={setPendingAction}/> : cowork.stage === "hotel" ? <HotelStage trip={trip} cowork={cowork} setCowork={setCowork} onLearning={addLearning} onNeedComposer={(text) => setComposer(text)} requestTrackedAction={setPendingAction}/> : <ReviewStage trip={trip} cowork={cowork} setCowork={setCowork} requestTrackedAction={setPendingAction}/>;

  return <div className="mx-auto max-w-[1420px] px-4 py-5 sm:px-5 md:px-7"><div className="mb-4 flex items-center justify-between gap-3"><StageNav stage={cowork.stage} onStage={(stage) => setCowork({ ...cowork, stage })}/><button onClick={() => setMobileFolder(true)} className="rounded-full border border-hair bg-white px-4 py-2 text-[11px] font-semibold text-ink lg:hidden">Trip · {cowork.folderView === "brain" ? "Brain" : cowork.folderView[0].toUpperCase()+cowork.folderView.slice(1)}</button></div><div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.28fr)_minmax(340px,.72fr)] xl:gap-7"><main className="min-w-0 rounded-[26px] border border-hair bg-[rgba(249,247,241,.54)] p-5 shadow-[0_18px_60px_-50px_rgba(27,26,23,.4)] sm:p-7 lg:min-h-[calc(100dvh-112px)]">{decision}<Composer stage={cowork.stage} value={composer} setValue={setComposer} onSubmit={submitComposer}/></main><div className="hidden lg:block"><WorkingFolder trip={trip} cowork={cowork} setCowork={setCowork} profile={store.profile}/></div></div>{mobileFolder && <WorkingFolder trip={trip} cowork={cowork} setCowork={setCowork} profile={store.profile} mobile onClose={() => setMobileFolder(false)}/>} 

    {learning && <div className="fixed bottom-5 left-1/2 z-[95] w-[min(620px,calc(100vw-32px))] -translate-x-1/2 rounded-[18px] border border-hair bg-white p-4 shadow-[var(--shadow-pop)]"><div className="flex items-start justify-between gap-4"><div><p className="text-[9.5px] font-semibold uppercase tracking-[.1em] text-faint">Added to this trip</p><p className="mt-1 text-[11.5px] font-semibold leading-snug text-ink">{learning}</p></div><button onClick={() => setLearning(null)} className="text-faint">×</button></div><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => setScopeOpen(true)} className="rounded-full border border-hair px-3 py-1.5 text-[9.5px] font-semibold">Save for future trips</button><button onClick={() => saveLearning("this-trip")} className="rounded-full border border-hair px-3 py-1.5 text-[9.5px] font-semibold">This trip only</button><button onClick={() => { setCowork({ ...cowork, folderView: "brain" }); setMobileFolder(true); setLearning(null); }} className="rounded-full border border-hair px-3 py-1.5 text-[9.5px] font-semibold">View Trip Brain</button><button onClick={() => setLearning(null)} className="px-2 py-1.5 text-[9.5px] font-semibold text-faint">Undo</button></div></div>}
    {scopeOpen && <div className="fixed inset-0 z-[110] grid place-items-center bg-ink/18 p-5"><button className="absolute inset-0" onClick={() => setScopeOpen(false)} aria-label="Close preference scope"/><div className="relative z-10 w-full max-w-[420px] rounded-[22px] border border-hair bg-[#f9f7f1] p-5 shadow-[var(--shadow-pop)]"><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Where should AITA remember this?</p><h3 className="mt-1 font-display text-[21px] font-semibold">Choose the scope yourself</h3><div className="mt-4 grid gap-2">{[["all","All trips"],["similar","Trips like this"],["this-trip","This trip only"],["none","Don’t save"]].map(([value,label]) => <button key={value} onClick={() => saveLearning(value as "all"|"similar"|"this-trip"|"none")} className="rounded-[13px] border border-hair bg-white px-4 py-3 text-left text-[11.5px] font-semibold text-ink hover:border-ink/30">{label}</button>)}</div></div></div>}
    {previewChange && <div className="fixed inset-0 z-[110] grid place-items-center bg-ink/18 p-5"><button className="absolute inset-0" onClick={() => setPreviewChange(null)} aria-label="Cancel proposed change"/><div className="relative z-10 w-full max-w-[480px] rounded-[22px] border border-hair bg-[#f9f7f1] p-5 shadow-[var(--shadow-pop)]"><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">Preview consequential change</p><h3 className="mt-1 font-display text-[22px] font-semibold">AITA won’t apply this silently.</h3><p className="mt-3 rounded-[13px] bg-white p-3 text-[12px] leading-relaxed text-ink-soft">{previewChange}</p><p className="mt-3 text-[10.5px] leading-relaxed text-muted">This prototype records the requested change in the Trip Brief. Real date changes, replacements, cancellations, bookings, or payments would require another explicit approval before execution.</p><div className="mt-4 flex justify-end gap-2"><button onClick={() => setPreviewChange(null)} className="rounded-full px-4 py-2 text-[10.5px] font-semibold text-muted">Cancel</button><button onClick={confirmPreviewChange} className="rounded-full bg-ink px-4 py-2 text-[10.5px] font-semibold text-paper">Add request to trip</button></div></div></div>}
    {pendingAction && <div className="fixed inset-0 z-[110] grid place-items-center bg-ink/18 p-5"><button className="absolute inset-0" onClick={() => setPendingAction(null)} aria-label="Cancel persistence action"/><div className="relative z-10 w-full max-w-[470px] rounded-[22px] border border-hair bg-[#f9f7f1] p-5 shadow-[var(--shadow-pop)]"><p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">A meaningful persistence moment</p><h3 className="mt-1 font-display text-[22px] font-semibold">In the real product, this is where sign-in would help.</h3><p className="mt-3 text-[11.5px] leading-relaxed text-muted">Tracking alerts, traveler invitations, and cross-device persistence need an account. This prototype has no live authentication, so you can preview the behavior locally without losing the guest trip.</p><div className="mt-4 flex justify-end gap-2"><button onClick={() => setPendingAction(null)} className="rounded-full px-4 py-2 text-[10.5px] font-semibold text-muted">Cancel</button><button onClick={executePending} className="rounded-full bg-ink px-4 py-2 text-[10.5px] font-semibold text-paper">Preview without signing in</button></div></div></div>}
  </div>;
}
