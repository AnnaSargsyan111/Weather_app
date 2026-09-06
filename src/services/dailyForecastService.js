const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const DAILY_PARAMS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "weather_code",
  "precipitation_sum",
  "precipitation_probability_max",
].join(",");

// Real 16-day forecast - the actual physical limit of reliable day-by-day weather
// prediction (verified live: forecast_days=16 returns exactly 16 real daily records).
export async function getDailyForecast(latitude, longitude) {
  const url =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&daily=${DAILY_PARAMS}&forecast_days=16&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("16-day forecast is currently unavailable.");

  const data = await response.json();
  const daily = data.daily || {};
  const time = daily.time || [];

  return time.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max?.[i],
    tempMin: daily.temperature_2m_min?.[i],
    weatherCode: daily.weather_code?.[i],
    precipitationSum: daily.precipitation_sum?.[i] ?? 0,
    precipitationProbability: daily.precipitation_probability_max?.[i] ?? 0,
  }));
}
