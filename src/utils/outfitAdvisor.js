import { getPrecipitationKind } from "../services/weatherCodes.js";

// Thresholds are Celsius - `details.feelsLike.current`/`details.temperature.current`
// are always Celsius internally (useWeatherDetails never converts), so this stays
// correct regardless of whether the UI is displaying °C or °F.
function categorizeTemp(feelsLikeC) {
  if (feelsLikeC <= 5) return "cold";
  if (feelsLikeC <= 15) return "mild";
  if (feelsLikeC <= 25) return "warm";
  return "hot";
}

const OUTFITS = {
  coldRain: [
    { icon: "🧥", label: "Waterproof warm jacket" },
    { icon: "🧶", label: "Sweater" },
    { icon: "🥾", label: "Boots" },
    { icon: "☂️", label: "Umbrella recommended" },
  ],
  rain: [
    { icon: "🧥", label: "Waterproof jacket" },
    { icon: "👖", label: "Trousers" },
    { icon: "👟", label: "Water-resistant shoes" },
    { icon: "☂️", label: "Umbrella recommended" },
  ],
  windy: [
    { icon: "🧥", label: "Windbreaker" },
    { icon: "👖", label: "Trousers" },
    { icon: "👟", label: "Sneakers" },
  ],
  cold: [
    { icon: "🧥", label: "Warm coat" },
    { icon: "🧶", label: "Sweater" },
    { icon: "👖", label: "Warm trousers" },
    { icon: "🥾", label: "Boots" },
  ],
  mild: [
    { icon: "🧥", label: "Light jacket" },
    { icon: "👖", label: "Jeans" },
    { icon: "👟", label: "Sneakers" },
  ],
  warm: [
    { icon: "👕", label: "T-shirt" },
    { icon: "👖", label: "Light trousers" },
    { icon: "👟", label: "Sneakers" },
  ],
  hot: [
    { icon: "👕", label: "Lightweight shirt" },
    { icon: "🩳", label: "Shorts" },
    { icon: "👟", label: "Breathable shoes" },
  ],
};

function buildInsight({ tempCategory, feelsLikeC, actualC, humidity, isWindy, isRainLike }) {
  if (isRainLike) return "Wet conditions call for waterproof layers and sturdy footwear.";

  const feelsColder = feelsLikeC <= actualC - 2;
  const feelsWarmer = feelsLikeC >= actualC + 2;

  if (tempCategory === "cold") {
    return feelsColder
      ? "Cold temperatures and wind will make it feel even colder."
      : "Cold conditions call for warm, layered clothing.";
  }
  if (tempCategory === "hot") {
    return humidity >= 60
      ? "Warm conditions and high humidity call for lightweight clothing."
      : "Hot, dry conditions are ideal for light, breathable clothing.";
  }
  if (isWindy) return "Moderate wind will make it feel slightly cooler than the temperature suggests.";
  if (feelsColder) return "Cool temperatures and moderate wind will make it feel slightly colder.";
  if (feelsWarmer && humidity >= 60) return "Warm, humid conditions call for lightweight clothing.";
  return "Comfortable conditions - dress for the temperature shown.";
}

// Combines temperature, precipitation, and wind rather than temperature alone, so e.g.
// 24°C with strong wind doesn't get the same recommendation as 24°C calm. All inputs
// come from useWeatherDetails' already-fetched hourly data - no separate fetch.
export function getOutfitRecommendation(details, condition) {
  if (!details || !condition) return null;

  const feelsLikeC = details.feelsLike.current;
  const actualC = details.temperature.current;
  const humidity = details.humidity.percent;
  const windSpeed = details.wind.speed;
  const precipProbability = details.precipitation.probability;

  const precipKind = getPrecipitationKind(condition.icon);
  const isPrecipitatingNow = precipKind !== "none";
  const willLikelyPrecipitate = precipProbability >= 55;
  const isRainLike = isPrecipitatingNow || willLikelyPrecipitate;
  const isSnow = precipKind === "snow" || (isRainLike && feelsLikeC <= 0);
  const isWindy = windSpeed >= 30;
  const tempCategory = categorizeTemp(feelsLikeC);

  let items;
  if (isRainLike && (tempCategory === "cold" || isSnow)) {
    items = OUTFITS.coldRain;
  } else if (isRainLike) {
    items = OUTFITS.rain;
  } else if (isWindy && (tempCategory === "cold" || tempCategory === "mild")) {
    items = OUTFITS.windy;
  } else {
    items = OUTFITS[tempCategory];
  }

  return {
    items,
    insight: buildInsight({ tempCategory, feelsLikeC, actualC, humidity, isWindy, isRainLike }),
  };
}
