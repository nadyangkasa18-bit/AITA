import { TripPlaceholder } from "@/components/trip-placeholder";

export default function PlanPage() {
  return (
    <TripPlaceholder
      title="Plan"
      body="Your trip as a light rhythm rather than a rigid schedule — arrival, a few anchored moments, and protected downtime you asked to keep. It builds on the version you assemble in the Booking Workspace."
      bullets={[
        "A day-by-day feel, not an hour-by-hour agenda",
        "Anchored around the signature moments from your chosen direction",
        "Downtime kept deliberately empty, because you dislike packed itineraries",
      ]}
    />
  );
}
