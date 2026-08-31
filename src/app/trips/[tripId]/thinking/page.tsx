"use client";

import { useParams } from "next/navigation";
import { TripThinkingScreen } from "@/components/trip-thinking-screen";

export default function TripThinkingPage() {
  const { tripId } = useParams<{ tripId: string }>();
  return <TripThinkingScreen tripId={tripId}/>;
}
