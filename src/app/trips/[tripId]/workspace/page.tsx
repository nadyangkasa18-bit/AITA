"use client";

import { useParams } from "next/navigation";
import { CoworkWorkspaceStakeholder } from "@/components/cowork-workspace-stakeholder";

export default function WorkspacePage() {
  const { tripId } = useParams<{ tripId: string }>();
  return <CoworkWorkspaceStakeholder tripId={tripId} />;
}
