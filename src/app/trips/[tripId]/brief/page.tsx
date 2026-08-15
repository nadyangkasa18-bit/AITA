"use client";

import { useParams } from "next/navigation";
import { useTrip } from "@/lib/store";
import { TripBrief } from "@/components/brief";

export default function BriefPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, hydrated } = useTrip(tripId);

  if (!hydrated || !trip) {
    return (
      <div className="measure mx-auto grid gap-4">
        <div className="h-6 w-40 rounded-lg shimmer" />
        <div className="h-12 w-72 rounded-lg shimmer" />
        <div className="mt-4 h-64 rounded-card shimmer" />
      </div>
    );
  }

  return <TripBrief trip={trip} />;
}
