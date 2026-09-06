import { PiXBold } from "react-icons/pi";
import { useWeather } from "../../hooks/useWeather.js";
import { getWeatherCondition } from "../../services/weatherCodes.js";
import { formatTemp } from "../../utils/temperature.js";
import WeatherIcon from "../WeatherIcon/WeatherIcon.jsx";
import styles from "./LocationChip.module.css";

export default function LocationChip({ location, isActive, unit, onSelect, onRemove }) {
  const { data } = useWeather(location);
  const condition = data ? getWeatherCondition(data.weatherCode, data.isDay) : null;

  // The active tab's accent reflects that city's own real day/night state (from the
  // same live `is_day` flag the weather icon already uses), not the manual Light/Dark
  // theme toggle - a location can be in daylight while the user has Dark theme on, or
  // vice versa. Falls back to the plain neutral accent until its own data has loaded.
  const activeMoodClass = !isActive
    ? ""
    : data
    ? data.isDay
      ? styles.chipActiveDay
      : styles.chipActiveNight
    : styles.chipActive;

  return (
    <div className={`${styles.chip} ${activeMoodClass}`}>
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
