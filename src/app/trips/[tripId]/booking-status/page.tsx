import { TripPlaceholder } from "@/components/trip-placeholder";

export default function BookingStatusPage() {
  return (
    <TripPlaceholder
      title="Booking status"
      body="The live state of a confirmed trip as pieces settle — what's secured, what's pending, and anything that needs a decision — without you having to chase supplier emails. Nothing is truly booked in the prototype."
      bullets={[
        "One status view instead of scattered confirmations",
        "Clear flags when something needs your attention",
        "Simulated states only in this prototype",
      ]}
      back="bookings"
      backLabel="Back to bookings"
    />
  );
}
