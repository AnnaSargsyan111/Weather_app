const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Searches for locations by name. Returns a normalized list, or throws on network failure.
export async function searchLocations(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Location search failed.");
  }

  const data = await response.json();
  const results = data.results || [];

  return results.map((result) => ({
    id: `${result.id}`,
    name: result.name,
    country: result.country || "",
    region: result.admin1 || "",
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  }));
}
