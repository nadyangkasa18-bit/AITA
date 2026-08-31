"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DateRangePicker } from "@/components/date-range-picker";
import { InteractiveTravelFieldClean } from "@/components/interactive-travel-field-clean";
import { Orb } from "@/components/ui";
import { useStore } from "@/lib/store";

const DESTINATIONS = ["Tokyo, Japan", "Los Angeles, USA", "Seoul, South Korea", "Singapore", "Bangkok, Thailand"];
const TOP_IDEAS = ["Weekend reset, somewhere cool and quiet.", "Family trip with two kids, minimal transit.", "Somewhere warm for Chinese New Year.", "Food-first long weekend under five hours.", "Beachy, but not humid and no car needed."];
const BOTTOM_IDEAS = ["A design hotel and a direct flight.", "Three friends, four days, around Rp 15m each.", "Great food, good weather — surprise me.", "Mountains, a great hotel, and no red-eyes.", "Graduation in Los Angeles with plans around UCLA."];
const PARTY_TYPES = ["Solo", "Couple", "Family", "Friends"] as const;
type Party = typeof PARTY_TYPES[number];

function PromptMarquee({ items, direction, onPick }: { items: string[]; direction: "left" | "right"; onPick: (value: string) => void }) {
  const set = (copy: boolean) => <div className="home-marquee-set" aria-hidden={copy}>{items.map((item) => <button key={`${copy}-${item}`} tabIndex={copy ? -1 : 0} onClick={() => onPick(item)} className="whitespace-nowrap rounded-full border border-[rgba(27,26,23,.09)] bg-[rgba(255,255,255,.58)] px-4 py-2 text-[13px] text-muted backdrop-blur-sm transition hover:border-[rgba(27,26,23,.22)] hover:bg-white hover:text-ink">{item}</button>)}</div>;
  return <div className="home-marquee-viewport"><div className={`home-marquee-track ${direction === "right" ? "home-marquee-right" : "home-marquee-left"}`}>{set(false)}{set(true)}</div></div>;
}

function DestinationField({ value, onChange, help, setHelp }: { value: string; onChange: (value: string) => void; help: boolean; setHelp: (value: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return <div ref={root} className="relative z-30"><span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[.11em] text-faint">Where</span><div className={`flex h-[60px] items-center gap-2 rounded-full border bg-[rgba(255,255,255,.74)] px-4 backdrop-blur-md transition focus-within:bg-white ${help ? "border-accent-line" : "border-[rgba(27,26,23,.14)] focus-within:border-accent"}`}><input disabled={help} value={help ? "Help me choose" : value} onChange={(event) => { onChange(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Tokyo, Japan" className="min-w-0 flex-1 bg-transparent font-display text-[15px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint disabled:text-muted"/><button onClick={() => setOpen((current) => !current)} className="grid h-8 w-8 place-items-center rounded-full text-muted" aria-label="Show destinations">⌄</button></div>{open && !help && <div className="absolute left-0 right-0 top-[82px] z-50 rounded-[17px] border border-hair bg-white/95 p-1.5 shadow-[var(--shadow-pop)] backdrop-blur-xl">{DESTINATIONS.filter((item) => !value || item.toLowerCase().includes(value.toLowerCase())).map((item) => <button key={item} onClick={() => { onChange(item); setOpen(false); }} className="block w-full rounded-[12px] px-3 py-2.5 text-left text-[12px] font-semibold text-ink hover:bg-surface-2">{item}</button>)}</div>}<button onClick={() => { setHelp(!help); if (!help) setOpen(false); }} className="mt-2 ml-2 text-[10.5px] font-semibold text-muted hover:text-ink">{help ? "I know where I’m going" : "Help me choose"}</button></div>;
}

export function HomeExperience() {
  const store = useStore();
  const router = useRouter();
  const [mode, setMode] = useState<"guided" | "idea">("guided");
  const [destination, setDestination] = useState("");
  const [helpDestination, setHelpDestination] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datesFlexible, setDatesFlexible] = useState(false);
  const [travelers, setTravelers] = useState(2);
  const [travelersUnknown, setTravelersUnknown] = useState(false);
  const [party, setParty] = useState<Party | "">("");
  const [context, setContext] = useState("");
  const [idea, setIdea] = useState("");
  const ideaInputRef = useRef<HTMLInputElement | null>(null);

  const ready = Boolean((helpDestination || destination.trim()) && (datesFlexible || (startDate && endDate && endDate >= startDate)) && (travelersUnknown || travelers > 0));

  function chooseParty(value: Party) {
    setParty(value);
    setTravelersUnknown(false);
    if (value === "Solo") setTravelers(1);
    if (value === "Couple") setTravelers(2);
    if (value === "Family" || value === "Friends") setTravelers((current) => Math.max(3, current));
  }

  function startTrip() {
    if (!ready) return;
    const prompt = [
      `Destination: ${helpDestination ? "Help me choose" : destination.trim()}`,
      `Dates: ${datesFlexible ? "Dates are flexible" : `${startDate} to ${endDate}`}`,
      `Travelers: ${travelersUnknown ? "Not sure yet" : `${travelers}${party ? ` · ${party}` : ""}`}`,
      context.trim() ? `Context: ${context.trim()}` : null,
    ].filter(Boolean).join("\n");
    const id = store.createTripFromPrompt(prompt);
    store.patchTrip(id, { travelers: travelersUnknown ? 2 : travelers, name: `${helpDestination ? "Open destination" : destination.trim()} · trip` });
    router.push(`/trips/${id}/thinking`);
  }

  function startIdea() {
    const text = idea.trim();
    if (!text) return;
    const id = store.createTripFromPrompt(`Destination: Help me choose\nDates: Dates are flexible\nTravelers: Not sure yet\nContext: ${text}`);
    router.push(`/trips/${id}/thinking`);
  }

  function openIdea(value?: string) {
    if (value) setIdea(value);
    setMode("idea");
    window.setTimeout(() => ideaInputRef.current?.focus(), 80);
  }

  return <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden"><InteractiveTravelFieldClean/><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(244,242,236,.08),rgba(244,242,236,.5)_58%,rgba(244,242,236,.86)_100%)]" aria-hidden/>
    {mode === "guided" ? <div className="relative z-10 mx-auto max-w-[1120px] px-5 pb-12 pt-8 md:px-8 md:pt-10"><div className="mx-auto max-w-[790px] text-center"><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-faint">Guest-first trip planning</p><h1 className="mx-auto mt-3 max-w-[15ch] font-display text-[clamp(39px,5.7vw,64px)] font-bold leading-[.98] tracking-[-.045em]">Start with what you already know.</h1><p className="mx-auto mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted">Where, when, and who. Everything else can stay open until it actually improves a decision.</p></div><div className="mx-auto mt-7 max-w-[1000px]"><div className="grid gap-4 md:grid-cols-[1.05fr_1.15fr_.82fr]"><DestinationField value={destination} onChange={setDestination} help={helpDestination} setHelp={setHelpDestination}/><div className="relative z-20">{datesFlexible ? <><span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[.11em] text-faint">When</span><div className="flex h-[60px] items-center justify-between rounded-full border border-accent-line bg-white/78 px-4"><span className="font-display text-[15px] font-semibold text-muted">Dates are flexible</span><button onClick={() => setDatesFlexible(false)} className="text-[10px] font-semibold text-muted">Choose dates</button></div></> : <DateRangePicker startDate={startDate} endDate={endDate} onChange={(start,end) => { setStartDate(start); setEndDate(end); }}/>}<button onClick={() => { setDatesFlexible(!datesFlexible); if (!datesFlexible) { setStartDate(""); setEndDate(""); } }} className="mt-2 ml-2 text-[10.5px] font-semibold text-muted hover:text-ink">{datesFlexible ? "Use exact dates" : "Dates are flexible"}</button></div><div><span className="mb-2 block pl-2 text-[10.5px] font-semibold uppercase tracking-[.11em] text-faint">Who</span><div className={`flex h-[60px] items-center justify-between rounded-full border bg-[rgba(255,255,255,.74)] px-3 backdrop-blur-md ${travelersUnknown ? "border-accent-line" : "border-[rgba(27,26,23,.14)]"}`}>{travelersUnknown ? <span className="mx-auto font-display text-[14px] font-semibold text-muted">Not sure yet</span> : <><button onClick={() => setTravelers((value) => Math.max(1,value-1))} className="grid h-9 w-9 place-items-center rounded-full text-[17px] text-muted hover:bg-paper-2">−</button><span className="font-display text-[15px] font-semibold">{travelers} people</span><button onClick={() => setTravelers((value) => Math.min(12,value+1))} className="grid h-9 w-9 place-items-center rounded-full text-[17px] text-muted hover:bg-paper-2">+</button></>}</div><button onClick={() => setTravelersUnknown(!travelersUnknown)} className="mt-2 ml-2 text-[10.5px] font-semibold text-muted hover:text-ink">{travelersUnknown ? "Set traveler count" : "Not sure yet"}</button></div></div><div className="mt-3 flex flex-wrap items-center gap-2 pl-1"><span className="mr-1 text-[10.5px] font-semibold text-faint">Who’s coming?</span>{PARTY_TYPES.map((item) => <button key={item} onClick={() => chooseParty(item)} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${party === item ? "border-ink bg-ink text-paper" : "border-hair bg-white/65 text-muted"}`}>{item}</button>)}</div><div className="mt-5 rounded-[18px] border border-hair bg-white/60 p-1.5 backdrop-blur focus-within:border-accent"><input value={context} onChange={(event) => setContext(event.target.value)} placeholder="Optional — fixed events, no red-eyes, a feeling, a budget, anything else…" className="w-full bg-transparent px-3 py-2.5 text-[12px] outline-none placeholder:text-faint"/></div><div className="mt-5 flex flex-wrap items-center justify-center gap-3"><button disabled={!ready} onClick={startTrip} className="rounded-full bg-ink px-6 py-3 text-[12.5px] font-semibold text-paper disabled:opacity-30">Start my Trip Brief →</button><Link href="/calibrate" className="rounded-full border border-hair bg-white/70 px-5 py-3 text-[11.5px] font-semibold text-muted">Improve my recommendations</Link></div><p className="mt-3 text-center text-[10.5px] text-faint">No account required. Sign-in only appears when persistence or a transaction actually needs it.</p>
      <section className="relative left-1/2 mt-9 w-screen -translate-x-1/2 overflow-hidden border-t border-hair-2 pt-7"><div className="mx-auto flex max-w-[1000px] flex-wrap items-end justify-between gap-4 px-5 md:px-8"><div><p className="text-[11px] font-semibold uppercase tracking-[.12em] text-faint">Start from an idea</p><h2 className="mt-1 font-display text-[clamp(22px,3vw,30px)] font-semibold tracking-[-.03em]">Don’t know the destination yet? That’s fine.</h2></div><button onClick={() => openIdea()} className="rounded-full border border-hair bg-white/68 px-4 py-2.5 text-[12px] font-semibold text-muted backdrop-blur">Describe your own idea</button></div><div className="mt-5 grid gap-2.5"><PromptMarquee items={TOP_IDEAS} direction="right" onPick={openIdea}/><PromptMarquee items={BOTTOM_IDEAS} direction="left" onPick={openIdea}/></div></section></div></div> :
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1080px] flex-col justify-center px-5 py-10 md:px-8"><div className="text-center"><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-faint">Start from an idea</p><h1 className="mx-auto mt-3 max-w-[14ch] font-display text-[clamp(38px,5.4vw,60px)] font-bold leading-[.96] tracking-[-.045em]">What kind of trip do you need?</h1><p className="mx-auto mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted">Tell RoaminRabbit what you know — one line is enough.</p></div>
        <div className="home-prompt-shell relative mx-auto mt-7 w-full max-w-[900px] rounded-full border border-hair bg-white/84 p-1.5 shadow-[var(--shadow-card)] backdrop-blur-xl focus-within:border-accent"><div className="flex h-[68px] items-center gap-3 rounded-full px-3"><Orb size={34}/><input ref={ideaInputRef} value={idea} onChange={(event) => setIdea(event.target.value)} onKeyDown={(event) => event.key === "Enter" && startIdea()} placeholder="Beachy, but not humid and no car needed…" className="min-w-0 flex-1 bg-transparent font-display text-[17px] text-ink outline-none placeholder:text-faint sm:text-[19px]"/><button disabled={!idea.trim()} onClick={startIdea} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-[18px] text-paper transition disabled:opacity-25" aria-label="Explore this idea">→</button></div></div>
        <div className="mx-auto mt-4 flex w-full max-w-[900px] items-center justify-between gap-3 px-2"><button onClick={() => setMode("guided")} className="text-[10.5px] font-semibold text-muted hover:text-ink">I know where, when and who → use trip controls</button><span className="text-[9.5px] text-faint">Or pick a starting point below</span></div>
        <div className="relative left-1/2 mt-7 w-screen -translate-x-1/2 overflow-hidden"><div className="grid gap-2.5"><PromptMarquee items={TOP_IDEAS} direction="right" onPick={(value) => { setIdea(value); window.setTimeout(() => ideaInputRef.current?.focus(), 30); }}/><PromptMarquee items={BOTTOM_IDEAS} direction="left" onPick={(value) => { setIdea(value); window.setTimeout(() => ideaInputRef.current?.focus(), 30); }}/></div></div>
      </div>}
  </div>;
}
