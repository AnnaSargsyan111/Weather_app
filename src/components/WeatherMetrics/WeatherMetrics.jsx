import { WiStrongWind, WiHumidity, WiHorizonAlt, WiBarometer, WiThermometer } from "react-icons/wi";
import MetricCard from "../MetricCard/MetricCard.jsx";
import { degreesToCompass } from "../../utils/windDirection.js";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherMetrics.module.css";

export default function WeatherMetrics({ weather, unit }) {
  return (
    <div className={styles.grid}>
      <MetricCard
        icon={WiStrongWind}
        label="Wind"
        value={Math.round(weather.windSpeed ?? 0)}
        unit="km/h"
        context={degreesToCompass(weather.windDirection)}
      />
      <MetricCard icon={WiHumidity} label="Humidity" value={Math.round(weather.humidity ?? 0)} unit="%" />
      <MetricCard
        icon={WiHorizonAlt}
        label="Visibility"
        value={weather.visibility ? (weather.visibility / 1000).toFixed(1) : "--"}
        unit="km"
      />
      <MetricCard icon={WiBarometer} label="Pressure" value={Math.round(weather.pressure ?? 0)} unit="hPa" />
      <MetricCard icon={WiThermometer} label="Dew Point" value={formatTemp(weather.dewPoint, unit)} />
    </div>
  );
}
