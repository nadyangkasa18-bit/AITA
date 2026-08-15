import { TripPlaceholder } from "@/components/trip-placeholder";

export default function ReviewPage() {
  return (
    <TripPlaceholder
      title="Review"
      body="The last calm look before anything is confirmed — the whole version in one place, every “must” accounted for, the total spelled out, and nothing hidden. No money moves without your explicit approval here."
      bullets={[
        "Every requirement checked off before you commit",
        "The full, honest total — no surprise fees",
        "Explicit approval required; the prototype never charges anything",
      ]}
    />
  );
}
