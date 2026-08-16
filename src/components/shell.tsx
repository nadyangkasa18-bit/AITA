"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { PRODUCT } from "@/config/product";
import { Orb, useToast } from "@/components/ui";
import { useStore } from "@/lib/store";

/* -------------------- Minimal header --------------------
   Wordmark · current draft name · Saved ideas · Traveler Profile.
   No exploratory wizard/stepper — that made the flow feel like a
   long required form. Transactional steps appear later, at checkout. */
export function GlobalNavigation() {
  const pathname = usePathname();
  const store = useStore();

  const tripMatch = pathname.match(/^\/trips\/([^/]+)/);
  const tripId = tripMatch?.[1];
  const draftName = tripId ? store.trips[tripId]?.name : undefined;

  const savedCount = Object.values(store.trips).reduce(
    (n, t) => n + t.savedProposalIds.length,
    0
  );

  const link = (href: string, label: ReactNode, active: boolean) => (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-[13.5px] font-medium transition ${
        active ? "text-ink" : "text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-hair-2 bg-[rgba(244,242,236,0.8)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-3 px-5 md:px-8">
        <Link
          href="/"
          className="font-display text-[21px] font-extrabold tracking-[-0.03em] text-ink"
        >
          {PRODUCT.name}
        </Link>
        {draftName && (
          <span className="hidden items-center gap-2 text-[14px] text-muted sm:flex">
            <span aria-hidden className="text-hair">/</span>
            <span className="text-ink-soft">{draftName}</span>
          </span>
        )}

        <nav className="ml-auto flex items-center gap-1" aria-label="Primary">
          {link("/trips", "Trips", pathname === "/trips")}
          {link(
            "/saved",
            <span className="flex items-center gap-1.5">
              Saved ideas
              {savedCount > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-[#f3f6f1]">
                  {savedCount}
                </span>
              )}
            </span>,
            pathname.startsWith("/saved")
          )}
          <Link
            href="/profile"
            aria-label="Traveler Profile"
            className={`ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13.5px] font-medium transition ${
              pathname.startsWith("/profile") ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <Orb size={26} />
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* -------------------- Assistant composer (persistent, secondary) -------------------- */
export function AssistantComposer() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { toast } = useToast();

  function submit() {
    const v = value.trim();
    setValue("");
    setOpen(false);
    if (v) toast("Roam is considering that — I'll fold it into the options.");
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 print:hidden">
      <div className="flex items-center rounded-full border border-hair bg-surface p-1.5 shadow-[var(--shadow-pop)] transition-all duration-[400ms] [transition-timing-function:var(--ease-spring)]">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close assistant" : "Ask Roam"}
          className="grid place-items-center rounded-full p-0.5"
        >
          <Orb size={38} />
        </button>
        <div
          className={`flex items-center overflow-hidden transition-all duration-[400ms] [transition-timing-function:var(--ease-spring)] ${
            open ? "ml-2 max-w-[420px] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask Roam, or tell me what to change…"
            className="w-[300px] max-w-[52vw] bg-transparent px-1 text-[15px] outline-none placeholder:text-faint"
          />
          <button
            onClick={submit}
            aria-label="Send"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-paper"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Mandatory calibration gate --------------------
   First-time users must complete calibration before reaching the app.
   The only route reachable while uncalibrated is /calibrate. */
function CalibrationGate() {
  const { hydrated, profile } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!hydrated) return;
    if (!profile.calibrated && pathname !== "/calibrate") {
      router.replace("/calibrate");
    }
  }, [hydrated, profile.calibrated, pathname, router]);
  return null;
}

/* -------------------- App shell -------------------- */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { hydrated, profile } = useStore();
  const onboarding = pathname === "/calibrate";
  // While uncalibrated, don't flash protected content behind the redirect.
  const blocked = hydrated && !profile.calibrated && !onboarding;

  return (
    <div className="flex min-h-dvh flex-col">
      <CalibrationGate />
      {!onboarding && <GlobalNavigation />}
      <main className="flex-1">{blocked ? null : children}</main>
      {!onboarding && !blocked && <AssistantComposer />}
    </div>
  );
}
