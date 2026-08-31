"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/date-range-picker";
import { InteractiveTravelFieldClean } from "@/components/interactive-travel-field-clean";
import { Orb } from "@/components/ui";
import { useStore } from "@/lib/store";

const DESTINATIONS = ["Tokyo, Japan", "Los Angeles, USA", "Seoul, South Korea", "Singapore", "Bangkok, Thailand"];

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

function tripLength(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T12:00:00`).getTime();
  const end = new Date(`${endDate}T12:00:00`).getTime();
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

function contextualSuggestions(destination: string, startDate: string, endDate: string, flexibleDates: boolean, travelers: number) {
  const lower = destination.toLowerCase();
  const length = tripLength(startDate, endDate);
  const suggestions: string[] = [];

  if (flexibleDates) suggestions.push("Find the best-value week", "Avoid the busiest travel days");
  else if (startDate && endDate) suggestions.push(length <= 4 ? "Keep transfers minimal" : "Keep the first day light");
  else suggestions.push("No red-eyes");

  if (/tokyo|japan/.test(lower)) suggestions.push("Prefer Haneda if it fits", "Land before dinner");
  else if (/los angeles|california/.test(lower)) suggestions.push("Avoid peak LAX arrival traffic", "Nonstop if possible");
  else if (/seoul|korea/.test(lower)) suggestions.push("Prefer an easy airport transfer", "Morning departure if possible");
  else if (/singapore/.test(lower)) suggestions.push("Nonstop if possible", "Land before dinner");
  else if (/bangkok|thailand/.test(lower)) suggestions.push("Avoid a late-night arrival", "Checked bag included");
  else suggestions.push("Morning departures only", "Nonstop if possible");

  if (travelers >= 4) suggestions.push("Keep our seats together", "Checked bags for everyone");
  else if (travelers === 1) suggestions.push("Aisle seat if possible", "Flexible ticket");
  else suggestions.push("Checked bag included", "Flexible ticket");

  return Array.from(new Set(suggestions)).slice(0, 6);
}

function assistantReply(text: string) {
  const lower = text.toLowerCase();
  if (/red.?eye|overnight|late-night/.test(lower)) return "Got it — I’ll avoid overnight or very late arrivals unless the trade-off is unusually strong.";
  if (/morning|early/.test(lower)) return "I’ll prioritize morning departures and keep the alternatives limited to meaningful trade-offs.";
  if (/nonstop|direct/.test(lower)) return "I’ll favor nonstop journeys first, and only show a connection if it saves enough money or improves timing.";
  if (/airbus/.test(lower)) return "I’ll treat Airbus aircraft as something to avoid when equipment data is available in the prototype.";
  if (/bag|luggage/.test(lower)) return "I’ll keep baggage in the comparison instead of letting a cheaper base fare look artificially better.";
  if (/flex|change|refund/.test(lower)) return "I’ll give more weight to flexible fares and make the change/refund trade-off explicit.";
  if (/haneda/.test(lower)) return "I’ll prefer Haneda when the schedule and fare still make sense, because it usually reduces the work after landing.";
  if (/seat|together/.test(lower)) return "I’ll treat sitting together as part of the recommendation, not something to solve after booking.";
  if (/best-value|busiest|dates/.test(lower)) return "I’ll use your date flexibility to look for a materially better combination of fare and timing.";
  if (/first day|arrival day|land before dinner/.test(lower)) return "I’ll protect the arrival day and favor timing that makes the first evening easier.";
  if (/traffic|transfer/.test(lower)) return "I’ll factor the airport-to-city transfer into the recommendation instead of optimizing the flight in isolation.";
  return "Added. I’ll use that when I rank the flight options for this trip.";
}

function DestinationField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return <div ref={root} className="relative z-30">
    <span className="mb-2 block pl-1 text-[10px] font-semibold uppercase tracking-[.11em] text-faint">Where</span>
    <div className="flex h-[60px] items-center gap-2 rounded-full border border-[rgba(27,26,23,.14)] bg-white/82 px-5 shadow-sm backdrop-blur-md transition focus-within:border-accent focus-within:bg-white">
      <input value={value} onChange={(event)=>{onChange(event.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} placeholder="Tokyo, Japan" className="min-w-0 flex-1 bg-transparent font-display text-[15px] font-semibold outline-none placeholder:font-normal placeholder:text-faint"/>
      <button type="button" onClick={()=>setOpen((current)=>!current)} className="grid h-8 w-8 place-items-center rounded-full text-muted" aria-label="Show destinations">⌄</button>
    </div>
    {open && <div className="absolute left-0 right-0 top-[84px] z-50 rounded-[22px] border border-hair bg-white/96 p-1.5 shadow-[var(--shadow-pop)] backdrop-blur-xl">{DESTINATIONS.filter((item)=>!value || item.toLowerCase().includes(value.toLowerCase())).map((item)=><button key={item} type="button" onClick={()=>{onChange(item);setOpen(false);}} className="block w-full rounded-[16px] px-3 py-2.5 text-left text-[12px] font-semibold hover:bg-surface-2">{item}</button>)}</div>}
  </div>;
}

export function HomeExperienceStakeholder() {
  const store = useStore();
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [travelers, setTravelers] = useState(2);
  const [chatDraft, setChatDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const replyTimer = useRef<number | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([
    { id:"welcome", role:"assistant", text:"Tell me what matters about the flight. I’ll use it to rank the options, not turn this into another questionnaire." }
  ]);

  useEffect(() => () => {
    if (replyTimer.current) window.clearTimeout(replyTimer.current);
  }, []);

  const exactDatesReady = Boolean(startDate && endDate && endDate >= startDate);
  const ready = Boolean(destination.trim() && (flexibleDates || exactDatesReady) && travelers > 0);
  const userPreferences = chat.filter((message)=>message.role === "user").map((message)=>message.text);
  const visibleChat = thinking ? chat.slice(-3) : chat.slice(-4);
  const suggestions = useMemo(
    () => contextualSuggestions(destination, startDate, endDate, flexibleDates, travelers),
    [destination, startDate, endDate, flexibleDates, travelers],
  );
  const suggestionKey = `${destination}|${startDate}|${endDate}|${flexibleDates}|${travelers}`;

  function addPreference(value: string) {
    const text = value.trim();
    if (!text || thinking) return;
    const user: ChatMessage = { id:`user-${Date.now()}`, role:"user", text };
    setChat((current)=>[...current,user]);
    setChatDraft("");
    setThinking(true);
    replyTimer.current = window.setTimeout(() => {
      const assistant: ChatMessage = { id:`assistant-${Date.now()}`, role:"assistant", text:assistantReply(text) };
      setChat((current)=>[...current,assistant]);
      setThinking(false);
      replyTimer.current = null;
    }, 720);
  }

  function startTrip() {
    if (!ready) return;
    const prompt = [
      `Destination: ${destination.trim()}`,
      flexibleDates ? "Dates: flexible — exact dates not decided yet" : `Dates: ${startDate} to ${endDate}`,
      `Travelers: ${travelers}`,
      userPreferences.length ? `Context: ${userPreferences.join("; ")}` : null,
    ].filter(Boolean).join("\n");
    const id = store.createTripFromPrompt(prompt);
    store.patchTrip(id,{ travelers, name:`${destination.trim()} · trip` });
    router.push(`/trips/${id}/thinking`);
  }

  return <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
    <InteractiveTravelFieldClean/>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(244,242,236,.05),rgba(244,242,236,.42)_55%,rgba(244,242,236,.86)_100%)]" aria-hidden/>

    <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1240px] items-center gap-8 px-5 py-10 md:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
      <section>
        <p className="text-[10.5px] font-semibold uppercase tracking-[.14em] text-faint">Plan the trip</p>
        <h1 className="mt-3 max-w-[11ch] font-display text-[clamp(44px,6vw,72px)] font-bold leading-[.93] tracking-[-.05em]">Search less. Decide better.</h1>
        <p className="mt-5 max-w-[53ch] text-[15px] leading-relaxed text-muted">Start with the familiar travel basics. RoaminRabbit will use the conversation beside it to make the flight recommendation actually fit the trip.</p>

        <div className="mt-8 rounded-[28px] border border-hair bg-[rgba(249,247,241,.82)] p-4 shadow-[0_24px_70px_-48px_rgba(27,26,23,.48)] backdrop-blur-xl sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <DestinationField value={destination} onChange={setDestination}/>
            <DateRangePicker startDate={startDate} endDate={endDate} flexible={flexibleDates} onFlexibleChange={setFlexibleDates} onChange={(start,end)=>{setStartDate(start);setEndDate(end);if(start||end)setFlexibleDates(false);}}/>
          </div>
          <div className="mt-3">
            <span className="mb-2 block pl-1 text-[10px] font-semibold uppercase tracking-[.11em] text-faint">Travelers</span>
            <div className="flex h-[60px] items-center justify-between rounded-full border border-[rgba(27,26,23,.14)] bg-white/82 px-3 shadow-sm backdrop-blur-md">
              <button type="button" onClick={()=>setTravelers((value)=>Math.max(1,value-1))} className="grid h-10 w-10 place-items-center rounded-full text-[18px] text-muted transition hover:bg-surface-2">−</button>
              <div className="text-center"><span className="font-display text-[15px] font-semibold">{travelers} traveler{travelers===1?"":"s"}</span></div>
              <button type="button" onClick={()=>setTravelers((value)=>Math.min(12,value+1))} className="grid h-10 w-10 place-items-center rounded-full text-[18px] text-muted transition hover:bg-surface-2">+</button>
            </div>
          </div>

          <button disabled={!ready} onClick={startTrip} className="mt-5 flex w-full items-center justify-between rounded-full bg-ink px-5 py-4 text-left text-[12px] font-semibold text-paper transition disabled:opacity-30"><span>Find the flight I’d actually take</span><span>→</span></button>
          <p className="mt-3 text-center text-[9.5px] text-faint">No account required · nothing is booked without approval</p>
        </div>
      </section>

      <section className="flex h-[580px] flex-col overflow-hidden rounded-[30px] border border-hair bg-[rgba(255,255,255,.82)] shadow-[0_30px_90px_-52px_rgba(27,26,23,.48)] backdrop-blur-xl sm:h-[600px] lg:h-[620px]">
        <header className="shrink-0 border-b border-hair-2 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3"><Orb size={34}/><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-faint">Flight preferences</p><h2 className="mt-0.5 font-display text-[20px] font-semibold tracking-[-.03em]">Tell RoaminRabbit what matters.</h2></div></div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
          <div className="min-h-0 flex-1 space-y-3 overflow-hidden pr-1">
            {visibleChat.map((message)=><div key={message.id} className={`roam-message-enter flex ${message.role==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[82%] rounded-[22px] px-4 py-3 ${message.role==="user"?"bg-ink text-paper":"border border-hair bg-[#faf8f3] text-ink"}`}><p className="text-[10.5px] leading-relaxed">{message.text}</p></div></div>)}
            {thinking&&<div className="roam-message-enter flex justify-start"><div className="inline-flex items-center gap-2 rounded-full border border-hair bg-[#faf8f3] px-4 py-3 text-muted"><span className="text-[9.5px] font-semibold">Thinking</span><span className="flex items-center gap-1" aria-label="RoaminRabbit is thinking"><span className="roam-thinking-dot h-1.5 w-1.5 rounded-full bg-current"/><span className="roam-thinking-dot h-1.5 w-1.5 rounded-full bg-current [animation-delay:120ms]"/><span className="roam-thinking-dot h-1.5 w-1.5 rounded-full bg-current [animation-delay:240ms]"/></span></div></div>}
          </div>

          <div className="mt-5 shrink-0">
            <p className="mb-2 text-[8.5px] font-semibold uppercase tracking-[.11em] text-faint">Try one</p>
            <div key={suggestionKey} className="flex flex-wrap gap-2">{suggestions.map((suggestion,index)=><button key={suggestion} type="button" disabled={thinking} onClick={()=>addPreference(suggestion)} style={{animationDelay:`${index*45}ms`}} className="roam-suggestion-chip rounded-full border border-hair bg-white px-3 py-2 text-[9.5px] font-semibold text-muted transition hover:border-ink/25 hover:bg-surface-2 hover:text-ink disabled:opacity-45">{suggestion}</button>)}</div>
          </div>

          <div className="mt-4 flex shrink-0 items-center gap-2 rounded-full border border-hair bg-white p-1.5 pl-2 shadow-sm transition focus-within:border-accent focus-within:shadow-[0_10px_30px_-24px_rgba(27,26,23,.55)]">
            <input value={chatDraft} onChange={(event)=>setChatDraft(event.target.value)} onKeyDown={(event)=>event.key==="Enter"&&addPreference(chatDraft)} placeholder="e.g. no red-eyes, aisle seat, land before dinner…" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[11px] outline-none placeholder:text-faint"/>
            <button type="button" onClick={()=>addPreference(chatDraft)} disabled={!chatDraft.trim()||thinking} className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper transition disabled:opacity-30" aria-label="Add flight preference">→</button>
          </div>
        </div>
      </section>
    </div>

    <style jsx global>{`
      @keyframes roam-message-in {
        from { opacity: 0; transform: translateY(6px) scale(.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes roam-suggestion-in {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes roam-thinking-dot {
        0%, 60%, 100% { opacity: .28; transform: translateY(0); }
        30% { opacity: .9; transform: translateY(-2px); }
      }
      .roam-message-enter { animation: roam-message-in 280ms cubic-bezier(.2,.8,.2,1) both; }
      .roam-suggestion-chip { animation: roam-suggestion-in 300ms cubic-bezier(.2,.8,.2,1) both; }
      .roam-thinking-dot { animation: roam-thinking-dot 900ms ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .roam-message-enter, .roam-suggestion-chip, .roam-thinking-dot { animation: none !important; }
      }
    `}</style>
  </div>;
}
