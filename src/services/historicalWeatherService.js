const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
// Note: "probability" is a forecast-only concept - historical/archive data only has
// what actually happened (precipitation_sum), no probability field exists for it.
const DAILY_PARAMS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "weather_code",
  "wind_speed_10m_max",
].join(",");

// Local-date formatting - NOT toISOString(), which converts to UTC and would shift the
// date backward whenever the system timezone is ahead of UTC.
function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Real historical daily data for an explicit date range (free, no API key) - used as the
// baseline for "historical estimate" days in the forecast calendar, since genuine
// day-by-day forecasts don't exist beyond ~16 days for any weather API.
export async function getHistoricalRange(latitude, longitude, startDate, endDate) {
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
    windSpeed: daily.wind_speed_10m_max || [],
  };
}
