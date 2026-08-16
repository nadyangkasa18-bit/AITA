"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { DestinationProposal } from "@/lib/types";
import { Photo } from "@/components/photo";
import { Button, Disclosure, Eyebrow, PrototypeBadge } from "@/components/ui";
import { StickyAction } from "@/components/sticky-action";

const RECO_EYEBROW: Record<string, string> = {
  top: "The one I'd choose for you",
  easier: "The easier alternative",
  wildcard: "The wildcard",
};

type ProposalTab = "stay" | "flight" | "things" | "addons";

const TABS: { id: ProposalTab; label: string }[] = [
  { id: "stay", label: "Stay" },
  { id: "flight", label: "Flights" },
  { id: "things", label: "Things to do" },
  { id: "addons", label: "Add-ons" },
];

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative whitespace-nowrap px-1 py-4 text-[13.5px] font-semibold transition ${active ? "text-ink" : "text-muted hover:text-ink"}`}
    >
      {children}
      {active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-ink" />}
    </button>
  );
}

export function ProposalView({
  proposal,
  saved,
  onSaveIdea,
  onPrimary,
  primaryLabel,
  secondary,
  eyebrowOverride,
  optionCount = 1,
  optionIndex = 0,
}: {
  proposal: DestinationProposal;
  saved: boolean;
  onSaveIdea: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  secondary?: ReactNode;
  eyebrowOverride?: string;
  optionCount?: number;
  optionIndex?: number;
}) {
  const [activeTab, setActiveTab] = useState<ProposalTab>("stay");
  const [compactHero, setCompactHero] = useState(false);
  const eyebrow = eyebrowOverride ?? RECO_EYEBROW[proposal.recommendationType];

  useEffect(() => {
    const onScroll = () => setCompactHero(window.scrollY > 110);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <article className="pb-6">
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-ink text-white">
        <Photo
          image={proposal.heroImage}
          ratio="hero"
          tone={proposal.heroTone}
          width={2000}
          rounded="rounded-none"
          priority
          className={`w-full !aspect-auto opacity-75 transition-[height] duration-500 [transition-timing-function:var(--ease-out)] ${compactHero ? "h-[34vh] min-h-[280px]" : "h-[58vh] min-h-[430px] max-h-[680px]"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,.82)] via-[rgba(8,8,8,.22)] to-[rgba(8,8,8,.08)]" />
        <div className="absolute inset-0 flex items-end justify-center px-5 pb-8 text-center md:pb-11">
          <div className="max-w-[760px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">{eyebrow} · {proposal.region}</p>
            <h1 className="mt-3 font-display text-[clamp(42px,7vw,76px)] font-semibold leading-[0.94] tracking-[-0.055em]">{proposal.destination}</h1>
            <p className="mx-auto mt-4 max-w-[52ch] text-[16px] leading-relaxed text-white/78">{proposal.thesis}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[860px] py-7 text-center">
        <div className="flex flex-wrap justify-center gap-x-7 gap-y-3">
          {[
            ["Best window", proposal.recommendedWindow],
            ["Approx. total", proposal.indicativePrice],
            ["Journey", proposal.journeyEffort],
            ["Getting around", proposal.mobilityFit],
          ].map(([label, value]) => (
            <div key={label} className="min-w-[132px]">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.11em] text-faint">{label}</span>
              <p className="mt-1 text-[13.5px] font-medium text-ink-soft">{value}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-5 max-w-[620px] text-left">
          <Disclosure label="Why this fits">
            <ul className="grid gap-2.5">
              {proposal.whyThisFits.slice(0, 3).map((reason) => (
                <li key={reason} className="flex items-start gap-2.5 text-[14px] leading-snug text-ink-soft">
                  <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{reason}
                </li>
              ))}
            </ul>
          </Disclosure>
        </div>
      </section>

      <nav className="sticky top-16 z-30 -mx-5 border-y border-hair bg-[rgba(244,242,236,0.94)] px-5 backdrop-blur-xl md:-mx-8 md:px-8" aria-label="Recommendation details">
        <div className="mx-auto flex max-w-[860px] items-center justify-between gap-4 overflow-x-auto">
          <div className="flex min-w-max gap-6">
            {TABS.map((tab) => <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}</TabButton>)}
          </div>
          <button type="button" onClick={onSaveIdea} aria-pressed={saved} className="hidden shrink-0 text-[12.5px] font-semibold text-muted transition hover:text-ink sm:block">
            {saved ? "Saved ✓" : "Save idea"}
          </button>
        </div>
      </nav>

      <div className="mx-auto min-h-[430px] max-w-[860px] py-9 md:py-12">
        {activeTab === "stay" && (
          <section className="grid items-center gap-7 md:grid-cols-[1.05fr_.95fr]">
            <Photo image={proposal.stay.image} ratio="4/3" tone={proposal.heroTone} width={1000} rounded="rounded-card" />
            <div>
              <Eyebrow>Where I&apos;d put you</Eyebrow>
              <h2 className="mt-2 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.02] tracking-[-0.04em]">{proposal.stay.name}</h2>
              <p className="mt-2 text-[13.5px] text-muted">{proposal.stay.location}</p>
              <div className="mt-4 flex flex-wrap gap-2">{proposal.stay.attributes.map((attribute) => <span key={attribute} className="rounded-full bg-surface-2 px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft ring-1 ring-hair-2">{attribute}</span>)}</div>
              <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{proposal.stay.why}</p>
              <p className="mt-5 font-display text-[22px] font-semibold tracking-[-0.025em]">{proposal.stay.price}</p>
            </div>
          </section>
        )}

        {activeTab === "flight" && (
          <section className="mx-auto max-w-[700px]">
            <Eyebrow>How I&apos;d get you there</Eyebrow>
            <div className="mt-4 rounded-[22px] border border-hair bg-surface p-6 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><h2 className="font-display text-2xl font-semibold tracking-[-0.025em]">{proposal.flight.airline}</h2><p className="mt-1 text-[13.5px] text-muted">{proposal.flight.route} · {proposal.flight.fareType}</p></div>
                <p className="font-display text-xl font-semibold">{proposal.flight.price}</p>
              </div>
              <div className="mt-8 grid grid-cols-[auto_1fr_auto] items-center gap-4">
                <div><p className="font-display text-2xl font-semibold">{proposal.flight.depart}</p><p className="text-[10.5px] uppercase tracking-[0.1em] text-faint">Depart</p></div>
                <div className="text-center"><div className="h-px bg-hair" /><p className="mt-2 text-[11px] text-muted">{proposal.flight.duration} · {proposal.flight.stops}</p></div>
                <div className="text-right"><p className="font-display text-2xl font-semibold">{proposal.flight.arrive}</p><p className="text-[10.5px] uppercase tracking-[0.1em] text-faint">Arrive</p></div>
              </div>
              <p className="mt-7 border-t border-hair-2 pt-5 text-[13.5px] leading-relaxed text-muted">Timed around your daytime-departure preference. Fare is illustrative and is not held until you choose to book.</p>
            </div>
          </section>
        )}

        {activeTab === "things" && (
          <section>
            <div className="text-center"><Eyebrow>Things worth making time for</Eyebrow><h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em]">A light rhythm, not a packed itinerary</h2></div>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {proposal.moments.map((moment) => (
                <article key={moment.title}>
                  <Photo image={moment.image} ratio="4/3" tone={proposal.heroTone} width={700} rounded="rounded-lg" />
                  <h3 className="mt-3 font-display text-lg font-semibold tracking-[-0.02em]">{moment.title}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{moment.note}</p>
                </article>
              ))}
            </div>
            <div className="mx-auto mt-7 max-w-[620px] rounded-[18px] border border-hair bg-surface-2 p-5 text-center">
              <Eyebrow>One food anchor</Eyebrow><p className="mt-2 font-display text-xl font-semibold">{proposal.dining.name}</p><p className="mt-2 text-[13.5px] leading-relaxed text-muted">{proposal.dining.note}</p>
            </div>
          </section>
        )}

        {activeTab === "addons" && (
          <section>
            <div className="text-center"><Eyebrow>Useful because of this trip</Eyebrow><h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em]">Add-ons, only when they remove work</h2><p className="mx-auto mt-3 max-w-[55ch] text-[14.5px] leading-relaxed text-muted">Roam can keep these with the trip so you do not have to remember separate checklists.</p></div>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {[
                ["Entry requirements", "VisaRoo", "We’ll check passport-specific entry rules before anything needs action."],
                ["eSIM", "RoaminRabbit", "Set up connectivity for Japan and keep activation tied to your arrival."],
                ["Travel insurance", "Trip protection", "Compare coverage once the major bookings and total value are clearer."],
              ].map(([title, source, copy]) => (
                <article key={title} className="rounded-[20px] border border-hair bg-surface p-5">
                  <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted">Not needed yet</span>
                  <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.025em]">{title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{copy}</p>
                  <p className="mt-5 text-[11.5px] font-semibold text-faint">Powered by {source}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 text-center"><PrototypeBadge /></div>
          </section>
        )}
      </div>

      <StickyAction
        meta={`${optionCount} trip directions prepared · Option ${Math.min(optionIndex + 1, optionCount)} of ${optionCount}`}
        note={`${proposal.destination} · ${proposal.indicativePrice}`}
      >
        {secondary}
        <Button variant="accent" onClick={onPrimary}>{primaryLabel} →</Button>
      </StickyAction>
    </article>
  );
}
