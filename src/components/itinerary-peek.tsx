"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Trip } from "@/lib/types";

const STORAGE_KEY = "roaminrabbit.itinerary.peek.v1";

type PlanMode = "Current plan" | "More relaxed" | "More activities";
type ManualState = {
  mode: PlanMode;
  notes: string[];
  restaurantState: "Needs reservation" | "Booked" | "Walk-in" | "Reservations open later" | "No availability" | "Placeholder";
  activitySaved: boolean;
};

type TimelineStatus =
  | "Suggested"
  | "Saved"
  | "Selected"
  | "Tracked"
  | "Needs booking"
  | "Secured flexibly"
  | "Booked"
  | "Walk-in"
  | "Reservations open later"
  | "Unavailable"
  | "Placeholder";

type TimelineItem = {
  id: string;
  type: "Flight" | "Hotel" | "Airport transfer" | "Activity" | "Restaurant" | "Flexible placeholder" | "Route";
  title: string;
  meta: string;
  status: TimelineStatus;
  fixed: boolean;
  priceWatch?: { current: number; start: number; lastChecked: string; values: number[] };
};

type TimelineDay = { key: string; label: string; items: TimelineItem[] };

const IDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function promptField(prompt: string, label: string) {
  const prefix = `${label}:`;
  return prompt.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length).trim() ?? "";
}

function parseDates(trip: Trip) {
  const fromPrompt = promptField(trip.originalPrompt, "Dates");
  const match = fromPrompt.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/);
  if (match) return { start: match[1], end: match[2] };
  return null;
}

function formatDate(raw: string) {
  const date = new Date(`${raw}T00:00:00`);
  return new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function dateRangeLabel(trip: Trip) {
  const dates = parseDates(trip);
  if (!dates) {
    const selected = trip.destinationProposals.find((p) => p.id === trip.selectedProposalId);
    return selected?.recommendedWindow ?? "Dates still flexible";
  }
  const start = new Date(`${dates.start}T00:00:00`);
  const end = new Date(`${dates.end}T00:00:00`);
  const fmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

function dayKeys(trip: Trip) {
  const dates = parseDates(trip);
  if (!dates) return ["Day 1", "Day 2", "Day 3"];
  const start = new Date(`${dates.start}T00:00:00`);
  const end = new Date(`${dates.end}T00:00:00`);
  const values: string[] = [];
  for (let cursor = new Date(start); cursor <= end && values.length < 12; cursor.setDate(cursor.getDate() + 1)) {
    values.push(cursor.toISOString().slice(0, 10));
  }
  return values.length ? values : ["Day 1", "Day 2", "Day 3"];
}

function lifecycleLabel(trip: Trip) {
  if (trip.lifecycle === "partially-booked") return "Partially booked";
  if (trip.lifecycle === "booked") return "Booked";
  return "Planning";
}

function itemStatusFromComponent(state: string, fallback: TimelineStatus): TimelineStatus {
  if (state === "confirmed") return "Booked";
  if (state === "tracked") return "Tracked";
  if (state === "saved") return fallback;
  return "Suggested";
}

function statusTone(status: TimelineStatus) {
  if (status === "Booked") return "border-[#b8d1bc] bg-[#e7f1e8] text-[#35543c]";
  if (status === "Tracked") return "border-[#c8c7e4] bg-[#eeedf8] text-[#4a4f91]";
  if (status === "Needs booking" || status === "Unavailable") return "border-[#e3c5b3] bg-[#f7ece5] text-[#8a5538]";
  if (status === "Secured flexibly") return "border-[#bfd4ca] bg-[#e9f3ef] text-[#41685a]";
  if (status === "Placeholder" || status === "Suggested") return "border-hair bg-surface-2 text-muted";
  return "border-hair bg-white text-ink-soft";
}

function readManual(tripId: string): ManualState {
  if (typeof window === "undefined") return { mode: "Current plan", notes: [], restaurantState: "Needs reservation", activitySaved: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, ManualState>) : {};
    return all[tripId] ?? { mode: "Current plan", notes: [], restaurantState: "Needs reservation", activitySaved: true };
  } catch {
    return { mode: "Current plan", notes: [], restaurantState: "Needs reservation", activitySaved: true };
  }
}

function writeManual(tripId: string, value: ManualState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, ManualState>) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...all, [tripId]: value }));
  } catch {
    /* prototype persistence only */
  }
}

function PriceSparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => {
    const x = (index / Math.max(1, values.length - 1)) * 88;
    const y = 28 - ((value - min) / Math.max(1, max - min)) * 22;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="88" height="30" viewBox="0 0 88 30" aria-label="Simulated price history">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function ItineraryPeek({ trip, open, onClose }: { trip: Trip; open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [manual, setManual] = useState<ManualState>(() => ({ mode: "Current plan", notes: [], restaurantState: "Needs reservation", activitySaved: true }));
  const [prompt, setPrompt] = useState("");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setManual(readManual(trip.id));
  }, [trip.id]);

  useEffect(() => {
    writeManual(trip.id, manual);
  }, [trip.id, manual]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => panelRef.current?.focus(), 20);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>("button, a, input, select, [tabindex]:not([tabindex='-1'])")).filter((el) => !el.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  const selected = trip.destinationProposals.find((proposal) => proposal.id === trip.selectedProposalId) ?? trip.destinationProposals[0];
  const keys = useMemo(() => dayKeys(trip), [trip]);

  const days = useMemo<TimelineDay[]>(() => {
    const result = keys.map((key, index) => ({
      key,
      label: /^\d{4}/.test(key) ? `${index === 0 ? "Arrival · " : ""}${formatDate(key)}` : key,
      items: [] as TimelineItem[],
    }));
    const first = result[0];
    const second = result[Math.min(1, result.length - 1)];
    const last = result[result.length - 1];

    const flightState = trip.componentStates.flight;
    if (flightState !== "undecided" || trip.trackedFlight) {
      const flight = trip.trackedFlight ?? selected?.flight;
      if (flight) {
        const tracked = trip.trackedFlight;
        first.items.push({
          id: "flight-outbound",
          type: "Flight",
          title: `${flight.airline} · ${flight.route}`,
          meta: `${flight.depart} → ${flight.arrive}${"duration" in flight ? ` · ${flight.duration}` : ""}`,
          status: itemStatusFromComponent(flightState, "Selected"),
          fixed: flightState === "confirmed",
          priceWatch: tracked ? {
            current: tracked.currentFare,
            start: tracked.originalFare,
            lastChecked: tracked.lastCheckedAt,
            values: [tracked.originalFare * 1.03, tracked.originalFare, tracked.originalFare * 1.015, tracked.currentFare * 1.01, tracked.currentFare],
          } : undefined,
        });
      }
    }

    const stayState = trip.componentStates.stay;
    if (stayState !== "undecided" && selected?.stay) {
      first.items.push({
        id: "stay",
        type: "Hotel",
        title: selected.stay.name,
        meta: `${selected.stay.location} · ${dateRangeLabel(trip)}`,
        status: stayState === "confirmed" ? "Booked" : stayState === "saved" ? "Selected" : "Suggested",
        fixed: stayState === "confirmed",
      });
    }

    if (flightState !== "undecided") {
      first.items.push({
        id: "transfer",
        type: "Airport transfer",
        title: flightState === "confirmed" ? "Airport → hotel" : "Airport transfer",
        meta: flightState === "confirmed" ? "Pickup can now be finalized" : "Waiting for flight confirmation",
        status: flightState === "confirmed" ? "Needs booking" : "Placeholder",
        fixed: false,
      });
    }

    if (selected && trip.selectedProposalId) {
      second.items.push({
        id: "activity",
        type: "Activity",
        title: selected.signatureExperience || "A signature local experience",
        meta: manual.mode === "More relaxed" ? "Keep the timing loose" : "Saved from your trip concept",
        status: manual.activitySaved ? "Saved" : "Placeholder",
        fixed: false,
      });
      second.items.push({
        id: "restaurant",
        type: "Restaurant",
        title: selected.dining?.name || "Dinner near the hotel",
        meta: selected.dining?.note || "Choose a place once the day takes shape",
        status: manual.restaurantState === "No availability" ? "Unavailable" : manual.restaurantState,
        fixed: manual.restaurantState === "Booked",
      });
    }

    manual.notes.forEach((note, index) => {
      const target = note.toLowerCase().includes("first day") ? first : note.toLowerCase().includes("saturday") ? second : last;
      target.items.push({ id: `note-${index}`, type: "Flexible placeholder", title: note, meta: "Trip-level refinement · prototype", status: "Placeholder", fixed: false });
    });

    return result;
  }, [keys, manual, selected, trip]);

  const itemCount = days.reduce((count, day) => count + day.items.length, 0);
  const attention = useMemo(() => {
    if (trip.trackedFlight) {
      const delta = trip.trackedFlight.currentFare - trip.trackedFlight.originalFare;
      if (Math.abs(delta) >= 100_000) return `Your tracked flight ${delta > 0 ? "increased" : "dropped"} by ${IDR.format(Math.abs(delta))}.`;
      return "Your tracked flight is still being watched — it is not booked.";
    }
    if (manual.restaurantState === "Needs reservation") return "This restaurant still needs a reservation.";
    if (trip.componentStates.flight === "confirmed" && trip.componentStates.stay === "saved") return "Your flight is booked; your stay is selected but not confirmed.";
    return "Nothing needs your attention right now.";
  }, [manual.restaurantState, trip]);

  function applyPrompt(value?: string) {
    const text = (value ?? prompt).trim();
    if (!text) return;
    let note = text;
    if (/first day.*relax|relax.*first day/i.test(text)) note = "Keep the first day light after arrival";
    else if (/dinner.*hotel|hotel.*dinner/i.test(text)) note = "Move dinner closer to the hotel";
    else if (/scenic route/i.test(text)) note = "Prefer a scenic route between the main stops";
    else if (/saturday.*free|free.*saturday/i.test(text)) note = "Leave Saturday afternoon free";
    else if (/less expensive|cheaper/i.test(text)) note = "Replace the next flexible item with a lower-cost option";
    setManual((current) => ({ ...current, notes: [...current.notes.filter((item) => item !== note), note] }));
    setAnnouncement(`Updated this itinerary only: ${note}. Confirmed bookings were not changed.`);
    setPrompt("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] print:hidden" role="presentation">
      <button aria-label="Close itinerary" className="absolute inset-0 bg-ink/10 backdrop-blur-[1px]" onClick={onClose} />
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Trip itinerary"
        className="absolute inset-x-0 bottom-0 top-10 flex flex-col overflow-hidden rounded-t-[28px] border border-hair bg-[#f8f6f0] shadow-[0_-14px_50px_rgba(31,30,27,0.16)] outline-none md:inset-y-0 md:left-auto md:right-0 md:w-[min(590px,46vw)] md:rounded-none md:rounded-l-[28px] md:shadow-[-18px_0_55px_rgba(31,30,27,0.14)]"
      >
        <header className="shrink-0 border-b border-hair-2 bg-[rgba(248,246,240,0.94)] px-5 pb-4 pt-5 backdrop-blur-xl md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">Your itinerary · powered by OtterWay</p>
              <h2 className="mt-1 truncate font-display text-[26px] font-semibold tracking-[-0.035em] text-ink">{trip.name}</h2>
              <p className="mt-1 text-[12.5px] text-muted">{dateRangeLabel(trip)} · {trip.travelers} traveler{trip.travelers === 1 ? "" : "s"}</p>
            </div>
            <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hair bg-white text-lg text-muted transition hover:border-ink/25 hover:text-ink" aria-label="Close itinerary">×</button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-hair bg-white px-2.5 py-1 text-[10.5px] font-semibold text-ink-soft">{lifecycleLabel(trip)}</span>
            <label className="ml-auto flex items-center gap-2 text-[11px] font-medium text-muted">
              <span className="hidden sm:inline">Itinerary</span>
              <select value={manual.mode} onChange={(event) => setManual((current) => ({ ...current, mode: event.target.value as PlanMode }))} className="rounded-full border border-hair bg-white px-3 py-1.5 text-[11.5px] font-semibold text-ink outline-none focus:border-accent">
                <option>Current plan</option><option>More relaxed</option><option>More activities</option>
              </select>
            </label>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-faint">Itinerary options only rearrange flexible ideas. Booked items stay fixed unless you explicitly change the booking.</p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
          <div className={`rounded-[16px] border px-4 py-3 ${attention.startsWith("Nothing") ? "border-hair bg-white/65" : "border-[#dfd2bd] bg-[#f6efe3]"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">Attention</p>
            <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-ink-soft">{attention}</p>
          </div>

          {itemCount === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-hair bg-white text-lg">↗</div>
              <h3 className="mt-4 font-display text-[25px] font-semibold tracking-[-0.03em]">Your trip is taking shape</h3>
              <p className="mx-auto mt-2 max-w-[38ch] text-[13.5px] leading-relaxed text-muted">Flights, stays, places, and plans you choose will appear here.</p>
              <button onClick={onClose} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[12px] font-semibold text-paper">Continue planning</button>
            </div>
          ) : (
            <div className="mt-6 space-y-7">
              {days.map((day) => (
                <section key={day.key}>
                  <div className="mb-2 flex items-center gap-3"><h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{day.label}</h3><div className="h-px flex-1 bg-hair-2" /></div>
                  {day.items.length === 0 ? <div className="rounded-[15px] border border-dashed border-hair px-4 py-3 text-[11.5px] text-faint">Open time — nothing locked in.</div> : (
                    <div className="space-y-2.5">
                      {day.items.map((item) => (
                        <article key={item.id} className={`rounded-[17px] border p-3.5 ${item.fixed ? "border-[#becfc2] bg-white shadow-[0_6px_20px_rgba(47,64,53,0.055)]" : "border-hair bg-[rgba(255,255,255,0.72)]"}`}>
                          <div className="flex items-start gap-3">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-[12px] text-muted">{item.type === "Flight" ? "✈" : item.type === "Hotel" ? "⌂" : item.type === "Restaurant" ? "◌" : item.type === "Activity" ? "◇" : "→"}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">{item.type}</p>
                                {item.fixed && <span className="text-[9.5px] font-semibold text-[#4d6a56]">Fixed booking</span>}
                              </div>
                              <h4 className="mt-0.5 text-[13.5px] font-semibold leading-snug text-ink">{item.title}</h4>
                              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{item.meta}</p>
                              {item.priceWatch && (
                                <div className="mt-3 flex items-end justify-between gap-3 rounded-[12px] bg-surface-2 px-3 py-2.5 text-[#4a4f91]">
                                  <div><p className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-faint">Simulated price watch</p><p className="mt-1 text-[11.5px] font-semibold text-ink">{IDR.format(item.priceWatch.current)} <span className="font-normal text-muted">from {IDR.format(item.priceWatch.start)}</span></p><p className="mt-0.5 text-[9.5px] text-faint">Last checked {new Date(item.priceWatch.lastChecked).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div>
                                  <PriceSparkline values={item.priceWatch.values} />
                                </div>
                              )}
                            </div>
                            <span className={`shrink-0 rounded-full border px-2 py-1 text-[9.5px] font-semibold ${statusTone(item.status)}`}>{item.status}{item.status === "Tracked" ? " · not booked" : ""}</span>
                          </div>
                          {item.type === "Restaurant" && item.status !== "Booked" && (
                            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-hair-2 pt-3">
                              {["Keep as reference", "Ask for another", "Try another date", "Placeholder"].map((label) => <button key={label} onClick={() => { if (label === "Placeholder") setManual((current) => ({ ...current, restaurantState: "Placeholder" })); else if (label === "Ask for another") setAnnouncement("We kept the rest of the day and swapped only the restaurant idea."); else setAnnouncement(`${label} — no reservation was created.`); }} className="rounded-full border border-hair bg-white px-2.5 py-1.5 text-[9.5px] font-semibold text-muted hover:text-ink">{label}</button>)}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}

          <section className="mt-7 rounded-[18px] border border-hair bg-white/72 p-4">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">Change this trip</p>
            <div className="mt-2 flex items-center gap-2 rounded-[14px] border border-hair bg-white p-1.5 focus-within:border-accent">
              <input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => event.key === "Enter" && applyPrompt()} placeholder="Ask RoaminRabbit to change this trip…" className="min-w-0 flex-1 bg-transparent px-2 text-[12.5px] outline-none placeholder:text-faint" />
              <button onClick={() => applyPrompt()} className="grid h-8 w-8 place-items-center rounded-[10px] bg-ink text-paper" aria-label="Apply itinerary change">→</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Make the first day more relaxed", "Move dinner closer to the hotel", "Leave Saturday afternoon free"].map((example) => <button key={example} onClick={() => applyPrompt(example)} className="rounded-full bg-surface-2 px-2.5 py-1.5 text-[9.5px] font-medium text-muted hover:text-ink">{example}</button>)}
            </div>
            {announcement && <p className="mt-3 rounded-[11px] bg-accent-tint/45 px-3 py-2 text-[10.5px] leading-relaxed text-ink-soft">{announcement}</p>}
          </section>
        </div>

        <footer className="shrink-0 border-t border-hair-2 bg-[rgba(248,246,240,0.96)] p-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1"><p className="text-[11.5px] font-semibold text-ink">Take the same trip into OtterWay</p><p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">Plan routes, add places, and collaborate in OtterWay.</p></div>
            <Link href={`/trips/${trip.id}/itinerary?handoff=otterway`} className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-[11.5px] font-semibold text-paper transition hover:bg-ink-soft">Open full itinerary</Link>
          </div>
        </footer>
      </section>
    </div>
  );
}

export function itineraryNeedsAttention(trip: Trip) {
  return Boolean(trip.trackedFlight || trip.lifecycle === "partially-booked" || (trip.selectedProposalId && trip.componentStates.stay !== "confirmed"));
}
