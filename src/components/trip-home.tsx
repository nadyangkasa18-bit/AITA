"use client";

import Link from "next/link";
import { useTrip } from "@/lib/store";
import { Photo } from "@/components/photo";
import { Disclosure, EmptyState, Eyebrow, PrototypeBadge, buttonClass } from "@/components/ui";
import type { TripComponentState } from "@/lib/types";

const IDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function StatePill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "watch" | "done" }) {
  const cls = tone === "done" ? "bg-[#dcebdc] text-[#24522c]" : tone === "watch" ? "bg-accent-tint text-accent" : "bg-paper-2 text-muted";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

function bookingLabel(kind: "flight" | "stay" | "experiences", state: TripComponentState) {
  if (kind === "flight") {
    if (state === "confirmed") return { label: "Flight booked", tone: "done" as const };
    if (state === "tracked") return { label: "Flight tracked", tone: "watch" as const };
    if (state === "saved") return { label: "Flight saved", tone: "watch" as const };
    return { label: "Flight not booked", tone: "neutral" as const };
  }
  if (kind === "stay") {
    if (state === "confirmed") return { label: "Stay booked", tone: "done" as const };
    if (state === "saved") return { label: "Stay saved", tone: "watch" as const };
    return { label: "Stay not booked", tone: "neutral" as const };
  }
  if (state === "confirmed") return { label: "Plans added", tone: "done" as const };
  if (state === "saved") return { label: "Ideas saved", tone: "watch" as const };
  return { label: "Not planned", tone: "neutral" as const };
}

function SnapshotRow({
  label,
  value,
  status,
  tone,
  href,
}: {
  label: string;
  value: string;
  status: string;
  tone?: "neutral" | "watch" | "done";
  href?: string;
}) {
  const content = (
    <div className="grid gap-2 py-4 sm:grid-cols-[130px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <p className="text-[12px] font-semibold uppercase tracking-[0.09em] text-faint">{label}</p>
      <p className="min-w-0 text-[13.5px] font-medium leading-snug text-ink-soft">{value}</p>
      <StatePill label={status} tone={tone} />
    </div>
  );

  return href ? <Link href={href} className="block border-b border-hair-2 transition last:border-b-0 hover:bg-surface-2/70">{content}</Link> : <div className="border-b border-hair-2 last:border-b-0">{content}</div>;
}

export function TripHome({ tripId }: { tripId: string }) {
  const { trip, hydrated } = useTrip(tripId);

  if (!hydrated || !trip) return <div className="grid gap-5"><div className="h-[320px] rounded-card shimmer" /><div className="h-40 rounded-card shimmer" /></div>;
  const selected = trip.destinationProposals.find((proposal) => proposal.id === trip.selectedProposalId);
  if (!selected) {
    return <EmptyState title="Choose a trip direction first" body="Trip Home appears the moment you start with a recommendation." action={<Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ink", "sm")}>See recommendations →</Link>} />;
  }

  const tracked = trip.trackedFlight;
  const isBooked = trip.lifecycle === "booked";
  const isPartial = trip.lifecycle === "partially-booked";
  const needsFareReview = Boolean(tracked?.priceDropped && trip.componentStates.flight !== "confirmed");
  const flightStatus = bookingLabel("flight", trip.componentStates.flight);
  const stayStatus = bookingLabel("stay", trip.componentStates.stay);
  const experienceStatus = bookingLabel("experiences", trip.componentStates.experiences);

  const primary = isBooked
    ? { eyebrow: "Core bookings settled", title: "Flight and stay are handled.", body: "There is no artificial 100% to chase. Add the itinerary, transfer or trip services only if this trip needs them.", href: `/trips/${trip.id}/itinerary`, label: "Plan the days" }
    : needsFareReview
      ? { eyebrow: "Worth a look", title: "Your tracked flight changed price.", body: `It is now ${IDR.format(tracked!.currentFare)} — Rp 900.000 below the fare you started tracking.`, href: `/trips/${trip.id}/flights`, label: "Review flight" }
      : isPartial
        ? { eyebrow: "One core booking is done", title: "Keep going, or stop here for now.", body: "Roam shows what is booked without treating every optional category as unfinished. You can handle the remaining core booking when you want to.", href: trip.componentStates.flight === "confirmed" ? `/trips/${trip.id}/stays` : `/trips/${trip.id}/flights`, label: trip.componentStates.flight === "confirmed" ? "Review stay" : "Review flight" }
        : { eyebrow: "Ready when you are", title: "Your booking plan is ready to review.", body: "Review the flight and stay together. Transfer, experiences, visa and connectivity remain separate choices rather than part of a completion score.", href: `/trips/${trip.id}/checkout`, label: "Review booking plan" };

  const heroTags = [
    trip.componentStates.flight === "confirmed" ? "Flight booked" : trip.componentStates.flight === "tracked" ? "Flight tracked" : null,
    trip.componentStates.stay === "confirmed" ? "Stay booked" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-[1080px]">
      <section className="relative overflow-hidden rounded-[26px] bg-ink text-white">
        <Photo image={selected.heroImage} ratio="hero" tone={selected.heroTone} width={1600} rounded="rounded-none" priority className="h-[300px] w-full !aspect-auto opacity-70 md:h-[340px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,.88)] via-[rgba(8,8,8,.2)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/75">{selected.destination} · {trip.lifecycle.replace("-", " ")}</span>
            {heroTags.map((tag) => <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold text-ink">✓ {tag}</span>)}
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="font-display text-[clamp(34px,5vw,54px)] font-semibold leading-[0.98] tracking-[-0.045em]">{trip.name}</h1>
              <p className="mt-3 max-w-[58ch] text-[14.5px] leading-relaxed text-white/72">{selected.thesis}</p>
            </div>
            <Link href={`/trips/${trip.id}/destinations/${selected.id}`} className="rounded-full border border-white/25 bg-black/15 px-4 py-2 text-[12.5px] font-semibold text-white backdrop-blur transition hover:border-white/60">Trip details</Link>
          </div>
        </div>
      </section>

      <section className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-b border-hair pb-5 text-[12.5px] text-muted">
        <span><strong className="font-semibold text-ink-soft">{selected.recommendedWindow}</strong></span>
        <span>{trip.travelers} travelers · Jakarta</span>
        <span>{selected.indicativePrice}</span>
        <span>{selected.mobilityFit}</span>
      </section>

      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
        <main>
          <section className="rounded-[24px] border border-hair bg-surface p-6 md:p-7">
            <Eyebrow>{primary.eyebrow}</Eyebrow>
            <div className="mt-2 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <h2 className="font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.02] tracking-[-0.035em]">{primary.title}</h2>
                <p className="mt-3 max-w-[60ch] text-[14.5px] leading-relaxed text-muted">{primary.body}</p>
              </div>
              <Link href={primary.href} className={buttonClass("ink", "md")}>{primary.label} →</Link>
            </div>
          </section>

          <section className="mt-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><Eyebrow>Booking snapshot</Eyebrow><h2 className="mt-1 font-display text-[30px] font-semibold tracking-[-0.035em]">What this trip already has</h2></div>
              <p className="max-w-[34ch] text-right text-[12px] leading-relaxed text-faint">Status, not a completion score. Only book what this trip actually needs.</p>
            </div>
            <div className="mt-4 overflow-hidden rounded-[22px] border border-hair bg-surface px-5">
              <SnapshotRow label="Flights" value={tracked ? `${tracked.airline} · ${tracked.route} · ${IDR.format(tracked.currentFare)}` : `${selected.flight.airline} · ${selected.flight.route}`} status={flightStatus.label} tone={flightStatus.tone} href={`/trips/${trip.id}/flights`} />
              <SnapshotRow label="Stay" value={`${selected.stay.name} · ${selected.stay.location}`} status={stayStatus.label} tone={stayStatus.tone} href={`/trips/${trip.id}/stays`} />
              <SnapshotRow label="Airport transfer" value={trip.componentStates.flight === "confirmed" ? "Ready to coordinate around your confirmed arrival" : "Best decided after the flight timing is known"} status={trip.componentStates.flight === "confirmed" ? "Ready to arrange" : "Wait for flight"} />
              <SnapshotRow label="Experiences" value="A light set of ideas with free time protected" status={experienceStatus.label} tone={experienceStatus.tone} href={`/trips/${trip.id}/experiences`} />
              <SnapshotRow label="Entry & visa" value="Passport-specific requirements surface only if action is needed" status="Check when needed" />
              <SnapshotRow label="eSIM & insurance" value="Kept with the trip and surfaced closer to departure" status="Optional later" />
            </div>
          </section>
        </main>

        <aside className="grid gap-4 lg:sticky lg:top-24">
          <section className="rounded-[20px] border border-hair bg-surface-2 p-5">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent" /><Eyebrow>Roam is watching</Eyebrow></div>
            <h2 className="mt-2 font-display text-[21px] font-semibold tracking-[-0.025em]">{tracked ? `${tracked.airline} · ${tracked.route}` : "Nothing tracked yet"}</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{tracked ? `${IDR.format(tracked.currentFare)} · ${trip.componentStates.flight === "confirmed" ? "already booked" : "tracked, not booked"}.` : "Track an exact flight only when you want Roam to keep watching it."}</p>
            <Link href={`/trips/${trip.id}/flights`} className="mt-4 inline-flex text-[12.5px] font-semibold text-accent">{tracked ? "Open flight" : "Review flights"} →</Link>
          </section>

          <Link href={`/trips/${trip.id}/itinerary`} className="group rounded-[20px] border border-hair bg-surface p-5 transition hover:border-ink/25">
            <Eyebrow>Plan the days</Eyebrow>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.025em]">{trip.itineraryDraft ? "Continue itinerary" : "Sketch the itinerary"}</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">Keep day-to-day planning out of the booking dashboard.</p>
            <span className="mt-4 inline-flex text-[12.5px] font-semibold text-accent">Open planner →</span>
          </Link>

          <Link href={`/trips/${trip.id}/brief`} className="rounded-[20px] border border-hair bg-surface p-5 transition hover:border-ink/25">
            <Eyebrow>Trip brief</Eyebrow>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.025em]">Why this plan fits</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">What Roam is protecting, negotiating and assuming.</p>
            <span className="mt-4 inline-flex text-[12.5px] font-semibold text-accent">Review brief →</span>
          </Link>
        </aside>
      </div>

      <div className="mt-8">
        <Disclosure label="Trip details & prototype notes">
          <div className="grid gap-5 rounded-[18px] bg-surface-2 p-5 sm:grid-cols-2">
            <div><Eyebrow>Logistics</Eyebrow><p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{selected.flight.route} · {selected.journeyEffort}<br />{selected.stay.location}<br />{selected.recommendedWindow}</p></div>
            <div><PrototypeBadge /><p className="mt-3 text-[12.5px] leading-relaxed text-muted">Flight fares, monitoring, booking, payment and supplier statuses are deterministic mock behavior for this prototype. No live travel API is connected and no money is taken.</p></div>
          </div>
        </Disclosure>
      </div>
    </div>
  );
}
