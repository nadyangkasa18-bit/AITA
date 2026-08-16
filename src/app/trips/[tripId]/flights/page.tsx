"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button, buttonClass, Eyebrow, PrototypeBadge, SidePanel, useToast } from "@/components/ui";
import { CONTRA_FLIGHTS, LEARN_REASONS } from "@/lib/calibration";
import type { PrefScope } from "@/lib/types";

type Flight = (typeof CONTRA_FLIGHTS)[keyof typeof CONTRA_FLIGHTS];

function FlightCard({ flight, selected, onSelect }: { flight: Flight; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-card border bg-surface p-5 text-left transition-all duration-200 ${selected ? "border-accent ring-2 ring-accent" : "border-hair hover:-translate-y-0.5 hover:border-ink"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div><div className="font-display text-xl tracking-[-0.02em]">{flight.airline}</div><div className="text-[13px] text-muted">{flight.route}</div></div>
        <span className="font-display text-lg tracking-[-0.02em]">{flight.price}</span>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <div className="text-center"><div className="font-display text-lg leading-none">{flight.depart}</div><div className="mt-1 text-[10.5px] uppercase tracking-wide text-faint">Dep</div></div>
        <div className="flex-1"><div className="relative h-px bg-hair"><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-surface px-2 text-[10.5px] text-muted">{flight.duration} · {flight.stops}</span></div></div>
        <div className="text-center"><div className="font-display text-lg leading-none">{flight.arrive}</div><div className="mt-1 text-[10.5px] uppercase tracking-wide text-faint">Arr</div></div>
      </div>
      <p className={`mt-4 text-[12.5px] ${flight.aligns ? "text-accent" : "text-amber"}`}>{flight.label}</p>
    </button>
  );
}

const SCOPES: { key: PrefScope; label: string }[] = [
  { key: "all", label: "All trips" },
  { key: "similar", label: "Trips like this" },
  { key: "this-trip", label: "This trip only" },
];

export default function FlightsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const store = useStore();
  const { toast } = useToast();
  const [chosen, setChosen] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [remember, setRemember] = useState(false);
  const [scope, setScope] = useState<PrefScope>("this-trip");
  const trip = store.trips[tripId];
  const tracked = trip?.trackedFlight;
  const flightBooked = trip?.componentStates.flight === "confirmed";

  const direct = CONTRA_FLIGHTS.direct;
  const oneStop = CONTRA_FLIGHTS.oneStopAna;

  const toggleReason = (reason: string) => setReasons((current) => current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]);

  const pick = (flight: Flight) => {
    setChosen(flight.id);
    if (flight.aligns) toast("Good — that matches your profile.");
    else setSheetOpen(true);
  };

  const track = (flight: Flight) => {
    const fare = flight.id === "sq-direct" ? 12_800_000 : 10_400_000;
    store.trackFlight(tripId, {
      id: flight.id,
      airline: flight.airline,
      route: flight.route,
      depart: flight.depart,
      arrive: flight.arrive,
      duration: flight.duration,
      stops: flight.stops,
      originalFare: fare,
      currentFare: fare,
    });
    toast("Tracking this exact flight — nothing has been booked.");
  };

  const done = () => {
    if (remember) {
      const picked = [...reasons];
      if (custom.trim()) picked.push(custom.trim());
      const usesMiles = reasons.includes("Using ANA miles or status");
      store.addPref({
        category: usesMiles ? "Loyalty" : "Flights",
        statement: usesMiles ? "Open to a one-stop ANA flight when using miles or status." : `Open to a one-stop flight when it wins on ${(picked[0] ?? "value").toLowerCase()}.`,
        priority: "usually",
        scope,
        source: "confirmed",
        confidence: 0.7,
      });
      toast("Saved — you can edit or remove it in your profile.");
    } else {
      toast("Noted for this trip — nothing saved to your profile.");
    }
    setSheetOpen(false);
    setReasons([]);
    setCustom("");
    setRemember(false);
    setScope("this-trip");
  };

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-6"><Link href={`/trips/${tripId}/home`} className="text-[13px] font-medium text-muted transition hover:text-ink">← Back to Trip Home</Link></div>

      <div className="mb-2 flex items-center gap-3"><Eyebrow>Flights</Eyebrow><PrototypeBadge />{flightBooked && <span className="rounded-full bg-[#dcebdc] px-2.5 py-1 text-[11px] font-semibold text-[#24522c]">✓ Flight booked</span>}</div>
      <h1 className="font-display text-[clamp(28px,5vw,42px)] tracking-[-0.035em]">{flightBooked ? "Your flight is already handled" : "Two ways to fly"}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">
        {flightBooked ? "You can still review the prototype options here, but Trip Home now treats the flight as confirmed rather than resetting the whole trip." : "Your profile usually leans toward direct flights. Pick whichever actually works for this trip — if you go against the grain, I’ll just ask why, and only remember it if you want me to."}
      </p>

      <div className="mt-7 grid gap-4"><FlightCard flight={direct} selected={chosen === direct.id} onSelect={() => pick(direct)} /><FlightCard flight={oneStop} selected={chosen === oneStop.id} onSelect={() => pick(oneStop)} /></div>

      {chosen && !tracked && !flightBooked && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-hair bg-surface-2 p-4">
          <div><p className="text-[14px] font-semibold text-ink">Keep this option without committing</p><p className="mt-0.5 text-[12.5px] text-muted">Tracking is free in this prototype and never books the flight.</p></div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => track(chosen === direct.id ? direct : oneStop)}>Track price</Button>
            <Link href={`/trips/${tripId}/checkout?scope=flight`} className={buttonClass("ink", "sm")}>Book flight</Link>
          </div>
        </div>
      )}

      {tracked && (
        <div className="mt-6 overflow-hidden rounded-[20px] border border-accent-line bg-accent-tint/45">
          <div className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${flightBooked ? "bg-[#dcebdc] text-[#24522c]" : "bg-accent text-white"}`}>{flightBooked ? "Booked" : "Tracked — not booked"}</span>
                {tracked.priceDropped && !flightBooked && <span className="rounded-full bg-[#dcefdc] px-2.5 py-1 text-[11px] font-semibold text-[#27522d]">Down Rp 900.000</span>}
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.025em]">{tracked.airline} · {tracked.route}</h2>
              <p className="mt-1 text-[13.5px] text-muted">{tracked.depart} → {tracked.arrive} · {tracked.duration} · {tracked.stops}</p>
            </div>
            <div className="text-right"><p className="font-display text-2xl font-semibold tracking-[-0.025em]">Rp {tracked.currentFare.toLocaleString("id-ID")}</p>{tracked.priceDropped && <p className="text-[12px] text-muted line-through">Rp {tracked.originalFare.toLocaleString("id-ID")}</p>}<p className="mt-1 text-[11.5px] text-faint">Last checked {new Date(tracked.lastCheckedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p></div>
          </div>
          {!flightBooked && (
            <div className="flex flex-wrap items-center gap-2 border-t border-accent-line px-5 py-4">
              {!tracked.priceDropped && <Button variant="ghost" size="sm" onClick={() => store.simulateTrackedFareDrop(tripId)}>Simulate price drop</Button>}
              <Link href={`/trips/${tripId}/checkout?scope=flight`} className={buttonClass("ink", "sm")}>Book this flight</Link>
              <button onClick={() => { store.stopTrackingFlight(tripId); toast("Stopped tracking. The flight remains available to book."); }} className="ml-auto text-[13px] font-semibold text-muted transition hover:text-ink">Stop tracking</button>
            </div>
          )}
        </div>
      )}

      <SidePanel open={sheetOpen} onClose={() => setSheetOpen(false)} title="What made this one work better?">
        <p className="text-[14.5px] leading-relaxed text-muted">You usually prefer direct — no problem at all. If it&apos;s useful, tell me what tipped it, so I can be smarter next time.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {LEARN_REASONS.map((reason) => {
            const on = reasons.includes(reason);
            return <button key={reason} onClick={() => toggleReason(reason)} aria-pressed={on} className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${on ? "border-accent bg-accent text-[#f3f6f1]" : "border-hair text-ink-soft hover:border-ink"}`}>{reason}</button>;
          })}
        </div>
        <input value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Something else…" className="mt-3 w-full rounded-full border border-hair bg-surface px-4 py-2.5 text-[14px] outline-none focus-visible:border-accent" />
        <div className="mt-6 rounded-lg border border-hair bg-surface-2 p-4">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="mt-1 h-4 w-4 accent-[var(--color-accent)]" />
            <span><span className="text-[15px] font-medium text-ink">Remember this preference</span><span className="mt-0.5 block text-[13px] text-muted">Off by default — leave it unchecked and nothing is saved.</span></span>
          </label>
          {remember && (
            <div className="disclose mt-4 border-t border-hair-2 pt-4">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">Apply to</p>
              <div className="flex flex-wrap gap-2">{SCOPES.map((item) => <button key={item.key} onClick={() => setScope(item.key)} aria-pressed={scope === item.key} className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${scope === item.key ? "border-accent bg-accent-tint text-accent" : "border-hair text-ink-soft hover:border-ink"}`}>{item.label}</button>)}</div>
            </div>
          )}
        </div>
        <div className="mt-6"><Button variant="accent" className="w-full" onClick={done}>Done</Button></div>
      </SidePanel>

      <div className="mt-8"><Link href={`/trips/${tripId}/home`} className={buttonClass("ghost", "sm")}>← Back to Trip Home</Link></div>
    </div>
  );
}
