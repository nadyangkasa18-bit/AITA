"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PRODUCT } from "@/config/product";
import { Orb, useToast } from "@/components/ui";
import { useStore } from "@/lib/store";

export function GlobalNavigation() {
  const pathname = usePathname();
  const store = useStore();
  const tripMatch = pathname.match(/^\/trips\/([^/]+)/);
  const tripId = tripMatch?.[1];
  const trip = tripId ? store.trips[tripId] : undefined;
  const selected = trip?.destinationProposals.find((proposal) => proposal.id === trip.selectedProposalId);
  const savedCount = Object.values(store.trips).reduce((count, item) => count + item.savedProposalIds.length, 0);

  const link = (href: string, label: ReactNode, active: boolean) => (
    <Link href={href} className={`rounded-full px-3 py-1.5 text-[13.5px] font-medium transition ${active ? "text-ink" : "text-muted hover:text-ink"}`}>{label}</Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-hair-2 bg-[rgba(244,242,236,0.84)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-3 px-5 md:px-8">
        <Link href="/" className="font-display text-[21px] font-extrabold tracking-[-0.03em] text-ink">{PRODUCT.name}</Link>

        {trip && (
          <div className="hidden min-w-0 items-center gap-2 text-[12.5px] md:flex" aria-label="Breadcrumb">
            <span aria-hidden className="text-hair">/</span>
            <Link href="/trips" className="text-muted transition hover:text-ink">Trips</Link>
            <span aria-hidden className="text-hair">/</span>
            <span className="max-w-[170px] truncate font-semibold text-ink-soft">{trip.name}</span>
          </div>
        )}

        <nav className="ml-auto flex items-center gap-1" aria-label="Primary">
          {trip && selected && (
            <span className="mr-1 hidden rounded-full border border-hair bg-surface-2 px-3 py-1.5 text-[11.5px] font-semibold text-muted lg:inline-flex">
              {selected.destination} <span className="mx-1.5 text-hair">•</span> <span className="capitalize">{trip.lifecycle.replace("-", " ")}</span>
            </span>
          )}
          {link("/trips", "Trips", pathname === "/trips")}
          {link(
            "/saved",
            <span className="flex items-center gap-1.5">
              Saved ideas
              {savedCount > 0 && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">{savedCount}</span>}
            </span>,
            pathname.startsWith("/saved")
          )}
          <Link href="/profile" aria-label="Traveler Profile" className={`ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13.5px] font-medium transition ${pathname.startsWith("/profile") ? "text-ink" : "text-muted hover:text-ink"}`}>
            <Orb size={26} />
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function AssistantComposer({ lifted = false }: { lifted?: boolean }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { toast } = useToast();
  const pathname = usePathname();
  const store = useStore();
  const tripId = pathname.match(/^\/trips\/([^/]+)/)?.[1];

  function submit() {
    const prompt = value.trim();
    setValue("");
    setOpen(false);
    if (prompt && tripId && store.trips[tripId]) {
      store.addBriefItem(tripId, prompt, "prioritize");
      toast("Added to this trip. Recommendations will use it next.");
    }
  }

  return (
    <div className={`fixed right-5 z-40 print:hidden ${lifted ? "bottom-24" : "bottom-5"}`}>
      <div className="flex items-center rounded-full border border-hair bg-surface p-1.5 shadow-[var(--shadow-pop)] transition-all duration-[400ms] [transition-timing-function:var(--ease-spring)]">
        <button onClick={() => setOpen((current) => !current)} aria-label={open ? "Close assistant" : `Ask ${PRODUCT.assistantName}`} className="grid place-items-center rounded-full p-0.5"><Orb size={38} /></button>
        <div className={`flex items-center overflow-hidden transition-all duration-[400ms] [transition-timing-function:var(--ease-spring)] ${open ? "ml-2 max-w-[420px] opacity-100" : "max-w-0 opacity-0"}`}>
          <input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submit()} placeholder={`Ask ${PRODUCT.assistantName}, or tell me what to change…`} className="w-[300px] max-w-[52vw] bg-transparent px-1 text-[15px] outline-none placeholder:text-faint" />
          <button onClick={submit} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-paper">→</button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const onboarding = pathname === "/calibrate";
  const liftedAssistant = /\/brief$/.test(pathname) || /\/destinations(?:\/|$)/.test(pathname) || /\/itinerary$/.test(pathname);
  const showAssistant = /^\/trips\/[^/]+/.test(pathname) && !/\/checkout$/.test(pathname);

  return (
    <div className="flex min-h-dvh flex-col">
      {!onboarding && <GlobalNavigation />}
      <main className="flex-1">{children}</main>
      {!onboarding && showAssistant && <AssistantComposer lifted={liftedAssistant} />}
    </div>
  );
}
