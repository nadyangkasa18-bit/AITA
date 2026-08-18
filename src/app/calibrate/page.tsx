"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { CalibrationVignette } from "@/components/calibration-vignette";
import { Button, Eyebrow, SidePanel } from "@/components/ui";
import { PRODUCT } from "@/config/product";
import type { PrefCategory, ProfilePref } from "@/lib/types";

type Stage = 0 | 1 | 2;

type NegotiableOption = {
  label: string;
  category: PrefCategory;
  statement: string;
};

const NEGOTIABLES: NegotiableOption[] = [
  { label: "Direct flights", category: "Flights", statement: "Prefer direct flights when practical." },
  { label: "Better flight times", category: "Flights", statement: "Prefer comfortable departure and arrival times over the absolute lowest fare." },
  { label: "Lower total cost", category: "Spending", statement: "Look for strong overall value and keep the total sensible." },
  { label: "A great hotel", category: "Stays", statement: "A memorable, genuinely good stay matters." },
  { label: "Central & walkable", category: "Stays", statement: "Prefer central, walkable stays that reduce daily transport." },
  { label: "Design-led stays", category: "Stays", statement: "Lean toward distinctive, design-conscious hotels." },
  { label: "Warm weather", category: "Pace", statement: "Prefer destinations and dates with comfortably warm weather." },
  { label: "Food first", category: "Food", statement: "Great food should meaningfully shape the trip." },
  { label: "Slower pace", category: "Pace", statement: "Prefer a slower itinerary with breathing room." },
  { label: "More to do", category: "Pace", statement: "Prefer fuller days with more things to see and do." },
  { label: "Minimal transit", category: "Ground transport", statement: "Minimize unnecessary transit and complicated transfers." },
  { label: "No car needed", category: "Ground transport", statement: "Prefer trips that work well without driving." },
  { label: "Good for kids", category: "Group travel", statement: "Make the trip comfortable and practical for children." },
  { label: "Accessibility", category: "Accessibility", statement: "Prioritize accessible, low-friction travel choices." },
];

const PARTY_OPTIONS = ["Solo", "Partner", "Friends", "Family"];
const PARTY_COUNTS: Record<string, number> = { Solo: 1, Partner: 2, Friends: 3, Family: 4 };

function Progress({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
        <span>Trip setup</span>
        <span>{step} of 2</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-hair-2">
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${step * 50}%` }} />
      </div>
    </div>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <div className="cal-landing relative min-h-dvh overflow-hidden">
      <div className="cal-atmosphere" aria-hidden />
      <header className="relative z-10 mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 md:px-8">
        <span className="font-display text-[21px] font-extrabold tracking-[-0.03em]">{PRODUCT.name}</span>
        <button onClick={() => setInfoOpen(true)} className="text-[13.5px] font-semibold text-muted transition hover:text-ink">What will I be asked?</button>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[1180px] items-center gap-12 px-5 pb-12 pt-5 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:pb-16 lg:gap-20">
        <div className="max-w-[560px]">
          <Eyebrow className="text-accent">Two quick steps</Eyebrow>
          <h1 className="mt-5 font-display text-[clamp(44px,6.2vw,76px)] font-semibold leading-[0.94] tracking-[-0.055em]">Tell us what&apos;s fixed. We&apos;ll work around the rest.</h1>
          <p className="mt-6 max-w-[48ch] text-[18px] leading-[1.65] text-muted">Start with where, when, and who&apos;s coming. Then tell {PRODUCT.name} what you&apos;d like it to optimize — without turning setup into a questionnaire.</p>
          <div className="mt-8"><Button variant="ink" className="min-w-[184px]" onClick={onStart}>Set up my trip <span aria-hidden>→</span></Button></div>
          <p className="mt-5 text-[13px] text-muted">About 1 minute <span className="mx-1.5 text-hair">·</span> No this-or-that survey <span className="mx-1.5 text-hair">·</span> Everything stays editable</p>
        </div>
        <div className="w-full md:justify-self-end"><CalibrationVignette /></div>
      </main>

      <SidePanel open={infoOpen} onClose={() => setInfoOpen(false)} title="What will I be asked?">
        <p className="text-[15px] leading-relaxed text-muted">Just enough to give {PRODUCT.name} a useful starting point. If a destination or date isn&apos;t fixed yet, say so — openness is useful information too.</p>
        <div className="mt-6 grid gap-5 border-l border-accent-line pl-5">
          <div><Eyebrow>1 · What&apos;s fixed</Eyebrow><p className="mt-1 text-[14.5px] text-ink-soft">Where, who&apos;s coming, and when. These become the first trip constraints.</p></div>
          <div><Eyebrow>2 · What can flex</Eyebrow><p className="mt-1 text-[14.5px] text-ink-soft">Choose a few things you&apos;d like us to optimize: flight time, hotel quality, pace, food, cost, and more.</p></div>
        </div>
        <Button variant="ink" className="mt-8 w-full" onClick={() => { setInfoOpen(false); onStart(); }}>Set up my trip →</Button>
      </SidePanel>
    </div>
  );
}

export default function CalibratePage() {
  const store = useStore();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(0);
  const [where, setWhere] = useState("");
  const [who, setWho] = useState("");
  const [when, setWhen] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  if (!store.hydrated) return <div className="mx-auto mt-24 h-8 w-40 rounded-lg shimmer" />;

  const toggleNegotiable = (label: string) => {
    setSelected((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
  };

  const finish = () => {
    const prefs: ProfilePref[] = selected.map((label, index) => {
      const option = NEGOTIABLES.find((item) => item.label === label)!;
      return {
        id: `onboarding-${index + 1}`,
        category: option.category,
        statement: option.statement,
        priority: "usually",
        scope: "all",
        source: "onboarding",
        confidence: 0.72,
        order: index + 1,
      };
    });

    store.commitCalibration({
      prefs,
      loyalty: store.profile.loyalty,
      mustHaves: [],
      avoids: [],
    });

    const destinationLine = where === "Open to ideas" ? "The destination is open — recommend somewhere that fits." : `I want to go to ${where}.`;
    const partyLine = who === "Not sure yet" ? "The travel party is not fixed yet." : `I am traveling with: ${who}.`;
    const timingLine = when === "Flexible dates" ? "Dates are flexible." : `Timing: ${when}.`;
    const preferenceLine = selected.length ? `Optimize for: ${selected.join(", ")}.` : "Keep the rest flexible and make the best overall call.";
    const noteLine = notes.trim() ? `Also consider: ${notes.trim()}` : "";
    const prompt = [destinationLine, partyLine, timingLine, preferenceLine, noteLine].filter(Boolean).join(" ");

    const tripId = store.createTripFromPrompt(prompt);
    if (PARTY_COUNTS[who]) store.patchTrip(tripId, { travelers: PARTY_COUNTS[who] });
    router.push(`/trips/${tripId}/brief`);
  };

  if (stage === 0) return <Welcome onStart={() => setStage(1)} />;

  if (stage === 1) {
    const ready = Boolean(where.trim() && who.trim() && when.trim());
    return (
      <div className="mx-auto max-w-[760px] px-5 py-8 md:px-8 md:py-14">
        <Progress step={1} />
        <button onClick={() => setStage(0)} className="mb-6 text-[13px] font-semibold text-muted transition hover:text-ink">← Back</button>
        <Eyebrow>Non-negotiables</Eyebrow>
        <h1 className="mt-3 max-w-[15ch] font-display text-[clamp(34px,6vw,52px)] font-semibold leading-[0.98] tracking-[-0.045em]">What&apos;s already fixed for this trip?</h1>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted">Give {PRODUCT.name} the foundations first. If something isn&apos;t decided yet, explicitly leave it open instead of guessing.</p>

        <div className="mt-8 grid gap-4">
          <section className="rounded-[22px] border border-hair bg-surface p-5">
            <div className="flex items-start justify-between gap-4"><div><p className="font-display text-[20px] font-semibold">Where?</p><p className="mt-1 text-[13px] text-muted">A destination if you know it — otherwise stay open.</p></div><span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">01</span></div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input value={where} onChange={(event) => setWhere(event.target.value)} placeholder="e.g. Tokyo, Japan" className="min-w-0 flex-1 rounded-full border border-hair bg-surface-2 px-4 py-3 text-[14px] outline-none focus-visible:border-accent" />
              <button onClick={() => setWhere("Open to ideas")} className={`rounded-full border px-4 py-3 text-[13px] font-semibold transition ${where === "Open to ideas" ? "border-accent bg-accent-tint text-accent" : "border-hair text-muted hover:border-ink/30"}`}>Open to ideas</button>
            </div>
          </section>

          <section className="rounded-[22px] border border-hair bg-surface p-5">
            <div className="flex items-start justify-between gap-4"><div><p className="font-display text-[20px] font-semibold">With who?</p><p className="mt-1 text-[13px] text-muted">Choose a common group or describe it yourself.</p></div><span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">02</span></div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PARTY_OPTIONS.map((option) => <button key={option} onClick={() => setWho(option)} className={`rounded-full border px-4 py-2.5 text-[13px] font-semibold transition ${who === option ? "border-accent bg-accent text-white" : "border-hair bg-surface-2 text-ink-soft hover:border-ink/30"}`}>{option}</button>)}
              <button onClick={() => setWho("Not sure yet")} className={`rounded-full border px-4 py-2.5 text-[13px] font-semibold transition ${who === "Not sure yet" ? "border-accent bg-accent-tint text-accent" : "border-hair bg-surface-2 text-muted hover:border-ink/30"}`}>Not sure yet</button>
            </div>
            <input value={PARTY_OPTIONS.includes(who) || who === "Not sure yet" ? "" : who} onChange={(event) => setWho(event.target.value)} placeholder="Or describe the group, e.g. 2 adults + 2 kids" className="mt-3 w-full rounded-full border border-hair bg-surface-2 px-4 py-3 text-[14px] outline-none focus-visible:border-accent" />
          </section>

          <section className="rounded-[22px] border border-hair bg-surface p-5">
            <div className="flex items-start justify-between gap-4"><div><p className="font-display text-[20px] font-semibold">When?</p><p className="mt-1 text-[13px] text-muted">Exact dates, a month, a holiday window — whatever you know.</p></div><span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">03</span></div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input value={when} onChange={(event) => setWhen(event.target.value)} placeholder="e.g. 20–27 October" className="min-w-0 flex-1 rounded-full border border-hair bg-surface-2 px-4 py-3 text-[14px] outline-none focus-visible:border-accent" />
              <button onClick={() => setWhen("Flexible dates")} className={`rounded-full border px-4 py-3 text-[13px] font-semibold transition ${when === "Flexible dates" ? "border-accent bg-accent-tint text-accent" : "border-hair text-muted hover:border-ink/30"}`}>Flexible dates</button>
            </div>
          </section>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-hair-2 pt-5">
          <p className="text-[12.5px] text-faint">We&apos;ll treat these as fixed unless you tell us they can move.</p>
          <Button variant="accent" disabled={!ready} onClick={() => setStage(2)}>What can flex? →</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[820px] px-5 py-8 md:px-8 md:py-14">
      <Progress step={2} />
      <button onClick={() => setStage(1)} className="mb-6 text-[13px] font-semibold text-muted transition hover:text-ink">← Back</button>
      <Eyebrow>Negotiables</Eyebrow>
      <h1 className="mt-3 max-w-[16ch] font-display text-[clamp(34px,6vw,52px)] font-semibold leading-[0.98] tracking-[-0.045em]">What should {PRODUCT.name} optimize around?</h1>
      <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted">Pick only what matters. These are preferences, not rules — {PRODUCT.name} can trade them off when there&apos;s a clearly better overall option.</p>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {NEGOTIABLES.map((option) => {
          const active = selected.includes(option.label);
          return (
            <button key={option.label} onClick={() => toggleNegotiable(option.label)} aria-pressed={active} className={`rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition ${active ? "border-ink bg-ink text-paper" : "border-hair bg-surface text-ink-soft hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-sm"}`}>{option.label}</button>
          );
        })}
      </div>

      <div className="mt-7 rounded-[22px] border border-hair bg-surface p-5">
        <label htmlFor="negotiable-notes" className="font-display text-[19px] font-semibold">Anything else?</label>
        <p className="mt-1 text-[13px] text-muted">One sentence is enough. You can always refine it later.</p>
        <textarea id="negotiable-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="e.g. I care more about a beautiful hotel than having a huge room." rows={3} className="mt-4 w-full resize-none rounded-[16px] border border-hair bg-surface-2 px-4 py-3 text-[14px] leading-relaxed outline-none focus-visible:border-accent" />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-hair-2 pt-5">
        <p className="text-[12.5px] text-faint">{selected.length ? `${selected.length} preference${selected.length === 1 ? "" : "s"} selected` : "No preferences selected — we can keep it open."}</p>
        <Button variant="ink" onClick={finish}>Build my first trip →</Button>
      </div>
    </div>
  );
}
