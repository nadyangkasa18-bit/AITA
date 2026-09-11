"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Screen =
  | "home"
  | "ideas"
  | "itinerary"
  | "context"
  | "copilot"
  | "updating"
  | "after"
  | "expense"
  | "adjust"
  | "balances"
  | "final";

type IconName =
  | "back"
  | "calendar"
  | "check"
  | "chevron"
  | "cloud"
  | "expenses"
  | "heart"
  | "home"
  | "magic"
  | "people"
  | "plus"
  | "rain"
  | "send"
  | "sparkles"
  | "sun";

const images = {
  tokyo:
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=86",
  teamlab:
    "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=900&q=84",
  ramen:
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=84",
  cafe:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=84",
  disney:
    "https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?auto=format&fit=crop&w=900&q=84",
};

const people = [
  { name: "Nadya", initials: "N", color: "#253a5e" },
  { name: "Sarah", initials: "S", color: "#d97762" },
  { name: "Jess", initials: "J", color: "#7672a8" },
  { name: "Maya", initials: "M", color: "#4f8b78" },
];

const backMap: Partial<Record<Screen, Screen>> = {
  ideas: "home",
  itinerary: "ideas",
  context: "itinerary",
  copilot: "context",
  after: "copilot",
  expense: "after",
  adjust: "expense",
  balances: "adjust",
  final: "balances",
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
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
  if (name === "magic") return <svg {...props}><path d="m15 4 5 5L8 21l-5-5L15 4Z" /><path d="m6 13 5 5M6 3v4M4 5h4M19 14v5M16.5 16.5h5" /></svg>;
  if (name === "people") return <svg {...props}><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20M16 5.5a3 3 0 0 1 0 5.8M17 14a4.5 4.5 0 0 1 3.5 4.4V20" /></svg>;
  if (name === "plus") return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "rain") return <svg {...props}><path d="M6.5 15.5h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.4-1.5 4.8 4.8 0 0 0 0 9.5Z" /><path d="m8 19-1 2M13 19l-1 2M18 19l-1 2" /></svg>;
  if (name === "send") return <svg {...props}><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg>;
  if (name === "sparkles") return <svg {...props}><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15ZM19 13l.7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7L19 13Z" /></svg>;
  return <svg {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
}

function StatusBar() {
  return (
    <div className="relative z-50 flex h-[48px] shrink-0 items-end justify-between px-7 pb-2.5 text-[14px] font-semibold text-[#17213a]">
      <span>9:41</span>
      <div className="flex items-center gap-2">
        <span className="flex items-end gap-[2px]">{[5, 8, 11, 14].map((height) => <i key={height} className="block w-[3px] rounded-full bg-current" style={{ height }} />)}</span>
        <span className="text-[16px]">⌁</span>
        <span className="h-[14px] w-7 rounded-[4px] border border-current p-[2px]"><span className="block h-full w-[82%] rounded-[2px] bg-current" /></span>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rr-stage flex min-h-dvh items-center justify-center bg-[#e8e7e3] p-0 sm:p-5">
      <div className="rr-phone relative w-full overflow-hidden bg-[#f7f6f2] sm:border-[9px] sm:border-[#151515] sm:shadow-[0_36px_90px_-32px_rgba(23,33,58,.5)]">
        <div className="pointer-events-none absolute left-1/2 top-[11px] z-[100] hidden h-[27px] w-[96px] -translate-x-1/2 rounded-full bg-black sm:block" />
        {children}
      </div>
    </div>
  );
}

function AvatarStack({ small = false }: { small?: boolean }) {
  const dimension = small ? "h-7 w-7 text-[9px]" : "h-9 w-9 text-[11px]";
  return (
    <div className="flex items-center pl-2">
      {people.map((person) => (
        <span
          key={person.name}
          className={`-ml-2 grid ${dimension} place-items-center rounded-full border-2 border-white font-semibold text-white shadow-sm`}
          style={{ backgroundColor: person.color }}
          title={person.name}
        >
          {person.initials}
        </span>
      ))}
    </div>
  );
}

function AppHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <>
      <StatusBar />
      <header className="flex h-[64px] shrink-0 items-center gap-3 border-b border-[#e9e6df] bg-[#fbfaf7]/95 px-4 backdrop-blur-xl">
        {onBack ? (
          <button onClick={onBack} aria-label="Go back" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e6e2d8] bg-white text-[#253a5e] active:scale-95">
            <Icon name="back" size={19} />
          </button>
        ) : (
          <Image src="/roaminrabbit-logo.png" alt="RoaminRabbit" width={40} height={40} className="h-10 w-10 rounded-full border border-[#e7e4dc] bg-white object-contain p-1" priority />
        )}
        <div className="min-w-0 flex-1">
          {subtitle && <p className="truncate text-[9px] font-bold uppercase tracking-[.12em] text-[#9a968d]">{subtitle}</p>}
          <h1 className="truncate text-[18px] font-semibold tracking-[-.025em] text-[#17213a]">{title}</h1>
        </div>
        <AvatarStack small />
      </header>
    </>
  );
}

function BottomNav({ active, onNavigate }: { active: "trip" | "copilot" | "expenses"; onNavigate: (screen: Screen) => void }) {
  const item = (id: typeof active, label: string, icon: IconName, target: Screen) => (
    <button onClick={() => onNavigate(target)} className={`flex min-w-[72px] flex-col items-center gap-1 text-[10px] font-semibold ${active === id ? "text-[#253a5e]" : "text-[#aaa59c]"}`}>
      <span className={`grid h-8 w-12 place-items-center rounded-full ${active === id ? "bg-[#e9edf5]" : ""}`}><Icon name={icon} size={17} /></span>
      {label}
    </button>
  );

  return (
    <nav className="flex h-[74px] shrink-0 items-start justify-around border-t border-[#e9e6df] bg-[#fbfaf7]/95 px-5 pt-2 backdrop-blur-xl">
      {item("trip", "Trip", "home", "home")}
      {item("copilot", "Co-pilot", "sparkles", "copilot")}
      {item("expenses", "Expenses", "expenses", "expense")}
    </nav>
  );
}

function PrimaryButton({ children, onClick, light = false, disabled = false }: { children: React.ReactNode; onClick: () => void; light?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold transition active:scale-[.985] disabled:opacity-50 ${light ? "bg-white text-[#253a5e]" : "bg-[#253a5e] text-white shadow-[0_10px_26px_-14px_rgba(37,58,94,.8)]"}`}
    >
      {children}
    </button>
  );
}

function TypingBubble({ label = "RoaminRabbit is thinking" }: { label?: string }) {
  return (
    <div className="rr-enter flex items-center gap-2.5">
      <Image src="/roaminrabbit-logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full border border-[#e8e4dc] bg-white object-contain p-1" />
      <div className="rounded-[18px] rounded-bl-[6px] border border-[#e7e3da] bg-white px-4 py-3 shadow-sm">
        <span className="sr-only">{label}</span>
        <div className="flex h-3 items-center gap-1.5">{[0, 1, 2].map((index) => <i key={index} className="rr-typing h-1.5 w-1.5 rounded-full bg-[#7f8ba2]" style={{ animationDelay: `${index * 140}ms` }} />)}</div>
      </div>
    </div>
  );
}

function TripHome({ onOpen, onNavigate }: { onOpen: () => void; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="RoaminRabbit" subtitle="Your trips" />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#a09b92]">Next adventure</p>
            <h2 className="mt-1 text-[29px] font-semibold tracking-[-.045em] text-[#17213a]">Where to next?</h2>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-[#253a5e] text-white"><Icon name="plus" size={18} /></button>
        </div>

        <button onClick={onOpen} className="mt-5 w-full overflow-hidden rounded-[26px] bg-[#17213a] text-left text-white shadow-[0_24px_50px_-28px_rgba(23,33,58,.8)] active:scale-[.992]">
          <div className="relative h-[224px] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg,rgba(10,17,32,.02),rgba(10,17,32,.78)),url(${images.tokyo})` }}>
            <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#253a5e]">Shared trip</span>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[12px] font-medium text-white/68">2–8 September · Tokyo</p>
                  <h3 className="mt-1 text-[25px] font-semibold tracking-[-.035em]">Tokyo with the girls</h3>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur"><Icon name="chevron" /></span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3"><AvatarStack /><span className="text-[12px] text-white/70">4 planning together</span></div>
            <span className="rounded-full bg-[#cbe9df] px-2.5 py-1 text-[10px] font-bold text-[#285847]">12 ideas</span>
          </div>
        </button>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-[#e7e3da] bg-white p-4"><span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#f5ebe4] text-[#c56f58]"><Icon name="heart" size={17} /></span><p className="mt-3 text-[21px] font-semibold tracking-[-.03em] text-[#17213a]">12</p><p className="text-[11px] text-[#817d75]">shared ideas</p></div>
          <div className="rounded-[20px] border border-[#e7e3da] bg-white p-4"><span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#e9edf5] text-[#253a5e]"><Icon name="calendar" size={17} /></span><p className="mt-3 text-[21px] font-semibold tracking-[-.03em] text-[#17213a]">6 days</p><p className="text-[11px] text-[#817d75]">one shared plan</p></div>
        </div>
      </div>
      <BottomNav active="trip" onNavigate={onNavigate} />
    </div>
  );
}

function IdeaCard({ image, title, category, contributor, votes, selected, onVote }: { image: string; title: string; category: string; contributor: number; votes: number; selected: boolean; onVote: () => void }) {
  return (
    <article className="overflow-hidden rounded-[21px] border border-[#e7e3da] bg-white shadow-[0_12px_30px_-24px_rgba(23,33,58,.55)]">
      <div className="relative h-[126px] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg,transparent,rgba(12,18,30,.28)),url(${image})` }}>
        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#625e57]">{category}</span>
        <span className="absolute bottom-3 left-3 grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[9px] font-bold text-white" style={{ backgroundColor: people[contributor].color }}>{people[contributor].initials}</span>
      </div>
      <div className="flex items-center gap-2 p-3.5">
        <div className="min-w-0 flex-1"><h3 className="truncate text-[14px] font-semibold text-[#17213a]">{title}</h3><p className="mt-0.5 text-[10px] text-[#8a867e]">Saved by {people[contributor].name}</p></div>
        <button onClick={onVote} className={`flex h-9 items-center gap-1 rounded-full px-3 text-[11px] font-semibold transition ${selected ? "bg-[#253a5e] text-white" : "bg-[#f2f0eb] text-[#625e57]"}`}><Icon name="heart" size={13} /> {selected ? votes + 1 : votes}</button>
      </div>
    </article>
  );
}

function IdeasScreen({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [voted, setVoted] = useState(false);
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Tokyo with the girls" subtitle="Ideas board" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <div className="rounded-[19px] bg-[#eaf1ed] p-4">
          <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#4f8b78]"><Icon name="plus" size={16} /></span><div><p className="text-[12px] font-semibold text-[#315b4e]">Maya just saved teamLab Planets</p><p className="mt-0.5 text-[10px] text-[#648277]">Everyone can add, vote and decide together.</p></div></div>
        </div>

        <div className="mt-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#a09b92]">Group shortlist</p><h2 className="mt-1 text-[23px] font-semibold tracking-[-.035em] text-[#17213a]">What should make the trip?</h2></div><AvatarStack small /></div>
        <div className="mt-4 grid gap-3">
          <IdeaCard image={images.teamlab} title="teamLab Planets" category="Art + design" contributor={3} votes={3} selected={voted} onVote={() => setVoted((value) => !value)} />
          <IdeaCard image={images.ramen} title="Ramen Kagari" category="Local food" contributor={1} votes={2} selected={false} onVote={() => undefined} />
          <IdeaCard image={images.cafe} title="Koffee Mameya" category="Slow morning" contributor={2} votes={2} selected={false} onVote={() => undefined} />
        </div>
      </div>
      <div className="shrink-0 border-t border-[#e9e6df] bg-[#fbfaf7] px-4 pb-4 pt-3"><PrimaryButton onClick={onNext}>Turn the shortlist into a plan <Icon name="chevron" size={16} /></PrimaryButton></div>
    </div>
  );
}

function EventCard({ time, title, subtitle, image, rain, updated, peopleText }: { time: string; title: string; subtitle: string; image: string; rain?: boolean; updated?: boolean; peopleText?: string }) {
  return (
    <div className="grid grid-cols-[42px_1fr] gap-2.5">
      <p className="pt-4 text-[10px] font-semibold text-[#99948b]">{time}</p>
      <article className={`overflow-hidden rounded-[18px] border bg-white ${rain ? "border-[#d8b883]" : updated ? "border-[#a8c8bb]" : "border-[#e7e3da]"}`}>
        <div className="grid min-h-[104px] grid-cols-[1fr_94px]">
          <div className="p-3.5"><div className="flex items-center gap-1.5"><p className="text-[9px] font-bold uppercase tracking-[.09em] text-[#a09b92]">{updated ? "Updated plan" : "Activity"}</p>{updated && <span className="grid h-4 w-4 place-items-center rounded-full bg-[#dcece5] text-[#3d705f]"><Icon name="check" size={9} /></span>}</div><h3 className="mt-1.5 text-[15px] font-semibold leading-tight text-[#17213a]">{title}</h3><p className="mt-1 text-[10px] leading-relaxed text-[#7e7a72]">{subtitle}</p>{peopleText && <p className="mt-2 text-[9px] font-semibold text-[#596a86]">{peopleText}</p>}</div>
          <div className="relative bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}>{rain && <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/94 text-[#537594] shadow"><Icon name="rain" size={16} /></span>}</div>
        </div>
      </article>
    </div>
  );
}

function DayTabs({ active = "thu" }: { active?: "thu" | "fri" }) {
  return <div className="grid grid-cols-3 gap-2">{[["WED", "2"], ["THU", "3"], ["FRI", "4"]].map(([day, date]) => { const isActive = (active === "thu" && day === "THU") || (active === "fri" && day === "FRI"); return <div key={day} className={`rounded-[13px] border px-3 py-2 text-center ${isActive ? "border-[#253a5e] bg-[#253a5e] text-white" : "border-[#e7e3da] bg-white text-[#817d75]"}`}><p className="text-[8px] font-bold tracking-[.1em] opacity-70">{day}</p><p className="mt-0.5 text-[16px] font-semibold leading-none">{date}</p></div>; })}</div>;
}

function ItineraryBefore({ onBack, onContext, onCopilot }: { onBack: () => void; onContext: () => void; onCopilot: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="One shared plan" subtitle="Tokyo · 2–8 Sep" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#a09b92]">Thursday</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.04em] text-[#17213a]">Tokyo itinerary</h2></div><button onClick={onContext} className="rounded-full border border-[#ddd8ce] bg-white px-3 py-2 text-[10px] font-semibold text-[#596a86]">Trip context</button></div>
        <div className="mt-4"><DayTabs /></div>
        <div className="mt-4 rounded-[18px] border border-[#cbd9e4] bg-[#eef4f8] p-3.5">
          <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-white text-[#537594]"><Icon name="rain" size={18} /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#72889a]">Plan needs attention</p><p className="mt-1 text-[13px] font-semibold text-[#334e67]">Rain is expected during Disneyland</p><p className="mt-0.5 text-[10px] leading-relaxed text-[#668096]">Thursday, 11:00–17:00 · 80% chance</p></div></div>
          <button onClick={onCopilot} className="mt-3 h-10 w-full rounded-full bg-white text-[11px] font-semibold text-[#3e607c] shadow-sm">Ask RoaminRabbit what to do</button>
        </div>
        <div className="mt-4 space-y-3">
          <EventCard time="09:30" title="Slow breakfast in Ginza" subtitle="Koffee Mameya · saved by Jess" image={images.cafe} peopleText="Approved by all 4" />
          <EventCard time="11:00" title="Tokyo Disneyland" subtitle="Maihama · tickets saved" image={images.disney} rain peopleText="Chosen together" />
          <EventCard time="19:00" title="Ramen Kagari" subtitle="Ginza · table for four" image={images.ramen} peopleText="3 votes" />
        </div>
      </div>
    </div>
  );
}

function ContextScreen({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#f1f3f7]">
      <AppHeader title="Your trip co-pilot" subtitle="Personalized context" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-7">
        <div className="text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-white shadow-[0_14px_30px_-20px_rgba(23,33,58,.5)]"><Image src="/roaminrabbit-logo.png" alt="RoaminRabbit" width={48} height={48} className="h-12 w-12 object-contain" /></div><h2 className="mt-4 text-[25px] font-semibold tracking-[-.04em] text-[#17213a]">It knows this trip,<br />not just Tokyo.</h2><p className="mx-auto mt-2 max-w-[290px] text-[12px] leading-relaxed text-[#737986]">RoaminRabbit combines what your group saved, decided and shared—with the preferences you choose to connect.</p></div>
        <div className="mt-7 flex items-center justify-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-[15px] bg-[#d97757] text-[11px] font-bold text-white">AI</span><span className="h-px w-10 bg-[#bfc6d2]" /><span className="grid h-12 w-12 place-items-center rounded-[15px] bg-white"><Image src="/roaminrabbit-logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" /></span><span className="h-px w-10 bg-[#bfc6d2]" /><span className="grid h-12 w-12 place-items-center rounded-[15px] bg-[#253a5e] text-white"><Icon name="people" size={20} /></span></div>
        <div className="mt-7 rounded-[23px] border border-white bg-white/75 p-4 shadow-[0_16px_40px_-30px_rgba(23,33,58,.55)] backdrop-blur">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.11em] text-[#9a968d]">Connected preference source</p><p className="mt-1 text-[14px] font-semibold text-[#17213a]">Claude</p></div><span className="rounded-full bg-[#dcece5] px-2.5 py-1 text-[9px] font-bold text-[#3c705e]">Connected</span></div>
          <div className="mt-4 flex flex-wrap gap-2">{["Loves local food", "Art & design", "Slow mornings"].map((label) => <span key={label} className="rounded-full border border-[#e5e0d7] bg-white px-3 py-2 text-[10px] font-semibold text-[#596a86]">{label}</span>)}</div>
          <div className="mt-4 border-t border-[#e9e6df] pt-3 text-[10px] leading-relaxed text-[#89857d]">Only the preferences you choose are used for this trip.</div>
        </div>
      </div>
      <div className="shrink-0 px-4 pb-4"><PrimaryButton onClick={onNext}>Let’s fix the rainy day <Icon name="sparkles" size={16} /></PrimaryButton></div>
    </div>
  );
}

function CopilotScreen({ onBack, onAccept }: { onBack: () => void; onAccept: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 1250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="RoaminRabbit co-pilot" subtitle="Tokyo with the girls" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <div className="rounded-[19px] border border-[#cbd9e4] bg-[#eef4f8] p-3.5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-[12px] bg-white text-[#537594]"><Icon name="rain" size={17} /></span><div><p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#72889a]">What changed</p><p className="mt-1 text-[13px] font-semibold text-[#334e67]">Disneyland tomorrow · rain from 11 AM</p></div></div></div>
        <div className="mt-5 flex justify-end"><div className="max-w-[82%] rounded-[19px] rounded-br-[6px] bg-[#253a5e] px-4 py-3 text-[12px] leading-relaxed text-white">Disneyland tomorrow and now it’s raining? What should we do?</div></div>
        <div className="mt-4">{!ready ? <TypingBubble /> : <div className="rr-enter flex items-start gap-2.5"><Image src="/roaminrabbit-logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full border border-[#e8e4dc] bg-white object-contain p-1" /><div className="max-w-[86%] rounded-[19px] rounded-bl-[6px] border border-[#e7e3da] bg-white p-4 text-[#28334a] shadow-sm"><p className="text-[12px] leading-[1.55]">Okay, maybe not. <strong>Friday looks dry and sunny.</strong> How about <strong>teamLab + ramen tomorrow</strong>, and Disneyland Friday?</p><div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded-full bg-[#eef1f6] px-2.5 py-1 text-[9px] font-semibold text-[#596a86]">Keeps your saved picks</span><span className="rounded-full bg-[#eef1f6] px-2.5 py-1 text-[9px] font-semibold text-[#596a86]">No booking conflict</span></div></div></div>}</div>
        {ready && <div className="rr-enter mt-5 rounded-[22px] border border-[#e7e3da] bg-[#fbfaf7] p-4"><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center"><div><span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#edf4f8] text-[#537594]"><Icon name="rain" size={16} /></span><p className="mt-2 text-[9px] font-bold text-[#99948b]">THURSDAY</p><p className="mt-1 text-[11px] font-semibold text-[#17213a]">teamLab + ramen</p></div><Icon name="chevron" size={17} /><div><span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#fff1ce] text-[#c28c31]"><Icon name="sun" size={16} /></span><p className="mt-2 text-[9px] font-bold text-[#99948b]">FRIDAY</p><p className="mt-1 text-[11px] font-semibold text-[#17213a]">Disneyland</p></div></div></div>}
      </div>
      {ready && <div className="rr-enter shrink-0 border-t border-[#e9e6df] bg-[#fbfaf7] px-4 pb-4 pt-3"><PrimaryButton onClick={onAccept}>Yes please — update my trip <Icon name="magic" size={16} /></PrimaryButton></div>}
    </div>
  );
}

function UpdatingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1550);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#253a5e] px-8 text-center text-white">
      <div className="relative"><span className="rr-pulse absolute inset-0 rounded-full bg-white/20" /><span className="relative grid h-20 w-20 place-items-center rounded-full bg-white"><Image src="/roaminrabbit-logo.png" alt="" width={56} height={56} className="h-14 w-14 object-contain" /></span></div>
      <h2 className="mt-6 text-[24px] font-semibold tracking-[-.035em]">Updating your shared trip</h2>
      <p className="mt-2 text-[12px] leading-relaxed text-white/65">Moving two activities and checking the group’s saved bookings…</p>
      <div className="mt-7 w-full max-w-[260px] space-y-2 text-left">{["Thursday · teamLab + ramen", "Friday · Tokyo Disneyland"].map((label, index) => <div key={label} className="rr-check-in flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-3 text-[10px] font-medium" style={{ animationDelay: `${index * 320}ms` }}><span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[#253a5e]"><Icon name="check" size={11} /></span>{label}</div>)}</div>
    </div>
  );
}

function ItineraryAfter({ onBack, onExpense }: { onBack: () => void; onExpense: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Trip updated" subtitle="Everyone sees the change" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <div className="rounded-[18px] border border-[#b8d1c6] bg-[#e9f3ee] p-3.5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#3d705f]"><Icon name="check" size={17} /></span><div><p className="text-[13px] font-semibold text-[#315b4e]">Your group plan is updated</p><p className="mt-0.5 text-[10px] text-[#648277]">No saved booking was lost.</p></div></div></div>
        <div className="mt-5"><div className="mb-2 flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#a09b92]">Thursday · Rain</p><h2 className="mt-1 text-[20px] font-semibold tracking-[-.035em] text-[#17213a]">Indoor day</h2></div><span className="rounded-full bg-[#edf4f8] px-2.5 py-1 text-[9px] font-bold text-[#537594]">Updated</span></div><EventCard time="11:00" title="teamLab Planets" subtitle="Toyosu · 2 hrs" image={images.teamlab} updated peopleText="From the group shortlist" /><div className="mt-3"><EventCard time="18:30" title="Ramen Kagari" subtitle="Ginza · table for four" image={images.ramen} updated /></div></div>
        <div className="my-5 h-px bg-[#e7e3da]" />
        <div><div className="mb-2 flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#a09b92]">Friday · Sunny</p><h2 className="mt-1 text-[20px] font-semibold tracking-[-.035em] text-[#17213a]">Disneyland day</h2></div><span className="grid h-8 w-8 place-items-center rounded-full bg-[#fff1ce] text-[#c28c31]"><Icon name="sun" size={16} /></span></div><EventCard time="09:00" title="Tokyo Disneyland" subtitle="Maihama · tickets saved" image={images.disney} updated peopleText="Moved from Thursday" /></div>
      </div>
      <div className="shrink-0 border-t border-[#e9e6df] bg-[#fbfaf7] px-4 pb-4 pt-3"><PrimaryButton onClick={onExpense}>Next: split last night’s dinner <Icon name="chevron" size={16} /></PrimaryButton></div>
    </div>
  );
}

function ExpenseScreen({ onBack, onAdjust }: { onBack: () => void; onAdjust: () => void }) {
  const items = [["Ramen", "¥8,400", "All 4"], ["Gyoza", "¥2,400", "All 4"], ["Pizza", "¥3,600", "3 people"], ["Drinks", "¥4,200", "3 people"]];
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Dinner at Ramen Kagari" subtitle="Expense split" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <section className="rounded-[24px] bg-[#253a5e] p-5 text-white shadow-[0_20px_40px_-26px_rgba(37,58,94,.8)]"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/55">Dinner total</p><p className="mt-2 text-[32px] font-semibold tracking-[-.045em]">¥18,600</p></div><span className="grid h-11 w-11 place-items-center rounded-[14px] bg-white/12"><Icon name="expenses" size={20} /></span></div><div className="mt-5 flex items-center justify-between border-t border-white/12 pt-4"><div><p className="text-[9px] uppercase tracking-[.1em] text-white/45">Paid by</p><p className="mt-1 text-[12px] font-semibold">Sarah</p></div><AvatarStack small /></div></section>
        <section className="mt-4 rounded-[22px] border border-[#e7e3da] bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-[14px] font-semibold text-[#17213a]">Bill items</h2><span className="text-[10px] text-[#99948b]">4 travelers</span></div><div className="mt-3 divide-y divide-[#eeeae2]">{items.map(([label, amount, who]) => <div key={label} className="flex items-center gap-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#f2f0eb] text-[11px]">{label === "Drinks" ? "🍹" : label === "Pizza" ? "🍕" : "🍜"}</span><div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-[#28334a]">{label}</p><p className="mt-0.5 text-[9px] text-[#99948b]">{who}</p></div><p className="text-[12px] font-semibold text-[#28334a]">{amount}</p></div>)}</div></section>
        <section className="mt-4 rounded-[20px] border border-[#e7e3da] bg-[#fbfaf7] p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#9a968d]">First pass</p><p className="mt-1 text-[13px] font-semibold text-[#17213a]">Equal split</p></div><p className="text-[19px] font-semibold text-[#17213a]">¥4,650 <span className="text-[9px] font-medium text-[#99948b]">each</span></p></div><p className="mt-3 text-[10px] leading-relaxed text-[#817d75]">RoaminRabbit can adjust this based on what each person actually had.</p></section>
      </div>
      <div className="shrink-0 border-t border-[#e9e6df] bg-[#fbfaf7] px-4 pb-4 pt-3"><PrimaryButton onClick={onAdjust}>Tell RoaminRabbit what I had <Icon name="sparkles" size={16} /></PrimaryButton></div>
    </div>
  );
}

function AdjustSplitScreen({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Make the split fair" subtitle="Ramen Kagari · ¥18,600" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-5">
        <div className="flex justify-end"><div className="max-w-[82%] rounded-[19px] rounded-br-[6px] bg-[#253a5e] px-4 py-3 text-[12px] leading-relaxed text-white">I didn’t have pizza or drinks.</div></div>
        <div className="mt-4">{!ready ? <TypingBubble label="Recalculating the split" /> : <div className="rr-enter flex items-start gap-2.5"><Image src="/roaminrabbit-logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full border border-[#e8e4dc] bg-white object-contain p-1" /><div className="max-w-[86%] rounded-[19px] rounded-bl-[6px] border border-[#e7e3da] bg-white p-4 text-[#28334a] shadow-sm"><p className="text-[12px] leading-relaxed">Got it. I’ll leave those out of your split and update everyone automatically.</p></div></div>}</div>
        {ready && <div className="rr-enter mt-5 space-y-3"><section className="rounded-[23px] border border-[#b8d1c6] bg-[#eef6f2] p-4"><div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.11em] text-[#648277]">Your updated share</p><p className="mt-1 text-[25px] font-semibold tracking-[-.04em] text-[#315b4e]">¥2,700</p></div><span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#3d705f]"><Icon name="check" size={20} /></span></div><p className="mt-3 text-[10px] text-[#648277]">¥1,950 less than the equal split</p></section><section className="rounded-[21px] border border-[#e7e3da] bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#9a968d]">Included for Nadya</p><div className="mt-3 space-y-2">{[["Ramen", "¥2,100", true], ["Gyoza", "¥600", true], ["Pizza", "Excluded", false], ["Drinks", "Excluded", false]].map(([label, value, included]) => <div key={String(label)} className="flex items-center gap-2 text-[11px]"><span className={`grid h-5 w-5 place-items-center rounded-full ${included ? "bg-[#dcece5] text-[#3d705f]" : "bg-[#f2f0eb] text-[#aaa59c]"}`}>{included ? <Icon name="check" size={10} /> : "–"}</span><span className="flex-1 font-medium text-[#4d5668]">{label}</span><span className={included ? "font-semibold text-[#28334a]" : "text-[#99948b]"}>{value}</span></div>)}</div></section></div>}
      </div>
      {ready && <div className="rr-enter shrink-0 border-t border-[#e9e6df] bg-[#fbfaf7] px-4 pb-4 pt-3"><PrimaryButton onClick={onNext}>Update everyone’s balances <Icon name="chevron" size={16} /></PrimaryButton></div>}
    </div>
  );
}

function BalancesScreen({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const [settled, setSettled] = useState(false);
  const balances = [["Nadya", "owes", "¥2,700", 0], ["Jess", "owes", "¥5,300", 2], ["Maya", "owes", "¥5,300", 3]] as const;
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Group balances" subtitle="Tokyo with the girls" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-5">
        <section className="rounded-[24px] border border-[#b8d1c6] bg-[#e9f3ee] p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#648277]">Sarah is owed</p><p className="mt-2 text-[31px] font-semibold tracking-[-.045em] text-[#315b4e]">¥13,300</p></div><span className="grid h-12 w-12 place-items-center rounded-full border-2 border-white font-bold text-white" style={{ backgroundColor: people[1].color }}>S</span></div><p className="mt-4 border-t border-[#cce0d7] pt-3 text-[10px] leading-relaxed text-[#648277]">Dinner is split by what each person actually consumed.</p></section>
        <div className="mt-5 flex items-center justify-between"><h2 className="text-[15px] font-semibold text-[#17213a]">Who pays Sarah</h2><span className="text-[10px] text-[#99948b]">3 transfers</span></div>
        <div className="mt-3 space-y-2.5">{balances.map(([name, status, amount, index]) => <div key={name} className="flex items-center gap-3 rounded-[18px] border border-[#e7e3da] bg-white p-3.5"><span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-sm" style={{ backgroundColor: people[index].color }}>{people[index].initials}</span><div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-[#28334a]">{name}</p><p className="mt-0.5 text-[9px] text-[#99948b]">{settled ? "settled up" : status}</p></div><p className={`text-[13px] font-semibold ${settled ? "text-[#4f8b78]" : "text-[#28334a]"}`}>{settled ? "Settled ✓" : amount}</p></div>)}</div>
        <button onClick={() => setSettled(true)} disabled={settled} className={`mt-5 h-11 w-full rounded-full border text-[12px] font-semibold transition ${settled ? "border-[#b8d1c6] bg-[#e9f3ee] text-[#3d705f]" : "border-[#dcd7cc] bg-white text-[#596a86]"}`}>{settled ? "Everyone is settled" : "Mark all as settled"}</button>
      </div>
      <div className="shrink-0 border-t border-[#e9e6df] bg-[#fbfaf7] px-4 pb-4 pt-3"><PrimaryButton onClick={onFinish}>{settled ? "Finish trip story" : "Everything is clear"} <Icon name="chevron" size={16} /></PrimaryButton></div>
    </div>
  );
}

function FinalScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#253a5e] px-7 text-white">
      <StatusBar />
      <div className="absolute -right-24 top-28 h-72 w-72 rounded-full bg-[#4f8b78]/22 blur-2xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#d97762]/16 blur-2xl" />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center"><div className="grid h-24 w-24 place-items-center rounded-[30px] bg-white shadow-[0_24px_60px_-28px_rgba(0,0,0,.65)]"><Image src="/roaminrabbit-logo.png" alt="RoaminRabbit" width={80} height={80} className="h-20 w-20 object-contain" /></div><p className="mt-5 text-[11px] font-bold uppercase tracking-[.18em] text-white/48">RoaminRabbit</p><h1 className="mt-3 text-[31px] font-semibold leading-[1.06] tracking-[-.05em]">Your co-pilot for<br />the whole trip.</h1><p className="mx-auto mt-4 max-w-[290px] text-[12px] leading-relaxed text-white/62">One shared place to plan together, adapt when real life changes, and split expenses fairly as the trip happens.</p><div className="mt-7 grid w-full grid-cols-3 gap-2">{[["people", "Plan", "together"], ["sparkles", "Adapt", "together"], ["expenses", "Split", "together"]].map(([icon, lead, tail]) => <div key={lead} className="rounded-[18px] bg-white/8 px-2 py-4"><span className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white"><Icon name={icon as IconName} size={15} /></span><p className="mt-2 text-[10px] font-semibold">{lead}</p><p className="mt-0.5 text-[8px] text-white/46">{tail}</p></div>)}</div></div>
      <button onClick={onRestart} className="relative z-10 mb-7 h-12 w-full rounded-full bg-white text-[13px] font-semibold text-[#253a5e]">Replay prototype</button>
    </div>
  );
}

export function MobileTripCompanionPrototype() {
  const [screen, setScreen] = useState<Screen>("home");
  const goBack = () => setScreen(backMap[screen] ?? "home");
  const navigate = (target: Screen) => setScreen(target);

  let content: React.ReactNode;
  if (screen === "home") content = <TripHome onOpen={() => setScreen("ideas")} onNavigate={navigate} />;
  else if (screen === "ideas") content = <IdeasScreen onBack={goBack} onNext={() => setScreen("itinerary")} />;
  else if (screen === "itinerary") content = <ItineraryBefore onBack={goBack} onContext={() => setScreen("context")} onCopilot={() => setScreen("context")} />;
  else if (screen === "context") content = <ContextScreen onBack={goBack} onNext={() => setScreen("copilot")} />;
  else if (screen === "copilot") content = <CopilotScreen onBack={goBack} onAccept={() => setScreen("updating")} />;
  else if (screen === "updating") content = <UpdatingScreen onDone={() => setScreen("after")} />;
  else if (screen === "after") content = <ItineraryAfter onBack={goBack} onExpense={() => setScreen("expense")} />;
  else if (screen === "expense") content = <ExpenseScreen onBack={goBack} onAdjust={() => setScreen("adjust")} />;
  else if (screen === "adjust") content = <AdjustSplitScreen onBack={goBack} onNext={() => setScreen("balances")} />;
  else if (screen === "balances") content = <BalancesScreen onBack={goBack} onFinish={() => setScreen("final")} />;
  else content = <FinalScreen onRestart={() => setScreen("home")} />;

  return (
    <PhoneFrame>
      {content}
      <style jsx global>{`
        :root { color-scheme: light; }
        body { overscroll-behavior: none; }
        button { -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .rr-phone {
          height: 100dvh;
          max-height: 852px;
          max-width: 393px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
        }
        .rr-scroll { scrollbar-width: none; }
        .rr-scroll::-webkit-scrollbar { display: none; }
        @keyframes rrEnter { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes rrTyping { 0%, 60%, 100% { opacity: .25; transform: translateY(0); } 30% { opacity: .95; transform: translateY(-2px); } }
        @keyframes rrPulse { 0%, 100% { transform: scale(1); opacity: .18; } 50% { transform: scale(1.42); opacity: 0; } }
        @keyframes rrCheck { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .rr-enter { animation: rrEnter 360ms cubic-bezier(.22, 1, .36, 1) both; }
        .rr-typing { animation: rrTyping 900ms ease-in-out infinite; }
        .rr-pulse { animation: rrPulse 1.5s ease-out infinite; }
        .rr-check-in { animation: rrCheck 480ms ease-out both; }
        @media (max-width: 639px) {
          .rr-stage { background: #f7f6f2; }
          .rr-phone { max-width: none; max-height: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rr-enter, .rr-typing, .rr-pulse, .rr-check-in { animation: none !important; }
        }
      `}</style>
    </PhoneFrame>
  );
}
