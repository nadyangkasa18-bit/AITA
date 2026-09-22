"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type Screen =
  | "home"
  | "collaborators"
  | "invite-collaborators"
  | "ideas"
  | "add-place"
  | "itinerary"
  | "context"
  | "copilot"
  | "updating"
  | "after"
  | "expenses"
  | "receipt"
  | "split-chat"
  | "updated-expense"
  | "final";

export function TypedText({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setCount(text.length); return; }
    setCount(0);
    const timer = window.setInterval(() => setCount((n) => {
      if (n + 3 >= text.length) window.clearInterval(timer);
      return Math.min(text.length, n + 3);
    }), 28);
    return () => window.clearInterval(timer);
  }, [text]);
  return <span><span className="sr-only">{text}</span><span aria-hidden="true">{text.slice(0, count)}{count < text.length && <span className="rr-typing">▍</span>}</span></span>;
}

export function CopilotChat({ screen, open, onOpen, onClose }: { screen: Screen; open: boolean; onOpen: () => void; onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [pending, setPending] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const before = ["home", "collaborators", "invite-collaborators", "ideas", "add-place", "context"].includes(screen);
  useEffect(() => {
    if (open) panel.current?.querySelector<HTMLInputElement>("input")?.focus();
    else launcher.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      const q = pending.toLowerCase();
      const answer = /rain|weather/.test(q) ? "Let’s keep tomorrow mostly indoors: coffee at Koffee Mameya, teamLab Planets, then Ramen Kagari. We can move Disneyland to Friday. Want to review that plan?" : /food|eat|dinner|restaurant/.test(q) ? "Ramen Kagari is on your group’s shortlist. We can build a food-focused day around Ginza and Tsukiji, with a slower morning. Which meal should we plan first?" : /split|bill|pizza|drink|expense/.test(q) ? "I can help work through the bill with you. Open the receipt and tap ‘Help split for me’ so we can review the items and who shared each one." : /plan|trip|tokyo|save/.test(q) ? "For your Tokyo trip, let’s start with everyone’s saved places, group nearby stops, and leave room for slow mornings. What’s one thing you don’t want to miss?" : "Tell me a little more about what you need. You can ask about plans, places, travel questions or expenses here, without leaving your trip. This demo uses sample replies; live AI isn’t connected yet.";
      setMessages((items) => [...items, { role: "assistant", text: answer }]);
      setPending("");
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [pending]);
  useEffect(() => {
    if (!open || !transcript.current) return;
    const area = transcript.current;
    const observer = new MutationObserver(() => { area.scrollTop = area.scrollHeight; });
    observer.observe(area, { childList: true, subtree: true, characterData: true });
    area.scrollTop = area.scrollHeight;
    return () => observer.disconnect();
  }, [open]);
  const send = (value: string) => {
    if (!value.trim() || pending) return;
    setMessages((items) => [...items, { role: "user", text: value.trim() }]);
    setPending(value.trim()); setPrompt("");
  };
  return <>
    <div className="shrink-0 border-t border-black/10 bg-[#f4f2ec] px-4 pt-2 pb-5">
      <button ref={launcher} onClick={onOpen} aria-label="Ask Co-Pilot, your AI Co-Pilot" aria-haspopup="dialog" aria-expanded={open} className="rr-tap flex h-12 w-full items-center gap-3 rounded-full bg-[#0e0e0d] px-4 text-white">
        <span className="shrink-0"><Icon name="sparkles" size={22} /></span><span className="shrink-0 text-[14px] font-semibold">Ask Co-Pilot</span><span className="ml-auto text-right text-[11px] leading-tight text-white/70">Anything, anytime</span>
      </button>
    </div>
    {open && <div ref={panel} role="dialog" aria-modal="true" aria-label="OTW Co-Pilot chat" className="absolute inset-0 z-[110] flex flex-col bg-[#f4f2ec] pt-12" onKeyDown={(event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const elements = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)');
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }}>
      <header className="flex items-center gap-3 border-b border-black/10 p-4"><BrandMark /><div className="flex-1"><h2 className="text-lg font-semibold">Co-Pilot</h2><p className="text-xs text-[#5e5b52]">Your AI Co-Pilot · {before ? "Before your trip" : "During your trip"}</p></div><button onClick={onClose} aria-label="Close Co-Pilot and return to trip" className="h-11 rounded-full border border-black/10 px-4 text-sm">Close</button></header>
      <div ref={transcript} className="rr-scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <h3 className="font-display text-[28px] leading-tight">Ask anything.<br />Before, during, whenever.</h3>
        <AssistantBubble><TypedText text="Hey Nadya, I’m your OTW Co-Pilot. Planning ahead or already out exploring? Ask me anything — I’m right here with your trip." /></AssistantBubble>
        {messages.length === 0 && <div className="flex flex-wrap gap-2">{(before ? ["Help plan Tokyo", "Find food spots", "Help split a bill"] : ["Replan for rain", "Where should we eat?", "Help split a bill"]).map((item) => <button key={item} onClick={() => send(item)} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">{item}</button>)}</div>}
        {messages.map((message, index) => message.role === "user" ? <UserBubble key={index}>{message.text}</UserBubble> : <AssistantBubble key={index}>{index === messages.length - 1 ? <TypedText text={message.text} /> : message.text}</AssistantBubble>)}
        {pending && <div role="status"><p className="mb-2 text-xs text-[#5e5b52]">Co-Pilot is thinking…</p><TypingBubble label="Co-Pilot is thinking" /></div>}
      </div>
      <p className="px-4 pb-2 text-[11px] text-[#837f74]">Interactive prototype · sample AI responses</p>
      <div className="pb-4"><ChatComposer value={prompt} onChange={setPrompt} onSend={() => send(prompt)} disabled={!!pending} placeholder="Ask Co-Pilot anything…" /></div>
    </div>}
  </>;
}

export type IconName =
  | "back"
  | "calendar"
  | "check"
  | "chevron"
  | "cloud"
  | "expenses"
  | "heart"
  | "home"
  | "link"
  | "magic"
  | "people"
  | "plus"
  | "rain"
  | "receipt"
  | "search"
  | "send"
  | "sparkles"
  | "sun";

export const images = {
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=86",
  teamlab: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=900&q=84",
  borderless: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=84",
  ramen: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=84",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=84",
  disney: "https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?auto=format&fit=crop&w=900&q=84",
  sky: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=84",
  books: "https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=900&q=84",
  market: "https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&w=900&q=84",
  alley: "https://images.unsplash.com/photo-1514912885225-5c9ec8507d68?auto=format&fit=crop&w=900&q=84",
} as const;

export const people = [
  { name: "Nadya", initials: "N", color: "#2c2b29" },
  { name: "Sarah", initials: "S", color: "#b55d48" },
  { name: "Jess", initials: "J", color: "#6257ff" },
  { name: "Maya", initials: "M", color: "#47796b" },
] as const;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "back") return <svg {...props}><path d="m15 18-6-6 6-6" /></svg>;
  if (name === "calendar") return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>;
  if (name === "check") return <svg {...props}><path d="m5 12 4 4L19 6" /></svg>;
  if (name === "chevron") return <svg {...props}><path d="m9 6 6 6-6 6" /></svg>;
  if (name === "cloud") return <svg {...props}><path d="M6.5 18h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.4-1.5A4.8 4.8 0 0 0 6.5 18Z" /></svg>;
  if (name === "expenses") return <svg {...props}><path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-4 2-4-2-3 2V5a2 2 0 0 1 2-2Z" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>;
  if (name === "heart") return <svg {...props}><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" /></svg>;
  if (name === "home") return <svg {...props}><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>;
  if (name === "link") return <svg {...props}><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" /></svg>;
  if (name === "magic") return <svg {...props}><path d="m15 4 5 5L8 21l-5-5L15 4Z" /><path d="m6 13 5 5M6 3v4M4 5h4M19 14v5M16.5 16.5h5" /></svg>;
  if (name === "people") return <svg {...props}><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20M16 5.5a3 3 0 0 1 0 5.8M17 14a4.5 4.5 0 0 1 3.5 4.4V20" /></svg>;
  if (name === "plus") return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "rain") return <svg {...props}><path d="M6.5 15.5h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.4-1.5 4.8 4.8 0 0 0 0 9.5Z" /><path d="m8 19-1 2M13 19l-1 2M18 19l-1 2" /></svg>;
  if (name === "receipt") return <svg {...props}><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" /><path d="M9 7h6M9 11h6M9 15h4" /></svg>;
  if (name === "search") return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  if (name === "send") return <svg {...props}><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg>;
  if (name === "sparkles") return <svg {...props}><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15ZM19 13l.7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7L19 13Z" /></svg>;
  return <svg {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
}

function StatusBar() {
  return (
    <div className="relative z-50 flex h-[47px] shrink-0 items-end justify-between px-7 pb-2 text-[13px] font-semibold text-[#0e0e0d]">
      <span>9:41</span>
      <div className="flex items-center gap-2">
        <span className="flex items-end gap-[2px]">{[5, 8, 11, 14].map((height) => <i key={height} className="block w-[3px] rounded-full bg-current" style={{ height }} />)}</span>
        <span className="text-[15px]">⌁</span>
        <span className="h-[13px] w-[27px] rounded-[4px] border border-current p-[2px]"><span className="block h-full w-[82%] rounded-[2px] bg-current" /></span>
      </div>
    </div>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rr-stage flex min-h-dvh items-center justify-center bg-[#dfddd7] p-0 sm:p-5">
      <div className="rr-device relative">
        <span className="rr-side rr-action" />
        <span className="rr-side rr-volume-up" />
        <span className="rr-side rr-volume-down" />
        <span className="rr-side rr-power" />
        <div className="rr-phone relative h-full w-full overflow-hidden bg-[#f4f2ec]">
          <div className="pointer-events-none absolute left-1/2 top-[10px] z-[100] hidden h-[29px] w-[110px] -translate-x-1/2 rounded-full bg-black shadow-[0_1px_0_rgba(255,255,255,.1)_inset] sm:block">
            <i className="absolute right-[9px] top-[9px] h-[10px] w-[10px] rounded-full bg-[#111827] shadow-[0_0_0_2px_#050505]" />
          </div>
          {children}
          <span className="pointer-events-none absolute bottom-[6px] left-1/2 z-[100] hidden h-[5px] w-[132px] -translate-x-1/2 rounded-full bg-[#111]/85 sm:block" />
        </div>
      </div>
    </div>
  );
}

export function Avatar({ person, size = "md" }: { person: (typeof people)[number]; size?: "sm" | "md" }) {
  return <span className={`grid shrink-0 place-items-center rounded-full border-2 border-white font-semibold text-white ${size === "sm" ? "h-7 w-7 text-[9px]" : "h-9 w-9 text-[11px]"}`} style={{ backgroundColor: person.color }}>{person.initials}</span>;
}

export function AvatarStack({ small = false }: { small?: boolean }) {
  return <div className="flex items-center pl-2">{people.map((person) => <span key={person.name} className="-ml-2"><Avatar person={person} size={small ? "sm" : "md"} /></span>)}</div>;
}

export function BrandMark({ size = 40, label = false }: { size?: number; label?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/otw-logo-cropped.png" alt="OTW" width={size} height={size} className="shrink-0 rounded-[24%]" style={{ width: size, height: size }} />
      {label && <span className="font-display text-[17px] font-semibold tracking-[-.035em] text-current">OTW</span>}
    </div>
  );
}

export function AppHeader({ title, eyebrow, onBack, trailing = true }: { title: string; eyebrow?: string; onBack?: () => void; trailing?: boolean }) {
  return (
    <>
      <StatusBar />
      <header className="flex h-[63px] shrink-0 items-center gap-3 border-b border-black/[.08] bg-[#f4f2ec]/95 px-4 backdrop-blur-xl">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Go back" className="rr-tap grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/[.09] bg-white text-[#0e0e0d]"><Icon name="back" size={19} /></button>
        ) : <BrandMark size={40} />}
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="truncate text-[9px] font-bold uppercase tracking-[.14em] text-[#837f74]">{eyebrow}</p>}
          <h1 className="font-display truncate text-[18px] font-semibold tracking-[-.035em] text-[#0e0e0d]">{title}</h1>
        </div>
        {trailing && <AvatarStack small />}
      </header>
    </>
  );
}

export function BottomNav({ active, onNavigate }: { active: "trip" | "copilot" | "expenses"; onNavigate: (screen: Screen) => void }) {
  const items: Array<{ id: typeof active; label: string; icon: IconName; target: Screen }> = [
    { id: "trip", label: "Trip", icon: "home", target: "home" },
    { id: "copilot", label: "Co-Pilot", icon: "sparkles", target: "copilot" },
    { id: "expenses", label: "Expenses", icon: "expenses", target: "expenses" },
  ];
  return (
    <nav
      className="flex min-h-[92px] shrink-0 items-start justify-around border-t border-black/[.08] bg-[#f4f2ec]/95 px-5 pt-2 backdrop-blur-xl"
      style={{ paddingBottom: "max(18px, env(safe-area-inset-bottom))" }}
    >
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => onNavigate(item.target)} className={`rr-tap flex min-w-[76px] flex-col items-center gap-1 text-[11px] font-semibold ${active === item.id ? "text-[#0e0e0d]" : "text-[#837f74]"}`}>
          <span className={`grid h-8 w-12 place-items-center rounded-full ${active === item.id ? "bg-[#e3e0ff] text-[#5147de]" : ""}`}><Icon name={item.icon} size={17} /></span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export function PrimaryButton({ children, onClick, tone = "dark", disabled = false }: { children: ReactNode; onClick: () => void; tone?: "dark" | "light" | "accent"; disabled?: boolean }) {
  const palette = tone === "light" ? "border border-black/[.1] bg-white text-[#0e0e0d]" : "bg-[#0e0e0d] text-white shadow-[0_14px_30px_-17px_rgba(14,14,13,.8)]";
  return <button type="button" onClick={onClick} disabled={disabled} className={`rr-tap flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-[14px] font-semibold disabled:opacity-50 ${palette}`}>{children}</button>;
}

export function SectionTitle({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#6257ff]">{eyebrow}</p>
      <h2 className="font-display mt-1.5 text-[29px] font-semibold leading-[.98] tracking-[-.052em] text-[#0e0e0d]">{title}</h2>
      {detail && <p className="mt-2 max-w-[330px] text-[14px] leading-[1.55] text-[#5e5b52]">{detail}</p>}
    </div>
  );
}

export function TypingBubble({ label = "Co-Pilot is thinking" }: { label?: string }) {
  return (
    <div className="rr-message flex items-center gap-2.5">
      <BrandMark size={32} />
      <div className="rounded-[19px] rounded-bl-[6px] border border-black/[.08] bg-white px-4 py-3 shadow-[0_9px_28px_-22px_rgba(14,14,13,.6)]">
        <span className="sr-only">{label}</span>
        <div className="flex h-3 items-center gap-1.5">{[0, 1, 2].map((index) => <i key={index} className="rr-typing h-1.5 w-1.5 rounded-full bg-[#6257ff]" style={{ animationDelay: `${index * 140}ms` }} />)}</div>
      </div>
    </div>
  );
}

export function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="rr-message flex items-end gap-2.5">
      <BrandMark size={30} />
      <div className="max-w-[292px] rounded-[20px] rounded-bl-[6px] border border-black/[.08] bg-white px-4 py-3 text-[14px] leading-[1.55] text-[#3c3a33] shadow-[0_10px_30px_-24px_rgba(14,14,13,.6)]">{children}</div>
    </div>
  );
}

export function UserBubble({ children }: { children: ReactNode }) {
  return <div className="rr-message ml-auto max-w-[286px] rounded-[20px] rounded-br-[6px] bg-[#0e0e0d] px-4 py-3 text-[14px] leading-[1.5] text-white">{children}</div>;
}

export function ChatComposer({ value, onChange, onSend, placeholder = "Ask Co-Pilot…", disabled = false }: { value: string; onChange: (value: string) => void; onSend: () => void; placeholder?: string; disabled?: boolean }) {
  return (
    <div className="border-t border-black/[.08] bg-[#f4f2ec]/96 px-4 pb-4 pt-3 backdrop-blur-xl">
      <div className="flex items-center gap-2 rounded-full border border-black/[.1] bg-white p-1.5 pl-4 shadow-[0_12px_28px_-24px_rgba(14,14,13,.7)]">
        <input value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && value.trim()) onSend(); }} placeholder={placeholder} disabled={disabled} className="min-w-0 flex-1 bg-transparent text-[14px] text-[#0e0e0d] outline-none placeholder:text-[#918d83]" />
        <button type="button" onClick={onSend} disabled={disabled || !value.trim()} aria-label="Send message" className="rr-tap grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0e0e0d] text-white disabled:bg-[#d2cec4]"><Icon name="send" size={15} /></button>
      </div>
    </div>
  );
}
