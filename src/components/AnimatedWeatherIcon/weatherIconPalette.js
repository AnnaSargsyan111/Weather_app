// Design tokens for the premium weather illustration system. Deliberately independent
// of the app's --color-accent theme variable - this is the one icon in the app meant to
// read as a small "hero" illustration rather than a flat, theme-tinted glyph, so it
// carries its own fixed, weather-appropriate palette instead.
export const PALETTE = {
  sun: { primary: "#FFD54A", highlight: "#FFE98A", accent: "#F5B82E", ray: "#FFD966" },
  moon: { primary: "#E8EDF5", highlight: "#FFFFFF", shadow: "#B8C2D1" },
  cloud: { light: "#D9DEE6", mid: "#B8C0CC", dark: "#687180", storm: "#4B5361", deep: "#343B47" },
  rain: { primary: "#7DB7E8", highlight: "#A9D4F5", heavy: "#5D9FD6" },
  snow: { flake: "#F4F7FB", highlight: "#FFFFFF", shadow: "#D9E1EB" },
  fog: { primary: "#C9D0D9", highlight: "#E2E6EB", secondary: "#AEB7C2" },
  wind: { primary: "#D8DEE7", highlight: "#F0F3F7", secondary: "#B7C0CC" },
  lightning: { primary: "#F7E58A", highlight: "#FFF4C2" },
};
