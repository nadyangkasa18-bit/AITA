"use client";

import { useMemo, useState } from "react";

type Stage = "lock" | "chat" | "checkout";
type ActivityId = "miraikan" | "joypolis" | "circus";
type CarChoice = "rental" | "private";

type Activity = {
  id: ActivityId;
  name: string;
  area: string;
  description: string;
  travel: string;
  price: string;
  image: string;
};

const activities: Activity[] = [
  {
    id: "miraikan",
    name: "Miraikan",
    area: "Odaiba",
    description: "Indoor science museum · best low-friction replacement",
    travel: "24 min by taxi",
    price: "¥630 / adult",
    image: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=900&q=82",
  },
  {
    id: "joypolis",
    name: "Tokyo Joypolis",
    area: "Odaiba",
    description: "Indoor rides + games · closest to Disneyland energy",
    travel: "22 min by taxi",
    price: "From ¥5,500",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=82",
  },
  {
    id: "circus",
    name: "Grand Circus Show",
    area: "Tachikawa",
    description: "Indoor live show · bigger outing, but needs transport",
    travel: "~55 min by car",
    price: "From ¥6,800",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=82",
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
} satisfies Record<CarChoice, { label: string; name: string; details: string; timing: string; price: string }>;

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[393px] px-2 py-3 sm:px-0 sm:py-6">
      <div className="relative mx-auto aspect-[393/852] w-full overflow-hidden rounded-[54px] bg-[#111] p-[10px] shadow-[0_38px_90px_-38px_rgba(0,0,0,.55)]">
        <div className="relative h-full overflow-hidden rounded-[45px] bg-[#efeae2]">
          <div className="pointer-events-none absolute left-1/2 top-[10px] z-[100] h-[29px] w-[104px] -translate-x-1/2 rounded-full bg-black" />
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusBar({ light = false }: { light?: boolean }) {
  return (
    <div className={`relative z-50 flex h-[50px] shrink-0 items-end justify-between px-7 pb-2.5 text-[16px] font-semibold ${light ? "text-white" : "text-[#111]"}`} style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif" }}>
      <span>8:12</span>
      <div className="flex items-center gap-2">
        <span className="flex items-end gap-[2px]">{[5, 8, 11, 14].map(h => <i key={h} className="block w-[3px] rounded-full bg-current" style={{ height: h }} />)}</span>
        <span className="text-[17px]">⌁</span>
        <span className="h-4 w-7 rounded-[5px] border border-current p-[2px]"><span className="block h-full w-[82%] rounded-[2px] bg-current" /></span>
      </div>
    </div>
  );
}

function WhatsAppMark({ size = 40 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-[#25D366] text-white" style={{ width: size, height: size }}>
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7.3 5.9c.3-.6.7-.6 1-.6h.7c.2 0 .5 0 .7.5l1 2.4c.1.3.1.6-.1.9l-.8 1c-.2.2-.1.5 0 .7.6 1.1 1.5 2 2.6 2.7.2.1.5.2.7 0l1.2-1.4c.2-.2.5-.3.8-.2l2.4 1.1c.3.1.5.4.5.7 0 .7-.3 1.7-.8 2.3-.6.7-1.5 1.2-2.7 1.2-1.1 0-2.5-.4-4.4-1.5-2.7-1.6-4.4-4.3-4.5-4.5-.1-.2-1.1-1.5-1.1-2.9 0-1.4.7-2.1 1-2.4Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function LockScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <PhoneShell>
      <div className="relative flex h-full flex-col overflow-hidden text-white" style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif" }}>
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#f2c6bb_0%,#ef9c9e_37%,#f2cf75_100%)]" />
        <div className="absolute -right-[34%] top-[15%] h-[76%] w-[88%] rotate-[8deg] rounded-[52%_48%_50%_50%/34%_38%_62%_66%] bg-[linear-gradient(150deg,#7d7690_0%,#4f748e_50%,#047797_100%)] shadow-[inset_12px_0_20px_rgba(29,63,91,.25)]" />
        <div className="absolute -bottom-[24%] -left-[18%] h-[68%] w-[78%] -rotate-[28deg] rounded-[58%_42%_56%_44%/52%_46%_54%_48%] bg-[#f2d6cf]/80" />
        <StatusBar light />
        <div className="relative z-10 mt-12 text-center"><p className="text-[23px] font-semibold tracking-[-.025em]">Wed 2 Sep</p><p className="mt-2 text-[92px] font-extralight leading-[.88] tracking-[-.075em] text-white/80">8:12</p></div>
        <div className="relative z-10 mt-auto px-4 pb-[118px]">
          <button onClick={onOpen} className="w-full rounded-[25px] bg-[#25262a]/80 p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,.24)] backdrop-blur-2xl transition active:scale-[.99]">
            <div className="flex items-center gap-2"><WhatsAppMark size={25} /><span className="text-[12px] font-semibold uppercase tracking-[.035em] text-white/58">WhatsApp</span><span className="ml-auto text-[12px] text-white/48">now</span></div>
            <div className="mt-3 flex gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff5] text-[22px]">🦦</span>
              <div className="min-w-0"><p className="text-[16px] font-semibold">OtterWay</p><p className="mt-1 text-[14px] leading-snug text-white/90">Rain is expected at Disneyland from 11:00. I found 3 indoor alternatives that keep the rest of today intact.</p></div>
            </div>
          </button>
        </div>
        <div className="absolute bottom-2.5 left-1/2 z-20 h-1.5 w-32 -translate-x-1/2 rounded-full bg-white/92" />
      </div>
    </PhoneShell>
  );
}

function Bubble({ side = "in", children, time = "8:12" }: { side?: "in" | "out"; children: React.ReactNode; time?: string }) {
  return (
    <div className={`flex ${side === "out" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[86%] rounded-[11px] px-3 py-2 shadow-[0_1px_1px_rgba(0,0,0,.09)] ${side === "out" ? "rounded-tr-[4px] bg-[#d9fdd3]" : "rounded-tl-[4px] bg-white"}`}>
        <div className="text-[13px] leading-[1.38] text-[#111b21]">{children}</div>
        <div className="mt-1 flex justify-end gap-1 text-[9px] text-[#667781]"><span>{time}</span>{side === "out" && <span className="font-bold text-[#53bdeb]">✓✓</span>}</div>
      </div>
    </div>
  );
}

function ChoiceCard({ activity, onChoose }: { activity: Activity; onChoose: () => void }) {
  return (
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_1px_rgba(0,0,0,.12)]">
      <div className="h-[102px] bg-[#ddd]" style={{ backgroundImage: `linear-gradient(180deg,transparent,rgba(0,0,0,.25)),url(${activity.image})`, backgroundPosition: "center", backgroundSize: "cover" }} />
      <div className="p-3">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[13px] font-semibold text-[#111b21]">{activity.name}</p><p className="mt-0.5 text-[11px] text-[#667781]">{activity.area} · {activity.travel}</p></div><span className="text-[11px] font-semibold text-[#111b21]">{activity.price}</span></div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-[#54656f]">{activity.description}</p>
      </div>
      <button onClick={onChoose} className="h-10 w-full border-t border-[#e9edef] text-[12px] font-semibold text-[#008069]">Replace Disneyland</button>
    </div>
  );
}

function WhatsAppHeader() {
  return (
    <>
      <StatusBar />
      <div className="flex h-[58px] shrink-0 items-center gap-2 border-b border-[#e9edef] bg-[#f7f8fa] px-3">
        <button className="grid h-9 w-7 place-items-center text-[24px] text-[#008069]">‹</button>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d8ebe5] text-[19px]">🦦</span>
        <div className="min-w-0 flex-1"><div className="flex items-center gap-1"><p className="truncate text-[14px] font-semibold text-[#111b21]">OtterWay</p><span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#25D366] text-[8px] text-white">✓</span></div><p className="text-[10.5px] text-[#667781]">AI travel assistant · Business account</p></div>
        <div className="flex items-center gap-3 text-[#008069]"><span className="text-[17px]">◉</span><span className="text-[17px]">⌕</span><span className="text-[18px]">⋮</span></div>
      </div>
    </>
  );
}

function CarOption({ choice, onChoose }: { choice: CarChoice; onChoose: () => void }) {
  const item = carOptions[choice];
  return (
    <button onClick={onChoose} className="w-full border-t border-[#e9edef] px-3 py-3 text-left first:border-t-0">
      <div className="flex items-start gap-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#edf7f3] text-[15px]">🚗</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.06em] text-[#667781]">{item.label}</p><p className="mt-0.5 text-[12.5px] font-semibold text-[#111b21]">{item.name}</p></div><p className="text-[12px] font-semibold text-[#111b21]">{item.price}</p></div><p className="mt-1 text-[10.5px] leading-relaxed text-[#667781]">{item.details}</p></div></div>
    </button>
  );
}

function Checkout({ choice, onBack, onConfirm }: { choice: CarChoice; onBack: () => void; onConfirm: () => void }) {
  const item = carOptions[choice];
  return (
    <PhoneShell>
      <div className="flex h-full flex-col bg-[#f7f8fa]">
        <StatusBar />
        <div className="flex h-[58px] items-center border-b border-[#e9edef] bg-white px-3"><button onClick={onBack} className="grid h-10 w-9 place-items-center text-[25px] text-[#008069]">‹</button><div className="flex-1 text-center"><p className="text-[14px] font-semibold text-[#111b21]">Complete booking</p><p className="text-[10px] text-[#667781]">Secure OtterWay flow</p></div><span className="w-9" /></div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <div className="rounded-[18px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,.08)]"><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#667781]">For today’s updated plan</p><h2 className="mt-1 text-[19px] font-semibold text-[#111b21]">Grand Circus Show · Tachikawa</h2><p className="mt-1 text-[11px] text-[#667781]">11:00 activity · dinner remains 18:30 in Ginza</p></div>
          <div className="mt-3 rounded-[18px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,.08)]"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#667781]">{item.label}</p><h3 className="mt-1 text-[16px] font-semibold text-[#111b21]">{item.name}</h3><p className="mt-1 text-[11.5px] text-[#667781]">{item.details}</p></div><p className="text-[16px] font-semibold text-[#111b21]">{item.price}</p></div><div className="mt-4 rounded-[12px] bg-[#f0f2f5] p-3 text-[11.5px] leading-relaxed text-[#54656f]">{item.timing}</div></div>
          <div className="mt-3 rounded-[18px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,.08)]"><p className="text-[11px] font-semibold text-[#111b21]">Trip context checked</p><div className="mt-3 grid gap-2 text-[11px] text-[#54656f]">{["2 adults + 2 kids", "4 large suitcases", "Kept yakiniku reservation at 18:30", "No other itinerary items changed"].map(t => <div key={t} className="flex items-center gap-2"><span className="grid h-4 w-4 place-items-center rounded-full bg-[#d9fdd3] text-[9px] text-[#008069]">✓</span>{t}</div>)}</div></div>
          <p className="mt-4 px-1 text-[10.5px] leading-relaxed text-[#667781]">Prototype only. A real booking would pause before any material price or availability change and ask for approval.</p>
        </div>
        <div className="border-t border-[#e9edef] bg-white p-4"><button onClick={onConfirm} className="h-12 w-full rounded-full bg-[#008069] text-[13px] font-semibold text-white">Confirm {item.price}</button></div>
      </div>
    </PhoneShell>
  );
}

function Chat({ onCheckout }: { onCheckout: (choice: CarChoice) => void }) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showTransport, setShowTransport] = useState(false);
  const [bookedChoice, setBookedChoice] = useState<CarChoice | null>(null);
  const [itineraryOpen, setItineraryOpen] = useState(false);

  const selectedCar = useMemo(() => bookedChoice ? carOptions[bookedChoice] : null, [bookedChoice]);

  const chooseActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setItineraryOpen(false);
    if (activity.id === "circus") window.setTimeout(() => setShowTransport(true), 300);
  };

  const bookingConfirmed = (choice: CarChoice) => {
    setBookedChoice(choice);
  };

  (globalThis as typeof globalThis & { __confirmWhatsappBooking?: (choice: CarChoice) => void }).__confirmWhatsappBooking = bookingConfirmed;

  return (
    <PhoneShell>
      <div className="flex h-full flex-col bg-[#efeae2]">
        <WhatsAppHeader />
        <div className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-3">
          <div className="pointer-events-none absolute inset-0 opacity-[.22]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #aeb9b1 0 1px, transparent 1.2px), radial-gradient(circle at 70% 75%, #aeb9b1 0 1px, transparent 1.2px)", backgroundSize: "31px 31px, 37px 37px" }} />
          <div className="relative z-10 space-y-2.5">
            <div className="mx-auto w-fit rounded-full bg-[#fff8c5] px-3 py-1 text-[9.5px] text-[#54656f] shadow-sm">Messages are end-to-end encrypted</div>
            <Bubble><p><strong>Heads up — rain is now expected from 11:00</strong>, which overlaps with Tokyo Disneyland.</p><p className="mt-2">I checked the rest of today before changing anything. Your 18:30 yakiniku reservation can stay as-is.</p></Bubble>
            <Bubble><p>I found 3 indoor replacements. I’d take <strong>Miraikan</strong> if you want the least disruption; <strong>Grand Circus Show</strong> is the more memorable option.</p></Bubble>
            <div className="space-y-2">{activities.map(a => <ChoiceCard key={a.id} activity={a} onChoose={() => chooseActivity(a)} />)}</div>

            {selectedActivity && <>
              <Bubble side="out">Replace Disneyland with {selectedActivity.name}</Bubble>
              <Bubble><p><strong>Done.</strong> I replaced Disneyland with {selectedActivity.name} and kept everything else today unchanged.</p>{selectedActivity.id !== "circus" && <p className="mt-2">I’ll keep watching the weather and route timing.</p>}</Bubble>
            </>}

            {selectedActivity?.id === "circus" && showTransport && <>
              <Bubble><p>Tachikawa is about <strong>55 min by car</strong>. With 2 kids and your luggage requirement, I’d solve transport now rather than leave it for later.</p><p className="mt-2">I found the saved Alphard rental plus a private-car option:</p></Bubble>
              <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_1px_rgba(0,0,0,.12)]"><CarOption choice="rental" onChoose={() => onCheckout("rental")} /><CarOption choice="private" onChoose={() => onCheckout("private")} /></div>
            </>}

            {bookedChoice && selectedCar && <>
              <Bubble><p><strong>Booked ✓</strong></p><p className="mt-1">{selectedCar.name} is confirmed for today. I attached pickup details to the Tokyo trip and accounted for the Grand Circus route.</p></Bubble>
              <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_1px_1px_rgba(0,0,0,.12)]"><div className="p-3"><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#667781]">Today · updated</p><div className="mt-2 grid gap-2 text-[11.5px] text-[#111b21]"><div className="flex justify-between"><span>09:00 · Breakfast</span><span className="text-[#667781]">Ginza</span></div><div className="flex justify-between font-semibold"><span>11:00 · Grand Circus Show</span><span className="text-[#008069]">Updated</span></div><div className="flex justify-between"><span>18:30 · Yakiniku dinner</span><span className="text-[#667781]">Confirmed</span></div></div></div><button onClick={() => setItineraryOpen(v => !v)} className="h-10 w-full border-t border-[#e9edef] text-[12px] font-semibold text-[#008069]">{itineraryOpen ? "Hide trip context" : "View updated itinerary"}</button>{itineraryOpen && <div className="border-t border-[#e9edef] bg-[#f7f8fa] p-3 text-[10.5px] leading-relaxed text-[#54656f]">Trip context preserved: 2 adults + 2 kids · family hotel in Ginza · dinner reservation unchanged · weather monitoring stays active.</div>}</div>
            </>}
          </div>
        </div>
        <div className="shrink-0 border-t border-[#dfe3e5] bg-[#f7f8fa] px-2.5 pb-3 pt-2"><div className="flex items-center gap-2"><button className="grid h-9 w-9 place-items-center rounded-full text-[24px] text-[#667781]">+</button><div className="flex h-10 min-w-0 flex-1 items-center rounded-full bg-white px-3 text-[12px] text-[#8696a0]">Message OtterWay</div><button className="grid h-10 w-10 place-items-center rounded-full bg-[#008069] text-white">⌁</button></div></div>
      </div>
    </PhoneShell>
  );
}

export function WhatsAppTripCompanionPrototype() {
  const [stage, setStage] = useState<Stage>("lock");
  const [checkoutChoice, setCheckoutChoice] = useState<CarChoice>("rental");
  const [confirmedChoice, setConfirmedChoice] = useState<CarChoice | null>(null);

  if (stage === "lock") return <LockScreen onOpen={() => setStage("chat")} />;

  if (stage === "checkout") {
    return <Checkout choice={checkoutChoice} onBack={() => setStage("chat")} onConfirm={() => {
      setConfirmedChoice(checkoutChoice);
      (globalThis as typeof globalThis & { __confirmWhatsappBooking?: (choice: CarChoice) => void }).__confirmWhatsappBooking?.(checkoutChoice);
      setStage("chat");
    }} />;
  }

  return <Chat onCheckout={(choice) => { setCheckoutChoice(choice); setStage("checkout"); }} key={confirmedChoice ?? "chat"} />;
}
