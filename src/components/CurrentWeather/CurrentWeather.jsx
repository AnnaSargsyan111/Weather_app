import { getWeatherCondition } from "../../services/weatherCodes.js";
import { formatTemp } from "../../utils/temperature.js";
import { formatClockTime } from "../../utils/formatTime.js";
import WeatherIcon from "../WeatherIcon/WeatherIcon.jsx";
import styles from "./CurrentWeather.module.css";

export default function CurrentWeather({ location, weather, unit }) {
  const condition = getWeatherCondition(weather.weatherCode, weather.isDay);

  return (
    <section className={styles.section} aria-label="Current weather">
      <div className={styles.primary}>
        <p className={styles.location}>
          {location.name}
          {location.country ? `, ${location.country}` : ""}
        </p>
        <div className={styles.tempRow}>
          <span className={styles.temp}>{formatTemp(weather.temperature, unit)}</span>
          <span className={styles.iconWrap}>
            <WeatherIcon icon={condition.icon} size={72} />
          </span>
        </div>
        <p className={styles.condition}>{condition.label}</p>
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
      </ul>
    </section>
  );
}
