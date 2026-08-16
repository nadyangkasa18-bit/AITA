"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrip } from "@/lib/store";
import { FlightPriceChart } from "@/components/flight-price-chart";
import { Button, Eyebrow, PrototypeBadge, useToast } from "@/components/ui";

const flights = [
  { id: "ana", airline: "ANA", route: "CGK → HND", time: "07:10 → 17:25", detail: "1 stop · 10h 15m · checked bag", price: 8_900_000, fit: "Best overall", direct: false, timing: 2, flex: 2 },
  { id: "sq", airline: "Singapore Airlines", route: "CGK → HND", time: "09:20 → 21:40", detail: "1 stop · 11h 20m · checked bag", price: 9_400_000, fit: "Easier departure", direct: false, timing: 1, flex: 2 },
  { id: "jal", airline: "Japan Airlines", route: "CGK → NRT", time: "06:45 → 16:10", detail: "Nonstop · 7h 25m · checked bag", price: 10_800_000, fit: "Best direct", direct: true, timing: 2, flex: 1 },
  { id: "garuda", airline: "Garuda Indonesia", route: "CGK → HND", time: "23:35 → 08:50 +1", detail: "Nonstop · 7h 15m · checked bag", price: 10_200_000, fit: "Lower direct fare", direct: true, timing: 4, flex: 1 },
];

const hotels = [
  { id: "ginza", name: "MUJI Hotel Ginza", area: "Ginza", detail: "Design-led · 3 nights · 4.8/5 fit", price: 11_600_000, fit: "I’d take this one", central: true, design: 3, value: 2 },
  { id: "shibuya", name: "Trunk Hotel Yoyogi Park", area: "Shibuya", detail: "More social · 3 nights · 4.6/5 fit", price: 13_800_000, fit: "More atmosphere", central: true, design: 3, value: 1 },
  { id: "asakusa", name: "KAIKA Tokyo", area: "Asakusa", detail: "Art-forward · quieter · 3 nights", price: 9_700_000, fit: "Better value", central: false, design: 2, value: 3 },
  { id: "marunouchi", name: "Hotel Ryumeikan Tokyo", area: "Tokyo Station", detail: "Very connected · practical · 3 nights", price: 10_400_000, fit: "Easiest logistics", central: true, design: 1, value: 3 },
];

const FLIGHT_SETTINGS = ["Best fit", "Direct only", "Lowest fare", "Better timing", "Flexible fare"] as const;
const HOTEL_SETTINGS = ["Best fit", "Central", "Design-led", "Better value"] as const;
type FlightSetting = (typeof FLIGHT_SETTINGS)[number];
type HotelSetting = (typeof HOTEL_SETTINGS)[number];

const IDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function formatCompact(value: number) {
  return `Rp ${(value / 1_000_000).toFixed(1)}m`;
}

export default function BookingPlanPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  const { trip, store, hydrated } = useTrip(tripId);
  const { toast } = useToast();
  const [flight, setFlight] = useState("ana");
  const [hotel, setHotel] = useState("ginza");
  const [step, setStep] = useState<"choose" | "review">("choose");
  const [flightSetting, setFlightSetting] = useState<FlightSetting>("Best fit");
  const [hotelSetting, setHotelSetting] = useState<HotelSetting>("Best fit");
  const [showFlightAlternatives, setShowFlightAlternatives] = useState(false);
  const [showHotelAlternatives, setShowHotelAlternatives] = useState(false);
  const [watching, setWatching] = useState(false);

  const rankedFlights = useMemo(() => {
    const next = [...flights];
    if (flightSetting === "Direct only") return next.filter((item) => item.direct).sort((a, b) => a.price - b.price);
    if (flightSetting === "Lowest fare") return next.sort((a, b) => a.price - b.price);
    if (flightSetting === "Better timing") return next.sort((a, b) => a.timing - b.timing);
    if (flightSetting === "Flexible fare") return next.sort((a, b) => b.flex - a.flex || a.price - b.price);
    return next;
  }, [flightSetting]);

  const rankedHotels = useMemo(() => {
    const next = [...hotels];
    if (hotelSetting === "Central") return next.sort((a, b) => Number(b.central) - Number(a.central) || a.price - b.price);
    if (hotelSetting === "Design-led") return next.sort((a, b) => b.design - a.design || a.price - b.price);
    if (hotelSetting === "Better value") return next.sort((a, b) => b.value - a.value || a.price - b.price);
    return next;
  }, [hotelSetting]);

  const visibleFlights = showFlightAlternatives ? rankedFlights : rankedFlights.slice(0, 2);
  const visibleHotels = showHotelAlternatives ? rankedHotels : rankedHotels.slice(0, 2);
  const chosenFlight = flights.find((item) => item.id === flight) ?? flights[0];
  const chosenHotel = hotels.find((item) => item.id === hotel) ?? hotels[0];

  if (!hydrated || !trip) return <div className="mx-auto h-[55vh] max-w-[900px] rounded-card shimmer" />;

  const persistPlan = () => {
    const base = trip.destinationProposals[0];
    if (!base) return;
    const tokyo = {
      ...base,
      id: "tokyo-direct",
      destination: "Tokyo",
      region: "Japan",
      conceptTitle: "Tokyo in 3 nights",
      thesis: "A focused three-night Tokyo trip with the flight and hotel decisions already narrowed down.",
      recommendedWindow: "3 nights",
      indicativePrice: `≈ ${formatCompact(chosenFlight.price + chosenHotel.price)} before activities`,
      journeyEffort: chosenFlight.detail,
      mobilityFit: "Rail-first · no car needed",
      stay: { ...base.stay, name: chosenHotel.name, location: chosenHotel.area, price: `${formatCompact(chosenHotel.price)} total`, why: "Selected because it matches your explicit Tokyo trip and hotel priorities." },
      flight: { ...base.flight, airline: chosenFlight.airline, route: chosenFlight.route, depart: chosenFlight.time.split(" → ")[0], arrive: chosenFlight.time.split(" → ")[1] ?? chosenFlight.time, duration: chosenFlight.detail.split(" · ")[1] ?? "10h", stops: chosenFlight.detail.split(" · ")[0], price: `${formatCompact(chosenFlight.price)} pp` },
    };
    store.patchTrip(trip.id, {
      name: "Tokyo · 3 nights",
      destinationProposals: [tokyo, ...trip.destinationProposals.slice(1)],
      selectedProposalId: tokyo.id,
      status: "version-selected",
      lifecycle: "planning",
      homeCreatedAt: new Date().toISOString(),
      componentStates: { ...trip.componentStates, flight: watching ? "tracked" : "saved", stay: "saved" },
    });
  };

  const toggleWatch = () => {
    const next = !watching;
    setWatching(next);
    const storageKey = `roam.tracked-flight-ids.${trip.id}`;
    if (next) {
      store.trackFlight(trip.id, {
        id: chosenFlight.id,
        airline: chosenFlight.airline,
        route: chosenFlight.route,
        depart: chosenFlight.time.split(" → ")[0],
        arrive: chosenFlight.time.split(" → ")[1] ?? chosenFlight.time,
        duration: chosenFlight.detail.split(" · ")[1] ?? "10h",
        stops: chosenFlight.detail.split(" · ")[0],
        originalFare: chosenFlight.price,
        currentFare: chosenFlight.price,
      });
      try {
        const existing = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as string[];
        localStorage.setItem(storageKey, JSON.stringify(Array.from(new Set([...existing, chosenFlight.id]))));
      } catch { /* ignore */ }
      toast(`Watching ${chosenFlight.airline} — nothing has been booked.`);
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as string[];
        localStorage.setItem(storageKey, JSON.stringify(existing.filter((id) => id !== chosenFlight.id)));
      } catch { /* ignore */ }
      if (trip.trackedFlight?.id === chosenFlight.id) store.stopTrackingFlight(trip.id);
      toast("Removed from price watch.");
    }
  };

  const saveForLater = () => {
    persistPlan();
    toast("Saved — these flight and hotel options are waiting in Trip Home.");
    router.push(`/trips/${trip.id}/home`);
  };

  const checkout = () => {
    persistPlan();
    router.push(`/trips/${trip.id}/checkout`);
  };

  if (step === "review") {
    return (
      <div className="mx-auto max-w-[860px] pb-20">
        <button onClick={() => setStep("choose")} className="text-[13px] font-semibold text-muted hover:text-ink">← Change options</button>
        <div className="mt-8 flex items-center gap-3"><Eyebrow>Ready to book</Eyebrow><PrototypeBadge /></div>
        <h1 className="mt-3 font-display text-[clamp(38px,6vw,58px)] font-semibold leading-[0.98] tracking-[-0.045em]">These are the two decisions you chose.</h1>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-muted">Review them once, decide whether to pay now or keep them for later. You can also watch the flight price without committing.</p>

        <div className="mt-8 divide-y divide-hair rounded-[22px] border border-hair bg-surface px-5">
          <div className="grid gap-4 py-5 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2"><Eyebrow>Flight</Eyebrow>{watching && <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[10.5px] font-semibold text-accent">Price watch on</span>}</div>
              <h2 className="mt-1 font-display text-xl font-semibold">{chosenFlight.airline} · {chosenFlight.route}</h2>
              <p className="mt-1 text-[13px] text-muted">{chosenFlight.time} · {chosenFlight.detail}</p>
              <button onClick={toggleWatch} className="mt-3 text-[12.5px] font-semibold text-accent hover:text-accent-press">{watching ? "Stop watching price" : "Watch this flight’s price"}</button>
            </div>
            <p className="font-display text-lg font-semibold">{formatCompact(chosenFlight.price)} pp</p>
          </div>
          <div className="grid gap-3 py-5 sm:grid-cols-[1fr_auto]">
            <div><Eyebrow>Hotel</Eyebrow><h2 className="mt-1 font-display text-xl font-semibold">{chosenHotel.name}</h2><p className="mt-1 text-[13px] text-muted">{chosenHotel.area} · {chosenHotel.detail}</p></div>
            <p className="font-display text-lg font-semibold">{formatCompact(chosenHotel.price)} total</p>
          </div>
        </div>

        <div className="mt-6 rounded-[18px] border border-accent-line bg-accent-tint/35 p-4 text-[13.5px] leading-relaxed text-ink-soft">Before payment, Roam would re-check live availability, fare rules, traveler details and any material price changes. Nothing charges until you approve.</div>

        <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
          <Button variant="ghost" onClick={saveForLater}>Save these for later</Button>
          <Button variant="ink" onClick={checkout}>I like these — check out & pay →</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1020px] pb-20">
      <div className="flex flex-wrap items-center gap-3"><Eyebrow>Booking plan</Eyebrow><span className="rounded-full bg-accent-tint px-2.5 py-1 text-[11px] font-semibold text-accent">Tokyo · 3 nights</span><PrototypeBadge /></div>
      <h1 className="mt-3 font-display text-[clamp(38px,6vw,58px)] font-semibold leading-[0.98] tracking-[-0.045em]">You know where you&apos;re going. I&apos;ll narrow down the booking.</h1>
      <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted">No destination shortlist. Adjust what Roam optimizes for, compare the handful of options that matter, then choose what to keep.</p>

      <section className="mt-8 rounded-[22px] border border-hair bg-surface-2 p-5 md:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <Eyebrow>Flight settings</Eyebrow>
            <p className="mt-1 text-[12.5px] text-muted">Change the trade-off Roam should optimize first.</p>
            <div className="mt-3 flex flex-wrap gap-2">{FLIGHT_SETTINGS.map((setting) => <button key={setting} onClick={() => { setFlightSetting(setting); if (setting !== "Best fit") setShowFlightAlternatives(true); }} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${flightSetting === setting ? "border-ink bg-ink text-paper" : "border-hair bg-surface text-muted hover:border-ink/30"}`}>{setting}</button>)}</div>
          </div>
          <div>
            <Eyebrow>Hotel settings</Eyebrow>
            <p className="mt-1 text-[12.5px] text-muted">Re-rank stays without starting the search over.</p>
            <div className="mt-3 flex flex-wrap gap-2">{HOTEL_SETTINGS.map((setting) => <button key={setting} onClick={() => { setHotelSetting(setting); if (setting !== "Best fit") setShowHotelAlternatives(true); }} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${hotelSetting === setting ? "border-ink bg-ink text-paper" : "border-hair bg-surface text-muted hover:border-ink/30"}`}>{setting}</button>)}</div>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><Eyebrow>1 · Flight</Eyebrow><h2 className="mt-1 font-display text-2xl font-semibold">Pick the journey</h2></div><button onClick={() => setShowFlightAlternatives((value) => !value)} className="text-[12.5px] font-semibold text-accent">{showFlightAlternatives ? "Show fewer" : "See alternative flights"}</button></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">{visibleFlights.map((item) => <button key={item.id} onClick={() => setFlight(item.id)} className={`rounded-[20px] border p-5 text-left transition ${flight === item.id ? "border-ink bg-surface shadow-[var(--shadow-card)]" : "border-hair bg-surface-2 hover:border-ink/25"}`}><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] font-semibold text-muted">{item.fit}</span>{flight === item.id && <span className="text-[12px] font-semibold text-accent">Selected ✓</span>}</div><h3 className="mt-4 font-display text-xl font-semibold">{item.airline}</h3><p className="mt-1 text-[14px] font-medium text-ink-soft">{item.route} · {item.time}</p><p className="mt-2 text-[12.5px] text-muted">{item.detail}</p><p className="mt-4 font-display text-lg font-semibold">{formatCompact(item.price)} pp</p></button>)}</div>
        <div className="mt-5"><FlightPriceChart flights={visibleFlights.map((item) => ({ id: item.id, label: `${item.airline} · ${item.route}`, currentPrice: item.price }))} title="Compare fare history before choosing" subtitle="Hover any day to see what each visible airline cost then; switch between 1 week, 1 month, 3 months and 6 months." /></div>
      </section>

      <section className="mt-9">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><Eyebrow>2 · Hotel</Eyebrow><h2 className="mt-1 font-display text-2xl font-semibold">Choose where to stay</h2></div><button onClick={() => setShowHotelAlternatives((value) => !value)} className="text-[12.5px] font-semibold text-accent">{showHotelAlternatives ? "Show fewer" : "See alternative hotels"}</button></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">{visibleHotels.map((item) => <button key={item.id} onClick={() => setHotel(item.id)} className={`rounded-[20px] border p-5 text-left transition ${hotel === item.id ? "border-ink bg-surface shadow-[var(--shadow-card)]" : "border-hair bg-surface-2 hover:border-ink/25"}`}><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] font-semibold text-muted">{item.fit}</span>{hotel === item.id && <span className="text-[12px] font-semibold text-accent">Selected ✓</span>}</div><h3 className="mt-4 font-display text-xl font-semibold">{item.name}</h3><p className="mt-1 text-[14px] font-medium text-ink-soft">{item.area}</p><p className="mt-2 text-[12.5px] text-muted">{item.detail}</p><p className="mt-4 font-display text-lg font-semibold">{formatCompact(item.price)} total</p></button>)}</div>
      </section>

      <div className="mt-8 flex justify-end"><Button variant="accent" onClick={() => setStep("review")}>Review these options →</Button></div>
    </div>
  );
}
