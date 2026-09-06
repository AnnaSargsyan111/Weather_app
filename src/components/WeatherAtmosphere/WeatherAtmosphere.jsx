import { useEffect, useMemo, useRef, useState } from "react";
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

// Sunrise/sunset color band (peach -> pink -> lavender), blended in near the horizon
// scaled by `goldenness` - richer than a flat single-color glow.
const DAWN_PEACH = [255, 186, 140];
const DAWN_PINK = [255, 148, 173];
const DAWN_LAVENDER = [175, 142, 205];

// Cloud color ranges from near-white (light cover) to a heavy slate-grey (thick
// overcast), and a cooler/darker version at night.
const CLOUD_LIGHT_DAY = [255, 255, 255];
const CLOUD_DARK_DAY = [98, 104, 116];
const CLOUD_LIGHT_NIGHT = [96, 102, 122];
const CLOUD_DARK_NIGHT = [48, 52, 64];

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
  const [lightning, setLightning] = useState(0);

  const sunRef = useRef(null);
  const moonRef = useRef(null);
  const cloudsNearRef = useRef(null);
  const cloudsFarRef = useRef(null);
  const starsRef = useRef(null);

  const stars = useMemo(() => {
    const random = seededRandom(42);
    return Array.from({ length: 90 }, () => ({
      left: `${(random() * 100).toFixed(2)}%`,
      top: `${(random() * 65).toFixed(2)}%`,
      delay: `${(random() * 5).toFixed(2)}s`,
      duration: `${(3 + random() * 3).toFixed(2)}s`,
      size: random() > 0.92 ? 3 : random() > 0.6 ? 2 : 1,
      baseOpacity: 0.4 + random() * 0.5,
    }));
  }, []);

  const cloudsFar = useMemo(() => {
    const random = seededRandom(7);
    return Array.from({ length: 5 }, () => ({
      top: `${(4 + random() * 30).toFixed(1)}%`,
      width: `${(160 + random() * 140).toFixed(0)}px`,
      height: `${(36 + random() * 26).toFixed(0)}px`,
      duration: `${(95 + random() * 70).toFixed(0)}s`,
      delay: `-${(random() * 90).toFixed(0)}s`,
      radius: "48% 52% 45% 55% / 60% 55% 45% 40%",
    }));
  }, []);

  const cloudsNear = useMemo(() => {
    const random = seededRandom(19);
    return Array.from({ length: 4 }, () => ({
      top: `${(20 + random() * 32).toFixed(1)}%`,
      width: `${(240 + random() * 260).toFixed(0)}px`,
      height: `${(56 + random() * 46).toFixed(0)}px`,
      duration: `${(60 + random() * 50).toFixed(0)}s`,
      delay: `-${(random() * 60).toFixed(0)}s`,
      radius: "42% 58% 52% 48% / 58% 48% 62% 42%",
    }));
  }, []);

  // Scroll parallax: sun/moon/clouds/stars shift slightly at different speeds as the
  // page scrolls, purely for depth - the atmosphere is `position: fixed` already, so
  // the actual app content is never touched by this. Mutates CSS custom properties
  // directly via refs (not React state) since scroll fires far too often to re-render
  // on every event; skipped for reduced-motion, and self-disables on narrow (mobile)
  // viewports - checked live on every tick rather than once at mount, so a viewport
  // that's momentarily unmeasurable (e.g. a hidden/backgrounded tab at load time)
  // can't permanently disable it for the rest of the page's life.
  useEffect(() => {
    if (reducedMotion) return undefined;

    let ticking = false;

    function apply() {
      ticking = false;
      if (window.innerWidth < 640) return;
      const y = window.scrollY;
      sunRef.current?.style.setProperty("--parallax-y", `${y * 0.05}px`);
      moonRef.current?.style.setProperty("--parallax-y", `${y * 0.05}px`);
      cloudsNearRef.current?.style.setProperty("--parallax-y", `${y * 0.035}px`);
      cloudsFarRef.current?.style.setProperty("--parallax-y", `${y * 0.015}px`);
      starsRef.current?.style.setProperty("--parallax-y", `${y * 0.008}px`);
    }

    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [reducedMotion]);

  // Rare, brief, soft double-flash for thunderstorms only - never a fixed loop period,
  // so it doesn't read as a mechanical animation.
  useEffect(() => {
    if (reducedMotion || scene?.precipitationKind !== "thunderstorm") {
      setLightning(0);
      return undefined;
    }

    let timeoutId;
    const flashTimeouts = [];

    function scheduleFlash() {
      const delay = 7000 + Math.random() * 15000;
      timeoutId = setTimeout(() => {
        setLightning(0.22);
        flashTimeouts.push(setTimeout(() => setLightning(0.04), 90));
        flashTimeouts.push(setTimeout(() => setLightning(0.16), 190));
        flashTimeouts.push(setTimeout(() => setLightning(0), 340));
        scheduleFlash();
      }, delay);
    }

    scheduleFlash();
    return () => {
      clearTimeout(timeoutId);
      flashTimeouts.forEach(clearTimeout);
    };
  }, [scene?.precipitationKind, reducedMotion]);

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
  if (precipitationKind === "rain" || precipitationKind === "thunderstorm") {
    const amount = Math.max(0.4, precipitationIntensity) * 0.85;
    top = mix(top, RAIN_TOP, amount);
    bottom = mix(bottom, RAIN_BOTTOM, amount);
  } else if (precipitationKind === "snow") {
    const amount = Math.max(0.3, precipitationIntensity) * 0.65 * (0.4 + brightness * 0.6);
    top = mix(top, SNOW_TOP, amount);
    bottom = mix(bottom, SNOW_BOTTOM, amount);
  }

  const skyGradient = `linear-gradient(to bottom, ${rgb(top)}, ${rgb(bottom)})`;

  const dawnDuskBand =
    goldenness > 0.03
      ? `, linear-gradient(to bottom, ${rgb(DAWN_PEACH, goldenness * 0.5)} 0%, ${rgb(
          DAWN_PINK,
          goldenness * 0.36
        )} 32%, ${rgb(DAWN_LAVENDER, goldenness * 0.26)} 58%, transparent 78%)`
      : "";

  const sunTop = 78 - Math.sin(dayProgress * Math.PI) * 62;
  const sunLeft = 6 + dayProgress * 88;
  const moonTop = 78 - Math.sin(nightProgress * Math.PI) * 62;
  const moonLeft = 6 + nightProgress * 88;

  // Thick cloud cover should visibly obscure the sun/moon rather than let a
  // full-brightness disc float on top of an overcast sky; a sun shower naturally falls
  // out of this too, since moderate cover during rain still lets plenty of light
  // through, while genuine heavy overcast nearly hides it.
  const skyOcclusion = 1 - Math.min(0.88, cloudCover * 0.92);
  const sunOpacity = brightness * skyOcclusion;
  const moonOpacity = Math.max(0, 1 - brightness * 1.4) * skyOcclusion;

  const cloudDayColor = mix(CLOUD_LIGHT_DAY, CLOUD_DARK_DAY, cloudCover);
  const cloudNightColor = mix(CLOUD_LIGHT_NIGHT, CLOUD_DARK_NIGHT, cloudCover);
  const cloudColor = rgb(isNight ? cloudNightColor : cloudDayColor, 0.4 + cloudCover * 0.45);
  const cloudsVisible = 0.15 + cloudCover * 0.7;

  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <div className={styles.sky} style={{ backgroundImage: skyGradient + dawnDuskBand }} />

      <div ref={starsRef} className={styles.stars} style={{ opacity: Math.max(0, 1 - brightness * 1.6) }}>
        {stars.map((star, index) => (
          <span
            key={index}
            className={styles.star}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.baseOpacity,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div ref={sunRef} className={styles.celestialWrap} style={{ left: `${sunLeft}%`, top: `${sunTop}%`, opacity: sunOpacity }}>
        <div className={styles.sunHalo} />
        <div className={styles.sun} />
      </div>

      <div ref={moonRef} className={styles.celestialWrap} style={{ left: `${moonLeft}%`, top: `${moonTop}%`, opacity: moonOpacity }}>
        <div className={styles.moonHalo} />
        <div className={styles.moon} />
      </div>

      <div ref={cloudsFarRef} className={styles.cloudLayer} style={{ opacity: cloudsVisible }}>
        {cloudsFar.map((cloud, index) => (
          <span
            key={index}
            className={styles.cloud}
            style={{
              top: cloud.top,
              width: cloud.width,
              height: cloud.height,
              background: cloudColor,
              borderRadius: cloud.radius,
              animationDuration: reducedMotion ? undefined : cloud.duration,
              animationDelay: reducedMotion ? undefined : cloud.delay,
              animationPlayState: reducedMotion ? "paused" : "running",
            }}
          />
        ))}
      </div>

      <div ref={cloudsNearRef} className={styles.cloudLayer} style={{ opacity: Math.min(1, cloudsVisible * 1.15) }}>
        {cloudsNear.map((cloud, index) => (
          <span
            key={index}
            className={`${styles.cloud} ${styles.cloudNear}`}
            style={{
              top: cloud.top,
              width: cloud.width,
              height: cloud.height,
              background: cloudColor,
              borderRadius: cloud.radius,
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

      {lightning > 0 && <div className={styles.lightning} style={{ opacity: lightning }} />}

      <PrecipitationCanvas
        kind={scene.precipitationKind}
        intensity={scene.precipitationIntensity}
        windLean={scene.windLean}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
