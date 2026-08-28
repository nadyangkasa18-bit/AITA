"use client";

import { useParams, useSearchParams } from "next/navigation";
import { OtterWayItineraryV2 } from "@/components/otterway-itinerary-v2";

export default function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const searchParams = useSearchParams();
  const fromHandoff = searchParams.get("handoff") === "otterway";
  return <OtterWayItineraryV2 tripId={tripId} fromHandoff={fromHandoff} />;
}
