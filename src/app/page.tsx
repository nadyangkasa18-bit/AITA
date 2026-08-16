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

const PROMPT_SUGGESTIONS = [
  "I need a weekend somewhere that feels like a reset…",
  "Tokyo for 3 nights — find me flights and a great hotel…",
  "Where can I take two kids without spending half the trip in transit?",
  "Somewhere warm for Chinese New Year, but not too crowded…",
  "Plan me a food-first long weekend under five hours from Jakarta…",
];

const TOP_IDEAS = [
  "Weekend reset, somewhere cool and quiet.",
  "Tokyo for 3 nights — flights + hotel.",
  "Family trip with two kids, minimal transit.",
  "Somewhere warm for Chinese New Year.",
  "Food-first long weekend under five hours.",
];

const BOTTOM_IDEAS = [
  "Beachy, but not humid and no car needed.",
  "A design hotel and a direct flight.",
  "Three friends, four days, around Rp 15m each.",
  "Great food, good weather — surprise me.",
  "Mountains, a great hotel, and no red-eyes.",
];

function isDirectBookingIntent(prompt: string) {
  const value = prompt.toLowerCase();
  const knowsDestination = /tokyo|japan/.test(value);
  const wantsBookable = /(flight|hotel|stay|book)/.test(value);
  const hasSpecificity = /(night|day|date|oct|nov|dec|jan|feb|mar|apr|may|jun|jul|aug|sep)/.test(value);
  return knowsDestination && wantsBookable && hasSpecificity;
}

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
    <div className="marquee-set" aria-hidden={copy === "copy"}>
      {items.map((item) => (
        <button
          key={`${copy}-${item}`}
          type="button"
          onClick={() => onPick(item)}
          className="whitespace-nowrap rounded-full border border-[rgba(27,26,23,0.09)] bg-[rgba(255,255,255,0.46)] px-4 py-2 text-[13px] text-muted backdrop-blur-sm transition hover:border-[rgba(27,26,23,0.22)] hover:bg-[rgba(255,255,255,0.78)] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div className="marquee-viewport">
      <div className={`marquee-track marquee-track--${direction}`}>
        {renderSet("original")}
        {renderSet("copy")}
      </div>
    </div>
  );
}

export default function Home() {
  const store = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<"idle" | "reasoning">("idle");
  const [tripId, setTripId] = useState<string | null>(null);
  const [directBooking, setDirectBooking] = useState(false);
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
    const direct = isDirectBookingIntent(text);
    const id = store.createTripFromPrompt(text);
    setDirectBooking(direct);
    setTripId(id);
    setPhase("reasoning");
  }

  if (phase === "reasoning" && tripId) {
    return (
      <ReasoningProgress
        steps={
          directBooking
            ? [
                { label: "Locking in your Tokyo trip basics" },
                { label: "Matching sensible flights" },
                { label: "Shortlisting hotels that fit your travel style" },
              ]
            : reasoningSteps
        }
        headline={
          directBooking
            ? "You know where you’re going — building the booking plan…"
            : "Understanding what the group wants…"
        }
        onDone={() =>
          router.push(
            directBooking
              ? `/trips/${tripId}/booking-plan`
              : `/trips/${tripId}/brief`,
          )
        }
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

        <div className="mx-auto mt-6 flex items-center justify-center">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-[rgba(238,236,255,0.62)] px-3 py-1.5 text-[12.5px] font-semibold text-accent backdrop-blur-sm transition hover:bg-accent-tint"
          >
            <Orb size={18} /> Roam remembers how you like to travel
          </Link>
        </div>

        <div className="prompt-shell mx-auto mt-4 w-full max-w-[760px]">
          <span className="prompt-shell__glow" aria-hidden />
          <span className="prompt-shell__edge" aria-hidden />
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit(value);
            }}
            className="prompt-shell__surface relative z-10 m-px flex items-center gap-3 rounded-full bg-[rgba(255,255,255,0.9)] p-2.5 pl-5 shadow-[0_20px_60px_-34px_rgba(27,26,23,0.36)] backdrop-blur-xl transition-[box-shadow,transform] duration-300 focus-within:-translate-y-0.5 focus-within:shadow-[0_26px_64px_-34px_rgba(27,26,23,0.42)]"
          >
            <Orb size={30} />
            <div className="relative min-w-0 flex-1">
              {!value && (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center truncate pr-2 font-display text-[18px] font-medium tracking-[-0.02em] text-faint transition-all duration-200 ${
                    promptVisible
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-1.5 opacity-0"
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
                className="relative z-10 w-full rounded-full bg-transparent py-1 font-display text-[18px] font-medium tracking-[-0.02em] outline-none focus-visible:outline-none"
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
        </div>

        <div className="mx-auto mt-8 w-full max-w-[900px]">
          <p className="mb-3 text-center text-[12px] text-faint">Or start from an idea</p>
          <div className="grid gap-2.5">
            <PromptMarquee items={TOP_IDEAS} direction="right" onPick={submit} />
            <PromptMarquee items={BOTTOM_IDEAS} direction="left" onPick={submit} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .prompt-shell {
          position: relative;
          isolation: isolate;
          border-radius: 999px;
        }
        .prompt-shell__edge,
        .prompt-shell__glow {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 50%;
          pointer-events: none;
        }
        .prompt-shell__edge {
          z-index: 0;
          width: 118%;
          aspect-ratio: 1;
          background: conic-gradient(
            from 30deg,
            rgba(122, 169, 137, 0.78),
            rgba(100, 87, 255, 0.78),
            rgba(226, 167, 111, 0.72),
            rgba(122, 169, 137, 0.78)
          );
          animation: prompt-orbit 18s linear infinite;
        }
        .prompt-shell__glow {
          z-index: -1;
          width: 112%;
          aspect-ratio: 1;
          background: conic-gradient(
            from 210deg,
            rgba(126, 174, 141, 0.35),
            rgba(101, 88, 255, 0.34),
            rgba(229, 170, 112, 0.31),
            rgba(126, 174, 141, 0.35)
          );
          filter: blur(10px);
          opacity: 0.34;
          animation: prompt-orbit-reverse 22s linear infinite;
        }
        .prompt-shell__surface {
          overflow: hidden;
        }
        .marquee-viewport {
          overflow: hidden;
          padding-block: 1px;
          mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
        }
        .marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
        }
        .marquee-set {
          display: flex;
          gap: 8px;
          padding-right: 8px;
        }
        .marquee-track--right {
          animation: marquee-right 38s linear infinite;
        }
        .marquee-track--left {
          animation: marquee-left 42s linear infinite;
        }
        .marquee-viewport:hover .marquee-track,
        .marquee-viewport:focus-within .marquee-track {
          animation-play-state: paused;
        }
        @keyframes prompt-orbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes prompt-orbit-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
          50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.015); }
          to { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .prompt-shell__edge,
          .prompt-shell__glow,
          .marquee-track {
            animation: none;
          }
          .marquee-viewport {
            overflow-x: auto;
            mask-image: none;
            -webkit-mask-image: none;
          }
        }
      `}</style>
    </div>
  );
}
