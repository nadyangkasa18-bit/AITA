"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrip } from "@/lib/store";
import { Button, buttonClass, EmptyState, Eyebrow, PrototypeBadge } from "@/components/ui";

export default function CheckoutPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, store, hydrated } = useTrip(tripId);
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  if (!hydrated || !trip) return <div className="mx-auto h-[55vh] max-w-[760px] rounded-card shimmer" />;
  const selected = trip.destinationProposals.find((p) => p.id === trip.selectedProposalId);
  if (!selected) return <EmptyState title="There is nothing to confirm yet" body="Start with a trip direction first." action={<Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ink", "sm")}>See recommendation →</Link>} />;

  const confirm = () => {
    store.completeBooking(trip.id);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="mx-auto flex min-h-[62vh] max-w-[720px] flex-col items-center justify-center text-center" aria-live="polite">
        <div className="booking-success-mark grid h-16 w-16 place-items-center rounded-full bg-ink text-2xl text-white">✓</div>
        <Eyebrow className="mt-7 text-accent">Booking confirmed</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(38px,7vw,60px)] font-semibold leading-[0.98] tracking-[-0.05em]">Your flight and stay are secured.</h1>
        <p className="mt-4 max-w-[50ch] text-[16px] leading-relaxed text-muted">That&apos;s the core of this trip booked. Transfers, activities, entry checks and add-ons are still optional — Roam won&apos;t pretend the trip is “100% complete” just because there are more things it could sell you.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2"><span className="rounded-full bg-[#dfe9df] px-3 py-1.5 text-[12px] font-semibold text-[#34523b]">Flights booked ✓</span><span className="rounded-full bg-[#dfe9df] px-3 py-1.5 text-[12px] font-semibold text-[#34523b]">Stay booked ✓</span><span className="rounded-full bg-paper-2 px-3 py-1.5 text-[12px] font-semibold text-muted">Everything else optional</span></div>
        <Button variant="ink" className="mt-8" onClick={() => router.replace(`/trips/${trip.id}/home`)}>See updated Trip Home →</Button>
        <p className="mt-3 text-[11.5px] text-faint">Trip Home will keep these booking states visible at a glance.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <Link href={`/trips/${trip.id}/home`} className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back to Trip Home</Link>
      <div className="mt-8 flex flex-wrap items-center gap-3"><Eyebrow>Confirm your core bookings</Eyebrow><PrototypeBadge /></div>
      <h1 className="mt-3 font-display text-[clamp(36px,6vw,56px)] font-semibold leading-[1] tracking-[-0.045em]">Flight + stay, one clear approval.</h1>
      <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-muted">Review the two pieces you actually need to secure. This prototype doesn&apos;t treat optional services as requirements for a “complete” trip.</p>

      <div className="mt-9 divide-y divide-hair border-y border-hair">
        <div className="grid grid-cols-[1fr_auto] gap-5 py-5"><div><p className="font-display text-xl font-semibold tracking-[-0.02em]">{selected.stay.name}</p><p className="mt-1 text-[13px] text-muted">{selected.stay.location} · {selected.recommendedWindow}</p></div><p className="font-display text-lg font-semibold">{selected.stay.price}</p></div>
        <div className="grid grid-cols-[1fr_auto] gap-5 py-5"><div><p className="font-display text-xl font-semibold tracking-[-0.02em]">{trip.trackedFlight?.airline ?? selected.flight.airline}</p><p className="mt-1 text-[13px] text-muted">{trip.trackedFlight?.route ?? selected.flight.route} · {trip.trackedFlight?.depart ?? selected.flight.depart}</p></div><p className="font-display text-lg font-semibold">{trip.trackedFlight ? `Rp ${trip.trackedFlight.currentFare.toLocaleString("id-ID")}` : selected.flight.price}</p></div>
        <div className="grid grid-cols-[1fr_auto] gap-5 py-5"><div><p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-faint">Indicative core total</p><p className="mt-1 text-[12.5px] text-muted">For {trip.travelers} travelers · prototype estimate</p></div><p className="font-display text-2xl font-semibold">{selected.indicativePrice}</p></div>
      </div>

      <div className="mt-7 rounded-[18px] border border-accent-line bg-accent-tint/45 p-4 text-[13.5px] leading-relaxed text-ink-soft">By continuing, you&apos;ll simulate successful booking of the flight and stay. Nothing else is automatically added or marked complete.</div>
      <Button variant="ink" className="mt-7 w-full" onClick={confirm}>Confirm prototype booking</Button>
    </div>
  );
}
