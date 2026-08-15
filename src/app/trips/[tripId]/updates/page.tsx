import { TripPlaceholder } from "@/components/trip-placeholder";

export default function UpdatesPage() {
  return (
    <TripPlaceholder
      title="Updates"
      body="Quiet, relevant changes as they happen — a schedule shift, a weather note, a better option that appeared — surfaced only when they actually affect your trip, never as noise for its own sake."
      bullets={[
        "Surfaced only when something genuinely matters to you",
        "A clear suggested action, not just an alert",
        "Calm by default — no notification pile-up",
      ]}
    />
  );
}
