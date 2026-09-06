import { useEffect, useState } from "react";

// Ticks the real current time formatted into a specific IANA timezone (e.g.
// "Asia/Yerevan", already resolved by Open-Meteo via timezone=auto - not fabricated).
// Unlike sunrise/sunset (naive local-wall-clock strings from the API, parsed directly by
// formatClockTime), this needs genuine timezone conversion since it's "what time is it
// there right now", not a fixed daily event already given in local time.
export function useLocalClock(timezone) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  if (!timezone) return null;

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);
  } catch {
    return null;
  }
}
