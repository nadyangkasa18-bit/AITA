"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Photo } from "@/components/photo";
import { Button, buttonClass, useToast } from "@/components/ui";
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
import type { ItineraryDay, Trip } from "@/lib/types";

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

function editDay(day: ItineraryDay, field: keyof ItineraryDay, value: string): ItineraryDay {
  return { ...day, [field]: value };
}

function BookingSummary({ label, title, detail, status }: { label: string; title: string; detail: string; status: string }) {
  return (
    <div className="rounded-[17px] border border-hair bg-white/78 p-4">
      <div className="flex items-center justify-between gap-3"><p className="text-[8.5px] font-semibold uppercase tracking-[.1em] text-faint">{label}</p><span className="rounded-full bg-surface-2 px-2 py-1 text-[8px] font-semibold text-muted">{status}</span></div>
      <p className="mt-2 text-[11.5px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[9.5px] leading-relaxed text-muted">{detail}</p>
    </div>
  );
}

export function OtterWayItineraryV2({ tripId, fromHandoff = false }: { tripId: string; fromHandoff?: boolean }) {
  const { trip, store, hydrated } = useTrip(tripId);
  const { toast } = useToast();
  const [cowork, setCowork] = useState<CoworkState | null>(null);
  const [refinement, setRefinement] = useState("");

  useEffect(() => {
    if (!hydrated || !trip) return;
    // Browser-local cowork state is part of this prototype handoff.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCowork(loadCowork(trip));
  }, [hydrated, trip]);

  if (!hydrated || !trip || !cowork) return <div className="mx-auto h-[70vh] max-w-[1120px] rounded-[28px] shimmer" />;

  const destination = tripDestination(trip);
  const proposal = trip.destinationProposals.find((item) => item.id === trip.selectedProposalId) ?? trip.destinationProposals.find((item) => item.destination.toLowerCase().includes(destination.split(",")[0].toLowerCase())) ?? trip.destinationProposals[0];
  const flights = flightOptions(destination);
  const stays = stayOptions(destination, cowork.fixedEvents);
  const flight = flights.find((item) => item.id === cowork.selectedFlightId) ?? flights[0];
  const stay = stays.find((item) => item.id === cowork.selectedStayId) ?? stays[0];
  const flightChosen = trip.componentStates.flight !== "undecided" || cowork.flightStatus !== "Not started";
  const stayChosen = trip.componentStates.stay !== "undecided" || cowork.stayStatus !== "Not started";
  const coreChosen = flightChosen && stayChosen;
  const days = trip.itineraryDraft?.days ?? [];

  const updateDay = (index: number, field: keyof ItineraryDay, value: string) => {
    if (!trip.itineraryDraft) return;
    const next = trip.itineraryDraft.days.map((day, dayIndex) => dayIndex === index ? editDay(day, field, value) : day);
    store.patchTrip(trip.id, { itineraryDraft: { ...trip.itineraryDraft, days: next, updatedAt: new Date().toISOString() } });
  };

  const applyRefinement = () => {
    const text = refinement.trim();
    if (!text) return;
    store.refineItinerary(trip.id, text);
    setRefinement("");
    toast("Updated this itinerary draft.");
  };

  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-24 pt-5 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><span className="rounded-full border border-hair bg-white px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.1em] text-faint">OtterWay</span>{fromHandoff && <span className="text-[9.5px] font-semibold text-muted">Same trip · no re-entry</span>}</div>
        <Link href={`/trips/${trip.id}/workspace`} className="text-[10.5px] font-semibold text-muted transition hover:text-ink">← Back to RoaminRabbit decisions</Link>
      </div>

      <section className="relative mt-5 overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_24px_70px_-42px_rgba(27,26,23,.5)]">
        {proposal && <Photo image={proposal.heroImage} ratio="hero" tone={proposal.heroTone} width={1700} rounded="rounded-none" priority className="h-[330px] w-full !aspect-auto opacity-76 md:h-[390px]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,.9)] via-[rgba(8,8,8,.22)] to-[rgba(8,8,8,.08)]" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <p className="text-[9px] font-semibold uppercase tracking-[.14em] text-white/58">{destination} · {tripDates(trip)} · {trip.travelers} traveler{trip.travelers === 1 ? "" : "s"}</p>
          <h1 className="mt-2 max-w-[15ch] font-display text-[clamp(38px,6vw,62px)] font-semibold leading-[.96] tracking-[-.045em]">Your trip, now ready to organize.</h1>
          <p className="mt-3 max-w-[58ch] text-[12px] leading-relaxed text-white/72">OtterWay picks up the choices already made in RoaminRabbit, then turns them into the collaborative, editable version of the trip.</p>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-7 grid max-w-[1040px] gap-3 px-3 sm:grid-cols-2 md:px-6">
        <BookingSummary label="Flight" title={flightChosen ? `${flight.airline} · ${flight.route}` : "Flight still open"} detail={flightChosen ? `${flight.depart} → ${flight.arrive} · ${flight.stops}` : "Choose or track a flight in RoaminRabbit first."} status={cowork.flightStatus} />
        <BookingSummary label="Stay" title={stayChosen ? stay.name : "Stay still open"} detail={stayChosen ? `${stay.area} · ${stay.room}` : "Choose or watch a stay in RoaminRabbit first."} status={cowork.stayStatus} />
      </section>

      {!coreChosen ? (
        <section className="mx-auto mt-8 max-w-[780px] rounded-[24px] border border-hair bg-white/66 p-7 text-center md:p-9">
          <p className="text-[9px] font-semibold uppercase tracking-[.11em] text-faint">Not enough real trip yet</p>
          <h2 className="mt-2 font-display text-[30px] font-semibold tracking-[-.035em]">Finish the flight and stay first.</h2>
          <p className="mx-auto mt-3 max-w-[54ch] text-[12.5px] leading-relaxed text-muted">OtterWay should not invent a daily itinerary before the core trip exists. Once those choices are saved, tracked, or booked, you can ask AI to sketch the first version here.</p>
          <Link href={`/trips/${trip.id}/workspace`} className={`${buttonClass("ink", "sm")} mt-5`}>Return to recommendations →</Link>
        </section>
      ) : !trip.itineraryDraft ? (
        <section className="mx-auto mt-8 grid max-w-[980px] gap-5 rounded-[25px] border border-hair bg-white/68 p-6 md:grid-cols-[1.1fr_.9fr] md:p-8">
          <div><p className="text-[9px] font-semibold uppercase tracking-[.11em] text-faint">First draft</p><h2 className="mt-2 max-w-[13ch] font-display text-[34px] font-semibold leading-[1] tracking-[-.04em]">Let AI sketch the trip around what is already real.</h2><p className="mt-3 max-w-[55ch] text-[12px] leading-relaxed text-muted">The flight, hotel, fixed events and existing trip context become anchors. The rest stays deliberately flexible and editable.</p><Button variant="ink" className="mt-5" onClick={() => { store.sketchItinerary(trip.id); toast("Your first itinerary draft is ready."); }}>Draft my itinerary with AI →</Button></div>
          <div className="rounded-[20px] border border-hair bg-surface-2 p-5"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-faint">What will carry over</p><div className="mt-3 grid gap-2">{[`${flight.airline} · ${flight.route}`, `${stay.name} · ${stay.area}`, ...cowork.fixedEvents.slice(0, 2).map((event) => `${event.title} · ${event.when}`)].map((item) => <div key={item} className="rounded-[11px] bg-white px-3 py-2.5 text-[10px] font-semibold text-ink-soft">✓ {item}</div>)}</div><p className="mt-3 text-[9px] leading-relaxed text-faint">No restaurant, activity or reservation is treated as chosen unless you add or approve it.</p></div>
        </section>
      ) : (
        <>
          <div className="mx-auto mt-10 max-w-[980px]">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.11em] text-faint">Your itinerary</p><h2 className="mt-1 font-display text-[32px] font-semibold tracking-[-.04em]">A flexible first version</h2></div><span className="rounded-full bg-[#e7f1e8] px-3 py-1.5 text-[9.5px] font-semibold text-[#35543c]">Bookings stay fixed</span></div>
            <div className="mt-5 grid gap-4">
              {days.map((day, index) => (
                <article key={day.day} className="grid gap-4 rounded-[22px] border border-hair bg-white/72 p-5 sm:grid-cols-[90px_1fr] sm:p-6">
                  <div><p className="text-[9px] font-semibold uppercase tracking-[.11em] text-accent">{day.day}</p><span className="mt-2 block h-px w-9 bg-accent/30" /></div>
                  <div>
                    <input value={day.title} onChange={(event) => updateDay(index, "title", event.target.value)} aria-label={`${day.day} title`} className="w-full bg-transparent font-display text-[22px] font-semibold tracking-[-.03em] outline-none focus:text-accent" />
                    <div className="mt-4 grid gap-2">
                      {(["morning", "afternoon", "evening", "freeTime"] as const).map((field) => <label key={field} className="grid gap-1 rounded-[13px] bg-surface-2/70 px-3 py-2.5 sm:grid-cols-[84px_1fr]"><span className="pt-0.5 text-[8.5px] font-semibold uppercase tracking-[.09em] text-faint">{field === "freeTime" ? "Free time" : field}</span><textarea value={day[field]} onChange={(event) => updateDay(index, field, event.target.value)} rows={1} className="resize-none bg-transparent text-[11px] leading-relaxed text-ink-soft outline-none focus:text-accent" /></label>)}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="sticky bottom-4 z-30 mx-auto mt-7 max-w-[800px] rounded-[19px] border border-hair bg-white/94 p-2 shadow-[0_18px_52px_-25px_rgba(27,26,23,.42)] backdrop-blur-xl focus-within:border-accent">
              <div className="flex items-center gap-2"><input value={refinement} onChange={(event) => setRefinement(event.target.value)} onKeyDown={(event) => event.key === "Enter" && applyRefinement()} placeholder="Make the first day easier, keep Saturday open…" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[11.5px] outline-none placeholder:text-faint"/><button onClick={applyRefinement} className="grid h-10 w-10 place-items-center rounded-[12px] bg-ink text-paper" aria-label="Refine itinerary">→</button></div>
            </div>
          </div>

          <section className="mx-auto mt-9 grid max-w-[980px] gap-4 md:grid-cols-2">
            <div className="rounded-[21px] border border-hair bg-white/68 p-5"><p className="text-[9px] font-semibold uppercase tracking-[.11em] text-faint">Collaborate</p><h3 className="mt-2 font-display text-[22px] font-semibold tracking-[-.03em]">Make the plan shared, not duplicated.</h3><p className="mt-2 text-[11px] leading-relaxed text-muted">Invite travelers, collect reactions, save places and keep comments attached to the same trip context.</p><Link href={`/trips/${trip.id}/travelers`} className="mt-4 inline-flex text-[10.5px] font-semibold text-accent">Invite travelers →</Link></div>
            <div className="rounded-[21px] border border-hair bg-surface-2 p-5"><p className="text-[9px] font-semibold uppercase tracking-[.11em] text-faint">Later in OtterWay</p><div className="mt-3 flex flex-wrap gap-2">{["Saved places", "Collections", "Comments & voting", "Routing", "Expenses", "Active-trip mode"].map((item) => <span key={item} className="rounded-full border border-hair bg-white px-3 py-1.5 text-[9px] font-semibold text-muted">{item}</span>)}</div></div>
          </section>
        </>
      )}
    </div>
  );
}
