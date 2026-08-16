"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { FlightPriceChart } from "@/components/flight-price-chart";
import { Button, Eyebrow, PrototypeBadge, SidePanel, useToast } from "@/components/ui";

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type FlightOption = {
  id: string;
  airline: string;
  route: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: string;
  price: number;
  fare: string;
  fit: string;
  note: string;
  recommended?: boolean;
};

type DateFare = { day: string; date: string; price: number };

const BASE_FLIGHTS: FlightOption[] = [
  { id: "sq-direct", airline: "Singapore Airlines", route: "CGK → HND", depart: "10:20", arrive: "18:05", duration: "7h 45m", stops: "Nonstop", price: 12_800_000, fare: "Economy · checked bag", fit: "Roam’s pick", note: "Best balance of a direct journey, daytime departure and Haneda arrival.", recommended: true },
  { id: "nh-onestop", airline: "ANA", route: "CGK → NRT", depart: "08:40", arrive: "19:30", duration: "10h 50m", stops: "1 stop · SIN", price: 10_400_000, fare: "Economy · checked bag", fit: "Save Rp 2.4m pp", note: "Cheaper, but adds a stop and arrives at Narita instead of Haneda." },
  { id: "ga-direct", airline: "Garuda Indonesia", route: "CGK → HND", depart: "23:35", arrive: "08:50 +1", duration: "7h 15m", stops: "Nonstop", price: 11_900_000, fare: "Economy · checked bag", fit: "Lowest direct fare", note: "Good value and direct, but it uses the overnight departure you usually avoid." },
];

const EXTRA_FLIGHTS: FlightOption[] = [
  { id: "jl-direct", airline: "Japan Airlines", route: "CGK → NRT", depart: "06:45", arrive: "16:10", duration: "7h 25m", stops: "Nonstop", price: 12_200_000, fare: "Economy · checked bag", fit: "Another direct option", note: "Direct with an earlier departure; useful if you want more of the arrival day." },
  { id: "cx-onestop", airline: "Cathay Pacific", route: "CGK → HND", depart: "09:10", arrive: "20:25", duration: "10h 15m", stops: "1 stop · HKG", price: 9_850_000, fare: "Economy · checked bag", fit: "Cheapest strong option", note: "The largest saving here, with one manageable connection in Hong Kong." },
  { id: "sq-flex", airline: "Singapore Airlines", route: "CGK → HND", depart: "14:20", arrive: "00:05 +1", duration: "8h 45m", stops: "1 stop · SIN", price: 13_150_000, fare: "Economy Flex · checked bag", fit: "More flexible fare", note: "Costs more, but gives you better change and cancellation flexibility." },
];

const MORE_REASONS = [
  "Show me cheaper flights",
  "Direct flights only",
  "Better departure times",
  "Better arrival times",
  "Shorter total journey",
  "More flexible fares",
  "Different airlines",
];

const DATE_FARES: DateFare[] = [
  { day: "Mon", date: "19 Oct", price: 13_300_000 },
  { day: "Tue", date: "20 Oct", price: 11_600_000 },
  { day: "Wed", date: "21 Oct", price: 12_100_000 },
  { day: "Thu", date: "22 Oct", price: 12_800_000 },
  { day: "Fri", date: "23 Oct", price: 13_500_000 },
  { day: "Sat", date: "24 Oct", price: 14_100_000 },
  { day: "Sun", date: "25 Oct", price: 12_900_000 },
];

function DateFlexChart({ selected, onSelect }: { selected: string; onSelect: (date: string) => void }) {
  const min = Math.min(...DATE_FARES.map((item) => item.price));
  const max = Math.max(...DATE_FARES.map((item) => item.price));
  const best = DATE_FARES.find((item) => item.price === min)!;
  return (
    <section className="mt-8 rounded-[22px] border border-hair bg-surface-2 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>If your dates can move</Eyebrow>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">A day either way can change the fare</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">Tuesday 20 Oct is about {IDR.format(DATE_FARES[3].price - best.price)} less per person than the current Thursday departure. Pick a day to re-price the shortlist.</p>
        </div>
        <span className="rounded-full bg-accent-tint px-3 py-1.5 text-[11.5px] font-semibold text-accent">Best nearby · {best.date}</span>
      </div>
      <div className="mt-6 grid grid-cols-7 items-end gap-2">
        {DATE_FARES.map((item) => {
          const barHeight = 54 + ((item.price - min) / Math.max(1, max - min)) * 58;
          const active = selected === item.date;
          const isBest = item.price === min;
          return (
            <button key={item.date} onClick={() => onSelect(item.date)} className="group flex min-w-0 flex-col items-center rounded-[12px] px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35" aria-pressed={active}>
              <span className="mb-2 hidden text-[10px] font-semibold text-muted sm:block">{(item.price / 1_000_000).toFixed(1)}m</span>
              <span className={`w-full max-w-[54px] rounded-t-[10px] transition ${active ? "bg-ink" : isBest ? "bg-accent" : "bg-hair"}`} style={{ height: barHeight }} />
              <span className={`mt-2 text-[10.5px] font-semibold ${active ? "text-ink" : "text-faint"}`}>{item.day}</span>
              <span className={`hidden text-[10px] sm:block ${active ? "text-ink-soft" : "text-faint"}`}>{item.date.replace(" Oct", "")}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FlightCard({ flight, tracked, onTrack, onBook }: { flight: FlightOption; tracked: boolean; onTrack: () => void; onBook: () => void }) {
  return (
    <article className={`rounded-[22px] border bg-surface p-5 transition ${flight.recommended ? "border-accent-line shadow-[var(--shadow-card)]" : "border-hair"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {flight.recommended && <span className="rounded-full bg-accent px-2.5 py-1 text-[10.5px] font-semibold text-white">Roam’s pick</span>}
            {tracked && <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[10.5px] font-semibold text-accent">Tracking</span>}
            {!flight.recommended && <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] font-semibold text-muted">{flight.fit}</span>}
          </div>
          <h2 className="mt-3 font-display text-[23px] font-semibold tracking-[-0.025em]">{flight.airline}</h2>
          <p className="mt-1 text-[13px] text-muted">{flight.route} · {flight.fare}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-[21px] font-semibold tracking-[-0.02em]">{IDR.format(flight.price)} pp</p>
          {flight.recommended && <p className="mt-1 text-[11.5px] font-semibold text-accent">{flight.fit}</p>}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <div><p className="font-display text-xl font-semibold">{flight.depart}</p><p className="text-[10px] uppercase tracking-[0.1em] text-faint">Depart</p></div>
        <div className="text-center"><div className="h-px bg-hair" /><p className="mt-2 text-[11px] text-muted">{flight.duration} · {flight.stops}</p></div>
        <div className="text-right"><p className="font-display text-xl font-semibold">{flight.arrive}</p><p className="text-[10px] uppercase tracking-[0.1em] text-faint">Arrive</p></div>
      </div>
      <p className="mt-5 text-[13px] leading-relaxed text-muted">{flight.note}</p>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-hair-2 pt-4">
        <Button variant="ghost" size="sm" onClick={onTrack}>{tracked ? "Stop tracking" : "Track price"}</Button>
        <Button variant="ink" size="sm" onClick={onBook}>Book this flight</Button>
      </div>
    </article>
  );
}

export default function FlightsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  const store = useStore();
  const { toast } = useToast();
  const trip = store.trips[tripId];
  const storageKey = `roam.tracked-flight-ids.${tripId}`;

  const [showExtra, setShowExtra] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreReasons, setMoreReasons] = useState<string[]>([]);
  const [trackedIds, setTrackedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("22 Oct");

  const dateFare = DATE_FARES.find((item) => item.date === selectedDate) ?? DATE_FARES[3];
  const dateAdjustment = dateFare.price - DATE_FARES[3].price;
  const flights = useMemo(
    () => (showExtra ? [...BASE_FLIGHTS, ...EXTRA_FLIGHTS] : BASE_FLIGHTS).map((flight) => ({ ...flight, price: flight.price + dateAdjustment })),
    [showExtra, dateAdjustment],
  );
  const allFlightsForDate = useMemo(
    () => [...BASE_FLIGHTS, ...EXTRA_FLIGHTS].map((flight) => ({ ...flight, price: flight.price + dateAdjustment })),
    [dateAdjustment],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      const initial = parsed.length ? parsed : trip?.trackedFlight ? [trip.trackedFlight.id] : [];
      setTrackedIds(initial);
      setCompareIds(initial.slice(0, 2));
    } catch {
      if (trip?.trackedFlight) {
        setTrackedIds([trip.trackedFlight.id]);
        setCompareIds([trip.trackedFlight.id]);
      }
    }
  }, [storageKey, trip?.trackedFlight?.id]);

  const persistTracked = (ids: string[]) => {
    setTrackedIds(ids);
    setCompareIds((current) => {
      const kept = current.filter((id) => ids.includes(id));
      const additions = ids.filter((id) => !kept.includes(id)).slice(0, Math.max(0, 2 - kept.length));
      return [...kept, ...additions];
    });
    try { localStorage.setItem(storageKey, JSON.stringify(ids)); } catch { /* ignore */ }
  };

  const getFlight = (id: string) => allFlightsForDate.find((flight) => flight.id === id);

  const track = (flight: FlightOption) => {
    if (trackedIds.includes(flight.id)) {
      const next = trackedIds.filter((id) => id !== flight.id);
      persistTracked(next);
      if (trip?.trackedFlight?.id === flight.id) {
        const replacement = getFlight(next[0] ?? "");
        if (replacement) {
          store.trackFlight(tripId, { id: replacement.id, airline: replacement.airline, route: replacement.route, depart: replacement.depart, arrive: replacement.arrive, duration: replacement.duration, stops: replacement.stops, originalFare: replacement.price, currentFare: replacement.price });
        } else {
          store.stopTrackingFlight(tripId);
        }
      }
      toast(next.length ? `${flight.airline} removed from your price watch.` : "Price watch cleared.");
      return;
    }

    const next = [...trackedIds, flight.id];
    persistTracked(next);
    if (!trip?.trackedFlight) {
      store.trackFlight(tripId, { id: flight.id, airline: flight.airline, route: flight.route, depart: flight.depart, arrive: flight.arrive, duration: flight.duration, stops: flight.stops, originalFare: flight.price, currentFare: flight.price });
    }
    toast(`Tracking ${flight.airline} for ${selectedDate} — nothing has been booked.`);
  };

  const book = (flight: FlightOption) => {
    store.trackFlight(tripId, { id: flight.id, airline: flight.airline, route: flight.route, depart: flight.depart, arrive: flight.arrive, duration: flight.duration, stops: flight.stops, originalFare: flight.price, currentFare: flight.price });
    router.push(`/trips/${tripId}/checkout`);
  };

  const trackedFlights = trackedIds.map((id) => getFlight(id)).filter(Boolean) as FlightOption[];
  const comparedFlights = compareIds.map((id) => getFlight(id)).filter(Boolean) as FlightOption[];
  const toggleCompare = (id: string) => setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleMoreReason = (reason: string) => setMoreReasons((current) => current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]);
  const generateMore = () => {
    if (!moreReasons.length) return;
    setShowExtra(true);
    setMoreOpen(false);
    toast(`Added 3 more options tuned to: ${moreReasons.slice(0, 2).join(", ")}${moreReasons.length > 2 ? "…" : ""}`);
    setMoreReasons([]);
  };

  return (
    <div className="mx-auto max-w-[980px] pb-20">
      <div className="mb-6"><Link href={`/trips/${tripId}/home`} className="text-[13px] font-medium text-muted transition hover:text-ink">← Back to Trip Home</Link></div>
      <div className="flex flex-wrap items-center gap-3"><Eyebrow>Flights</Eyebrow><PrototypeBadge /></div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(34px,5vw,50px)] font-semibold tracking-[-0.04em]">Start with the flights worth considering</h1>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-muted">Roam narrows the list first. Track any option—including the recommendation—or ask for a different kind of shortlist.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMoreOpen(true)}>Show me different options</Button>
      </div>

      <DateFlexChart selected={selectedDate} onSelect={(date) => { setSelectedDate(date); toast(`Re-priced the shortlist for ${date}.`); }} />

      <div className="mt-8 flex items-center justify-between gap-3">
        <div><Eyebrow>Best options · {selectedDate}</Eyebrow><p className="mt-1 text-[12.5px] text-muted">Prices below update with the departure day selected above.</p></div>
        {selectedDate !== "22 Oct" && <button onClick={() => setSelectedDate("22 Oct")} className="text-[12px] font-semibold text-muted hover:text-ink">Reset to original date</button>}
      </div>
      <div className="mt-4 grid gap-4">{flights.map((flight) => <FlightCard key={flight.id} flight={flight} tracked={trackedIds.includes(flight.id)} onTrack={() => track(flight)} onBook={() => book(flight)} />)}</div>
      {!showExtra && <div className="mt-5 text-center"><button onClick={() => setMoreOpen(true)} className="text-[13px] font-semibold text-accent hover:text-accent-press">None of these? Ask for more options →</button></div>}

      {trackedFlights.length > 0 && (
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Price watch</Eyebrow>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-[-0.035em]">{trackedFlights.length} {trackedFlights.length === 1 ? "flight" : "flights"} being watched</h2>
              <p className="mt-2 max-w-[58ch] text-[13.5px] leading-relaxed text-muted">Tracking stays attached to the original flight option. Select two or more below to compare their history together.</p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-[18px] border border-hair bg-surface">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead className="bg-surface-2 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint">
                <tr><th className="px-4 py-3">Compare</th><th className="px-4 py-3">Flight</th><th className="px-4 py-3">Current fare</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody>
                {trackedFlights.map((flight) => (
                  <tr key={flight.id} className="border-t border-hair-2 text-[13px]">
                    <td className="px-4 py-4"><input type="checkbox" checked={compareIds.includes(flight.id)} onChange={() => toggleCompare(flight.id)} className="h-4 w-4 accent-[var(--color-accent)]" aria-label={`Compare ${flight.airline}`} /></td>
                    <td className="px-4 py-4"><p className="font-semibold text-ink">{flight.airline}</p><p className="mt-0.5 text-[11.5px] text-muted">{flight.route} · {flight.depart}</p></td>
                    <td className="px-4 py-4 font-semibold text-ink-soft">{IDR.format(flight.price)}</td>
                    <td className="px-4 py-4"><span className="rounded-full bg-accent-tint px-2.5 py-1 text-[10.5px] font-semibold text-accent">Tracking</span></td>
                    <td className="px-4 py-4 text-right"><button onClick={() => track(flight)} className="text-[12px] font-semibold text-muted hover:text-ink">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5">
            {comparedFlights.length ? (
              <FlightPriceChart
                flights={comparedFlights.map((flight) => ({ id: flight.id, label: `${flight.airline} · ${flight.route}`, currentPrice: flight.price }))}
                title="Compare tracked fare history"
                subtitle="Hover any day to highlight it and see what each selected airline cost at that point."
              />
            ) : (
              <div className="rounded-[20px] border border-dashed border-hair py-12 text-center text-[13px] text-faint">Select at least one tracked flight to see its price history.</div>
            )}
          </div>
        </section>
      )}

      <SidePanel open={moreOpen} onClose={() => setMoreOpen(false)} title="What kind of options should I find instead?">
        <p className="text-[14px] leading-relaxed text-muted">Choose as many as apply. This refines this flight search; it doesn’t become a permanent Traveler Profile preference.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {MORE_REASONS.map((reason) => {
            const selected = moreReasons.includes(reason);
            return <button key={reason} onClick={() => toggleMoreReason(reason)} className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${selected ? "border-ink bg-ink text-paper" : "border-hair bg-surface text-ink-soft hover:border-ink/35"}`}>{reason}</button>;
          })}
        </div>
        <Button variant="accent" className="mt-6 w-full" disabled={!moreReasons.length} onClick={generateMore}>Find more flight options</Button>
      </SidePanel>
    </div>
  );
}
