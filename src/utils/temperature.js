export function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

// Rounds to 1 decimal place; String() naturally drops a trailing ".0" (25 -> "25", 23.4 -> "23.4").
export function roundForDisplay(value) {
  return String(Math.round(value * 10) / 10);
}

export function unitLabel(unit) {
  return unit === "F" ? "°F" : "°C";
}

export function formatTemp(celsius, unit) {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) return `--${unitLabel(unit)}`;
  const value = unit === "F" ? celsiusToFahrenheit(celsius) : celsius;
  return `${Math.round(value)}${unitLabel(unit)}`;
}
