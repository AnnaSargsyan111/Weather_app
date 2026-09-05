const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const CURRENT_PARAMS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "is_day",
  "weather_code",
  "surface_pressure",
  "wind_speed_10m",
  "wind_direction_10m",
  "dew_point_2m",
  "visibility",
].join(",");

const DAILY_PARAMS = ["sunrise", "sunset", "temperature_2m_max", "temperature_2m_min"].join(",");

// Fetches current conditions + today's daily summary for a coordinate pair.
export async function getWeather(latitude, longitude) {
  const url =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&current=${CURRENT_PARAMS}&daily=${DAILY_PARAMS}&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather data is currently unavailable.");
  }

  const data = await response.json();
  const current = data.current || {};
  const daily = data.daily || {};

  return {
    timezone: data.timezone,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    isDay: current.is_day === 1,
    weatherCode: current.weather_code,
    pressure: current.surface_pressure,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    dewPoint: current.dew_point_2m,
    visibility: current.visibility,
    sunrise: daily.sunrise?.[0],
    sunset: daily.sunset?.[0],
    tempMax: daily.temperature_2m_max?.[0],
    tempMin: daily.temperature_2m_min?.[0],
  };
}
