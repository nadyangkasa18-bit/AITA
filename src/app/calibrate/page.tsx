"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ComparisonRound } from "@/components/choice";
import { CalibrationVignette } from "@/components/calibration-vignette";
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

/* step map: 0 welcome · 1..8 rounds · 9 must · 10 avoid · 11 loyalty · 12 summary */
const STEP_MUST = TOTAL_ROUNDS + 1; // 9
const STEP_AVOID = TOTAL_ROUNDS + 2; // 10
const STEP_LOYALTY = TOTAL_ROUNDS + 3; // 11
const STEP_SUMMARY = TOTAL_ROUNDS + 4; // 12

const SOURCE_LABEL: Record<string, string> = {
  onboarding: "Onboarding choice",
  added: "Added by you",
  confirmed: "Confirmed from a decision",
};
const PRIORITY_GROUPS: { key: ProfilePref["priority"]; label: string }[] = [
  { key: "always", label: "Always prioritize" },
  { key: "usually", label: "Usually prefer" },
  { key: "flexible", label: "Flexible" },
  { key: "avoid", label: "Avoid" },
];

/* -------------------- multi-select capture -------------------- */
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
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  const addCustom = () => {
    const v = custom.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setCustom("");
  };
  const customValues = values.filter((v) => !presets.includes(v));

  return (
    <div className="mx-auto max-w-[720px] px-5 py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px] font-medium text-muted transition hover:text-ink">
          ← Back
        </button>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h1 className="mb-7 font-display text-[clamp(26px,4.5vw,40px)] leading-[1.06] tracking-[-0.035em]">
        {heading}
      </h1>

      <div className="flex flex-wrap gap-2.5">
        {presets.map((p) => {
          const on = values.includes(p);
          return (
            <button
              key={p}
              onClick={() => toggle(p)}
              aria-pressed={on}
              className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition ${
                on ? "border-accent bg-accent text-[#f3f6f1]" : "border-hair text-ink-soft hover:border-ink"
              }`}
            >
              {p}
            </button>
          );
        })}
        {customValues.map((p) => (
          <button
            key={p}
            onClick={() => toggle(p)}
            aria-pressed
            className="rounded-full border border-accent bg-accent px-4 py-2.5 text-[14px] font-medium text-[#f3f6f1]"
          >
            {p} ✕
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder={customPlaceholder}
          className="w-full rounded-full border border-hair bg-surface px-4 py-2.5 text-[14px] outline-none focus-visible:border-accent"
        />
        <Button size="sm" variant="ghost" onClick={addCustom}>
          Add
        </Button>
      </div>

      {footnote && <p className="mt-4 text-[13px] text-faint">{footnote}</p>}

      <div className="mt-9">
        <Button variant="accent" onClick={onContinue}>
          Continue →
        </Button>
      </div>
    </div>
  );
}

/* -------------------- loyalty capture -------------------- */
function LoyaltyCapture({
  loyalty,
  onAdd,
  onRemove,
  onBack,
  onContinue,
}: {
  loyalty: LoyaltyEntry[];
  onAdd: (e: Omit<LoyaltyEntry, "id">) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [query, setQuery] = useState("");
  const has = (name: string) => loyalty.some((l) => l.name === name);
  const results = LOYALTY_OPTIONS.filter(
    (o) => !has(o.name) && o.name.toLowerCase().includes(query.trim().toLowerCase())
  ).slice(0, 6);

  return (
    <div className="mx-auto max-w-[720px] px-5 py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px] font-medium text-muted transition hover:text-ink">
          ← Back
        </button>
        <Eyebrow>Loyalty</Eyebrow>
      </div>
      <h1 className="mb-2 font-display text-[clamp(26px,4.5vw,40px)] leading-[1.06] tracking-[-0.035em]">
        Any memberships we should know about?
      </h1>
      <p className="mb-6 text-[15px] text-muted">
        Airlines, hotel groups or card benefits — so recommendations lean toward what you already earn on.
      </p>

      {loyalty.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {loyalty.map((l) => (
            <button
              key={l.id}
              onClick={() => onRemove(l.id)}
              className="rounded-full border border-accent bg-accent px-3.5 py-2 text-[13.5px] font-medium text-[#f3f6f1]"
            >
              {l.name} ✕
            </button>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search airlines, hotels, cards…"
        className="w-full rounded-full border border-hair bg-surface px-4 py-2.5 text-[14px] outline-none focus-visible:border-accent"
      />
      {query.trim() && (
        <div className="mt-2 flex flex-wrap gap-2">
          {results.length ? (
            results.map((o) => (
              <button
                key={o.name}
                onClick={() => {
                  onAdd({ name: o.name, kind: o.kind });
                  setQuery("");
                }}
                className="rounded-full border border-hair px-3.5 py-2 text-[13.5px] text-ink-soft transition hover:border-ink"
              >
                + {o.name}
              </button>
            ))
          ) : (
            <button
              onClick={() => {
                onAdd({ name: query.trim(), kind: "other" });
                setQuery("");
              }}
              className="rounded-full border border-hair px-3.5 py-2 text-[13.5px] text-ink-soft transition hover:border-ink"
            >
              + Add “{query.trim()}”
            </button>
          )}
        </div>
      )}

      <div className="mt-9 flex flex-wrap items-center gap-4">
        <Button variant="accent" onClick={onContinue}>
          Continue →
        </Button>
        <button onClick={onContinue} className="text-[13.5px] font-medium text-muted hover:text-ink">
          I don&apos;t use loyalty programs
        </button>
      </div>
    </div>
  );
}

/* -------------------- summary -------------------- */
function Summary({
  initial,
  onBack,
  onConfirm,
  onEdit,
}: {
  initial: ProfilePref[];
  onBack: () => void;
  onConfirm: (prefs: ProfilePref[]) => void;
  onEdit: (prefs: ProfilePref[]) => void;
}) {
  const [draft, setDraft] = useState<ProfilePref[]>(initial);
  const update = (id: string, patch: Partial<ProfilePref>) =>
    setDraft(draft.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div className="mx-auto max-w-[720px] px-5 py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px] font-medium text-muted transition hover:text-ink">
          ← Back
        </button>
        <Eyebrow>Your profile</Eyebrow>
      </div>
      <h1 className="font-display text-[clamp(28px,5vw,44px)] leading-[1.04] tracking-[-0.035em]">
        Here&apos;s how Roam understands you
      </h1>
      <p className="mt-3 text-[16px] text-muted">
        Every line is editable, and nothing is permanent — you can change any of it later.
      </p>

      <div className="mt-8 grid gap-8">
        {PRIORITY_GROUPS.map((g) => {
          const rows = draft.filter((p) => p.priority === g.key);
          if (!rows.length) return null;
          return (
            <section key={g.key}>
              <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">
                {g.label}
              </h2>
              <div className="grid gap-2.5">
                {rows.map((p) => (
                  <div key={p.id} className="rounded-lg border border-hair bg-surface p-4">
                    <input
                      value={p.statement}
                      onChange={(e) => update(p.id, { statement: e.target.value })}
                      className="w-full bg-transparent text-[15px] text-ink outline-none focus-visible:text-accent"
                      aria-label="Preference"
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[11.5px] text-faint">
                        {p.category} · {SOURCE_LABEL[p.source]}
                      </span>
                      <select
                        value={p.priority}
                        onChange={(e) => update(p.id, { priority: e.target.value as ProfilePref["priority"] })}
                        className="rounded-full border border-hair bg-surface px-2.5 py-1 text-[12px] text-ink-soft outline-none"
                        aria-label="Priority"
                      >
                        {PRIORITY_GROUPS.map((o) => (
                          <option key={o.key} value={o.key}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-start gap-3">
        <Button variant="accent" onClick={() => onConfirm(draft)}>
          Looks right →
        </Button>
        <button
          onClick={() => onEdit(draft)}
          className="text-[14px] font-medium text-muted hover:text-ink"
        >
          Make changes in my profile
        </button>
      </div>
    </div>
  );
}

/* -------------------- welcome -------------------- */
function Welcome({ onStart }: { onStart: () => void }) {
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <div className="cal-landing relative min-h-dvh overflow-hidden">
      <div className="cal-atmosphere" aria-hidden />
      <header className="relative z-10 mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 md:px-8">
        <span className="font-display text-[21px] font-extrabold tracking-[-0.03em]">Roam</span>
        <button
          onClick={() => setInfoOpen(true)}
          className="text-[13.5px] font-semibold text-muted transition hover:text-ink"
        >
          What will I be asked?
        </button>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[1180px] items-center gap-12 px-5 pb-12 pt-5 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:pb-16 lg:gap-20">
        <div className="max-w-[560px]">
          <Eyebrow className="text-accent">Personalized from the start</Eyebrow>
          <h1 className="mt-5 font-display text-[clamp(44px,6.2vw,76px)] font-semibold leading-[0.94] tracking-[-0.055em]">
            Teach Roam your travel taste.
          </h1>
          <p className="mt-6 max-w-[48ch] text-[18px] leading-[1.65] text-muted">
            Eight quick choices help Roam recommend trips that feel more like you.
          </p>
          <div className="mt-8">
            <Button variant="ink" className="min-w-[184px]" onClick={onStart}>
              Start calibration <span aria-hidden>→</span>
            </Button>
          </div>
          <p className="mt-5 text-[13px] text-muted">
            About 3 minutes <span className="mx-1.5 text-hair">·</span> No lengthy forms
            <span className="mx-1.5 text-hair">·</span> Editable anytime
          </p>
        </div>

        <div className="w-full md:justify-self-end">
          <CalibrationVignette />
        </div>
      </main>

      <SidePanel open={infoOpen} onClose={() => setInfoOpen(false)} title="What will I be asked?">
        <p className="text-[15px] leading-relaxed text-muted">
          You&apos;ll choose between pairs of real travel trade-offs: direct or better value,
          central or roomier, slower days or fuller ones. There are no right answers.
        </p>
        <div className="mt-6 grid gap-5 border-l border-accent-line pl-5">
          <div><Eyebrow>Eight quick choices</Eyebrow><p className="mt-1 text-[14.5px] text-ink-soft">Tap what feels closer, or choose “It depends.”</p></div>
          <div><Eyebrow>Useful details</Eyebrow><p className="mt-1 text-[14.5px] text-ink-soft">Add must-haves, avoids, and any loyalty programs you use.</p></div>
          <div><Eyebrow>Your editable profile</Eyebrow><p className="mt-1 text-[14.5px] text-ink-soft">Review what Roam learned before anything is saved.</p></div>
        </div>
        <Button variant="ink" className="mt-8 w-full" onClick={() => { setInfoOpen(false); onStart(); }}>
          Start calibration →
        </Button>
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

  if (!hydrated) {
    return <div className="mx-auto mt-24 h-8 w-40 rounded-lg shimmer" />;
  }

  const goto = (n: number) => store.setCalStep(n);

  const selectRound = (roundId: string, v: ChoiceValue) => {
    if (busy) return;
    store.setCalAnswer(roundId, v);
    setBusy(true);
    advanceTimer.current = setTimeout(() => {
      setBusy(false);
      store.setCalStep(step + 1);
    }, 320);
  };

  const finish = (destination: string, prefs: ProfilePref[]) => {
    store.commitCalibration({
      prefs,
      loyalty: profile.loyalty,
      mustHaves: profile.mustHaves,
      avoids: profile.avoids,
    });
    try {
      sessionStorage.setItem("roam.justCalibrated", "1");
    } catch {
      /* ignore */
    }
    router.push(destination);
  };

  /* ---- welcome ---- */
  if (step <= 0) return <Welcome onStart={() => goto(1)} />;

  /* ---- rounds 1..8 ---- */
  if (step >= 1 && step <= TOTAL_ROUNDS) {
    const i = step - 1;
    const round = rounds[i];
    return (
      <ComparisonRound
        round={round}
        index={i}
        total={TOTAL_ROUNDS}
        selected={answers[round.id] ?? null}
        onSelect={(v) => selectRound(round.id, v)}
        onBack={() => goto(step - 1)}
      />
    );
  }

  /* ---- must-haves ---- */
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

  /* ---- avoids ---- */
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

  /* ---- loyalty ---- */
  if (step === STEP_LOYALTY) {
    return (
      <LoyaltyCapture
        loyalty={profile.loyalty}
        onAdd={store.addLoyalty}
        onRemove={store.removeLoyalty}
        onBack={() => goto(STEP_AVOID)}
        onContinue={() => goto(STEP_SUMMARY)}
      />
    );
  }

  /* ---- summary ---- */
  return (
    <Summary
      initial={buildPrefsFromCalibration(answers, profile.mustHaves, profile.avoids)}
      onBack={() => goto(STEP_LOYALTY)}
      onConfirm={(prefs) => finish("/", prefs)}
      onEdit={(prefs) => finish("/profile", prefs)}
    />
  );
}
