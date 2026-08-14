# Roam — agentic travel (product prototype)

A desktop web-app for Roam, an agentic AI travel agency. Describe the trip once; Roam plans it,
you refine it in place, book everything in one checkout, then plan the days together on a live
trip surface. Hero scenario: a family of four to Tokyo Disneyland, departing Jakarta.

## Run it
Single self-contained file — open `index.html`. No build step.

## Deploy to Vercel
Push to a GitHub repo → **New Project → Import** → preset **Other**, no build command, output =
root → Deploy. (Fonts from Google Fonts, photos from Unsplash at view time; blocked images fall
back to on-brand gradients so nothing renders broken. The map is a self-contained SVG.)

## How it works — it's not a slideshow

Navigate with the **phase tabs** up top (Describe · Plan · Checkout · Trip) — jump around freely.

- **Describe** — one prompt (real input) or an example. Roam already knows your taste.
- **Plan** — a dynamic workspace. Every item (flight / stay / activity / car) is **tappable**:
  it opens a **side-peek on the same page** with the reasoning, alternate options to switch to,
  and preference toggles. Add a detail via an **inline text input**. Change anything without
  leaving the page.
- **Checkout** — a real payment step; the whole trip books **together** in one confirmation.
- **Trip** — the booked surface: a **map** with your pins, **suggested activities** nearby you can
  add, and an **itinerary you plan with Roam** — ask it to fill a free day, and take its proactive
  "rain moved to your park day" suggestion to re-time everything.

Everywhere: the **butler** collapses to a single floating orb (bottom-right) and expands to an
input when clicked — talk to Roam or tell it what to change. Open your **traveler profile** from
the orb (top-right): umbrella preference categories, traits with provenance (including creator
social-proof), and prompt-to-refine that nests specifics under broad rules. **Invite** people to
plan collaboratively; a **trip tray** holds everything you'll book together.

## The orb
Lighter, airier pastels and an **organic morphing shape** (not a strict circle). More colors fill
in as Roam learns more about you. It's your profile avatar and the butler's send control.

## Design
Warm paper + near-black ink, one restrained forest-green accent, the orb as the only place color
runs free. Display type Bricolage Grotesque, UI Hanken Grotesk, the agent's voice in upright
Newsreader (no italics). Spring-based motion, respects reduced-motion. Concept prototype —
interactions are scripted and there's no real booking backend.
