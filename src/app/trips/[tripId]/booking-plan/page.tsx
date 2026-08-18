"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrip } from "@/lib/store";
import { Button, Eyebrow, PrototypeBadge, useToast } from "@/components/ui";
import { PRODUCT } from "@/config/product";

type FlightOption = {
  id: string;
  airline: string;
  route: string;
  time: string;
  detail: string;
  price: number;
  direct: boolean;
  timing: number;
  flex: number;
};

type StayOption = {
  id: string;
  name: string;
  area: string;
  detail: string;
  price: number;
  central: number;
  design: number;
  comfort: number;
  value: number;
};

type CityData = {
  city: string;
  region: string;
  airport: string;
  flights: FlightOption[];
  stays: StayOption[];
};

const CITY_DATA: Record<string, CityData> = {
  tokyo: {
    city: "Tokyo",
    region: "Japan",
    airport: "HND",
    flights: [
      { id: "jal", airline: "Japan Airlines", route: "CGK → HND", time: "06:45 → 16:10", detail: "Nonstop · 7h 25m · checked bag", price: 10_800_000, direct: true, timing: 2, flex: 2 },
      { id: "ana", airline: "ANA", route: "CGK → HND", time: "07:10 → 17:25", detail: "1 stop · 10h 15m · checked bag", price: 8_900_000, direct: false, timing: 2, flex: 3 },
      { id: "garuda", airline: "Garuda Indonesia", route: "CGK → HND", time: "23:35 → 08:50 +1", detail: "Nonstop · 7h 15m · checked bag", price: 10_200_000, direct: true, timing: 4, flex: 1 },
    ],
    stays: [
      { id: "muji", name: "MUJI Hotel Ginza", area: "Ginza", detail: "Design-led · walkable · excellent rail access", price: 11_600_000, central: 3, design: 3, comfort: 2, value: 2 },
      { id: "trunk", name: "Trunk Hotel Yoyogi Park", area: "Shibuya", detail: "More atmosphere · larger social spaces · design-forward", price: 13_800_000, central: 3, design: 3, comfort: 3, value: 1 },
      { id: "kaika", name: "KAIKA Tokyo", area: "Asakusa", detail: "Art-forward · quieter neighborhood · better value", price: 9_700_000, central: 2, design: 2, comfort: 2, value: 3 },
    ],
  },
  seoul: {
    city: "Seoul",
    region: "South Korea",
    airport: "ICN",
    flights: [
      { id: "ke", airline: "Korean Air", route: "CGK → ICN", time: "21:50 → 07:10 +1", detail: "Nonstop · 7h 20m · checked bag", price: 8_700_000, direct: true, timing: 4, flex: 2 },
      { id: "ga-seoul", airline: "Garuda Indonesia", route: "CGK → ICN", time: "08:10 → 17:20", detail: "Nonstop · 7h 10m · checked bag", price: 9_300_000, direct: true, timing: 1, flex: 2 },
      { id: "sq-seoul", airline: "Singapore Airlines", route: "CGK → ICN", time: "06:20 → 18:45", detail: "1 stop · 10h 25m · checked bag", price: 7_900_000, direct: false, timing: 2, flex: 3 },
    ],
    stays: [
      { id: "josun", name: "Josun Palace", area: "Gangnam", detail: "Polished · spacious rooms · strong city views", price: 12_800_000, central: 2, design: 3, comfort: 3, value: 1 },
      { id: "ryse", name: "RYSE, Autograph Collection", area: "Hongdae", detail: "Design-forward · lively neighborhood · easy transit", price: 9_900_000, central: 3, design: 3, comfort: 2, value: 2 },
      { id: "l7", name: "L7 Myeongdong", area: "Myeongdong", detail: "Very central · simple rooms · strong value", price: 7_800_000, central: 3, design: 1, comfort: 2, value: 3 },
    ],
  },
  singapore: {
    city: "Singapore",
    region: "Singapore",
    airport: "SIN",
    flights: [
      { id: "sq-sin", airline: "Singapore Airlines", route: "CGK → SIN", time: "09:10 → 12:00", detail: "Nonstop · 1h 50m · checked bag", price: 3_400_000, direct: true, timing: 1, flex: 3 },
      { id: "ga-sin", airline: "Garuda Indonesia", route: "CGK → SIN", time: "11:20 → 14:10", detail: "Nonstop · 1h 50m · checked bag", price: 3_000_000, direct: true, timing: 2, flex: 2 },
      { id: "scoot", airline: "Scoot", route: "CGK → SIN", time: "07:25 → 10:10", detail: "Nonstop · 1h 45m · cabin bag", price: 1_850_000, direct: true, timing: 2, flex: 1 },
    ],
    stays: [
      { id: "warehouse", name: "The Warehouse Hotel", area: "Robertson Quay", detail: "Characterful · design-led · quieter evenings", price: 10_900_000, central: 2, design: 3, comfort: 3, value: 1 },
      { id: "oasia", name: "Oasia Hotel Downtown", area: "Tanjong Pagar", detail: "Central · green architecture · strong MRT access", price: 8_900_000, central: 3, design: 3, comfort: 2, value: 2 },
      { id: "lyf", name: "lyf Funan", area: "City Hall", detail: "Very central · compact · practical value", price: 6_600_000, central: 3, design: 1, comfort: 1, value: 3 },
    ],
  },
  bangkok: {
    city: "Bangkok",
    region: "Thailand",
    airport: "BKK",
    flights: [
      { id: "tg", airline: "Thai Airways", route: "CGK → BKK", time: "09:35 → 13:05", detail: "Nonstop · 3h 30m · checked bag", price: 4_900_000, direct: true, timing: 1, flex: 2 },
      { id: "ga-bkk", airline: "Garuda Indonesia", route: "CGK → BKK", time: "13:10 → 16:45", detail: "Nonstop · 3h 35m · checked bag", price: 4_500_000, direct: true, timing: 2, flex: 2 },
      { id: "airasia", airline: "AirAsia", route: "CGK → DMK", time: "07:05 → 10:35", detail: "Nonstop · 3h 30m · cabin bag", price: 2_250_000, direct: true, timing: 2, flex: 1 },
    ],
    stays: [
      { id: "standard", name: "The Standard, Bangkok Mahanakhon", area: "Silom", detail: "Design-led · lively · excellent city access", price: 9_600_000, central: 3, design: 3, comfort: 3, value: 2 },
      { id: "sindhorn", name: "Sindhorn Kempinski", area: "Langsuan", detail: "Spacious · quiet luxury · strong pool and wellness", price: 12_900_000, central: 2, design: 2, comfort: 3, value: 1 },
      { id: "asai", name: "ASAI Bangkok Chinatown", area: "Chinatown", detail: "Food-first location · compact · excellent value", price: 5_900_000, central: 2, design: 2, comfort: 1, value: 3 },
    ],
  },
};

const IDR = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function field(prompt: string, label: string) {
  const prefix = `${label}:`;
  return prompt.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length).trim() ?? "";
}

function cityKey(destination: string) {
  const value = destination.toLowerCase();
  if (value.includes("seoul") || value.includes("korea")) return "seoul";
  if (value.includes("singapore")) return "singapore";
  if (value.includes("bangkok") || value.includes("thailand")) return "bangkok";
  return "tokyo";
}

function fallbackData(destination: string): CityData {
  const city = destination.split(",")[0].trim() || "Your destination";
  return {
    city,
    region: destination.split(",").slice(1).join(",").trim(),
    airport: "",
    flights: [
      { id: "fit", airline: "Best-fit carrier", route: `CGK → ${city}`, time: "09:10 → 16:40", detail: "Best overall journey · checked bag", price: 8_900_000, direct: true, timing: 1, flex: 2 },
      { id: "value", airline: "Best-value carrier", route: `CGK → ${city}`, time: "07:20 → 17:50", detail: "Lower fare · longer journey", price: 7_200_000, direct: false, timing: 2, flex: 2 },
      { id: "flex", airline: "Flexible-fare carrier", route: `CGK → ${city}`, time: "11:30 → 19:10", detail: "More flexible fare · checked bag", price: 9_600_000, direct: true, timing: 2, flex: 3 },
    ],
    stays: [
      { id: "central", name: `${city} Central Hotel`, area: "Central district", detail: "Walkable · well connected · strong overall fit", price: 9_800_000, central: 3, design: 2, comfort: 2, value: 2 },
      { id: "design", name: `${city} Design Hotel`, area: "Design district", detail: "More atmosphere · stronger design · quieter stay", price: 11_400_000, central: 2, design: 3, comfort: 3, value: 1 },
      { id: "value-stay", name: `${city} Local Stay`, area: "Connected neighborhood", detail: "Simpler room · easy transit · better value", price: 7_100_000, central: 2, design: 1, comfort: 2, value: 3 },
    ],
  };
}

function dateLabel(raw: string) {
  const [start, end] = raw.split(" to ");
  if (!start || !end) return raw || "Your dates";
  const format = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`));
  return `${format(start)} – ${format(end)}`;
}

function rankFlights(items: FlightOption[], preference: string, budget: string) {
  const next = [...items];
  if (preference.includes("Lowest") || budget.includes("Keep the total")) return next.sort((a, b) => a.price - b.price);
  if (preference.includes("Direct")) return next.sort((a, b) => Number(b.direct) - Number(a.direct) || a.timing - b.timing || a.price - b.price);
  if (preference.includes("Better times")) return next.sort((a, b) => a.timing - b.timing || a.price - b.price);
  if (preference.includes("flexible") || preference.includes("Flexible")) return next.sort((a, b) => b.flex - a.flex || a.price - b.price);
  return next;
}

function rankStays(items: StayOption[], preference: string, budget: string) {
  const next = [...items];
  if (budget.includes("Keep the total")) return next.sort((a, b) => a.price - b.price);
  if (budget.includes("Spend more on the stay") || preference.includes("Design")) return next.sort((a, b) => b.design - a.design || b.comfort - a.comfort);
  if (preference.includes("location") || preference.includes("Location")) return next.sort((a, b) => b.central - a.central || a.price - b.price);
  if (preference.includes("comfort") || preference.includes("Comfort")) return next.sort((a, b) => b.comfort - a.comfort || b.central - a.central);
  if (preference.includes("value") || preference.includes("Value")) return next.sort((a, b) => b.value - a.value || a.price - b.price);
  return next;
}

function flightReason(preference: string, flight: FlightOption) {
  if (preference.includes("Direct")) return flight.direct ? "It protects the direct journey you asked for without making the fare the only decision." : "This is the strongest overall journey even with one connection.";
  if (preference.includes("Lowest")) return "It is the lowest strong fare in this shortlist, without adding an unreasonable journey.";
  if (preference.includes("Better times")) return "Its departure and arrival times make the travel day easier to use.";
  if (preference.includes("flexible") || preference.includes("Flexible")) return "The fare rules leave you more room to change plans later.";
  return "It is the cleanest balance of journey time, fare and arrival timing.";
}

function stayReason(preference: string, stay: StayOption) {
  if (preference.includes("Design")) return "This is the stay with the strongest atmosphere without giving up too much convenience.";
  if (preference.includes("location") || preference.includes("Location")) return "The location removes the most day-to-day transit work once you arrive.";
  if (preference.includes("comfort") || preference.includes("Comfort")) return "It gives you the strongest room and comfort trade-off for this trip.";
  if (preference.includes("value") || preference.includes("Value")) return "It gives up the least experience for the amount you save.";
  return "It is the best overall fit between location, comfort and price.";
}

export default function BookingPlanPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  const { trip, store, hydrated } = useTrip(tripId);
  const { toast } = useToast();
  const [flightId, setFlightId] = useState("");
  const [stayId, setStayId] = useState("");
  const [showFlights, setShowFlights] = useState(false);
  const [showStays, setShowStays] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [watching, setWatching] = useState(false);

  const prompt = trip?.originalPrompt ?? "";
  const destination = field(prompt, "Destination") || "Tokyo, Japan";
  const key = cityKey(destination);
  const exactKnownCity = Object.values(CITY_DATA).some((entry) => destination.toLowerCase().includes(entry.city.toLowerCase()));
  const data = exactKnownCity ? CITY_DATA[key] : fallbackData(destination);
  const rawDates = field(prompt, "Dates");
  const dates = dateLabel(rawDates);
  const pace = field(prompt, "Pace") || "Balanced";
  const stayPreference = field(prompt, "Stay priority") || "Best location";
  const flightPreference = field(prompt, "Flight priority") || "Direct if possible";
  const budget = field(prompt, "Budget approach") || "Balanced";
  const extra = field(prompt, "Specific requests");
  const travelers = trip?.travelers ?? 2;

  const rankedFlights = useMemo(() => rankFlights(data.flights, flightPreference, budget), [data.flights, flightPreference, budget]);
  const rankedStays = useMemo(() => rankStays(data.stays, stayPreference, budget), [data.stays, stayPreference, budget]);
  const recommendedFlight = rankedFlights[0];
  const recommendedStay = rankedStays[0];
  const chosenFlight = data.flights.find((item) => item.id === flightId) ?? recommendedFlight;
  const chosenStay = data.stays.find((item) => item.id === stayId) ?? recommendedStay;
  const total = chosenFlight.price * travelers + chosenStay.price;

  if (!hydrated || !trip) return <div className="mx-auto h-[55vh] max-w-[900px] rounded-card shimmer" />;

  const persistPlan = () => {
    const base = trip.destinationProposals[0];
    if (!base) return;
    const selected = {
      ...base,
      id: `${key}-direct`,
      destination: data.city,
      region: data.region,
      conceptTitle: `${data.city} · ${dates}`,
      thesis: `A ${pace.toLowerCase()} ${data.city} trip with the flight and stay decisions already narrowed to your stated trade-offs.`,
      recommendedWindow: dates,
      indicativePrice: `≈ ${IDR.format(total)} before activities`,
      journeyEffort: chosenFlight.detail,
      mobilityFit: "Trip logistics are optimized around the stay and arrival point.",
      stay: {
        ...base.stay,
        name: chosenStay.name,
        location: chosenStay.area,
        price: `${IDR.format(chosenStay.price)} total`,
        why: stayReason(stayPreference, chosenStay),
      },
      flight: {
        ...base.flight,
        airline: chosenFlight.airline,
        route: chosenFlight.route,
        depart: chosenFlight.time.split(" → ")[0],
        arrive: chosenFlight.time.split(" → ")[1] ?? chosenFlight.time,
        duration: chosenFlight.detail.split(" · ")[1] ?? chosenFlight.detail,
        stops: chosenFlight.detail.split(" · ")[0],
        price: `${IDR.format(chosenFlight.price)} pp`,
      },
    };

    store.patchTrip(trip.id, {
      name: `${data.city} · ${dates}`,
      destinationProposals: [selected, ...trip.destinationProposals.slice(1)],
      selectedProposalId: selected.id,
      status: "version-selected",
      lifecycle: "planning",
      homeCreatedAt: new Date().toISOString(),
      componentStates: { ...trip.componentStates, flight: watching ? "tracked" : "saved", stay: "saved" },
    });

    if (watching) {
      store.trackFlight(trip.id, {
        id: chosenFlight.id,
        airline: chosenFlight.airline,
        route: chosenFlight.route,
        depart: chosenFlight.time.split(" → ")[0],
        arrive: chosenFlight.time.split(" → ")[1] ?? chosenFlight.time,
        duration: chosenFlight.detail.split(" · ")[1] ?? chosenFlight.detail,
        stops: chosenFlight.detail.split(" · ")[0],
        originalFare: chosenFlight.price,
        currentFare: chosenFlight.price,
      });
    }
  };

  const saveForLater = () => {
    persistPlan();
    toast("Saved — this recommendation is waiting in Trip Home.");
    router.push(`/trips/${trip.id}/home`);
  };

  const checkout = () => {
    persistPlan();
    router.push(`/trips/${trip.id}/checkout`);
  };

  if (reviewing) {
    return (
      <div className="mx-auto max-w-[860px] pb-20">
        <button onClick={() => setReviewing(false)} className="text-[13px] font-semibold text-muted hover:text-ink">← Change recommendation</button>
        <div className="mt-8 flex flex-wrap items-center gap-3"><Eyebrow>Review booking plan</Eyebrow><PrototypeBadge /></div>
        <h1 className="mt-3 font-display text-[clamp(38px,6vw,58px)] font-semibold leading-[0.98] tracking-[-0.045em]">One last look before anything consequential.</h1>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-muted">These are the two options you chose for {data.city}. In production, {PRODUCT.name} would re-check live availability, fare rules and any material price change before you approve payment.</p>

        <div className="mt-8 overflow-hidden rounded-[24px] border border-hair bg-surface">
          <div className="grid gap-4 border-b border-hair-2 p-5 sm:grid-cols-[1fr_auto] md:p-6">
            <div><Eyebrow>Flight</Eyebrow><h2 className="mt-2 font-display text-[22px] font-semibold">{chosenFlight.airline} · {chosenFlight.route}</h2><p className="mt-1 text-[13px] text-muted">{chosenFlight.time} · {chosenFlight.detail}</p></div>
            <div className="sm:text-right"><p className="font-display text-[20px] font-semibold">{IDR.format(chosenFlight.price)} pp</p><button onClick={() => setWatching((value) => !value)} className="mt-2 text-[11.5px] font-semibold text-accent">{watching ? "Price watch on ✓" : "Watch this price"}</button></div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] md:p-6">
            <div><Eyebrow>Stay</Eyebrow><h2 className="mt-2 font-display text-[22px] font-semibold">{chosenStay.name}</h2><p className="mt-1 text-[13px] text-muted">{chosenStay.area} · {chosenStay.detail}</p></div>
            <p className="font-display text-[20px] font-semibold sm:text-right">{IDR.format(chosenStay.price)} total</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-ink px-5 py-4 text-paper"><div><p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/50">Illustrative trip total</p><p className="mt-1 text-[12px] text-white/62">{travelers} traveler{travelers === 1 ? "" : "s"} · flight + stay</p></div><p className="font-display text-[25px] font-semibold">{IDR.format(total)}</p></div>

        <div className="mt-7 flex flex-wrap items-center justify-end gap-3"><Button variant="ghost" onClick={saveForLater}>Save for later</Button><Button variant="ink" onClick={checkout}>Approve & continue to checkout →</Button></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1040px] pb-20">
      <div className="flex flex-wrap items-center gap-3"><Eyebrow>Your recommendation</Eyebrow><span className="rounded-full bg-accent-tint px-2.5 py-1 text-[11px] font-semibold text-accent">{data.city} · {dates}</span><PrototypeBadge /></div>
      <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(38px,6vw,58px)] font-semibold leading-[0.98] tracking-[-0.045em]">You know where you&apos;re going. Here&apos;s the combination I&apos;d take.</h1>
      <p className="mt-4 max-w-[64ch] text-[15px] leading-relaxed text-muted">No destination shortlist. {PRODUCT.name} used the trip you fixed and your four trade-offs to narrow the flight and stay first. Alternatives are there only if you want them.</p>

      <div className="mt-6 flex flex-wrap gap-2 text-[11.5px] text-muted">
        <span className="rounded-full border border-hair bg-surface px-3 py-1.5">{travelers} traveler{travelers === 1 ? "" : "s"}</span>
        <span className="rounded-full border border-hair bg-surface px-3 py-1.5">{pace}</span>
        <span className="rounded-full border border-hair bg-surface px-3 py-1.5">Flight · {flightPreference}</span>
        <span className="rounded-full border border-hair bg-surface px-3 py-1.5">Stay · {stayPreference}</span>
        <span className="rounded-full border border-hair bg-surface px-3 py-1.5">Budget · {budget}</span>
      </div>
      {extra && <div className="mt-3 rounded-[14px] border border-accent-line bg-accent-tint/30 px-4 py-3 text-[12.5px] text-ink-soft"><strong className="font-semibold">Specific request:</strong> {extra}</div>}

      <section className="mt-9 grid gap-5 lg:grid-cols-2">
        <article className="rounded-[26px] border border-hair bg-surface p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3"><Eyebrow>1 · Flight</Eyebrow><span className="rounded-full bg-[#dfe9df] px-2.5 py-1 text-[10.5px] font-semibold text-[#34523b]">{chosenFlight.id === recommendedFlight.id ? "My pick" : "Your pick"}</span></div>
          <h2 className="mt-4 font-display text-[27px] font-semibold tracking-[-0.035em]">{chosenFlight.airline}</h2>
          <p className="mt-1 text-[13px] text-muted">{chosenFlight.route}</p>
          <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-4"><div><p className="font-display text-[23px] font-semibold">{chosenFlight.time.split(" → ")[0]}</p><p className="text-[10px] uppercase tracking-[0.1em] text-faint">Depart</p></div><div className="text-center"><div className="h-px bg-hair" /><p className="mt-2 text-[11px] text-muted">{chosenFlight.detail}</p></div><div className="text-right"><p className="font-display text-[23px] font-semibold">{chosenFlight.time.split(" → ")[1]}</p><p className="text-[10px] uppercase tracking-[0.1em] text-faint">Arrive</p></div></div>
          <div className="mt-5 rounded-[16px] bg-surface-2 p-4"><p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">Why this one</p><p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{flightReason(flightPreference, chosenFlight)}</p></div>
          <div className="mt-5 flex items-center justify-between gap-3"><p className="font-display text-[20px] font-semibold">{IDR.format(chosenFlight.price)} pp</p><button onClick={() => setShowFlights((value) => !value)} className="text-[12px] font-semibold text-accent">{showFlights ? "Hide alternatives" : "See other flights"}</button></div>
          {showFlights && <div className="mt-4 grid gap-2 border-t border-hair-2 pt-4">{rankedFlights.filter((item) => item.id !== chosenFlight.id).map((item) => <button key={item.id} onClick={() => { setFlightId(item.id); setShowFlights(false); }} className="flex items-center justify-between gap-3 rounded-[14px] border border-hair bg-surface-2 px-4 py-3 text-left transition hover:border-ink/25"><span><span className="block text-[12.5px] font-semibold text-ink">{item.airline}</span><span className="mt-0.5 block text-[11px] text-muted">{item.time} · {item.detail}</span></span><span className="shrink-0 text-[12px] font-semibold text-ink-soft">{IDR.format(item.price)}</span></button>)}</div>}
        </article>

        <article className="rounded-[26px] border border-hair bg-surface p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3"><Eyebrow>2 · Stay</Eyebrow><span className="rounded-full bg-[#dfe9df] px-2.5 py-1 text-[10.5px] font-semibold text-[#34523b]">{chosenStay.id === recommendedStay.id ? "I'd pair it" : "Your pick"}</span></div>
          <h2 className="mt-4 font-display text-[27px] font-semibold tracking-[-0.035em]">{chosenStay.name}</h2>
          <p className="mt-1 text-[13px] text-muted">{chosenStay.area}</p>
          <div className="mt-6 rounded-[18px] border border-hair bg-surface-2 p-5"><p className="text-[12.5px] font-semibold text-ink-soft">{chosenStay.detail}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-[10.5px] text-muted">Location {chosenStay.central}/3</span><span className="rounded-full bg-white px-2.5 py-1 text-[10.5px] text-muted">Design {chosenStay.design}/3</span><span className="rounded-full bg-white px-2.5 py-1 text-[10.5px] text-muted">Comfort {chosenStay.comfort}/3</span></div></div>
          <div className="mt-4 rounded-[16px] bg-surface-2 p-4"><p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">Why this one</p><p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{stayReason(stayPreference, chosenStay)}</p></div>
          <div className="mt-5 flex items-center justify-between gap-3"><p className="font-display text-[20px] font-semibold">{IDR.format(chosenStay.price)} total</p><button onClick={() => setShowStays((value) => !value)} className="text-[12px] font-semibold text-accent">{showStays ? "Hide alternatives" : "See other stays"}</button></div>
          {showStays && <div className="mt-4 grid gap-2 border-t border-hair-2 pt-4">{rankedStays.filter((item) => item.id !== chosenStay.id).map((item) => <button key={item.id} onClick={() => { setStayId(item.id); setShowStays(false); }} className="flex items-center justify-between gap-3 rounded-[14px] border border-hair bg-surface-2 px-4 py-3 text-left transition hover:border-ink/25"><span><span className="block text-[12.5px] font-semibold text-ink">{item.name}</span><span className="mt-0.5 block text-[11px] text-muted">{item.area} · {item.detail}</span></span><span className="shrink-0 text-[12px] font-semibold text-ink-soft">{IDR.format(item.price)}</span></button>)}</div>}
        </article>
      </section>

      <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[22px] bg-ink px-5 py-5 text-paper md:px-6"><div><p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/48">The combination</p><p className="mt-1 text-[13px] text-white/65">{chosenFlight.airline} + {chosenStay.name} · {travelers} traveler{travelers === 1 ? "" : "s"}</p></div><div className="flex items-center gap-4"><div className="text-right"><p className="text-[10.5px] text-white/48">Illustrative total</p><p className="font-display text-[25px] font-semibold">{IDR.format(total)}</p></div><Button variant="accent" onClick={() => setReviewing(true)}>Review these →</Button></div></section>

      <p className="mt-5 text-center text-[11.5px] text-faint">Prototype availability and prices are illustrative. The interaction is the thing being tested here.</p>
    </div>
  );
}
