"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrip } from "@/lib/store";
import { Button, buttonClass, EmptyState, Eyebrow, PrototypeBadge } from "@/components/ui";

export default function CheckoutPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, store, hydrated } = useTrip(tripId);
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (!hydrated || !trip) return <div className="mx-auto h-[55vh] max-w-[760px] rounded-card shimmer" />;
  const selected = trip.destinationProposals.find((p) => p.id === trip.selectedProposalId);
  if (!selected) {
    return <EmptyState title="There is nothing to confirm yet" body="Start with a trip direction first." action={<Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ink", "sm")}>See recommendation →</Link>} />;
  }

  const confirm = () => {
    store.completeBooking(trip.id);
    setSuccess(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => router.replace(`/trips/${trip.id}/home`), reduced ? 350 : 2400);
  };

  if (success) {
    return (
      <div className="mx-auto flex min-h-[62vh] max-w-[680px] flex-col items-center justify-center text-center" aria-live="polite">
        <div className="booking-success-mark grid h-16 w-16 place-items-center rounded-full bg-ink text-2xl text-white">✓</div>
        <Eyebrow className="mt-7 text-accent">Everything confirmed</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(38px,7vw,62px)] font-semibold leading-[0.98] tracking-[-0.05em]">{selected.destination} is yours.</h1>
        <p className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-muted">Your same Trip Home is becoming the booked version now. There&apos;s no separate receipt dead-end.</p>
        <button onClick={() => router.replace(`/trips/${trip.id}/home`)} className="mt-7 text-[14px] font-semibold text-accent">Go to Trip Home now →</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <Link href={`/trips/${trip.id}/home`} className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back to Trip Home</Link>
      <div className="mt-8 flex flex-wrap items-center gap-3"><Eyebrow>Confirm your trip</Eyebrow><PrototypeBadge /></div>
      <h1 className="mt-3 font-display text-[clamp(36px,6vw,56px)] font-semibold leading-[1] tracking-[-0.045em]">One coordinated confirmation.</h1>
      <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-muted">Review the whole {selected.destination} version in one place. This interaction is mocked: no card details are requested and no money is taken.</p>

      <div className="mt-9 divide-y divide-hair border-y border-hair">
        <div className="grid grid-cols-[1fr_auto] gap-5 py-5"><div><p className="font-display text-xl font-semibold tracking-[-0.02em]">{selected.stay.name}</p><p className="mt-1 text-[13px] text-muted">{selected.stay.location} · {selected.recommendedWindow}</p></div><p className="font-display text-lg font-semibold">{selected.stay.price}</p></div>
        <div className="grid grid-cols-[1fr_auto] gap-5 py-5"><div><p className="font-display text-xl font-semibold tracking-[-0.02em]">{trip.trackedFlight?.airline ?? selected.flight.airline}</p><p className="mt-1 text-[13px] text-muted">{trip.trackedFlight?.route ?? selected.flight.route} · {trip.trackedFlight?.depart ?? selected.flight.depart}</p></div><p className="font-display text-lg font-semibold">{trip.trackedFlight ? `Rp ${trip.trackedFlight.currentFare.toLocaleString("id-ID")}` : selected.flight.price}</p></div>
        <div className="grid grid-cols-[1fr_auto] gap-5 py-5"><div><p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-faint">Indicative trip total</p><p className="mt-1 text-[12.5px] text-muted">For {trip.travelers} travelers · prototype estimate</p></div><p className="font-display text-2xl font-semibold">{selected.indicativePrice}</p></div>
      </div>

      <div className="mt-7 rounded-[18px] border border-accent-line bg-accent-tint/45 p-4 text-[13.5px] leading-relaxed text-ink-soft">By continuing, you&apos;ll simulate a successful coordinated booking. Roam will update this existing Trip Home from planning to booked after a brief success moment.</div>
      <Button variant="ink" className="mt-7 w-full" onClick={confirm}>Confirm prototype booking</Button>
    </div>
  );
}
