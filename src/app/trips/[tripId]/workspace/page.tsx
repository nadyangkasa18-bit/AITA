"use client";

import { useParams } from "next/navigation";
import { CoworkWorkspaceV3 } from "@/components/cowork-workspace-v3";

export default function WorkspacePage() {
  const { tripId } = useParams<{ tripId: string }>();
  return <CoworkWorkspaceV3 tripId={tripId} />;
}
