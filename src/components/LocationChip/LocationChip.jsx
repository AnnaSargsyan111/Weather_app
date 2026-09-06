import { PiXBold } from "react-icons/pi";
import { useWeather } from "../../hooks/useWeather.js";
import { getWeatherCondition } from "../../services/weatherCodes.js";
import { formatTemp } from "../../utils/temperature.js";
import WeatherIcon from "../WeatherIcon/WeatherIcon.jsx";
import styles from "./LocationChip.module.css";

export default function LocationChip({ location, isActive, unit, onSelect, onRemove }) {
  const { data } = useWeather(location);
  const condition = data ? getWeatherCondition(data.weatherCode, data.isDay) : null;

  return (
    <div className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}>
      <button
        type="button"
        className={styles.button}
        onClick={onSelect}
        aria-pressed={isActive}
      >
        {condition ? (
          <WeatherIcon icon={condition.icon} size={22} className={styles.icon} />
        ) : (
          <span className={styles.icon} style={{ width: 22, height: 22 }} />
        )}
        <span className={styles.name}>{location.name}</span>
        {data && <span className={styles.temp}>{formatTemp(data.temperature, unit)}</span>}
      </button>
      <button
        type="button"
        className={styles.removeButton}
        aria-label={`Remove ${location.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        <PiXBold size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
