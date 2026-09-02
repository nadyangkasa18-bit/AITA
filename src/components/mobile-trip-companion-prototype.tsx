"use client";

import { useEffect, useRef, useState } from "react";

type Screen = "lock" | "assistant" | "itinerary" | "bookings" | "car" | "profile";
type ActivityId = "miraikan" | "joypolis" | "circus";
type Activity = {
  id: ActivityId;
  name: string;
  area: string;
  kicker: string;
  rating: string;
  reviews: string;
  travel: string;
  price: string;
  detail: string;
  image: string;
  carHelpful?: boolean;
};
type ChatMessage = { id: string; role: "assistant" | "user"; text: string };

const activities: Activity[] = [
  {
    id: "miraikan",
    name: "Miraikan",
    area: "Odaiba",
    kicker: "Indoor science museum",
    rating: "4.6",
    reviews: "2.8k reviews",
    travel: "24 min by taxi",
    price: "¥630 / adult",
    detail: "Hands-on science, robotics and space exhibits. It gives the kids a full indoor anchor without changing the rest of the day.",
    image: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "joypolis",
    name: "Tokyo Joypolis",
    area: "Odaiba",
    kicker: "Indoor rides + games",
    rating: "4.4",
    reviews: "6.1k reviews",
    travel: "22 min by taxi",
    price: "From ¥5,500",
    detail: "A weather-proof amusement option with rides and games, so it preserves more of the energy of the Disneyland plan.",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "circus",
    name: "Grand Circus Show",
    area: "Tachikawa",
    kicker: "Indoor live show",
    rating: "4.7",
    reviews: "1.4k reviews",
    travel: "~55 min by car",
    price: "From ¥6,800",
    detail: "A bigger indoor event outside central Tokyo. It works well for today, but private transport makes the route much easier with two kids.",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80",
    carHelpful: true,
  },
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round" as const,strokeLinejoin:"round" as const,"aria-hidden":true };
  if(name==="back")return <svg {...common}><path d="M15 18l-6-6 6-6"/></svg>;
  if(name==="rain")return <svg {...common}><path d="M7 16a4 4 0 0 1 .7-8A5.5 5.5 0 0 1 18 10.5 3.5 3.5 0 0 1 17.5 17H8"/><path d="M8 21l1.2-2M12 21l1.2-2M16 21l1.2-2"/></svg>;
  if(name==="plane")return <svg {...common}><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"/></svg>;
  if(name==="hotel")return <svg {...common}><path d="M4 20V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14M16 10h2a2 2 0 0 1 2 2v8M8 8h4M8 12h4M8 16h4M2 20h20"/></svg>;
  if(name==="car")return <svg {...common}><path d="M5 17h14l-1-6-2-3H8l-2 3-1 6zM3 14h18M7 17v2M17 17v2"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/></svg>;
  if(name==="context")return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M8 9h8M8 12h5M8 15h7"/></svg>;
  if(name==="clock")return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
  if(name==="check")return <svg {...common}><path d="M5 12l4 4L19 6"/></svg>;
  if(name==="send")return <svg {...common}><path d="M12 19V5M7 10l5-5 5 5"/></svg>;
  if(name==="chat")return <svg {...common}><path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-5a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>;
  if(name==="chevron")return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
  if(name==="star")return <svg {...common}><path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3z"/></svg>;
  if(name==="ticket")return <svg {...common}><path d="M4 7h16v4a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7z"/><path d="M9 7v11"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9"/></svg>;
}

function PhoneFrame({ children, lock = false }: { children: React.ReactNode; lock?: boolean }) {
  return <div className="mx-auto w-full max-w-[458px] px-2 py-3 sm:px-0 sm:py-6">
    <div className="relative mx-auto h-[min(890px,calc(100dvh-24px))] min-h-[680px] w-full overflow-hidden rounded-[54px] bg-[#111] p-[10px] shadow-[0_38px_90px_-38px_rgba(0,0,0,.55)]">
      <div className={`relative h-full overflow-hidden rounded-[45px] ${lock?"bg-[#16171a]":"bg-[#f8f6f0]"}`}>
        <div className="pointer-events-none absolute left-1/2 top-[10px] z-[100] h-[29px] w-[104px] -translate-x-1/2 rounded-full bg-black"/>
        {children}
      </div>
    </div>
  </div>;
}

function StatusBar({ light = false }: { light?: boolean }) {
  return <div className={`relative z-30 flex h-[50px] shrink-0 items-end justify-between px-7 pb-2.5 text-[16px] font-semibold ${light?"text-white":"text-ink"}`} style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif"}}>
    <span>8:12</span><div className="flex items-center gap-2"><span className="flex items-end gap-[2px]">{[5,8,11,14].map(h=><i key={h} className="block w-[3px] rounded-full bg-current" style={{height:h}}/>)}</span><span className="text-[17px]">⌁</span><span className="h-4 w-7 rounded-[5px] border border-current p-[2px]"><span className="block h-full w-[82%] rounded-[2px] bg-current"/></span></div>
  </div>;
}

function LockScreen({ onOpen }: { onOpen:()=>void }) {
  return <PhoneFrame lock><div className="relative flex h-full flex-col overflow-hidden text-white" style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif"}}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,#8aa1b8_0%,transparent_32%),radial-gradient(circle_at_80%_26%,#454f67_0%,transparent_38%),linear-gradient(155deg,#1b202b_5%,#090b11_88%)]"/>
    <div className="absolute inset-0 bg-black/10"/><StatusBar light/>
    <div className="relative z-10 mt-5 text-center"><p className="text-[22px] font-medium tracking-[-.02em]">Wednesday, April 30</p><p className="mt-1 text-[76px] font-extralight leading-none tracking-[-.06em]">8:12</p></div>
    <div className="relative z-10 mt-auto px-[14px] pb-24">
      <div className="overflow-hidden rounded-[24px] bg-[#111216]/92 shadow-[0_16px_45px_rgba(0,0,0,.28)] backdrop-blur-2xl">
        <div className="flex items-center justify-between px-4 pb-2 pt-3.5"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-[8px] bg-white/10"><Icon name="rain" size={16}/></span><span className="text-[13px] font-semibold">Today’s plan</span></div><span className="text-[12px] text-white/55">now</span></div>
        <div className="mx-[14px] rounded-[18px] bg-white/[.075] p-4">
          <div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#2d3440] text-white"><Icon name="ticket" size={20}/></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-[15px] font-semibold tracking-[-.01em]">Tokyo Disneyland</p><span className="rounded-full bg-[#6d86a2]/30 px-2 py-1 text-[11px] font-semibold text-[#d9e9f9]">11:00</span></div><p className="mt-1 text-[13px] leading-snug text-white/62">Booked for today · 4 travelers</p></div></div>
          <div className="mt-3 flex items-start gap-2 rounded-[13px] bg-[#52708d]/18 px-3 py-2.5"><Icon name="rain" size={17}/><p className="text-[13px] leading-snug text-white/82"><b>Rain is projected from 11 AM.</b> We found a few indoor alternatives that fit the rest of your day.</p></div>
        </div>
        <button onClick={onOpen} className="m-[14px] mt-3 flex h-11 w-[calc(100%-28px)] items-center justify-center rounded-[14px] bg-white text-[14px] font-semibold text-black transition active:scale-[.985]">Review alternatives</button>
      </div>
      <p className="mt-3 text-center text-[11px] text-white/45">Live Activity · updates with today’s conditions</p>
    </div>
    <div className="absolute bottom-7 left-8 right-8 z-10 flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-full bg-black/28 text-[20px] backdrop-blur-xl">⌁</span><span className="grid h-12 w-12 place-items-center rounded-full bg-black/28 text-[20px] backdrop-blur-xl">◉</span></div>
  </div></PhoneFrame>;
}

function AppHeader({ title, onBack, onContext }: { title:string; onBack?:()=>void; onContext:()=>void }) {
  return <><StatusBar/><div className="flex h-[62px] shrink-0 items-center gap-3 border-b border-hair-2 bg-[#f8f6f0]/95 px-4 backdrop-blur-xl"><button onClick={onBack} disabled={!onBack} className={`grid h-11 w-11 place-items-center rounded-full border border-hair bg-white text-ink ${onBack?"":"pointer-events-none opacity-0"}`}><Icon name="back" size={20}/></button><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold uppercase tracking-[.11em] text-faint">Tokyo · Apr 28–30</p><h1 className="truncate font-display text-[21px] font-semibold tracking-[-.03em]">{title}</h1></div><button onClick={onContext} className="flex h-11 items-center gap-1.5 rounded-full border border-hair bg-white px-3.5 text-[12px] font-semibold text-muted"><Icon name="context" size={16}/> Context</button></div></>;
}

function TypingBubble() {
  return <div className="flex justify-start"><div className="rounded-[20px] rounded-bl-[7px] border border-hair bg-white px-4 py-3 shadow-[var(--shadow-card)]"><div className="flex h-4 items-center gap-1.5">{[0,1,2].map(i=><span key={i} className="h-2 w-2 animate-bounce rounded-full bg-faint" style={{animationDelay:`${i*120}ms`,animationDuration:"900ms"}}/>)}</div></div></div>;
}

function ActivityCard({ activity, onOpen, onReplace }: { activity:Activity; onOpen:()=>void; onReplace:()=>void }) {
  return <article className="overflow-hidden rounded-[22px] border border-hair bg-white shadow-[var(--shadow-card)]"><button onClick={onOpen} className="block w-full text-left"><div className="h-[128px] bg-paper-2" style={{backgroundImage:`linear-gradient(180deg,transparent,rgba(0,0,0,.3)),url(${activity.image})`,backgroundSize:"cover",backgroundPosition:"center"}}/><div className="p-4"><p className="text-[11px] font-semibold uppercase tracking-[.09em] text-faint">{activity.kicker}</p><div className="mt-1 flex items-start justify-between gap-3"><div><h3 className="font-display text-[20px] font-semibold tracking-[-.025em]">{activity.name}</h3><p className="mt-1 text-[13px] text-muted">{activity.area} · {activity.travel}</p></div><span className="flex items-center gap-1 text-[12px] font-semibold"><Icon name="star" size={13}/>{activity.rating}</span></div><p className="mt-2 text-[13px] leading-relaxed text-muted">{activity.detail}</p><span className="mt-3 inline-flex text-[12px] font-semibold text-accent">Reviews & details →</span></div></button><div className="border-t border-hair-2 p-3"><button onClick={onReplace} className="h-11 w-full rounded-full bg-ink px-4 text-[13px] font-semibold text-paper">Replace Disneyland with {activity.name}</button></div></article>;
}

function ActivityDetail({ activity, onClose, onReplace }: { activity:Activity; onClose:()=>void; onReplace:()=>void }) {
  return <div className="absolute inset-0 z-[80] flex items-end bg-black/30" onClick={onClose}><section onClick={e=>e.stopPropagation()} className="mobile-sheet-in flex max-h-[91%] w-full flex-col overflow-hidden rounded-t-[30px] bg-[#f8f6f0]"><div className="relative h-[230px] shrink-0" style={{backgroundImage:`linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.52)),url(${activity.image})`,backgroundSize:"cover",backgroundPosition:"center"}}><button onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/92 text-xl">×</button><div className="absolute bottom-5 left-5 right-5 text-white"><p className="text-[11px] font-semibold uppercase tracking-[.1em] text-white/65">{activity.kicker}</p><h2 className="mt-1 font-display text-[31px] font-semibold">{activity.name}</h2><p className="mt-1 text-[13px] text-white/80">{activity.area} · {activity.travel}</p></div></div><div className="min-h-0 flex-1 overflow-y-auto p-5"><div className="flex items-center gap-2 text-[13px]"><span className="flex items-center gap-1 font-semibold"><Icon name="star" size={14}/>{activity.rating}</span><span className="text-faint">{activity.reviews}</span><span className="ml-auto rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-muted">Indoor</span></div><p className="mt-4 text-[14px] leading-relaxed text-muted">{activity.detail}</p><div className="mt-5 grid grid-cols-3 gap-2">{[["Hours","10:00–18:00"],["Travel",activity.travel],["Tickets",activity.price]].map(([a,b])=><div key={a} className="rounded-[15px] bg-white p-3"><p className="text-[10px] uppercase tracking-[.08em] text-faint">{a}</p><p className="mt-1 text-[12px] font-semibold leading-snug">{b}</p></div>)}</div><p className="mt-5 text-[11px] font-semibold uppercase tracking-[.1em] text-faint">Recent reviews</p><div className="mt-2 grid gap-2"><div className="rounded-[15px] border border-hair bg-white p-4 text-[13px] leading-relaxed text-muted">“Great rainy-day option. The kids stayed engaged the whole time.”</div><div className="rounded-[15px] border border-hair bg-white p-4 text-[13px] leading-relaxed text-muted">“Easy to navigate, and there was enough here for a full afternoon.”</div></div></div><div className="shrink-0 border-t border-hair-2 bg-[#f8f6f0] p-4"><button onClick={onReplace} className="h-12 w-full rounded-full bg-ink text-[14px] font-semibold text-paper">Replace Disneyland with {activity.name}</button></div></section></div>;
}

function TripContextSheet({ onClose, onProfile }: { onClose:()=>void; onProfile:()=>void }) {
  const [draft,setDraft]=useState("");const [added,setAdded]=useState<string[]>([]);
  const add=()=>{const text=draft.trim();if(!text)return;setAdded(v=>[...v,text]);setDraft("");};
  const groups=[
    ["Trip basics","Tokyo, Japan · Apr 28–30 · 2 adults + 2 kids"],
    ["Flights","Prefer Haneda · avoid red-eyes · checked bag for each traveler"],
    ["Stay","Within 500m of a station · family room · around ¥35,000/night"],
    ["Car","7-seat minivan · room for 4 large suitcases · automatic"],
    ["Trip rhythm","One anchor activity per day · keep late afternoons flexible"],
  ];
  return <div className="absolute inset-0 z-[90] flex items-end bg-black/26" onClick={onClose}><section onClick={e=>e.stopPropagation()} className="mobile-sheet-in flex h-[86%] w-full flex-col overflow-hidden rounded-t-[30px] bg-[#f8f6f0]"><div className="shrink-0 px-5 pt-3"><div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-hair"/><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[.12em] text-faint">Trip context</p><h2 className="mt-1 font-display text-[28px] font-semibold tracking-[-.035em]">What I’m planning around</h2><p className="mt-2 text-[13px] leading-relaxed text-muted">These are facts and requirements for this Tokyo trip.</p></div><button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hair bg-white text-xl">×</button></div></div><div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4"><button onClick={onProfile} className="mb-4 flex w-full items-center justify-between rounded-[18px] border border-hair bg-white p-4 text-left shadow-[var(--shadow-card)]"><div><p className="text-[13px] font-semibold">Traveler profile</p><p className="mt-1 text-[12px] leading-relaxed text-muted">See the preferences that can carry across trips.</p></div><span className="text-[12px] font-semibold text-accent">Open →</span></button><div className="grid gap-2.5">{groups.map(([label,text])=><button key={label} className="flex items-center gap-3 rounded-[17px] border border-hair bg-white p-4 text-left"><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-faint">{label}</p><p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-soft">{text}</p></div><Icon name="chevron" size={16}/></button>)}{added.map(item=><div key={item} className="rounded-[16px] border border-accent-line bg-accent-tint p-4 text-[13px] font-medium text-ink-soft">Added · {item}</div>)}</div></div><div className="shrink-0 border-t border-hair-2 bg-[#f8f6f0] p-4"><div className="composite-field-owner flex items-center gap-2 rounded-full border border-hair bg-white p-1.5 focus-within:border-accent"><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add context for this trip…" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[14px] outline-none placeholder:text-faint"/><button onClick={add} disabled={!draft.trim()} className="grid h-11 w-11 place-items-center rounded-full bg-ink text-paper disabled:opacity-30"><Icon name="send" size={17}/></button></div></div></section></div>;
}

function AssistantScreen({ onBack, onContext, replacement, onReplace, onCar }: { onBack:()=>void; onContext:()=>void; replacement:Activity|null; onReplace:(a:Activity)=>void; onCar:()=>void }) {
  const [detail,setDetail]=useState<Activity|null>(null);const [draft,setDraft]=useState("");const [thinking,setThinking]=useState(false);const [messages,setMessages]=useState<ChatMessage[]>([{id:"a1",role:"assistant",text:"Rain is projected to start around 11 AM, which overlaps with Disneyland. I found three indoor options that keep the rest of your day workable."}]);const scrollRef=useRef<HTMLDivElement|null>(null);
  useEffect(()=>{scrollRef.current?.scrollTo({top:scrollRef.current.scrollHeight,behavior:"smooth"});},[messages,thinking,replacement]);
  const send=(text?:string)=>{const value=(text??draft).trim();if(!value||thinking)return;setMessages(v=>[...v,{id:`u-${Date.now()}`,role:"user",text:value}]);setDraft("");setThinking(true);window.setTimeout(()=>{setMessages(v=>[...v,{id:`a-${Date.now()}`,role:"assistant",text:/near|close/i.test(value)?"I’ll keep the replacement within roughly 30 minutes of your current route and prioritize indoor options.":/kid|child/i.test(value)?"I’ll bias toward options that work well for both kids and still feel worth changing the day for.":"Got it. I’ll use that to re-rank today’s alternatives without changing the rest of the trip."}]);setThinking(false);},900);};
  const replace=(activity:Activity)=>{onReplace(activity);setDetail(null);setMessages(v=>[...v,{id:`a-r-${Date.now()}`,role:"assistant",text:`Done — I’ll replace Disneyland with ${activity.name} on today’s itinerary.${activity.carHelpful?" It’s outside central Tokyo, so transport is the next thing I’d solve.":" The rest of today stays unchanged."}`}]);if(activity.carHelpful){window.setTimeout(()=>setMessages(v=>[...v,{id:`a-c-${Date.now()}`,role:"assistant",text:"You had a 7-seat rental saved earlier. I can reopen that, or we can compare a private car for this one outing."}]),450);}};
  return <div className="flex h-full flex-col"><AppHeader title="Today’s change" onBack={onBack} onContext={onContext}/><div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto scroll-smooth px-4 pb-5 pt-4"><div className="rounded-[20px] border border-[#c9d9e8] bg-[#edf4fa] p-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white text-[#47647f]"><Icon name="rain" size={19}/></span><div><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#61788e]">Affected event</p><h2 className="mt-1 font-display text-[20px] font-semibold">Tokyo Disneyland</h2><p className="mt-1 text-[13px] text-[#61788e]">Today · 11:00 · rain expected from 11:00</p></div></div>{replacement&&<div className="mt-3 rounded-[13px] bg-white/75 px-3 py-2.5 text-[12px] font-semibold text-[#47647f]">Will be replaced by {replacement.name}</div>}</div><div className="mt-4 space-y-3">{messages.map(m=><div key={m.id} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[84%] rounded-[20px] px-4 py-3 text-[14px] leading-relaxed ${m.role==="user"?"rounded-br-[7px] bg-ink text-paper":"rounded-bl-[7px] border border-hair bg-white text-ink-soft"}`}>{m.text}</div></div>)}{thinking&&<TypingBubble/>}</div>{!replacement&&<div className="mt-5 space-y-4"><p className="text-[12px] font-semibold uppercase tracking-[.1em] text-faint">Best alternatives</p>{activities.map(a=><ActivityCard key={a.id} activity={a} onOpen={()=>setDetail(a)} onReplace={()=>replace(a)}/>)}</div>}{replacement?.carHelpful&&<div className="mt-5 rounded-[20px] border border-hair bg-white p-4"><p className="text-[14px] font-semibold">Transport for {replacement.name}</p><p className="mt-1 text-[13px] leading-relaxed text-muted">Your saved rental fits four travelers and luggage. Continue there, or ask me for a private-car option.</p><div className="mt-3 flex gap-2"><button onClick={onCar} className="h-11 flex-1 rounded-full bg-ink px-3 text-[12px] font-semibold text-paper">Continue saved car</button><button onClick={()=>send("Find a private car instead")} className="h-11 flex-1 rounded-full border border-hair bg-white px-3 text-[12px] font-semibold">Private car</button></div></div>}</div><div className="shrink-0 border-t border-hair-2 bg-[#f8f6f0] px-4 pb-4 pt-3"><div className="mb-2 flex gap-2 overflow-x-auto pb-1">{["Keep it nearby","More for kids","Under ¥10,000"].map(t=><button key={t} onClick={()=>send(t)} className="shrink-0 rounded-full border border-hair bg-white px-3.5 py-2 text-[12px] font-semibold text-muted">{t}</button>)}</div><div className="composite-field-owner flex items-center gap-2 rounded-full border border-hair bg-white p-1.5 focus-within:border-accent"><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask for a different option…" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[14px] outline-none placeholder:text-faint"/><button onClick={()=>send()} disabled={!draft.trim()||thinking} className="grid h-11 w-11 place-items-center rounded-full border border-hair bg-surface-2 text-muted disabled:opacity-30"><Icon name="send" size={17}/></button></div></div>{detail&&<ActivityDetail activity={detail} onClose={()=>setDetail(null)} onReplace={()=>replace(detail)}/>}</div>;
}

function BookingShortcut({ icon,label,state,onClick }: { icon:string;label:string;state:"booked"|"saved"|"pending";onClick:()=>void }) {
  const good=state==="booked";const saved=state==="saved";return <button onClick={onClick} className="min-w-0 flex-1 rounded-[17px] border border-hair bg-white p-3 text-left"><div className="flex items-start justify-between"><span className="grid h-9 w-9 place-items-center rounded-[11px] bg-surface-2"><Icon name={icon} size={18}/></span><span className={`grid h-5 w-5 place-items-center rounded-full ${good?"bg-[#e3eee4] text-[#35543c]":saved?"bg-amber-tint text-amber":"bg-surface-2 text-faint"}`}>{good?<Icon name="check" size={12}/>:saved?"•":"○"}</span></div><p className="mt-2 text-[12px] font-semibold">{label}</p><p className="mt-0.5 text-[11px] text-faint">{good?"Booked":saved?"Saved":"Pending"}</p></button>;
}

function ItineraryEvent({ time,title,subtitle,warning,onSuggestions,replaced=false }: { time:string;title:string;subtitle:string;warning?:boolean;onSuggestions?:()=>void;replaced?:boolean }) {
  return <div className="grid grid-cols-[52px_1fr] gap-3"><p className="pt-4 font-mono text-[13px] text-muted">{time}</p><article className={`rounded-[20px] border bg-white p-4 shadow-[var(--shadow-card)] ${warning?"border-[#d4b98f]":"border-hair"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-faint">{replaced?"Updated activity":"Activity"}</p><h3 className="mt-1 font-display text-[20px] font-semibold">{title}</h3><p className="mt-1 text-[13px] text-muted">{subtitle}</p></div>{warning&&<span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-tint text-amber"><Icon name="rain" size={18}/></span>}</div>{warning&&<div className="mt-3 rounded-[14px] bg-amber-tint p-3"><p className="text-[13px] font-semibold text-[#795922]">Rain expected from 11 AM</p><p className="mt-1 text-[12px] leading-relaxed text-[#866b3a]">This overlaps with most of your Disneyland day.</p><button onClick={onSuggestions} className="mt-2 rounded-full bg-white px-3 py-2 text-[12px] font-semibold text-amber">See suggestions →</button></div>}</article></div>;
}

function ItineraryScreen({ onContext,onAssistant,onCar,replacement }: { onContext:()=>void;onAssistant:()=>void;onCar:()=>void;replacement:Activity|null }) {
  return <div className="flex h-full flex-col"><AppHeader title="Tokyo itinerary" onContext={onContext}/><div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-5"><div><p className="text-[12px] font-semibold uppercase tracking-[.11em] text-faint">Itinerary · 3 days</p><h2 className="mt-1 font-display text-[30px] font-semibold tracking-[-.035em]">Relaxing Tokyo trip</h2><p className="mt-1 text-[14px] text-muted">Apr 28 – Apr 30 · Japan</p></div><section className="mt-5"><div className="mb-2 flex items-center justify-between"><p className="text-[12px] font-semibold uppercase tracking-[.09em] text-faint">Bookings</p><button className="text-[12px] font-semibold text-accent">View all</button></div><div className="flex gap-2"><BookingShortcut icon="plane" label="Flight" state="booked" onClick={()=>{}}/><BookingShortcut icon="hotel" label="Hotel" state="booked" onClick={()=>{}}/><BookingShortcut icon="car" label="Car" state="saved" onClick={onCar}/></div></section><div className="mt-5 flex gap-2 overflow-x-auto pb-1">{[["MON","28","0 items"],["TUE","29","6 items"],["WED","30","Today"]].map(([day,date,n],i)=><button key={date} className={`min-w-[92px] rounded-[17px] border px-3 py-3 text-center ${i===2?"border-ink bg-ink text-paper":"border-hair bg-white"}`}><span className="block text-[11px] font-semibold opacity-60">{day}</span><span className="mt-1 block font-display text-[22px] font-semibold">{date}</span><span className="mt-1 block text-[11px] opacity-65">{n}</span></button>)}</div><div className="mt-7 space-y-4"><ItineraryEvent time="09:00" title="Breakfast in Ginza" subtitle="Café breakfast · 8 min walk"/><ItineraryEvent time="11:00" title={replacement?.name??"Tokyo Disneyland"} subtitle={replacement?`${replacement.area} · ${replacement.travel}`:"Maihama · tickets booked"} warning={!replacement} onSuggestions={onAssistant} replaced={Boolean(replacement)}/><ItineraryEvent time="18:30" title="Yakiniku dinner" subtitle="Ginza · reservation confirmed"/></div></div><button onClick={onAssistant} className="absolute bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-semibold text-paper shadow-[var(--shadow-float)]"><Icon name="chat" size={20}/> Ask</button></div>;
}

function CarScreen({ onBack,onContext }: { onBack:()=>void;onContext:()=>void }) {
  const [selected,setSelected]=useState("toyota");const [booked,setBooked]=useState(false);
  const cars=[{id:"toyota",name:"Toyota Alphard",meta:"7 seats · 4 large bags · automatic",price:"¥18,900/day",tag:"Saved earlier"},{id:"serena",name:"Nissan Serena",meta:"8 seats · 4 large bags · automatic",price:"¥15,800/day",tag:"Lower total"}];
  return <div className="flex h-full flex-col"><AppHeader title="Car rental" onBack={onBack} onContext={onContext}/><div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-5"><p className="text-[12px] font-semibold uppercase tracking-[.1em] text-faint">Picked up where you left off</p><h2 className="mt-1 font-display text-[29px] font-semibold tracking-[-.035em]">Your saved car options</h2><p className="mt-2 text-[14px] leading-relaxed text-muted">You researched these before the trip but didn’t book. They still match the trip context: four travelers, four large suitcases, automatic.</p><div className="mt-5 space-y-3">{cars.map(c=><button key={c.id} onClick={()=>setSelected(c.id)} className={`w-full rounded-[21px] border bg-white p-4 text-left ${selected===c.id?"border-ink shadow-[var(--shadow-card)]":"border-hair"}`}><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-muted">{c.tag}</span><h3 className="mt-3 font-display text-[21px] font-semibold">{c.name}</h3><p className="mt-1 text-[13px] text-muted">{c.meta}</p></div><p className="text-[14px] font-semibold">{c.price}</p></div></button>)}</div><div className="mt-5 rounded-[19px] border border-[#c9d9e8] bg-[#edf4fa] p-4"><p className="text-[13px] font-semibold text-[#47647f]">Why this is relevant now</p><p className="mt-1 text-[13px] leading-relaxed text-[#61788e]">The Grand Circus option is around 55 minutes outside central Tokyo. A rental makes that change easier without rebuilding the itinerary.</p></div>{booked?<div className="mt-5 rounded-[20px] border border-[#c6d9c7] bg-[#edf5ee] p-5"><div className="flex items-center gap-2 text-[#35543c]"><span className="grid h-8 w-8 place-items-center rounded-full bg-white"><Icon name="check" size={16}/></span><p className="text-[15px] font-semibold">Car booked for today</p></div><p className="mt-2 text-[13px] text-[#55705b]">Pickup details are now attached to the same Tokyo trip.</p></div>:<button onClick={()=>setBooked(true)} className="mt-5 h-12 w-full rounded-full bg-ink text-[14px] font-semibold text-paper">Continue booking selected car</button>}</div></div>;
}

function BookingsScreen({ onBack,onContext,onCar }: { onBack:()=>void;onContext:()=>void;onCar:()=>void }) {
  return <div className="flex h-full flex-col"><AppHeader title="Trip bookings" onBack={onBack} onContext={onContext}/><div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-5"><h2 className="font-display text-[29px] font-semibold tracking-[-.035em]">Everything attached to this trip</h2><p className="mt-2 text-[14px] leading-relaxed text-muted">Booked assets stay separate from itinerary events, but share the same trip context.</p><div className="mt-5 space-y-3">{[["plane","Flight","Japan Airlines · CGK → HND","Booked"],["hotel","Hotel","MUJI Hotel Ginza · Apr 28–30","Booked"]].map(([icon,title,meta,status])=><div key={title} className="rounded-[20px] border border-hair bg-white p-4"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-[13px] bg-surface-2"><Icon name={icon}/></span><div className="flex-1"><div className="flex justify-between gap-2"><h3 className="text-[15px] font-semibold">{title}</h3><span className="rounded-full bg-[#e4eee4] px-2.5 py-1 text-[11px] font-semibold text-[#35543c]">{status}</span></div><p className="mt-1 text-[13px] text-muted">{meta}</p></div></div></div>)}<button onClick={onCar} className="w-full rounded-[20px] border border-[#d7c39f] bg-white p-4 text-left"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-[13px] bg-amber-tint text-amber"><Icon name="car"/></span><div className="flex-1"><div className="flex justify-between gap-2"><h3 className="text-[15px] font-semibold">Car rental</h3><span className="rounded-full bg-amber-tint px-2.5 py-1 text-[11px] font-semibold text-amber">Saved</span></div><p className="mt-1 text-[13px] text-muted">2 options saved · booking not completed</p><p className="mt-2 text-[12px] font-semibold text-accent">Continue where you left off →</p></div></div></button></div></div></div>;
}

function ProfileScreen({ onBack }: { onBack:()=>void }) {
  return <div className="flex h-full flex-col"><StatusBar/><div className="flex h-[62px] shrink-0 items-center gap-3 border-b border-hair-2 px-4"><button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-full border border-hair bg-white"><Icon name="back"/></button><div><p className="text-[11px] font-semibold uppercase tracking-[.1em] text-faint">Traveler profile</p><h1 className="font-display text-[21px] font-semibold">Preferences across trips</h1></div></div><div className="min-h-0 flex-1 overflow-y-auto p-4"><div className="rounded-[21px] border border-hair bg-white p-5"><p className="text-[13px] leading-relaxed text-muted">These are reusable preferences. They’re separate from the Tokyo-specific requirements you saw in Trip Context.</p></div><div className="mt-4 space-y-3">{[["Flights","Prefer daytime flights · aisle seat · checked baggage"],["Hotels","Design-forward when location is still convenient"],["Pace","Usually one major activity per day"],["Transport","Prefer simple transfers over the absolute lowest price"]].map(([a,b])=><div key={a} className="rounded-[18px] border border-hair bg-white p-4"><p className="text-[12px] font-semibold uppercase tracking-[.08em] text-faint">{a}</p><p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{b}</p></div>)}</div></div></div>;
}

export function MobileTripCompanionPrototype() {
  const [screen,setScreen]=useState<Screen>("lock");const [contextOpen,setContextOpen]=useState(false);const [replacement,setReplacement]=useState<Activity|null>(null);const [returnScreen,setReturnScreen]=useState<Screen>("itinerary");
  const openContext=()=>{setReturnScreen(screen);setContextOpen(true);};
  const openProfile=()=>{setContextOpen(false);setReturnScreen(screen);setScreen("profile");};
  const goBack=()=>setScreen(returnScreen==="profile"?"itinerary":returnScreen);
  if(screen==="lock")return <div className="min-h-dvh bg-[#ece9e2]"><LockScreen onOpen={()=>setScreen("assistant")}/></div>;
  let content:React.ReactNode;
  if(screen==="assistant")content=<AssistantScreen onBack={()=>setScreen("itinerary")} onContext={openContext} replacement={replacement} onReplace={setReplacement} onCar={()=>setScreen("car")}/>;
  else if(screen==="car")content=<CarScreen onBack={()=>setScreen("itinerary")} onContext={openContext}/>;
  else if(screen==="bookings")content=<BookingsScreen onBack={()=>setScreen("itinerary")} onContext={openContext} onCar={()=>setScreen("car")}/>;
  else if(screen==="profile")content=<ProfileScreen onBack={goBack}/>;
  else content=<ItineraryScreen onContext={openContext} onAssistant={()=>setScreen("assistant")} onCar={()=>setScreen("car")} replacement={replacement}/>;
  return <div className="min-h-dvh bg-[#ece9e2]"><PhoneFrame>{content}{contextOpen&&<TripContextSheet onClose={()=>setContextOpen(false)} onProfile={openProfile}/>}</PhoneFrame></div>;
}
