"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ComparisonRound } from "@/components/choice";
import { CalibrationVignette } from "@/components/calibration-vignette";
import { ProfilePriorityBoard } from "@/components/profile-priority-board";
import { StickyAction } from "@/components/sticky-action";
import { Button, Eyebrow, SidePanel } from "@/components/ui";
import {
  AVOID_PRESETS,
  buildPrefsFromCalibration,
  LOYALTY_OPTIONS,
  MUST_HAVE_PRESETS,
  roundsFor,
  TOTAL_ROUNDS,
} from "@/lib/calibration";
import type { ChoiceValue, LoyaltyEntry, ProfilePref } from "@/lib/types";

const STEP_MUST = TOTAL_ROUNDS + 1;
const STEP_AVOID = TOTAL_ROUNDS + 2;
const STEP_LOYALTY = TOTAL_ROUNDS + 3;
const STEP_SUMMARY = TOTAL_ROUNDS + 4;

function ChipCapture({
  eyebrow,
  heading,
  presets,
  values,
  onChange,
  customPlaceholder,
  onBack,
  onContinue,
  footnote,
}: {
  eyebrow: string;
  heading: string;
  presets: string[];
  values: string[];
  onChange: (next: string[]) => void;
  customPlaceholder: string;
  onBack: () => void;
  onContinue: () => void;
  footnote?: string;
}) {
  const [custom, setCustom] = useState("");
  const toggle = (value: string) => onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  const addCustom = () => {
    const value = custom.trim();
    if (value && !values.includes(value)) onChange([...values, value]);
    setCustom("");
  };
  const customValues = values.filter((value) => !presets.includes(value));

  return (
    <div className="mx-auto max-w-[760px] px-5 py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back</button>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h1 className="font-display text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.04] tracking-[-0.035em]">{heading}</h1>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {presets.map((preset) => {
          const selected = values.includes(preset);
          return (
            <button
              key={preset}
              onClick={() => toggle(preset)}
              aria-pressed={selected}
              className={`rounded-full border px-4 py-2.5 text-[14px] font-semibold transition ${selected ? "border-accent bg-accent text-white" : "border-hair bg-surface text-ink-soft hover:border-ink"}`}
            >
              {preset}
            </button>
          );
        })}
        {customValues.map((value) => (
          <button key={value} onClick={() => toggle(value)} aria-pressed className="rounded-full border border-accent bg-accent px-4 py-2.5 text-[14px] font-semibold text-white">
            {value} ✕
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <input
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addCustom()}
          placeholder={customPlaceholder}
          className="w-full rounded-full border border-hair bg-surface px-4 py-3 text-[14px] outline-none focus-visible:border-accent"
        />
        <Button size="sm" variant="ghost" onClick={addCustom}>Add</Button>
      </div>
      {footnote && <p className="mt-4 text-[13px] leading-relaxed text-faint">{footnote}</p>}

      <StickyAction meta={`${values.length} selected`} note="You can come back and change these later.">
        <Button variant="accent" onClick={onContinue}>Continue →</Button>
      </StickyAction>
    </div>
  );
}

function LoyaltyCapture({
  loyalty,
  onAdd,
  onRemove,
  onBack,
  onContinue,
}: {
  loyalty: LoyaltyEntry[];
  onAdd: (entry: Omit<LoyaltyEntry, "id">) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [query, setQuery] = useState("");
  const has = (name: string) => loyalty.some((entry) => entry.name === name);
  const results = LOYALTY_OPTIONS.filter((option) => !has(option.name) && option.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6);

  return (
    <div className="mx-auto max-w-[760px] px-5 py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back</button>
        <Eyebrow>Loyalty</Eyebrow>
      </div>
      <h1 className="font-display text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.04] tracking-[-0.035em]">Any memberships we should know about?</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">Airlines, hotel groups or card benefits — so recommendations lean toward what you already earn on.</p>

      {loyalty.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {loyalty.map((entry) => (
            <button key={entry.id} onClick={() => onRemove(entry.id)} className="rounded-full border border-accent bg-accent px-3.5 py-2 text-[13.5px] font-semibold text-white">{entry.name} ✕</button>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search airlines, hotels, cards…"
        className="mt-6 w-full rounded-full border border-hair bg-surface px-4 py-3 text-[14px] outline-none focus-visible:border-accent"
      />
      {query.trim() && (
        <div className="mt-3 flex flex-wrap gap-2">
          {results.length ? results.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                onAdd({ name: option.name, kind: option.kind });
                setQuery("");
              }}
              className="rounded-full border border-hair bg-surface px-3.5 py-2 text-[13.5px] text-ink-soft transition hover:border-ink"
            >
              + {option.name}
            </button>
          )) : (
            <button
              onClick={() => {
                onAdd({ name: query.trim(), kind: "other" });
                setQuery("");
              }}
              className="rounded-full border border-hair bg-surface px-3.5 py-2 text-[13.5px] text-ink-soft transition hover:border-ink"
            >
              + Add “{query.trim()}”
            </button>
          )}
        </div>
      )}

      <StickyAction meta={loyalty.length ? `${loyalty.length} memberships added` : "Loyalty is optional"} note="Roam can recommend well without this.">
        <button onClick={onContinue} className="px-3 py-2 text-[13.5px] font-semibold text-muted hover:text-ink">Skip</button>
        <Button variant="accent" onClick={onContinue}>Review my profile →</Button>
      </StickyAction>
    </div>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <div className="cal-landing relative min-h-dvh overflow-hidden">
      <div className="cal-atmosphere" aria-hidden />
      <header className="relative z-10 mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 md:px-8">
        <span className="font-display text-[21px] font-extrabold tracking-[-0.03em]">Roam</span>
        <button onClick={() => setInfoOpen(true)} className="text-[13.5px] font-semibold text-muted transition hover:text-ink">What will I be asked?</button>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[1180px] items-center gap-12 px-5 pb-12 pt-5 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:pb-16 lg:gap-20">
        <div className="max-w-[560px]">
          <Eyebrow className="text-accent">Personalized from the start</Eyebrow>
          <h1 className="mt-5 font-display text-[clamp(44px,6.2vw,76px)] font-semibold leading-[0.94] tracking-[-0.055em]">Teach Roam your travel taste.</h1>
          <p className="mt-6 max-w-[48ch] text-[18px] leading-[1.65] text-muted">Eight quick choices help Roam recommend trips that feel more like you.</p>
          <div className="mt-8"><Button variant="ink" className="min-w-[184px]" onClick={onStart}>Start calibration <span aria-hidden>→</span></Button></div>
          <p className="mt-5 text-[13px] text-muted">About 3 minutes <span className="mx-1.5 text-hair">·</span> No lengthy forms <span className="mx-1.5 text-hair">·</span> Editable anytime</p>
        </div>
        <div className="w-full md:justify-self-end"><CalibrationVignette /></div>
      </main>

      <SidePanel open={infoOpen} onClose={() => setInfoOpen(false)} title="What will I be asked?">
        <p className="text-[15px] leading-relaxed text-muted">You&apos;ll choose between pairs of real travel trade-offs: direct or better value, central or roomier, slower days or fuller ones. There are no right answers.</p>
        <div className="mt-6 grid gap-5 border-l border-accent-line pl-5">
          <div><Eyebrow>Eight quick choices</Eyebrow><p className="mt-1 text-[14.5px] text-ink-soft">Tap what feels closer, or choose “It depends.”</p></div>
          <div><Eyebrow>Useful details</Eyebrow><p className="mt-1 text-[14.5px] text-ink-soft">Add must-haves, avoids, and any loyalty programs you use.</p></div>
          <div><Eyebrow>Your editable profile</Eyebrow><p className="mt-1 text-[14.5px] text-ink-soft">Review what Roam learned before anything is saved.</p></div>
        </div>
        <Button variant="ink" className="mt-8 w-full" onClick={() => { setInfoOpen(false); onStart(); }}>Start calibration →</Button>
      </SidePanel>
    </div>
  );
}

export default function CalibratePage() {
  const store = useStore();
  const router = useRouter();
  const { hydrated, onboarding, profile } = store;
  const step = onboarding.step;
  const answers = onboarding.answers;
  const rounds = roundsFor(answers);
  const [busy, setBusy] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  if (!hydrated) return <div className="mx-auto mt-24 h-8 w-40 rounded-lg shimmer" />;

  const goto = (next: number) => store.setCalStep(next);
  const selectRound = (roundId: string, value: ChoiceValue) => {
    if (busy) return;
    store.setCalAnswer(roundId, value);
    setBusy(true);
    advanceTimer.current = setTimeout(() => {
      setBusy(false);
      store.setCalStep(step + 1);
    }, 320);
  };
  const finish = (destination: string, prefs: ProfilePref[]) => {
    store.commitCalibration({ prefs, loyalty: profile.loyalty, mustHaves: profile.mustHaves, avoids: profile.avoids });
    try { sessionStorage.setItem("roam.justCalibrated", "1"); } catch { /* ignore */ }
    router.push(destination);
  };

  if (step <= 0) return <Welcome onStart={() => goto(1)} />;

  if (step >= 1 && step <= TOTAL_ROUNDS) {
    const index = step - 1;
    const round = rounds[index];
    return (
      <ComparisonRound
        round={round}
        index={index}
        total={TOTAL_ROUNDS}
        selected={answers[round.id] ?? null}
        onSelect={(value) => selectRound(round.id, value)}
        onBack={() => goto(step - 1)}
      />
    );
  }

  if (step === STEP_MUST) {
    return (
      <ChipCapture
        eyebrow="Must-haves"
        heading="What should Roam never compromise on?"
        presets={MUST_HAVE_PRESETS}
        values={profile.mustHaves}
        onChange={store.setMustHaves}
        customPlaceholder="Add something specific… e.g. only taxis when I'm there"
        footnote="Pick any that matter, add your own, or leave it empty — “None yet” is fine."
        onBack={() => goto(TOTAL_ROUNDS)}
        onContinue={() => goto(STEP_AVOID)}
      />
    );
  }

  if (step === STEP_AVOID) {
    return (
      <ChipCapture
        eyebrow="Absolute avoids"
        heading="Anything we should never recommend?"
        presets={AVOID_PRESETS}
        values={profile.avoids}
        onChange={store.setAvoids}
        customPlaceholder="Add your own… e.g. don't move hotels mid-trip"
        onBack={() => goto(STEP_MUST)}
        onContinue={() => goto(STEP_LOYALTY)}
      />
    );
  }

  if (step === STEP_LOYALTY) {
    return <LoyaltyCapture loyalty={profile.loyalty} onAdd={store.addLoyalty} onRemove={store.removeLoyalty} onBack={() => goto(STEP_AVOID)} onContinue={() => goto(STEP_SUMMARY)} />;
  }

  return (
    <ProfilePriorityBoard
      initial={buildPrefsFromCalibration(answers, profile.mustHaves, profile.avoids)}
      onBack={() => goto(STEP_LOYALTY)}
      onConfirm={(prefs) => finish("/", prefs)}
      onEdit={(prefs) => finish("/profile", prefs)}
    />
  );
}
