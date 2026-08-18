import { PRODUCT } from "@/config/product";

const FixedRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-[14px] border border-hair bg-white/80 px-4 py-3 shadow-sm">
    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">{label}</span>
    <span className="text-right text-[13px] font-semibold text-ink-soft">{value}</span>
  </div>
);

export function CalibrationVignette() {
  return (
    <div className="cal-vignette" aria-label="Two-step trip setup preview">
      <div className="cal-window-bar"><span /><span /><span /><b>{PRODUCT.name} trip setup</b></div>
      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-accent">Step 1 · What&apos;s fixed</span>
            <h3 className="mt-1 font-display text-[24px] font-semibold tracking-[-0.03em]">Start with the essentials.</h3>
          </div>
          <span className="rounded-full border border-accent-line bg-accent-tint px-2.5 py-1 text-[10.5px] font-semibold text-accent">Non-negotiable</span>
        </div>

        <div className="mt-5 grid gap-2.5">
          <FixedRow label="Where" value="Tokyo, Japan" />
          <FixedRow label="Who" value="2 adults + 2 kids" />
          <FixedRow label="When" value="20–27 October" />
        </div>

        <div className="my-5 h-px bg-hair-2" />

        <div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">Step 2 · What can flex</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Direct flights", "Central & walkable", "Food first", "Slower pace"].map((item, index) => (
              <span key={item} className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold ${index < 3 ? "border-ink bg-ink text-paper" : "border-hair bg-white/70 text-muted"}`}>{item}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="cal-vignette-footer">
        <span>2 quick steps</span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-paper-2"><span className="block h-full w-full rounded-full bg-accent" /></span>
        <span>No lengthy survey</span>
      </div>
    </div>
  );
}
