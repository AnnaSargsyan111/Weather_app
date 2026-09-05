const REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

// Turns coordinates into a readable location name using OpenStreetMap's Nominatim.
// Personal, low-volume use only (one call per "current location" click) per Nominatim's
// usage policy: https://operations.osmfoundation.org/policies/nominatim/
export async function reverseGeocode(latitude, longitude) {
  const url = `${REVERSE_URL}?lat=${latitude}&lon=${longitude}&format=jsonv2&accept-language=en`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Could not resolve your location.");
  }

  const data = await response.json();
  const address = data.address || {};
  const name = address.city || address.town || address.village || address.county || data.name || "Current Location";

  return {
    id: `${latitude.toFixed(3)},${longitude.toFixed(3)}`,
    name,
    country: address.country || "",
    region: address.state || "",
    latitude,
    longitude,
    timezone: undefined,
  };
}
