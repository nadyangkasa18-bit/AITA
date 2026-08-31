"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BriefPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  useEffect(() => { router.replace(`/trips/${tripId}/workspace`); }, [router, tripId]);
  return <div className="mx-auto h-[55vh] max-w-[960px] rounded-[24px] shimmer" aria-label="Opening trip workspace" />;
}
