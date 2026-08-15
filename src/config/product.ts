/**
 * Central product configuration.
 * The product name is a temporary prototype name — change it here to rename
 * everywhere across the app.
 */
export const PRODUCT = {
  name: "Roam",
  tagline: "The world quietly rearranged around you.",
  assistantName: "Roam",
  ecosystem: {
    esim: "RoaminRabbit",
    entry: "VisaRoo",
    itinerary: "OtterWay",
  },
  /** Global marker so prototype data is never mistaken for live data. */
  prototypeNote: "Prototype data — prices, weather and availability are illustrative, not live.",
} as const;

export type Product = typeof PRODUCT;
