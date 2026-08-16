"use client";

import { useParams } from "next/navigation";
import { ItineraryPlanner } from "@/components/itinerary-planner";

export default function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  return <ItineraryPlanner tripId={tripId} />;
}
