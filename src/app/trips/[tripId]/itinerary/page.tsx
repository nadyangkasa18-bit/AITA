"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ItineraryPlanner } from "@/components/itinerary-planner";

const OTTER_FEATURES = ["Collaborative itinerary", "Saved Instagram & TikTok places", "Collections", "Comments & voting", "Route planning", "Map", "Expenses", "Active-trip mode"];

export default function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const searchParams = useSearchParams();
  const fromHandoff = searchParams.get("handoff") === "otterway";

  return <div>
    {fromHandoff && <div className="mx-auto mt-5 max-w-[1040px] px-5 md:px-8"><section className="overflow-hidden rounded-[22px] border border-hair bg-ink text-paper shadow-[var(--shadow-card)]"><div className="p-5 sm:p-6"><p className="text-[10px] font-semibold uppercase tracking-[.13em] text-paper/55">OtterWay · same trip, more control</p><h1 className="mt-2 font-display text-[28px] font-semibold tracking-[-.035em]">Your trip came with you.</h1><p className="mt-2 max-w-[65ch] text-[12.5px] leading-relaxed text-paper/70">Destination, dates, travelers, fixed events, flight and stay choices, saved places, placeholders, and relevant trip preferences continue here without re-entry.</p><span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-paper/75">Prototype continuity · no live cross-app account connection</span></div><div className="grid gap-2 border-t border-white/10 bg-white/[.04] p-5 sm:grid-cols-4">{OTTER_FEATURES.map((feature) => <div key={feature} className="rounded-[11px] border border-white/10 px-3 py-2 text-[9.5px] text-paper/70">{feature}</div>)}</div></section></div>}
    <ItineraryPlanner tripId={tripId}/>
  </div>;
}
