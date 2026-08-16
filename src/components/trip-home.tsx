"use client";

import Link from "next/link";
import { useState } from "react";
import { useTrip } from "@/lib/store";
import { Photo } from "@/components/photo";
import { Button, buttonClass, Disclosure, EmptyState, Eyebrow, PrototypeBadge, useToast } from "@/components/ui";
import type { ItineraryDay, TripComponentState, TripLifecycle } from "@/lib/types";

const IDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

const STATE_LABEL: Record<TripComponentState, string> = {
  undecided: "Open",
  saved: "Saved",
  tracked: "Tracked — not booked",
  confirmed: "Confirmed",
};

const STATE_CLASS: Record<TripComponentState, string> = {
  undecided: "bg-paper-2 text-muted",
  saved: "bg-accent-tint text-accent",
  tracked: "bg-accent-tint text-accent",
  confirmed: "bg-ink text-paper",
};

function stateCopy(lifecycle: TripLifecycle, destination: string, tracking: boolean) {
  if (lifecycle === "booked") {
    return { eyebrow: "Booked", title: `${destination} is yours.`, body: "Everything you chose is confirmed. Nothing else needs your attention today." };
  }
  if (lifecycle === "partially-booked") {
    return { eyebrow: "Partially booked", title: `Your ${destination} trip is coming together.`, body: tracking ? "Your stay is booked. Roam is still watching flights." : "Your stay is booked. Flights are still open." };
  }
  return { eyebrow: "Planning", title: `Your ${destination} trip is taking shape.`, body: "Nothing is booked yet. Roam is keeping your choices together." };
}

function StatusPill({ state }: { state: TripComponentState }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${STATE_CLASS[state]}`}>{STATE_LABEL[state]}</span>;
}

function editDayField(day: ItineraryDay, field: keyof ItineraryDay, value: string): ItineraryDay {
  return { ...day, [field]: value };
}

export function TripHome({ tripId }: { tripId: string }) {
  const { trip, store, hydrated } = useTrip(tripId);
  const { toast } = useToast();
  const [refinement, setRefinement] = useState("");
  const [pendingScope, setPendingScope] = useState<string | null>(null);

  if (!hydrated || !trip) {
    return <div className="grid gap-5"><div className="h-[46vh] rounded-card shimmer" /><div className="h-32 rounded-card shimmer" /></div>;
  }

  const selected = trip.destinationProposals.find((p) => p.id === trip.selectedProposalId);
  if (!selected) {
    return (
      <EmptyState
        title="Choose a trip direction first"
        body="Your Trip Home appears the moment you start with a recommendation."
        action={<Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ink", "sm")}>See my recommendation →</Link>}
      />
    );
  }

  const copy = stateCopy(trip.lifecycle, selected.destination, Boolean(trip.trackedFlight));
  const days = trip.itineraryDraft?.days ?? [];

  const updateDay = (index: number, field: keyof ItineraryDay, value: string) => {
    if (!trip.itineraryDraft) return;
    const next = trip.itineraryDraft.days.map((day, i) => i === index ? editDayField(day, field, value) : day);
    store.patchTrip(trip.id, { itineraryDraft: { ...trip.itineraryDraft, days: next, updatedAt: new Date().toISOString() } });
  };

  const applyRefinement = (scope: "trip" | "profile") => {
    if (!pendingScope) return;
    store.refineItinerary(trip.id, pendingScope);
    if (scope === "profile") {
      store.addPref({
        category: "Pace",
        statement: pendingScope,
        priority: "usually",
        scope: "all",
        source: "confirmed",
        confidence: 0.72,
      });
      toast("Applied here and added to your Traveler Profile.");
    } else {
      toast("Applied to this trip only.");
    }
    setPendingScope(null);
  };

  return (
    <div>
      <section className="relative overflow-hidden rounded-[26px] bg-ink text-white">
        <Photo image={selected.heroImage} ratio="hero" tone={selected.heroTone} width={1800} rounded="rounded-none" priority className="max-h-[52vh] opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,.9)] via-[rgba(8,8,8,.2)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/70">{copy.eyebrow} · {selected.recommendedWindow}</p>
          <h1 className="mt-3 max-w-[15ch] font-display text-[clamp(36px,6vw,68px)] font-semibold leading-[0.96] tracking-[-0.05em]">{copy.title}</h1>
          <p className="mt-4 max-w-[55ch] text-[16px] leading-relaxed text-white/78">{copy.body}</p>
        </div>
      </section>

      <div className="mx-auto max-w-[960px]">
        <section className="grid gap-6 border-b border-hair py-8 sm:grid-cols-3 md:py-10">
          <div><Eyebrow>Trip state</Eyebrow><p className="mt-2 font-display text-[22px] font-semibold capitalize tracking-[-0.025em]">{trip.lifecycle.replace("-", " ")}</p></div>
          <div><Eyebrow>Estimated total</Eyebrow><p className="mt-2 font-display text-[22px] font-semibold tracking-[-0.025em]">{selected.indicativePrice}</p></div>
          <div><Eyebrow>Travelers</Eyebrow><p className="mt-2 font-display text-[22px] font-semibold tracking-[-0.025em]">{trip.travelers} from Jakarta</p></div>
        </section>

        <section className="py-9 md:py-12">
          <Eyebrow>Needs your attention</Eyebrow>
          <div className="mt-4 flex items-start gap-3 border-l-2 border-accent pl-4">
            <span className="mt-0.5 text-accent">✓</span>
            <div><h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Nothing needs your attention today.</h2><p className="mt-1 text-[14px] text-muted">Decisions can stay open until you&apos;re ready. Roam will surface a real blocker here.</p></div>
          </div>
        </section>

        <section className="border-y border-hair py-9 md:py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><Eyebrow>Trip overview</Eyebrow><h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em]">The plan, without the noise.</h2></div>
            <Link href={`/trips/${trip.id}/destinations/${selected.id}`} className="text-[13.5px] font-semibold text-accent">Revisit recommendation →</Link>
          </div>
          <p className="mt-4 max-w-[65ch] text-[16px] leading-relaxed text-muted">{selected.thesis}</p>
          <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Window", selected.recommendedWindow], ["Weather", selected.weatherComfort],
              ["Journey", selected.journeyEffort], ["Getting around", selected.mobilityFit],
            ].map(([label, value]) => <div key={label}><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{label}</span><p className="mt-1.5 text-[14px] leading-snug text-ink-soft">{value}</p></div>)}
          </div>
        </section>

        <section className="py-9 md:py-12">
          <Eyebrow>Trip components</Eyebrow>
          <div className="mt-5 divide-y divide-hair border-y border-hair">
            <article className="grid gap-5 py-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex gap-4"><span className="font-display text-[13px] text-faint">01</span><div><div className="flex flex-wrap items-center gap-2.5"><h3 className="font-display text-2xl font-semibold tracking-[-0.025em]">Stay</h3><StatusPill state={trip.componentStates.stay} /></div><p className="mt-2 text-[15px] text-ink-soft">{selected.stay.name} · {selected.stay.location}</p><p className="mt-1 text-[13px] text-muted">{selected.stay.price}</p></div></div>
              <div className="flex flex-wrap gap-2">{trip.componentStates.stay !== "confirmed" && <Button size="sm" variant="ghost" onClick={() => { store.confirmTripComponent(trip.id, "stay"); toast("Stay marked confirmed for this prototype."); }}>Mark stay booked</Button>}<Link href={`/trips/${trip.id}/stays`} className={buttonClass("quiet", "sm")}>View stay →</Link></div>
            </article>
            <article className="grid gap-5 py-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex gap-4"><span className="font-display text-[13px] text-faint">02</span><div><div className="flex flex-wrap items-center gap-2.5"><h3 className="font-display text-2xl font-semibold tracking-[-0.025em]">Flights</h3><StatusPill state={trip.componentStates.flight} /></div><p className="mt-2 text-[15px] text-ink-soft">{trip.trackedFlight ? `${trip.trackedFlight.airline} · ${trip.trackedFlight.route}` : `${selected.flight.route} · ${selected.flight.airline}`}</p>{trip.trackedFlight && <p className="mt-1 text-[13px] text-muted">Current fare {IDR.format(trip.trackedFlight.currentFare)} · not booked</p>}</div></div>
              <div className="flex flex-wrap gap-2"><Link href={`/trips/${trip.id}/flights`} className={buttonClass("ghost", "sm")}>{trip.trackedFlight ? "Manage tracking" : "Choose or track"}</Link>{trip.componentStates.flight !== "confirmed" && <Link href={`/trips/${trip.id}/checkout`} className={buttonClass("quiet", "sm")}>Book →</Link>}</div>
            </article>
            <article className="grid gap-5 py-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex gap-4"><span className="font-display text-[13px] text-faint">03</span><div><div className="flex flex-wrap items-center gap-2.5"><h3 className="font-display text-2xl font-semibold tracking-[-0.025em]">Experiences</h3><StatusPill state={trip.componentStates.experiences} /></div><p className="mt-2 text-[15px] text-ink-soft">A light rhythm with protected free time.</p></div></div>
              <Link href={`/trips/${trip.id}/experiences`} className={buttonClass("quiet", "sm")}>Browse ideas →</Link>
            </article>
          </div>
        </section>

        <section className="rounded-[24px] bg-[#11110f] px-5 py-7 text-white md:px-8 md:py-9">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/55">Roam is watching</p><h2 className="mt-2 font-display text-[28px] font-semibold tracking-[-0.03em]">{trip.trackedFlight ? "Your exact flight, not a generic route." : "Nothing is being monitored yet."}</h2>
              {trip.trackedFlight ? <p className="mt-3 text-[14.5px] text-white/68">{trip.trackedFlight.airline} · {trip.trackedFlight.depart} → {trip.trackedFlight.arrive} · Last checked {new Date(trip.trackedFlight.lastCheckedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p> : <p className="mt-3 text-[14.5px] text-white/68">Track a specific flight and any deterministic prototype update will appear here.</p>}
              {trip.trackedFlight?.priceDropped && <p className="mt-3 inline-flex rounded-full bg-[#d8ffd8] px-3 py-1.5 text-[12.5px] font-semibold text-[#193d1c]">Fare dropped Rp 900.000 · now {IDR.format(trip.trackedFlight.currentFare)}</p>}
            </div>
            <div className="flex flex-wrap gap-2">{trip.trackedFlight && !trip.trackedFlight.priceDropped && <Button size="sm" variant="ghost" className="border-white/25 text-white hover:border-white" onClick={() => store.simulateTrackedFareDrop(trip.id)}>Simulate price update</Button>}<Link href={`/trips/${trip.id}/flights`} className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-ink">{trip.trackedFlight ? "Open flight" : "Track a flight"} →</Link></div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <Eyebrow>Whenever you&apos;re ready</Eyebrow>
          {!trip.itineraryDraft ? (
            <div className="mt-4 grid gap-5 md:grid-cols-[1fr_auto] md:items-center"><div><h2 className="font-display text-3xl font-semibold tracking-[-0.035em]">Sketch my itinerary first</h2><p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-muted">One click creates a loose draft from your brief, profile, selected stay, and anything saved or tracked. It deliberately protects free time.</p></div><Button variant="ink" onClick={() => { store.sketchItinerary(trip.id); toast("A loose itinerary draft is ready."); }}>Sketch itinerary</Button></div>
          ) : (
            <div className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-3xl font-semibold tracking-[-0.035em]">A loose {selected.destination} rhythm</h2><p className="mt-1 text-[13px] text-muted">Draft · edit any line directly</p></div><span className="rounded-full bg-accent-tint px-3 py-1.5 text-[12px] font-semibold text-accent">Free time protected</span></div>
              <div className="mt-6 divide-y divide-hair border-y border-hair">
                {days.map((day, index) => <article key={day.day} className="grid gap-4 py-6 sm:grid-cols-[88px_1fr]"><p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-accent">{day.day}</p><div className="grid gap-3"><input value={day.title} onChange={(e) => updateDay(index, "title", e.target.value)} aria-label={`${day.day} title`} className="bg-transparent font-display text-xl font-semibold tracking-[-0.02em] outline-none focus-visible:text-accent" />{(["morning", "afternoon", "evening", "freeTime"] as const).map((field) => <label key={field} className="grid gap-1 sm:grid-cols-[88px_1fr]"><span className="pt-1 text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">{field === "freeTime" ? "Free time" : field}</span><textarea value={day[field]} onChange={(e) => updateDay(index, field, e.target.value)} rows={1} className="resize-none bg-transparent text-[14px] leading-relaxed text-ink-soft outline-none focus-visible:text-accent" /></label>)}</div></article>)}
              </div>
              {trip.itineraryDraft.refinements.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{trip.itineraryDraft.refinements.map((r) => <span key={r} className="rounded-full bg-accent-tint px-3 py-1.5 text-[12px] text-accent">Applied: {r}</span>)}</div>}
              <form onSubmit={(e) => { e.preventDefault(); if (!refinement.trim()) return; setPendingScope(refinement.trim()); setRefinement(""); }} className="mt-6 flex flex-col gap-2 sm:flex-row"><input value={refinement} onChange={(e) => setRefinement(e.target.value)} placeholder="Make day two slower, add one standout dinner…" aria-label="Refine itinerary" className="min-w-0 flex-1 rounded-full border border-hair bg-surface px-4 py-3 text-[14px] outline-none focus-visible:border-accent" /><Button variant="ghost" type="submit">Refine</Button></form>
              {pendingScope && <div className="disclose mt-4 rounded-[18px] border border-accent-line bg-accent-tint/55 p-4"><p className="text-[14px] font-medium text-ink">Apply “{pendingScope}” where?</p><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="ink" onClick={() => applyRefinement("trip")}>Only for this trip</Button><Button size="sm" variant="ghost" onClick={() => applyRefinement("profile")}>Update my Traveler Profile</Button></div></div>}
            </div>
          )}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">{["Invite a traveler", "Add something booked elsewhere", "Share this trip"].map((label) => <button key={label} onClick={() => toast(`${label} is a prototype action.`)} className="border-t border-hair py-4 text-left text-[14px] font-semibold text-ink transition hover:text-accent">{label} <span className="float-right text-faint">↗</span></button>)}</div>
        </section>

        <section className="border-t border-hair pt-8">
          <Disclosure label="Trip details & prototype notes">
            <div className="grid gap-5 rounded-[18px] bg-surface-2 p-5 sm:grid-cols-2"><div><Eyebrow>Logistics</Eyebrow><p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{selected.flight.route} · {selected.journeyEffort}<br />{selected.stay.location}<br />{selected.recommendedWindow}</p></div><div><PrototypeBadge /><p className="mt-3 text-[13px] leading-relaxed text-muted">Flight fares, availability, monitoring, booking, and payment are deterministic mock behavior for this prototype. No live travel API is connected and no money is taken.</p></div></div>
          </Disclosure>
        </section>
      </div>
    </div>
  );
}
