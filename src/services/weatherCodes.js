// Maps Open-Meteo's WMO weather codes to a readable label and an icon key.
// Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const WEATHER_CODES = {
  0: { label: "Clear", icon: "clear" },
  1: { label: "Mainly Clear", icon: "partly-cloudy" },
  2: { label: "Partly Cloudy", icon: "partly-cloudy" },
  3: { label: "Overcast", icon: "cloudy" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Fog", icon: "fog" },
  51: { label: "Light Drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Dense Drizzle", icon: "drizzle" },
  56: { label: "Freezing Drizzle", icon: "sleet" },
  57: { label: "Freezing Drizzle", icon: "sleet" },
  61: { label: "Light Rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy Rain", icon: "rain" },
  66: { label: "Freezing Rain", icon: "sleet" },
  67: { label: "Freezing Rain", icon: "sleet" },
  71: { label: "Light Snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy Snow", icon: "snow" },
  77: { label: "Snow Grains", icon: "snow" },
  80: { label: "Rain Showers", icon: "rain" },
  81: { label: "Rain Showers", icon: "rain" },
  82: { label: "Violent Rain Showers", icon: "rain" },
  85: { label: "Snow Showers", icon: "snow" },
  86: { label: "Snow Showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "thunderstorm" },
  96: { label: "Thunderstorm w/ Hail", icon: "thunderstorm" },
  99: { label: "Thunderstorm w/ Hail", icon: "thunderstorm" },
};

export function getWeatherCondition(code, isDay = true) {
  const entry = WEATHER_CODES[code] || { label: "Unknown", icon: "cloudy" };
  if (entry.icon === "clear" && !isDay) {
    return { ...entry, icon: "clear-night" };
  }
  if (entry.icon === "partly-cloudy" && !isDay) {
    return { ...entry, icon: "partly-cloudy-night" };
  }
  return entry;
}
