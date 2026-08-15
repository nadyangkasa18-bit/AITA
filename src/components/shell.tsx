"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PRODUCT } from "@/config/product";
import { Orb, useToast } from "@/components/ui";

/* -------------------- Global navigation -------------------- */
const GLOBAL_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/trips", label: "Trips" },
  { href: "/saved", label: "Saved" },
  { href: "/profile", label: "Traveler Profile" },
];

export function GlobalNavigation() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-hair bg-[rgba(244,242,236,0.82)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5">
        <Link href="/" className="font-display text-[22px] font-extrabold tracking-[-0.03em]">
          {PRODUCT.name}
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Global">
          {GLOBAL_LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active ? "bg-surface text-ink shadow-[var(--shadow-card)]" : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/settings"
            className="hidden text-sm text-muted transition hover:text-ink sm:block"
          >
            Settings
          </Link>
          <Link href="/profile" aria-label="Traveler Profile" className="grid place-items-center">
            <Orb size={30} />
          </Link>
        </div>
      </div>
      {/* mobile global nav */}
      <nav
        className="flex items-center gap-1 overflow-x-auto border-t border-hair px-3 py-2 md:hidden"
        aria-label="Global mobile"
      >
        {GLOBAL_LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium ${
                active ? "bg-surface text-ink" : "text-muted"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

/* -------------------- Contextual trip navigation -------------------- */
const TRIP_TABS = [
  { seg: "brief", label: "Brief", ready: true },
  { seg: "destinations", label: "Destinations", ready: true },
  { seg: "workspace", label: "Workspace", ready: true },
  { seg: "plan", label: "Plan", ready: false },
  { seg: "bookings", label: "Bookings", ready: false },
  { seg: "readiness", label: "Readiness", ready: false },
];

export function TripNavigation() {
  const pathname = usePathname();
  const params = useParams<{ tripId: string }>();
  const tripId = params?.tripId ?? "girls-getaway";
  return (
    <div className="border-b border-hair bg-paper/60">
      <div className="mx-auto flex max-w-[1200px] items-center gap-1 overflow-x-auto px-5 py-2">
        {TRIP_TABS.map((t) => {
          const href = `/trips/${tripId}/${t.seg}`;
          const active = pathname.startsWith(href);
          return (
            <Link
              key={t.seg}
              href={href}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition ${
                active ? "bg-surface text-ink shadow-[var(--shadow-card)]" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
              {!t.ready && (
                <span className="rounded-full bg-paper-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">
                  next
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
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
      <div
        className={`flex items-center rounded-full border border-hair bg-surface p-1.5 shadow-[var(--shadow-pop)] transition-all duration-[400ms] [transition-timing-function:var(--ease-spring)]`}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close assistant" : "Ask Roam"}
          className="grid place-items-center rounded-full p-0.5"
        >
          <Orb size={40} />
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

/* -------------------- App shell -------------------- */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <GlobalNavigation />
      <main className="flex-1">{children}</main>
      <AssistantComposer />
    </div>
  );
}
