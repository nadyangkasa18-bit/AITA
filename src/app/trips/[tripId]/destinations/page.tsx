"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrip, useStore } from "@/lib/store";
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

type DeckAnimation = "next" | "prev" | null;

const DECK_TRANSITION = "420ms cubic-bezier(0.22, 1, 0.36, 1)";

function baseDeckTransform(position: number) {
  if (position === 1) return "translate3d(8px, 12px, 0) rotate(0.55deg) scale(0.985)";
  if (position === 2) return "translate3d(-8px, 24px, 0) rotate(-0.55deg) scale(0.97)";
  return "translate3d(0, 0, 0) rotate(0deg) scale(1)";
}

export default function DestinationsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, hydrated } = useTrip(tripId);
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<"detail" | "compare">("detail");
  const [refining, setRefining] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [deckOrder, setDeckOrder] = useState<string[]>([]);
  const [animation, setAnimation] = useState<DeckAnimation>(null);
  const [dragX, setDragX] = useState(0);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const proposalKey = trip?.destinationProposals.map((proposal) => proposal.id).join("|") ?? "";

  useEffect(() => {
    if (!trip) return;
    const ids = trip.destinationProposals.map((proposal) => proposal.id);
    setDeckOrder((current) => {
      if (current.length === ids.length && current.every((id) => ids.includes(id))) return current;
      return ids;
    });
  }, [trip, proposalKey]);

  useEffect(() => () => {
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
  }, []);

  if (!hydrated || !trip) return <div><div className="relative left-1/2 h-[56vh] w-screen -translate-x-1/2 shimmer" /><div className="mx-auto mt-8 h-12 w-64 rounded-lg shimmer" /></div>;

  const list = trip.destinationProposals;
  const effectiveOrder = deckOrder.length ? deckOrder : list.map((proposal) => proposal.id);
  const visibleDeck = effectiveOrder.slice(0, Math.min(3, effectiveOrder.length)).map((id) => list.find((proposal) => proposal.id === id)).filter(Boolean) as typeof list;
  const featured = visibleDeck[0] ?? list[0];
  const featuredIndex = list.findIndex((proposal) => proposal.id === featured.id);
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

  const finishDeckAnimation = (mode: Exclude<DeckAnimation, null>) => {
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    animationTimerRef.current = setTimeout(() => {
      setDeckOrder((current) => {
        if (current.length < 2) return current;
        if (mode === "next") return [...current.slice(1), current[0]];
        return [current[current.length - 1], ...current.slice(0, -1)];
      });
      setAnimation(null);
      setDragX(0);
    }, 420);
  };

  const moveDeck = (mode: Exclude<DeckAnimation, null>) => {
    if (animation || effectiveOrder.length < 2) return;
    setAnimation(mode);
    setDragX(0);
    finishDeckAnimation(mode);
  };

  const showConcept = (proposalId: string) => {
    if (proposalId === featured.id || animation) return;
    const position = effectiveOrder.indexOf(proposalId);
    if (position === 1) moveDeck("next");
    else if (position === effectiveOrder.length - 1) moveDeck("prev");
    else setDeckOrder([proposalId, ...effectiveOrder.filter((id) => id !== proposalId)]);
  };

  const onDeckPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (animation) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("button, a")) return;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onDeckPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || animation) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) return;
    setDragX(Math.max(-150, Math.min(150, dx)));
  };

  const onDeckPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current) {
      try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* no-op */ }
    }
    dragStartRef.current = null;
    if (Math.abs(dragX) >= 64) moveDeck(dragX < 0 ? "next" : "prev");
    else setDragX(0);
  };

  const toggleReason = (reason: string) => setReasons((current) => current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]);

  const generateMore = () => {
    if (!reasons.length) return;
    const preferredId = reasons.some((reason) => reason.includes("expensive") || reason.includes("travel time") || reason.includes("busy"))
      ? "perth"
      : reasons.some((reason) => reason.includes("Hotels") || reason.includes("surprising") || reason.includes("quiet"))
        ? "queenstown"
        : effectiveOrder.find((id) => id !== featured.id);
    if (preferredId && effectiveOrder.includes(preferredId)) {
      setDeckOrder([preferredId, ...effectiveOrder.filter((id) => id !== preferredId)]);
    }
    store.patchTrip(trip.id, { learnings: [...trip.learnings, ...reasons] });
    setRefining(false);
    toast("Recommendations updated for this trip.");
    setReasons([]);
  };

  const RefinementModal = refining ? (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-5 backdrop-blur-sm" onMouseDown={() => setRefining(false)}>
      <div className="w-full max-w-[560px] rounded-[24px] border border-hair bg-paper p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <Eyebrow>Help me adjust</Eyebrow>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em]">What didn&apos;t work about these?</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">Choose as many as apply. We&apos;ll update this trip now without turning the feedback into a permanent preference.</p>
        <div className="mt-5 flex flex-wrap gap-2">{REFINEMENT_REASONS.map((reason) => <button key={reason} onClick={() => toggleReason(reason)} className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${reasons.includes(reason) ? "border-ink bg-ink text-paper" : "border-hair bg-surface text-ink-soft hover:border-ink/35"}`}>{reason}</button>)}</div>
        <div className="mt-6 flex items-center justify-end gap-2"><button onClick={() => setRefining(false)} className="px-3 py-2 text-[13px] font-semibold text-muted">Cancel</button><Button variant="accent" disabled={!reasons.length} onClick={generateMore}>Update recommendations</Button></div>
      </div>
    </div>
  ) : null;

  if (view === "compare") {
    return (
      <div className="mx-auto max-w-[1180px] pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><Eyebrow>Compare trip concepts</Eyebrow><h1 className="mt-2 font-display text-[clamp(36px,5vw,54px)] font-semibold tracking-[-0.045em]">Three different ways this trip could take shape</h1><p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-muted">Compare the trade-offs first. Open a concept only when one feels worth a closer look.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="ghost" size="sm" onClick={() => setRefining(true)}>Generate more concepts</Button><button onClick={() => setView("detail")} className="rounded-full border border-hair bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:border-ink/30">Back to concepts</button></div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {list.map((proposal, index) => (
            <article key={proposal.id} className="overflow-hidden rounded-[22px] border border-hair bg-surface">
              <Photo image={proposal.heroImage} ratio="4/3" tone={proposal.heroTone} width={800} rounded="rounded-none" className="h-[210px] w-full !aspect-auto" />
              <div className="p-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">Concept {index + 1}</p>
                <h2 className="mt-2 font-display text-[28px] font-semibold tracking-[-0.035em]">{proposal.destination}</h2>
                <p className="mt-2 min-h-[62px] text-[13.5px] leading-relaxed text-muted">{proposal.thesis}</p>
                <dl className="mt-5 grid gap-3 border-y border-hair-2 py-4 text-[12.5px]">
                  <div className="flex justify-between gap-4"><dt className="text-faint">Total</dt><dd className="text-right font-semibold text-ink-soft">{proposal.indicativePrice}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-faint">Journey</dt><dd className="text-right font-semibold text-ink-soft">{proposal.journeyEffort}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-faint">Stay</dt><dd className="text-right font-semibold text-ink-soft">{proposal.stay.name}</dd></div>
                </dl>
                <div className="mt-4"><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Best reason to choose it</p><p className="mt-1.5 text-[13.5px] leading-snug text-ink-soft">{proposal.whyThisFits[0]}</p></div>
                <div className="mt-5 flex gap-2"><button onClick={() => router.push(`/trips/${trip.id}/destinations/${proposal.id}`)} className="flex-1 rounded-full border border-hair px-3 py-2.5 text-[12.5px] font-semibold">Review concept</button><Button size="sm" variant="ink" onClick={() => startWith(proposal.id)}>Choose</Button></div>
              </div>
            </article>
          ))}
        </div>
        {RefinementModal}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Trip concepts</Eyebrow>
          <h1 className="mt-2 font-display text-[clamp(36px,5vw,52px)] font-semibold tracking-[-0.045em]">A few ways this trip could take shape</h1>
          <p className="mt-3 max-w-[60ch] text-[14.5px] leading-relaxed text-muted">These are starting concepts, not final itineraries. Swipe through the deck, compare the trade-offs, then open one when it feels promising.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setView("compare")} className="rounded-full border border-hair bg-surface px-4 py-2.5 text-[12.5px] font-semibold text-ink-soft transition hover:border-ink/30">Compare all 3</button>
          <button onClick={() => setRefining(true)} className="rounded-full border border-hair bg-surface px-4 py-2.5 text-[12.5px] font-semibold text-ink-soft transition hover:border-ink/30">Generate more concepts</button>
        </div>
      </div>

      <section className="relative mx-auto mt-9 max-w-[920px] px-10 pb-8 md:px-16">
        <button onClick={() => moveDeck("prev")} disabled={Boolean(animation)} aria-label="Previous trip concept" className="absolute left-0 top-[46%] z-50 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-hair bg-surface text-xl shadow-[0_12px_32px_-18px_rgba(27,26,23,0.55)] transition hover:border-ink/30 hover:-translate-x-0.5 disabled:opacity-45">←</button>
        <button onClick={() => moveDeck("next")} disabled={Boolean(animation)} aria-label="Next trip concept" className="absolute right-0 top-[46%] z-50 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-hair bg-surface text-xl shadow-[0_12px_32px_-18px_rgba(27,26,23,0.55)] transition hover:border-ink/30 hover:translate-x-0.5 disabled:opacity-45">→</button>

        <div
          className="grid select-none touch-pan-y"
          onPointerDown={onDeckPointerDown}
          onPointerMove={onDeckPointerMove}
          onPointerUp={onDeckPointerEnd}
          onPointerCancel={onDeckPointerEnd}
        >
          {visibleDeck.map((proposal, position) => {
            const isFront = position === 0;
            const dragProgress = isFront ? Math.min(1, Math.abs(dragX) / 130) : 0;
            let transform = baseDeckTransform(position);
            let zIndex = 30 - position * 10;
            let opacity = position === 0 ? 1 : position === 1 ? 0.97 : 0.93;

            if (!animation && isFront && dragX) {
              transform = `translate3d(${dragX}px, 0, 0) rotate(${dragX / 34}deg) scale(${1 - dragProgress * 0.008})`;
              zIndex = 40;
            } else if (!animation && position === 1 && dragX) {
              transform = `translate3d(${8 - dragProgress * 8}px, ${12 - dragProgress * 12}px, 0) rotate(${0.55 - dragProgress * 0.55}deg) scale(${0.985 + dragProgress * 0.015})`;
            } else if (animation === "next") {
              if (position === 0) {
                transform = "translate3d(-118%, -8px, 0) rotate(-8deg) scale(0.985)";
                zIndex = 50;
                opacity = 0.22;
              } else if (position === 1) {
                transform = baseDeckTransform(0);
                zIndex = 30;
                opacity = 1;
              } else if (position === 2) {
                transform = baseDeckTransform(1);
                zIndex = 20;
                opacity = 0.97;
              }
            } else if (animation === "prev") {
              if (position === 0) {
                transform = baseDeckTransform(1);
                zIndex = 20;
                opacity = 0.97;
              } else if (position === 1) {
                transform = baseDeckTransform(2);
                zIndex = 10;
                opacity = 0.93;
              } else if (position === 2) {
                transform = baseDeckTransform(0);
                zIndex = 40;
                opacity = 1;
              }
            }

            return (
              <article
                key={proposal.id}
                className="[grid-area:1/1] overflow-hidden rounded-[28px] border border-[rgba(27,26,23,0.1)] bg-surface shadow-[0_30px_70px_-38px_rgba(27,26,23,0.48),0_10px_28px_-20px_rgba(27,26,23,0.32)] will-change-transform"
                style={{
                  transform,
                  zIndex,
                  opacity,
                  transition: dragX && !animation ? "none" : `transform ${DECK_TRANSITION}, opacity 300ms ease, box-shadow ${DECK_TRANSITION}`,
                  pointerEvents: isFront && !animation ? "auto" : "none",
                }}
                aria-hidden={!isFront}
              >
                <div className="relative">
                  <Photo image={proposal.heroImage} ratio="hero" tone={proposal.heroTone} width={1400} rounded="rounded-none" priority={isFront} className="h-[330px] w-full !aspect-auto md:h-[390px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/68">Concept {list.findIndex((item) => item.id === proposal.id) + 1} of {list.length} · {proposal.region}</p>
                    <h2 className="mt-2 font-display text-[clamp(38px,6vw,62px)] font-semibold leading-[0.96] tracking-[-0.05em]">{proposal.destination}</h2>
                    <p className="mt-3 max-w-[58ch] text-[14px] leading-relaxed text-white/78">{proposal.thesis}</p>
                  </div>
                </div>

                <div className="p-5 md:p-7">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[["Best window", proposal.recommendedWindow], ["Approx. total", proposal.indicativePrice], ["Journey", proposal.journeyEffort], ["Stay", proposal.stay.name]].map(([label, value]) => <div key={label} className="rounded-[16px] bg-surface-2 p-3.5"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">{label}</p><p className="mt-1.5 text-[13px] font-semibold leading-snug text-ink-soft">{value}</p></div>)}
                  </div>
                  <div className="mt-6 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
                    <div><Eyebrow>Why it made the cut</Eyebrow><p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">{proposal.whyThisFits[0]} {proposal.tradeoffs[0] ? `Trade-off: ${proposal.tradeoffs[0]}` : ""}</p></div>
                    <div className="flex flex-wrap gap-2"><button onClick={saveIdea} className="rounded-full border border-hair px-4 py-2.5 text-[12.5px] font-semibold text-ink-soft">{saved ? "Saved ✓" : "Save idea"}</button><button onClick={() => router.push(`/trips/${trip.id}/destinations/${proposal.id}`)} className="rounded-full border border-ink bg-surface px-4 py-2.5 text-[12.5px] font-semibold text-ink">Review concept</button><Button size="sm" variant="ink" onClick={() => startWith(proposal.id)}>Start with this trip</Button></div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center gap-2" aria-label="Trip concept position">{list.map((proposal, index) => <button key={proposal.id} onClick={() => showConcept(proposal.id)} aria-label={`Show trip concept ${index + 1}`} className={`h-1.5 rounded-full transition-all ${featured.id === proposal.id ? "w-8 bg-ink" : "w-3 bg-hair"}`} />)}</div>
        <p className="mt-3 text-center text-[11.5px] text-faint">Swipe the top card or use the arrows to move through the deck.</p>
      </section>

      {featuredIndex === 0 && trip.ruledOut.length > 0 && <div className="mx-auto mt-8 max-w-[760px]"><RuledOutSection items={trip.ruledOut} /></div>}
      {RefinementModal}
    </div>
  );
}
