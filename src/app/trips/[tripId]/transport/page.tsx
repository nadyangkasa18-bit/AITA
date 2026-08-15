import { TripPlaceholder } from "@/components/trip-placeholder";

export default function TransportPage() {
  return (
    <TripPlaceholder
      title="Ground transport"
      body="The car-free plan, door to door — private transfers, rail and ferries stitched together so nobody in the group ever needs to drive. This is a hard requirement on the trip, so it's protected end to end."
      bullets={[
        "No driving required at any point in the journey",
        "Transfers timed to your actual arrival, not a generic schedule",
        "A genuine “must” — never quietly traded away",
      ]}
    />
  );
}
