// Builds a smooth-looking path through points via quadratic curves to each
// segment's midpoint - a lightweight approximation, no charting library needed.
export function buildSmoothPath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    d += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

// Scales raw values into an SVG viewBox's y-range (inverted: higher value = lower y).
export function scaleToRange(values, height, padding = 4) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v) => height - padding - ((v - min) / span) * (height - padding * 2));
}
