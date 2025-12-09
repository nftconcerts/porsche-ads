export const PORSCHE_TAGLINES = [
  "There Is No Substitute",
  "Kills Bugs Fast",
  "The best connection between two points is a curve",
  "The German word for 'fast' has always been 'Porsche'",
  "Engineered for Magic. Everyday",
  "Soul, Electrified.",
  "Driven by Dreams",
  "If you could own any car in the world, what color would you choose?",
] as const;

export type PorscheTagline = (typeof PORSCHE_TAGLINES)[number];
