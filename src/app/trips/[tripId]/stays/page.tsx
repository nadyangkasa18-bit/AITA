"use client";

import { useParams } from "next/navigation";
import { StayExplorerV2 } from "@/components/stay-explorer-v2";

export default function StaysPage() {
  const { tripId } = useParams<{ tripId: string }>();
  return <StayExplorerV2 tripId={tripId} />;
}
