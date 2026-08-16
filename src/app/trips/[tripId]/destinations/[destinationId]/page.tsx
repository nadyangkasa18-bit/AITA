"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTrip, useStore } from "@/lib/store";
import { ProposalView } from "@/components/proposal";
import { buttonClass, EmptyState, useToast } from "@/components/ui";

export default function DestinationDetailPage() {
  const { tripId, destinationId } = useParams<{ tripId: string; destinationId: string }>();
  const { trip, hydrated } = useTrip(tripId);
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();

  if (!hydrated || !trip) {
    return <div className="h-[60vh] rounded-card shimmer" />;
  }

  const proposal = trip.destinationProposals.find((p) => p.id === destinationId);
  if (!proposal) {
    return (
      <EmptyState
        title="That trip concept isn't here"
        body="It may have been replaced. Head back to your trip concepts."
        action={
          <Link href={`/trips/${tripId}/destinations`} className={buttonClass("ink", "sm")}>
            Back to trip concepts
          </Link>
        }
      />
    );
  }

  const saved = trip.savedProposalIds.includes(proposal.id);

  return (
    <div>
      <div className="measure mb-5">
        <Link
          href={`/trips/${tripId}/destinations`}
          className="text-[13px] font-medium text-muted transition hover:text-ink"
        >
          ← Back to trip concepts
        </Link>
      </div>
      <ProposalView
        proposal={proposal}
        saved={saved}
        onSaveIdea={() => {
          store.toggleSaveProposal(trip.id, proposal.id);
          toast(saved ? "Removed from your trip ideas." : "Saved to your trip ideas.");
        }}
        onPrimary={() => {
          store.buildTrip(trip.id, proposal.id);
          toast(`Starting your ${proposal.destination} trip…`);
          router.push(`/trips/${trip.id}/home`);
        }}
        primaryLabel="Start with this trip"
        secondary={
          <Link
            href={`/trips/${tripId}/destinations`}
            className="text-[13px] font-medium text-muted transition hover:text-ink"
          >
            See other trip concepts
          </Link>
        }
      />
    </div>
  );
}
