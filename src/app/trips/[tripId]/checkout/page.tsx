import { TripPlaceholder } from "@/components/trip-placeholder";

export default function CheckoutPage() {
  return (
    <TripPlaceholder
      title="Checkout"
      body="Where a confirmed version would be paid for and secured in one coordinated step instead of several separate checkouts. In this prototype there's no payment, no card, and no real transaction of any kind."
      bullets={[
        "One coordinated confirmation, not four separate checkouts",
        "Clear, itemised totals before anything is authorised",
        "Prototype only — no real payment is ever taken",
      ]}
    />
  );
}
