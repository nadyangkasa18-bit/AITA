"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { InteractiveTravelField } from "@/components/interactive-travel-field";
import { ReasoningProgress } from "@/components/reasoning";
import { Orb, useToast } from "@/components/ui";
import { PRODUCT } from "@/config/product";
import { reasoningSteps } from "@/lib/mock/seed";

const TOP_IDEAS = [
  "Weekend reset, somewhere cool and quiet.",
  "Family trip with two kids, minimal transit.",
  "Somewhere warm for Chinese New Year.",
  "Food-first long weekend under five hours.",
  "Beachy, but not humid and no car needed.",
];

const BOTTOM_IDEAS = [
  "A design hotel and a direct flight.",
  "Three friends, four days, around Rp 15m each.",
  "Great food, good weather — surprise me.",
  "Mountains, a great hotel, and no red-eyes.",
  "Somewhere easy for a long weekend from Jakarta.",
];

const PARTY_TYPES = ["Solo", "Couple", "Family", "Friends"] as const;
const PACE_OPTIONS = ["Slow & relaxed", "Balanced", "Fuller days"] as const;
const STAY_OPTIONS = ["Best location", "Design & atmosphere", "Room comfort", "Best value"] as const;
const FLIGHT_OPTIONS = ["Direct if possible", "Better times", "Lowest fare", "More flexible"] as const;
const BUDGET_OPTIONS = ["Keep the total down", "Balanced", "Spend more on the stay", "Flexible"] as const;

type GuidedStage = "basics" | "preferences" | "reasoning";
type PartyType = (typeof PARTY_TYPES)[number];

function PromptMarquee({
  items,
  direction,
  onPick,
}: {
  items: string[];
  direction: "left" | "right";
  onPick: (value: string) => void;
}) {
  const renderSet = (copy: string) => (
    <div className="home-marquee-set" aria-hidden={copy === "copy"}>
      {items.map((item) => (
        <button
          key={`${copy}-${item}`}
          type="button"
          tabIndex={copy === "copy" ? -1 : 0}
          onClick={() => onPick(item)}
          className="whitespace-nowrap rounded-full border border-[rgba(27,26,23,0.09)] bg-[rgba(255,255,255,0.58)] px-4 py-2 text-[13px] text-muted backdrop-blur-sm transition hover:border-[rgba(27,26,23,0.22)] hover:bg-[rgba(255,255,255,0.9)] hover:text-ink"
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div className="home-marquee-viewport">
      <div className={`home-marquee-track ${direction === "right" ? "home-marquee-right" : "home-marquee-left"}`}>
        {renderSet("original")}
        {renderSet("copy")}
      </div>
    </div>
  );
}

function ChoiceRow({
  label,
  helper,
  options,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="border-b border-hair-2 py-4 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[13.5px] font-semibold text-ink">{label}</p>
        <p className="text-[11.5px] text-faint">{helper}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={active}
              className={`rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition ${active ? "border-ink bg-ink text-paper shadow-[0_8px_20px_-14px_rgba(27,26,23,0.65)]" : "border-hair bg-white text-muted hover:border-ink/30 hover:text-ink"}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function compactDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(date);
}

export default function Home() {
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const [stage, setStage] = useState<GuidedStage>("basics");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [partyType, setPartyType] = useState<PartyType | "">("");
  const [travelers, setTravelers] = useState(2);
  const [pace, setPace] = useState("Balanced");
  const [stay, setStay] = useState("Best location");
  const [flight, setFlight] = useState("Direct if possible");
  const [budget, setBudget] = useState("Balanced");
  const [extra, setExtra] = useState("");
  const [tripId, setTripId] = useState<string | null>(null);
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [ideaTripId, setIdeaTripId] = useState<string | null>(null);
  const [ideaReasoning, setIdeaReasoning] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("roam.justCalibrated")) {
        sessionStorage.removeItem("roam.justCalibrated");
        toast(`Saved — ${PRODUCT.name} can use those preferences when they help.`);
      }
    } catch {
      /* ignore */
    }
  }, [toast]);

  const basicsReady = Boolean(destination.trim() && startDate && endDate && partyType && endDate >= startDate);
  const dateSummary = startDate && endDate ? `${compactDate(startDate)} – ${compactDate(endDate)}` : "Dates";

  function chooseParty(value: PartyType) {
    setPartyType(value);
    if (value === "Solo") setTravelers(1);
    if (value === "Couple") setTravelers(2);
    if (value === "Family") setTravelers((current) => Math.max(current, 4));
    if (value === "Friends") setTravelers((current) => Math.max(current, 3));
  }

  function startGuidedRecommendation() {
    if (!basicsReady) return;
    const prompt = [
      `Destination: ${destination.trim()}`,
      `Dates: ${startDate} to ${endDate}`,
      `Travelers: ${travelers} · ${partyType}`,
      `Pace: ${pace}`,
      `Stay priority: ${stay}`,
      `Flight priority: ${flight}`,
      `Budget approach: ${budget}`,
      extra.trim() ? `Specific requests: ${extra.trim()}` : null,
    ].filter(Boolean).join("\n");

    const id = store.createTripFromPrompt(prompt);
    store.patchTrip(id, {
      travelers,
      name: `${destination.trim()} · ${dateSummary}`,
    });
    setTripId(id);
    setStage("reasoning");
  }

  function startIdea(value?: string) {
    if (value) setIdea(value);
    setIdeaOpen(true);
  }

  function submitIdea() {
    const text = idea.trim();
    if (!text) return;
    const id = store.createTripFromPrompt(text);
    setIdeaTripId(id);
    setIdeaReasoning(true);
  }

  if (stage === "reasoning" && tripId) {
    return (
      <ReasoningProgress
        steps={[
          { label: `Locking in ${destination.trim()}, ${dateSummary} and ${travelers} traveler${travelers === 1 ? "" : "s"}` },
          { label: "Applying your flight, stay and pace preferences" },
          { label: "Narrowing to the few options worth choosing" },
        ]}
        headline={`Building your ${destination.trim()} options…`}
        onDone={() => router.push(`/trips/${tripId}/booking-plan`)}
      />
    );
  }

  if (ideaReasoning && ideaTripId) {
    return (
      <ReasoningProgress
        steps={reasoningSteps}
        headline="Turning the idea into a trip brief…"
        onDone={() => router.push(`/trips/${ideaTripId}/brief`)}
      />
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <InteractiveTravelField />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(244,242,236,0.1),rgba(244,242,236,0.58)_58%,rgba(244,242,236,0.92)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1120px] px-5 pb-16 pt-10 md:px-8 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">Plan a trip</p>
          <h1 className="mx-auto mt-3 max-w-[14ch] font-display text-[clamp(40px,6vw,68px)] font-bold leading-[0.97] tracking-[-0.045em]">Start with what you already know.</h1>
          <p className="mx-auto mt-4 max-w-[55ch] text-[16px] leading-relaxed text-muted">Give {PRODUCT.name} the parts that are fixed. We&apos;ll ask only a few useful trade-offs, then show you the options worth considering.</p>
        </div>

        <section className="mx-auto mt-7 max-w-[940px] overflow-hidden rounded-[28px] border border-[rgba(27,26,23,0.1)] bg-[rgba(255,255,255,0.9)] shadow-[0_30px_80px_-48px_rgba(27,26,23,0.42)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-hair-2 px-5 py-3.5 md:px-7">
            <div className="flex items-center gap-2.5">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${stage === "basics" ? "bg-ink text-paper" : "bg-[#dfe9df] text-[#34523b]"}`}>{stage === "basics" ? "1" : "✓"}</span>
              <span className="text-[12.5px] font-semibold text-ink-soft">The non-negotiables</span>
              <span className="text-hair">→</span>
              <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${stage === "preferences" ? "bg-ink text-paper" : "bg-paper-2 text-faint"}`}>2</span>
              <span className={`hidden text-[12.5px] font-semibold sm:inline ${stage === "preferences" ? "text-ink-soft" : "text-faint"}`}>A few trade-offs</span>
            </div>
            <Link href="/profile" className="hidden items-center gap-1.5 text-[11.5px] font-semibold text-muted hover:text-ink sm:flex"><Orb size={18} /> Personalize later</Link>
          </div>

          {stage === "basics" ? (
            <div className="p-5 md:p-7">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-faint">Step 1</p>
                  <h2 className="mt-1 font-display text-[28px] font-semibold tracking-[-0.035em]">What&apos;s fixed for this trip?</h2>
                </div>
                <p className="max-w-[34ch] text-[12px] leading-relaxed text-faint">If the destination is still open, skip this and start from an idea below.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-[1.05fr_1.25fr_.9fr]">
                <label className="rounded-[18px] border border-hair bg-surface p-4 transition focus-within:border-ink/30 focus-within:shadow-[0_10px_24px_-20px_rgba(27,26,23,0.55)]">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">Where</span>
                  <input
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    list="direct-destinations"
                    placeholder="Tokyo, Japan"
                    className="mt-2 w-full bg-transparent font-display text-[17px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint"
                  />
                  <datalist id="direct-destinations"><option value="Tokyo, Japan" /><option value="Seoul, South Korea" /><option value="Singapore" /><option value="Bangkok, Thailand" /></datalist>
                </label>

                <div className="rounded-[18px] border border-hair bg-surface p-4">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">When</span>
                  <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="min-w-0 bg-transparent text-[13px] font-semibold text-ink outline-none" aria-label="Departure date" />
                    <span className="text-hair">→</span>
                    <input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} className="min-w-0 bg-transparent text-[13px] font-semibold text-ink outline-none" aria-label="Return date" />
                  </div>
                </div>

                <div className="rounded-[18px] border border-hair bg-surface p-4">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">With who</span>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-[13px] font-semibold text-ink-soft">{partyType || "Choose group"}</span>
                    <div className="flex items-center gap-2 rounded-full border border-hair bg-white px-2 py-1">
                      <button type="button" onClick={() => setTravelers((value) => Math.max(1, value - 1))} className="grid h-6 w-6 place-items-center rounded-full text-[15px] text-muted hover:bg-paper-2">−</button>
                      <span className="min-w-4 text-center text-[12.5px] font-bold text-ink">{travelers}</span>
                      <button type="button" onClick={() => setTravelers((value) => Math.min(9, value + 1))} className="grid h-6 w-6 place-items-center rounded-full text-[15px] text-muted hover:bg-paper-2">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {PARTY_TYPES.map((option) => (
                  <button key={option} type="button" onClick={() => chooseParty(option)} className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition ${partyType === option ? "border-ink bg-ink text-paper" : "border-hair bg-white text-muted hover:border-ink/30"}`}>{option}</button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-hair-2 pt-5">
                <p className="text-[12px] text-faint">No account setup required. These details stay attached to this trip.</p>
                <button type="button" disabled={!basicsReady} onClick={() => setStage("preferences")} className="rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-paper transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-35">Continue →</button>
              </div>
            </div>
          ) : (
            <div className="p-5 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-faint">Step 2</p>
                  <h2 className="mt-1 font-display text-[28px] font-semibold tracking-[-0.035em]">What should we optimize for?</h2>
                  <p className="mt-2 text-[13px] text-muted">Four quick choices. These are negotiable — we&apos;ll trade them against each other when there&apos;s a better overall trip.</p>
                </div>
                <button type="button" onClick={() => setStage("basics")} className="rounded-full border border-hair bg-white px-3 py-2 text-[11.5px] font-semibold text-muted hover:border-ink/30 hover:text-ink">Edit {destination.trim()} · {dateSummary}</button>
              </div>

              <div className="mt-5 rounded-[20px] border border-hair bg-surface-2 px-4 md:px-5">
                <ChoiceRow label="How should the trip feel?" helper="Pace" options={PACE_OPTIONS} value={pace} onChange={setPace} />
                <ChoiceRow label="What matters most in the stay?" helper="Hotel trade-off" options={STAY_OPTIONS} value={stay} onChange={setStay} />
                <ChoiceRow label="What should flights optimize for?" helper="Journey trade-off" options={FLIGHT_OPTIONS} value={flight} onChange={setFlight} />
                <ChoiceRow label="How should we treat the budget?" helper="Spend trade-off" options={BUDGET_OPTIONS} value={budget} onChange={setBudget} />
              </div>

              <label className="mt-4 block rounded-[18px] border border-hair bg-surface p-4 transition focus-within:border-ink/30">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">Anything more specific?</span>
                <textarea value={extra} onChange={(event) => setExtra(event.target.value)} rows={2} placeholder="Optional — e.g. no red-eyes, hotel within 500m of a station, must have a pool…" className="mt-2 w-full resize-none bg-transparent text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-faint" />
              </label>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-hair-2 pt-5">
                <div className="flex flex-wrap gap-1.5 text-[11.5px] text-muted"><span className="rounded-full bg-paper-2 px-2.5 py-1">{travelers} traveler{travelers === 1 ? "" : "s"}</span><span className="rounded-full bg-paper-2 px-2.5 py-1">{pace}</span><span className="rounded-full bg-paper-2 px-2.5 py-1">{flight}</span></div>
                <button type="button" onClick={startGuidedRecommendation} className="rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-paper transition hover:scale-[1.01]">Show me the best options →</button>
              </div>
            </div>
          )}
        </section>

        <section className="relative left-1/2 mt-12 w-screen max-w-none -translate-x-1/2 overflow-hidden pb-2">
          <div className="mx-auto mb-4 flex max-w-[940px] flex-wrap items-end justify-between gap-3 px-5 md:px-8">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-faint">Start from an idea</p><h2 className="mt-1 font-display text-[23px] font-semibold tracking-[-0.03em]">Don&apos;t know the destination yet? That&apos;s fine.</h2></div>
            <button type="button" onClick={() => startIdea()} className="rounded-full border border-hair bg-[rgba(255,255,255,0.72)] px-3.5 py-2 text-[12px] font-semibold text-muted backdrop-blur hover:border-ink/30 hover:text-ink">Describe your own idea</button>
          </div>

          {ideaOpen && (
            <div className="mx-auto mb-5 max-w-[760px] px-5 md:px-8">
              <div className="rounded-[22px] border border-hair bg-[rgba(255,255,255,0.88)] p-4 shadow-[0_24px_60px_-42px_rgba(27,26,23,0.42)] backdrop-blur-xl md:p-5">
                <div className="flex items-center gap-2"><Orb size={24} /><p className="text-[12.5px] font-semibold text-ink-soft">Tell {PRODUCT.name} whatever you know</p></div>
                <textarea autoFocus value={idea} onChange={(event) => setIdea(event.target.value)} rows={3} placeholder="Somewhere warm for Chinese New Year, good food, not too crowded, four adults…" className="mt-3 w-full resize-none bg-transparent font-display text-[17px] font-medium leading-relaxed tracking-[-0.015em] text-ink outline-none placeholder:text-faint" />
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-hair-2 pt-3"><button type="button" onClick={() => { setIdeaOpen(false); setIdea(""); }} className="text-[11.5px] font-semibold text-muted hover:text-ink">Cancel</button><button type="button" onClick={submitIdea} disabled={!idea.trim()} className="rounded-full bg-ink px-4 py-2.5 text-[12px] font-semibold text-paper disabled:opacity-35">Explore this idea →</button></div>
              </div>
            </div>
          )}

          <div className="grid gap-2.5">
            <PromptMarquee items={TOP_IDEAS} direction="right" onPick={startIdea} />
            <PromptMarquee items={BOTTOM_IDEAS} direction="left" onPick={startIdea} />
          </div>
        </section>
      </div>
    </div>
  );
}
