"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { InteractiveTravelField } from "@/components/interactive-travel-field";
import { ReasoningProgress } from "@/components/reasoning";
import { Orb, useToast } from "@/components/ui";
import { PRODUCT } from "@/config/product";
import { reasoningSteps, SAMPLE_PROMPT } from "@/lib/mock/seed";

const PROMPT_SUGGESTIONS = [
  "I need a weekend somewhere that feels like a reset…",
  "Where can I take two kids without spending half the trip in transit?",
  "Somewhere warm for Chinese New Year, but not too crowded…",
  "Plan me a food-first long weekend under five hours from Jakarta…",
  "I want mountains, a great hotel, and absolutely no red-eyes…",
];

const EXAMPLES = [
  SAMPLE_PROMPT,
  "A long weekend under five hours, nothing too busy.",
  "Somewhere the four of us can switch off by the water.",
];

export default function Home() {
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<"idle" | "reasoning">("idle");
  const [tripId, setTripId] = useState<string | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [promptVisible, setPromptVisible] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("roam.justCalibrated")) {
        sessionStorage.removeItem("roam.justCalibrated");
        toast("You’re all set — Roam knows your travel style now.");
      }
    } catch {
      /* ignore */
    }
  }, [toast]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let changeTimer: ReturnType<typeof setTimeout> | null = null;
    const cycle = setInterval(() => {
      setPromptVisible(false);
      changeTimer = setTimeout(() => {
        setPromptIndex((index) => (index + 1) % PROMPT_SUGGESTIONS.length);
        setPromptVisible(true);
      }, 220);
    }, 4200);

    return () => {
      clearInterval(cycle);
      if (changeTimer) clearTimeout(changeTimer);
    };
  }, []);

  function submit(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    const id = store.createTripFromPrompt(text);
    setTripId(id);
    setPhase("reasoning");
  }

  if (phase === "reasoning" && tripId) {
    return (
      <ReasoningProgress
        steps={reasoningSteps}
        headline="Understanding what the group wants…"
        onDone={() => router.push(`/trips/${tripId}/brief`)}
      />
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <InteractiveTravelField />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(244,242,236,0.08),rgba(244,242,236,0.54)_56%,rgba(244,242,236,0.88)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1080px] flex-col justify-center px-5 py-12">
        <p className="text-center text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
          Good evening, Nadya
        </p>
        <h1 className="mx-auto mt-4 max-w-[14ch] text-center font-display text-[clamp(42px,6.4vw,72px)] font-bold leading-[0.97] tracking-[-0.045em]">
          What kind of trip do you need?
        </h1>
        <p className="mx-auto mt-5 max-w-[54ch] text-center text-[17px] leading-relaxed text-muted">
          Tell {PRODUCT.name} what you know — a place, a feeling, a problem to solve, or just who’s coming. It’ll help figure out the rest.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(value);
          }}
          className="mx-auto mt-9 flex w-full max-w-[760px] items-center gap-3 rounded-full border border-[rgba(27,26,23,0.14)] bg-[rgba(255,255,255,0.86)] p-2.5 pl-5 shadow-[0_20px_60px_-32px_rgba(27,26,23,0.42)] backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 focus-within:-translate-y-0.5 focus-within:border-[rgba(27,26,23,0.28)] focus-within:shadow-[0_28px_72px_-34px_rgba(27,26,23,0.5)]"
        >
          <Orb size={30} />
          <div className="relative min-w-0 flex-1">
            {!value && (
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center truncate pr-2 font-display text-[18px] font-medium tracking-[-0.02em] text-faint transition-all duration-200 ${
                  promptVisible ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0"
                }`}
              >
                {PROMPT_SUGGESTIONS[promptIndex]}
              </span>
            )}
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder=""
              aria-label="Describe your trip"
              className="relative z-10 w-full bg-transparent font-display text-[18px] font-medium tracking-[-0.02em] outline-none"
            />
          </div>
          <button
            type="button"
            aria-label="Voice (visual only)"
            className="hidden h-11 w-11 place-items-center rounded-full border border-hair text-ink-soft transition hover:bg-hair-2 sm:grid"
            tabIndex={-1}
          >
            ⌥
          </button>
          <button
            type="submit"
            aria-label="Send"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-paper transition duration-200 hover:scale-[1.04] active:scale-95"
          >
            →
          </button>
        </form>

        <div className="mx-auto mt-5 flex items-center justify-center">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-[rgba(238,236,255,0.62)] px-3 py-1.5 text-[12.5px] font-semibold text-accent backdrop-blur-sm transition hover:bg-accent-tint"
          >
            <Orb size={18} /> Roam remembers how you like to travel
          </Link>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-[760px] flex-col items-center gap-2">
          <span className="text-[12px] text-faint">Or start from an idea</span>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => submit(example)}
                className="rounded-full border border-[rgba(27,26,23,0.09)] bg-[rgba(255,255,255,0.42)] px-3.5 py-2 text-left text-[13.5px] leading-snug text-muted backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(27,26,23,0.24)] hover:bg-[rgba(255,255,255,0.75)] hover:text-ink"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
