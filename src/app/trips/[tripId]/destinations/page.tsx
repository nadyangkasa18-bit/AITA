"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTrip, useStore } from "@/lib/store";
import { ProposalView } from "@/components/proposal";
import { RuledOutSection } from "@/components/destinations";
import { Photo } from "@/components/photo";
import { Button, Eyebrow, SidePanel, buttonClass, useToast } from "@/components/ui";

const DIRECTION_FEEDBACK = [
  "The destinations didn’t excite me",
  "Too expensive",
  "Too much travel time",
  "The hotels weren’t my style",
  "The weather or timing felt off",
  "Too similar to trips I’ve already done",
  "I want something more surprising",
  "I want something easier",
];

export default function DestinationsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, hydrated } = useTrip(tripId);
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<"single" | "compare">("single");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [regenerated, setRegenerated] = useState(false);

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

  const start = (proposalId = featured.id) => {
    const proposal = list.find((item) => item.id === proposalId) ?? featured;
    store.buildTrip(trip.id, proposal.id);
    toast(`Starting your ${proposal.destination} trip…`);
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

  const toggleFeedback = (reason: string) => {
    setFeedback((current) => current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]);
  };

  const regenerate = () => {
    if (feedback.length === 0 && !other.trim()) return;
    setFeedbackOpen(false);
    setRegenerated(true);
    setView("compare");
    toast("Got it — Roam would use this to generate the next set of directions.");
  };

  return (
    <div>
      <div className="mx-auto mb-6 flex max-w-[1180px] flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-hair bg-surface p-1">
          <button
            onClick={() => setView("single")}
            className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition ${view === "single" ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
          >
            One at a time
          </button>
          <button
            onClick={() => setView("compare")}
            className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition ${view === "compare" ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
          >
            Compare all {list.length}
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setFeedbackOpen(true)}>Generate more directions</Button>
      </div>

      {view === "single" ? (
        <>
          <ProposalView
            proposal={featured}
            saved={saved}
            onSaveIdea={saveIdea}
            onPrimary={() => start()}
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
        </>
      ) : (
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-[720px] text-center">
            <Eyebrow>Compare directions</Eyebrow>
            <h1 className="mt-2 font-display text-[clamp(32px,5vw,48px)] font-semibold tracking-[-0.04em]">Three genuinely different ways this trip could work</h1>
            <p className="mx-auto mt-3 max-w-[58ch] text-[15px] leading-relaxed text-muted">Compare the things that actually change the decision — journey, stay, weather, total and the main compromise.</p>
          </div>

          {regenerated && (
            <div className="mx-auto mt-6 max-w-[760px] rounded-[18px] border border-accent-line bg-accent-tint/35 px-4 py-3 text-center text-[13px] text-ink-soft">
              Feedback captured. In the live product, this is where Roam would replace these with a newly generated set rather than making you restart the search.
            </div>
          )}

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {list.map((proposal, index) => (
              <article key={proposal.id} className="overflow-hidden rounded-[22px] border border-hair bg-surface shadow-[var(--shadow-card)]">
                <Photo image={proposal.heroImage} ratio="wide" tone={proposal.heroTone} width={900} rounded="rounded-none" className="h-[180px] w-full !aspect-auto" />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Eyebrow>Direction {index + 1}</Eyebrow>
                    <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] font-semibold text-muted">{proposal.confidence === "strong" ? "Strong fit" : "Good fit"}</span>
                  </div>
                  <h2 className="mt-2 font-display text-[27px] font-semibold tracking-[-0.035em]">{proposal.destination}</h2>
                  <p className="mt-2 min-h-[62px] text-[13.5px] leading-relaxed text-muted">{proposal.thesis}</p>

                  <dl className="mt-5 divide-y divide-hair-2 border-y border-hair-2">
                    {[
                      ["Window", proposal.recommendedWindow],
                      ["Journey", proposal.flightTime],
                      ["Stay", proposal.stay.name],
                      ["Total", proposal.indicativePrice],
                    ].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[72px_1fr] gap-3 py-2.5 text-[12.5px]">
                        <dt className="font-semibold text-faint">{label}</dt>
                        <dd className="text-ink-soft">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 rounded-[14px] bg-surface-2 p-3.5">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">Main trade-off</p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{proposal.tradeoffs[0]}</p>
                  </div>

                  <div className="mt-5 grid gap-2">
                    <Button variant="ink" size="sm" onClick={() => start(proposal.id)}>Start with {proposal.destination}</Button>
                    <Link href={`/trips/${trip.id}/destinations/${proposal.id}`} className={buttonClass("ghost", "sm")}>See full direction →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <Button variant="ghost" onClick={() => setFeedbackOpen(true)}>None of these? Generate more directions</Button>
          </div>
        </div>
      )}

      <SidePanel open={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="What didn’t work about these?">
        <p className="text-[14.5px] leading-relaxed text-muted">Pick anything that felt off. Roam should use the rejection to narrow the next set, not make you repeat the brief.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {DIRECTION_FEEDBACK.map((reason) => {
            const selected = feedback.includes(reason);
            return (
              <button
                key={reason}
                onClick={() => toggleFeedback(reason)}
                aria-pressed={selected}
                className={`rounded-[14px] border p-3 text-left text-[13px] font-medium transition ${selected ? "border-accent bg-accent-tint text-accent" : "border-hair bg-surface text-ink-soft hover:border-ink/35"}`}
              >
                {reason}
              </button>
            );
          })}
        </div>
        <textarea
          value={other}
          onChange={(event) => setOther(event.target.value)}
          placeholder="Something else you want the next set to understand…"
          className="mt-3 min-h-24 w-full resize-none rounded-[14px] border border-hair bg-surface px-3.5 py-3 text-[13.5px] outline-none focus-visible:border-accent"
        />
        <Button variant="accent" className="mt-5 w-full" disabled={feedback.length === 0 && !other.trim()} onClick={regenerate}>Generate 3 new directions</Button>
      </SidePanel>
    </div>
  );
}
