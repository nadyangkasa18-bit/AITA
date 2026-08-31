"use client";

import { useParams } from "next/navigation";
import { FlightExplorerV2 } from "@/components/flight-explorer-v2";

export default function FlightsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  return <FlightExplorerV2 tripId={tripId} />;
}
