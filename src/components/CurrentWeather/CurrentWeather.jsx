import { getWeatherCondition } from "../../services/weatherCodes.js";
import { formatTemp } from "../../utils/temperature.js";
import { formatClockTime } from "../../utils/formatTime.js";
import { buildWeatherInsight } from "../../utils/weatherInsight.js";
import AnimatedWeatherIcon from "../AnimatedWeatherIcon/AnimatedWeatherIcon.jsx";
import styles from "./CurrentWeather.module.css";

export default function CurrentWeather({ location, weather, unit, localTime, details, scene }) {
  const condition = getWeatherCondition(weather.weatherCode, weather.isDay);
  const insight = buildWeatherInsight(details, condition, weather);

  return (
    <section className={styles.section} aria-label="Current weather">
      <div className={styles.primary}>
        <p className={styles.location}>
          {location.name}
          {location.country ? `, ${location.country}` : ""}
          {localTime && <span className={styles.localTime}> • {localTime}</span>}
        </p>
        <div className={styles.tempRow}>
          <span className={styles.temp}>{formatTemp(weather.temperature, unit)}</span>
          <span className={styles.iconWrap}>
            <AnimatedWeatherIcon weather={weather} scene={scene} />
          </span>
        </div>
        <p className={styles.condition}>{condition.label}</p>
        {insight && <p className={styles.insight}>{insight}</p>}
      </div>

      <ul className={styles.details}>
        <li className={styles.detailItem}>
          <span className={styles.detailLabel}>Feels like</span>
          <span className={styles.detailValue}>{formatTemp(weather.apparentTemperature, unit)}</span>
        </li>
        <li className={styles.detailItem}>
          <span className={styles.detailLabel}>Sunrise</span>
          <span className={styles.detailValue}>{formatClockTime(weather.sunrise)}</span>
        </li>
        <li className={styles.detailItem}>
          <span className={styles.detailLabel}>High / Low</span>
          <span className={styles.detailValue}>
            {formatTemp(weather.tempMax, unit)} / {formatTemp(weather.tempMin, unit)}
          </span>
        </li>
        <li className={styles.detailItem}>
          <span className={styles.detailLabel}>Sunset</span>
          <span className={styles.detailValue}>{formatClockTime(weather.sunset)}</span>
        </li>
        <li className={`${styles.detailItem} ${styles.coordinates}`}>
          <span className={styles.detailLabel}>Coordinates</span>
          <span className={styles.detailValue}>
            Lat: {location.latitude.toFixed(2)}°&nbsp;&nbsp;Lon: {location.longitude.toFixed(2)}°
          </span>
        </li>
      </ul>
    </section>
  );
}
