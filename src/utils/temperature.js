export function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function formatTemp(celsius, unit) {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) return "--°";
  const value = unit === "F" ? celsiusToFahrenheit(celsius) : celsius;
  return `${Math.round(value)}°`;
}

export function unitLabel(unit) {
  return unit === "F" ? "°F" : "°C";
}
