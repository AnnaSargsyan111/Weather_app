import { WiStrongWind, WiHumidity, WiHorizonAlt, WiBarometer, WiThermometer } from "react-icons/wi";
import MetricCard from "../MetricCard/MetricCard.jsx";
import { degreesToCompass } from "../../utils/windDirection.js";
import { formatTemp } from "../../utils/temperature.js";
import styles from "./WeatherMetrics.module.css";

const DESCRIPTIONS = {
  wind: "Shows the current wind speed and direction at your location.",
  humidity: "Shows the amount of moisture in the air. Higher humidity can make the temperature feel warmer.",
  visibility:
    "Shows how far you can clearly see in the current weather conditions. Fog, rain, or dust can reduce visibility.",
  pressure: "Shows the current atmospheric pressure. Changes in pressure can indicate shifts in weather conditions.",
  dewPoint:
    "Shows the temperature at which air becomes saturated and dew can form. A higher dew point usually means more moisture in the air.",
};

export default function WeatherMetrics({ weather, unit }) {
  return (
    <div className={styles.grid}>
      <MetricCard
        icon={WiStrongWind}
        label="Wind"
        value={Math.round(weather.windSpeed ?? 0)}
        unit="km/h"
        context={degreesToCompass(weather.windDirection)}
        description={DESCRIPTIONS.wind}
      />
      <MetricCard
        icon={WiHumidity}
        label="Humidity"
        value={Math.round(weather.humidity ?? 0)}
        unit="%"
        description={DESCRIPTIONS.humidity}
      />
      <MetricCard
        icon={WiHorizonAlt}
        label="Visibility"
        value={weather.visibility ? (weather.visibility / 1000).toFixed(1) : "--"}
        unit="km"
        description={DESCRIPTIONS.visibility}
      />
      <MetricCard
        icon={WiBarometer}
        label="Pressure"
        value={Math.round(weather.pressure ?? 0)}
        unit="hPa"
        description={DESCRIPTIONS.pressure}
      />
      <MetricCard
        icon={WiThermometer}
        label="Dew Point"
        value={formatTemp(weather.dewPoint, unit)}
        description={DESCRIPTIONS.dewPoint}
      />
    </div>
  );
}
