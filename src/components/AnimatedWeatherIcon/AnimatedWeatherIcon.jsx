import { useId, useMemo, useRef } from "react";
import { PALETTE } from "./weatherIconPalette.js";
import { resolveWeatherIconState } from "./weatherIconState.js";
import styles from "./AnimatedWeatherIcon.module.css";

// ---------- shared gradient/filter defs ----------

function Defs({ uid }) {
  return (
    <defs>
      <radialGradient id={`${uid}-sun`} cx="35%" cy="32%" r="75%">
        <stop offset="0%" stopColor={PALETTE.sun.highlight} />
        <stop offset="55%" stopColor={PALETTE.sun.primary} />
        <stop offset="100%" stopColor={PALETTE.sun.accent} />
      </radialGradient>
      <radialGradient id={`${uid}-moon`} cx="38%" cy="34%" r="80%">
        <stop offset="0%" stopColor={PALETTE.moon.highlight} />
        <stop offset="55%" stopColor={PALETTE.moon.primary} />
        <stop offset="100%" stopColor={PALETTE.moon.shadow} />
      </radialGradient>
      <linearGradient id={`${uid}-cloud-light`} x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor={PALETTE.cloud.light} />
        <stop offset="100%" stopColor={PALETTE.cloud.mid} />
      </linearGradient>
      <linearGradient id={`${uid}-cloud-dark`} x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor={PALETTE.cloud.dark} />
        <stop offset="100%" stopColor={PALETTE.cloud.storm} />
      </linearGradient>
      <linearGradient id={`${uid}-rain`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={PALETTE.rain.highlight} />
        <stop offset="100%" stopColor={PALETTE.rain.primary} />
      </linearGradient>
      <linearGradient id={`${uid}-lightning`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={PALETTE.lightning.highlight} />
        <stop offset="100%" stopColor={PALETTE.lightning.primary} />
      </linearGradient>
    </defs>
  );
}

// ---------- shared building blocks ----------

// Two overlapping copies of one proven-valid path (a plain affine transform of it, never
// hand-derived new arc numbers) - the cheapest reliable way to get a layered cloud with
// real depth instead of re-deriving fresh arc geometry, which silently breaks when an
// arc's radius ends up smaller than half its chord (see CLAUDE.md).
const CLOUD_PATH = "M30 68a13 13 0 0 1-1-25.9A16 16 0 0 1 60 36.4 12 12 0 0 1 70 68z";

function Cloud({ uid, storm = false, driftClass = styles.cloudDrift }) {
  const frontFill = storm ? `url(#${uid}-cloud-dark)` : `url(#${uid}-cloud-light)`;
  const backFill = storm ? PALETTE.cloud.storm : PALETTE.cloud.mid;

  return (
    <g className={`${styles.cloudGroup} ${driftClass}`}>
      <path d={CLOUD_PATH} transform="translate(7 7) scale(1.06)" fill={backFill} opacity={0.75} />
      <path d={CLOUD_PATH} fill={frontFill} />
      {storm && <ellipse cx={50} cy={69} rx={19} ry={3.4} fill={PALETTE.cloud.deep} opacity={0.55} />}
      <ellipse cx={38} cy={44} rx={9} ry={4} fill="#FFFFFF" opacity={storm ? 0.08 : 0.35} />
    </g>
  );
}

function SunRays({ uid, cx, cy, coreR, rayInner, rayOuter, count = 10 }) {
  const rays = Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const long = i % 2 === 0;
    return (
      <rect
        key={i}
        x={cx - 1.6}
        y={cy - (long ? rayOuter : rayOuter - 4)}
        width="3.2"
        height={long ? rayOuter - rayInner : rayOuter - rayInner - 4}
        rx="1.6"
        fill={PALETTE.sun.ray}
        transform={`rotate(${angle} ${cx} ${cy})`}
      />
    );
  });

  return (
    <g className={styles.sunRotate} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <g className={styles.sunPulse} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {rays}
      </g>
      <circle cx={cx} cy={cy} r={coreR} fill={`url(#${uid}-sun)`} className={styles.sunCore} />
      <ellipse cx={cx - coreR * 0.32} cy={cy - coreR * 0.32} rx={coreR * 0.32} ry={coreR * 0.22} fill="#FFFFFF" opacity="0.3" />
    </g>
  );
}

function Moon({ uid, cx, cy, r }) {
  // Crescent via SVG mask (full circle minus an offset "bite"), not hand-computed arcs -
  // arc math is fragile (see CLAUDE.md: a radius smaller than half its chord silently
  // renders nothing), a mask of two circles is always geometrically valid.
  const maskId = useId();
  return (
    <g className={styles.moonGlow} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <mask id={maskId} maskUnits="userSpaceOnUse">
        <circle cx={cx} cy={cy} r={r} fill="white" />
        <circle cx={cx + r * 0.55} cy={cy - r * 0.35} r={r * 0.85} fill="black" />
      </mask>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-moon)`} mask={`url(#${maskId})`} />
      <ellipse cx={cx - r * 0.25} cy={cy + r * 0.1} rx={r * 0.22} ry={r * 0.16} fill="#FFFFFF" opacity="0.35" />
    </g>
  );
}

function Bolt({ uid }) {
  // A per-mount random delay (computed once, not re-rolled per render) so the flash
  // cadence doesn't line up identically across every open tab/reload - as close to
  // "irregular timing" as a pure-CSS keyframe loop can get without a JS timer.
  const delay = useRef(Math.random() * 2.2).current;
  return (
    <g className={styles.lightningFlash} style={{ animationDelay: `${delay}s` }}>
      <path d="M53 50 L41 70 L48 70 L45 86 L63 62 L53 62 Z" fill={`url(#${uid}-lightning)`} />
    </g>
  );
}

function RainDrops({ uid, count, duration, opacity = 1, heavy = false }) {
  const xs = [34, 42.5, 50, 57.5, 66, 73].slice(0, count);
  return (
    <g className={`${styles.precip} ${styles.rainLean}`} style={{ opacity }}>
      {xs.map((x, i) => (
        <rect
          key={i}
          className={styles.rainDrop}
          x={x}
          y="60"
          width={heavy ? 3.4 : 2.6}
          height={heavy ? 13 : 10}
          rx={heavy ? 1.7 : 1.3}
          fill={i % 3 === 0 && heavy ? PALETTE.rain.heavy : `url(#${uid}-rain)`}
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
    { x: 33, d: 3.4 },
    { x: 42, d: 2.9 },
    { x: 51, d: 3.7 },
    { x: 60, d: 3.1 },
    { x: 69, d: 3.5 },
  ].slice(0, count);

  return (
    <g className={styles.precip} style={{ opacity }}>
      {positions.map((p, i) => (
        <g
          key={i}
          className={styles.snowFlake}
          style={{ animationDuration: `${p.d}s`, animationDelay: `${(i * p.d) / positions.length}s` }}
        >
          <circle cx={p.x} cy="62" r="2.6" fill={PALETTE.snow.highlight} opacity="0.45" />
          <circle cx={p.x} cy="62" r="1.6" fill={PALETTE.snow.flake} />
          <circle cx={p.x + 0.6} cy="62.6" r="0.6" fill={PALETTE.snow.shadow} opacity="0.6" />
        </g>
      ))}
    </g>
  );
}

function FogBands({ uid }) {
  const bands = [
    { y: 34, dur: 8, opacity: 0.9, color: PALETTE.fog.highlight },
    { y: 50, dur: 10.5, opacity: 0.75, color: PALETTE.fog.primary },
    { y: 66, dur: 13, opacity: 0.55, color: PALETTE.fog.secondary },
  ];
  const bandPath = "M0 0 C 12 -5, 22 5, 34 0 S 56 -5, 68 0 S 90 5, 100 0 L100 6 L0 6 Z";

  return (
    <g filter={`url(#${uid}-soft)`}>
      {bands.map((b, i) => (
        <g key={i} className={styles.fogTrack} style={{ animationDuration: `${b.dur}s`, opacity: b.opacity }}>
          <path d={bandPath} fill={b.color} transform={`translate(0 ${b.y})`} />
          <path d={bandPath} fill={b.color} transform={`translate(-100 ${b.y})`} />
        </g>
      ))}
    </g>
  );
}

function WindLines({ windStrength = 0.5 }) {
  const baseDur = 1.5 - windStrength * 0.7;
  const lines = [
    { y: 38, dur: baseDur, opacity: 0.85, w: 26, color: PALETTE.wind.highlight },
    { y: 50, dur: baseDur * 0.82, opacity: 0.65, w: 34, color: PALETTE.wind.primary },
    { y: 62, dur: baseDur * 1.15, opacity: 0.45, w: 20, color: PALETTE.wind.secondary },
  ];
  return (
    <>
      {lines.map((l, i) => (
        <g key={i} className={styles.windTrack} style={{ animationDuration: `${l.dur}s`, opacity: l.opacity }}>
          <rect x="0" y={l.y} width={l.w} height="3.4" rx="1.7" fill={l.color} />
          <rect x={l.w + 20} y={l.y} width={l.w} height="3.4" rx="1.7" fill={l.color} />
        </g>
      ))}
    </>
  );
}

// ---------- family compositions ----------

const FAMILY = {
  clear: ({ uid, state }) =>
    state.isDay ? (
      <SunRays uid={uid} cx={50} cy={46} coreR={17} rayInner={23} rayOuter={34} />
    ) : (
      <Moon uid={uid} cx={50} cy={46} r={17} />
    ),

  "partly-cloudy": ({ uid, state }) => (
    <>
      {state.isDay ? (
        <SunRays uid={uid} cx={44} cy={38} coreR={13} rayInner={18} rayOuter={27} />
      ) : (
        <Moon uid={uid} cx={38} cy={16} r={10} />
      )}
      <Cloud uid={uid} driftClass={styles.cloudGlide} />
    </>
  ),

  cloudy: ({ uid }) => <Cloud uid={uid} />,

  fog: ({ uid }) => <FogBands uid={uid} />,

  rain: ({ uid, state }) => {
    const heavy = state.intensity > 0.5;
    const count = heavy ? 6 : state.intensity > 0.2 ? 4 : 3;
    const duration = Math.max(0.4, 0.85 - state.intensity * 0.4 - state.windStrength * 0.15);
    return (
      <>
        <Cloud uid={uid} />
        <RainDrops uid={uid} count={count} duration={duration} opacity={heavy ? 1 : 0.8} heavy={heavy} />
      </>
    );
  },

  "rain-snow": ({ uid, state }) => (
    <>
      <Cloud uid={uid} />
      <RainDrops uid={uid} count={3} duration={Math.max(0.45, 0.7 - state.windStrength * 0.15)} />
      <SnowFlakes count={3} />
    </>
  ),

  snow: ({ uid, state }) => {
    const count = state.intensity > 0.5 ? 6 : 5;
    return (
      <>
        <Cloud uid={uid} />
        <SnowFlakes count={count} />
      </>
    );
  },

  thunderstorm: ({ uid }) => (
    <>
      <Cloud uid={uid} storm />
      <Bolt uid={uid} />
    </>
  ),

  wind: ({ uid, state }) => (
    <>
      <Cloud uid={uid} driftClass={styles.cloudSway} />
      <WindLines windStrength={state.windStrength} />
    </>
  ),
};

// Continuously-animated replacement for the static condition icon in CurrentWeather.
// Every state animates via CSS @keyframes only (transform/opacity), starts the instant
// it mounts, and never depends on hover/click/scroll. Fixed 84px (72px on mobile, see
// AnimatedWeatherIcon.module.css) - not fluid/auto-sized. Family + wind/intensity are
// resolved from the same weather + scene the dynamic background uses (weatherIconState.js)
// so the two never disagree about current conditions.
export default function AnimatedWeatherIcon({ weather, scene, className = "" }) {
  const uid = useId();
  const state = useMemo(() => resolveWeatherIconState(weather, scene), [weather, scene]);
  const render = FAMILY[state.family] || FAMILY.cloudy;

  return (
    <div className={`${styles.root} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${styles.icon} ${state.isDay ? "" : styles.night}`}
        role="img"
        aria-hidden="true"
        style={{
          "--wind-lean": state.windLean,
          "--rain-lean": state.rainLean,
          // windLean can land near 0 for a due-north/south wind even at high speed
          // (it's sin(direction) scaled by speed) - the wind family's line movement
          // can't be driven by that alone or it would visibly stall on those headings.
          // A separate, always ±1 sign keeps the animation continuous regardless of
          // exact direction, while windLean/windStrength still control lean and speed.
          "--wind-dir": state.windLean >= 0 ? 1 : -1,
        }}
      >
        <Defs uid={uid} />
        <filter id={`${uid}-soft`}>
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        {render({ uid, state })}
      </svg>
    </div>
  );
}
