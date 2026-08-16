"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrip, useStore } from "@/lib/store";
import { ProposalView } from "@/components/proposal";
import { RuledOutSection } from "@/components/destinations";
import { Photo } from "@/components/photo";
import { Button, Eyebrow, useToast } from "@/components/ui";

const REFINEMENT_REASONS = [
  "Too expensive",
  "Too much travel time",
  "Hotels aren't special enough",
  "Wrong weather or season",
  "Too quiet",
  "Too busy",
  "Not surprising enough",
  "None feel like us",
];

export default function DestinationsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, hydrated } = useTrip(tripId);
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<"detail" | "compare">("detail");
  const [refining, setRefining] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);

  if (!hydrated || !trip) return <div><div className="relative left-1/2 h-[56vh] w-screen -translate-x-1/2 shimmer" /><div className="mx-auto mt-8 h-12 w-64 rounded-lg shimmer" /></div>;

  const list = trip.destinationProposals;
  const baseId = list[0]?.id;
  const featuredId = store.getFeaturedId(trip.id) ?? baseId;
  const featured = list.find((proposal) => proposal.id === featuredId) ?? list[0];
  const optionIndex = Math.max(0, list.findIndex((proposal) => proposal.id === featured.id));
  const saved = trip.savedProposalIds.includes(featured.id);

  const startWith = (proposalId: string) => {
    store.buildTrip(trip.id, proposalId);
    const proposal = list.find((item) => item.id === proposalId);
    toast(`Starting your ${proposal?.destination ?? "trip"}…`);
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

  const toggleReason = (reason: string) => setReasons((current) => current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]);

  const generateMore = () => {
    if (!reasons.length) return;
    setRefining(false);
    toast(`Got it — Roam would generate 3 new directions avoiding: ${reasons.slice(0, 2).join(", ")}${reasons.length > 2 ? "…" : ""}`);
    setReasons([]);
  };

  if (view === "compare") {
    return (
      <div className="mx-auto max-w-[1180px] pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><Eyebrow>Compare directions</Eyebrow><h1 className="mt-2 font-display text-[clamp(36px,5vw,54px)] font-semibold tracking-[-0.045em]">Three different ways this trip could work</h1><p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-muted">Compare the trade-offs first. Open a direction only when one feels worth a closer look.</p></div>
          <button onClick={() => setView("detail")} className="text-[13px] font-semibold text-muted hover:text-ink">Back to recommendation</button>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {list.map((proposal, index) => (
            <article key={proposal.id} className="overflow-hidden rounded-[22px] border border-hair bg-surface">
              <Photo image={proposal.heroImage} ratio="4/3" tone={proposal.heroTone} width={800} rounded="rounded-none" className="h-[210px] w-full !aspect-auto" />
              <div className="p-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">Direction {index + 1}</p>
                <h2 className="mt-2 font-display text-[28px] font-semibold tracking-[-0.035em]">{proposal.destination}</h2>
                <p className="mt-2 min-h-[62px] text-[13.5px] leading-relaxed text-muted">{proposal.thesis}</p>
                <dl className="mt-5 grid gap-3 border-y border-hair-2 py-4 text-[12.5px]">
                  <div className="flex justify-between gap-4"><dt className="text-faint">Total</dt><dd className="text-right font-semibold text-ink-soft">{proposal.indicativePrice}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-faint">Journey</dt><dd className="text-right font-semibold text-ink-soft">{proposal.journeyEffort}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-faint">Stay</dt><dd className="text-right font-semibold text-ink-soft">{proposal.stay.name}</dd></div>
                </dl>
                <div className="mt-4"><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Best reason to choose it</p><p className="mt-1.5 text-[13.5px] leading-snug text-ink-soft">{proposal.whyThisFits[0]}</p></div>
                <div className="mt-5 flex gap-2"><button onClick={() => router.push(`/trips/${trip.id}/destinations/${proposal.id}`)} className="flex-1 rounded-full border border-hair px-3 py-2.5 text-[12.5px] font-semibold">View details</button><Button size="sm" variant="ink" onClick={() => startWith(proposal.id)}>Choose</Button></div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center rounded-[22px] border border-dashed border-hair bg-surface-2 px-5 py-7 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">None of these quite right?</h2>
          <p className="mt-2 max-w-[52ch] text-[13.5px] leading-relaxed text-muted">Tell Roam what missed. That&apos;s more useful than asking you to start the search over.</p>
          <Button variant="ghost" className="mt-4" onClick={() => setRefining(true)}>Generate more directions</Button>
        </div>

        {refining && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-5 backdrop-blur-sm" onMouseDown={() => setRefining(false)}>
            <div className="w-full max-w-[560px] rounded-[24px] border border-hair bg-paper p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
              <Eyebrow>Help me adjust</Eyebrow><h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em]">What didn&apos;t work about these?</h2><p className="mt-2 text-[13.5px] leading-relaxed text-muted">Choose as many as apply. Roam will use this as feedback, not as permanent traveler preferences.</p>
              <div className="mt-5 flex flex-wrap gap-2">{REFINEMENT_REASONS.map((reason) => <button key={reason} onClick={() => toggleReason(reason)} className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${reasons.includes(reason) ? "border-ink bg-ink text-paper" : "border-hair bg-surface text-ink-soft hover:border-ink/35"}`}>{reason}</button>)}</div>
              <div className="mt-6 flex items-center justify-end gap-2"><button onClick={() => setRefining(false)} className="px-3 py-2 text-[13px] font-semibold text-muted">Cancel</button><Button variant="accent" disabled={!reasons.length} onClick={generateMore}>Generate 3 new directions</Button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto mb-4 flex max-w-[860px] justify-end"><button onClick={() => setView("compare")} className="rounded-full border border-hair bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:border-ink/30">Compare all 3 ↗</button></div>
      <ProposalView proposal={featured} saved={saved} onSaveIdea={saveIdea} onPrimary={() => startWith(featured.id)} primaryLabel="Start with this trip" optionCount={list.length} optionIndex={optionIndex} eyebrowOverride={optionIndex === 0 ? undefined : `Alternative ${optionIndex + 1} of ${list.length}`} secondary={<><button onClick={() => setView("compare")} className="px-3 py-2 text-[13px] font-semibold text-muted transition hover:text-ink">Compare all</button><button onClick={showAnother} className="px-3 py-2 text-[13px] font-semibold text-muted transition hover:text-ink">Show next direction</button></>} />
      {optionIndex === 0 && trip.ruledOut.length > 0 && <div className="mx-auto mt-8 max-w-[760px]"><RuledOutSection items={trip.ruledOut} /></div>}
    </div>
  );
}
