"use client";

import { useEffect, useRef, useState } from "react";

type Stage = "lock" | "chat" | "browser";
type ActivityId = "miraikan" | "joypolis" | "circus";
type CarChoice = "rental" | "private";

type Activity = {
  id: ActivityId;
  name: string;
  area: string;
  description: string;
  travel: string;
  price: string;
};

const activities: Activity[] = [
  {
    id: "miraikan",
    name: "Miraikan",
    area: "Odaiba",
    description: "Indoor science museum · easiest swap for the family",
    travel: "24 min by taxi",
    price: "¥630 / adult",
  },
  {
    id: "joypolis",
    name: "Tokyo Joypolis",
    area: "Odaiba",
    description: "Indoor rides and games · closest to Disneyland energy",
    travel: "22 min by taxi",
    price: "From ¥5,500",
  },
  {
    id: "circus",
    name: "Grand Circus Show",
    area: "Tachikawa",
    description: "Indoor live show · the biggest outing of the three",
    travel: "About 55 min by car",
    price: "From ¥6,800",
  },
];

const carOptions = {
  rental: {
    label: "Saved rental",
    name: "Toyota Alphard",
    details: "7 seats · 4 large bags · automatic",
    timing: "10:00 pickup · MUJI Hotel Ginza",
    price: "¥18,900",
  },
  private: {
    label: "Private car",
    name: "Alphard + driver",
    details: "Up to 6 guests · luggage included",
    timing: "10:15 hotel pickup · driver waits in Tachikawa",
    price: "¥27,400",
  },
} satisfies Record<
  CarChoice,
  { label: string; name: string; details: string; timing: string; price: string }
>;

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
      <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[21px] w-[21px]">
      <rect x="3" y="6" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15 10 5-3v10l-5-3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[20px] w-[20px]">
      <path d="M7.1 3.5 4.7 5.2c-.8.6-.9 1.8-.4 3 2.1 5.2 6.3 9.4 11.5 11.5 1.2.5 2.4.4 3-.4l1.7-2.4-4.5-3-1.5 1.7c-2.8-1.2-4.9-3.3-6.1-6.1L10 8 7.1 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-[21px] w-[21px]">
      <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SmileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[22px] w-[22px]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 14.2c.9 1.2 2 1.8 3.5 1.8s2.6-.6 3.5-1.8M9 9.5h.01M15 9.5h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[21px] w-[21px]">
      <path d="M4 8.5h3l1.4-2h7.2l1.4 2h3v9.5H4V8.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[21px] w-[21px]">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4M9 21h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3 w-3">
      <rect x="3.5" y="7" width="9" height="7" rx="1.5" fill="currentColor" />
      <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto h-dvh w-full max-w-[430px] sm:h-auto sm:px-3 sm:py-5">
      <div className="relative h-full overflow-hidden bg-[#101112] sm:aspect-[393/852] sm:h-auto sm:rounded-[52px] sm:p-[9px] sm:shadow-[0_38px_90px_-38px_rgba(0,0,0,.58)]">
        <div className="relative h-full overflow-hidden bg-[#efeae2] sm:rounded-[44px]">
          <div className="pointer-events-none absolute left-1/2 top-[11px] z-[100] hidden h-[28px] w-[101px] -translate-x-1/2 rounded-full bg-black sm:block" />
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusBar({ light = false }: { light?: boolean }) {
  return (
    <div
      className={`relative z-50 flex h-[45px] shrink-0 items-end justify-between px-6 pb-2 text-[15px] font-semibold ${light ? "text-white" : "text-[#111b21]"}`}
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <span>8:12</span>
      <div className="flex items-center gap-[7px]">
        <span className="flex items-end gap-[2px]" aria-hidden="true">
          {[5, 8, 11, 14].map((height) => <i key={height} className="block w-[3px] rounded-full bg-current" style={{ height }} />)}
        </span>
        <svg viewBox="0 0 18 14" className="h-[14px] w-[18px]" fill="none" aria-hidden="true">
          <path d="M2 5.5a10 10 0 0 1 14 0M5 8.5a5.8 5.8 0 0 1 8 0M8 11.5a1.6 1.6 0 0 1 2 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="relative h-[14px] w-[25px] rounded-[4px] border border-current p-[2px]" aria-hidden="true">
          <span className="block h-full w-[80%] rounded-[2px] bg-current" />
          <span className="absolute -right-[3px] top-[4px] h-[5px] w-[2px] rounded-r bg-current" />
        </span>
      </div>
    </div>
  );
}

function OtwAvatar({ size = 40 }: { size?: number }) {
  return (
    <span
      role="img"
      aria-label="OTW"
      className="grid shrink-0 place-items-center overflow-hidden rounded-full border border-black/10 bg-white font-bold tracking-[-.06em] text-[#0e0e0d]"
      style={{ width: size, height: size, fontSize: size * .28 }}
    >
      OTW
    </span>
  );
}

function WhatsAppMark({ size = 27 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-[#25D366] text-white" style={{ width: size, height: size }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.2a8.7 8.7 0 0 0-7.5 13.1L3.2 21l4.8-1.3A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8.2 7.2c.3-.5.6-.5.9-.5h.6c.2 0 .4.1.5.4l.9 2.1c.1.3.1.5-.1.8l-.7.8c-.2.2-.1.4 0 .6.5 1 1.3 1.8 2.3 2.4.2.1.4.2.6 0l1-1.2c.2-.2.4-.3.7-.2l2.1 1c.3.1.4.3.4.6 0 .6-.2 1.4-.7 2-.5.6-1.3 1-2.4 1-1 0-2.2-.4-3.9-1.3-2.3-1.4-3.8-3.8-3.9-4-.1-.2-1-1.3-1-2.5s.6-1.8.9-2.1Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function LockScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <PhoneShell>
      <div className="relative flex h-full flex-col overflow-hidden text-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#edc4ba_0%,#e9979a_38%,#ebc871_100%)]" />
        <div className="absolute -right-[34%] top-[15%] h-[76%] w-[88%] rotate-[8deg] rounded-[52%_48%_50%_50%/34%_38%_62%_66%] bg-[linear-gradient(150deg,#77738a_0%,#4e738d_52%,#0a7693_100%)]" />
        <div className="absolute -bottom-[24%] -left-[18%] h-[68%] w-[78%] -rotate-[28deg] rounded-[58%_42%_56%_44%/52%_46%_54%_48%] bg-[#f2d6cf]/80" />
        <StatusBar light />
        <div className="relative z-10 mt-9 text-center sm:mt-11">
          <p className="text-[22px] font-semibold">Wednesday, 2 September</p>
          <p className="mt-1 text-[86px] font-extralight leading-none tracking-[-.07em] text-white/85">8:12</p>
        </div>
        <div className="relative z-10 mt-auto px-3 pb-[92px] sm:px-4 sm:pb-[108px]">
          <button
            onClick={onOpen}
            className="w-full rounded-[24px] bg-[#25262a]/82 p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,.24)] backdrop-blur-2xl transition-transform active:scale-[.99]"
          >
            <div className="flex items-center gap-2">
              <WhatsAppMark />
              <span className="text-[12px] font-semibold uppercase tracking-[.035em] text-white/65">WhatsApp</span>
              <span className="ml-auto text-[12px] text-white/55">now</span>
            </div>
            <div className="mt-3 flex gap-3">
              <OtwAvatar size={46} />
              <div className="min-w-0">
                <p className="text-[16px] font-semibold">OTW</p>
                <p className="mt-1 text-[14px] leading-[1.35] text-white/92">
                  Rain is expected at Disneyland from 11:00. I found 3 indoor alternatives that keep the rest of today intact.
                </p>
              </div>
            </div>
          </button>
        </div>
        <div className="absolute bottom-2.5 left-1/2 z-20 h-1.5 w-32 -translate-x-1/2 rounded-full bg-white/92" />
      </div>
    </PhoneShell>
  );
}

function WhatsAppHeader({ typing }: { typing: boolean }) {
  return (
    <>
      <StatusBar />
      <div className="flex h-[61px] shrink-0 items-center gap-2 border-b border-[#dfe3e5] bg-[#f0f2f5] px-2.5">
        <button aria-label="Back" className="grid h-10 w-8 place-items-center text-[#008069]"><ChevronLeftIcon /></button>
        <OtwAvatar size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[15px] font-semibold leading-tight text-[#111b21]">OTW</p>
            <span className="grid h-[15px] w-[15px] place-items-center rounded-full bg-[#1da457] text-[9px] font-bold text-white" aria-label="Verified business">✓</span>
          </div>
          <p className={`mt-[2px] text-[12px] leading-tight ${typing ? "font-medium text-[#008069]" : "text-[#667781]"}`}>
            {typing ? "typing…" : "Business account"}
          </p>
        </div>
        <div className="flex items-center gap-0.5 text-[#54656f]">
          <button aria-label="Video call" className="grid h-10 w-9 place-items-center"><VideoIcon /></button>
          <button aria-label="Voice call" className="grid h-10 w-9 place-items-center"><PhoneIcon /></button>
          <button aria-label="More options" className="grid h-10 w-8 place-items-center"><MoreIcon /></button>
        </div>
      </div>
    </>
  );
}

function Bubble({ side = "in", children, time = "8:12" }: { side?: "in" | "out"; children: React.ReactNode; time?: string }) {
  const outgoing = side === "out";
  return (
    <div className={`wa-message flex ${outgoing ? "justify-end" : "justify-start"}`}>
      <div className={`relative max-w-[86%] rounded-[8px] px-2.5 pb-1.5 pt-2 shadow-[0_1px_1px_rgba(11,20,26,.13)] ${outgoing ? "rounded-tr-[2px] bg-[#d9fdd3]" : "rounded-tl-[2px] bg-white"}`}>
        <span className={`absolute top-0 h-3 w-2.5 ${outgoing ? "-right-2 bg-[#d9fdd3] [clip-path:polygon(0_0,100%_0,0_100%)]" : "-left-2 bg-white [clip-path:polygon(0_0,100%_0,100%_100%)]"}`} aria-hidden="true" />
        <div className="text-[14px] leading-[1.38] text-[#111b21]">{children}</div>
        <div className="mt-0.5 flex min-h-[12px] justify-end gap-1 pl-8 text-[10px] leading-none text-[#667781]">
          <span>{time}</span>
          {outgoing && <span className="font-bold tracking-[-.16em] text-[#53bdeb]">✓✓</span>}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="wa-message flex justify-start" aria-label="OTW is typing">
      <div className="relative rounded-[8px] rounded-tl-[2px] bg-white px-4 py-3 shadow-[0_1px_1px_rgba(11,20,26,.13)]">
        <span className="absolute -left-2 top-0 h-3 w-2.5 bg-white [clip-path:polygon(0_0,100%_0,100%_100%)]" aria-hidden="true" />
        <div className="flex h-3 items-center gap-1">
          {[0, 1, 2].map((dot) => <span key={dot} className="wa-typing-dot h-[7px] w-[7px] rounded-full bg-[#8696a0]" style={{ animationDelay: `${dot * 150}ms` }} />)}
        </div>
      </div>
    </div>
  );
}

function InteractiveListMessage({ title, body, buttonLabel, onOpen, time }: { title: string; body: string; buttonLabel: string; onOpen: () => void; time: string }) {
  return (
    <div className="wa-message w-[88%] overflow-hidden rounded-[9px] rounded-tl-[2px] bg-white shadow-[0_1px_1px_rgba(11,20,26,.13)]">
      <div className="px-3 pb-2 pt-3">
        <p className="text-[14px] font-semibold text-[#111b21]">{title}</p>
        <p className="mt-1 text-[13px] leading-[1.4] text-[#54656f]">{body}</p>
        <p className="mt-1 text-right text-[10px] leading-none text-[#667781]">{time}</p>
      </div>
      <button onClick={onOpen} className="flex h-11 w-full items-center justify-center gap-2 border-t border-[#e9edef] text-[13px] font-semibold text-[#008069] transition-colors hover:bg-[#f5f7f7] active:bg-[#eef1f2]">
        <span className="grid h-[18px] w-[18px] place-items-center rounded-[3px] border border-current text-[11px]" aria-hidden="true">☰</span>
        {buttonLabel}
      </button>
    </div>
  );
}

function PickerSheet({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-[80] flex flex-col justify-end">
      <button aria-label="Close options" onClick={onClose} className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
      <div className="wa-sheet relative z-10 max-h-[74%] overflow-hidden rounded-t-[20px] bg-white pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-16px_48px_rgba(11,20,26,.2)]">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[#d7dadd]" />
        <div className="flex items-start border-b border-[#e9edef] px-4 pb-3 pt-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-semibold text-[#111b21]">{title}</h3>
            <p className="mt-0.5 text-[12px] text-[#667781]">{subtitle}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-[25px] font-light text-[#54656f]">×</button>
        </div>
        <div className="max-h-[52vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ActivityPicker({ onClose, onChoose }: { onClose: () => void; onChoose: (activity: Activity) => void }) {
  return (
    <PickerSheet title="Indoor alternatives" subtitle="Choose one replacement" onClose={onClose}>
      {activities.map((activity, index) => (
        <button key={activity.id} onClick={() => onChoose(activity)} className={`w-full px-4 py-3.5 text-left transition-colors hover:bg-[#f5f7f7] active:bg-[#eef1f2] ${index ? "border-t border-[#eef0f1]" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#111b21]">{activity.name}</p>
              <p className="mt-0.5 text-[12px] text-[#667781]">{activity.area} · {activity.travel}</p>
              <p className="mt-1 text-[12px] leading-[1.35] text-[#54656f]">{activity.description}</p>
            </div>
            <p className="shrink-0 text-[12px] font-semibold text-[#111b21]">{activity.price}</p>
          </div>
        </button>
      ))}
    </PickerSheet>
  );
}

function TransportPicker({ onClose, onChoose }: { onClose: () => void; onChoose: (choice: CarChoice) => void }) {
  return (
    <PickerSheet title="Choose transport" subtitle="Two options that fit your trip" onClose={onClose}>
      {(["rental", "private"] as CarChoice[]).map((choice, index) => {
        const item = carOptions[choice];
        return (
          <button key={choice} onClick={() => onChoose(choice)} className={`w-full px-4 py-4 text-left transition-colors hover:bg-[#f5f7f7] active:bg-[#eef1f2] ${index ? "border-t border-[#eef0f1]" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[.055em] text-[#667781]">{item.label}</p>
                <p className="mt-0.5 text-[14px] font-semibold text-[#111b21]">{item.name}</p>
                <p className="mt-1 text-[12px] text-[#667781]">{item.details}</p>
                <p className="mt-1 text-[12px] text-[#54656f]">{item.timing}</p>
              </div>
              <p className="shrink-0 text-[13px] font-semibold text-[#111b21]">{item.price}</p>
            </div>
          </button>
        );
      })}
    </PickerSheet>
  );
}

function PaymentLinkCard({ choice, paid, onOpen }: { choice: CarChoice; paid: boolean; onOpen: () => void }) {
  const item = carOptions[choice];
  return (
    <div className="wa-message w-[88%] overflow-hidden rounded-[9px] rounded-tl-[2px] bg-white shadow-[0_1px_1px_rgba(11,20,26,.13)]">
      <div className="px-3 pb-2 pt-3">
        <p className="text-[14px] font-semibold text-[#111b21]">Complete your booking</p>
        <p className="mt-1 text-[13px] leading-[1.4] text-[#54656f]">{item.name} · {item.price}</p>
        <div className="mt-2.5 rounded-[7px] bg-[#f0f2f5] px-3 py-2.5">
          <p className="text-[11px] uppercase tracking-[.045em] text-[#667781]">Secure payment</p>
          <p className="mt-0.5 truncate text-[13px] font-medium text-[#111b21]">OTW checkout</p>
        </div>
        <p className="mt-1.5 text-right text-[10px] leading-none text-[#667781]">8:15</p>
      </div>
      <button disabled={paid} onClick={onOpen} className="flex h-11 w-full items-center justify-center gap-2 border-t border-[#e9edef] text-[13px] font-semibold text-[#008069] transition-colors enabled:hover:bg-[#f5f7f7] enabled:active:bg-[#eef1f2] disabled:text-[#8696a0]">
        {paid ? "Payment complete" : "Complete booking"}
        {!paid && <span aria-hidden="true">↗</span>}
      </button>
      {!paid && <p className="border-t border-[#f1f3f4] py-1.5 text-center text-[10px] text-[#8696a0]">Opens in your browser</p>}
    </div>
  );
}

function UpdatedItinerary({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="wa-message w-[91%] overflow-hidden rounded-[9px] rounded-tl-[2px] bg-white shadow-[0_1px_1px_rgba(11,20,26,.13)]">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[.07em] text-[#667781]">Today · updated</p>
          <span className="rounded-full bg-[#d9fdd3] px-2 py-0.5 text-[10px] font-semibold text-[#008069]">Saved</span>
        </div>
        <div className="mt-3 grid gap-2.5 text-[13px] text-[#111b21]">
          <div className="flex justify-between gap-2"><span>09:00 · Breakfast</span><span className="text-[#667781]">Ginza</span></div>
          <div className="flex justify-between gap-2 font-semibold"><span>11:00 · Grand Circus</span><span className="text-[#008069]">Updated</span></div>
          <div className="flex justify-between gap-2"><span>18:30 · Yakiniku</span><span className="text-[#667781]">Confirmed</span></div>
        </div>
      </div>
      <button onClick={onToggle} className="h-11 w-full border-t border-[#e9edef] text-[13px] font-semibold text-[#008069] transition-colors hover:bg-[#f5f7f7]">
        {open ? "Hide trip context" : "View updated itinerary"}
      </button>
      {open && (
        <div className="border-t border-[#e9edef] bg-[#f7f8fa] p-3 text-[12px] leading-[1.45] text-[#54656f]">
          2 adults + 2 kids · family hotel in Ginza · dinner unchanged · weather monitoring stays active.
        </div>
      )}
    </div>
  );
}

function Composer() {
  return (
    <div className="shrink-0 border-t border-[#d9dddf] bg-[#f0f2f5] px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      <div className="flex items-end gap-1.5">
        <button aria-label="Add attachment" className="grid h-11 w-9 shrink-0 place-items-center text-[#54656f]"><PlusIcon /></button>
        <div className="flex min-h-11 min-w-0 flex-1 items-center rounded-[22px] bg-white px-3 shadow-[0_1px_0_rgba(11,20,26,.03)]">
          <button aria-label="Emoji" className="mr-2 text-[#8696a0]"><SmileIcon /></button>
          <input readOnly aria-label="Message OTW" placeholder="Message" className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111b21] outline-none placeholder:text-[#8696a0]" />
          <button aria-label="Camera" className="ml-2 text-[#8696a0]"><CameraIcon /></button>
        </div>
        <button aria-label="Voice message" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#008069] text-white shadow-sm"><MicIcon /></button>
      </div>
    </div>
  );
}

type ChatProps = {
  introStep: number;
  selectedActivity: Activity | null;
  activityStep: number;
  pendingChoice: CarChoice | null;
  handoffStep: number;
  confirmedChoice: CarChoice | null;
  bookingStep: number;
  onChooseActivity: (activity: Activity) => void;
  onChooseTransport: (choice: CarChoice) => void;
  onOpenCheckout: () => void;
};

function Chat({ introStep, selectedActivity, activityStep, pendingChoice, handoffStep, confirmedChoice, bookingStep, onChooseActivity, onChooseTransport, onOpenCheckout }: ChatProps) {
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [picker, setPicker] = useState<"activities" | "transport" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedCar = pendingChoice ? carOptions[pendingChoice] : null;
  const typing = introStep === 0 || introStep === 2 || activityStep === 1 || activityStep === 3 || handoffStep === 1 || bookingStep === 1 || bookingStep === 3;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [introStep, selectedActivity, activityStep, pendingChoice, handoffStep, bookingStep, confirmedChoice, itineraryOpen]);

  return (
    <PhoneShell>
      <div className="relative flex h-full flex-col bg-[#efeae2]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <WhatsAppHeader typing={typing} />
        <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="pointer-events-none absolute inset-0 opacity-[.22]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%,#89958d 0 1px,transparent 1.25px),linear-gradient(45deg,transparent 48%,#a7b0aa 49%,#a7b0aa 51%,transparent 52%)", backgroundSize: "34px 34px,72px 72px" }} />
          <div className="relative z-10 space-y-2">
            <div className="mx-auto flex w-fit max-w-[88%] items-center gap-1 rounded-[7px] bg-[#fff5c4] px-2.5 py-1.5 text-center text-[10px] leading-tight text-[#54656f] shadow-sm">
              <LockIcon /> Messages are end-to-end encrypted
            </div>
            <div className="mx-auto w-fit rounded-[7px] bg-[#e1f3fb] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[.035em] text-[#54656f] shadow-sm">Today</div>

            {introStep >= 1 && (
              <Bubble>
                <p><strong>Heads up — rain is now expected from 11:00</strong>, which overlaps with Tokyo Disneyland.</p>
                <p className="mt-2">I checked the rest of today first. Your 18:30 yakiniku reservation can stay as-is.</p>
              </Bubble>
            )}
            {introStep >= 3 && (
              <Bubble time="8:13">
                <p>I found 3 indoor replacements. I’d take <strong>Miraikan</strong> for the least disruption; <strong>Grand Circus Show</strong> is the more memorable option.</p>
              </Bubble>
            )}
            {introStep >= 4 && !selectedActivity && (
              <InteractiveListMessage
                title="Indoor alternatives"
                body="Compare the three options without leaving WhatsApp."
                buttonLabel="View 3 options"
                time="8:13"
                onOpen={() => setPicker("activities")}
              />
            )}

            {selectedActivity && <Bubble side="out" time="8:13">Replace Disneyland with {selectedActivity.name}</Bubble>}
            {selectedActivity && activityStep >= 2 && (
              <Bubble time="8:14">
                <p><strong>Done.</strong> I replaced Disneyland with {selectedActivity.name} and kept everything else today unchanged.</p>
              </Bubble>
            )}
            {selectedActivity?.id === "circus" && activityStep >= 4 && (
              <>
                <Bubble time="8:14">
                  <p>Tachikawa is about <strong>55 minutes by car</strong>. With 2 kids and your luggage requirement, I’d sort transport now.</p>
                  <p className="mt-2">I found your saved Alphard rental and a private-car option:</p>
                </Bubble>
                {!pendingChoice && !confirmedChoice && (
                  <InteractiveListMessage
                    title="Transport options"
                    body="Both options fit 2 adults, 2 kids, and 4 large bags."
                    buttonLabel="Choose transport"
                    time="8:14"
                    onOpen={() => setPicker("transport")}
                  />
                )}
              </>
            )}

            {pendingChoice && selectedCar && (
              <Bubble side="out" time="8:15">Use {selectedCar.label.toLowerCase()}: {selectedCar.name}</Bubble>
            )}
            {pendingChoice && handoffStep >= 2 && (
              <>
                <Bubble time="8:15">
                  <p>I’ve held the <strong>{selectedCar?.name}</strong>. Everything else is handled here; only payment needs a secure browser.</p>
                </Bubble>
                <PaymentLinkCard choice={pendingChoice} paid={Boolean(confirmedChoice)} onOpen={onOpenCheckout} />
              </>
            )}

            {confirmedChoice && selectedCar && bookingStep >= 2 && (
              <Bubble time="8:16">
                <p><strong>Booked ✓</strong></p>
                <p className="mt-1">{selectedCar.name} is confirmed for today. Pickup details are attached to your Tokyo trip, and I kept dinner at 18:30.</p>
              </Bubble>
            )}
            {confirmedChoice && bookingStep >= 4 && <UpdatedItinerary open={itineraryOpen} onToggle={() => setItineraryOpen((value) => !value)} />}

            {typing && <TypingBubble />}
          </div>
        </div>
        <Composer />
        {picker === "activities" && (
          <ActivityPicker
            onClose={() => setPicker(null)}
            onChoose={(activity) => {
              setPicker(null);
              onChooseActivity(activity);
            }}
          />
        )}
        {picker === "transport" && (
          <TransportPicker
            onClose={() => setPicker(null)}
            onChoose={(choice) => {
              setPicker(null);
              onChooseTransport(choice);
            }}
          />
        )}
      </div>
      <style>{`
        @keyframes waTyping { 0%, 60%, 100% { opacity: .35; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
        @keyframes waMessage { from { opacity: 0; transform: translateY(5px) scale(.99); } to { opacity: 1; transform: none; } }
        @keyframes waSheet { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        .wa-typing-dot { animation: waTyping 1.05s ease-in-out infinite; }
        .wa-message { animation: waMessage .2s ease-out both; }
        .wa-sheet { animation: waSheet .2s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .wa-typing-dot, .wa-message, .wa-sheet { animation: none; } }
      `}</style>
    </PhoneShell>
  );
}

function BrowserCheckout({ choice, onBack, onConfirm }: { choice: CarChoice; onBack: () => void; onConfirm: () => void }) {
  const item = carOptions[choice];
  const [paying, setPaying] = useState(false);

  const handlePayment = () => {
    setPaying(true);
    window.setTimeout(onConfirm, 800);
  };

  return (
    <PhoneShell>
      <div className="flex h-full flex-col bg-[#f4f4f4]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <StatusBar />
        <div className="shrink-0 border-b border-[#d7d7d9] bg-[#f7f7f8] px-3 pb-2.5 pt-1.5">
          <div className="flex items-center gap-2">
            <button onClick={onBack} aria-label="Return to WhatsApp" className="flex h-9 items-center gap-0.5 pr-1 text-[13px] font-medium text-[#007aff]">
              <ChevronLeftIcon /> WhatsApp
            </button>
            <div className="flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#e9e9eb] px-3 text-[12px] text-[#3c3c43]">
              <LockIcon /> <span className="truncate">OTW checkout</span>
            </div>
            <button aria-label="Browser options" className="grid h-9 w-8 place-items-center text-[20px] text-[#007aff]">•••</button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-5">
          <div className="flex items-center gap-3 border-b border-[#eceff1] pb-4">
            <OtwAvatar size={42} />
            <div>
              <p className="text-[15px] font-semibold text-[#172235]">OTW</p>
              <p className="text-[12px] text-[#667085]">Secure checkout</p>
            </div>
          </div>
          <div className="py-5">
            <p className="text-[12px] font-semibold uppercase tracking-[.07em] text-[#667085]">Complete booking</p>
            <h1 className="mt-1.5 text-[24px] font-semibold tracking-[-.025em] text-[#172235]">Grand Circus Show</h1>
            <p className="mt-1 text-[13px] text-[#667085]">Today, 11:00 · Tachikawa</p>
          </div>
          <div className="rounded-[14px] border border-[#e3e7eb] bg-white p-4 shadow-[0_8px_30px_-24px_rgba(16,24,40,.3)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[.07em] text-[#667085]">{item.label}</p>
                <h2 className="mt-1 text-[16px] font-semibold text-[#172235]">{item.name}</h2>
                <p className="mt-1 text-[13px] text-[#667085]">{item.details}</p>
              </div>
              <p className="shrink-0 text-[16px] font-semibold text-[#172235]">{item.price}</p>
            </div>
            <div className="mt-4 rounded-[9px] bg-[#f4f6f8] p-3 text-[13px] text-[#475467]">{item.timing}</div>
          </div>
          <div className="mt-4 rounded-[14px] border border-[#e3e7eb] p-4">
            <div className="flex items-center justify-between text-[13px] text-[#475467]"><span>Transport</span><span>{item.price}</span></div>
            <div className="mt-2 flex items-center justify-between text-[13px] text-[#475467]"><span>Booking fee</span><span>¥0</span></div>
            <div className="mt-3 flex items-center justify-between border-t border-[#e3e7eb] pt-3 text-[15px] font-semibold text-[#172235]"><span>Total</span><span>{item.price}</span></div>
          </div>
          <div className="mt-4 rounded-[12px] bg-[#f4f6f8] p-3.5">
            <p className="text-[13px] font-semibold text-[#172235]">You’ll finish here in the browser</p>
            <p className="mt-1 text-[12px] leading-[1.45] text-[#667085]">After payment, your confirmation and updated itinerary will be sent in WhatsApp. There’s no app to open.</p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#667085]">
            <LockIcon /> Encrypted payment
          </div>
        </div>
        <div className="shrink-0 border-t border-[#dfe3e5] bg-white p-4">
          <button disabled={paying} onClick={handlePayment} className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#203351] text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#172842] active:bg-[#132238] disabled:opacity-75">
            {paying ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> Processing payment…
              </>
            ) : (
              <>Pay {item.price}</>
            )}
          </button>
          <div className="mt-3 flex items-center justify-around text-[#007aff]">
            {[
              ["‹", "Back"],
              ["↗", "Share"],
              ["□", "Tabs"],
            ].map(([icon, label]) => (
              <button key={label} aria-label={label} className="grid h-7 min-w-10 place-items-center text-[17px]">{icon}</button>
            ))}
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

export function WhatsAppInvestorPrototype() {
  const [stage, setStage] = useState<Stage>("lock");
  const [introStep, setIntroStep] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityStep, setActivityStep] = useState(0);
  const [pendingChoice, setPendingChoice] = useState<CarChoice | null>(null);
  const [handoffStep, setHandoffStep] = useState(0);
  const [confirmedChoice, setConfirmedChoice] = useState<CarChoice | null>(null);
  const [bookingStep, setBookingStep] = useState(0);

  useEffect(() => {
    if (stage !== "chat" || introStep >= 4) return;
    const delays = [650, 300, 850, 220];
    const timer = window.setTimeout(() => setIntroStep((step) => Math.min(step + 1, 4)), delays[introStep]);
    return () => window.clearTimeout(timer);
  }, [stage, introStep]);

  useEffect(() => {
    if (stage !== "chat" || !selectedActivity) return;
    if (activityStep === 1) {
      const timer = window.setTimeout(() => setActivityStep(2), 900);
      return () => window.clearTimeout(timer);
    }
    if (selectedActivity.id === "circus" && activityStep === 2) {
      const timer = window.setTimeout(() => setActivityStep(3), 350);
      return () => window.clearTimeout(timer);
    }
    if (selectedActivity.id === "circus" && activityStep === 3) {
      const timer = window.setTimeout(() => setActivityStep(4), 900);
      return () => window.clearTimeout(timer);
    }
  }, [stage, selectedActivity, activityStep]);

  useEffect(() => {
    if (stage !== "chat" || !pendingChoice || confirmedChoice || handoffStep !== 1) return;
    const timer = window.setTimeout(() => setHandoffStep(2), 850);
    return () => window.clearTimeout(timer);
  }, [stage, pendingChoice, confirmedChoice, handoffStep]);

  useEffect(() => {
    if (stage !== "chat" || !confirmedChoice || bookingStep === 0 || bookingStep >= 4) return;
    const delays: Record<number, number> = { 1: 950, 2: 320, 3: 780 };
    const timer = window.setTimeout(() => setBookingStep((step) => Math.min(step + 1, 4)), delays[bookingStep]);
    return () => window.clearTimeout(timer);
  }, [stage, confirmedChoice, bookingStep]);

  if (stage === "lock") return <LockScreen onOpen={() => setStage("chat")} />;

  if (stage === "browser" && pendingChoice) {
    return (
      <BrowserCheckout
        choice={pendingChoice}
        onBack={() => setStage("chat")}
        onConfirm={() => {
          setConfirmedChoice(pendingChoice);
          setBookingStep(1);
          setStage("chat");
        }}
      />
    );
  }

  return (
    <Chat
      introStep={introStep}
      selectedActivity={selectedActivity}
      activityStep={activityStep}
      pendingChoice={pendingChoice}
      handoffStep={handoffStep}
      confirmedChoice={confirmedChoice}
      bookingStep={bookingStep}
      onChooseActivity={(activity) => {
        setSelectedActivity(activity);
        setActivityStep(1);
      }}
      onChooseTransport={(choice) => {
        setPendingChoice(choice);
        setHandoffStep(1);
      }}
      onOpenCheckout={() => setStage("browser")}
    />
  );
}
