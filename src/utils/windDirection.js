const DIRECTIONS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export function degreesToCompass(degrees) {
  if (degrees === null || degrees === undefined || Number.isNaN(degrees)) return "";
  const index = Math.round(degrees / 22.5) % 16;
  return DIRECTIONS[(index + 16) % 16];
}
