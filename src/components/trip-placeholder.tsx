"use client";

import { useParams } from "next/navigation";
import { PlaceholderPage } from "@/components/ui";

export function TripPlaceholder({
  eyebrow = "Coming next",
  title,
  body,
  bullets,
  back = "workspace",
  backLabel = "Back to workspace",
}: {
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
  back?: string;
  backLabel?: string;
}) {
  const { tripId } = useParams<{ tripId: string }>();
  return (
    <PlaceholderPage
      eyebrow={eyebrow}
      title={title}
      body={body}
      bullets={bullets}
      backHref={`/trips/${tripId}/${back}`}
      backLabel={backLabel}
    />
  );
}
