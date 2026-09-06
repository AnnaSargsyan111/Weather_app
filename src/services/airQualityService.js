const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

// Free, keyless air quality data (separate Open-Meteo API from the main forecast).
export async function getAirQuality(latitude, longitude) {
  const url = `${AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,ozone&timezone=auto`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Air quality data is currently unavailable.");
  }

  const data = await response.json();
  const current = data.current || {};

  return {
    aqi: current.us_aqi,
    pm25: current.pm2_5,
    pm10: current.pm10,
    ozone: current.ozone,
  };
}
