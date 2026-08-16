"use client";

import { useParams, useRouter } from "next/navigation";
import { useTrip, useStore } from "@/lib/store";
import { ProposalView } from "@/components/proposal";
import { RuledOutSection } from "@/components/destinations";
import { useToast } from "@/components/ui";

export default function DestinationsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, hydrated } = useTrip(tripId);
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();

  if (!hydrated || !trip) {
    return (
      <div>
        <div className="relative left-1/2 h-[56vh] w-screen -translate-x-1/2 shimmer" />
        <div className="mx-auto mt-8 h-12 w-64 rounded-lg shimmer" />
      </div>
    );
  }

  const list = trip.destinationProposals;
  const baseId = list[0]?.id;
  const featuredId = store.getFeaturedId(trip.id) ?? baseId;
  const featured = list.find((proposal) => proposal.id === featuredId) ?? list[0];
  const optionIndex = Math.max(0, list.findIndex((proposal) => proposal.id === featured.id));
  const saved = trip.savedProposalIds.includes(featured.id);

  const start = () => {
    store.buildTrip(trip.id, featured.id);
    toast(`Starting your ${featured.destination} trip…`);
    router.push(`/trips/${trip.id}/home`);
  };
  const saveIdea = () => {
    store.toggleSaveProposal(trip.id, featured.id);
    toast(saved ? "Removed from your trip ideas." : "Saved to your trip ideas.");
  };
  const showAnother = () => {
    const next = store.showAnother(trip.id);
    if (next) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast(`Direction ${((optionIndex + 1) % list.length) + 1} of ${list.length}: ${next.destination}.`);
    }
  };

  return (
    <div>
      <ProposalView
        proposal={featured}
        saved={saved}
        onSaveIdea={saveIdea}
        onPrimary={start}
        primaryLabel="Start with this trip"
        optionCount={list.length}
        optionIndex={optionIndex}
        eyebrowOverride={optionIndex === 0 ? undefined : `Alternative ${optionIndex + 1} of ${list.length}`}
        secondary={
          <button onClick={showAnother} className="px-3 py-2 text-[13px] font-semibold text-muted transition hover:text-ink">
            Show next direction
          </button>
        }
      />

      {optionIndex === 0 && trip.ruledOut.length > 0 && (
        <div className="mx-auto mt-8 max-w-[760px]">
          <RuledOutSection items={trip.ruledOut} />
        </div>
      )}
    </div>
  );
}
