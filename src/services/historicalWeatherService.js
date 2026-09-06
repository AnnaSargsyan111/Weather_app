const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const DAILY_PARAMS = ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "weather_code"].join(",");

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

// Real historical daily data for the last ~12 months (free, no API key) - used for the
// "Weather forecast" calendar, since genuine day-by-day forecasts 12 months out don't
// exist for any weather API. Archive data typically lags a few days behind today.
export async function getMonthlyHistory(latitude, longitude) {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const endDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000); // archive lag buffer

  const url =
    `${ARCHIVE_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&start_date=${isoDate(startDate)}&end_date=${isoDate(endDate)}` +
    `&daily=${DAILY_PARAMS}&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Historical weather data is currently unavailable.");

  const data = await response.json();
  const daily = data.daily || {};

  return {
    time: daily.time || [],
    tempMax: daily.temperature_2m_max || [],
    tempMin: daily.temperature_2m_min || [],
    precipitation: daily.precipitation_sum || [],
    weatherCode: daily.weather_code || [],
  };
}
