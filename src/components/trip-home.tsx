"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTrip } from "@/lib/store";
import { Photo } from "@/components/photo";
import { EmptyState, Eyebrow, PrototypeBadge, buttonClass } from "@/components/ui";

const IDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

type Tone = "neutral" | "watch" | "done";
function StatusPill({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const cls = tone === "done" ? "bg-[#dfe9df] text-[#34523b]" : tone === "watch" ? "bg-accent-tint text-accent" : "bg-paper-2 text-muted";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

function BookingCard({ label, title, detail, status, tone, href, action }: { label: string; title: string; detail: string; status: string; tone?: Tone; href: string; action: string }) {
  return (
    <Link href={href} className="group rounded-[22px] border border-hair bg-surface p-5 transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3"><Eyebrow>{label}</Eyebrow><StatusPill label={status} tone={tone} /></div>
      <h3 className="mt-4 font-display text-[22px] font-semibold tracking-[-0.03em]">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{detail}</p>
      <span className="mt-5 inline-flex text-[12.5px] font-semibold text-accent group-hover:text-accent-press">{action} →</span>
    </Link>
  );
}

export function TripHome({ tripId }: { tripId: string }) {
  const { trip, hydrated } = useTrip(tripId);
  const [trackedCount, setTrackedCount] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const raw = localStorage.getItem(`roam.tracked-flight-ids.${tripId}`);
      const ids = raw ? JSON.parse(raw) as string[] : [];
      setTrackedCount(ids.length);
    } catch {
      setTrackedCount(trip?.trackedFlight ? 1 : 0);
    }
  }, [hydrated, tripId, trip?.trackedFlight?.id]);

  if (!hydrated || !trip) return <div className="grid gap-5"><div className="h-[320px] rounded-card shimmer" /><div className="h-40 rounded-card shimmer" /></div>;
  const selected = trip.destinationProposals.find((proposal) => proposal.id === trip.selectedProposalId);
  if (!selected) return <EmptyState title="Choose a trip direction first" body="Trip Home appears the moment you start with a recommendation." action={<Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ink", "sm")}>See recommendations →</Link>} />;

  const tracked = trip.trackedFlight;
  const watchingCount = Math.max(trackedCount, tracked ? 1 : 0);
  const flightBooked = trip.componentStates.flight === "confirmed";
  const stayBooked = trip.componentStates.stay === "confirmed";
  const stayTracked = trip.componentStates.stay === "tracked";
  const essentialCount = Number(flightBooked) + Number(stayBooked);
  const isBooked = essentialCount === 2;
  const needsFareReview = Boolean(tracked?.priceDropped && !flightBooked);
  const watchLabel = watchingCount > 1 ? `${watchingCount} flights tracking` : "Flight tracking";

  const primary = isBooked
    ? { eyebrow: "Your essentials are secured", title: "Flights and stay are booked.", body: "Nothing else is required to make this a real trip. Add the day-to-day plan only when it helps.", href: `/trips/${trip.id}/itinerary`, label: "Plan the days" }
    : needsFareReview
      ? { eyebrow: "Worth a look", title: "A watched flight changed price.", body: `One fare is now ${IDR.format(tracked!.currentFare)}. Your hotel and other plans stay untouched while you decide.`, href: `/trips/${trip.id}/flights`, label: "Open price watch" }
      : { eyebrow: "Next decision", title: flightBooked ? "Flight booked. Your stay is still undecided." : stayBooked ? "Stay booked. Your flight is still undecided." : stayTracked ? "Your stay is being watched. The flight is still open." : "Your core bookings are ready to review.", body: stayTracked ? "Roam is watching the exact room + rate you chose without treating it as booked. You can secure it when the cancellation terms and flight timing line up." : "Roam treats flights and stay as the essentials for this trip. Transfers, activities and add-ons remain optional unless you ask for them.", href: stayTracked ? `/trips/${trip.id}/stays` : `/trips/${trip.id}/checkout`, label: stayTracked ? "Review stay watch" : "Review booking plan" };

  return (
    <div className="mx-auto max-w-[1080px]">
      <section className="relative overflow-hidden rounded-[26px] bg-ink text-white">
        <Photo image={selected.heroImage} ratio="hero" tone={selected.heroTone} width={1600} rounded="rounded-none" priority className="h-[300px] w-full !aspect-auto opacity-70 md:h-[340px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,.86)] via-[rgba(8,8,8,.18)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusPill label={flightBooked ? "Flights booked" : watchingCount ? watchLabel : "Flights not booked"} tone={flightBooked ? "done" : watchingCount ? "watch" : "neutral"} />
            <StatusPill label={stayBooked ? "Stay booked" : stayTracked ? "Stay price watch" : "Stay not booked"} tone={stayBooked ? "done" : stayTracked ? "watch" : "neutral"} />
          </div>
          <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/65">{selected.destination} · {trip.lifecycle.replace("-", " ")}</p><h1 className="mt-2 font-display text-[clamp(34px,5vw,54px)] font-semibold leading-[0.98] tracking-[-0.045em]">{trip.name}</h1><p className="mt-3 max-w-[55ch] text-[14.5px] leading-relaxed text-white/72">{selected.thesis}</p></div><Link href={`/trips/${trip.id}/destinations/${selected.id}`} className="rounded-full border border-white/25 bg-black/15 px-4 py-2 text-[12.5px] font-semibold text-white backdrop-blur transition hover:border-white/60">Revisit choice</Link></div>
        </div>
      </section>

      <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-hair bg-surface-2 px-4 py-3.5">
        <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[12px] font-semibold text-paper">{essentialCount}/2</span><div><p className="text-[12.5px] font-semibold text-ink-soft">Core bookings secured</p><p className="text-[11.5px] text-faint">For this trip: flight + stay. Price watches don&apos;t count as bookings.</p></div></div>
        <div className="flex flex-wrap gap-2"><span className="rounded-full border border-hair bg-surface px-3 py-1.5 text-[11.5px] text-muted">{selected.recommendedWindow}</span><span className="rounded-full border border-hair bg-surface px-3 py-1.5 text-[11.5px] text-muted">{trip.travelers} travelers</span></div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="rounded-[24px] border border-hair bg-surface p-6 md:p-7"><Eyebrow>{primary.eyebrow}</Eyebrow><h2 className="mt-2 max-w-[18ch] font-display text-[clamp(27px,4vw,40px)] font-semibold leading-[1.02] tracking-[-0.035em]">{primary.title}</h2><p className="mt-3 max-w-[60ch] text-[14.5px] leading-relaxed text-muted">{primary.body}</p><Link href={primary.href} className={`${buttonClass("ink", "md")} mt-5`}>{primary.label} →</Link></div>
        <aside className="rounded-[22px] border border-hair bg-[#20201d] p-5 text-white"><p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/50">Price watch</p><h3 className="mt-2 font-display text-[20px] font-semibold tracking-[-0.025em]">{watchingCount > 1 ? `${watchingCount} flights being watched` : tracked ? `${tracked.airline} · ${tracked.route}` : stayTracked ? "Stay offer being watched" : "Nothing right now"}</h3><p className="mt-2 text-[12.5px] leading-relaxed text-white/62">{watchingCount > 1 ? "Compare their price history together before you decide which one to book." : tracked ? `${IDR.format(tracked.currentFare)} · tracking only, not booked.` : stayTracked ? "Roam is watching the exact room + rate and its compatible fallback." : "Track fares only when you want Roam to watch them."}</p><Link href={tracked || watchingCount ? `/trips/${trip.id}/flights` : stayTracked ? `/trips/${trip.id}/stays` : `/trips/${trip.id}/flights`} className="mt-4 inline-flex text-[12px] font-semibold text-white/85">{watchingCount ? "Open flight price watch" : stayTracked ? "Open stay price watch" : "Track a flight"} →</Link></aside>
      </section>

      <section className="mt-9"><div><Eyebrow>Core bookings</Eyebrow><h2 className="mt-1 font-display text-3xl font-semibold tracking-[-0.035em]">What this trip actually has</h2></div><div className="mt-5 grid gap-4 md:grid-cols-2">
        <BookingCard label="Flights" title={watchingCount > 1 ? `${watchingCount} flights on price watch` : tracked ? `${tracked.airline} · ${tracked.route}` : `${selected.flight.airline} · ${selected.flight.route}`} detail={watchingCount > 1 ? "Compare watched fares and their price history before booking." : tracked ? `${IDR.format(tracked.currentFare)} · ${tracked.depart}` : `${selected.flight.depart} · ${selected.flight.duration}`} status={flightBooked ? "Booked" : watchingCount ? "Tracking" : "Not booked"} tone={flightBooked ? "done" : watchingCount ? "watch" : "neutral"} href={`/trips/${trip.id}/flights`} action={flightBooked ? "View booking" : watchingCount > 1 ? "Compare watched flights" : "Review flights"} />
        <BookingCard label="Stay" title={selected.stay.name} detail={stayTracked ? "Exact room + rate is on price watch." : `${selected.stay.location} · ${selected.stay.price}`} status={stayBooked ? "Booked" : stayTracked ? "Price watch" : "Not booked"} tone={stayBooked ? "done" : stayTracked ? "watch" : "neutral"} href={`/trips/${trip.id}/stays`} action={stayBooked ? "View booking" : stayTracked ? "Open stay watch" : "Review exact room + rate"} />
      </div></section>

      <section className="mt-8 grid gap-4 md:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-[22px] border border-hair bg-surface p-5"><Eyebrow>Plan when useful</Eyebrow><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">{trip.itineraryDraft ? "Continue your itinerary" : "Sketch the days"}</h2><p className="mt-2 max-w-[60ch] text-[13.5px] leading-relaxed text-muted">Activities don&apos;t count toward “trip completion.” They&apos;re here only when planning them removes work.</p><Link href={`/trips/${trip.id}/itinerary`} className="mt-5 inline-flex text-[13px] font-semibold text-accent">Open itinerary planner →</Link></div>
        <div className="rounded-[22px] border border-hair bg-surface-2 p-5"><Eyebrow>Other trip needs</Eyebrow><div className="mt-4 grid gap-3 text-[12.5px]"><div className="flex justify-between"><span>Airport transfer</span><StatusPill label="Optional" /></div><div className="flex justify-between"><span>Entry & visa</span><StatusPill label="Not checked" /></div><div className="flex justify-between"><span>eSIM & insurance</span><StatusPill label="Optional" /></div></div></div>
      </section>

      <div className="mt-8 flex items-center justify-between border-t border-hair pt-5"><Link href={`/trips/${trip.id}/brief`} className="text-[12.5px] font-semibold text-muted hover:text-ink">Review trip brief</Link><PrototypeBadge /></div>
    </div>
  );
}
