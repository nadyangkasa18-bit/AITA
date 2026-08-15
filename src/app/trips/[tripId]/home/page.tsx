import { TripPlaceholder } from "@/components/trip-placeholder";

export default function TripHomePage() {
  return (
    <TripPlaceholder
      title="Trip home"
      body="A single calm overview for a confirmed trip — the plan, the bookings, readiness and anything happening right now — that becomes your day-of companion once you're travelling."
      bullets={[
        "Everything about the trip, gathered in one place",
        "Shifts focus to “right now” as the trip gets close",
        "The home base the other trip tabs feed into",
      ]}
      back="brief"
      backLabel="Back to brief"
    />
  );
}
