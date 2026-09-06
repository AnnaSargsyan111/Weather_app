const UNITS = [
  { limit: 60, divisor: 1, label: "second" },
  { limit: 3600, divisor: 60, label: "minute" },
  { limit: 86400, divisor: 3600, label: "hour" },
  { limit: 2592000, divisor: 86400, label: "day" },
  { limit: 31536000, divisor: 2592000, label: "month" },
];

export function formatRelativeTime(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 10) return "just now";

  for (const { limit, divisor, label } of UNITS) {
    if (seconds < limit) {
      const value = Math.floor(seconds / divisor);
      return `${value} ${label}${value === 1 ? "" : "s"} ago`;
    }
  }

  const years = Math.floor(seconds / 31536000);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}
