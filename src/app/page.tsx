"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ReasoningProgress } from "@/components/reasoning";
import { TravelField } from "@/components/travel-field";
import { Orb, useToast } from "@/components/ui";
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
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<"idle" | "reasoning">("idle");
  const [tripId, setTripId] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("roam.justCalibrated")) {
        sessionStorage.removeItem("roam.justCalibrated");
        toast("Your recommendations are now calibrated.");
      }
    } catch { /* ignore */ }
  }, [toast]);

  function submit(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    const id = store.createTripFromPrompt(text);
    setTripId(id);
    setPhase("reasoning");
  }

  if (phase === "reasoning" && tripId) {
    return <ReasoningProgress steps={reasoningSteps} headline="Understanding what the group wants…" onDone={() => router.push(`/trips/${tripId}/brief`)} />;
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <TravelField />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(244,242,236,0.18),rgba(244,242,236,0.76)_58%,rgba(244,242,236,0.96)_100%)]" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1080px] flex-col justify-center px-5 py-12">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">Good evening, Nadya</p>
          <h1 className="mx-auto mt-4 max-w-[14ch] font-display text-[clamp(42px,6.4vw,72px)] font-bold leading-[0.96] tracking-[-0.045em]">What kind of trip do you need?</h1>
          <p className="mx-auto mt-5 max-w-[54ch] text-[17px] leading-relaxed text-muted">Tell {PRODUCT.name} what you know. A destination is optional — give it a mood, a window, a group, or just the problem you want the trip to solve.</p>
        </div>

        <form
          onSubmit={(event) => { event.preventDefault(); submit(value); }}
          className="mx-auto mt-9 flex w-full max-w-[760px] items-center gap-3 rounded-full border border-hair bg-[rgba(255,255,255,0.88)] p-2.5 pl-5 shadow-[var(--shadow-float)] backdrop-blur-xl transition focus-within:border-ink/20 focus-within:shadow-[var(--shadow-pop)]"
        >
          <Orb size={30} />
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Take me somewhere warm for Chinese New Year…"
            aria-label="Describe your trip"
            className="min-w-0 flex-1 bg-transparent font-display text-[19px] font-medium tracking-[-0.02em] outline-none placeholder:text-faint"
          />
          <button type="button" aria-label="Voice (visual only)" className="hidden h-11 w-11 place-items-center rounded-full border border-hair text-ink-soft transition hover:bg-hair-2 sm:grid" tabIndex={-1}>⌥</button>
          <button type="submit" aria-label="Send" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-paper transition hover:scale-[1.03] active:scale-95">→</button>
        </form>

        <div className="mx-auto mt-5 flex items-center justify-center">
          <Link href="/profile" className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-[rgba(238,236,255,0.68)] px-3 py-1.5 text-[12.5px] font-semibold text-accent backdrop-blur transition hover:bg-accent-tint">
            <Orb size={18} /> Roam already knows how you like to travel
          </Link>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-[760px] flex-col items-center gap-3">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-faint">Or start from a loose idea</span>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((example) => (
              <button key={example} onClick={() => submit(example)} className="rounded-full border border-hair bg-[rgba(255,255,255,0.46)] px-3.5 py-2 text-left text-[13px] leading-snug text-muted backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-ink/30 hover:bg-surface hover:text-ink">{example}</button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 hidden items-center gap-4 text-[11.5px] font-semibold text-faint md:flex" aria-hidden>
          <span>Tell us what you know</span><span className="h-px w-12 bg-hair" /><span>Roam narrows the choices</span><span className="h-px w-12 bg-hair" /><span>You approve what matters</span>
        </div>
      </div>
    </div>
  );
}
