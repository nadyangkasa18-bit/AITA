import { TripPlaceholder } from "@/components/trip-placeholder";

export default function ReadinessPage() {
  return (
    <TripPlaceholder
      title="Readiness"
      body="The quiet pre-trip checklist — documents, timing, what to pack for the weather window, and gentle nudges as departure nears. This is where the wider ecosystem (eSIM, entry requirements) would plug in later."
      bullets={[
        "Weather-aware packing tuned to your chosen window",
        "Entry and document reminders, surfaced at the right time",
        "A calm countdown, not a pile of notifications",
      ]}
    />
  );
}
