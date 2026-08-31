"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/date-range-picker";
import { InteractiveTravelFieldClean } from "@/components/interactive-travel-field-clean";
import { Orb } from "@/components/ui";
import { useStore } from "@/lib/store";

const DESTINATIONS = ["Tokyo, Japan", "Los Angeles, USA", "Seoul, South Korea", "Singapore", "Bangkok, Thailand"];
const FLIGHT_SUGGESTIONS = ["No red-eyes", "Morning departures only", "Nonstop if possible", "Avoid Airbus aircraft", "Checked bag included", "Flexible ticket"];

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

function assistantReply(text: string) {
  const lower = text.toLowerCase();
  if (/red.?eye|overnight/.test(lower)) return "Got it — I’ll avoid overnight departures unless there’s a major trade-off worth showing you.";
  if (/morning|early/.test(lower)) return "I’ll prioritize morning departures and keep the alternatives limited to meaningful trade-offs.";
  if (/nonstop|direct/.test(lower)) return "I’ll favor nonstop journeys first, and only show a connection if it saves enough money or improves timing.";
  if (/airbus/.test(lower)) return "I’ll treat Airbus aircraft as something to avoid when equipment data is available in the prototype.";
  if (/bag|luggage/.test(lower)) return "I’ll keep checked baggage in the comparison instead of letting a cheaper base fare look artificially better.";
  if (/flex|change|refund/.test(lower)) return "I’ll give more weight to flexible fares and make the change/refund trade-off explicit.";
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
    <div className="flex h-[58px] items-center gap-2 rounded-[16px] border border-[rgba(27,26,23,.14)] bg-white/82 px-4 shadow-sm backdrop-blur-md transition focus-within:border-accent focus-within:bg-white">
      <input value={value} onChange={(event)=>{onChange(event.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} placeholder="Tokyo, Japan" className="min-w-0 flex-1 bg-transparent font-display text-[15px] font-semibold outline-none placeholder:font-normal placeholder:text-faint"/>
      <button type="button" onClick={()=>setOpen((current)=>!current)} className="grid h-8 w-8 place-items-center rounded-full text-muted" aria-label="Show destinations">⌄</button>
    </div>
    {open && <div className="absolute left-0 right-0 top-[82px] z-50 rounded-[17px] border border-hair bg-white/96 p-1.5 shadow-[var(--shadow-pop)] backdrop-blur-xl">{DESTINATIONS.filter((item)=>!value || item.toLowerCase().includes(value.toLowerCase())).map((item)=><button key={item} type="button" onClick={()=>{onChange(item);setOpen(false);}} className="block w-full rounded-[12px] px-3 py-2.5 text-left text-[12px] font-semibold hover:bg-surface-2">{item}</button>)}</div>}
  </div>;
}

export function HomeExperienceStakeholder() {
  const store = useStore();
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [chatDraft, setChatDraft] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    { id:"welcome", role:"assistant", text:"Tell me what matters about the flight. I’ll use it to rank the options, not turn this into another questionnaire." }
  ]);

  const ready = Boolean(destination.trim() && startDate && endDate && endDate >= startDate && travelers > 0);
  const userPreferences = chat.filter((message)=>message.role === "user").map((message)=>message.text);

  function addPreference(value: string) {
    const text = value.trim();
    if (!text) return;
    const user: ChatMessage = { id:`user-${Date.now()}`, role:"user", text };
    const assistant: ChatMessage = { id:`assistant-${Date.now()+1}`, role:"assistant", text:assistantReply(text) };
    setChat((current)=>[...current,user,assistant]);
    setChatDraft("");
  }

  function startTrip() {
    if (!ready) return;
    const prompt = [
      `Destination: ${destination.trim()}`,
      `Dates: ${startDate} to ${endDate}`,
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

        <div className="mt-8 rounded-[26px] border border-hair bg-[rgba(249,247,241,.82)] p-4 shadow-[0_24px_70px_-48px_rgba(27,26,23,.48)] backdrop-blur-xl sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <DestinationField value={destination} onChange={setDestination}/>
            <DateRangePicker startDate={startDate} endDate={endDate} onChange={(start,end)=>{setStartDate(start);setEndDate(end);}}/>
          </div>
          <div className="mt-3">
            <span className="mb-2 block pl-1 text-[10px] font-semibold uppercase tracking-[.11em] text-faint">Travelers</span>
            <div className="flex h-[58px] items-center justify-between rounded-[16px] border border-[rgba(27,26,23,.14)] bg-white/82 px-3 shadow-sm backdrop-blur-md">
              <button type="button" onClick={()=>setTravelers((value)=>Math.max(1,value-1))} className="grid h-9 w-9 place-items-center rounded-full text-[18px] text-muted transition hover:bg-surface-2">−</button>
              <div className="text-center"><span className="font-display text-[15px] font-semibold">{travelers} traveler{travelers===1?"":"s"}</span><p className="text-[8.5px] text-faint">Economy · round trip</p></div>
              <button type="button" onClick={()=>setTravelers((value)=>Math.min(12,value+1))} className="grid h-9 w-9 place-items-center rounded-full text-[18px] text-muted transition hover:bg-surface-2">+</button>
            </div>
          </div>

          <button disabled={!ready} onClick={startTrip} className="mt-5 flex w-full items-center justify-between rounded-[15px] bg-ink px-5 py-4 text-left text-[12px] font-semibold text-paper transition disabled:opacity-30"><span>Find the flight I’d actually take</span><span>→</span></button>
          <p className="mt-3 text-center text-[9.5px] text-faint">No account required · nothing is booked without approval</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-hair bg-[rgba(255,255,255,.82)] shadow-[0_30px_90px_-52px_rgba(27,26,23,.48)] backdrop-blur-xl">
        <header className="border-b border-hair-2 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3"><Orb size={34}/><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-faint">Flight preferences</p><h2 className="mt-0.5 font-display text-[20px] font-semibold tracking-[-.03em]">Tell RoaminRabbit what matters.</h2></div></div>
        </header>

        <div className="flex min-h-[440px] flex-col p-5 sm:p-6">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">{chat.map((message)=><div key={message.id} className={`flex ${message.role==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[82%] rounded-[18px] px-4 py-3 ${message.role==="user"?"bg-ink text-paper":"border border-hair bg-[#faf8f3] text-ink"}`}><p className="text-[10.5px] leading-relaxed">{message.text}</p></div></div>)}</div>

          <div className="mt-5">
            <p className="mb-2 text-[8.5px] font-semibold uppercase tracking-[.11em] text-faint">Try one</p>
            <div className="flex flex-wrap gap-2">{FLIGHT_SUGGESTIONS.map((suggestion)=><button key={suggestion} type="button" onClick={()=>addPreference(suggestion)} className="rounded-full border border-hair bg-white px-3 py-2 text-[9.5px] font-semibold text-muted transition hover:border-ink/25 hover:bg-surface-2 hover:text-ink">{suggestion}</button>)}</div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-[17px] border border-hair bg-white p-1.5 shadow-sm focus-within:border-accent">
            <input value={chatDraft} onChange={(event)=>setChatDraft(event.target.value)} onKeyDown={(event)=>event.key==="Enter"&&addPreference(chatDraft)} placeholder="e.g. no red-eyes, aisle seat, land before dinner…" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[11px] outline-none placeholder:text-faint"/>
            <button type="button" onClick={()=>addPreference(chatDraft)} disabled={!chatDraft.trim()} className="grid h-10 w-10 place-items-center rounded-[12px] bg-ink text-paper disabled:opacity-30" aria-label="Add flight preference">→</button>
          </div>
        </div>
      </section>
    </div>
  </div>;
}
