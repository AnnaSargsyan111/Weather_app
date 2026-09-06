import DetailCard from "../DetailCard.jsx";
import CelestialArc from "./CelestialArc.jsx";
import { formatClockFromDate, formatDurationMinutes } from "../../../utils/weatherDetailsHelpers.js";

function minutesSince(date) {
  return date.getHours() * 60 + date.getMinutes();
}

export default function MoonCard({ data }) {
  if (!data || (!data.moonrise && !data.moonset)) {
    return <DetailCard title="Moon" description="The moon does not rise or set today at this location." />;
  }

  const { moonrise, moonset } = data;
  let durationMinutes = null;
  let progress = 0.5;

  if (moonrise && moonset) {
    let diff = (moonset.getTime() - moonrise.getTime()) / 60000;
    if (diff < 0) diff += 24 * 60;
    durationMinutes = diff;

    const now = new Date();
    const nowMin = minutesSince(now);
    let riseMin = minutesSince(moonrise);
    let setMin = minutesSince(moonset);
    if (setMin < riseMin) setMin += 24 * 60;
    progress = (nowMin - riseMin) / (setMin - riseMin || 1);
  }

  return (
    <DetailCard title="Moon">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <CelestialArc progress={progress} color="#c7cbe0" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginTop: 4 }}>
          {durationMinutes !== null ? formatDurationMinutes(durationMinutes) : "--"}
        </span>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: 10, fontSize: 12 }}>
          <span style={{ color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "var(--color-text)" }}>{formatClockFromDate(moonrise)}</strong>
            <br />
            Moonrise
          </span>
          <span style={{ color: "var(--color-text-secondary)", textAlign: "right" }}>
            <strong style={{ color: "var(--color-text)" }}>{formatClockFromDate(moonset)}</strong>
            <br />
            Moonset
          </span>
        </div>
      </div>
    </DetailCard>
  );
}
