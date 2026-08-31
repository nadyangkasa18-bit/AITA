"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Orb } from "@/components/ui";
import { useTrip } from "@/lib/store";
import { tripDestination } from "@/lib/cowork";

const STEPS = [
  { label: "Understanding the trip you described", source: "Trip brief" },
  { label: "Checking your Traveler Profile against this trip", source: "Traveler Profile" },
  { label: "Screening relevant flight and hotel options", source: "Prototype inventory" },
  { label: "Screening relevant sources", source: "Recommendation sources" },
  { label: "Checking current sources online", source: "Prototype source scan" },
  { label: "Cross-referencing timing, location, and logistics", source: "Trip context" },
  { label: "Building the first recommendation", source: "RoaminRabbit" },
] as const;

export function TripThinkingScreen({ tripId }: { tripId: string }) {
  const { trip, hydrated } = useTrip(tripId);
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const destinationOpen = useMemo(() => trip ? tripDestination(trip) === "Destination open" : false, [trip]);

  useEffect(() => {
    if (!hydrated || !trip) return;
    const interval = window.setInterval(() => setProgress((value) => Math.min(STEPS.length, value + 1)), 620);
    return () => window.clearInterval(interval);
  }, [hydrated, trip]);

  useEffect(() => {
    if (!hydrated || !trip || progress < STEPS.length) return;
    const timeout = window.setTimeout(() => {
      router.replace(destinationOpen ? `/trips/${trip.id}/destinations` : `/trips/${trip.id}/workspace`);
    }, 850);
    return () => window.clearTimeout(timeout);
  }, [destinationOpen, hydrated, progress, router, trip]);

  if (!hydrated || !trip) return <div className="mx-auto h-[72dvh] max-w-[900px] rounded-[28px] shimmer"/>;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-76px)] max-w-[1080px] items-center px-5 py-10 md:px-8">
      <section className="grid w-full overflow-hidden rounded-[30px] border border-hair bg-[rgba(249,247,241,.82)] shadow-[0_28px_90px_-58px_rgba(27,26,23,.5)] backdrop-blur-xl lg:grid-cols-[.86fr_1.14fr]">
        <div className="relative flex min-h-[380px] flex-col justify-between overflow-hidden border-b border-hair-2 p-7 lg:min-h-[580px] lg:border-b-0 lg:border-r lg:p-9">
          <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(rgba(35,34,31,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(35,34,31,.045) 1px,transparent 1px)", backgroundSize: "34px 34px" }}/>
          <div className="relative">
            <div className="flex items-center gap-3"><Orb size={36}/><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-faint">RoaminRabbit is working</p></div>
            <h1 className="mt-7 max-w-[9ch] font-display text-[clamp(40px,5.4vw,66px)] font-semibold leading-[.95] tracking-[-.05em]">Thinking across the whole trip.</h1>
            <p className="mt-5 max-w-[42ch] text-[13px] leading-relaxed text-muted">Before showing options, I’m cross-checking the trip context instead of simply narrowing a search result list.</p>
          </div>
          <div className="relative mt-8"><div className="h-1 overflow-hidden rounded-full bg-black/[.06]"><div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${Math.max(8, (progress / STEPS.length) * 100)}%` }}/></div><p className="mt-3 text-[9.5px] leading-relaxed text-faint">Visible work progress, not private chain-of-thought. Live integrations are labeled when they exist; source and inventory checks here are prototype behavior.</p></div>
        </div>

        <div className="p-6 sm:p-8 lg:p-9">
          <p className="text-[9.5px] font-semibold uppercase tracking-[.13em] text-faint">What I’m checking</p>
          <div className="mt-5 space-y-2">
            {STEPS.map((step, index) => {
              const done = index < progress;
              const active = index === progress && progress < STEPS.length;
              return <div key={step.label} className={`grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-[15px] border px-3.5 py-3.5 transition-all duration-300 ${done ? "border-[#d4e0d6] bg-[#f1f6f1]" : active ? "border-accent-line bg-accent-tint/45 shadow-[0_12px_32px_-26px_rgba(65,61,150,.45)]" : "border-transparent bg-white/42 opacity-48"}`}>
                <span className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold ${done ? "bg-[#5f8d68] text-white" : active ? "bg-ink text-paper" : "border border-hair bg-white text-faint"}`}>{done ? "✓" : active ? "…" : ""}</span>
                <div><p className="text-[11.5px] font-semibold text-ink">{step.label}</p><p className="mt-0.5 text-[9px] text-faint">{step.source}</p></div>
                <span className="text-[8px] font-semibold uppercase tracking-[.08em] text-faint">{done ? "Done" : active ? "Checking" : "Waiting"}</span>
              </div>;
            })}
          </div>
          {progress === STEPS.length && <div className="mt-5 rounded-[15px] border border-[#cfe0d1] bg-[#edf5ee] px-4 py-3 text-[10.5px] font-semibold text-[#3f6849]">Recommendation context is ready. Opening your trip…</div>}
        </div>
      </section>
    </div>
  );
}
