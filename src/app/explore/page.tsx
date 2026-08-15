import { PlaceholderPage } from "@/components/ui";

export default function ExplorePage() {
  return (
    <PlaceholderPage
      eyebrow="Coming next"
      title="Explore"
      body="A place to browse ideas before you have a trip in mind — editorial destination stories, seasonal windows, and starting points shaped by how you like to travel. In this prototype, planning begins from the home prompt instead."
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
