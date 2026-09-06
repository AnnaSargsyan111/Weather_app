// Shared parabolic-arc visual for the Sun and Moon cards - progress is 0 (rise) to 1 (set).
export default function CelestialArc({ progress, color }) {
  const clamped = Math.min(1, Math.max(0, progress));
  const x = 8 + clamped * 84;
  const y = 46 - Math.sin(clamped * Math.PI) * 34;

  return (
    <svg width="100" height="52" viewBox="0 0 100 52">
      <path d="M 8 46 Q 50 -6 92 46" fill="none" stroke="var(--color-border)" strokeWidth="2" strokeDasharray="3 3" />
      <path
        d="M 8 46 Q 50 -6 92 46"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray={`${clamped * 145} 200`}
      />
      <circle cx={x} cy={y} r="6" fill={color} stroke="var(--color-surface)" strokeWidth="2" />
    </svg>
  );
}
