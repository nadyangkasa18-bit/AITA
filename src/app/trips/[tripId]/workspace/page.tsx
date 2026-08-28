"use client";

import { useParams } from "next/navigation";
import { CoworkWorkspaceV2 } from "@/components/cowork-workspace-v2";

export default function WorkspacePage() {
  const { tripId } = useParams<{ tripId: string }>();
  return <CoworkWorkspaceV2 tripId={tripId} />;
}
