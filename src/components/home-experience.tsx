"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/date-range-picker";
import { InteractiveTravelFieldClean } from "@/components/interactive-travel-field-clean";
import { ReasoningProgress } from "@/components/reasoning";
import { Orb, useToast } from "@/components/ui";
import { PRODUCT } from "@/config/product";
import { reasoningSteps } from "@/lib/mock/seed";
import { useStore } from "@/lib/store";

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

const DESTINATIONS = [
  { value: "Tokyo, Japan", city: "Tokyo", country: "Japan" },
  { value: "Seoul, South Korea", city: "Seoul", country: "South Korea" },
  { value: "Singapore", city: "Singapore", country: "Singapore" },
  { value: "Bangkok, Thailand", city: "Bangkok", country: "Thailand" },
];

const PARTY_TYPES = ["Solo", "Couple", "Family", "Friends"] as const;
const PACE_OPTIONS = ["Slow & relaxed", "Balanced", "Fuller days"] as const;
const STAY_OPTIONS = ["Best location", "Design & atmosphere", "Room comfort", "Best value"] as const;
const FLIGHT_OPTIONS = ["Direct if possible", "Better times", "Lowest fare", "More flexible"] as const;
const BUDGET_OPTIONS = ["Keep the total down", "Balanced", "Spend more on the stay", "Flexible"] as const;

type HomeMode = "guided" | "idea";
type GuidedStage = "basics" | "preferences" | "reasoning";
type PartyType = (typeof PARTY_TYPES)[number];

const fieldShell = "h-[60px] rounded-full border border-[rgba(27,26,23,0.14)] bg-[rgba(255,255,255,0.74)] px-4 backdrop-blur-md transition-[border-color,background-color] duration-200 hover:bg-[rgba(255,255,255,0.92)] focus-within:border-accent focus-within:bg-white";

function compactDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(date);
}

function PromptMarquee({ items, direction, onPick }: { items: string[]; direction: "left" | "right"; onPick: (value: string) => void }) {
  const renderSet = (copy: string) => (
    <div className="home-marquee-set" aria-hidden={copy === "copy"}>
      {items.map((item) => (
        <button
          key={`${copy}-${item}`}
          type="button"
          tabIndex={copy === "copy" ? -1 : 0}
          onClick={() => onPick(item)}
          className="whitespace-nowrap rounded-full border border-[rgba(27,26,23,0.09)] bg-[rgba(255,255,255,0.58)] px-4 py-2 text-[13px] text-muted backdrop-blur-sm transition hover:border-[rgba(27,26,23,0.22)] hover:bg-[rgba(255,255,255,0.92)] hover:text-ink"
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

function DestinationPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const normalized = value.trim().toLowerCase();
  const filtered = DESTINATIONS.filter((item) => !normalized || item.value.toLowerCase().includes(normalized) || item.country.toLowerCase().includes(normalized));
  const exact = DESTINATIONS.some((item) => item.value.toLowerCase() === normalized);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div ref={rootRef} className="relative z-30">
      <span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-faint">Where</span>
      <div className={`${fieldShell} flex items-center gap-2`}>
        <input
          value={value}
          onChange={(event) => { onChange(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); if (event.key === "ArrowDown") setOpen(true); }}
          placeholder="Tokyo, Japan"
          aria-label="Destination"
          role="combobox"
          aria-expanded={open}
          aria-controls="destination-options"
          className="min-w-0 flex-1 bg-transparent font-display text-[16px] font-semibold text-ink placeholder:font-normal placeholder:text-faint"
          style={{ outline: "none", boxShadow: "none" }}
        />
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close destinations" : "Show destinations"}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-paper-2 hover:text-ink"
        >
          <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
            <path d="M5.5 7.5 10 12l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div id="destination-options" role="listbox" className="absolute left-0 right-0 top-[82px] z-50 overflow-hidden rounded-[18px] border border-[rgba(27,26,23,0.12)] bg-[rgba(255,255,255,0.96)] p-1.5 shadow-[0_22px_54px_-28px_rgba(27,26,23,0.38)] backdrop-blur-xl">
          <div className="max-h-[250px] overflow-y-auto">
            {filtered.map((item) => {
              const selected = item.value.toLowerCase() === normalized;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => { onChange(item.value); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-3 rounded-[13px] px-3 py-2.5 text-left transition ${selected ? "bg-paper-2" : "hover:bg-surface-2"}`}
                >
                  <span>
                    <span className="block text-[13.5px] font-semibold text-ink">{item.city}</span>
                    <span className="mt-0.5 block text-[11px] text-faint">{item.country}</span>
                  </span>
                  {selected && <span className="text-[12px] font-bold text-accent">✓</span>}
                </button>
              );
            })}
            {!exact && value.trim() && (
              <button type="button" onClick={() => setOpen(false)} className="flex w-full items-center justify-between gap-3 rounded-[13px] px-3 py-2.5 text-left transition hover:bg-surface-2">
                <span>
                  <span className="block text-[13px] font-semibold text-ink">Use “{value.trim()}”</span>
                  <span className="mt-0.5 block text-[11px] text-faint">Keep this destination as typed</span>
                </span>
                <span className="text-muted">→</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChoiceRow({ label, helper, options, value, onChange }: { label: string; helper: string; options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-3 border-b border-hair-2 py-4 last:border-b-0 md:grid-cols-[220px_1fr] md:items-center">
      <div>
        <p className="text-[13.5px] font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-[11.5px] text-faint">{helper}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap md:justify-end">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={`min-h-10 rounded-full border px-3 py-2 text-center text-[11.5px] font-semibold transition sm:text-[12.5px] ${value === option ? "border-ink bg-ink text-paper" : "border-hair bg-white/72 text-muted hover:border-ink/30 hover:bg-white hover:text-ink"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HomeExperience() {
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
      // Session storage is only progressive enhancement here.
    }
  }, [toast]);

  const basicsReady = Boolean(destination.trim() && startDate && endDate && endDate >= startDate);
  const dateSummary = startDate && endDate ? `${compactDate(startDate)} – ${compactDate(endDate)}` : "Dates";

  function chooseParty(value: PartyType) {
    setPartyType(value);
    if (value === "Solo") setTravelers(1);
    if (value === "Couple") setTravelers(2);
    if (value === "Family") setTravelers((current) => Math.max(current, 3));
    if (value === "Friends") setTravelers((current) => Math.max(current, 3));
  }

  function openIdea(value = "") {
    if (value) setIdea(value);
    setMode("idea");
  }

  function startGuidedRecommendation() {
    if (!basicsReady) return;
    const prompt = [
      `Destination: ${destination.trim()}`,
      `Dates: ${startDate} to ${endDate}`,
      `Travelers: ${travelers}${partyType ? ` · ${partyType}` : ""}`,
      `Pace: ${pace}`,
      `Stay priority: ${stay}`,
      `Flight priority: ${flight}`,
      `Budget approach: ${budget}`,
      extra.trim() ? `Specific requests: ${extra.trim()}` : null,
    ].filter(Boolean).join("\n");

    const id = store.createTripFromPrompt(prompt);
    store.patchTrip(id, { travelers, name: `${destination.trim()} · ${dateSummary}` });
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
    return <ReasoningProgress steps={reasoningSteps} headline="Turning the idea into a trip brief…" onDone={() => router.push(`/trips/${ideaTripId}/brief`)} />;
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <InteractiveTravelFieldClean />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(244,242,236,0.08),rgba(244,242,236,0.5)_58%,rgba(244,242,236,0.86)_100%)]" aria-hidden />

      {mode === "guided" ? (
        <div className="relative z-10 mx-auto min-h-[calc(100dvh-4rem)] max-w-[1120px] px-5 pb-12 pt-8 md:px-8 md:pt-10">
          <div className="mx-auto max-w-[780px] text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">Plan a trip</p>
            {stage === "basics" ? (
              <h1 className="mx-auto mt-3 max-w-[15ch] font-display text-[clamp(38px,5.6vw,62px)] font-bold leading-[0.98] tracking-[-0.045em]">Plan your trip around what matters.</h1>
            ) : (
              <h1 className="mx-auto mt-3 max-w-[18ch] font-display text-[clamp(36px,5.2vw,58px)] font-bold leading-[0.98] tracking-[-0.045em]">
                <span className="block">What matters most</span>
                <span className="block">for this trip?</span>
              </h1>
            )}
            <p className="mx-auto mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted sm:text-[15.5px]">
              {stage === "basics"
                ? "Add your destination, dates and travelers. We’ll recommend the best flight and stay—and explain why."
                : "Optional: tune the recommendation now, or skip and teach us from the options you accept and reject."}
            </p>
          </div>

          {stage === "basics" ? (
            <div className="mx-auto mt-7 w-full max-w-[1000px]">
              <div className="grid gap-4 md:grid-cols-[1.05fr_1.15fr_.82fr]">
                <DestinationPicker value={destination} onChange={setDestination} />
                <DateRangePicker startDate={startDate} endDate={endDate} onChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
                <div>
                  <span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-faint">Travelers</span>
                  <div className={`${fieldShell} flex items-center justify-between gap-2 px-3`}>
                    <button type="button" onClick={() => setTravelers((value) => Math.max(1, value - 1))} className="grid h-9 w-9 place-items-center rounded-full text-[17px] text-muted transition hover:bg-paper-2 hover:text-ink" aria-label="Remove traveler">−</button>
                    <span className="text-center font-display text-[15px] font-semibold text-ink">{travelers} {travelers === 1 ? "person" : "people"}</span>
                    <button type="button" onClick={() => setTravelers((value) => Math.min(9, value + 1))} className="grid h-9 w-9 place-items-center rounded-full text-[17px] text-muted transition hover:bg-paper-2 hover:text-ink" aria-label="Add traveler">+</button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 pl-1">
                <span className="mr-1 text-[11px] font-semibold text-faint">Who&apos;s coming?</span>
                {PARTY_TYPES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => chooseParty(option)}
                    aria-pressed={partyType === option}
                    className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition ${partyType === option ? "border-ink bg-ink text-paper" : "border-hair bg-[rgba(255,255,255,0.64)] text-muted backdrop-blur hover:border-ink/30 hover:bg-white hover:text-ink"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button type="button" disabled={!basicsReady} onClick={startGuidedRecommendation} className="rounded-full bg-ink px-6 py-3 text-[13px] font-semibold text-paper transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-30">
                  See my recommendations →
                </button>
                <button type="button" disabled={!basicsReady} onClick={() => setStage("preferences")} className="rounded-full border border-hair bg-white/70 px-5 py-3 text-[12.5px] font-semibold text-muted backdrop-blur transition hover:border-ink/30 hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-30">
                  Add preferences first
                </button>
              </div>
              <p className="mt-3 text-center text-[11.5px] text-faint">No account required. You can change every choice later.</p>

              <section className="relative left-1/2 mt-9 w-screen max-w-none -translate-x-1/2 overflow-hidden border-t border-hair-2 pt-7">
                <div className="mx-auto flex max-w-[1000px] flex-wrap items-end justify-between gap-4 px-5 md:px-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">Start from an idea</p>
                    <h2 className="mt-1 font-display text-[clamp(22px,3vw,30px)] font-semibold tracking-[-0.03em]">Don&apos;t know the destination yet? That&apos;s fine.</h2>
                  </div>
                  <button type="button" onClick={() => openIdea()} className="rounded-full border border-hair bg-[rgba(255,255,255,0.68)] px-4 py-2.5 text-[12px] font-semibold text-muted backdrop-blur transition hover:border-ink/30 hover:bg-white hover:text-ink">Describe your own idea</button>
                </div>
                <div className="mt-5 grid gap-2.5">
                  <PromptMarquee items={TOP_IDEAS} direction="right" onPick={openIdea} />
                  <PromptMarquee items={BOTTOM_IDEAS} direction="left" onPick={openIdea} />
                </div>
              </section>
            </div>
          ) : (
            <div className="mx-auto mt-5 w-full max-w-[920px]">
              <div className="flex justify-center">
                <button type="button" onClick={() => setStage("basics")} className="rounded-full border border-hair bg-white/70 px-3.5 py-2 text-[11.5px] font-semibold text-muted backdrop-blur hover:border-ink/30 hover:text-ink">← Edit {destination.trim()} · {dateSummary}</button>
              </div>
              <div className="mt-2 px-0 sm:px-1 md:px-3">
                <ChoiceRow label="How should the trip feel?" helper="Pace" options={PACE_OPTIONS} value={pace} onChange={setPace} />
                <ChoiceRow label="What matters most in the stay?" helper="Hotel trade-off" options={STAY_OPTIONS} value={stay} onChange={setStay} />
                <ChoiceRow label="What should flights optimize for?" helper="Journey trade-off" options={FLIGHT_OPTIONS} value={flight} onChange={setFlight} />
                <ChoiceRow label="How should we treat the budget?" helper="Spend trade-off" options={BUDGET_OPTIONS} value={budget} onChange={setBudget} />
              </div>
              <label className="mt-4 block">
                <span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-faint">Anything more specific?</span>
                <div className={`${fieldShell} flex items-center`}>
                  <input value={extra} onChange={(event) => setExtra(event.target.value)} placeholder="Optional — no red-eyes, near a station, must have a pool…" className="w-full bg-transparent text-[13px] text-ink placeholder:text-faint sm:text-[13.5px]" style={{ outline: "none", boxShadow: "none" }} />
                </div>
              </label>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={startGuidedRecommendation} className="rounded-full bg-ink px-6 py-3 text-[13px] font-semibold text-paper transition hover:scale-[1.01]">See my recommendations →</button>
                <button type="button" onClick={startGuidedRecommendation} className="rounded-full px-5 py-3 text-[12.5px] font-semibold text-muted transition hover:text-ink">Skip for now</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1120px] flex-col justify-center px-5 py-10 md:px-8">
          <div className="mx-auto w-full max-w-[900px] text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">Start from an idea</p>
            <h1 className="mx-auto mt-4 max-w-[14ch] font-display text-[clamp(40px,6.2vw,70px)] font-bold leading-[0.97] tracking-[-0.045em]">What kind of trip do you need?</h1>
            <p className="mx-auto mt-5 max-w-[54ch] text-[16px] leading-relaxed text-muted sm:text-[16.5px]">Tell {PRODUCT.name} whatever you know. A place, a feeling, a constraint, or the problem you want the trip to solve.</p>
            <div className="home-prompt-shell mx-auto mt-7 w-full max-w-[760px]">
              <span className="home-prompt-glow" aria-hidden />
              <span className="home-prompt-edge" aria-hidden />
              <form onSubmit={(event) => { event.preventDefault(); submitIdea(); }} className="relative z-10 m-px flex h-[62px] items-center gap-3 rounded-full bg-white p-2 pl-4 shadow-[0_18px_48px_-34px_rgba(27,26,23,0.32)]">
                <Orb size={32} />
                <input autoFocus value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="Somewhere warm for Chinese New Year, good food, not too crowded…" aria-label="Describe your trip idea" className="home-prompt-input min-w-0 flex-1 rounded-full bg-transparent font-display text-[15px] font-medium tracking-[-0.02em] sm:text-[16.5px]" />
                <button type="submit" disabled={!idea.trim()} aria-label="Explore this idea" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-paper transition hover:scale-[1.04] active:scale-95 disabled:opacity-30">→</button>
              </form>
            </div>
            <button type="button" onClick={() => setMode("guided")} className="mt-4 rounded-full border border-hair bg-white/58 px-4 py-2 text-[12px] font-semibold text-muted backdrop-blur transition hover:border-ink/30 hover:bg-white hover:text-ink">I know where, when and who → use trip controls</button>
          </div>
          <div className="relative left-1/2 mt-9 w-screen max-w-none -translate-x-1/2 overflow-hidden">
            <div className="mx-auto mb-4 max-w-[1000px] px-5 text-left md:px-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">Need a starting point?</p>
              <h2 className="mt-1 font-display text-[22px] font-semibold tracking-[-0.03em]">Try one of these and make it yours.</h2>
            </div>
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
