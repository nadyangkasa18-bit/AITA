"use client";

import { useEffect, useState } from "react";
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

type HomeMode = "guided" | "idea";
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
    <div className="grid gap-3 border-b border-hair-2 py-4 last:border-b-0 md:grid-cols-[220px_1fr] md:items-center">
      <div>
        <p className="text-[13.5px] font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-[11.5px] text-faint">{helper}</p>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={active}
              className={`rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition ${active ? "border-ink bg-ink text-paper" : "border-hair bg-white/72 text-muted hover:border-ink/30 hover:bg-white hover:text-ink"}`}
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

const fieldShell =
  "h-[60px] rounded-full border border-[rgba(27,26,23,0.14)] bg-[rgba(255,255,255,0.72)] px-4 backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-200 hover:bg-[rgba(255,255,255,0.9)] focus-within:border-accent focus-within:bg-white focus-within:shadow-[0_0_0_1px_var(--color-accent),0_14px_34px_-28px_rgba(27,26,23,0.5)]";

export default function Home() {
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<HomeMode>("guided");
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
    ]
      .filter(Boolean)
      .join("\n");

    const id = store.createTripFromPrompt(prompt);
    store.patchTrip(id, {
      travelers,
      name: `${destination.trim()} · ${dateSummary}`,
    });
    setTripId(id);
    setStage("reasoning");
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(244,242,236,0.08),rgba(244,242,236,0.5)_58%,rgba(244,242,236,0.86)_100%)]"
        aria-hidden
      />

      {mode === "guided" ? (
        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1120px] flex-col px-5 pb-8 pt-8 md:px-8 md:pb-10 md:pt-10">
          <div className="mx-auto max-w-[760px] text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">Plan a trip</p>
            <h1 className="mx-auto mt-3 max-w-[15ch] font-display text-[clamp(38px,5.6vw,62px)] font-bold leading-[0.98] tracking-[-0.045em]">
              {stage === "basics" ? "Start with what you already know." : "A few things to tune the recommendations."}
            </h1>
            <p className="mx-auto mt-4 max-w-[58ch] text-[15.5px] leading-relaxed text-muted">
              {stage === "basics"
                ? `Give ${PRODUCT.name} the parts that are fixed. We’ll only ask about the trade-offs that can actually improve the result.`
                : "These are preferences, not rules. We’ll balance them against each other and show you the smallest useful set of options."}
            </p>
          </div>

          {stage === "basics" ? (
            <div className="mx-auto mt-7 w-full max-w-[1000px]">
              <div className="grid gap-4 md:grid-cols-[1.05fr_1.35fr_1fr]">
                <label className="block">
                  <span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-faint">Where</span>
                  <div className={`${fieldShell} flex items-center`}>
                    <input
                      value={destination}
                      onChange={(event) => setDestination(event.target.value)}
                      list="direct-destinations"
                      placeholder="Tokyo, Japan"
                      className="w-full bg-transparent font-display text-[16px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint"
                    />
                    <span className="ml-2 text-[11px] text-faint" aria-hidden>⌄</span>
                  </div>
                  <datalist id="direct-destinations">
                    <option value="Tokyo, Japan" />
                    <option value="Seoul, South Korea" />
                    <option value="Singapore" />
                    <option value="Bangkok, Thailand" />
                  </datalist>
                </label>

                <div>
                  <span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-faint">When</span>
                  <div className={`${fieldShell} grid grid-cols-[1fr_auto_1fr] items-center gap-2`}>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="min-w-0 bg-transparent text-[13px] font-semibold text-ink outline-none"
                      aria-label="Departure date"
                    />
                    <span className="text-hair">→</span>
                    <input
                      type="date"
                      min={startDate || undefined}
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="min-w-0 bg-transparent text-[13px] font-semibold text-ink outline-none"
                      aria-label="Return date"
                    />
                  </div>
                </div>

                <div>
                  <span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-faint">With who</span>
                  <div className={`${fieldShell} flex items-center gap-3`}>
                    <select
                      value={partyType}
                      onChange={(event) => chooseParty(event.target.value as PartyType)}
                      className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-ink-soft outline-none"
                      aria-label="Travel group"
                    >
                      <option value="" disabled>Choose group</option>
                      {PARTY_TYPES.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <span className="h-6 w-px bg-hair-2" />
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setTravelers((value) => Math.max(1, value - 1))} className="grid h-8 w-8 place-items-center rounded-full text-[16px] text-muted hover:bg-paper-2">−</button>
                      <span className="min-w-5 text-center text-[13px] font-bold text-ink">{travelers}</span>
                      <button type="button" onClick={() => setTravelers((value) => Math.min(9, value + 1))} className="grid h-8 w-8 place-items-center rounded-full text-[16px] text-muted hover:bg-paper-2">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <button
                  type="button"
                  disabled={!basicsReady}
                  onClick={() => setStage("preferences")}
                  className="rounded-full bg-ink px-6 py-3 text-[13px] font-semibold text-paper transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Continue with these details →
                </button>
              </div>

              <div className="mx-auto mt-8 max-w-[760px] border-t border-hair-2 pt-6">
                <p className="text-center text-[11.5px] font-semibold uppercase tracking-[0.12em] text-faint">Or start less specifically</p>
                <button
                  type="button"
                  onClick={() => setMode("idea")}
                  className="group mt-3 flex h-[60px] w-full items-center gap-3 rounded-full border border-[rgba(27,26,23,0.13)] bg-[rgba(255,255,255,0.72)] p-2 pl-4 text-left shadow-[0_18px_44px_-38px_rgba(27,26,23,0.4)] backdrop-blur-md transition hover:border-ink/25 hover:bg-white"
                >
                  <Orb size={32} />
                  <span className="min-w-0 flex-1 truncate font-display text-[15.5px] font-medium tracking-[-0.015em] text-muted group-hover:text-ink">Describe a trip idea in your own words…</span>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-paper transition group-hover:scale-[1.03]">→</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-6 w-full max-w-[920px]">
              <div className="flex justify-center">
                <button type="button" onClick={() => setStage("basics")} className="rounded-full border border-hair bg-white/70 px-3.5 py-2 text-[11.5px] font-semibold text-muted backdrop-blur hover:border-ink/30 hover:text-ink">
                  ← Edit {destination.trim()} · {dateSummary}
                </button>
              </div>

              <div className="mt-3 px-1 md:px-3">
                <ChoiceRow label="How should the trip feel?" helper="Pace" options={PACE_OPTIONS} value={pace} onChange={setPace} />
                <ChoiceRow label="What matters most in the stay?" helper="Hotel trade-off" options={STAY_OPTIONS} value={stay} onChange={setStay} />
                <ChoiceRow label="What should flights optimize for?" helper="Journey trade-off" options={FLIGHT_OPTIONS} value={flight} onChange={setFlight} />
                <ChoiceRow label="How should we treat the budget?" helper="Spend trade-off" options={BUDGET_OPTIONS} value={budget} onChange={setBudget} />
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-faint">Anything more specific?</span>
                <div className={`${fieldShell} flex items-center`}>
                  <input
                    value={extra}
                    onChange={(event) => setExtra(event.target.value)}
                    placeholder="Optional — no red-eyes, near a station, must have a pool…"
                    className="w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-faint"
                  />
                </div>
              </label>

              <div className="mt-6 flex justify-center">
                <button type="button" onClick={startGuidedRecommendation} className="rounded-full bg-ink px-6 py-3 text-[13px] font-semibold text-paper transition hover:scale-[1.01]">
                  Show me the best options →
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1120px] flex-col justify-center px-5 py-10 md:px-8">
          <div className="mx-auto w-full max-w-[900px] text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">Start from an idea</p>
            <h1 className="mx-auto mt-4 max-w-[14ch] font-display text-[clamp(42px,6.4vw,72px)] font-bold leading-[0.97] tracking-[-0.045em]">What kind of trip do you need?</h1>
            <p className="mx-auto mt-5 max-w-[54ch] text-[16.5px] leading-relaxed text-muted">Tell {PRODUCT.name} whatever you know. A place, a feeling, a constraint, or the problem you want the trip to solve.</p>

            <div className="home-prompt-shell mx-auto mt-7 w-full max-w-[760px]">
              <span className="home-prompt-glow" aria-hidden />
              <span className="home-prompt-edge" aria-hidden />
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitIdea();
                }}
                className="relative z-10 m-px flex h-[62px] items-center gap-3 rounded-full bg-white p-2 pl-4 shadow-[0_18px_48px_-34px_rgba(27,26,23,0.32)]"
              >
                <Orb size={32} />
                <input
                  autoFocus
                  value={idea}
                  onChange={(event) => setIdea(event.target.value)}
                  placeholder="Somewhere warm for Chinese New Year, good food, not too crowded…"
                  aria-label="Describe your trip idea"
                  className="home-prompt-input min-w-0 flex-1 rounded-full bg-transparent font-display text-[16.5px] font-medium tracking-[-0.02em]"
                />
                <button type="submit" disabled={!idea.trim()} aria-label="Explore this idea" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-paper transition hover:scale-[1.04] active:scale-95 disabled:opacity-30">→</button>
              </form>
            </div>

            <button type="button" onClick={() => setMode("guided")} className="mt-4 rounded-full border border-hair bg-white/58 px-4 py-2 text-[12px] font-semibold text-muted backdrop-blur transition hover:border-ink/30 hover:bg-white hover:text-ink">
              I know where, when and who → use trip controls
            </button>
          </div>

          <div className="relative left-1/2 mt-9 w-screen max-w-none -translate-x-1/2 overflow-hidden">
            <p className="mb-3 text-center text-[11.5px] font-semibold uppercase tracking-[0.11em] text-faint">Or borrow an idea</p>
            <div className="grid gap-2.5">
              <PromptMarquee items={TOP_IDEAS} direction="right" onPick={setIdea} />
              <PromptMarquee items={BOTTOM_IDEAS} direction="left" onPick={setIdea} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
