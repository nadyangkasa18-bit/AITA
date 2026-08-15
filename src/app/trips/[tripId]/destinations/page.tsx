"use client";

import { useParams } from "next/navigation";
import { useTrip, useStore } from "@/lib/store";
import { DestinationProposalCard, RuledOutSection } from "@/components/destinations";
import { PrototypeBadge, QuickReaction, useToast } from "@/components/ui";
import { quickReactions } from "@/lib/mock/seed";
import type { ProtectChoice } from "@/lib/types";

const PROTECT_COPY: Record<Exclude<ProtectChoice, null>, string> = {
  resort: "the best resort",
  journey: "the easiest journey",
  total: "the lowest total",
  flexible: "whatever I'd choose",
};

export default function DestinationsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, hydrated } = useTrip(tripId);
  const store = useStore();
  const { toast } = useToast();

  if (!hydrated || !trip) {
    return (
      <div className="grid gap-5">
        <div className="h-10 w-80 rounded-lg shimmer" />
        <div className="h-72 rounded-card shimmer" />
        <div className="h-72 rounded-card shimmer" />
      </div>
    );
  }

  const proposals = store.orderedProposals(trip.id);
  const applied = store.reactions[trip.id] ?? [];

  return (
    <div>
      <header className="mb-6 max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
            Three directions I&apos;d actually take you
          </p>
          <PrototypeBadge />
        </div>
        <h1 className="font-display text-4xl tracking-[-0.035em] md:text-5xl">Where I&apos;d go</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Not a page of results — a short, opinionated shortlist. One I&apos;d choose, one that&apos;s
          easier, and one wildcard.
          {trip.protect && trip.protect !== "flexible" && (
            <>
              {" "}
              I&apos;m protecting <span className="text-ink">{PROTECT_COPY[trip.protect]}</span>.
            </>
          )}
        </p>
      </header>

      {/* quick reactions */}
      <div className="mb-6 rounded-card border border-hair bg-surface-2 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[12.5px] font-semibold uppercase tracking-[0.1em] text-faint">
            React and I&apos;ll adjust
          </span>
          {applied.length > 0 && (
            <span className="text-[12px] text-accent">
              Refined by: {applied.slice(-3).join(", ")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {quickReactions.map((r) => (
            <QuickReaction key={r} label={r} onClick={() => toast(store.applyReaction(trip.id, r))} />
          ))}
        </div>
        <p className="mt-3 text-[12px] text-faint">
          Or tell me in your own words with the assistant, bottom-right.
        </p>
      </div>

      <div className="grid gap-6">
        {proposals.map((p, i) => (
          <DestinationProposalCard
            key={p.id}
            tripId={trip.id}
            proposal={p}
            featured={i === 0}
            saved={trip.savedProposalIds.includes(p.id)}
            onToggleSave={() => {
              store.toggleSaveProposal(trip.id, p.id);
              toast(
                trip.savedProposalIds.includes(p.id)
                  ? "Removed from saved"
                  : `Saved ${p.destination} to this trip`
              );
            }}
          />
        ))}
      </div>

      <div className="mt-6">
        <RuledOutSection items={trip.ruledOut} />
      </div>
    </div>
  );
}
