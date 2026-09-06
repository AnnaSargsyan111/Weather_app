import TemperatureCard from "./cards/TemperatureCard.jsx";
import FeelsLikeCard from "./cards/FeelsLikeCard.jsx";
import CloudCoverCard from "./cards/CloudCoverCard.jsx";
import PrecipitationCard from "./cards/PrecipitationCard.jsx";
import WindCard from "./cards/WindCard.jsx";
import HumidityCard from "./cards/HumidityCard.jsx";
import UvCard from "./cards/UvCard.jsx";
import AqiCard from "./cards/AqiCard.jsx";
import VisibilityCard from "./cards/VisibilityCard.jsx";
import PressureCard from "./cards/PressureCard.jsx";
import SunCard from "./cards/SunCard.jsx";
import MoonCard from "./cards/MoonCard.jsx";
import MoonPhaseCard from "./cards/MoonPhaseCard.jsx";
import styles from "./WeatherDetails.module.css";

function DetailsSkeleton() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 13 }).map((_, i) => (
        <div key={i} className={styles.card} style={{ opacity: 0.5 }}>
          <div
            style={{
              height: "100%",
              minHeight: 120,
              borderRadius: 8,
              background:
                "linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 37%, var(--color-surface-hover) 63%)",
              backgroundSize: "400px 100%",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function WeatherDetailsSection({ details, dewPoint, unit, loading }) {
  if (loading && !details) {
    return (
      <section id="weather-details" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Weather details</h2>
        </div>
        <DetailsSkeleton />
      </section>
    );
  }

  if (!details) return null;

  return (
    <section id="weather-details" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Weather details</h2>
        <span className={styles.sectionTime}>{details.updatedAt}</span>
      </div>
      <div className={styles.grid}>
        <TemperatureCard data={details.temperature} unit={unit} />
        <FeelsLikeCard data={details.feelsLike} unit={unit} />
        <CloudCoverCard data={details.cloudCover} />
        <PrecipitationCard data={details.precipitation} />
        <WindCard data={details.wind} />
        <HumidityCard data={details.humidity} dewPoint={dewPoint} unit={unit} />
        <UvCard data={details.uv} />
        <AqiCard data={details.aqi} />
        <VisibilityCard data={details.visibility} />
        <PressureCard data={details.pressure} updatedAt={details.updatedAt} />
        <SunCard data={details.sun} />
        <MoonCard data={details.moon} />
        <MoonPhaseCard data={details.moonPhase} />
      </div>
    </section>
  );
}
