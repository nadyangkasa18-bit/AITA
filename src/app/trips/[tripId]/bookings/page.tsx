"use client";

import { useParams } from "next/navigation";
import { TripHome } from "@/components/trip-home";

export default function BookingsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  return <TripHome tripId={tripId} />;
}
