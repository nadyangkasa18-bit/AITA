"use client";

import Link from "next/link";
import { useTrip } from "@/lib/store";
import { Photo } from "@/components/photo";
import { Button, Disclosure, EmptyState, Eyebrow, PrototypeBadge, buttonClass } from "@/components/ui";
import type { TripComponentState } from "@/lib/types";

const IDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

const STATE_LABEL: Record<TripComponentState, string> = {
  undecided: "Open",
  saved: "Saved",
  tracked: "Tracked",
  confirmed: "Confirmed",
};

function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "watch" | "done" }) {
  const cls = tone === "done" ? "bg-ink text-paper" : tone === "watch" ? "bg-accent-tint text-accent" : "bg-paper-2 text-muted";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

function ComponentCard({
  label,
  value,
  status,
  tone,
  href,
  action,
}: {
  label: string;
  value: string;
  status: string;
  tone?: "neutral" | "watch" | "done";
  href?: string;
  action?: string;
}) {
  return (
    <article className="rounded-[20px] border border-hair bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>{label}</Eyebrow>
        <StatusPill label={status} tone={tone} />
      </div>
      <p className="mt-4 min-h-[42px] text-[14px] font-medium leading-snug text-ink-soft">{value}</p>
      {href && action && <Link href={href} className="mt-5 inline-flex text-[13px] font-semibold text-accent transition hover:text-accent-press">{action} →</Link>}
    </article>
  );
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
  const needsFareReview = Boolean(tracked?.priceDropped);
  const primary = isBooked
    ? { eyebrow: "Next useful step", title: "Your bookings are settled.", body: "Nothing needs a decision right now. Build the day-to-day plan whenever you want to.", href: `/trips/${trip.id}/itinerary`, label: "Plan itinerary" }
    : needsFareReview
      ? { eyebrow: "Worth a look", title: "Your tracked flight changed price.", body: `It is now ${IDR.format(tracked!.currentFare)} — Rp 900.000 below the fare you started tracking.`, href: `/trips/${trip.id}/flights`, label: "Review flight" }
      : { eyebrow: isPartial ? "Needs your attention" : "Ready when you are", title: isPartial ? "One part of the trip is still open." : "Your booking plan is ready to review.", body: isPartial ? "Roam will keep the confirmed pieces intact while you decide what to do with the rest." : "Review the flight, stay and transfer together before anything is confirmed.", href: `/trips/${trip.id}/checkout`, label: "Review booking plan" };

  const stayState = trip.componentStates.stay;
  const flightState = trip.componentStates.flight;
  const experiencesState = trip.componentStates.experiences;

  return (
    <div className="mx-auto max-w-[1040px]">
      <section className="relative overflow-hidden rounded-[26px] bg-ink text-white">
        <Photo image={selected.heroImage} ratio="hero" tone={selected.heroTone} width={1600} rounded="rounded-none" priority className="h-[300px] w-full !aspect-auto opacity-70 md:h-[340px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,.86)] via-[rgba(8,8,8,.18)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-5 p-6 md:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/65">{selected.destination} · {trip.lifecycle.replace("-", " ")}</p>
            <h1 className="mt-2 font-display text-[clamp(34px,5vw,54px)] font-semibold leading-[0.98] tracking-[-0.045em]">{trip.name}</h1>
            <p className="mt-3 max-w-[55ch] text-[14.5px] leading-relaxed text-white/72">{selected.thesis}</p>
          </div>
          <Link href={`/trips/${trip.id}/destinations/${selected.id}`} className="rounded-full border border-white/25 bg-black/15 px-4 py-2 text-[12.5px] font-semibold text-white backdrop-blur transition hover:border-white/60">Revisit choice</Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Travel window", selected.recommendedWindow],
          ["Travelers", `${trip.travelers} from Jakarta`],
          ["Estimated total", selected.indicativePrice],
          ["Getting around", selected.mobilityFit],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[18px] border border-hair bg-surface-2 p-4">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">{label}</span>
            <p className="mt-1.5 text-[14px] font-semibold leading-snug text-ink-soft">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-7 rounded-[24px] border border-hair bg-surface p-6 md:p-7">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Eyebrow>{primary.eyebrow}</Eyebrow>
            <h2 className="mt-2 font-display text-[clamp(26px,4vw,38px)] font-semibold leading-[1.02] tracking-[-0.035em]">{primary.title}</h2>
            <p className="mt-3 max-w-[58ch] text-[14.5px] leading-relaxed text-muted">{primary.body}</p>
          </div>
          <Link href={primary.href} className={buttonClass("ink", "md")}>{primary.label} →</Link>
        </div>
      </section>

      <section className="mt-9">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><Eyebrow>Trip status</Eyebrow><h2 className="mt-1 font-display text-3xl font-semibold tracking-[-0.035em]">Everything, at a glance</h2></div>
          <p className="text-[12.5px] text-muted">Open means no decision is required yet.</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ComponentCard
            label="Stay"
            value={`${selected.stay.name} · ${selected.stay.location}`}
            status={STATE_LABEL[stayState]}
            tone={stayState === "confirmed" ? "done" : "neutral"}
            href={`/trips/${trip.id}/stays`}
            action="View stay"
          />
          <ComponentCard
            label="Flights"
            value={tracked ? `${tracked.airline} · ${tracked.route} · ${IDR.format(tracked.currentFare)}` : `${selected.flight.airline} · ${selected.flight.route}`}
            status={STATE_LABEL[flightState]}
            tone={flightState === "confirmed" ? "done" : flightState === "tracked" ? "watch" : "neutral"}
            href={`/trips/${trip.id}/flights`}
            action={tracked ? "Manage tracking" : "Review flights"}
          />
          <ComponentCard label="Airport transfer" value="Airport → Hakone transfer will be coordinated around the flight you book." status="Open" tone="neutral" />
          <ComponentCard
            label="Experiences"
            value="A light set of ideas with free time protected."
            status={STATE_LABEL[experiencesState]}
            tone={experiencesState === "confirmed" ? "done" : "neutral"}
            href={`/trips/${trip.id}/experiences`}
            action="View ideas"
          />
          <ComponentCard label="Entry & visa" value="Passport-specific requirements will surface only when they need action." status="Not checked yet" tone="neutral" />
          <ComponentCard label="eSIM & insurance" value="Kept with the trip, but intentionally deferred until booking details are clearer." status="Later" tone="neutral" />
        </div>
      </section>

      <section className="mt-9 rounded-[22px] bg-[#11110f] p-6 text-white md:p-7">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/52">Roam is watching</p>
            <h2 className="mt-2 font-display text-[25px] font-semibold tracking-[-0.03em]">{tracked ? `${tracked.airline} · ${tracked.route}` : "Nothing is being monitored yet."}</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">{tracked ? `Current fare ${IDR.format(tracked.currentFare)} · tracked, not booked.` : "Track an exact flight when you want Roam to keep an eye on it."}</p>
          </div>
          <Link href={`/trips/${trip.id}/flights`} className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-ink">{tracked ? "Open tracked flight" : "Track a flight"} →</Link>
        </div>
      </section>

      <section className="mt-7 grid gap-4 md:grid-cols-2">
        <Link href={`/trips/${trip.id}/itinerary`} className="group rounded-[22px] border border-hair bg-surface p-5 transition hover:border-ink/25">
          <Eyebrow>Plan separately</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">{trip.itineraryDraft ? "Continue itinerary" : "Sketch the itinerary"}</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">Build the day-to-day rhythm without turning Trip Home into another long planning page.</p>
          <span className="mt-5 inline-flex text-[13px] font-semibold text-accent group-hover:text-accent-press">Open itinerary planner →</span>
        </Link>
        <div className="rounded-[22px] border border-hair bg-surface-2 p-5">
          <Eyebrow>Trip brief</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">The why behind the plan</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">Review what Roam is protecting, what is flexible, and the assumptions behind this direction.</p>
          <Link href={`/trips/${trip.id}/brief`} className="mt-5 inline-flex text-[13px] font-semibold text-accent">Review trip brief →</Link>
        </div>
      </section>

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
