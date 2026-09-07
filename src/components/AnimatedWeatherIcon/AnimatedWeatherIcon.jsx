import { useId } from "react";
import styles from "./AnimatedWeatherIcon.module.css";

// Every family shares one cloud silhouette so switching states (rain -> snow -> sleet
// etc.) never looks like a different icon set - only the moving parts around it change.
function Cloud({ className = "", driftClass = styles.cloudDrift }) {
  return (
    <path
      className={`${styles.cloud} ${driftClass} ${className}`}
      d="M30 68a13 13 0 0 1-1-25.9A16 16 0 0 1 60 36.4 12 12 0 0 1 70 68z"
      fill="currentColor"
    />
  );
}

function SunRays({ cx, cy, coreR, rayInner, rayOuter, count = 8 }) {
  const rays = Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    return (
      <line
        key={i}
        x1={cx}
        y1={cy - rayInner}
        x2={cx}
        y2={cy - rayOuter}
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        transform={`rotate(${angle} ${cx} ${cy})`}
      />
    );
  });

  return (
    <g className={styles.sunRotate} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <g className={styles.sunPulse} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {rays}
      </g>
      <circle cx={cx} cy={cy} r={coreR} fill="currentColor" />
    </g>
  );
}

function Moon({ cx, cy, r }) {
  // A crescent built from an SVG mask (full circle minus an offset "bite" circle)
  // rather than hand-computed arc paths - two-arc crescent math is fragile (a radius
  // just slightly too small for its chord silently produces an empty/invalid path,
  // rendering nothing), while a mask of two circles is always geometrically valid.
  const maskId = useId();
  return (
    <g className={styles.moonGlow} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <mask id={maskId} maskUnits="userSpaceOnUse">
        <circle cx={cx} cy={cy} r={r} fill="white" />
        <circle cx={cx + r * 0.55} cy={cy - r * 0.35} r={r * 0.85} fill="black" />
      </mask>
      <circle cx={cx} cy={cy} r={r} fill="currentColor" mask={`url(#${maskId})`} />
    </g>
  );
}

function Bolt() {
  return (
    <g className={styles.lightningFlash}>
      <path d="M53 50 L41 70 L48 70 L45 86 L63 62 L53 62 Z" fill="currentColor" />
    </g>
  );
}

function RainDrops({ count, duration, opacity = 1 }) {
  const xs = [34, 42.5, 50, 57.5, 66, 73].slice(0, count);
  return (
    <g className={styles.precip} style={{ opacity }}>
      {xs.map((x, i) => (
        <rect
          key={i}
          className={styles.rainDrop}
          x={x}
          y="60"
          width="3"
          height="11"
          rx="1.5"
          fill="currentColor"
          style={{
            animationDuration: `${duration}s`,
            animationDelay: `${(i * duration) / xs.length}s`,
          }}
        />
      ))}
    </g>
  );
}

function SnowFlakes({ count, opacity = 1 }) {
  const positions = [
    { x: 33, d: 3.1 },
    { x: 42, d: 2.7 },
    { x: 51, d: 3.4 },
    { x: 60, d: 2.9 },
    { x: 69, d: 3.2 },
  ].slice(0, count);

  return (
    <g className={styles.precip} style={{ opacity }}>
      {positions.map((p, i) => (
        <g
          key={i}
          className={styles.snowFlake}
          style={{ animationDuration: `${p.d}s`, animationDelay: `${(i * p.d) / positions.length}s` }}
        >
          <line x1={p.x} y1="60" x2={p.x} y2="66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line
            x1={p.x - 2.4}
            y1="61.5"
            x2={p.x + 2.4}
            y2="64.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={p.x - 2.4}
            y1="64.5"
            x2={p.x + 2.4}
            y2="61.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  );
}

function FogBands() {
  const bands = [
    { y: 34, dur: 7, opacity: 1 },
    { y: 50, dur: 9, opacity: 0.75 },
    { y: 66, dur: 11, opacity: 0.5 },
  ];
  const bandPath = "M0 0 C 12 -5, 22 5, 34 0 S 56 -5, 68 0 S 90 5, 100 0 L100 6 L0 6 Z";

  return (
    <>
      {bands.map((b, i) => (
        <g key={i} className={styles.fogTrack} style={{ animationDuration: `${b.dur}s`, opacity: b.opacity }}>
          <path d={bandPath} fill="currentColor" transform={`translate(0 ${b.y})`} />
          <path d={bandPath} fill="currentColor" transform={`translate(-100 ${b.y})`} />
        </g>
      ))}
    </>
  );
}

// Built for completeness/testability per spec, but not wired to a live condition below:
// Open-Meteo's weather_code has no standalone "windy" category, so there is no real
// (non-fabricated) trigger for it in this app today - see CLAUDE.md.
function WindLines() {
  const lines = [
    { y: 38, dur: 1.3, opacity: 1, w: 26 },
    { y: 50, dur: 1.1, opacity: 0.75, w: 34 },
    { y: 62, dur: 1.5, opacity: 0.55, w: 20 },
  ];
  return (
    <>
      {lines.map((l, i) => (
        <g key={i} className={styles.windTrack} style={{ animationDuration: `${l.dur}s`, opacity: l.opacity }}>
          <rect x="0" y={l.y} width={l.w} height="4" rx="2" fill="currentColor" />
          <rect x={l.w + 20} y={l.y} width={l.w} height="4" rx="2" fill="currentColor" />
        </g>
      ))}
    </>
  );
}

const FAMILY = {
  clear: () => <SunRays cx={50} cy={46} coreR={17} rayInner={23} rayOuter={33} />,
  "clear-night": () => <Moon cx={50} cy={46} r={17} />,
  "partly-cloudy": () => (
    <>
      <SunRays cx={44} cy={38} coreR={13} rayInner={18} rayOuter={26} />
      <Cloud driftClass={styles.cloudGlide} />
    </>
  ),
  "partly-cloudy-night": () => (
    <>
      {/* Positioned fully above the cloud's real rendered top edge (~y26, measured),
          not just above its anchor points - a plain crescent has no rays to poke out
          past the cloud's silhouette the way the sun does, so any overlap risks the
          moon disappearing behind it entirely. */}
      <Moon cx={38} cy={16} r={10} />
      <Cloud driftClass={styles.cloudGlide} />
    </>
  ),
  cloudy: () => <Cloud />,
  fog: () => <FogBands />,
  drizzle: () => (
    <>
      <Cloud />
      <RainDrops count={3} duration={1.1} opacity={0.75} />
    </>
  ),
  rain: () => (
    <>
      <Cloud />
      <RainDrops count={6} duration={0.55} />
    </>
  ),
  sleet: () => (
    <>
      <Cloud />
      <RainDrops count={3} duration={0.65} />
      <SnowFlakes count={3} />
    </>
  ),
  snow: () => (
    <>
      <Cloud />
      <SnowFlakes count={5} />
    </>
  ),
  thunderstorm: () => (
    <>
      <Cloud />
      <Bolt />
    </>
  ),
  windy: () => <WindLines />,
};

// Continuously-animated replacement for the static condition icon in CurrentWeather -
// every state animates via CSS @keyframes only (transform/opacity), starts the instant
// it mounts, and never depends on hover/click/scroll. See AnimatedWeatherIcon.module.css
// for the keyframes and CLAUDE.md for the per-state design notes.
export default function AnimatedWeatherIcon({ icon, size = 82, className = "" }) {
  const render = FAMILY[icon] || FAMILY.cloudy;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${styles.icon} ${className}`}
      role="img"
      aria-hidden="true"
    >
      {render()}
    </svg>
  );
}
