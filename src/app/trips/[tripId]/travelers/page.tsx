"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Eyebrow, useToast } from "@/components/ui";
import { useTrip } from "@/lib/store";

function displayName(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function TravelersPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, store, hydrated } = useTrip(tripId);
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  if (!hydrated || !trip) return <div className="mx-auto h-[55vh] max-w-[860px] rounded-card shimmer" />;

  const invite = () => {
    const value = email.trim().toLowerCase();
    if (!value || !value.includes("@")) return;
    if (trip.collaborators.some((traveler) => traveler.email.toLowerCase() === value)) {
      toast("That traveler is already on this trip.");
      return;
    }
    store.patchTrip(trip.id, {
      collaborators: [
        ...trip.collaborators,
        { id: `traveler-${Date.now()}`, name: displayName(value) || "Traveler", email: value, status: "invited" },
      ],
    });
    setEmail("");
    toast("Invitation ready to send.");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/trips/${trip.id}/itinerary`);
      toast("Shared itinerary link copied.");
    } catch {
      toast("Share link ready: copy it from the address bar.");
    }
  };

  return (
    <div className="mx-auto max-w-[900px] pb-20">
      <Link href={`/trips/${trip.id}/itinerary`} className="text-[13px] font-semibold text-muted transition hover:text-ink">← Back to shared itinerary</Link>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
        <div><Eyebrow>Travel together</Eyebrow><h1 className="mt-3 max-w-[16ch] font-display text-[clamp(38px,6vw,58px)] font-semibold leading-[0.98] tracking-[-0.045em]">Plan once. Decide together.</h1><p className="mt-4 max-w-[58ch] text-[15.5px] leading-relaxed text-muted">Invite family and friends into the itinerary. They can see what is booked, react to plans and leave suggestions without creating a separate trip.</p></div>
        <Button variant="ghost" onClick={copyLink}>Copy share link</Button>
      </div>

      <section className="mt-9 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="rounded-[24px] border border-hair bg-surface p-5 md:p-6">
          <Eyebrow>Invite travelers</Eyebrow>
          <form onSubmit={(event) => { event.preventDefault(); invite(); }} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="friend@example.com" aria-label="Traveler email" className="min-w-0 flex-1 rounded-full border border-hair bg-surface-2 px-4 py-3 text-[14px] outline-none focus-visible:border-accent" />
            <Button type="submit" variant="ink" disabled={!email.trim().includes("@")} >Send invite</Button>
          </form>

          <div className="mt-6 divide-y divide-hair-2 border-t border-hair-2">
            {trip.collaborators.map((traveler) => (
              <div key={traveler.id} className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-display text-[14px] font-semibold text-paper">{traveler.name.charAt(0).toUpperCase()}</span><span className="min-w-0"><span className="block truncate text-[13.5px] font-semibold text-ink">{traveler.name}</span><span className="block truncate text-[11.5px] text-faint">{traveler.email}</span></span></div>
                <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${traveler.status === "organizer" ? "bg-ink text-paper" : traveler.status === "joined" ? "bg-[#dfe9df] text-[#34523b]" : "bg-paper-2 text-muted"}`}>{traveler.status === "organizer" ? "Organizer" : traveler.status === "joined" ? "Joined" : "Invited"}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[24px] border border-hair bg-surface-2 p-5">
          <Eyebrow>Shared decisions</Eyebrow>
          <h2 className="mt-2 font-display text-[22px] font-semibold tracking-[-0.03em]">Keep feedback with the trip</h2>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[14px] bg-white/70 p-3"><p className="text-[12.5px] font-semibold text-ink-soft">👍 Hotel location works</p><p className="mt-1 text-[11px] text-faint">Visible to everyone</p></div>
            <div className="rounded-[14px] bg-white/70 p-3"><p className="text-[12.5px] font-semibold text-ink-soft">💬 Can we keep day two slower?</p><p className="mt-1 text-[11px] text-faint">Suggestion ready to apply</p></div>
          </div>
          <p className="mt-4 text-[11.5px] leading-relaxed text-muted">Reactions and suggestions stay attached to the itinerary, so decisions don&apos;t disappear into a group chat.</p>
        </aside>
      </section>
    </div>
  );
}
