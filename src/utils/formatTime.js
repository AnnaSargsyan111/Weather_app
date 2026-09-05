// Open-Meteo (with timezone=auto) returns naive local wall-clock strings like
// "2026-09-06T06:15" — already in the location's local time, with no UTC offset.
// We must NOT run these through further timezone conversion (new Date() + a
// different Intl timeZone would shift them twice) - just read the hour/minute
// straight out of the string and format them.
export function formatClockTime(isoString) {
  if (!isoString) return "--:--";

  const match = /T(\d{2}):(\d{2})/.exec(isoString);
  if (!match) return "--:--";

  let hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${suffix}`;
}
