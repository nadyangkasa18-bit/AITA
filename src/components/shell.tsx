"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PRODUCT } from "@/config/product";
import { Orb } from "@/components/ui";
import { ItineraryPeek, itineraryNeedsAttention } from "@/components/itinerary-peek";
import { ConnectAIModal } from "@/components/connect-ai-modal";
import { useStore } from "@/lib/store";

export function GlobalNavigation({ onOpenItinerary, onConnectAI }: { onOpenItinerary?: () => void; onConnectAI: () => void }) {
  const pathname = usePathname();
  const store = useStore();
  const tripMatch = pathname.match(/^\/trips\/([^/]+)/);
  const tripId = tripMatch?.[1];
  const trip = tripId ? store.trips[tripId] : undefined;
  const selected = trip?.destinationProposals.find((proposal) => proposal.id === trip.selectedProposalId);
  const savedCount = Object.values(store.trips).reduce((count, item) => count + item.savedProposalIds.length, 0);
  const hasTripBrief = Boolean(trip && (trip.originalPrompt.trim() || trip.brief.items.length || trip.brief.assumptions.length));

  const link = (href: string, label: ReactNode, active: boolean) => (
    <Link href={href} className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition ${active ? "text-ink" : "text-muted hover:text-ink"}`}>{label}</Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-hair-2 bg-[rgba(244,242,236,.86)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1420px] items-center gap-3 px-4 sm:px-5 md:px-7">
        <Link href="/" className="font-display text-[21px] font-extrabold tracking-[-.03em] text-ink">{PRODUCT.name}</Link>
        {trip && <div className="hidden min-w-0 items-center gap-2 text-[12px] md:flex"><span className="text-hair">/</span><Link href="/trips" className="text-muted">Trips</Link><span className="text-hair">/</span><span className="max-w-[180px] truncate font-semibold text-ink-soft">{trip.name}</span></div>}
        <nav className="ml-auto flex items-center gap-0.5" aria-label="Primary">
          {trip && selected && <span className="mr-1 hidden rounded-full border border-hair bg-surface-2 px-3 py-1.5 text-[10.5px] font-semibold text-muted xl:inline-flex">{selected.destination}<span className="mx-1.5 text-hair">•</span><span className="capitalize">{trip.lifecycle.replace("-", " ")}</span></span>}
          {hasTripBrief && onOpenItinerary && trip && <button type="button" onClick={onOpenItinerary} className="relative rounded-full px-3 py-1.5 text-[13px] font-medium text-muted transition hover:bg-white/45 hover:text-ink"><span className="flex items-center gap-1.5">Trip{itineraryNeedsAttention(trip) && <span className="h-1.5 w-1.5 rounded-full bg-[#a46a45]" aria-label="Trip needs attention"/>}</span></button>}
          <button onClick={onConnectAI} className="rounded-full border border-transparent px-3 py-1.5 text-[12.5px] font-semibold text-muted transition hover:border-hair hover:bg-white/55 hover:text-ink">Connect your AI</button>
          <span className="hidden sm:contents">{link("/trips", "Trips", pathname === "/trips")}{link("/saved", <span className="flex items-center gap-1.5">Saved{savedCount > 0 && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">{savedCount}</span>}</span>, pathname.startsWith("/saved"))}</span>
          <Link href="/profile" aria-label="Traveler Profile" className={`ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-[13px] font-medium transition ${pathname.startsWith("/profile") ? "text-ink" : "text-muted hover:text-ink"}`}><Orb size={25}/><span className="hidden lg:inline">Profile</span></Link>
        </nav>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const store = useStore();
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const onboarding = pathname === "/calibrate";
  const tripId = pathname.match(/^\/trips\/([^/]+)/)?.[1];
  const trip = tripId ? store.trips[tripId] : undefined;
  const coworkPage = /\/workspace$/.test(pathname);

  return <div className="flex min-h-dvh flex-col">
    {!onboarding && <GlobalNavigation onConnectAI={() => setConnectOpen(true)} onOpenItinerary={trip && !coworkPage ? () => setItineraryOpen(true) : undefined}/>} 
    <main className="flex-1">{children}</main>
    {trip && !coworkPage && <ItineraryPeek trip={trip} open={itineraryOpen} onClose={() => setItineraryOpen(false)}/>} 
    {!onboarding && <ConnectAIModal open={connectOpen} onClose={() => setConnectOpen(false)} tripId={tripId}/>} 
  </div>;
}
