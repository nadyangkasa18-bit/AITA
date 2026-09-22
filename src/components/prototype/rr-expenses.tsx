"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  AppHeader,
  AssistantBubble,
  Avatar,
  BottomNav,
  ChatComposer,
  Icon,
  PrimaryButton,
  SectionTitle,
  TypingBubble,
  UserBubble,
  people,
  type Screen,
} from "./rr-shared";

const receipts = [
  { merchant: "The Cheesecake Factory", meta: "Today · Haruka paid", amount: "$186.00", status: "Needs review", color: "#b55d48", open: true },
  { merchant: "Uber to Dodger Stadium", meta: "Today · Mei paid", amount: "$38.00", status: "Ready", color: "#47796b", open: false },
  { merchant: "Dodgers tickets", meta: "Yesterday · Aiko paid", amount: "$152.00", status: "Settled", color: "#6257ff", open: false },
  { merchant: "Maru Coffee", meta: "Yesterday · Yui paid", amount: "$48.00", status: "Ready", color: "#816e55", open: false },
  { merchant: "Hotel parking", meta: "13 May · Mei paid", amount: "$100.00", status: "Itemized", color: "#3e6883", open: false },
] as const;

const billItems = [
  { name: "4 × entrées", detail: "Pasta, chicken and salads", amount: "$84.00" },
  { name: "Shared appetizers", detail: "Avocado rolls and sliders", amount: "$24.00" },
  { name: "Pizza", detail: "One shared margherita", amount: "$36.00" },
  { name: "Drinks", detail: "Cocktails, soda and tea", amount: "$42.00" },
] as const;

export function ExpensesScreen({ onBack, onReceipt, onNavigate }: { onBack: () => void; onReceipt: () => void; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Trip expenses" eyebrow="LA for Shohei" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-5">
        <SectionTitle eyebrow="Keep it easy" title="Everything the group spent." detail="Receipts, line items and balances stay together with the trip." />

        <div className="mt-5 overflow-hidden rounded-[24px] bg-[#0e0e0d] p-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-white/55">Group spending</p>
          <p className="font-display mt-1 text-[38px] font-semibold tracking-[-.055em]">$524.00</p>
          <div className="mt-5 grid grid-cols-2 divide-x divide-white/12 border-t border-white/12 pt-4">
            <div><p className="text-[12px] text-white/58">You currently owe</p><p className="mt-1 text-[19px] font-semibold">$114.50</p></div>
            <div className="pl-4"><p className="text-[12px] text-white/58">Receipts added</p><p className="mt-1 text-[19px] font-semibold">5</p></div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-[#6f6b62]">Recent receipts</p><button type="button" className="text-[12px] font-semibold text-[#0e0e0d]">Add receipt</button></div>
        <div className="mt-3 space-y-2.5">
          {receipts.map((receipt, index) => (
            <button key={receipt.merchant} type="button" onClick={receipt.open ? onReceipt : undefined} disabled={!receipt.open} className={`rr-list-in flex w-full items-center gap-3 rounded-[18px] border border-black/[.08] bg-white p-3.5 text-left ${receipt.open ? "rr-tap" : "cursor-default"}`} style={{ animationDelay: `${index * 55}ms` }}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] text-white" style={{ backgroundColor: receipt.color }}><Icon name="receipt" size={19} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold text-[#0e0e0d]">{receipt.merchant}</span><span className="mt-1 block text-[12px] text-[#756f66]">{receipt.meta}</span></span>
              <span className="text-right"><span className="block text-[14px] font-semibold text-[#0e0e0d]">{receipt.amount}</span><span className={`mt-1 block text-[10px] font-bold uppercase tracking-[.07em] ${receipt.status === "Needs review" ? "text-[#b55d48]" : receipt.status === "Settled" ? "text-[#47796b]" : "text-[#756f66]"}`}>{receipt.status}</span></span>
              {receipt.open && <Icon name="chevron" size={15} />}
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-[12px] leading-[1.5] text-[#756f66]">Open The Cheesecake Factory receipt to review its itemized split.</p>
      </div>
      <BottomNav active="expenses" onNavigate={onNavigate} />
    </div>
  );
}

export function ReceiptScreen({ onBack, onHelp }: { onBack: () => void; onHelp: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="The Cheesecake Factory" eyebrow="Receipt · today" onBack={onBack} trailing={false} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-5">
        <div className="rounded-[24px] border border-black/[.08] bg-white p-5 shadow-[0_18px_50px_-38px_rgba(14,14,13,.7)]">
          <div className="flex items-start justify-between gap-4 border-b border-dashed border-black/[.12] pb-5"><div><p className="text-[11px] font-bold uppercase tracking-[.13em] text-[#6f6b62]">Dinner · The Grove</p><h2 className="font-display mt-1 text-[28px] font-semibold tracking-[-.05em] text-[#0e0e0d]">The Cheesecake Factory</h2><p className="mt-1 text-[12px] text-[#756f66]">Haruka paid · 14 May, 9:24 PM</p></div><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f7e7e2] text-[#a95340]"><Icon name="receipt" size={20} /></span></div>
          <div className="divide-y divide-black/[.07]">{billItems.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 py-3.5"><div><p className="text-[14px] font-semibold text-[#0e0e0d]">{item.name}</p><p className="mt-0.5 text-[12px] text-[#756f66]">{item.detail}</p></div><p className="text-[14px] font-semibold text-[#0e0e0d]">{item.amount}</p></div>)}</div>
          <div className="flex items-end justify-between border-t border-dashed border-black/[.12] pt-4"><p className="text-[13px] font-semibold text-[#5e5b52]">Receipt total</p><p className="font-display text-[28px] font-semibold tracking-[-.04em] text-[#0e0e0d]">$186.00</p></div>
        </div>

        <div className="mt-4 rounded-[22px] border border-black/[.08] bg-[#fbfaf6] p-4">
          <div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#6f6b62]">Current split</p><p className="mt-1 text-[14px] font-semibold text-[#0e0e0d]">Evenly between everyone</p></div><span className="font-display text-[23px] font-semibold tracking-[-.04em] text-[#0e0e0d]">$46.50</span></div>
          <div className="mt-4 space-y-2.5">{people.map((person) => <div key={person.name} className="flex items-center gap-2.5"><Avatar person={person} size="sm" /><span className="flex-1 text-[13px] text-[#5e5b52]">{person.name}{person.name === "Haruka" ? " · paid" : ""}</span><span className="text-[13px] font-semibold text-[#0e0e0d]">$46.50</span></div>)}</div>
        </div>
        <div className="mt-4 rounded-[18px] bg-[#eeecff] p-3.5 text-[13px] leading-[1.5] text-[#5147de]"><p className="font-semibold">Not everyone shared everything?</p><p className="mt-1 opacity-80">Tell the Co-Pilot what you skipped. It will adjust the relevant items and show its math.</p></div>
      </div>
      <div className="border-t border-black/[.08] bg-[#f4f2ec]/96 px-4 py-4"><PrimaryButton onClick={onHelp}><Icon name="sparkles" size={15} /> Help split this for me</PrimaryButton></div>
    </div>
  );
}

type SplitPhase = "pizza-thinking" | "pizza-ready" | "drinks-thinking" | "drinks-ready";

function ShareCard({ amount, excluded }: { amount: string; excluded: string[] }) {
  return (
    <div className="rr-message ml-[40px] rounded-[20px] border border-[#d9d3ff] bg-[#eeecff] p-4">
      <div className="flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.13em] text-[#6257ff]">Your adjusted share</p><p className="font-display mt-1 text-[32px] font-semibold tracking-[-.05em] text-[#292450]">{amount}</p></div><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#5147de]"><Icon name="check" size={17} /></span></div>
      <div className="mt-3 border-t border-[#d4ceff] pt-3 text-[12px] leading-[1.55] text-[#655f82]"><p><strong className="text-[#292450]">Included:</strong> entrée and appetizers{excluded.length === 1 ? ", plus your drinks" : ""}</p><p className="mt-1"><strong className="text-[#292450]">Excluded:</strong> {excluded.join(" and ")}</p></div>
    </div>
  );
}

export function SplitChatScreen({ onBack, onUpdate }: { onBack: () => void; onUpdate: () => void }) {
  const [phase, setPhase] = useState<SplitPhase>("pizza-thinking");
  const [prompt, setPrompt] = useState("");
  useEffect(() => {
    if (phase !== "pizza-thinking" && phase !== "drinks-thinking") return;
    const timer = window.setTimeout(() => setPhase(phase === "pizza-thinking" ? "pizza-ready" : "drinks-ready"), 1050);
    return () => window.clearTimeout(timer);
  }, [phase]);
  const send = () => {
    if (!prompt.trim() || phase !== "pizza-ready") return;
    setPrompt("");
    setPhase("drinks-thinking");
  };
  const hasPizzaResult = phase !== "pizza-thinking";
  const hasDrinkPrompt = phase === "drinks-thinking" || phase === "drinks-ready";

  return (
    <div className="flex h-full flex-col bg-[#f4f2ec]">
      <AppHeader title="Split with Co-Pilot" eyebrow="Cheesecake Factory · $186" onBack={onBack} trailing={false} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-5">
        <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-black/[.08] bg-white px-3 py-2 text-[11px] text-[#5e5b52]"><Icon name="receipt" size={13} /> 4 people · 4 item groups</div>
        <div className="space-y-3">
          <AssistantBubble>Tell me what you did or didn’t have. I’ll reassign only those line items and keep the rest even.</AssistantBubble>
          <UserBubble>I didn’t have pizza.</UserBubble>
          {phase === "pizza-thinking" ? <TypingBubble label="Adjusting the pizza split" /> : (
            <>
              <AssistantBubble>Got it. I removed your share of the pizza and split that $36 between Haruka, Yui and Mei.</AssistantBubble>
              <ShareCard amount="$37.50" excluded={["pizza"]} />
            </>
          )}

          {hasDrinkPrompt && <UserBubble>I didn’t have drinks either.</UserBubble>}
          {phase === "drinks-thinking" && <TypingBubble label="Adjusting the drinks split" />}
          {phase === "drinks-ready" && (
            <>
              <AssistantBubble>Done. Your share now includes only your entrée and the shared appetizers. Pizza and drinks are split by the three people who had them.</AssistantBubble>
              <ShareCard amount="$27.00" excluded={["pizza", "drinks"]} />
            </>
          )}
          {hasPizzaResult && phase !== "pizza-ready" && <div className="h-1" />}
        </div>
      </div>
      {phase === "drinks-ready" && <div className="px-4 pb-3"><PrimaryButton onClick={onUpdate}><Icon name="check" size={15} /> Update this expense</PrimaryButton></div>}
      <ChatComposer value={prompt} onChange={setPrompt} onSend={send} disabled={phase !== "pizza-ready"} placeholder={phase === "pizza-ready" ? "Tell me another adjustment…" : phase === "drinks-ready" ? "Split ready to update" : "Recalculating your split…"} />
    </div>
  );
}

export function UpdatedExpenseScreen({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const shares = [
    { person: people[0], amount: "$27.00", detail: "entrée + appetizers" },
    { person: people[1], amount: "$53.00", detail: "all items" },
    { person: people[2], amount: "$53.00", detail: "all items" },
    { person: people[3], amount: "$53.00", detail: "all items" },
  ];
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Updated expense" eyebrow="The Cheesecake Factory" onBack={onBack} />
      <div className="rr-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-5">
        <div className="rr-message rounded-[22px] border border-[#cfe3dc] bg-[#e7f1ed] p-4 text-[#315f52]"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white"><Icon name="check" size={18} /></span><div><p className="text-[14px] font-semibold">Expense updated</p><p className="mt-0.5 text-[12px] opacity-75">The new split is visible to the group.</p></div></div></div>

        <div className="mt-4 rounded-[24px] bg-[#0e0e0d] p-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#9e97ff]">Your final share</p><p className="font-display mt-1 text-[40px] font-semibold tracking-[-.055em]">$27.00</p>
          <div className="mt-4 flex gap-2"><span className="rounded-full bg-white/10 px-2.5 py-1.5 text-[12px] text-white/78">✓ entrée</span><span className="rounded-full bg-white/10 px-2.5 py-1.5 text-[12px] text-white/78">✓ appetizers</span></div>
          <p className="mt-3 text-[11px] text-white/55">Pizza and drinks excluded</p>
        </div>

        <div className="mt-5 rounded-[22px] border border-black/[.08] bg-white p-4"><div className="flex items-center justify-between"><p className="text-[12px] font-bold uppercase tracking-[.13em] text-[#6f6b62]">Final shares</p><p className="text-[12px] font-semibold text-[#0e0e0d]">$186.00 total</p></div><div className="mt-3 divide-y divide-black/[.07]">{shares.map((share, index) => <div key={share.person.name} className="rr-list-in flex items-center gap-3 py-3" style={{ animationDelay: `${index * 65}ms` }}><Avatar person={share.person} size="sm" /><div className="min-w-0 flex-1"><p className="text-[13px] font-semibold text-[#0e0e0d]">{share.person.name}{index === 0 ? " · you" : ""}</p><p className="mt-0.5 text-[11px] text-[#756f66]">{share.detail}</p></div><p className="text-[14px] font-semibold text-[#0e0e0d]">{share.amount}</p></div>)}</div></div>

        <div className="mt-4 rounded-[20px] border border-black/[.08] bg-[#fbfaf6] p-4"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#6f6b62]">Balance after this receipt</p><div className="mt-2 flex items-end justify-between"><div><p className="text-[14px] font-semibold text-[#0e0e0d]">Haruka is owed</p><p className="mt-1 text-[11px] text-[#756f66]">Across the Los Angeles trip</p></div><p className="font-display text-[25px] font-semibold tracking-[-.04em] text-[#0e0e0d]">$133.00</p></div></div>
      </div>
      <div className="border-t border-black/[.08] bg-[#f4f2ec]/96 px-4 py-4"><PrimaryButton onClick={onFinish}>Finish story <Icon name="chevron" size={15} /></PrimaryButton></div>
    </div>
  );
}

export function FinalScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#0e0e0d] px-6 text-white">
      <div className="flex flex-1 flex-col justify-center"><Image src="/otw-logo-cropped.png" alt="OTW" width={96} height={96} className="h-24 w-24 shrink-0 rounded-[24%]" /><p className="mt-9 text-[9px] font-bold uppercase tracking-[.18em] text-[#9e97ff]">One trip · one shared memory</p><h2 className="font-display mt-3 text-[43px] font-semibold leading-[.92] tracking-[-.065em]">Plan it.<br />Live it.<br />Settle it.</h2><p className="mt-5 max-w-[310px] text-[12px] leading-[1.65] text-white/58">OTW keeps the group aligned from the first saved place to the final split.</p><div className="mt-8 grid grid-cols-3 gap-2">{[["9", "places saved"], ["1", "plan updated"], ["$27", "final share"]].map(([value, label]) => <div key={label} className="rounded-[16px] border border-white/12 bg-white/[.05] p-3"><p className="font-display text-[20px] font-semibold">{value}</p><p className="mt-1 text-[8px] leading-[1.25] text-white/42">{label}</p></div>)}</div></div>
      <div className="pb-9"><button type="button" onClick={onRestart} className="rr-tap h-12 w-full rounded-full bg-white text-[12px] font-semibold text-[#0e0e0d]">Replay prototype</button><p className="mt-4 text-center text-[8px] uppercase tracking-[.15em] text-white/28">OTW · Los Angeles story</p></div>
    </div>
  );
}
