"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { WorkingFolder } from "@/components/working-folder";
import {
  COWORK_STORAGE_KEY,
  GUIDED_QUESTIONS,
  PENDING_IMPORT_KEY,
  SAMPLE_CALENDAR_EVENTS,
  defaultCoworkState,
  extractBriefItems,
  flightOptions,
  nearbyDatePrices,
  stayOptions,
  tripDestination,
  type CoworkState,
  type FixedEvent,
  type FlightDecisionOption,
  type ImportGroup,
  type StayDecisionOption,
} from "@/lib/cowork";
import { useTrip } from "@/lib/store";
import type { BriefLevel, Trip } from "@/lib/types";

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

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
    /* prototype-only local persistence */
  }
}

function StageNav({
  stage,
  go,
}: {
  stage: CoworkState["stage"];
  go: (stage: CoworkState["stage"]) => void;
}) {
  const stages: { id: CoworkState["stage"]; label: string }[] = [
    { id: "brief", label: "Trip Brief" },
    { id: "flights", label: "Flight" },
    { id: "hotel", label: "Stay" },
    { id: "review", label: "Ready" },
  ];
  return (
    <div className="flex min-w-0 gap-1 overflow-x-auto rounded-full bg-paper-2/70 p-1">
      {stages.map((item) => (
        <button
          key={item.id}
          onClick={() => go(item.id)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-[10.5px] font-semibold ${
            stage === item.id || (stage === "reasoning" && item.id === "brief")
              ? "bg-white text-ink shadow-sm"
              : "text-muted"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function BriefColumn({
  title,
  level,
  trip,
  move,
}: {
  title: string;
  level: BriefLevel;
  trip: Trip;
  move: (id: string, level: BriefLevel) => void;
}) {
  const items = trip.brief.items.filter((item) => item.level === level);
  return (
    <section className="rounded-[17px] border border-hair bg-white/72 p-4">
      <div className="flex justify-between">
        <p className="text-[9.5px] font-semibold uppercase tracking-[.11em] text-faint">{title}</p>
        <span className="text-[9px] text-faint">{items.length}</span>
      </div>
      <div className="mt-2 space-y-2">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} draggable className="rounded-[11px] bg-surface-2 p-3">
              <p className="text-[11px] font-medium leading-snug">{item.statement}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(["must", "prioritize", "flexible", "avoid"] as BriefLevel[])
                  .filter((next) => next !== level)
                  .map((next) => (
                    <button
                      key={next}
                      onClick={() => move(item.id, next)}
                      className="rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-faint"
                    >
                      → {next === "must" ? "protect" : next}
                    </button>
                  ))}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[11px] border border-dashed border-hair p-4 text-center text-[10px] text-faint">
            Nothing here yet.
          </div>
        )}
      </div>
    </section>
  );
}

const WORK = [
  ["Understanding your non-negotiables", "Trip Brief"],
  ["Checking your Trip Brain", "Traveler Profile"],
  ["Reviewing fixed calendar events", "Calendar · simulated when previewed"],
  ["Screening relevant flight and hotel options", "Prototype inventory"],
  ["Comparing nearby dates", "Prototype price patterns"],
  ["Checking neighborhoods against your plans", "Maps & travel times · simulated"],
  ["Cross-referencing timing and travel logistics", "Trip context"],
  ["Building your recommendation", "AITA"],
] as const;

function Reasoning({
  current,
  update,
}: {
  current: CoworkState;
  update: (fn: (value: CoworkState) => CoworkState) => void;
}) {
  const [index, setIndex] = useState(current.reasoningComplete ? WORK.length : 0);
  useEffect(() => {
    if (current.reasoningComplete) return;
    const timer = window.setInterval(
      () => setIndex((value) => Math.min(WORK.length, value + 1)),
      420
    );
    return () => window.clearInterval(timer);
  }, [current.reasoningComplete]);

  const done = current.reasoningComplete || index === WORK.length;
  return (
    <div className="mx-auto max-w-[650px] py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-faint">
        AITA is working across the trip
      </p>
      <h1 className="mt-2 font-display text-[clamp(34px,4.5vw,48px)] font-semibold leading-[1] tracking-[-.04em]">
        Cross-checking before I recommend anything.
      </h1>
      <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
        This shows work progress, not hidden chain-of-thought. Inventory, prices, maps, and calendar signals are deterministic prototype data unless labeled otherwise.
      </p>
      <div className="mt-6 space-y-1">
        {WORK.map(([label, source], i) => {
          const complete = i < index;
          const checking = i === index && !done;
          return (
            <div
              key={label}
              className={`grid grid-cols-[26px_1fr_auto] items-center gap-3 rounded-[12px] px-3 py-3 ${
                complete || checking ? "bg-white/65" : "opacity-40"
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border text-[10px] ${
                  complete
                    ? "border-[#b8d1bc] bg-[#e7f1e8] text-[#35543c]"
                    : checking
                      ? "border-accent-line bg-accent-tint text-accent"
                      : "border-hair"
                }`}
              >
                {complete ? "✓" : checking ? "…" : ""}
              </span>
              <div>
                <p className="text-[11.5px] font-semibold">{label}</p>
                <p className="text-[9px] text-faint">{source}</p>
              </div>
              <span className="text-[8.5px] font-semibold text-faint">
                {complete ? "Complete" : checking ? "Checking" : "Waiting"}
              </span>
            </div>
          );
        })}
      </div>
      {done && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => update((value) => ({ ...value, reasoningComplete: true, stage: "flights" }))}
            className="rounded-full bg-ink px-5 py-3 text-[11.5px] font-semibold text-paper"
          >
            See my flight recommendation →
          </button>
        </div>
      )}
    </div>
  );
}

function PriceBars({ base }: { base: number }) {
  const values = nearbyDatePrices(base);
  const max = Math.max(...values.map((x) => x.price));
  const min = Math.min(...values.map((x) => x.price));
  return (
    <div className="rounded-[16px] border border-hair bg-surface-2 p-4">
      <div className="flex h-24 items-end gap-2">
        {values.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[8px] text-faint">{Math.round(item.price / 1_000_000)}m</span>
            <div
              className={`w-full max-w-10 rounded-t-[5px] ${item.label === "Your dates" ? "bg-ink" : "bg-[#d8d4c9]"}`}
              style={{ height: 34 + ((item.price - min) / Math.max(1, max - min)) * 48 }}
            />
            <span className="text-[8px] text-faint">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[9px] text-faint">Nearby-date comparison · simulated prototype fares</p>
    </div>
  );
}

function FlightCard({
  option,
  lead,
  choose,
  track,
}: {
  option: FlightDecisionOption;
  lead?: boolean;
  choose?: () => void;
  track?: () => void;
}) {
  return (
    <article className={`rounded-[21px] border p-5 ${lead ? "border-ink bg-white shadow-[var(--shadow-card)]" : "border-hair bg-white/70"}`}>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${lead ? "bg-ink text-paper" : "bg-surface-2 text-muted"}`}>
            {lead ? "Best fit for this trip" : option.purpose}
          </span>
          <h3 className="mt-3 font-display text-[21px] font-semibold">{option.airline}</h3>
          <p className="mt-1 text-[10.5px] text-muted">{option.route}</p>
        </div>
        <p className="font-display text-[19px] font-semibold">
          {IDR.format(option.price)} <span className="text-[9px] font-normal text-faint">pp</span>
        </p>
      </div>
      <div className="mt-4 grid grid-cols-3 rounded-[13px] bg-surface-2 p-3 text-center">
        <div><b className="block text-[12px]">{option.depart}</b><span className="text-[8.5px] text-faint">Depart</span></div>
        <div><b className="block text-[12px]">{option.duration}</b><span className="text-[8.5px] text-faint">{option.stops}</span></div>
        <div><b className="block text-[12px]">{option.arrive}</b><span className="text-[8.5px] text-faint">Arrive</span></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {[option.baggage, option.flexibility].map((tag) => (
          <span key={tag} className="rounded-full border border-hair px-2.5 py-1 text-[8.5px] font-semibold text-muted">{tag}</span>
        ))}
      </div>
      <div className="mt-4 rounded-[13px] bg-[#fbfaf6] p-3">
        <p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Why this fits</p>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{option.why}</p>
        <p className="mt-2 text-[10px] text-muted"><b>Trade-off:</b> {option.tradeoff}</p>
      </div>
      {lead && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={choose} className="rounded-full bg-ink px-4 py-2.5 text-[10.5px] font-semibold text-paper">Choose this flight</button>
          <button onClick={track} className="rounded-full border border-hair px-4 py-2.5 text-[10.5px] font-semibold">Track price</button>
        </div>
      )}
    </article>
  );
}

function StayCard({
  option,
  lead,
  choose,
  watch,
}: {
  option: StayDecisionOption;
  lead?: boolean;
  choose?: () => void;
  watch?: () => void;
}) {
  return (
    <article className={`rounded-[21px] border p-5 ${lead ? "border-ink bg-white shadow-[var(--shadow-card)]" : "border-hair bg-white/70"}`}>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${lead ? "bg-ink text-paper" : "bg-surface-2 text-muted"}`}>
            {lead ? "Best fit for this trip" : option.purpose}
          </span>
          <h3 className="mt-3 font-display text-[21px] font-semibold">{option.name}</h3>
          <p className="mt-1 text-[10.5px] font-semibold text-muted">{option.area}</p>
        </div>
        <p className="font-display text-[19px] font-semibold">
          {IDR.format(option.price)} <span className="text-[9px] font-normal text-faint">full stay</span>
        </p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-[12px] bg-surface-2 p-3"><p className="text-[8.5px] uppercase text-faint">Room setup</p><p className="mt-1 text-[10.5px] font-semibold">{option.room}</p></div>
        <div className="rounded-[12px] bg-surface-2 p-3"><p className="text-[8.5px] uppercase text-faint">Cancellation</p><p className="mt-1 text-[10.5px] font-semibold">{option.cancellation}</p></div>
      </div>
      <div className="mt-3">
        {option.eventTimes.map((time) => <p key={time} className="text-[10px] text-muted">↗ {time}</p>)}
      </div>
      <div className="mt-4 rounded-[13px] bg-[#fbfaf6] p-3">
        <p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">Why this fits</p>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{option.why}</p>
        <p className="mt-2 text-[10px] text-muted"><b>Trade-off:</b> {option.tradeoff}</p>
      </div>
      {lead && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={choose} className="rounded-full bg-ink px-4 py-2.5 text-[10.5px] font-semibold text-paper">Choose this stay</button>
          <button onClick={watch} className="rounded-full border border-hair px-4 py-2.5 text-[10.5px] font-semibold">Watch this stay</button>
          <button className="rounded-full border border-hair px-4 py-2.5 text-[10.5px] font-semibold text-muted">See other rooms</button>
        </div>
      )}
    </article>
  );
}

function Readiness({ label, status }: { label: string; status: string }) {
  const tone = status === "Booked" || status === "Complete"
    ? "bg-[#e7f1e8] text-[#35543c]"
    : status === "Tracked"
      ? "bg-[#eeedf8] text-[#4a4f91]"
      : status === "Selected"
        ? "bg-accent-tint text-accent"
        : "bg-surface-2 text-muted";
  return (
    <div className="flex items-center justify-between rounded-[12px] border border-hair bg-white/70 px-3 py-3">
      <span className="text-[10.5px] font-semibold">{label}</span>
      <span className={`rounded-full px-2 py-1 text-[8.5px] font-semibold ${tone}`}>{status}</span>
    </div>
  );
}

export function CoworkWorkspace({ tripId }: { tripId: string }) {
  const { trip, store, hydrated } = useTrip(tripId);
  const [cowork, setCowork] = useState<CoworkState | null>(null);
  const [mobileFolder, setMobileFolder] = useState(false);
  const [composer, setComposer] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState({ title: "", place: "", when: "" });
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [learning, setLearning] = useState<string | null>(null);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [previewChange, setPreviewChange] = useState<string | null>(null);
  const [showGroup, setShowGroup] = useState(false);

  useEffect(() => {
    if (!hydrated || !trip) return;
    // Hydrate from a browser-local prototype store after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCowork(loadCowork(trip));
  }, [hydrated, trip]);

  useEffect(() => {
    if (!hydrated || !trip) return;
    const activeTrip = trip;
    const applyPayload = (payload?: {
      tripId?: string | null;
      items?: { group: ImportGroup["key"]; item: string }[];
    }) => {
      if (!payload || (payload.tripId && payload.tripId !== activeTrip.id)) return;
      const items = payload.items ?? [];
      const fixed: FixedEvent[] = items
        .filter((item) => item.group === "events")
        .map((item, index) => ({
          id: `import-${Date.now()}-${index}`,
          title: item.item.split(" at ")[0] || "Fixed event",
          place: item.item.split(" at ")[1]?.split(" · ")[0] || "Imported place",
          when: item.item.split(" · ").slice(-1)[0] || "Imported time",
          source: "ai-import" as const,
        }));
      const places = items.filter((item) => item.group === "places").map((item) => item.item);
      setCowork((previous) => {
        const base = previous ?? loadCowork(activeTrip);
        const next = {
          ...base,
          imported: true,
          fixedEvents: [...base.fixedEvents, ...fixed],
          savedPlaces: [...new Set([...base.savedPlaces, ...places])],
        };
        persistCowork(activeTrip.id, next);
        return next;
      });
    };
    const listener = (event: Event) => {
      applyPayload((event as CustomEvent<Parameters<typeof applyPayload>[0]>).detail);
    };
    window.addEventListener("roaminrabbit:ai-context", listener);
    try {
      const raw = sessionStorage.getItem(PENDING_IMPORT_KEY);
      if (raw) {
        applyPayload(JSON.parse(raw));
        sessionStorage.removeItem(PENDING_IMPORT_KEY);
      }
    } catch {
      /* optional import preview */
    }
    return () => window.removeEventListener("roaminrabbit:ai-context", listener);
  }, [hydrated, trip]);

  if (!hydrated || !trip || !cowork) {
    return (
      <div className="mx-auto grid min-h-[70dvh] max-w-[1180px] gap-4 px-5 py-8 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-[24px] shimmer" />
        <div className="hidden rounded-[24px] shimmer lg:block" />
      </div>
    );
  }

  const current = cowork;
  const activeTrip = trip;
  const destination = tripDestination(activeTrip);
  const flights = flightOptions(destination);
  const stays = stayOptions(destination, current.fixedEvents);
  const leadFlight = current.correctedAssumption && /cheap|price|budget|fare/i.test(current.correctedAssumption)
    ? flights[1]
    : current.correctedAssumption && /fast|time|duration/i.test(current.correctedAssumption)
      ? flights[2]
      : flights[0];
  const leadStay = stays[0];

  function update(fn: (value: CoworkState) => CoworkState) {
    setCowork((previous) => {
      const next = fn(previous ?? current);
      persistCowork(activeTrip.id, next);
      return next;
    });
  }

  function learn(statement: string) {
    setLearning(statement);
    update((value) => value.brain.some((item) => item.statement === statement)
      ? value
      : {
          ...value,
          brain: [
            ...value.brain,
            {
              id: `brain-${Date.now()}`,
              statement,
              category: "Decision",
              scope: "this-trip",
              source: "decision",
            },
          ],
        }
    );
  }

  function saveLearning(scope: "all" | "similar" | "this-trip" | "none") {
    if (!learning) return;
    if (scope !== "none" && scope !== "this-trip") {
      store.addPref({
        category: "Flights",
        statement: learning,
        priority: "usually",
        scope,
        source: "confirmed",
        confidence: 1,
      });
    }
    if (scope !== "none") {
      update((value) => ({
        ...value,
        brain: value.brain.map((item) => item.statement === learning
          ? { ...item, scope: scope === "this-trip" ? "this-trip" : scope }
          : item),
      }));
    }
    setLearning(null);
    setScopeOpen(false);
  }

  function addFixedEvent(event?: FixedEvent) {
    const next = event ?? {
      id: `event-${Date.now()}`,
      title: eventDraft.title.trim(),
      place: eventDraft.place.trim(),
      when: eventDraft.when.trim(),
      source: "user" as const,
    };
    if (!next.title || !next.place || !next.when) return;
    update((value) => ({
      ...value,
      fixedEvents: [...value.fixedEvents.filter((item) => item.id !== next.id), next],
    }));
    if (!activeTrip.brief.items.some((item) => item.statement.includes(next.title))) {
      store.addBriefItem(activeTrip.id, `${next.title} · ${next.place} · ${next.when}`, "must");
    }
    setEventDraft({ title: "", place: "", when: "" });
  }

  function importCalendar() {
    SAMPLE_CALENDAR_EVENTS.forEach((event) => {
      if (!activeTrip.brief.items.some((item) => item.statement.includes(event.title))) {
        store.addBriefItem(activeTrip.id, `${event.title} · ${event.place} · ${event.when}`, "must");
      }
    });
    update((value) => ({
      ...value,
      calendarPreviewed: true,
      fixedEvents: [
        ...value.fixedEvents,
        ...SAMPLE_CALENDAR_EVENTS.filter((event) => !value.fixedEvents.some((item) => item.id === event.id)),
      ],
    }));
    setCalendarOpen(false);
  }

  function answerQuestion(answer: string) {
    const index = current.questionIndex;
    const question = GUIDED_QUESTIONS[index];
    if (!question) return;
    update((value) => ({
      ...value,
      questionIndex: index + 1,
      brain: [
        ...value.brain,
        {
          id: `question-${Date.now()}`,
          statement: `${question.replace(/\?$/, "")}: ${answer}`,
          category: "Trip preference",
          scope: "this-trip",
          source: "trip",
        },
      ],
    }));
  }

  function extractBrief() {
    extractBriefItems(current.contextPrompt).forEach((item) => {
      if (!activeTrip.brief.items.some((existing) => existing.statement.toLowerCase() === item.statement.toLowerCase())) {
        store.addBriefItem(activeTrip.id, item.statement, item.level);
      }
    });
  }

  function chooseFlight() {
    store.patchTrip(activeTrip.id, {
      componentStates: { ...activeTrip.componentStates, flight: "saved" },
    });
    update((value) => ({
      ...value,
      selectedFlightId: leadFlight.id,
      flightStatus: "Selected",
      stage: "hotel",
    }));
    learn(`For this trip, ${leadFlight.airline} is worth choosing because ${leadFlight.why.toLowerCase()}`);
  }

  function chooseStay() {
    store.patchTrip(activeTrip.id, {
      componentStates: { ...activeTrip.componentStates, stay: "saved" },
    });
    update((value) => ({
      ...value,
      selectedStayId: leadStay.id,
      stayStatus: "Selected",
      stage: "review",
      folderView: "plan",
    }));
    learn(`For this trip, ${leadStay.area} is the better base because it reduces travel around the plans that cannot move.`);
  }

  function applyPending() {
    if (!pendingAction) return;
    if (pendingAction === "track") {
      store.trackFlight(activeTrip.id, {
        id: leadFlight.id,
        airline: leadFlight.airline,
        route: leadFlight.route,
        depart: leadFlight.depart,
        arrive: leadFlight.arrive,
        duration: leadFlight.duration,
        stops: leadFlight.stops,
        originalFare: leadFlight.price,
        currentFare: leadFlight.price,
      });
      update((value) => ({
        ...value,
        selectedFlightId: leadFlight.id,
        flightStatus: "Tracked",
      }));
      learn("Price matters enough on this trip to track the best-fit flight before booking.");
    } else if (pendingAction === "watch") {
      store.patchTrip(activeTrip.id, {
        componentStates: { ...activeTrip.componentStates, stay: "tracked" },
      });
      update((value) => ({
        ...value,
        selectedStayId: leadStay.id,
        stayStatus: "Tracked",
        stage: "review",
      }));
    } else if (pendingAction === "invite") {
      const collaborator = {
        id: "traveler-matt",
        name: "Matthew",
        email: "matt@example.com",
        status: "joined" as const,
      };
      store.patchTrip(activeTrip.id, {
        collaborators: activeTrip.collaborators.some((item) => item.id === collaborator.id)
          ? activeTrip.collaborators
          : [...activeTrip.collaborators, collaborator],
      });
      update((value) => ({ ...value, invitedSample: true }));
      setShowGroup(true);
    }
    setPendingAction(null);
  }

  function submitComposer() {
    const text = composer.trim();
    if (!text) return;
    if (/\b(cancel|replace|change dates?|book|pay)\b/i.test(text)) {
      setPreviewChange(text);
      return;
    }
    store.addBriefItem(activeTrip.id, text, "prioritize");
    update((value) => ({
      ...value,
      correctedAssumption: text,
      brain: [
        ...value.brain,
        {
          id: `refine-${Date.now()}`,
          statement: text,
          category: "Trip refinement",
          scope: "this-trip",
          source: "trip",
        },
      ],
    }));
    setComposer("");
  }

  const optionalQuestion = GUIDED_QUESTIONS[current.questionIndex];
  let board: ReactNode;

  if (current.stage === "brief") {
    board = (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-faint">Trip Brief</p>
        <h1 className="mt-2 max-w-[16ch] font-display text-[clamp(35px,4.8vw,50px)] font-semibold leading-[1] tracking-[-.04em]">
          Tell us what you know about this trip.
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Dates, people, fixed events, preferences, or anything else that matters.
        </p>
        <div className="mt-6 rounded-[19px] border border-hair bg-white p-2 shadow-[var(--shadow-card)] focus-within:border-accent">
          <textarea
            value={current.contextPrompt}
            onChange={(event) => update((value) => ({ ...value, contextPrompt: event.target.value }))}
            rows={5}
            placeholder="Graduation Friday morning, no red-eyes, keep the first afternoon light…"
            className="w-full resize-none bg-transparent px-3 py-2 text-[13.5px] outline-none placeholder:text-faint"
          />
          <div className="flex items-center justify-between gap-3 border-t border-hair-2 px-2 pt-2">
            <span className="text-[9.5px] text-faint">Write naturally. You can edit what AITA extracts.</span>
            <button onClick={extractBrief} className="rounded-full bg-ink px-4 py-2 text-[10px] font-semibold text-paper">Update Trip Brief</button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <BriefColumn title="Must protect" level="must" trip={activeTrip} move={(id, level) => store.setBriefLevel(activeTrip.id, id, level)} />
          <BriefColumn title="Prioritize" level="prioritize" trip={activeTrip} move={(id, level) => store.setBriefLevel(activeTrip.id, id, level)} />
          <BriefColumn title="Flexible" level="flexible" trip={activeTrip} move={(id, level) => store.setBriefLevel(activeTrip.id, id, level)} />
          <BriefColumn title="Avoid" level="avoid" trip={activeTrip} move={(id, level) => store.setBriefLevel(activeTrip.id, id, level)} />
        </div>

        <section className="mt-5 rounded-[18px] border border-hair bg-white/70 p-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.11em] text-faint">Fixed events</p>
              <h3 className="mt-1 font-display text-[18px] font-semibold">Anchor the trip around what cannot move</h3>
            </div>
            <button onClick={() => setCalendarOpen(true)} className="rounded-full border border-hair px-3 py-2 text-[10px] font-semibold">Connect calendar</button>
          </div>
          {current.fixedEvents.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {current.fixedEvents.map((event) => (
                <div key={event.id} className="rounded-[12px] bg-[#f6efe3] p-3">
                  <b className="text-[11px]">{event.title}</b>
                  <p className="mt-1 text-[9.5px] text-muted">{event.place} · {event.when}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_120px_auto]">
            <input value={eventDraft.title} onChange={(e) => setEventDraft({ ...eventDraft, title: e.target.value })} placeholder="Graduation" className="rounded-[11px] border border-hair bg-white px-3 py-2 text-[10.5px] outline-none" />
            <input value={eventDraft.place} onChange={(e) => setEventDraft({ ...eventDraft, place: e.target.value })} placeholder="UCLA" className="rounded-[11px] border border-hair bg-white px-3 py-2 text-[10.5px] outline-none" />
            <input value={eventDraft.when} onChange={(e) => setEventDraft({ ...eventDraft, when: e.target.value })} placeholder="Fri 10:00" className="rounded-[11px] border border-hair bg-white px-3 py-2 text-[10.5px] outline-none" />
            <button onClick={() => addFixedEvent()} className="rounded-full border border-hair px-3 py-2 text-[10px] font-semibold">Add</button>
          </div>
        </section>

        {calendarOpen && (
          <div className="mt-3 rounded-[16px] border border-[#dfd2bd] bg-[#f6efe3] p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Calendar preview · simulated</p>
            {SAMPLE_CALENDAR_EVENTS.map((event) => (
              <p key={event.id} className="mt-2 rounded-[10px] bg-white/65 p-2.5 text-[10.5px]"><b>{event.title}</b> · {event.place} · {event.when}</p>
            ))}
            <div className="mt-3 flex justify-between gap-3">
              <p className="text-[9px] text-faint">No Google Calendar account is connected.</p>
              <button onClick={importCalendar} className="rounded-full bg-ink px-3 py-1.5 text-[9.5px] font-semibold text-paper">Add sample events</button>
            </div>
          </div>
        )}

        {optionalQuestion && (
          <section className="mt-5 rounded-[17px] border border-hair bg-white/70 p-4">
            <div className="flex justify-between">
              <div><p className="text-[9px] uppercase tracking-[.1em] text-faint">Optional question</p><p className="mt-1 text-[12px] font-semibold">{optionalQuestion}</p></div>
              <button onClick={() => update((value) => ({ ...value, questionIndex: value.questionIndex + 1, dismissedQuestions: [...value.dismissedQuestions, value.questionIndex] }))} className="text-[9px] font-semibold text-faint">Skip</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Yes", "No", "It depends", "No preference"].map((answer) => (
                <button key={answer} onClick={() => answerQuestion(answer)} className="rounded-full border border-hair px-3 py-1.5 text-[9.5px] font-semibold">{answer}</button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Link href="/calibrate" className="text-[10.5px] font-semibold text-muted">Improve my recommendations</Link>
          <button onClick={() => update((value) => ({ ...value, stage: "reasoning" }))} className="rounded-full bg-ink px-5 py-3 text-[11px] font-semibold text-paper">Build my recommendation →</button>
        </div>
      </div>
    );
  } else if (current.stage === "reasoning") {
    board = <Reasoning current={current} update={update} />;
  } else if (current.stage === "flights") {
    board = (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-faint">Flight decision</p>
        <h1 className="mt-2 max-w-[14ch] font-display text-[clamp(35px,4.8vw,50px)] font-semibold leading-[1] tracking-[-.04em]">I’d take this flight.</h1>
        <p className="mt-3 text-[13px] text-muted">One recommendation first. Alternatives appear only when the trade-off is useful.</p>
        <div className="mt-6"><FlightCard option={leadFlight} lead choose={chooseFlight} track={() => setPendingAction("track")} /></div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_.9fr]">
          <PriceBars base={leadFlight.price} />
          <section className="rounded-[16px] border border-hair bg-white/70 p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">What AITA ruled out</p>
            <p className="mt-3 text-[10.5px] leading-relaxed">× Overnight layover for a modest saving.</p>
            <p className="mt-2 text-[10.5px] leading-relaxed">× Basic fare without enough baggage.</p>
            <p className="mt-2 text-[10.5px] leading-relaxed">× Arrival with too little recovery before fixed plans.</p>
          </section>
        </div>
        <section className="mt-4 rounded-[16px] border border-hair bg-white/70 p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Assumption check</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-semibold">A usable arrival and baggage matter more than the absolute lowest fare.</p>
            <div className="flex gap-2">
              <button onClick={() => learn("A usable arrival and reasonable baggage matter more than the lowest fare on this trip.")} className="rounded-full border border-hair px-3 py-1.5 text-[9px] font-semibold">That’s right</button>
              <button onClick={() => setComposer("Not quite — for this flight, what matters more is ")} className="rounded-full border border-hair px-3 py-1.5 text-[9px] font-semibold">Not quite</button>
            </div>
          </div>
        </section>
        <button onClick={() => setShowAlternatives(!showAlternatives)} className="mt-4 text-[10.5px] font-semibold text-accent">{showAlternatives ? "Hide alternatives" : "Show cheapest & fastest reasonable →"}</button>
        {showAlternatives && <div className="mt-3 grid gap-3 sm:grid-cols-2">{flights.filter((item) => item.id !== leadFlight.id).map((item) => <FlightCard key={item.id} option={item} />)}</div>}
        <div className="mt-5 flex gap-4 text-[10.5px] font-semibold text-muted"><button onClick={() => setShowAlternatives(true)}>Show me another flight</button><button onClick={() => setComposer("None of these flights work because ")}>None of these work for me</button></div>
      </div>
    );
  } else if (current.stage === "hotel") {
    board = (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-faint">Stay decision</p>
        <h1 className="mt-2 max-w-[14ch] font-display text-[clamp(35px,4.8vw,50px)] font-semibold leading-[1] tracking-[-.04em]">I’d stay here.</h1>
        <p className="mt-3 text-[13px] text-muted">The property only wins if the surrounding trip becomes easier.</p>
        <div className="mt-6"><StayCard option={leadStay} lead choose={chooseStay} watch={() => setPendingAction("watch")} /></div>
        <section className="mt-4 rounded-[16px] border border-hair bg-white/70 p-4">
          <div className="flex justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Neighborhood reasoning</p><p className="mt-1 text-[11px] font-semibold">{leadStay.area} keeps the fixed plans in the same orbit.</p></div><button onClick={() => update((value) => ({ ...value, folderView: "map" }))} className="rounded-full border border-hair px-3 py-1.5 text-[9px] font-semibold">Open map →</button></div>
        </section>
        <section className="mt-4 rounded-[16px] border border-hair bg-white/70 p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">What AITA ruled out</p>
          {stays.slice(1).map((stay) => <p key={stay.id} className="mt-2 text-[10.5px]">× <b>{stay.area}:</b> {stay.tradeoff}</p>)}
        </section>
        <button onClick={() => setShowAlternatives(!showAlternatives)} className="mt-4 text-[10.5px] font-semibold text-accent">{showAlternatives ? "Hide alternatives" : "Show other stays →"}</button>
        {showAlternatives && <div className="mt-3 grid gap-3">{stays.slice(1).map((item) => <StayCard key={item.id} option={item} />)}</div>}
        <div className="mt-5 flex gap-4 text-[10.5px] font-semibold text-muted"><button onClick={() => setShowAlternatives(true)}>Show me another stay</button><button onClick={() => setComposer("None of these stays work because ")}>None of these work for me</button></div>
      </div>
    );
  } else {
    board = (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-faint">Trip readiness</p>
        <h1 className="mt-2 max-w-[14ch] font-display text-[clamp(35px,4.8vw,50px)] font-semibold leading-[1] tracking-[-.04em]">The big decisions are taking shape.</h1>
        <p className="mt-3 text-[13px] text-muted">Essentials stay distinct from things you can plan whenever you’re ready.</p>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <section><p className="mb-2 text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Big decisions</p><div className="space-y-2"><Readiness label="Flights" status={current.flightStatus} /><Readiness label="Hotels" status={current.stayStatus} /><Readiness label="Entry requirements / visa" status="Not started" /><Readiness label="Travel insurance" status="Not started" /><Readiness label="eSIM" status="Not started" /><Readiness label="Airport transfer" status="Not started" /></div></section>
          <section><p className="mb-2 text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Time-sensitive reservations</p><div className="space-y-2"><Readiness label="Restaurants" status="Not started" /><Readiness label="Activities" status="Not started" /><Readiness label="Tickets" status="Not started" /><Readiness label="Reservation windows" status="Reviewing" /></div></section>
          <section><p className="mb-2 text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Whenever you’re ready</p><div className="space-y-2"><Readiness label="Add places" status="Not started" /><Readiness label="Fill free time" status="Not started" /><Readiness label="Invite travelers" status={current.invitedSample ? "Complete" : "Not started"} /><Readiness label="Share itinerary" status="Not started" /><Readiness label="Personalize Trip Brain" status={current.brain.length ? "Reviewing" : "Not started"} /></div></section>
        </div>
        <section className="mt-6 rounded-[18px] border border-hair bg-white/70 p-4">
          <div className="flex flex-wrap justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Group-trip prototype</p><h2 className="mt-1 font-display text-[19px] font-semibold">Share decisions without giving up purchase control.</h2></div><button onClick={() => current.invitedSample ? setShowGroup(!showGroup) : setPendingAction("invite")} className="rounded-full border border-hair px-3 py-2 text-[10px] font-semibold">{showGroup ? "Hide group preview" : "Invite sample traveler"}</button></div>
          {showGroup && <div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-[12px] bg-surface-2 p-3"><p className="text-[9px] uppercase text-faint">Traveler responses</p><p className="mt-2 text-[10.5px] font-semibold">Matthew · Joined</p><p className="text-[9.5px] text-muted">Direct if the difference is reasonable.</p><p className="mt-2 text-[10.5px] font-semibold">Stacey · Invited</p></div><div className="rounded-[12px] bg-surface-2 p-3"><label className="flex justify-between text-[10px] font-semibold">I’m booking for everyone<input type="checkbox" checked={current.groupBookingForEveryone} onChange={(e) => update((value) => ({ ...value, groupBookingForEveryone: e.target.checked }))} /></label><div className="mt-3 rounded-[10px] bg-[#f6efe3] p-2.5"><b className="text-[10px]">6 seats left at this fare</b><p className="mt-1 text-[8.5px] text-faint">Simulated inventory only.</p></div><p className="mt-2 text-[8.5px] text-faint">Organizer remains the default purchase approver.</p></div></div>}
        </section>
        <section className="mt-6 overflow-hidden rounded-[20px] bg-ink text-paper">
          <div className="flex flex-wrap items-end justify-between gap-4 p-5"><div><p className="text-[9px] uppercase tracking-[.1em] text-paper/50">OtterWay continuation</p><h2 className="mt-1 font-display text-[22px] font-semibold">Continue planning in OtterWay</h2><p className="mt-2 text-[10.5px] text-paper/65">Bring your bookings, places, and plans into one shared itinerary.</p></div><Link href={`/trips/${activeTrip.id}/itinerary?handoff=otterway`} className="rounded-full bg-paper px-4 py-2.5 text-[10px] font-semibold text-ink">Continue planning in OtterWay →</Link></div>
          <div className="grid gap-2 border-t border-white/10 p-4 sm:grid-cols-4">{["Collaborative itinerary", "Saved Instagram & TikTok places", "Collections", "Comments & voting", "Route planning & map", "Expenses", "Active-trip mode", "Trip context carried over"].map((item) => <span key={item} className="rounded-[9px] border border-white/10 p-2 text-[8.5px] text-paper/65">{item}</span>)}</div>
        </section>
      </div>
    );
  }

  const composerConfig: [string, string[]] = current.stage === "flights"
    ? ["Refine these flights…", ["Prioritize lower fare", "Avoid overnight flying", "Arrive earlier"]]
    : current.stage === "hotel"
      ? ["Change what we’re looking for in a stay…", ["Closer to fixed events", "Better room", "Keep cancellation flexible"]]
      : current.folderView === "map"
        ? ["Adjust the trip around this area…", ["Stay closer to UCLA", "Reduce driving", "Show a different base"]]
        : current.folderView === "brain"
          ? ["Add something AITA should know…", ["This trip only", "Save for similar trips", "Correct a preference"]]
          : ["What should we change about this trip?", ["Keep day one light", "Avoid red-eyes", "Leave Saturday open"]];

  return (
    <div className="mx-auto max-w-[1420px] px-4 py-5 sm:px-5 md:px-7">
      <div className="mb-4 flex justify-between gap-3">
        <StageNav stage={current.stage} go={(stage) => update((value) => ({ ...value, stage }))} />
        <button onClick={() => setMobileFolder(true)} className="rounded-full border border-hair bg-white px-4 py-2 text-[10.5px] font-semibold lg:hidden">
          Trip · {current.folderView === "brain" ? "Brain" : current.folderView}
        </button>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.28fr)_minmax(340px,.72fr)]">
        <main className="min-w-0 rounded-[25px] border border-hair bg-[rgba(249,247,241,.54)] p-5 sm:p-7 lg:min-h-[calc(100dvh-112px)]">
          {board}
          <div className="sticky bottom-0 z-30 -mx-2 mt-8 bg-gradient-to-t from-paper via-paper/95 to-transparent px-2 pb-2 pt-7">
            <div className="mb-2 flex gap-1.5 overflow-x-auto">
              {composerConfig[1].map((chip) => <button key={chip} onClick={() => setComposer(chip)} className="shrink-0 rounded-full border border-hair bg-white/85 px-3 py-1.5 text-[9px] font-semibold text-muted">{chip}</button>)}
            </div>
            <div className="flex items-center gap-2 rounded-[17px] border border-hair bg-white p-1.5 shadow-[0_12px_36px_-20px_rgba(27,26,23,.35)] focus-within:border-accent">
              <input value={composer} onChange={(e) => setComposer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitComposer()} placeholder={composerConfig[0]} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[11.5px] outline-none placeholder:text-faint" />
              <button onClick={submitComposer} className="grid h-9 w-9 place-items-center rounded-[11px] bg-ink text-paper" aria-label="Apply trip refinement">→</button>
            </div>
          </div>
        </main>
        <div className="hidden lg:block"><WorkingFolder trip={activeTrip} cowork={current} setCowork={(next) => update(() => next)} profile={store.profile} /></div>
      </div>
      {mobileFolder && <WorkingFolder trip={activeTrip} cowork={current} setCowork={(next) => update(() => next)} profile={store.profile} mobile onClose={() => setMobileFolder(false)} />}

      {learning && (
        <div className="fixed bottom-5 left-1/2 z-[95] w-[min(620px,calc(100vw-32px))] -translate-x-1/2 rounded-[17px] border border-hair bg-white p-4 shadow-[var(--shadow-pop)]">
          <p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">Added to this trip</p>
          <p className="mt-1 text-[11px] font-semibold">{learning}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setScopeOpen(true)} className="rounded-full border border-hair px-3 py-1.5 text-[9px] font-semibold">Save for future trips</button>
            <button onClick={() => saveLearning("this-trip")} className="rounded-full border border-hair px-3 py-1.5 text-[9px] font-semibold">This trip only</button>
            <button onClick={() => { update((value) => ({ ...value, folderView: "brain" })); setMobileFolder(true); setLearning(null); }} className="rounded-full border border-hair px-3 py-1.5 text-[9px] font-semibold">View Trip Brain</button>
            <button onClick={() => setLearning(null)} className="px-2 text-[9px] font-semibold text-faint">Undo</button>
          </div>
        </div>
      )}

      {scopeOpen && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-ink/18 p-5">
          <button className="absolute inset-0" onClick={() => setScopeOpen(false)} aria-label="Close preference scope" />
          <div className="relative w-full max-w-[400px] rounded-[20px] bg-[#f9f7f1] p-5">
            <p className="text-[9px] uppercase text-faint">Where should AITA remember this?</p>
            <h3 className="mt-1 font-display text-[20px] font-semibold">Choose the scope yourself</h3>
            <div className="mt-4 grid gap-2">
              {[["all", "All trips"], ["similar", "Trips like this"], ["this-trip", "This trip only"], ["none", "Don’t save"]].map(([value, label]) => (
                <button key={value} onClick={() => saveLearning(value as "all" | "similar" | "this-trip" | "none")} className="rounded-[12px] border border-hair bg-white p-3 text-left text-[10.5px] font-semibold">{label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {pendingAction && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-ink/18 p-5">
          <button className="absolute inset-0" onClick={() => setPendingAction(null)} aria-label="Cancel persistence action" />
          <div className="relative w-full max-w-[460px] rounded-[20px] bg-[#f9f7f1] p-5">
            <p className="text-[9px] uppercase text-faint">A meaningful persistence moment</p>
            <h3 className="mt-1 font-display text-[20px] font-semibold">In the real product, sign-in would help here.</h3>
            <p className="mt-2 text-[10.5px] leading-relaxed text-muted">Tracking, invitations, and cross-device persistence need an account. This prototype has no live auth, so you can preview the behavior locally without losing guest progress.</p>
            <div className="mt-4 flex justify-end gap-2"><button onClick={() => setPendingAction(null)} className="px-3 py-2 text-[9.5px] font-semibold text-muted">Cancel</button><button onClick={applyPending} className="rounded-full bg-ink px-4 py-2 text-[9.5px] font-semibold text-paper">Preview without signing in</button></div>
          </div>
        </div>
      )}

      {previewChange && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-ink/18 p-5">
          <button className="absolute inset-0" onClick={() => setPreviewChange(null)} aria-label="Cancel proposed change" />
          <div className="relative w-full max-w-[470px] rounded-[20px] bg-[#f9f7f1] p-5">
            <p className="text-[9px] uppercase text-faint">Preview consequential change</p>
            <h3 className="mt-1 font-display text-[20px] font-semibold">AITA won’t apply this silently.</h3>
            <p className="mt-3 rounded-[12px] bg-white p-3 text-[11px]">{previewChange}</p>
            <p className="mt-2 text-[9.5px] leading-relaxed text-muted">Real date changes, replacements, cancellations, bookings, or payments require explicit approval.</p>
            <div className="mt-4 flex justify-end gap-2"><button onClick={() => setPreviewChange(null)} className="px-3 py-2 text-[9.5px] font-semibold text-muted">Cancel</button><button onClick={() => { store.addBriefItem(activeTrip.id, `Requested change: ${previewChange}`, "prioritize"); update((value) => ({ ...value, correctedAssumption: previewChange })); setPreviewChange(null); setComposer(""); }} className="rounded-full bg-ink px-4 py-2 text-[9.5px] font-semibold text-paper">Add request to trip</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
