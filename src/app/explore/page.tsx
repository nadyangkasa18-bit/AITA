import { PlaceholderPage } from "@/components/ui";

export default function ExplorePage() {
  return (
    <PlaceholderPage
      eyebrow="Coming next"
      title="Explore"
      body="Browse editorial destination stories, seasonal windows and starting points shaped by how you like to travel. For this demo, start planning from the home page."
      bullets={[
        "Editorial, opinionated destination pieces — not a wall of listings",
        "Seasonal “good right now” windows tuned to your comfort preferences",
        "Every idea can become a Trip Brief in one tap",
      ]}
      backHref="/"
      backLabel="Back to start"
    />
  );
}
