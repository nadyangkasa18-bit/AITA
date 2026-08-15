"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ReasoningProgress } from "@/components/reasoning";
import { Orb } from "@/components/ui";
import { PRODUCT } from "@/config/product";
import { reasoningSteps, SAMPLE_PROMPT } from "@/lib/mock/seed";

const EXAMPLES = [
  SAMPLE_PROMPT,
  "A long weekend under five hours, nothing too busy.",
  "Somewhere the four of us can switch off by the water.",
];

export default function Home() {
  const store = useStore();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<"idle" | "reasoning">("idle");
  const [tripId, setTripId] = useState<string | null>(null);

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
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1000px] flex-col justify-center px-5 py-12">
      <p className="text-center text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
        Good evening, Nadya
      </p>
      <h1 className="mx-auto mt-4 max-w-[15ch] text-center font-display text-[clamp(38px,6vw,64px)] font-bold leading-[1.02] tracking-[-0.035em]">
        What kind of trip do you need?
      </h1>
      <p className="mx-auto mt-4 max-w-[52ch] text-center text-lg leading-relaxed text-muted">
        Tell {PRODUCT.name} what you know — even if it&apos;s vague. It works out the rest, and
        tells you why.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="mx-auto mt-9 flex w-full max-w-[720px] items-center gap-3 rounded-full border border-hair bg-surface p-2.5 pl-5 shadow-[var(--shadow-card)] focus-within:shadow-[var(--shadow-float)]"
      >
        <Orb size={30} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="A trip I'm thinking about…"
          aria-label="Describe your trip"
          className="min-w-0 flex-1 bg-transparent font-display text-[19px] font-medium tracking-[-0.02em] outline-none placeholder:text-faint"
        />
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
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-paper transition active:scale-95"
        >
          →
        </button>
      </form>

      <div className="mx-auto mt-5 flex items-center justify-center">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 rounded-full bg-accent-tint px-3 py-1.5 text-[12.5px] font-semibold text-accent transition hover:brightness-95"
        >
          <Orb size={18} /> Roam already knows how you like to travel
        </Link>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[720px] flex-col items-center gap-2">
        <span className="text-[12px] text-faint">Or start from an idea</span>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => submit(ex)}
              className="rounded-full border border-hair-2 bg-transparent px-3.5 py-2 text-left text-[13.5px] leading-snug text-muted transition hover:border-ink hover:text-ink"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
