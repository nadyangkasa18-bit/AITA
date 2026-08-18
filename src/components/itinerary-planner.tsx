"use client";

import Link from "next/link";
import { useState } from "react";
import { useTrip } from "@/lib/store";
import { Button, EmptyState, Eyebrow, buttonClass, useToast } from "@/components/ui";
import { StickyAction } from "@/components/sticky-action";
import type { ItineraryDay } from "@/lib/types";

function editDayField(day: ItineraryDay, field: keyof ItineraryDay, value: string): ItineraryDay {
  return { ...day, [field]: value };
}

export function ItineraryPlanner({ tripId }: { tripId: string }) {
  const { trip, store, hydrated } = useTrip(tripId);
  const { toast } = useToast();
  const [refinement, setRefinement] = useState("");
  const [pendingScope, setPendingScope] = useState<string | null>(null);

  if (!hydrated || !trip) return <div className="mx-auto h-[55vh] max-w-[860px] rounded-card shimmer" />;
  const selected = trip.destinationProposals.find((proposal) => proposal.id === trip.selectedProposalId);
  if (!selected) {
    return <EmptyState title="Choose a trip direction first" body="The itinerary starts from a trip you have already chosen." action={<Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ink", "sm")}>See recommendations →</Link>} />;
  }

  const days = trip.itineraryDraft?.days ?? [];
  const updateDay = (index: number, field: keyof ItineraryDay, value: string) => {
    if (!trip.itineraryDraft) return;
    const next = trip.itineraryDraft.days.map((day, dayIndex) => dayIndex === index ? editDayField(day, field, value) : day);
    store.patchTrip(trip.id, { itineraryDraft: { ...trip.itineraryDraft, days: next, updatedAt: new Date().toISOString() } });
  };
  const applyRefinement = (scope: "trip" | "profile") => {
    if (!pendingScope) return;
    store.refineItinerary(trip.id, pendingScope);
    if (scope === "profile") {
      store.addPref({ category: "Pace", statement: pendingScope, priority: "usually", scope: "all", source: "confirmed", confidence: 0.72 });
      toast("Applied here and added to your Traveler Profile.");
    } else {
      toast("Applied to this trip only.");
    }
    setPendingScope(null);
  };

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={`/trips/${trip.id}/home`} className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back to trip overview</Link>
        <span className="rounded-full bg-paper-2 px-3 py-1.5 text-[11.5px] font-semibold text-muted">{selected.destination} · Shared itinerary</span>
      </div>

      <div className="mx-auto mt-9 max-w-[680px] text-center">
        <Eyebrow>Shared itinerary</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(34px,5vw,52px)] font-semibold leading-[1.02] tracking-[-0.04em]">Your trip, already organized.</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">Your bookings, useful trip services and a flexible day-by-day plan live together here. Every line stays editable.</p>
      </div>

      {!trip.itineraryDraft ? (
        <section className="mx-auto mt-10 max-w-[680px] rounded-[24px] border border-hair bg-surface p-6 text-center md:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.025em]">Sketch the first version</h2>
          <p className="mx-auto mt-3 max-w-[50ch] text-[14.5px] leading-relaxed text-muted">This is a planning draft, not a locked schedule. You can edit every line afterwards.</p>
          <Button variant="ink" className="mt-6" onClick={() => { store.sketchItinerary(trip.id); toast("A loose itinerary draft is ready."); }}>Sketch itinerary →</Button>
        </section>
      ) : (
        <>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
            <div><Eyebrow>Your plan</Eyebrow><h2 className="mt-1 font-display text-3xl font-semibold tracking-[-0.035em]">A flexible {selected.destination} rhythm</h2></div>
            <span className="rounded-full bg-accent-tint px-3 py-1.5 text-[12px] font-semibold text-accent">Free time protected</span>
          </div>

          <div className="mt-6 divide-y divide-hair border-y border-hair">
            {days.map((day, index) => (
              <article key={day.day} className="grid gap-4 py-6 sm:grid-cols-[88px_1fr]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-accent">{day.day}</p>
                <div className="grid gap-3">
                  <input value={day.title} onChange={(event) => updateDay(index, "title", event.target.value)} aria-label={`${day.day} title`} className="bg-transparent font-display text-xl font-semibold tracking-[-0.02em] outline-none focus-visible:text-accent" />
                  {(["morning", "afternoon", "evening", "freeTime"] as const).map((field) => (
                    <label key={field} className="grid gap-1 sm:grid-cols-[88px_1fr]">
                      <span className="pt-1 text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">{field === "freeTime" ? "Free time" : field}</span>
                      <textarea value={day[field]} onChange={(event) => updateDay(index, field, event.target.value)} rows={1} className="resize-none bg-transparent text-[14px] leading-relaxed text-ink-soft outline-none focus-visible:text-accent" />
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {trip.itineraryDraft.refinements.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">{trip.itineraryDraft.refinements.map((item) => <span key={item} className="rounded-full bg-accent-tint px-3 py-1.5 text-[12px] text-accent">Applied: {item}</span>)}</div>
          )}

          <form onSubmit={(event) => { event.preventDefault(); if (!refinement.trim()) return; setPendingScope(refinement.trim()); setRefinement(""); }} className="mt-7 flex flex-col gap-2 sm:flex-row">
            <input value={refinement} onChange={(event) => setRefinement(event.target.value)} placeholder="Make day two slower, add one standout dinner…" aria-label="Refine itinerary" className="min-w-0 flex-1 rounded-full border border-hair bg-surface px-4 py-3 text-[14px] outline-none focus-visible:border-accent" />
            <Button variant="ghost" type="submit">Refine</Button>
          </form>

          {pendingScope && (
            <div className="disclose mt-4 rounded-[18px] border border-accent-line bg-accent-tint/55 p-4">
              <p className="text-[14px] font-medium text-ink">Apply “{pendingScope}” where?</p>
              <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="ink" onClick={() => applyRefinement("trip")}>Only for this trip</Button><Button size="sm" variant="ghost" onClick={() => applyRefinement("profile")}>Update my Traveler Profile</Button></div>
            </div>
          )}
        </>
      )}

      <section className="mt-9 grid gap-4 md:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-[22px] border border-hair bg-surface p-5">
          <Eyebrow>Travel group</Eyebrow>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-display text-[22px] font-semibold tracking-[-0.03em]">{trip.collaborators.length} traveler{trip.collaborators.length === 1 ? "" : "s"} connected</h2><p className="mt-1 text-[12.5px] text-muted">Invite the group to react and suggest changes in one shared place.</p></div><Link href={`/trips/${trip.id}/travelers`} className={buttonClass("ghost", "sm")}>Invite travelers</Link></div>
          <div className="mt-4 flex -space-x-2">{trip.collaborators.slice(0, 5).map((traveler) => <span key={traveler.id} title={traveler.name} className="grid h-9 w-9 place-items-center rounded-full border-2 border-surface bg-ink text-[11px] font-semibold text-paper">{traveler.name.charAt(0).toUpperCase()}</span>)}</div>
        </div>
        <div className="rounded-[22px] border border-hair bg-surface-2 p-5">
          <Eyebrow>Next needs</Eyebrow>
          {trip.selectedAddonIds.length ? <div className="mt-3 flex flex-wrap gap-2">{trip.selectedAddonIds.map((id) => <span key={id} className="rounded-full bg-white px-3 py-1.5 text-[11.5px] font-semibold text-ink-soft">{id === "entry" ? "Entry check" : id === "esim" ? "Travel eSIM" : "Travel protection"} ✓</span>)}</div> : <p className="mt-3 text-[12.5px] leading-relaxed text-muted">Entry checks, connectivity and protection stay optional until they are relevant.</p>}
        </div>
      </section>

      <StickyAction meta="Bookings and plans stay in sync" note="Share changes with everyone traveling.">
        <Link href={`/trips/${trip.id}/travelers`} className={buttonClass("ink", "sm")}>Share this itinerary →</Link>
      </StickyAction>
    </div>
  );
}
