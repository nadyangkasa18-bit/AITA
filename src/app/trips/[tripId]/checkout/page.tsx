"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTrip } from "@/lib/store";
import { Button, buttonClass, EmptyState, Eyebrow, PrototypeBadge } from "@/components/ui";

export default function CheckoutPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const searchParams = useSearchParams();
  const { trip, store, hydrated } = useTrip(tripId);
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const scope = searchParams.get("scope");
  const directPlan = searchParams.get("mode") === "plan";
  const flightOnly = scope === "flight";

  if (!hydrated || !trip) return <div className="mx-auto h-[55vh] max-w-[760px] rounded-card shimmer" />;
  const selected = trip.destinationProposals.find((p) => p.id === trip.selectedProposalId);
  if (!selected) {
    return <EmptyState title="There is nothing to confirm yet" body="Start with a trip direction first." action={<Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ink", "sm")}>See recommendation →</Link>} />;
  }

  const confirm = () => {
    if (flightOnly) store.confirmTripComponent(trip.id, "flight");
    else store.completeBooking(trip.id);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="mx-auto flex min-h-[62vh] max-w-[700px] flex-col items-center justify-center text-center" aria-live="polite">
        <div className="booking-success-mark grid h-16 w-16 place-items-center rounded-full bg-ink text-2xl text-white">✓</div>
        <Eyebrow className="mt-7 text-accent">{flightOnly ? "Flight confirmed" : "Booking confirmed"}</Eyebrow>
        <h1 className="mt-3 max-w-[12ch] font-display text-[clamp(38px,7vw,60px)] font-semibold leading-[0.98] tracking-[-0.05em]">
          {flightOnly ? "Your flight is booked." : "Your flight and hotel are booked."}
        </h1>
        <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-muted">
          {flightOnly
            ? `${selected.flight.route} is confirmed. The rest of ${trip.name} stays exactly as it was — you can book the stay now or leave it for later.`
            : `${selected.destination} now has its two core bookings confirmed. Trip Home will show exactly what is booked and what is still optional.`}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {flightOnly && trip.componentStates.stay !== "confirmed" && (
            <Link href={`/trips/${trip.id}/stays`} className={buttonClass("ink", "sm")}>Continue to stay →</Link>
          )}
          <button onClick={() => router.replace(`/trips/${trip.id}/home`)} className={buttonClass(flightOnly ? "ghost" : "ink", "sm")}>Go to Trip Home →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <Link href={`/trips/${trip.id}/home`} className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back to Trip Home</Link>
      <div className="mt-8 flex flex-wrap items-center gap-3"><Eyebrow>{flightOnly ? "Book this flight" : directPlan ? "Your booking plan" : "Confirm your trip"}</Eyebrow><PrototypeBadge /></div>
      <h1 className="mt-3 font-display text-[clamp(36px,6vw,56px)] font-semibold leading-[1] tracking-[-0.045em]">
        {flightOnly ? "Confirm the flight — nothing else." : directPlan ? `${selected.destination}, already narrowed down.` : "One coordinated confirmation."}
      </h1>
      <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-muted">
        {flightOnly
          ? "This only confirms the flight. Your hotel, transfer and everything else remain separate decisions."
          : directPlan
            ? "You already gave Roam the destination, trip length and what you need to book, so there’s no inspiration step. Review the coordinated flight and hotel plan directly."
            : `Review the flight and stay together before anything is confirmed. This interaction is mocked: no card details are requested and no money is taken.`}
      </p>

      <div className="mt-9 divide-y divide-hair border-y border-hair">
        {!flightOnly && (
          <div className="grid grid-cols-[1fr_auto] gap-5 py-5">
            <div>
              <div className="mb-1 flex items-center gap-2"><p className="font-display text-xl font-semibold tracking-[-0.02em]">{selected.stay.name}</p><span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-semibold text-muted">Hotel</span></div>
              <p className="mt-1 text-[13px] text-muted">{selected.stay.location} · {selected.recommendedWindow}</p>
            </div>
            <p className="font-display text-lg font-semibold">{selected.stay.price}</p>
          </div>
        )}
        <div className="grid grid-cols-[1fr_auto] gap-5 py-5">
          <div>
            <div className="mb-1 flex items-center gap-2"><p className="font-display text-xl font-semibold tracking-[-0.02em]">{trip.trackedFlight?.airline ?? selected.flight.airline}</p><span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-semibold text-muted">Flight</span></div>
            <p className="mt-1 text-[13px] text-muted">{trip.trackedFlight?.route ?? selected.flight.route} · {trip.trackedFlight?.depart ?? selected.flight.depart}</p>
          </div>
          <p className="font-display text-lg font-semibold">{trip.trackedFlight ? `Rp ${trip.trackedFlight.currentFare.toLocaleString("id-ID")}` : selected.flight.price}</p>
        </div>
        {!flightOnly && (
          <div className="grid grid-cols-[1fr_auto] gap-5 py-5">
            <div><p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-faint">Indicative trip total</p><p className="mt-1 text-[12.5px] text-muted">For {trip.travelers} travelers · prototype estimate</p></div>
            <p className="font-display text-2xl font-semibold">{selected.indicativePrice}</p>
          </div>
        )}
      </div>

      <div className="mt-7 rounded-[18px] border border-accent-line bg-accent-tint/45 p-4 text-[13.5px] leading-relaxed text-ink-soft">
        {flightOnly
          ? "Only Flights will move to Booked. Trip Home will keep the stay and other categories visibly separate."
          : "By continuing, you’ll simulate a successful coordinated booking. Trip Home will update the booking states without treating optional categories as incomplete."}
      </div>
      <Button variant="ink" className="mt-7 w-full" onClick={confirm}>{flightOnly ? "Confirm flight booking" : "Confirm flight + hotel"}</Button>
    </div>
  );
}
