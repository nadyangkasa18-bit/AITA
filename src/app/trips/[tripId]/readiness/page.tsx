"use client";

import { useParams } from "next/navigation";
import { TripHome } from "@/components/trip-home";

export default function ReadinessPage() {
  const { tripId } = useParams<{ tripId: string }>();
  return <TripHome tripId={tripId} />;
}
