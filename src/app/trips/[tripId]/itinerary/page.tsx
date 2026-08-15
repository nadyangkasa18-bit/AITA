import { TripPlaceholder } from "@/components/trip-placeholder";

export default function ItineraryPage() {
  return (
    <TripPlaceholder
      title="Itinerary"
      body="The day-of view — where you are, what's next, and how to get there — kept gentle and glanceable. This is where a companion tool would carry the plan you built, so the app fades into the background while you're actually away."
      bullets={[
        "Only what matters right now, front and centre",
        "Transfers and timings you can trust at a glance",
        "Designed to be checked in seconds, not studied",
      ]}
      back="plan"
      backLabel="Back to plan"
    />
  );
}
