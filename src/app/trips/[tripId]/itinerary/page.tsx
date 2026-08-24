"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ItineraryPlanner } from "@/components/itinerary-planner";

export default function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const searchParams = useSearchParams();
  const fromPeek = searchParams.get("handoff") === "otterway";

  return (
    <div>
      {fromPeek && (
        <div className="mx-auto mt-5 max-w-[1040px] px-5 md:px-8">
          <div className="rounded-[18px] border border-hair bg-surface px-4 py-3 shadow-[var(--shadow-card)] sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-faint">OtterWay · same trip, more control</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">Your destination, dates, travelers, bookings and flexible ideas came with you. Use OtterWay for detailed day planning, routes and collaboration.</p>
            </div>
            <span className="mt-2 inline-flex rounded-full bg-accent-tint px-3 py-1.5 text-[10.5px] font-semibold text-accent sm:mt-0">Trip context carried over</span>
          </div>
        </div>
      )}
      <ItineraryPlanner tripId={tripId} />
    </div>
  );
}
