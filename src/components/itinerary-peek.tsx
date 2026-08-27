"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Trip } from "@/lib/types";
import { useStore } from "@/lib/store";

const STORAGE_KEY = "roaminrabbit.itinerary.peek.v2";

type PeekState = {
  draftUnlocked: boolean;
};

type CoreStatus = "Saved" | "Tracked" | "Booked";

type CoreItem = {
  id: string;
  type: "Flight" | "Hotel";
  title: string;
  meta: string;
  status: CoreStatus;
  fixed: boolean;
  priceWatch?: { current: number; start: number; lastChecked: string; values: number[] };
};

const DEFAULT_PEEK: PeekState = { draftUnlocked: false };
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

function dateRangeLabel(trip: Trip) {
  const dates = parseDates(trip);
  if (!dates) {
    const selected = trip.destinationProposals.find((proposal) => proposal.id === trip.selectedProposalId);
    return selected?.recommendedWindow ?? "Dates still flexible";
  }
  const start = new Date(`${dates.start}T00:00:00`);
  const end = new Date(`${dates.end}T00:00:00`);
  const format = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });
  return `${format.format(start)} – ${format.format(end)}`;
}

function lifecycleLabel(trip: Trip) {
  if (trip.lifecycle === "partially-booked") return "Partially booked";
  if (trip.lifecycle === "booked") return "Booked";
  return "Planning";
}

function statusTone(status: CoreStatus) {
  if (status === "Booked") return "border-[#b8d1bc] bg-[#e7f1e8] text-[#35543c]";
  if (status === "Tracked") return "border-[#c8c7e4] bg-[#eeedf8] text-[#4a4f91]";
  return "border-hair bg-white text-ink-soft";
}

function readPeek(tripId: string): PeekState {
  if (typeof window === "undefined") return DEFAULT_PEEK;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Partial<PeekState>>) : {};
    return { ...DEFAULT_PEEK, ...(all[tripId] ?? {}) };
  } catch {
    return DEFAULT_PEEK;
  }
}

function writePeek(tripId: string, value: PeekState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, PeekState>) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...all, [tripId]: value }));
  } catch {
    /* prototype persistence only */
  }
}

function PriceSparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 88;
      const y = 28 - ((value - min) / Math.max(1, max - min)) * 22;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="88" height="30" viewBox="0 0 88 30" aria-label="Simulated price history">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function DraftDay({ day }: { day: NonNullable<Trip["itineraryDraft"]>["days"][number] }) {
  return (
    <section className="rounded-[18px] border border-hair bg-white/72 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">{day.day}</p>
          <h4 className="mt-1 text-[14px] font-semibold text-ink">{day.title}</h4>
        </div>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[9.5px] font-semibold text-muted">AI draft</span>
      </div>
      <div className="mt-3 divide-y divide-hair-2">
        {[
          ["Morning", day.morning],
          ["Afternoon", day.afternoon],
          ["Evening", day.evening],
          ["Open time", day.freeTime],
        ].map(([label, value]) => (
          <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[76px_1fr]">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-faint">{label}</p>
            <p className="text-[11.5px] leading-relaxed text-ink-soft">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ItineraryPeek({ trip, open, onClose }: { trip: Trip; open: boolean; onClose: () => void }) {
  const store = useStore();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [peek, setPeek] = useState<PeekState>(DEFAULT_PEEK);
  const [prompt, setPrompt] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [drafting, setDrafting] = useState(false);

  useEffect(() => {
    setPeek(readPeek(trip.id));
  }, [trip.id]);

  useEffect(() => {
    writePeek(trip.id, peek);
  }, [trip.id, peek]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => panelRef.current?.focus(), 20);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>("button, a, input, [tabindex]:not([tabindex='-1'])")
      ).filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  const selected = trip.destinationProposals.find((proposal) => proposal.id === trip.selectedProposalId);
  const flightState = trip.componentStates.flight;
  const stayState = trip.componentStates.stay;
  const flightCommitted = Boolean(trip.trackedFlight) || flightState === "saved" || flightState === "tracked" || flightState === "confirmed";
  const stayCommitted = stayState === "saved" || stayState === "confirmed";
  const coreReady = flightCommitted && stayCommitted;
  const draftVisible = Boolean(coreReady && peek.draftUnlocked && trip.itineraryDraft);

  const coreItems = useMemo<CoreItem[]>(() => {
    const items: CoreItem[] = [];

    if (flightCommitted) {
      const flight = trip.trackedFlight ?? selected?.flight;
      if (flight) {
        const tracked = trip.trackedFlight;
        const status: CoreStatus = flightState === "confirmed" ? "Booked" : tracked || flightState === "tracked" ? "Tracked" : "Saved";
        items.push({
          id: "flight",
          type: "Flight",
          title: `${flight.airline} · ${flight.route}`,
          meta: `${flight.depart} → ${flight.arrive}${"duration" in flight && flight.duration ? ` · ${flight.duration}` : ""}`,
          status,
          fixed: status === "Booked",
          priceWatch: tracked
            ? {
                current: tracked.currentFare,
                start: tracked.originalFare,
                lastChecked: tracked.lastCheckedAt,
                values: [tracked.originalFare * 1.03, tracked.originalFare, tracked.originalFare * 1.015, tracked.currentFare * 1.01, tracked.currentFare],
              }
            : undefined,
        });
      }
    }

    if (stayCommitted && selected?.stay) {
      items.push({
        id: "stay",
        type: "Hotel",
        title: selected.stay.name,
        meta: `${selected.stay.location} · ${dateRangeLabel(trip)}`,
        status: stayState === "confirmed" ? "Booked" : "Saved",
        fixed: stayState === "confirmed",
      });
    }

    return items;
  }, [flightCommitted, flightState, selected, stayCommitted, stayState, trip]);

  const attention = useMemo(() => {
    if (trip.trackedFlight) {
      const delta = trip.trackedFlight.currentFare - trip.trackedFlight.originalFare;
      if (trip.trackedFlight.priceDropped || Math.abs(delta) >= 100_000) {
        return `Your tracked flight ${delta > 0 ? "increased" : "dropped"} by ${IDR.format(Math.abs(delta))}. It is still not booked.`;
      }
      return "Flight price watch is active. This flight is tracked, not booked.";
    }
    if (flightState === "confirmed" && stayState === "saved") return "Your flight is booked. Your stay is saved for later.";
    if (flightState === "saved" && stayState === "confirmed") return "Your stay is booked. Your flight is saved for later.";
    return null;
  }, [flightState, stayState, trip.trackedFlight]);

  const missingCore = !flightCommitted ? "Save or book a flight" : !stayCommitted ? "Save or book a stay" : null;

  function generateDraft() {
    if (!coreReady) return;
    setDrafting(true);
    if (!trip.itineraryDraft) store.sketchItinerary(trip.id);
    setPeek((current) => ({ ...current, draftUnlocked: true }));
    setAnnouncement("");
    window.setTimeout(() => setDrafting(false), 450);
  }

  function applyPrompt(value?: string) {
    if (!draftVisible || !trip.itineraryDraft) return;
    const text = (value ?? prompt).trim();
    if (!text) return;
    store.refineItinerary(trip.id, text);
    setAnnouncement(`Updated the draft for this trip only: ${text}. Saved and booked travel was left unchanged.`);
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
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full border border-hair bg-white px-2.5 py-1 text-[10.5px] font-semibold text-ink-soft">{lifecycleLabel(trip)}</span>
            {draftVisible && <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[10.5px] font-semibold text-accent">AI draft active</span>}
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-faint">
            {draftVisible
              ? "The draft can flex around your trip. Saved and booked travel stays fixed unless you explicitly change it."
              : "Only travel you save, track, or book appears here. Recommendations stay out until you choose them."}
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
          {attention && (
            <div className="rounded-[16px] border border-[#dfd2bd] bg-[#f6efe3] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">Worth knowing</p>
              <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-ink-soft">{attention}</p>
            </div>
          )}

          {coreItems.length > 0 && (
            <section className={attention ? "mt-5" : ""}>
              <div className="mb-2 flex items-center gap-3">
                <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">Trip foundations</h3>
                <div className="h-px flex-1 bg-hair-2" />
              </div>
              <div className="space-y-2.5">
                {coreItems.map((item) => (
                  <article key={item.id} className={`rounded-[17px] border p-3.5 ${item.fixed ? "border-[#becfc2] bg-white shadow-[0_6px_20px_rgba(47,64,53,0.055)]" : "border-hair bg-[rgba(255,255,255,0.72)]"}`}>
                    <div className="flex items-start gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-[12px] text-muted">{item.type === "Flight" ? "✈" : "⌂"}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">{item.type}</p>
                          {item.fixed && <span className="text-[9.5px] font-semibold text-[#4d6a56]">Fixed booking</span>}
                        </div>
                        <h4 className="mt-0.5 text-[13.5px] font-semibold leading-snug text-ink">{item.title}</h4>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{item.meta}</p>
                        {item.priceWatch && (
                          <div className="mt-3 flex items-end justify-between gap-3 rounded-[12px] bg-surface-2 px-3 py-2.5 text-[#4a4f91]">
                            <div>
                              <p className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-faint">Simulated price watch</p>
                              <p className="mt-1 text-[11.5px] font-semibold text-ink">{IDR.format(item.priceWatch.current)} <span className="font-normal text-muted">from {IDR.format(item.priceWatch.start)}</span></p>
                              <p className="mt-0.5 text-[9.5px] text-faint">Last checked {new Date(item.priceWatch.lastChecked).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                            </div>
                            <PriceSparkline values={item.priceWatch.values} />
                          </div>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[9.5px] font-semibold ${statusTone(item.status)}`}>{item.status}{item.status === "Tracked" ? " · not booked" : ""}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {coreItems.length === 0 && (
            <div className="py-14 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-hair bg-white text-lg">↗</div>
              <h3 className="mt-4 font-display text-[25px] font-semibold tracking-[-0.03em]">Nothing added yet</h3>
              <p className="mx-auto mt-2 max-w-[39ch] text-[13.5px] leading-relaxed text-muted">Save, track, or book a flight and stay first. We won’t invent itinerary items before you choose them.</p>
              <button onClick={onClose} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[12px] font-semibold text-paper">Continue choosing</button>
            </div>
          )}

          {coreItems.length > 0 && !coreReady && (
            <section className="mt-6 rounded-[18px] border border-hair bg-white/72 p-5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">Before we plan the days</p>
              <h3 className="mt-2 font-display text-[22px] font-semibold tracking-[-0.025em]">One trip foundation is still open</h3>
              <p className="mx-auto mt-2 max-w-[42ch] text-[12.5px] leading-relaxed text-muted">{missingCore}. Once your flight and stay are both chosen, RoaminRabbit can build around the real trip instead of guessing.</p>
              <button onClick={onClose} className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[11.5px] font-semibold text-paper">Continue planning</button>
            </section>
          )}

          {coreReady && !draftVisible && (
            <section className="mt-6 rounded-[20px] border border-hair bg-white/78 p-5 text-center shadow-[0_8px_28px_rgba(31,30,27,0.04)]">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-accent-tint text-accent">✦</div>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">Ready for the next layer</p>
              <h3 className="mt-1 font-display text-[24px] font-semibold tracking-[-0.03em]">Draft the itinerary with AI</h3>
              <p className="mx-auto mt-2 max-w-[45ch] text-[12.5px] leading-relaxed text-muted">We’ll use your dates, chosen flight and stay, Trip Brief, and preferences to sketch a flexible day-by-day starting point. Nothing else gets booked.</p>
              <button disabled={drafting} onClick={generateDraft} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[11.5px] font-semibold text-paper transition disabled:opacity-50">{drafting ? "Drafting…" : "Draft my itinerary with AI →"}</button>
            </section>
          )}

          {draftVisible && trip.itineraryDraft && (
            <>
              <div className="mt-6 flex items-center gap-3">
                <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">Rough itinerary</h3>
                <div className="h-px flex-1 bg-hair-2" />
              </div>
              <div className="mt-3 space-y-3">
                {trip.itineraryDraft.days.map((day) => <DraftDay key={day.day} day={day} />)}
              </div>

              <section className="mt-7 rounded-[18px] border border-hair bg-white/72 p-4">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">Refine this draft</p>
                <div className="mt-2 flex items-center gap-2 rounded-[14px] border border-hair bg-white p-1.5 focus-within:border-accent">
                  <input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => event.key === "Enter" && applyPrompt()} placeholder="Make the first day easier, keep Saturday open…" className="min-w-0 flex-1 bg-transparent px-2 text-[12.5px] outline-none placeholder:text-faint" />
                  <button onClick={() => applyPrompt()} className="grid h-8 w-8 place-items-center rounded-[10px] bg-ink text-paper" aria-label="Apply itinerary change">→</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Make the first day more relaxed", "Leave Saturday afternoon free", "Keep dinner near the hotel"].map((example) => (
                    <button key={example} onClick={() => applyPrompt(example)} className="rounded-full bg-surface-2 px-2.5 py-1.5 text-[9.5px] font-medium text-muted hover:text-ink">{example}</button>
                  ))}
                </div>
                {announcement && <p className="mt-3 rounded-[11px] bg-accent-tint/45 px-3 py-2 text-[10.5px] leading-relaxed text-ink-soft">{announcement}</p>}
              </section>
            </>
          )}
        </div>

        {draftVisible && (
          <footer className="shrink-0 border-t border-hair-2 bg-[rgba(248,246,240,0.96)] p-4 backdrop-blur-xl md:px-6">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold text-ink">Take this draft into OtterWay</p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">Plan routes, add places, and collaborate without re-entering the trip.</p>
              </div>
              <Link href={`/trips/${trip.id}/itinerary?handoff=otterway`} className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-[11.5px] font-semibold text-paper transition hover:bg-ink-soft">Open full itinerary</Link>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
}

export function itineraryNeedsAttention(trip: Trip) {
  return Boolean(trip.trackedFlight?.priceDropped || trip.lifecycle === "partially-booked");
}
