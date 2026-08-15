import { TripPlaceholder } from "@/components/trip-placeholder";

export default function StaysPage() {
  return (
    <TripPlaceholder
      title="Stay"
      body="The resort this whole direction was chosen around — one held option and a considered backup, both leaning into the design and atmosphere you care about, rather than an endless list of hotels."
      bullets={[
        "Design-led places, because that's what you notice",
        "A held choice plus one alternative — not fifty tabs",
        "Why each was chosen, in plain language",
      ]}
    />
  );
}
