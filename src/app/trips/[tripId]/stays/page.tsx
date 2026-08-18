"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTrip } from "@/lib/store";
import { Photo } from "@/components/photo";
import { Button, EmptyState, Eyebrow, PrototypeBadge, SidePanel, buttonClass, useToast } from "@/components/ui";

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type RoomOffer = {
  id: string;
  room: string;
  detail: string;
  rate: string;
  nightly: number;
  roomSubtotal: number;
  fees: number;
  total: number;
  cancellation: string;
  payment: string;
  available: boolean;
  nearestDates?: string[];
  label?: string;
};

const ROOM_OFFERS: RoomOffer[] = [
  {
    id: "deluxe-flex",
    room: "Deluxe King",
    detail: "32 m² · 1 king · city view",
    rate: "Flexible breakfast rate",
    nightly: 3_660_000,
    roomSubtotal: 10_980_000,
    fees: 1_960_000,
    total: 12_940_000,
    cancellation: "Free cancellation until 18 Oct, 18:00 local time",
    payment: "Pay at property",
    available: true,
    label: "Recommended",
  },
  {
    id: "twin-flex",
    room: "Deluxe Twin",
    detail: "34 m² · 2 twins · city view",
    rate: "Flexible breakfast rate",
    nightly: 3_820_000,
    roomSubtotal: 11_460_000,
    fees: 2_040_000,
    total: 13_500_000,
    cancellation: "Free cancellation until 18 Oct, 18:00 local time",
    payment: "Pay at property",
    available: true,
    label: "More space to share",
  },
  {
    id: "king-saver",
    room: "Deluxe King",
    detail: "32 m² · 1 king · city view",
    rate: "Advance purchase",
    nightly: 3_210_000,
    roomSubtotal: 9_630_000,
    fees: 1_790_000,
    total: 11_420_000,
    cancellation: "Non-refundable",
    payment: "Pay now",
    available: true,
    label: "Save Rp 1.52m",
  },
  {
    id: "corner-suite",
    room: "Corner Suite",
    detail: "52 m² · 1 king · lounge area",
    rate: "Flexible breakfast rate",
    nightly: 5_940_000,
    roomSubtotal: 17_820_000,
    fees: 3_080_000,
    total: 20_900_000,
    cancellation: "Free cancellation until 18 Oct, 18:00 local time",
    payment: "Pay at property",
    available: false,
    nearestDates: ["20–23 Oct", "27–30 Oct"],
    label: "Unavailable for these dates",
  },
];

const FALLBACK = {
  id: "fallback-room",
  property: "K5 Tokyo",
  room: "Studio King",
  detail: "Design-led boutique stay · 4 min to station",
  total: 12_480_000,
  cancellation: "Free cancellation until 17 Oct",
};

function roomType(destination: string) {
  const place = destination.toLowerCase();
  if (place.includes("hakone")) return "Ryokan / design hotel";
  if (place.includes("queenstown")) return "Hotel / lodge";
  if (place.includes("perth")) return "Hotel / serviced apartment";
  return "Hotel";
}

export default function StaysPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, store, hydrated } = useTrip(tripId);
  const { toast } = useToast();
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("deluxe-flex");
  const [watchPrimary, setWatchPrimary] = useState(false);
  const [watchFallback, setWatchFallback] = useState(false);

  const watchKey = `roam.tracked-stay-offers.${tripId}`;

  useEffect(() => {
    if (!hydrated) return;
    try {
      const raw = localStorage.getItem(watchKey);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      setWatchPrimary(ids.includes(selectedRoomId) || ids.some((id) => id.startsWith("room:")));
      setWatchFallback(ids.includes(FALLBACK.id));
    } catch {
      /* prototype persistence only */
    }
  }, [hydrated, selectedRoomId, watchKey]);

  const selectedRoom = useMemo(
    () => ROOM_OFFERS.find((room) => room.id === selectedRoomId) ?? ROOM_OFFERS[0],
    [selectedRoomId],
  );

  if (!hydrated || !trip) {
    return <div className="mx-auto h-[60vh] max-w-[980px] rounded-card shimmer" />;
  }

  const selected = trip.destinationProposals.find((proposal) => proposal.id === trip.selectedProposalId);
  if (!selected) {
    return (
      <EmptyState
        title="Choose a trip direction first"
        body="We need the destination and trip context before recommending an exact stay."
        action={<Link href={`/trips/${trip.id}/destinations`} className={buttonClass("ink", "sm")}>See recommendations →</Link>}
      />
    );
  }

  const flightBooked = trip.componentStates.flight === "confirmed";
  const flightTracked = Boolean(trip.trackedFlight) && !flightBooked;
  const stayBooked = trip.componentStates.stay === "confirmed";
  const stayTracked = trip.componentStates.stay === "tracked";

  const persistWatch = (primary: boolean, fallback: boolean) => {
    const ids: string[] = [];
    if (primary) ids.push(`room:${selectedRoom.id}`);
    if (fallback) ids.push(FALLBACK.id);
    try {
      localStorage.setItem(watchKey, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
    store.patchTrip(trip.id, {
      componentStates: {
        ...trip.componentStates,
        stay: ids.length ? "tracked" : "undecided",
      },
    });
  };

  const togglePrimaryWatch = () => {
    const next = !watchPrimary;
    setWatchPrimary(next);
    persistWatch(next, watchFallback);
    toast(next ? `Watching ${selected.stay.name} · ${selectedRoom.room}.` : "Stopped watching this room offer.");
  };

  const toggleFallbackWatch = () => {
    const next = !watchFallback;
    setWatchFallback(next);
    persistWatch(watchPrimary, next);
    toast(next ? "Compatible fallback added to the stay watch." : "Fallback removed from the stay watch.");
  };

  const chooseRoom = (room: RoomOffer) => {
    if (!room.available) return;
    setSelectedRoomId(room.id);
    setRoomsOpen(false);
    setWatchPrimary(false);
    persistWatch(false, watchFallback);
    toast(`${room.room} selected. The exact rate and cancellation terms are updated.`);
  };

  const secureStay = () => {
    store.patchTrip(trip.id, {
      componentStates: { ...trip.componentStates, stay: "confirmed" },
      lifecycle: flightBooked ? "booked" : "partially-booked",
    });
    setWatchPrimary(false);
    try {
      const ids = watchFallback ? [FALLBACK.id] : [];
      localStorage.setItem(watchKey, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
    toast(flightTracked ? "Refundable stay secured while we keep watching your flights." : "Stay secured. Your trip overview is updated.");
  };

  return (
    <div className="mx-auto max-w-[1040px] pb-20">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href={`/trips/${trip.id}/home`} className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back to trip overview</Link>
        <PrototypeBadge />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Eyebrow>Stay recommendation</Eyebrow>
        <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[10.5px] font-semibold text-accent">Exact room + rate</span>
        {stayBooked && <span className="rounded-full bg-[#dfe9df] px-2.5 py-1 text-[10.5px] font-semibold text-[#34523b]">Booked ✓</span>}
        {!stayBooked && stayTracked && <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[10.5px] font-semibold text-accent">Watching price</span>}
      </div>
      <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(38px,6vw,62px)] font-semibold leading-[0.97] tracking-[-0.05em]">The best room and rate for your trip.</h1>
      <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-muted">We compared the relevant property types, then selected the exact hotel, room and cancellation terms that best fit this trip.</p>

      <section className="mt-9 overflow-hidden rounded-[26px] border border-hair bg-surface shadow-[var(--shadow-card)]">
        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[300px] bg-paper-2 lg:min-h-[560px]">
            <Photo image={selected.stay.image} ratio="hero" width={1100} rounded="rounded-none" priority className="absolute inset-0 h-full w-full !aspect-auto object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 pt-16 text-white">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/65">{roomType(selected.destination)}</p>
              <h2 className="mt-1 font-display text-[28px] font-semibold tracking-[-0.035em]">{selected.stay.name}</h2>
              <p className="mt-1 text-[12.5px] text-white/75">{selected.stay.location}</p>
            </div>
          </div>

          <div className="p-5 md:p-7 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-ink px-2.5 py-1 text-[10.5px] font-semibold text-paper">{selectedRoom.label ?? "Selected"}</span>
                <h2 className="mt-4 font-display text-[30px] font-semibold tracking-[-0.035em]">{selectedRoom.room}</h2>
                <p className="mt-1 text-[13px] text-muted">{selectedRoom.detail}</p>
                <p className="mt-2 text-[13px] font-semibold text-ink-soft">{selectedRoom.rate}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-[28px] font-semibold tracking-[-0.035em]">{IDR.format(selectedRoom.total)}</p>
                <p className="mt-1 text-[11.5px] text-faint">total for 3 nights</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-[18px] bg-surface-2 p-4 text-[12.5px] sm:grid-cols-2">
              <div><p className="text-faint">Room subtotal</p><p className="mt-1 font-semibold text-ink-soft">{IDR.format(selectedRoom.roomSubtotal)}</p></div>
              <div><p className="text-faint">Taxes & mandatory fees</p><p className="mt-1 font-semibold text-ink-soft">{IDR.format(selectedRoom.fees)}</p></div>
              <div><p className="text-faint">Cancellation</p><p className="mt-1 font-semibold leading-relaxed text-ink-soft">{selectedRoom.cancellation}</p></div>
              <div><p className="text-faint">Payment</p><p className="mt-1 font-semibold text-ink-soft">{selectedRoom.payment}</p></div>
            </div>

            <div className="mt-6 border-t border-hair pt-5">
              <Eyebrow>Why this exact offer</Eyebrow>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{selected.stay.why} The flexible rate keeps your hotel decision reversible while the rest of the trip is still moving.</p>
            </div>

            {flightTracked && !stayBooked && selectedRoom.cancellation.toLowerCase().includes("free cancellation") && (
              <div className="mt-5 rounded-[16px] border border-accent-line bg-accent-tint/35 p-4">
                <p className="text-[12px] font-semibold text-accent">Safe to secure while flights are still moving</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">Your flight is only being tracked. This room can be secured now without locking you in, as long as the free-cancellation window remains intact.</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {!stayBooked && (
                <Button variant="ink" onClick={secureStay}>{flightTracked && selectedRoom.cancellation.toLowerCase().includes("free cancellation") ? "Secure refundable stay" : "Book this stay"}</Button>
              )}
              <Button variant="ghost" onClick={() => setRoomsOpen(true)}>See other rooms</Button>
              {!stayBooked && <Button variant="ghost" onClick={togglePrimaryWatch}>{watchPrimary ? "Stop watching price" : "Watch this room’s price"}</Button>}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[22px] border border-hair bg-surface p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><Eyebrow>Compatible fallback</Eyebrow><h2 className="mt-2 font-display text-[25px] font-semibold tracking-[-0.03em]">{FALLBACK.property} · {FALLBACK.room}</h2><p className="mt-2 text-[13px] text-muted">{FALLBACK.detail}</p></div>
            <div className="text-right"><p className="font-display text-xl font-semibold">{IDR.format(FALLBACK.total)}</p><p className="text-[11px] text-faint">full-stay total</p></div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hair-2 pt-4">
            <p className="text-[12px] text-muted">{FALLBACK.cancellation}. This stays in the background as a fallback, not a second recommendation you need to compare.</p>
            {!stayBooked && <Button variant="ghost" size="sm" onClick={toggleFallbackWatch}>{watchFallback ? "Fallback watched ✓" : "Watch fallback too"}</Button>}
          </div>
        </div>

        <aside className="rounded-[22px] border border-hair bg-surface-2 p-5 md:p-6">
          <Eyebrow>How we narrowed it</Eyebrow>
          <div className="mt-4 grid gap-3 text-[12.5px] text-muted">
            <div className="flex items-center justify-between gap-3"><span>Hotels & design hotels</span><span className="font-semibold text-ink">Considered</span></div>
            <div className="flex items-center justify-between gap-3"><span>Resorts / ryokans</span><span className="font-semibold text-ink">When they fit</span></div>
            <div className="flex items-center justify-between gap-3"><span>Serviced apartments</span><span className="font-semibold text-ink">Considered</span></div>
            <div className="flex items-center justify-between gap-3"><span>Villas</span><span className="font-semibold text-ink">Ruled out for this trip</span></div>
          </div>
          <p className="mt-4 border-t border-hair-2 pt-4 text-[11.5px] leading-relaxed text-faint">Hotel loyalty is used only as a tie-breaker. We won&apos;t recommend a worse-fit stay just to earn points.</p>
        </aside>
      </section>

      {(watchPrimary || watchFallback) && !stayBooked && (
        <section className="mt-7 rounded-[22px] border border-accent-line bg-accent-tint/25 p-5 md:p-6">
          <Eyebrow>Stay price watch</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">Watching {Number(watchPrimary) + Number(watchFallback)} {Number(watchPrimary) + Number(watchFallback) === 1 ? "offer" : "offers"}.</h2>
          <p className="mt-2 max-w-[64ch] text-[13px] leading-relaxed text-muted">The exact room + rate is the primary watch. The fallback is there only in case availability disappears or the price gap becomes meaningful.</p>
        </section>
      )}

      <SidePanel open={roomsOpen} onClose={() => setRoomsOpen(false)} title={`Other rooms at ${selected.stay.name}`}>
        <p className="text-[13.5px] leading-relaxed text-muted">The best-fit offer stays selected. These alternatives are here when the room itself—not the hotel—is what you want to change.</p>
        <div className="mt-5 grid gap-3">
          {ROOM_OFFERS.map((room) => {
            const active = room.id === selectedRoom.id;
            return (
              <div key={room.id} className={`rounded-[18px] border p-4 ${active ? "border-ink bg-surface" : "border-hair bg-surface-2"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div><p className="font-display text-[18px] font-semibold tracking-[-0.02em]">{room.room}</p><p className="mt-1 text-[11.5px] text-muted">{room.detail}</p><p className="mt-2 text-[12px] font-semibold text-ink-soft">{room.rate}</p></div>
                  <div className="text-right"><p className="font-display text-[17px] font-semibold">{IDR.format(room.total)}</p><p className="text-[10.5px] text-faint">3-night total</p></div>
                </div>
                <div className="mt-3 rounded-[12px] bg-paper-2 px-3 py-2 text-[11.5px] text-muted">{room.available ? `${room.cancellation} · ${room.payment}` : `Unavailable for your dates. Nearest availability: ${room.nearestDates?.join(" or ")}.`}</div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={`text-[10.5px] font-semibold ${room.available ? "text-muted" : "text-amber"}`}>{room.label}</span>
                  {room.available ? <Button variant={active ? "ghost" : "ink"} size="sm" disabled={active} onClick={() => chooseRoom(room)}>{active ? "Selected" : "Choose this room"}</Button> : <button className="text-[11.5px] font-semibold text-accent" onClick={() => toast(`Nearest bookable dates: ${room.nearestDates?.join(" or ")}.`)}>See nearest dates</button>}
                </div>
              </div>
            );
          })}
        </div>
      </SidePanel>
    </div>
  );
}
