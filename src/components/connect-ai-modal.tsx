"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IMPORT_GROUPS, IMPORT_SAMPLE, PENDING_IMPORT_KEY, importLevel, type ImportGroup } from "@/lib/cowork";
import { useStore } from "@/lib/store";

type Step = "intro" | "use" | "import" | "review";

function providerLabel(provider: string) {
  return provider === "ChatGPT" ? "OpenAI" : provider;
}

export function ConnectAIModal({ open, onClose, tripId }: { open: boolean; onClose: () => void; tripId?: string }) {
  const store = useStore();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<Step>("intro");
  const [provider, setProvider] = useState("ChatGPT");
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("intro");
    setSaved(false);
    const timer = window.setTimeout(() => dialogRef.current?.focus(), 30);
    const key = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    return () => { window.clearTimeout(timer); document.removeEventListener("keydown", key); };
  }, [open, onClose]);

  const itemKeys = useMemo(() => IMPORT_GROUPS.flatMap((group) => group.items.map((item) => `${group.key}:${item}`)), []);

  useEffect(() => {
    if (step !== "review") return;
    setSelected(Object.fromEntries(itemKeys.map((key) => [key, true])));
  }, [step, itemKeys]);

  if (!open) return null;

  function moveToReview() {
    if (!text.trim()) setText(IMPORT_SAMPLE);
    setStep("review");
  }

  function readFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  function apply(tripOnly: boolean) {
    const chosen: { group: ImportGroup; item: string }[] = [];
    for (const group of IMPORT_GROUPS) {
      for (const item of group.items) {
        if (selected[`${group.key}:${item}`]) chosen.push({ group, item });
      }
    }

    const payload = {
      tripId: tripId ?? null,
      items: chosen.map(({ group, item }) => ({ group: group.key, item })),
      tripOnly,
      createdAt: new Date().toISOString(),
    };

    if (tripId && store.trips[tripId]) {
      chosen.forEach(({ group, item }) => {
        const level = importLevel(group.key);
        if (level) store.addBriefItem(tripId, item, level);
        if (!tripOnly && (group.key === "priorities" || group.key === "flexible" || group.key === "avoid")) {
          store.addPref({
            category: group.key === "avoid" ? "Flights" : group.key === "priorities" ? "Stays" : "Pace",
            statement: item,
            priority: group.key === "avoid" ? "avoid" : "usually",
            scope: "similar",
            source: "added",
            confidence: 1,
          });
        }
      });
      window.dispatchEvent(new CustomEvent("roaminrabbit:ai-context", { detail: payload }));
    } else {
      try { sessionStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify(payload)); } catch { /* prototype only */ }
    }
    setSaved(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/18 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="presentation">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close Connect your AI" />
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Connect your AI" className="relative z-10 max-h-[92dvh] w-full max-w-[760px] overflow-y-auto rounded-t-[28px] border border-hair bg-[#f9f7f1] shadow-[0_30px_90px_rgba(27,26,23,.22)] outline-none sm:rounded-[28px]">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-hair-2 bg-[rgba(249,247,241,.94)] px-5 py-5 backdrop-blur-xl sm:px-7">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.14em] text-faint">Connect your AI · optional</p>
            <h2 className="mt-1 font-display text-[27px] font-semibold tracking-[-.035em]">Bring your travel context with you</h2>
            <p className="mt-2 max-w-[58ch] text-[13px] leading-relaxed text-muted">Connect an AI you already use or import a planning conversation. You’ll review everything before it is added to this trip.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hair bg-white text-lg text-muted" aria-label="Close">×</button>
        </header>

        <div className="p-5 sm:p-7">
          {step === "intro" && (
            <div className="grid gap-4 md:grid-cols-2">
              <button onClick={() => setStep("use")} className="group rounded-[22px] border border-hair bg-white p-5 text-left transition hover:border-ink/25 hover:shadow-[var(--shadow-card)]">
                <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-faint">Path 1</span>
                <h3 className="mt-2 font-display text-[21px] font-semibold tracking-[-.025em]">Use AITA from your AI</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">Preview how an AITA tool could create, retrieve, and update a trip from a supported assistant.</p>
                <span className="mt-5 inline-flex text-[12px] font-semibold text-accent">Preview connection →</span>
              </button>
              <button onClick={() => setStep("import")} className="group rounded-[22px] border border-hair bg-white p-5 text-left transition hover:border-ink/25 hover:shadow-[var(--shadow-card)]">
                <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-faint">Path 2</span>
                <h3 className="mt-2 font-display text-[21px] font-semibold tracking-[-.025em]">Bring context into AITA</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">Paste a conversation or summary, upload a text file, or try deterministic sample data.</p>
                <span className="mt-5 inline-flex text-[12px] font-semibold text-accent">Import context →</span>
              </button>
              <div className="md:col-span-2 rounded-[16px] border border-[#dfd2bd] bg-[#f6efe3] px-4 py-3 text-[11.5px] leading-relaxed text-ink-soft">
                <strong>Prototype behavior.</strong> AITA does not read your ChatGPT, Claude, or Gemini memory, chat history, or personal profile. Nothing is added without your review.
              </div>
            </div>
          )}

          {step === "use" && (
            <div>
              <button onClick={() => setStep("intro")} className="text-[12px] font-semibold text-muted">← Back</button>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["ChatGPT", "Claude", "Gemini"].map((name) => <button key={name} onClick={() => setProvider(name)} className={`rounded-[16px] border px-3 py-4 text-center text-[12px] font-semibold transition ${provider === name ? "border-ink bg-ink text-paper" : "border-hair bg-white text-ink-soft"}`}>{name}</button>)}
              </div>
              <div className="mt-5 rounded-[22px] border border-hair bg-white p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-faint">Connection preview · simulated</p>
                <h3 className="mt-2 font-display text-[22px] font-semibold">AITA for {provider}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">A future AITA tool could let you say “add this restaurant to my Los Angeles trip” or “show the flight I’m tracking” without restarting the plan.</p>
                <div className="mt-4 rounded-[14px] bg-surface-2 p-4 text-[12px] text-ink-soft">
                  <p><strong>You:</strong> Add UCLA graduation Friday at 10am as fixed.</p>
                  <p className="mt-2"><strong>AITA:</strong> I can prepare that update and ask you to approve it before changing the trip.</p>
                </div>
                <button className="mt-5 rounded-full border border-hair bg-white px-4 py-2.5 text-[12px] font-semibold text-muted" onClick={() => setStep("import")}>Try an import instead</button>
                <p className="mt-3 text-[10.5px] text-faint">No {providerLabel(provider)} plugin, MCP server, OAuth connection, or public directory listing is being claimed in this prototype.</p>
              </div>
            </div>
          )}

          {step === "import" && (
            <div>
              <button onClick={() => setStep("intro")} className="text-[12px] font-semibold text-muted">← Back</button>
              <h3 className="mt-5 font-display text-[23px] font-semibold tracking-[-.025em]">Paste what you already planned</h3>
              <p className="mt-1 text-[12.5px] text-muted">Conversation, AI-generated summary, or rough notes all work for this deterministic prototype.</p>
              <textarea value={text} onChange={(event) => setText(event.target.value)} rows={8} placeholder="Paste a travel conversation or trip summary…" className="mt-4 w-full resize-y rounded-[18px] border border-hair bg-white px-4 py-3 text-[13px] leading-relaxed outline-none focus-visible:border-accent" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setText(IMPORT_SAMPLE)} className="rounded-full border border-hair bg-white px-4 py-2 text-[11.5px] font-semibold text-ink-soft">Use sample LA trip</button>
                <label className="cursor-pointer rounded-full border border-hair bg-white px-4 py-2 text-[11.5px] font-semibold text-ink-soft">Upload .txt<input type="file" accept=".txt,text/plain,.md,text/markdown" className="sr-only" onChange={(event) => readFile(event.target.files?.[0])} /></label>
                <button disabled={!text.trim()} onClick={moveToReview} className="ml-auto rounded-full bg-ink px-5 py-2 text-[11.5px] font-semibold text-paper disabled:opacity-30">Review extracted context →</button>
              </div>
              <p className="mt-3 text-[10.5px] text-faint">Extraction is simulated and deterministic in this prototype. You decide what gets added.</p>
            </div>
          )}

          {step === "review" && !saved && (
            <div>
              <button onClick={() => setStep("import")} className="text-[12px] font-semibold text-muted">← Edit import</button>
              <div className="mt-5 flex items-end justify-between gap-4"><div><h3 className="font-display text-[24px] font-semibold tracking-[-.03em]">Review before anything changes</h3><p className="mt-1 text-[12px] text-muted">Select only the context you want AITA to use.</p></div><span className="rounded-full bg-amber-tint px-3 py-1.5 text-[10px] font-semibold text-amber">Simulated extraction</span></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {IMPORT_GROUPS.map((group) => <section key={group.key} className="rounded-[18px] border border-hair bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-[.11em] text-faint">{group.label}</p><div className="mt-2 grid gap-1.5">{group.items.map((item) => { const key = `${group.key}:${item}`; return <label key={key} className="flex cursor-pointer items-start gap-2.5 rounded-[10px] px-2 py-2 hover:bg-surface-2"><input type="checkbox" checked={selected[key] ?? false} onChange={(event) => setSelected((current) => ({ ...current, [key]: event.target.checked }))} className="mt-0.5"/><span className="text-[12px] leading-snug text-ink-soft">{item}</span></label>; })}</div></section>)}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-end gap-2"><button onClick={onClose} className="rounded-full px-4 py-2.5 text-[11.5px] font-semibold text-muted">Cancel</button><button onClick={() => apply(true)} className="rounded-full border border-hair bg-white px-4 py-2.5 text-[11.5px] font-semibold text-ink">Add for this trip only</button><button onClick={() => apply(false)} className="rounded-full bg-ink px-5 py-2.5 text-[11.5px] font-semibold text-paper">Add selected items</button></div>
            </div>
          )}

          {saved && (
            <div className="py-8 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#e7f1e8] text-[#35543c]">✓</div><h3 className="mt-4 font-display text-[24px] font-semibold">Context added for review</h3><p className="mx-auto mt-2 max-w-[44ch] text-[12.5px] leading-relaxed text-muted">Your selected items are attached to the trip. Long-term preferences were only saved when you chose the broader “Add selected items” action.</p><button onClick={onClose} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[12px] font-semibold text-paper">Back to the trip</button></div>
          )}
        </div>
      </div>
    </div>
  );
}
