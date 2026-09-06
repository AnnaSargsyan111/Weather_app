// Generates the one-line contextual sentence shown under the current condition in
// CurrentWeather. Built entirely from real hourly-derived data already computed by
// useWeatherDetails (temperature trend/peak/low, precipitation probability, cloud
// cover, wind) - no separate fetch, no hardcoded/random text. Priority order matches
// what's actually useful to know before heading out: precipitation first, then a
// significant temperature swing, then wind, then a plain sky description.
export function buildWeatherInsight(details, condition, weather) {
  if (!details || !condition || !weather?.time) return "";

  const hourMatch = /T(\d{2}):/.exec(weather.time);
  const hour = hourMatch ? Number(hourMatch[1]) : 12;
  // "through/throughout X" reads best with "the day"; "later X" reads best with "today".
  const throughPeriod = hour >= 17 ? "this evening" : hour >= 12 ? "this afternoon" : "the day";
  const laterPeriod = hour >= 17 ? "this evening" : hour >= 12 ? "this afternoon" : "today";

  const precipitatingIcons = new Set(["rain", "drizzle", "sleet", "snow", "thunderstorm"]);
  const isPrecipitatingNow = precipitatingIcons.has(condition.icon);
  const precipProbability = details.precipitation.probability;
  const likelySnow = details.temperature.current <= 1;
  const precipNoun = likelySnow ? "Snow" : "Rain";

  if (isPrecipitatingNow) {
    if (condition.icon === "snow") return `Snow is expected to continue through ${throughPeriod}.`;
    if (condition.icon === "thunderstorm") return `Thunderstorms are expected to continue through ${throughPeriod}.`;
    return `Rain is expected to continue through ${throughPeriod}.`;
  }

  if (precipProbability >= 60) return `${precipNoun} is likely later ${laterPeriod}.`;
  if (precipProbability >= 35) return `A chance of ${precipNoun.toLowerCase()} later ${laterPeriod}.`;

  if (details.wind.speed >= 30) return `Strong winds are expected through ${throughPeriod}.`;

  const swing = details.temperature.peak.value - details.temperature.low.value;
  if (details.temperature.trend === "rising" && swing >= 6) {
    return `Warmer conditions are expected later ${laterPeriod}.`;
  }
  if (details.temperature.trend === "falling" && swing >= 6) {
    return `Cooler conditions are expected later ${laterPeriod}.`;
  }

  const cover = details.cloudCover.percent;
  if (cover >= 85) return `Cloudy skies will remain throughout ${throughPeriod}.`;
  if (cover >= 60) return `Mostly cloudy conditions expected through ${throughPeriod}.`;
  if (cover >= 30) return `A few clouds will drift through ${throughPeriod}.`;
  return `Clear skies and comfortable conditions expected ${laterPeriod}.`;
}
