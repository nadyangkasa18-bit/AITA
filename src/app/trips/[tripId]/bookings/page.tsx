import { TripPlaceholder } from "@/components/trip-placeholder";

export default function BookingsPage() {
  return (
    <TripPlaceholder
      title="Bookings"
      body="Once a version is confirmed, every reservation lives here together — flights, stay, transfers — with statuses, references and change windows in one view. Nothing in this prototype is ever really booked."
      bullets={[
        "One coordinated record instead of scattered confirmation emails",
        "Clear statuses and change/cancel windows",
        "No real reservations, payments or supplier connections in the prototype",
      ]}
    />
  );
}
