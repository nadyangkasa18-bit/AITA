"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AppHeader,
  AssistantBubble,
  Avatar,
  AvatarStack,
  BottomNav,
  BrandMark,
  ChatComposer,
  Icon,
  PrimaryButton,
  SectionTitle,
  TypingBubble,
  UserBubble,
  images,
  people,
  type Screen,
} from "./rr-shared";

const basePlaces = [
  { name: "teamLab Planets", category: "Art", area: "Toyosu", image: images.teamlab, by: 1, votes: 4 },
  { name: "Ramen Kagari", category: "Food", area: "Ginza", image: images.ramen, by: 0, votes: 3 },
  { name: "Koffee Mameya", category: "Coffee", area: "Omotesando", image: images.cafe, by: 2, votes: 4 },
  { name: "Shibuya Sky", category: "Views", area: "Shibuya", image: images.sky, by: 3, votes: 3 },
  { name: "Daikanyama T-Site", category: "Shopping", area: "Daikanyama", image: images.books, by: 2, votes: 2 },
  { name: "Tsukiji Outer Market", category: "Food", area: "Chuo", image: images.market, by: 0, votes: 4 },
  { name: "Omoide Yokocho", category: "Nightlife", area: "Shinjuku", image: images.alley, by: 1, votes: 3 },
  { name: "Tokyo Disneyland", category: "Fun", area: "Maihama", image: images.disney, by: 3, votes: 4 },
] as const;

const addedPlace = { name: "teamLab Borderless", category: "Art", area: "Azabudai Hills", image: images.borderless, by: 0, votes: 1 } as const;

export function TripHome({ onOpen, onNavigate }: { onOpen: () => void; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="RoaminRabbit" eyebrow="Your trips" trailing={false} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-7 pt-6">
        <div className="flex items-end justify-between gap-4">
          <SectionTitle eyebrow="Next adventure" title="Where to next?" />
          <button type="button" className="rr-tap grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0e0e0d] text-white"><Icon name="plus" size={18} /></button>
        </div>

        <button type="button" onClick={onOpen} className="rr-tap mt-6 w-full overflow-hidden rounded-[24px] border border-black/[.08] bg-white text-left shadow-[0_24px_50px_-34px_rgba(14,14,13,.8)]">
          <div className="relative h-[252px] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg,rgba(14,14,13,.02),rgba(14,14,13,.76)),url(${images.tokyo})` }}>
            <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.11em] text-[#0e0e0d] backdrop-blur">Shared trip</span>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-[11px] font-medium text-white/72">2–8 September · Tokyo</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <h3 className="font-display text-[29px] font-semibold leading-[.96] tracking-[-.055em]">Tokyo with<br />the girls</h3>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/16 backdrop-blur"><Icon name="chevron" size={18} /></span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <div className="flex items-center gap-3"><Avatar person={people[0]} /><span className="text-[11px] text-[#5e5b52]">Invite the group to start planning</span></div>
            <span className="rounded-full bg-[#eeecff] px-2.5 py-1 text-[9px] font-bold text-[#5147de]">New trip</span>
          </div>
        </button>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-black/[.08] bg-[#fbfaf6] p-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f7e7e2] text-[#a95340]"><Icon name="heart" size={16} /></span><p className="font-display mt-4 text-[24px] font-semibold tracking-[-.045em] text-[#0e0e0d]">12</p><p className="text-[10px] text-[#837f74]">saved ideas</p></div>
          <div className="rounded-[20px] border border-black/[.08] bg-[#fbfaf6] p-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#eeecff] text-[#5147de]"><Icon name="calendar" size={16} /></span><p className="font-display mt-4 text-[24px] font-semibold tracking-[-.045em] text-[#0e0e0d]">6 days</p><p className="text-[10px] text-[#837f74]">one shared plan</p></div>
        </div>
      </div>
      <BottomNav active="trip" onNavigate={onNavigate} />
    </div>
  );
}

const collaboratorContacts = [
  { person: people[1], handle: "@sarahtravels", note: "Always finds the food spots" },
  { person: people[2], handle: "@jessgoes", note: "Art, coffee and good design" },
  { person: people[3], handle: "@mayamoves", note: "Keeps the plan moving" },
] as const;

export function CollaboratorsScreen({ invitedNames, onBack, onInvite, onContinue, onNavigate }: { invitedNames: string[]; onBack: () => void; onInvite: () => void; onContinue: () => void; onNavigate: (screen: Screen) => void }) {
  const invited = invitedNames.length > 0;
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Trip collaborators" eyebrow="Tokyo with the girls" onBack={onBack} trailing={invited} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-6">
        {invited && (
          <div className="rr-message mb-5 flex items-center gap-3 rounded-[18px] border border-[#cfe3dc] bg-[#e7f1ed] p-3.5 text-[#315f52]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white"><Icon name="check" size={17} /></span>
            <div><p className="text-[13px] font-semibold">{invitedNames.length} {invitedNames.length === 1 ? "invite" : "invites"} sent</p><p className="mt-0.5 text-[11px] opacity-75">Your shared trip is ready for everyone.</p></div>
          </div>
        )}

        <SectionTitle eyebrow={invited ? "Your travel crew" : "Start together"} title={invited ? "The group is taking shape." : "Plan this one together."} detail={invited ? "Everyone can add places, vote on ideas and follow the same itinerary." : "Invite friends so ideas, decisions and updates all live in one shared trip."} />

        <div className="mt-6 overflow-hidden rounded-[22px] border border-black/[.08] bg-white">
          <div className="flex items-center gap-3 border-b border-black/[.07] p-4">
            <Avatar person={people[0]} />
            <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-[#0e0e0d]">Nadya</p><p className="mt-0.5 text-[11px] text-[#837f74]">Trip organizer · You</p></div>
            <span className="rounded-full bg-[#f4f2ec] px-2.5 py-1.5 text-[9px] font-bold text-[#5e5b52]">Owner</span>
          </div>
          {invited ? collaboratorContacts.filter(({ person }) => invitedNames.includes(person.name)).map(({ person }, index) => (
            <div key={person.name} className="rr-list-in flex items-center gap-3 border-b border-black/[.07] p-4 last:border-0" style={{ animationDelay: `${index * 70}ms` }}>
              <Avatar person={person} />
              <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-[#0e0e0d]">{person.name}</p><p className="mt-0.5 text-[11px] text-[#837f74]">Can add places and edit plans</p></div>
              <span className="rounded-full bg-[#eeecff] px-2.5 py-1.5 text-[9px] font-bold text-[#5147de]">Invited</span>
            </div>
          )) : (
            <div className="p-4">
              <div className="flex items-center gap-3 text-[#837f74]"><span className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-black/20 bg-[#f8f7f2]"><Icon name="people" size={16} /></span><p className="text-[12px]">Your collaborators will appear here.</p></div>
              <div className="mt-4"><PrimaryButton onClick={onInvite}><Icon name="plus" size={15} /> Add collaborators</PrimaryButton></div>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-[20px] border border-black/[.08] bg-[#fbfaf6] p-4">
          <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eeecff] text-[#5147de]"><Icon name="people" size={16} /></span><div><p className="text-[13px] font-semibold text-[#0e0e0d]">One trip, built by the group</p><p className="mt-1 text-[11px] leading-[1.5] text-[#5e5b52]">Saved places, votes and itinerary changes stay in sync for everyone.</p></div></div>
        </div>
      </div>
      {invited && <div className="border-t border-black/[.08] bg-[#f4f2ec]/96 px-4 py-3 backdrop-blur"><PrimaryButton onClick={onContinue}>Continue to the shortlist <Icon name="chevron" size={16} /></PrimaryButton></div>}
      <BottomNav active="trip" onNavigate={onNavigate} />
    </div>
  );
}

export function InviteCollaboratorsScreen({ onBack, onSend }: { onBack: () => void; onSend: (selected: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>(collaboratorContacts.map(({ person }) => person.name));
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const visibleContacts = collaboratorContacts.filter(({ person, handle }) => `${person.name} ${handle}`.toLowerCase().includes(query.toLowerCase()));
  const toggleContact = (name: string) => setSelected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Add collaborators" eyebrow="Tokyo with the girls" onBack={onBack} trailing={false} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-5">
        <SectionTitle eyebrow="Invite your people" title="Who’s coming to Tokyo?" detail="Choose friends below or share one private invite link." />

        <label className="mt-5 flex h-12 items-center gap-3 rounded-full border border-black/[.09] bg-white px-4 text-[#837f74]">
          <Icon name="search" size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search friends" className="min-w-0 flex-1 bg-transparent text-[14px] text-[#0e0e0d] outline-none placeholder:text-[#918d83]" />
        </label>

        <div className="mt-4 overflow-hidden rounded-[22px] border border-black/[.08] bg-white">
          {visibleContacts.map(({ person, handle, note }, index) => {
            const isSelected = selected.includes(person.name);
            return (
              <button key={person.name} type="button" onClick={() => toggleContact(person.name)} className="rr-tap rr-list-in flex w-full items-center gap-3 border-b border-black/[.07] p-4 text-left last:border-0" style={{ animationDelay: `${index * 60}ms` }}>
                <Avatar person={person} />
                <div className="min-w-0 flex-1"><div className="flex items-baseline gap-2"><p className="text-[14px] font-semibold text-[#0e0e0d]">{person.name}</p><p className="text-[10px] text-[#837f74]">{handle}</p></div><p className="mt-1 truncate text-[11px] text-[#5e5b52]">{note}</p></div>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${isSelected ? "border-[#0e0e0d] bg-[#0e0e0d] text-white" : "border-black/15 bg-white text-transparent"}`}><Icon name="check" size={14} /></span>
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => setCopied(true)} className="rr-tap mt-4 flex w-full items-center gap-3 rounded-[18px] border border-black/[.08] bg-[#fbfaf6] p-4 text-left">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eeecff] text-[#5147de]"><Icon name={copied ? "check" : "link"} size={17} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold text-[#0e0e0d]">{copied ? "Invite link copied" : "Invite with a link"}</span><span className="mt-0.5 block text-[11px] text-[#837f74]">Send it wherever your group chats.</span></span>
          <Icon name="chevron" size={15} />
        </button>
      </div>
      <div className="border-t border-black/[.08] bg-[#f4f2ec]/96 px-4 py-4 backdrop-blur"><PrimaryButton onClick={() => onSend(selected)} disabled={selected.length === 0}>Send {selected.length} {selected.length === 1 ? "invite" : "invites"} <Icon name="send" size={15} /></PrimaryButton></div>
    </div>
  );
}

export function IdeasScreen({ added, onBack, onAdd, onNext, onNavigate }: { added: boolean; onBack: () => void; onAdd: () => void; onNext: () => void; onNavigate: (screen: Screen) => void }) {
  const [category, setCategory] = useState("All");
  const categories = ["All", "Food", "Art", "Coffee", "Views", "Shopping", "Nightlife", "Fun"];
  const places = useMemo(() => added ? [addedPlace, ...basePlaces] : [...basePlaces], [added]);
  const filtered = category === "All" ? places : places.filter((place) => place.category === category);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Shortlist" eyebrow="Tokyo with the girls" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto pb-5">
        <div className="px-4 pt-5">
          <div className="flex items-end justify-between gap-4">
            <SectionTitle eyebrow={`${places.length} saved places`} title="The group shortlist" detail="Collect the maybes first. The trip can take shape from here." />
            <button type="button" onClick={onAdd} className="rr-tap mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0e0e0d] text-white shadow-[0_12px_24px_-14px_rgba(14,14,13,.65)]"><Icon name="plus" size={18} /></button>
          </div>
          <button type="button" onClick={onAdd} className="rr-tap mt-5 flex h-12 w-full items-center gap-3 rounded-full border border-black/[.09] bg-white px-4 text-left text-[11px] text-[#837f74]"><Icon name="search" size={16} /><span className="flex-1">Paste a link or search a place</span><span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#6257ff]">Add</span></button>
        </div>

        <div className="rr-scroll mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rr-tap shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-semibold ${category === item ? "border-[#0e0e0d] bg-[#0e0e0d] text-white" : "border-black/[.09] bg-[#fbfaf6] text-[#5e5b52]"}`}>{item}</button>)}
        </div>

        <div className="mt-4 space-y-2.5 px-4">
          {filtered.map((place, index) => (
            <article key={place.name} className="rr-list-in flex items-center gap-3 rounded-[18px] border border-black/[.08] bg-white p-2.5 shadow-[0_10px_26px_-25px_rgba(14,14,13,.7)]" style={{ animationDelay: `${index * 45}ms` }}>
              <div className="h-[72px] w-[78px] shrink-0 rounded-[13px] bg-cover bg-center" style={{ backgroundImage: `url(${place.image})` }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><p className="truncate text-[13px] font-semibold tracking-[-.02em] text-[#0e0e0d]">{place.name}</p>{added && place.name === addedPlace.name && <span className="rounded-full bg-[#eeecff] px-2 py-0.5 text-[8px] font-bold uppercase text-[#5147de]">New</span>}</div>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[.09em] text-[#837f74]">{place.category} · {place.area}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><Avatar person={people[place.by]} size="sm" /><span className="text-[9px] text-[#837f74]">{people[place.by].name}</span></div>
                  <span className="flex items-center gap-1 rounded-full bg-[#f4f2ec] px-2 py-1 text-[9px] font-semibold text-[#3c3a33]"><Icon name="heart" size={10} /> {place.votes}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="border-t border-black/[.08] bg-[#f4f2ec]/96 px-4 py-3 backdrop-blur"><PrimaryButton onClick={onNext}>See the shared itinerary <Icon name="chevron" size={16} /></PrimaryButton></div>
      <BottomNav active="trip" onNavigate={onNavigate} />
    </div>
  );
}

export function AddPlaceScreen({ onBack, onAdded }: { onBack: () => void; onAdded: () => void }) {
  const [step, setStep] = useState<"form" | "finding" | "found">("form");
  useEffect(() => {
    if (step !== "finding") return;
    const timer = window.setTimeout(() => setStep("found"), 950);
    return () => window.clearTimeout(timer);
  }, [step]);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Add a place" eyebrow="Shortlist" onBack={onBack} trailing={false} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-6">
        <SectionTitle eyebrow="Save it in seconds" title="Drop the link here." detail="RoaminRabbit pulls out the place, location and the useful bits for everyone." />
        <div className="mt-6 rounded-[22px] border border-black/[.08] bg-white p-4">
          <label className="text-[9px] font-bold uppercase tracking-[.12em] text-[#837f74]">Link to a place</label>
          <div className="mt-2.5 flex items-center gap-2 rounded-[14px] bg-[#f4f2ec] px-3 py-3"><Icon name="link" size={15} /><p className="min-w-0 flex-1 truncate text-[11px] text-[#3c3a33]">instagram.com/reel/tokyo-art</p><span className="rounded-full bg-white px-2 py-1 text-[8px] font-bold uppercase text-[#6257ff]">Pasted</span></div>
          <div className="mt-3"><PrimaryButton onClick={() => setStep("finding")} disabled={step !== "form"}>{step === "finding" ? "Finding the place…" : "Find this place"}{step === "form" && <Icon name="sparkles" size={15} />}</PrimaryButton></div>
        </div>

        {step === "finding" && <div className="rr-message mt-5 overflow-hidden rounded-[22px] border border-black/[.08] bg-white p-3"><div className="rr-shimmer h-[174px] rounded-[16px] bg-[#eae7de]" /><div className="rr-shimmer mt-3 h-4 w-2/3 rounded-full bg-[#eae7de]" /><div className="rr-shimmer mt-2 h-3 w-1/3 rounded-full bg-[#eae7de]" /></div>}

        {step === "found" && (
          <div className="rr-message mt-5 overflow-hidden rounded-[22px] border border-black/[.08] bg-white p-3 shadow-[0_18px_40px_-32px_rgba(14,14,13,.8)]">
            <div className="relative h-[184px] rounded-[16px] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg,transparent,rgba(14,14,13,.56)),url(${images.borderless})` }}><span className="absolute bottom-3 left-3 rounded-full bg-white/92 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] text-[#5147de]">Place found</span></div>
            <div className="px-1 pb-1 pt-4"><h3 className="font-display text-[24px] font-semibold tracking-[-.045em] text-[#0e0e0d]">teamLab Borderless</h3><p className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#837f74]">Art · Azabudai Hills</p><p className="mt-3 text-[11px] leading-[1.55] text-[#5e5b52]">An immersive digital-art museum that connects perfectly with the group’s art shortlist.</p><div className="mt-4"><PrimaryButton onClick={onAdded}><Icon name="plus" size={15} /> Add to shortlist</PrimaryButton></div></div>
          </div>
        )}
      </div>
    </div>
  );
}

const itineraryItems = [
  { time: "09:30", title: "Koffee Mameya", meta: "Omotesando · coffee", image: images.cafe },
  { time: "12:00", title: "Tokyo Disneyland", meta: "Maihama · outdoor", image: images.disney },
  { time: "19:00", title: "Ramen Kagari", meta: "Ginza · dinner", image: images.ramen },
];

export function ItineraryScreen({ onBack, onAsk, onNavigate }: { onBack: () => void; onAsk: () => void; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Tuesday, 3 Sep" eyebrow="Day 2 · Tokyo" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-5">
        <SectionTitle eyebrow="Your itinerary" title="A full Tokyo day." />
        <div className="mt-5 rounded-[22px] border border-[#d9d3ff] bg-[#eeecff] p-4">
          <div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#5147de]"><Icon name="rain" size={19} /></span><div><p className="text-[12px] font-semibold text-[#292450]">Rain starts around noon</p><p className="mt-1 text-[10px] leading-[1.5] text-[#655f82]">Disneyland may feel rushed. Your indoor saves have good alternatives nearby.</p></div></div>
          <button type="button" onClick={onAsk} className="rr-tap mt-3 flex w-full items-center justify-between rounded-full bg-[#0e0e0d] px-4 py-3 text-[12px] font-semibold text-white"><span className="flex items-center gap-2"><Icon name="sparkles" size={14} /> Ask co-pilot to replan</span><Icon name="chevron" size={14} /></button>
        </div>
        <div className="mt-5 space-y-3">
          {itineraryItems.map((item, index) => <div key={item.title} className="rr-list-in flex gap-3" style={{ animationDelay: `${index * 65}ms` }}><div className="w-[43px] pt-2 text-[10px] font-semibold text-[#837f74]">{item.time}</div><div className="flex min-w-0 flex-1 items-center gap-3 rounded-[18px] border border-black/[.08] bg-white p-2.5"><div className="h-16 w-16 shrink-0 rounded-[13px] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} /><div className="min-w-0"><p className="truncate text-[13px] font-semibold text-[#0e0e0d]">{item.title}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#837f74]">{item.meta}</p></div></div></div>)}
        </div>
      </div>
      <BottomNav active="trip" onNavigate={onNavigate} />
    </div>
  );
}

export function ContextScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Your trip context" eyebrow="Before we replan" onBack={onBack} trailing={false} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-7">
        <div className="rounded-[26px] bg-[#0e0e0d] p-5 text-white"><BrandMark size={44} label /><p className="font-display mt-8 text-[28px] font-semibold leading-[1.01] tracking-[-.05em]">A better plan starts with what matters to you.</p><p className="mt-3 text-[11px] leading-[1.6] text-white/62">RoaminRabbit uses only the context you choose to share for this trip.</p></div>
        <div className="mt-4 rounded-[22px] border border-black/[.08] bg-white p-4"><div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.13em] text-[#837f74]">Connected context</p><p className="mt-1 text-[13px] font-semibold text-[#0e0e0d]">Claude preferences</p></div><span className="flex items-center gap-1.5 rounded-full bg-[#e7f1ed] px-2.5 py-1.5 text-[9px] font-bold text-[#356758]"><Icon name="check" size={11} /> Connected</span></div><div className="mt-4 flex flex-wrap gap-2">{["Loves local food", "Art & design", "Slow mornings"].map((chip) => <span key={chip} className="rounded-full border border-black/[.08] bg-[#f4f2ec] px-3 py-2 text-[10px] text-[#3c3a33]">{chip}</span>)}</div></div>
        <div className="mt-4 rounded-[20px] border border-black/[.08] bg-[#fbfaf6] p-4"><p className="text-[11px] font-semibold text-[#0e0e0d]">What the co-pilot will balance</p><div className="mt-3 space-y-2 text-[10px] text-[#5e5b52]">{["Rain forecast and travel time", "Everyone’s saved places", "Your shared preferences"].map((item) => <p key={item} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#eeecff] text-[#5147de]"><Icon name="check" size={11} /></span>{item}</p>)}</div></div>
      </div>
      <div className="border-t border-black/[.08] bg-[#f4f2ec]/96 px-4 py-4"><PrimaryButton onClick={onContinue}>Continue to co-pilot <Icon name="sparkles" size={15} /></PrimaryButton></div>
    </div>
  );
}

export function CopilotScreen({ onBack, onUpdate, onNavigate }: { onBack: () => void; onUpdate: () => void; onNavigate: (screen: Screen) => void }) {
  const [phase, setPhase] = useState<"thinking" | "ready">("thinking");
  const [prompt, setPrompt] = useState("");
  const [manualQuestion, setManualQuestion] = useState("");
  const [manualThinking, setManualThinking] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setPhase("ready"), 1100);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!manualThinking) return;
    const timer = window.setTimeout(() => setManualThinking(false), 850);
    return () => window.clearTimeout(timer);
  }, [manualThinking]);
  const send = () => { if (!prompt.trim()) return; setManualQuestion(prompt.trim()); setPrompt(""); setManualThinking(true); };

  return (
    <div className="flex h-full flex-col bg-[#f4f2ec]">
      <AppHeader title="Trip co-pilot" eyebrow="Tokyo · group plan" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-5">
        <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-black/[.08] bg-white px-3 py-2 text-[9px] font-semibold text-[#5e5b52]"><Icon name="rain" size={13} /> Weather changed · plan needs attention</div>
        <div className="space-y-3">
          <UserBubble>It’s going to rain tomorrow. Can you make the day work better for us?</UserBubble>
          {phase === "thinking" ? <TypingBubble /> : (
            <>
              <AssistantBubble><p className="font-semibold text-[#0e0e0d]">I found a calmer rainy-day plan.</p><p className="mt-1.5">Move Disneyland to Friday, put teamLab Planets after coffee, and keep Ramen Kagari for dinner.</p><div className="mt-3 rounded-[13px] bg-[#eeecff] p-3 text-[10px] text-[#5147de]"><p className="font-bold">Why this works</p><p className="mt-1 leading-[1.45]">Mostly indoors, less backtracking, and it keeps three of the group’s top picks.</p></div></AssistantBubble>
              <div className="rr-message pl-[40px]"><p className="mb-2 text-[9px] font-bold uppercase tracking-[.12em] text-[#837f74]">Places in this plan</p><div className="rr-scroll flex gap-2 overflow-x-auto pb-1">{[
                { name: "teamLab", image: images.teamlab, detail: "12:30 · Toyosu" },
                { name: "Kagari", image: images.ramen, detail: "19:00 · Ginza" },
                { name: "Disneyland", image: images.disney, detail: "Moved to Fri" },
              ].map((place) => <div key={place.name} className="w-[132px] shrink-0 overflow-hidden rounded-[16px] border border-black/[.08] bg-white"><div className="h-[82px] bg-cover bg-center" style={{ backgroundImage: `url(${place.image})` }} /><div className="p-2.5"><p className="truncate text-[10px] font-semibold text-[#0e0e0d]">{place.name}</p><p className="mt-0.5 text-[8px] text-[#837f74]">{place.detail}</p></div></div>)}</div></div>
            </>
          )}
          {manualQuestion && <UserBubble>{manualQuestion}</UserBubble>}
          {manualThinking ? <TypingBubble /> : manualQuestion && <AssistantBubble>I can keep refining this. The current route still has enough breathing room for one more indoor stop.</AssistantBubble>}
        </div>
      </div>
      {phase === "ready" && <div className="px-4 pb-3"><PrimaryButton onClick={onUpdate}><Icon name="sparkles" size={15} /> Yes, update the trip</PrimaryButton></div>}
      <ChatComposer value={prompt} onChange={setPrompt} onSend={send} disabled={manualThinking} placeholder="Ask about this plan…" />
      <BottomNav active="copilot" onNavigate={onNavigate} />
    </div>
  );
}

export function UpdatingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1650);
    return () => window.clearTimeout(timer);
  }, [onDone]);
  return (
    <div className="flex h-full flex-col bg-[#0e0e0d] text-white">
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><div className="relative"><span className="rr-orbit absolute -inset-5 rounded-full border border-white/20" /><BrandMark size={70} /></div><p className="mt-8 text-[9px] font-bold uppercase tracking-[.18em] text-[#9e97ff]">Co-pilot at work</p><h2 className="font-display mt-2 text-[31px] font-semibold leading-[1] tracking-[-.052em]">Updating your shared trip</h2><p className="mt-3 max-w-[280px] text-[11px] leading-[1.6] text-white/58">Moving the outdoor day, checking travel time, and keeping everyone’s top picks.</p><div className="mt-8 h-1.5 w-[220px] overflow-hidden rounded-full bg-white/12"><span className="rr-progress block h-full rounded-full bg-[#756bff]" /></div></div>
    </div>
  );
}

export function ItineraryAfterScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: Screen) => void }) {
  const items = [
    { time: "10:30", title: "Koffee Mameya", meta: "A slower start", image: images.cafe, tone: "" },
    { time: "12:30", title: "teamLab Planets", meta: "Indoor · 16 min away", image: images.teamlab, tone: "New order" },
    { time: "16:00", title: "Ginza wander", meta: "Covered arcades nearby", image: images.sky, tone: "Added" },
    { time: "19:00", title: "Ramen Kagari", meta: "Dinner stays put", image: images.ramen, tone: "" },
  ];
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Tuesday, 3 Sep" eyebrow="Updated plan" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-5">
        <div className="flex items-center gap-3 rounded-[18px] border border-[#cfe3dc] bg-[#e7f1ed] p-3.5 text-[#315f52]"><span className="grid h-9 w-9 place-items-center rounded-full bg-white"><Icon name="check" size={17} /></span><div><p className="text-[11px] font-semibold">The new plan is live</p><p className="mt-0.5 text-[9px] opacity-75">Everyone in the trip can see it now.</p></div></div>
        <div className="mt-5 flex items-end justify-between"><SectionTitle eyebrow="Rain-ready" title="More Tokyo, less rushing." /><span className="rounded-full bg-[#eeecff] px-2.5 py-1 text-[8px] font-bold uppercase text-[#5147de]">Saved</span></div>
        <div className="mt-5 space-y-3">{items.map((item, index) => <div key={item.title} className="rr-list-in flex gap-3" style={{ animationDelay: `${index * 70}ms` }}><div className="w-[43px] pt-2 text-[10px] font-semibold text-[#837f74]">{item.time}</div><div className="flex min-w-0 flex-1 items-center gap-3 rounded-[18px] border border-black/[.08] bg-white p-2.5"><div className="h-[62px] w-[62px] shrink-0 rounded-[13px] bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[12px] font-semibold text-[#0e0e0d]">{item.title}</p>{item.tone && <span className="rounded-full bg-[#eeecff] px-2 py-0.5 text-[7px] font-bold uppercase text-[#5147de]">{item.tone}</span>}</div><p className="mt-1 text-[9px] text-[#837f74]">{item.meta}</p></div></div></div>)}</div>
      </div>
      <BottomNav active="trip" onNavigate={onNavigate} />
    </div>
  );
}
