/**
 * Central product configuration.
 * Keep product naming here so the prototype can be renamed consistently.
 */
export const PRODUCT = {
  name: "RoaminRabbit",
  tagline: "The world quietly rearranged around you.",
  assistantName: "RoaminRabbit",
  ecosystem: {
    esim: "RoaminRabbit",
    entry: "VisaRoo",
    itinerary: "OtterWay",
  },
  /** Global marker so prototype data is never mistaken for live data. */
  prototypeNote: "Prototype data — prices, weather and availability are illustrative, not live.",
} as const;

export type Product = typeof PRODUCT;
