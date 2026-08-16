"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Eyebrow, PrototypeBadge } from "@/components/ui";

const flights = [
  { id: "ana", airline: "ANA", route: "CGK → HND", time: "07:10 → 17:25", detail: "1 stop · 10h 15m · checked bag", price: "Rp 8.9m pp", fit: "Best overall" },
  { id: "sq", airline: "Singapore Airlines", route: "CGK → HND", time: "09:20 → 21:40", detail: "1 stop · 11h 20m · checked bag", price: "Rp 9.4m pp", fit: "Easier departure" },
];

const hotels = [
  { id: "ginza", name: "MUJI Hotel Ginza", area: "Ginza", detail: "Design-led · 3 nights · 4.8/5 fit", price: "Rp 11.6m total", fit: "I’d take this one" },
  { id: "shibuya", name: "Trunk Hotel Yoyogi Park", area: "Shibuya", detail: "More social · 3 nights · 4.6/5 fit", price: "Rp 13.8m total", fit: "More atmosphere" },
];

export default function BookingPlanPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  const [flight, setFlight] = useState("ana");
  const [hotel, setHotel] = useState("ginza");
  const [step, setStep] = useState<"choose" | "review">("choose");
  const chosenFlight = flights.find((item) => item.id === flight)!;
  const chosenHotel = hotels.find((item) => item.id === hotel)!;

  if (step === "review") {
    return (
      <div className="mx-auto max-w-[820px] pb-20">
        <button onClick={() => setStep("choose")} className="text-[13px] font-semibold text-muted hover:text-ink">← Change options</button>
        <div className="mt-8 flex items-center gap-3"><Eyebrow>Ready to book</Eyebrow><PrototypeBadge /></div>
        <h1 className="mt-3 font-display text-[clamp(38px,6vw,58px)] font-semibold leading-[0.98] tracking-[-0.045em]">Tokyo, without the inspiration detour.</h1>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted">You already gave Roam the destination, length and what you need. The job here is to help you choose the flight and hotel, not make you compare destinations you didn’t ask for.</p>
        <div className="mt-8 divide-y divide-hair rounded-[22px] border border-hair bg-surface px-5">
          <div className="grid gap-3 py-5 sm:grid-cols-[1fr_auto]"><div><Eyebrow>Flight</Eyebrow><h2 className="mt-1 font-display text-xl font-semibold">{chosenFlight.airline} · {chosenFlight.route}</h2><p className="mt-1 text-[13px] text-muted">{chosenFlight.time} · {chosenFlight.detail}</p></div><p className="font-display text-lg font-semibold">{chosenFlight.price}</p></div>
          <div className="grid gap-3 py-5 sm:grid-cols-[1fr_auto]"><div><Eyebrow>Hotel</Eyebrow><h2 className="mt-1 font-display text-xl font-semibold">{chosenHotel.name}</h2><p className="mt-1 text-[13px] text-muted">{chosenHotel.area} · {chosenHotel.detail}</p></div><p className="font-display text-lg font-semibold">{chosenHotel.price}</p></div>
        </div>
        <div className="mt-6 rounded-[18px] border border-accent-line bg-accent-tint/35 p-4 text-[13.5px] leading-relaxed text-ink-soft">Prototype behavior: the next real step would confirm traveler details, fare rules and live availability before any payment approval.</div>
        <div className="mt-6 flex justify-end"><Button variant="ink" onClick={() => router.push(`/trips/${tripId}/home`)}>Continue to booking →</Button></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[980px] pb-20">
      <div className="flex flex-wrap items-center gap-3"><Eyebrow>Booking plan</Eyebrow><span className="rounded-full bg-accent-tint px-2.5 py-1 text-[11px] font-semibold text-accent">Tokyo · 3 nights</span><PrototypeBadge /></div>
      <h1 className="mt-3 font-display text-[clamp(38px,6vw,58px)] font-semibold leading-[0.98] tracking-[-0.045em]">You know where you&apos;re going. I&apos;ll narrow down the booking.</h1>
      <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted">No destination shortlist. Roam has gone straight to the two decisions you asked for: a sensible flight and a hotel that fits how you like to travel.</p>

      <section className="mt-9"><div className="flex items-end justify-between"><div><Eyebrow>1 · Flight</Eyebrow><h2 className="mt-1 font-display text-2xl font-semibold">Pick the journey</h2></div><span className="text-[12px] text-faint">2 strong options, not 200 results</span></div><div className="mt-4 grid gap-3 md:grid-cols-2">{flights.map((item) => <button key={item.id} onClick={() => setFlight(item.id)} className={`rounded-[20px] border p-5 text-left transition ${flight === item.id ? "border-ink bg-surface shadow-[var(--shadow-card)]" : "border-hair bg-surface-2 hover:border-ink/25"}`}><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] font-semibold text-muted">{item.fit}</span>{flight === item.id && <span className="text-[12px] font-semibold text-accent">Selected ✓</span>}</div><h3 className="mt-4 font-display text-xl font-semibold">{item.airline}</h3><p className="mt-1 text-[14px] font-medium text-ink-soft">{item.route} · {item.time}</p><p className="mt-2 text-[12.5px] text-muted">{item.detail}</p><p className="mt-4 font-display text-lg font-semibold">{item.price}</p></button>)}</div></section>

      <section className="mt-9"><div className="flex items-end justify-between"><div><Eyebrow>2 · Hotel</Eyebrow><h2 className="mt-1 font-display text-2xl font-semibold">Choose where to stay</h2></div><span className="text-[12px] text-faint">Both fit your 3-night trip</span></div><div className="mt-4 grid gap-3 md:grid-cols-2">{hotels.map((item) => <button key={item.id} onClick={() => setHotel(item.id)} className={`rounded-[20px] border p-5 text-left transition ${hotel === item.id ? "border-ink bg-surface shadow-[var(--shadow-card)]" : "border-hair bg-surface-2 hover:border-ink/25"}`}><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] font-semibold text-muted">{item.fit}</span>{hotel === item.id && <span className="text-[12px] font-semibold text-accent">Selected ✓</span>}</div><h3 className="mt-4 font-display text-xl font-semibold">{item.name}</h3><p className="mt-1 text-[14px] font-medium text-ink-soft">{item.area}</p><p className="mt-2 text-[12.5px] text-muted">{item.detail}</p><p className="mt-4 font-display text-lg font-semibold">{item.price}</p></button>)}</div></section>

      <div className="mt-8 flex justify-end"><Button variant="accent" onClick={() => setStep("review")}>Review booking plan →</Button></div>
    </div>
  );
}
