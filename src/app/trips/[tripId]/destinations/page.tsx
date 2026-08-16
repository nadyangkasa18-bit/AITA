"use client";

import { useParams, useRouter } from "next/navigation";
import { useTrip, useStore } from "@/lib/store";
import { ProposalView } from "@/components/proposal";
import { RuledOutSection } from "@/components/destinations";
import { Eyebrow, TradeoffNote, useToast } from "@/components/ui";
import type { DestinationProposal } from "@/lib/types";

const UPSIDE: Record<string, string> = {
  easier: "More convenient, and a little cheaper",
  wildcard: "More distinctive, with the best resort of the three",
  top: "The most complete fit for your brief",
};

function differences(alt: DestinationProposal): string[] {
  return [UPSIDE[alt.recommendationType], ...alt.tradeoffs].slice(0, 3);
}

export default function DestinationsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, hydrated } = useTrip(tripId);
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();

  if (!hydrated || !trip) {
    return (
      <div>
        <div className="h-[52vh] rounded-card shimmer" />
        <div className="measure mt-8 grid gap-4">
          <div className="h-12 w-64 rounded-lg shimmer" />
          <div className="h-6 w-full rounded-lg shimmer" />
        </div>
      </div>
    );
  }

  const list = trip.destinationProposals;
  const baseId = list[0]?.id;
  const featuredId = store.getFeaturedId(trip.id) ?? baseId;
  const featured = list.find((p) => p.id === featuredId) ?? list[0];
  const base = list[0];
  const isChallenger = featured.id !== baseId;
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
    if (next) toast(`Here's another direction — ${next.destination}.`);
  };
  const backToFirst = () => {
    store.resetFeatured(trip.id);
    toast(`Back to ${base.destination}.`);
  };

  const secondary = isChallenger ? (
    <button
      onClick={backToFirst}
      className="text-[13px] font-medium text-muted transition hover:text-ink"
    >
      Back to my first recommendation
    </button>
  ) : (
    <button
      onClick={showAnother}
      className="text-[13px] font-medium text-muted transition hover:text-ink"
    >
      Show me another
    </button>
  );

  return (
    <div>
      {isChallenger && (
        <div className="measure mb-6 rounded-card border border-hair bg-surface-2 p-5">
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Compared to {base.destination}</Eyebrow>
            <button
              onClick={backToFirst}
              className="text-[13px] font-medium text-accent transition hover:text-accent-press"
            >
              ← Back to my first recommendation
            </button>
          </div>
          <div className="mt-3 grid gap-2">
            {differences(featured).map((d, i) =>
              i === 0 ? (
                <p key={d} className="flex items-start gap-2 text-[15px] text-ink-soft">
                  <span aria-hidden className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {d}
                </p>
              ) : (
                <TradeoffNote key={d}>{d}</TradeoffNote>
              )
            )}
          </div>
        </div>
      )}

      <ProposalView
        proposal={featured}
        saved={saved}
        onSaveIdea={saveIdea}
        onPrimary={start}
        primaryLabel="Start with this trip"
        secondary={secondary}
        eyebrowOverride={isChallenger ? "The alternative" : undefined}
      />

      {!isChallenger && (
        <div className="measure mt-8">
          <RuledOutSection items={trip.ruledOut} />
        </div>
      )}
    </div>
  );
}
