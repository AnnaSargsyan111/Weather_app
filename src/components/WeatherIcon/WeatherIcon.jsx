import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudyHigh,
  WiNightAltCloudy,
  WiCloud,
  WiFog,
  WiSprinkle,
  WiSleet,
  WiRain,
  WiSnow,
  WiThunderstorm,
} from "react-icons/wi";

const ICON_MAP = {
  clear: WiDaySunny,
  "clear-night": WiNightClear,
  "partly-cloudy": WiDayCloudyHigh,
  "partly-cloudy-night": WiNightAltCloudy,
  cloudy: WiCloud,
  fog: WiFog,
  drizzle: WiSprinkle,
  sleet: WiSleet,
  rain: WiRain,
  snow: WiSnow,
  thunderstorm: WiThunderstorm,
};

export default function WeatherIcon({ icon, size = 48, className }) {
  const Icon = ICON_MAP[icon] || WiCloud;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
