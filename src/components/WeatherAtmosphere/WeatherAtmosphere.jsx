import { useMemo } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";
import PrecipitationCanvas from "./PrecipitationCanvas.jsx";
import styles from "./WeatherAtmosphere.module.css";

const NIGHT_TOP = [10, 14, 28];
const NIGHT_BOTTOM = [26, 34, 58];
const DAY_TOP = [70, 158, 224];
const DAY_BOTTOM = [204, 232, 250];
const OVERCAST_TOP = [90, 100, 112];
const OVERCAST_BOTTOM = [150, 158, 168];
// Rain and snow currently only differed by their particle animation, not sky color -
// blended in on top of the existing brightness/cloud-cover gradient (not replacing it)
// so day/night continuity is preserved while giving each mood a distinct tint.
const RAIN_TOP = [30, 34, 44];
const RAIN_BOTTOM = [56, 61, 74];
const SNOW_TOP = [176, 190, 208];
const SNOW_BOTTOM = [214, 222, 233];

function mix(a, b, t) {
  return a.map((channel, i) => Math.round(channel + (b[i] - channel) * t));
}

function rgb([r, g, b], alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Small deterministic PRNG so star/cloud layouts stay stable across renders
// (no re-shuffling every time the scene recomputes) without needing state.
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export default function WeatherAtmosphere({ scene }) {
  const reducedMotion = usePrefersReducedMotion();

  const stars = useMemo(() => {
    const random = seededRandom(42);
    return Array.from({ length: 55 }, () => ({
      left: `${(random() * 100).toFixed(2)}%`,
      top: `${(random() * 65).toFixed(2)}%`,
      delay: `${(random() * 4).toFixed(2)}s`,
      size: random() > 0.85 ? 3 : 2,
    }));
  }, []);

  const clouds = useMemo(() => {
    const random = seededRandom(7);
    return Array.from({ length: 6 }, () => ({
      top: `${(5 + random() * 45).toFixed(1)}%`,
      width: `${(220 + random() * 220).toFixed(0)}px`,
      height: `${(50 + random() * 40).toFixed(0)}px`,
      duration: `${(70 + random() * 60).toFixed(0)}s`,
      delay: `-${(random() * 60).toFixed(0)}s`,
    }));
  }, []);

  if (!scene) return null;

  const { brightness, goldenness, dayProgress, nightProgress, isNight, cloudCover, fogIntensity, precipitationKind, precipitationIntensity } = scene;
  const isOvercast = cloudCover > 0.7;

  const baseTop = mix(NIGHT_TOP, DAY_TOP, brightness);
  const baseBottom = mix(NIGHT_BOTTOM, DAY_BOTTOM, brightness);
  let top = isOvercast ? mix(baseTop, OVERCAST_TOP, (cloudCover - 0.7) / 0.3) : baseTop;
  let bottom = isOvercast ? mix(baseBottom, OVERCAST_BOTTOM, (cloudCover - 0.7) / 0.3) : baseBottom;

  // Blend toward a mood tint for whatever's actually falling - rain skews the overcast
  // gradient darker/moodier, snow skews it toward a pale frosted tone. Snow's blend is
  // also scaled by brightness so a snowy night doesn't get implausibly pale.
  if (precipitationKind === "rain") {
    const amount = Math.max(0.4, precipitationIntensity) * 0.85;
    top = mix(top, RAIN_TOP, amount);
    bottom = mix(bottom, RAIN_BOTTOM, amount);
  } else if (precipitationKind === "snow") {
    const amount = Math.max(0.3, precipitationIntensity) * 0.65 * (0.4 + brightness * 0.6);
    top = mix(top, SNOW_TOP, amount);
    bottom = mix(bottom, SNOW_BOTTOM, amount);
  }

  const skyGradient = `linear-gradient(to bottom, ${rgb(top)}, ${rgb(bottom)})`;
  const goldenGlow = goldenness > 0.03 ? `, linear-gradient(to bottom, rgba(255, 150, 90, ${(goldenness * 0.35).toFixed(2)}) 0%, transparent 55%)` : "";

  const sunTop = 78 - Math.sin(dayProgress * Math.PI) * 62;
  const sunLeft = 6 + dayProgress * 88;
  const moonTop = 78 - Math.sin(nightProgress * Math.PI) * 62;
  const moonLeft = 6 + nightProgress * 88;

  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <div className={styles.sky} style={{ backgroundImage: skyGradient + goldenGlow }} />

      <div className={styles.stars} style={{ opacity: Math.max(0, 1 - brightness * 1.6) }}>
        {stars.map((star, index) => (
          <span
            key={index}
            className={styles.star}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <div className={`${styles.celestial} ${styles.sun}`} style={{ left: `${sunLeft}%`, top: `${sunTop}%`, opacity: brightness }} />
      <div
        className={`${styles.celestial} ${styles.moon}`}
        style={{ left: `${moonLeft}%`, top: `${moonTop}%`, opacity: Math.max(0, 1 - brightness * 1.4) }}
      />

      <div className={styles.clouds} style={{ opacity: 0.12 + cloudCover * 0.55 }}>
        {clouds.map((cloud, index) => (
          <span
            key={index}
            className={styles.cloud}
            style={{
              top: cloud.top,
              width: cloud.width,
              height: cloud.height,
              background: rgb(isNight ? [70, 76, 96] : [255, 255, 255], 0.55),
              animationDuration: reducedMotion ? undefined : cloud.duration,
              animationDelay: reducedMotion ? undefined : cloud.delay,
              animationPlayState: reducedMotion ? "paused" : "running",
            }}
          />
        ))}
      </div>

      {fogIntensity > 0.02 && (
        <div
          className={styles.fog}
          style={{
            opacity: fogIntensity,
            background: `linear-gradient(to bottom, rgba(205, 210, 220, 0) 0%, rgba(205, 210, 220, 0.55) 60%, rgba(190, 195, 208, 0.75) 100%)`,
          }}
        />
      )}

      <PrecipitationCanvas
        kind={scene.precipitationKind}
        intensity={scene.precipitationIntensity}
        windLean={scene.windLean}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
