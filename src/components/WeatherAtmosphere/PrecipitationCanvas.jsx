import { useEffect, useRef } from "react";

const MAX_RAIN_PARTICLES = 420;
const MAX_SNOW_PARTICLES = 220;

// Lightweight canvas particle system for rain/snow - avoids hundreds of DOM nodes.
// Pauses itself when the tab is hidden or reduced-motion is requested.
export default function PrecipitationCanvas({ kind, intensity, windLean, reducedMotion }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(null);
  const configRef = useRef({ kind, intensity, windLean });

  configRef.current = { kind, intensity, windLean };

  useEffect(() => {
    if (reducedMotion || kind === "none" || intensity <= 0) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", handleResize);

    function spawnParticle() {
      const isSnow = configRef.current.kind === "snow";
      // Rain particles vary more in size/speed/opacity than before so nearer (bigger,
      // faster, more opaque) and farther (thinner, slower, fainter) drops read as real
      // depth rather than a uniform curtain.
      const depth = Math.random();
      return {
        x: Math.random() * width,
        y: -20,
        length: isSnow ? 0 : 14 + depth * 22,
        radius: isSnow ? 1.5 + Math.random() * 2.5 : 0,
        lineWidth: isSnow ? 0 : 0.8 + depth * 1.6,
        speed: isSnow ? 0.6 + Math.random() * 1 : 7 + depth * 7,
        drift: isSnow ? (Math.random() - 0.5) * 0.6 : 0,
        opacity: isSnow ? 0.5 + Math.random() * 0.4 : 0.35 + depth * 0.45,
      };
    }

    function step() {
      const { kind: currentKind, intensity: currentIntensity, windLean: currentLean } = configRef.current;
      const isSnowKind = currentKind === "snow";
      const maxParticles = isSnowKind ? MAX_SNOW_PARTICLES : MAX_RAIN_PARTICLES;
      const targetCount = Math.round(maxParticles * currentIntensity);
      const particles = particlesRef.current;

      while (particles.length < targetCount) particles.push(spawnParticle());
      if (particles.length > targetCount) particles.length = targetCount;

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(210, 224, 240, 0.85)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";

      const isSnow = currentKind === "snow";
      const angleLean = currentLean * (isSnow ? 6 : 14);

      for (const p of particles) {
        if (isSnow) {
          p.x += currentLean * 1.2 + p.drift;
          p.y += p.speed;
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const dx = angleLean * (p.length / 16);
          p.x += currentLean * (p.speed / 5);
          p.y += p.speed;
          ctx.globalAlpha = p.opacity;
          ctx.lineWidth = p.lineWidth;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + dx, p.y + p.length);
          ctx.stroke();
        }

        if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
          Object.assign(p, spawnParticle(), { y: -20 });
        }
      }
      ctx.globalAlpha = 1;

      frameRef.current = requestAnimationFrame(step);
    }

    function handleVisibility() {
      if (document.hidden) {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      } else if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(step);
      }
    }

    frameRef.current = requestAnimationFrame(step);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      particlesRef.current = [];
    };
  }, [kind, intensity > 0, reducedMotion]);

  if (reducedMotion || kind === "none" || intensity <= 0) return null;

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}
