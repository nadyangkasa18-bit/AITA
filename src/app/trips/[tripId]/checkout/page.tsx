"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useTrip } from "@/lib/store";
import type { TripAddonId } from "@/lib/types";
import { Button, buttonClass, EmptyState, Eyebrow, PrototypeBadge } from "@/components/ui";
import { PRODUCT } from "@/config/product";

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const ADDONS: Array<{
  id: TripAddonId;
  name: string;
  provider: string;
  description: string;
  price: number;
}> = [
  { id: "entry", name: "Entry requirements check", provider: PRODUCT.ecosystem.entry, description: "A destination-specific checklist for passports, entry forms and visa requirements.", price: 149_000 },
  { id: "esim", name: "7-day travel eSIM", provider: PRODUCT.ecosystem.esim, description: "5 GB of data, ready to install before departure.", price: 249_000 },
  { id: "insurance", name: "Travel protection", provider: "RoaminRabbit Protect", description: "Trip delay, medical and baggage cover for this itinerary.", price: 489_000 },
];

function numericPrice(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export default function CheckoutPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, store, hydrated } = useTrip(tripId);
  const [success, setSuccess] = useState(false);
  const [localAddonIds, setLocalAddonIds] = useState<TripAddonId[] | null>(null);

  if (!hydrated || !trip) return <div className="mx-auto h-[55vh] max-w-[900px] rounded-card shimmer" />;
  const selected = trip.destinationProposals.find((proposal) => proposal.id === trip.selectedProposalId);
  if (!selected) {
    return (
      <EmptyState
        title="There is nothing to book yet"
        body="Start with a recommendation first."
        action={<Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ink", "sm")}>See recommendations →</Link>}
      />
    );
  }

  const addonIds = localAddonIds ?? trip.selectedAddonIds;
  const addonTotal = ADDONS.filter((addon) => addonIds.includes(addon.id)).reduce((sum, addon) => sum + addon.price, 0);
  const coreTotal = numericPrice(selected.indicativePrice);
  const grandTotal = coreTotal + addonTotal;
  const toggleAddon = (id: TripAddonId) => {
    setLocalAddonIds(addonIds.includes(id) ? addonIds.filter((item) => item !== id) : [...addonIds, id]);
  };
  const confirm = () => {
    store.patchTrip(trip.id, { selectedAddonIds: addonIds });
    store.completeBooking(trip.id);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="mx-auto flex min-h-[68vh] max-w-[760px] flex-col items-center justify-center text-center" aria-live="polite">
        <div className="booking-success-mark grid h-16 w-16 place-items-center rounded-full bg-ink text-2xl text-white">✓</div>
        <Eyebrow className="mt-7 text-accent">Booking confirmed</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(38px,7vw,60px)] font-semibold leading-[0.98] tracking-[-0.05em]">Your trip is booked—and already organized.</h1>
        <p className="mt-4 max-w-[54ch] text-[16px] leading-relaxed text-muted">Your flight and stay are confirmed. We&apos;ve added both to your itinerary and prepared the next steps for your trip.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-[#dfe9df] px-3 py-1.5 text-[12px] font-semibold text-[#34523b]">Flights booked ✓</span>
          <span className="rounded-full bg-[#dfe9df] px-3 py-1.5 text-[12px] font-semibold text-[#34523b]">Stay booked ✓</span>
          <span className="rounded-full bg-accent-tint px-3 py-1.5 text-[12px] font-semibold text-accent">Shared itinerary created ✓</span>
        </div>
        {addonIds.length > 0 && <p className="mt-4 text-[12.5px] text-muted">Also added: {ADDONS.filter((addon) => addonIds.includes(addon.id)).map((addon) => addon.name).join(" · ")}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/trips/${trip.id}/itinerary`} className={buttonClass("ink", "md")}>Open shared itinerary →</Link>
          <Link href={`/trips/${trip.id}/travelers`} className={buttonClass("ghost", "md")}>Invite travelers</Link>
        </div>
        <Link href={`/trips/${trip.id}/home`} className="mt-5 text-[12px] font-semibold text-muted hover:text-ink">Go to trip overview</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[980px] pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/trips/${trip.id}/booking-plan`} className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back to recommendation</Link>
        <PrototypeBadge />
      </div>
      <div className="mt-7">
        <Eyebrow>Secure checkout</Eyebrow>
        <h1 className="mt-3 font-display text-[clamp(36px,6vw,56px)] font-semibold leading-[1] tracking-[-0.045em]">Review and book your trip.</h1>
        <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-muted">Everything essential is in one place. Optional services are clearly separated and never added without your choice.</p>
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[1fr_330px] lg:items-start">
        <div className="grid gap-5">
          <section className="overflow-hidden rounded-[24px] border border-hair bg-surface">
            <div className="border-b border-hair-2 p-5 md:p-6"><Eyebrow>Your bookings</Eyebrow></div>
            <div className="grid gap-4 border-b border-hair-2 p-5 sm:grid-cols-[1fr_auto] md:p-6">
              <div><p className="font-display text-[21px] font-semibold tracking-[-0.02em]">{trip.trackedFlight?.airline ?? selected.flight.airline}</p><p className="mt-1 text-[13px] text-muted">{trip.trackedFlight?.route ?? selected.flight.route} · {trip.trackedFlight?.depart ?? selected.flight.depart} · {selected.flight.stops}</p><p className="mt-2 text-[11px] text-faint">Checked moments ago · airline fare · checked bag included</p></div>
              <p className="font-display text-lg font-semibold sm:text-right">{trip.trackedFlight ? IDR.format(trip.trackedFlight.currentFare) : selected.flight.price}</p>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] md:p-6">
              <div><p className="font-display text-[21px] font-semibold tracking-[-0.02em]">{selected.stay.name}</p><p className="mt-1 text-[13px] text-muted">{selected.stay.location} · {selected.recommendedWindow}</p><p className="mt-2 text-[11px] text-faint">Free cancellation until 7 days before arrival · taxes included</p></div>
              <p className="font-display text-lg font-semibold sm:text-right">{selected.stay.price}</p>
            </div>
          </section>

          <section className="rounded-[24px] border border-hair bg-surface p-5 md:p-6">
            <Eyebrow>Traveler details</Eyebrow>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[16px] bg-surface-2 p-4">
              <div><p className="text-[13.5px] font-semibold text-ink">Nadya · lead traveler</p><p className="mt-1 text-[12px] text-muted">{trip.travelers} traveler{trip.travelers === 1 ? "" : "s"} · details saved for this booking</p></div>
              <button type="button" className="text-[12px] font-semibold text-accent">Edit details</button>
            </div>
          </section>

          <section className="rounded-[24px] border border-hair bg-surface p-5 md:p-6">
            <div><Eyebrow>Optional for this trip</Eyebrow><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">Anticipate the next needs</h2><p className="mt-2 text-[13.5px] leading-relaxed text-muted">Choose only what helps. You can add these later from the itinerary.</p></div>
            <div className="mt-5 divide-y divide-hair-2">
              {ADDONS.map((addon) => {
                const active = addonIds.includes(addon.id);
                return (
                  <button key={addon.id} type="button" onClick={() => toggleAddon(addon.id)} aria-pressed={active} className="grid w-full gap-3 py-4 text-left sm:grid-cols-[auto_1fr_auto] sm:items-start">
                    <span className={`mt-0.5 grid h-5 w-5 place-items-center rounded-md border text-[11px] ${active ? "border-accent bg-accent text-white" : "border-hair bg-white text-transparent"}`}>✓</span>
                    <span><span className="block text-[13.5px] font-semibold text-ink">{addon.name} <span className="font-normal text-faint">by {addon.provider}</span></span><span className="mt-1 block text-[12px] leading-relaxed text-muted">{addon.description}</span></span>
                    <span className="text-[12.5px] font-semibold text-ink-soft">+{IDR.format(addon.price)}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="rounded-[24px] border border-hair bg-surface p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
          <Eyebrow>Payment summary</Eyebrow>
          <div className="mt-5 grid gap-3 text-[13px]">
            <div className="flex justify-between gap-4"><span className="text-muted">Flight + stay</span><span className="font-semibold text-ink-soft">{selected.indicativePrice.replace("before activities", "")}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted">Optional services</span><span className="font-semibold text-ink-soft">{IDR.format(addonTotal)}</span></div>
            <div className="flex justify-between gap-4 border-t border-hair pt-4"><span className="font-semibold text-ink">Total</span><span className="font-display text-[23px] font-semibold text-ink">{grandTotal ? IDR.format(grandTotal) : selected.indicativePrice}</span></div>
          </div>
          <div className="mt-5 rounded-[16px] bg-surface-2 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Payment method</p><div className="mt-2 flex items-center justify-between gap-3"><p className="text-[13px] font-semibold text-ink-soft">Visa ending in 4242</p><button type="button" className="text-[11.5px] font-semibold text-accent">Change</button></div></div>
          <p className="mt-4 text-[11.5px] leading-relaxed text-faint">By completing this demo booking, you agree to the airline fare rules and hotel cancellation terms shown above. No real charge will be made.</p>
          <Button variant="ink" className="mt-5 w-full" onClick={confirm}>Complete demo booking</Button>
          <p className="mt-3 text-center text-[11px] font-semibold text-amber">Demo mode · no payment is processed</p>
        </aside>
      </div>
    </div>
  );
}
