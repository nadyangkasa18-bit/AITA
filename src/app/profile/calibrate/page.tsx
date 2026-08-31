"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Eyebrow, PrototypeBadge } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { ProfilePref } from "@/lib/types";

type PreferenceTemplate = Omit<ProfilePref, "id" | "order" | "source">;
type QuestionOption = {
  id: string;
  label: string;
  detail: string;
  pref?: PreferenceTemplate;
};
type Question = {
  id: string;
  eyebrow: string;
  title: string;
  helper: string;
  mode: "single" | "multi";
  options: QuestionOption[];
};

const QUESTIONS: Question[] = [
  {
    id: "flight-priority",
    eyebrow: "Flights",
    title: "When flights differ, what usually wins?",
    helper: "Pick the default you would want me to optimize first. You can still override it for any trip.",
    mode: "single",
    options: [
      {
        id: "nonstop",
        label: "Nonstop, when practical",
        detail: "I would rather reduce connections and travel friction.",
        pref: { category: "Flights", statement: "Prefer nonstop flights when practical.", priority: "usually", scope: "all", confidence: 0.84 },
      },
      {
        id: "times",
        label: "Better departure & arrival times",
        detail: "A good schedule matters more than the absolute cheapest fare.",
        pref: { category: "Flights", statement: "Prefer comfortable departure and arrival times over the absolute lowest fare.", priority: "usually", scope: "all", confidence: 0.84 },
      },
      {
        id: "cost",
        label: "Lowest sensible total cost",
        detail: "Show me where I can save without making the journey unreasonable.",
        pref: { category: "Spending", statement: "Prioritize strong overall value and keep total travel cost sensible.", priority: "usually", scope: "all", confidence: 0.82 },
      },
      {
        id: "flexibility",
        label: "An easier-to-change fare",
        detail: "I value flexibility when plans are not completely locked.",
        pref: { category: "Flights", statement: "Prefer fares with easier changes or refunds when the premium is reasonable.", priority: "usually", scope: "all", confidence: 0.82 },
      },
      { id: "depends", label: "It depends on the trip", detail: "Do not make a standing assumption here." },
    ],
  },
  {
    id: "flight-comfort",
    eyebrow: "Flight defaults",
    title: "What should I remember about your flights?",
    helper: "Choose any that are useful as standing defaults. Leaving this blank is completely fine.",
    mode: "multi",
    options: [
      {
        id: "no-red-eyes",
        label: "Avoid red-eyes",
        detail: "Do not trade sleep for a slightly cheaper or shorter journey.",
        pref: { category: "Flights", statement: "Avoid red-eye and overnight departures when practical.", priority: "avoid", scope: "all", confidence: 0.86 },
      },
      {
        id: "morning",
        label: "Morning departures",
        detail: "Lean toward leaving earlier in the day.",
        pref: { category: "Flights", statement: "Prefer morning departures when practical.", priority: "usually", scope: "all", confidence: 0.8 },
      },
      {
        id: "aisle",
        label: "Aisle seat",
        detail: "Use aisle as the default seating preference.",
        pref: { category: "Flights", statement: "Prefer an aisle seat when seat selection is available.", priority: "usually", scope: "all", confidence: 0.86 },
      },
      {
        id: "window",
        label: "Window seat",
        detail: "Use window as the default seating preference.",
        pref: { category: "Flights", statement: "Prefer a window seat when seat selection is available.", priority: "usually", scope: "all", confidence: 0.86 },
      },
      {
        id: "bag",
        label: "Checked bag usually included",
        detail: "Compare fares using the baggage I am likely to need.",
        pref: { category: "Flights", statement: "Usually include a checked bag when comparing flight fares.", priority: "usually", scope: "all", confidence: 0.8 },
      },
      { id: "none", label: "No strong flight defaults", detail: "Keep flight comfort flexible by trip." },
    ],
  },
  {
    id: "stay-style",
    eyebrow: "Stays",
    title: "What makes a stay feel right?",
    helper: "Think about the trade-off you make most often, not the hotel you would choose for every single trip.",
    mode: "single",
    options: [
      {
        id: "central",
        label: "Central & walkable",
        detail: "I will pay attention to how much daily transport the location removes.",
        pref: { category: "Stays", statement: "Prefer central, walkable stays that reduce daily transport.", priority: "usually", scope: "all", confidence: 0.84 },
      },
      {
        id: "quiet",
        label: "Quieter neighborhood",
        detail: "A calmer base matters more than being in the absolute center.",
        pref: { category: "Stays", statement: "Prefer quieter neighborhoods when the location is still practical.", priority: "usually", scope: "all", confidence: 0.82 },
      },
      {
        id: "space",
        label: "More room & comfort",
        detail: "Give extra weight to room size and everyday comfort.",
        pref: { category: "Stays", statement: "Give extra weight to room size and everyday comfort when choosing stays.", priority: "usually", scope: "all", confidence: 0.82 },
      },
      {
        id: "design",
        label: "Boutique & design-led",
        detail: "I like distinctive stays over something purely functional.",
        pref: { category: "Stays", statement: "Lean toward distinctive, design-conscious stays when the fundamentals are strong.", priority: "usually", scope: "all", confidence: 0.82 },
      },
      {
        id: "value",
        label: "Best value for the stay",
        detail: "Spend where it improves the trip, but avoid paying for things I will not use.",
        pref: { category: "Spending", statement: "Look for strong stay value and avoid paying for amenities that add little to the trip.", priority: "usually", scope: "all", confidence: 0.8 },
      },
      { id: "depends", label: "It depends on the trip", detail: "Keep the type of stay open until the trip gives us more context." },
    ],
  },
  {
    id: "pace",
    eyebrow: "Pace",
    title: "How full should your days feel?",
    helper: "This helps me judge whether an itinerary is exciting or simply exhausting for you.",
    mode: "single",
    options: [
      {
        id: "full",
        label: "Full days — I want to see a lot",
        detail: "I am comfortable fitting more into each day when the routing makes sense.",
        pref: { category: "Pace", statement: "Prefer fuller days with more things to see and do when routing is efficient.", priority: "usually", scope: "all", confidence: 0.84 },
      },
      {
        id: "balanced",
        label: "Balanced",
        detail: "Give me meaningful plans, but leave some breathing room.",
        pref: { category: "Pace", statement: "Prefer a balanced itinerary with meaningful plans and some breathing room.", priority: "usually", scope: "all", confidence: 0.84 },
      },
      {
        id: "slow",
        label: "Slow — leave room to wander",
        detail: "I would rather do fewer things well than maximize the checklist.",
        pref: { category: "Pace", statement: "Prefer a slower itinerary with room to wander and change plans.", priority: "usually", scope: "all", confidence: 0.84 },
      },
      { id: "depends", label: "It depends on the trip", detail: "Do not assume the same pace everywhere." },
    ],
  },
  {
    id: "food",
    eyebrow: "Food",
    title: "How much should food shape the trip?",
    helper: "This changes how aggressively I prioritize neighborhoods, reservations, and time around meals.",
    mode: "single",
    options: [
      {
        id: "food-first",
        label: "A lot — food is part of why I travel",
        detail: "Great meals can justify changing the route or neighborhood.",
        pref: { category: "Food", statement: "Great food should meaningfully shape the trip, including neighborhoods and timing.", priority: "usually", scope: "all", confidence: 0.86 },
      },
      {
        id: "local",
        label: "Local favorites over formal dining",
        detail: "Prioritize casual local places and regional specialties.",
        pref: { category: "Food", statement: "Prefer casual local favorites and regional specialties over formal dining by default.", priority: "usually", scope: "all", confidence: 0.82 },
      },
      {
        id: "convenient",
        label: "Good & convenient is enough",
        detail: "Do not bend the entire itinerary around restaurants.",
        pref: { category: "Food", statement: "Prefer good, convenient food without bending the itinerary around restaurants.", priority: "usually", scope: "all", confidence: 0.8 },
      },
      { id: "depends", label: "It depends on the trip", detail: "Let the destination decide how important food should be." },
    ],
  },
  {
    id: "transport",
    eyebrow: "Getting around",
    title: "What usually feels easiest on the ground?",
    helper: "This is a default, not a rule — destination realities still come first.",
    mode: "single",
    options: [
      {
        id: "walk-transit",
        label: "Walk + public transit",
        detail: "Favor neighborhoods and plans that work well without a car.",
        pref: { category: "Ground transport", statement: "Prefer trips that work well on foot and by public transit.", priority: "usually", scope: "all", confidence: 0.84 },
      },
      {
        id: "transit",
        label: "Public transit first",
        detail: "Use trains, metro, and buses as the default when practical.",
        pref: { category: "Ground transport", statement: "Use public transit as the default when it is practical and reliable.", priority: "usually", scope: "all", confidence: 0.82 },
      },
      {
        id: "rideshare",
        label: "Taxi / rideshare for convenience",
        detail: "I am happy to pay a bit more to remove transport friction.",
        pref: { category: "Ground transport", statement: "Use taxis or rideshare when they meaningfully reduce transport friction.", priority: "usually", scope: "all", confidence: 0.8 },
      },
      {
        id: "car",
        label: "Rental car when it opens up the trip",
        detail: "Do not avoid driving if a car materially improves the experience.",
        pref: { category: "Ground transport", statement: "Recommend a rental car when it materially improves access or routing.", priority: "usually", scope: "all", confidence: 0.8 },
      },
      { id: "depends", label: "It depends on the destination", detail: "Choose transport based on the place, not a standing preference." },
    ],
  },
  {
    id: "spending",
    eyebrow: "Value",
    title: "Where do you sit on cost vs. convenience?",
    helper: "This gives recommendations the right baseline before a specific trip budget takes over.",
    mode: "single",
    options: [
      {
        id: "save-time",
        label: "I will pay more to save meaningful time",
        detail: "Convenience is worth a premium when it noticeably improves the trip.",
        pref: { category: "Spending", statement: "Pay a reasonable premium when it saves meaningful time or friction.", priority: "usually", scope: "all", confidence: 0.84 },
      },
      {
        id: "balance",
        label: "Balance value & convenience",
        detail: "Avoid false economies, but keep upgrades proportionate to the benefit.",
        pref: { category: "Spending", statement: "Balance value and convenience; avoid false economies and unnecessary upgrades.", priority: "usually", scope: "all", confidence: 0.84 },
      },
      {
        id: "save",
        label: "Optimize cost where possible",
        detail: "I would rather keep more of the budget for the trip itself.",
        pref: { category: "Spending", statement: "Optimize cost where practical and make convenience premiums explicit.", priority: "usually", scope: "all", confidence: 0.82 },
      },
      { id: "depends", label: "It depends on the trip", detail: "Let each trip budget set the trade-off." },
    ],
  },
];

function Progress({ index }: { index: number }) {
  const percent = ((index + 1) / QUESTIONS.length) * 100;
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
        <span>Traveler preferences</span>
        <span>{index + 1} of {QUESTIONS.length}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-hair-2">
        <div className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out motion-reduce:transition-none" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function ProfileCalibratePage() {
  const store = useStore();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const question = QUESTIONS[index];
  const selected = answers[question.id] ?? [];
  const answerCount = useMemo(() => Object.values(answers).reduce((total, values) => total + values.length, 0), [answers]);

  if (!store.hydrated) return <div className="mx-auto mt-24 h-8 w-40 rounded-lg shimmer" />;

  const toggle = (option: QuestionOption) => {
    setAnswers((current) => {
      const existing = current[question.id] ?? [];
      if (question.mode === "single") return { ...current, [question.id]: [option.id] };
      if (option.id === "none") return { ...current, [question.id]: existing.includes("none") ? [] : ["none"] };
      const withoutNone = existing.filter((id) => id !== "none");
      const next = withoutNone.includes(option.id) ? withoutNone.filter((id) => id !== option.id) : [...withoutNone, option.id];
      return { ...current, [question.id]: next };
    });
  };

  const finish = () => {
    const guided = QUESTIONS.flatMap((item) => {
      const chosen = answers[item.id] ?? [];
      return item.options
        .filter((option) => chosen.includes(option.id) && option.pref)
        .map((option) => option.pref!);
    });
    const preserved = store.profile.prefs.filter((pref) => pref.source !== "onboarding");
    const generated: ProfilePref[] = guided.map((pref, itemIndex) => ({
      ...pref,
      id: `guided-${Date.now().toString(36)}-${itemIndex + 1}`,
      order: preserved.length + itemIndex + 1,
      source: "onboarding",
    }));

    store.commitCalibration({
      prefs: [...preserved, ...generated],
      loyalty: store.profile.loyalty,
      mustHaves: store.profile.mustHaves,
      avoids: store.profile.avoids,
    });
    router.push("/profile");
  };

  const isLast = index === QUESTIONS.length - 1;

  return (
    <main className="mx-auto min-h-[calc(100dvh-4rem)] max-w-[880px] px-5 py-10 md:px-8 md:py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/profile" className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back to profile</Link>
        <PrototypeBadge />
      </div>

      <Progress index={index} />

      <section key={question.id} className="animate-[guided-question-in_260ms_ease-out] motion-reduce:animate-none">
        <Eyebrow>{question.eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-[16ch] font-display text-[clamp(36px,6vw,56px)] font-semibold leading-[0.98] tracking-[-0.045em]">
          {question.title}
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted">{question.helper}</p>
        {question.mode === "multi" && <p className="mt-2 text-[12px] font-medium text-faint">Select any that feel useful.</p>}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => {
            const active = selected.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(option)}
                className={`group min-h-[118px] rounded-[24px] border p-5 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 motion-reduce:transition-none ${active ? "border-ink bg-ink text-paper shadow-[0_18px_44px_-30px_rgba(27,26,23,.7)]" : "border-hair bg-surface hover:-translate-y-0.5 hover:border-ink/25 hover:bg-white"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-[17px] font-semibold tracking-[-0.02em]">{option.label}</p>
                    <p className={`mt-2 text-[12.5px] leading-relaxed ${active ? "text-paper/70" : "text-muted"}`}>{option.detail}</p>
                  </div>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] transition ${active ? "border-paper/30 bg-paper text-ink" : "border-hair text-transparent group-hover:border-ink/25"}`}>✓</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-hair-2 pt-5">
        <button
          type="button"
          onClick={() => setIndex((current) => Math.max(0, current - 1))}
          disabled={index === 0}
          className="text-[13px] font-semibold text-muted transition hover:text-ink disabled:invisible"
        >
          ← Previous
        </button>
        <div className="flex items-center gap-3">
          {!selected.length && <span className="hidden text-[11.5px] text-faint sm:inline">Skipping keeps this flexible.</span>}
          <Button
            variant={isLast ? "accent" : "ink"}
            onClick={() => isLast ? finish() : setIndex((current) => current + 1)}
          >
            {isLast ? `Save ${answerCount ? "my defaults" : "without defaults"} →` : selected.length ? "Continue →" : "Skip →"}
          </Button>
        </div>
      </div>

      <p className="mt-8 max-w-[58ch] text-[12px] leading-relaxed text-faint">
        These become editable defaults, not rules. A specific trip can always override them, and you can remove any preference from your Traveler Profile later.
      </p>

      <style jsx>{`
        @keyframes guided-question-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
