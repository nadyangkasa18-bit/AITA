import type { Trip } from "@/lib/types";

export type TripStatusKey = "flight" | "stay" | "itinerary" | "visa" | "esim" | "insurance";
export type TripStatusTone = "done" | "active" | "pending";

export type TripStatusItem = {
  key: TripStatusKey;
  label: string;
  shortLabel: string;
  tone: TripStatusTone;
  detail: string;
};

export function tripStatusItems(trip: Trip): TripStatusItem[] {
  const componentTone = (state: Trip["componentStates"]["flight"]): TripStatusTone =>
    state === "confirmed" ? "done" : state === "saved" || state === "tracked" ? "active" : "pending";

  return [
    {
      key: "flight",
      label: "Flight",
      shortLabel: "Flight",
      tone: componentTone(trip.componentStates.flight),
      detail: trip.componentStates.flight === "confirmed" ? "Booked" : trip.componentStates.flight === "tracked" ? "Tracking" : trip.componentStates.flight === "saved" ? "Saved" : "Not chosen",
    },
    {
      key: "stay",
      label: "Stay",
      shortLabel: "Stay",
      tone: componentTone(trip.componentStates.stay),
      detail: trip.componentStates.stay === "confirmed" ? "Booked" : trip.componentStates.stay === "tracked" ? "Watching" : trip.componentStates.stay === "saved" ? "Saved" : "Not chosen",
    },
    {
      key: "itinerary",
      label: "Itinerary",
      shortLabel: "Plan",
      tone: trip.itineraryDraft ? "done" : "pending",
      detail: trip.itineraryDraft ? "Draft ready" : "Not drafted",
    },
    {
      key: "visa",
      label: "Entry & visa",
      shortLabel: "Visa",
      tone: trip.selectedAddonIds.includes("entry") ? "done" : "pending",
      detail: trip.selectedAddonIds.includes("entry") ? "Added" : "Not checked",
    },
    {
      key: "esim",
      label: "eSIM",
      shortLabel: "eSIM",
      tone: trip.selectedAddonIds.includes("esim") ? "done" : "pending",
      detail: trip.selectedAddonIds.includes("esim") ? "Added" : "Not added",
    },
    {
      key: "insurance",
      label: "Travel insurance",
      shortLabel: "Cover",
      tone: trip.selectedAddonIds.includes("insurance") ? "done" : "pending",
      detail: trip.selectedAddonIds.includes("insurance") ? "Added" : "Not added",
    },
  ];
}

function Icon({ type }: { type: TripStatusKey }) {
  const common = "h-[17px] w-[17px]";
  if (type === "flight") return <svg viewBox="0 0 24 24" className={common} aria-hidden><path d="M3 13.2l7.1-1.7 4.2-7.3c.4-.7 1.2-1 1.9-.7.8.3 1.2 1.2.9 2l-2.7 6 5.6 2c.9.3 1.4 1.2 1.1 2.1-.2.8-1 1.3-1.8 1.2l-6.2-.9-3 4.6-1.8-.5 1.2-4.7-4.9-.8L3 13.2z" fill="currentColor"/></svg>;
  if (type === "stay") return <svg viewBox="0 0 24 24" className={common} aria-hidden><path d="M5 20V9l7-5 7 5v11h-5v-6h-4v6H5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;
  if (type === "itinerary") return <svg viewBox="0 0 24 24" className={common} aria-hidden><rect x="4" y="5" width="16" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M8 3.5v4M16 3.5v4M8 11h8M8 15h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
  if (type === "visa") return <svg viewBox="0 0 24 24" className={common} aria-hidden><rect x="5" y="3" width="14" height="18" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="11" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M9.2 11h5.6M12 7.8c1 1 1.5 2.1 1.5 3.2S13 13.2 12 14.2c-1-1-1.5-2.1-1.5-3.2S11 8.8 12 7.8z" fill="none" stroke="currentColor" strokeWidth="1.1"/></svg>;
  if (type === "esim") return <svg viewBox="0 0 24 24" className={common} aria-hidden><rect x="6" y="3" width="12" height="18" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M9 9h6M9 12h6M9 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  return <svg viewBox="0 0 24 24" className={common} aria-hidden><path d="M12 3l7 3v5c0 4.7-2.8 8.2-7 10-4.2-1.8-7-5.3-7-10V6l7-3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9 12l2 2 4-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export function TripStatusDot({ tone }: { tone: TripStatusTone }) {
  if (tone === "pending") return <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#c8c4b8] ring-2 ring-white"/>;
  return <span className={`absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full ring-2 ring-white ${tone === "done" ? "bg-[#5f8d68] text-white" : "bg-accent text-white"}`}>{tone === "done" ? <span className="text-[8px] font-bold leading-none">✓</span> : <span className="h-1.5 w-1.5 rounded-full bg-white"/>}</span>;
}

export function TripStatusIcon({ item, showLabel = false }: { item: TripStatusItem; showLabel?: boolean }) {
  const iconTone = item.tone === "done" ? "text-[#4b7355]" : item.tone === "active" ? "text-accent" : "text-faint";
  return <div className={`flex items-center ${showLabel ? "gap-2.5" : "justify-center"}`} title={`${item.label}: ${item.detail}`}>
    <span className={`relative grid shrink-0 place-items-center ${showLabel ? "h-9 w-9 rounded-full bg-surface-2" : "h-8 w-8"} ${iconTone}`}><Icon type={item.key}/><TripStatusDot tone={item.tone}/></span>
    {showLabel && <span className="min-w-0"><b className="block text-[10.5px] font-semibold text-ink">{item.label}</b><span className="block text-[9px] text-faint">{item.detail}</span></span>}
  </div>;
}

export function TripStatusStrip({ trip, compact = false }: { trip: Trip; compact?: boolean }) {
  const items = tripStatusItems(trip);
  return <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}>{items.map((item) => <TripStatusIcon key={item.key} item={item}/>)}</div>;
}
