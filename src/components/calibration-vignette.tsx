const ChoiceDot = ({ selected }: { selected?: boolean }) => (
  <span
    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
      selected ? "border-accent bg-accent" : "border-hair bg-white"
    }`}
    aria-hidden
  >
    {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
  </span>
);

function FlightChoices() {
  return (
    <div className="cal-scene cal-scene-flight" aria-hidden>
      <div className="cal-question">Which flight feels more like you?</div>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <div className="cal-choice cal-choice-selected">
          <ChoiceDot selected />
          <div><strong>Direct flight</strong><span>7h 45m · arrive 18:05</span></div>
        </div>
        <div className="cal-choice">
          <ChoiceDot />
          <div><strong>One stop</strong><span>Save Rp 2.7m · arrive 21:40</span></div>
        </div>
      </div>
    </div>
  );
}

function StayChoices() {
  return (
    <div className="cal-scene cal-scene-stay" aria-hidden>
      <div className="cal-question">Which stay sounds better?</div>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <div className="cal-choice cal-choice-selected overflow-hidden p-0">
          <span className="h-full w-[74px] bg-[url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=240&q=78')] bg-cover bg-center" />
          <div className="flex flex-1 items-center gap-3 py-3 pr-3"><ChoiceDot selected /><div><strong>Central & walkable</strong><span>Smaller room · near everything</span></div></div>
        </div>
        <div className="cal-choice overflow-hidden p-0">
          <span className="h-full w-[74px] bg-[url('https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=240&q=78')] bg-cover bg-center" />
          <div className="flex flex-1 items-center gap-3 py-3 pr-3"><ChoiceDot /><div><strong>Roomy & quiet</strong><span>Larger room · more transport</span></div></div>
        </div>
      </div>
    </div>
  );
}

function ProfileStatement({ className, label, text }: { className: string; label: string; text: string }) {
  return (
    <div className={`cal-scene ${className}`} aria-hidden>
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">
        <span className="h-2 w-2 rounded-full bg-accent" /> Traveler profile updated
      </div>
      <div className="rounded-[18px] border border-accent-line bg-white/85 p-5 shadow-[var(--shadow-card)] backdrop-blur">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{label}</span>
        <p className="mt-2 font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink">{text}</p>
      </div>
    </div>
  );
}

export function CalibrationVignette() {
  return (
    <div className="cal-vignette" aria-label="Your choices become a reusable traveler profile">
      <div className="cal-window-bar"><span /><span /><span /><b>Roam calibration</b></div>
      <div className="relative min-h-[300px] p-5 sm:min-h-[320px] sm:p-7">
        <FlightChoices />
        <ProfileStatement className="cal-scene-flight-profile" label="Flights" text="Prefer direct flights when the price difference is reasonable." />
        <StayChoices />
        <ProfileStatement className="cal-scene-final" label="Stays" text="Usually prioritise a central, walkable location over room size." />
      </div>
      <div className="cal-vignette-footer">
        <span>1 of 8</span><span className="h-1 flex-1 overflow-hidden rounded-full bg-paper-2"><span className="cal-progress block h-full rounded-full bg-accent" /></span><span>Profile learns as you choose</span>
      </div>
    </div>
  );
}
