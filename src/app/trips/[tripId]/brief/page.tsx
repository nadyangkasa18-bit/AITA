"use client";

import { useParams } from "next/navigation";
import { CoworkWorkspace } from "@/components/cowork-workspace";

export default function BriefPage() {
  const { tripId } = useParams<{ tripId: string }>();
  return <CoworkWorkspace tripId={tripId} />;
}
