// Real headlines only - no fabricated articles attributed to real outlets. Pulls live
// RSS feeds from legitimate publishers through rss2json.com (a free, keyless RSS->JSON
// proxy; browsers can't fetch cross-origin XML directly without CORS, and these
// publishers' feeds don't send CORS headers themselves).
const RSS2JSON_URL = "https://api.rss2json.com/v1/api.json?rss_url=";

const FEEDS = [
  "https://www.theguardian.com/environment/climate-crisis/rss",
  "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
];

const MAX_ARTICLES = 6;

const CLIMATE_KEYWORDS = [
  "climate", "warming", "carbon", "emission", "greenhouse", "sea level", "sea-level",
  "glacier", "ice sheet", "heatwave", "heat wave", "drought", "wildfire", "fossil fuel",
  "renewable", "net zero", "net-zero", "global heating", "temperature record",
  "record temperature", "record heat", "extreme weather", "extreme heat", "cold snap",
  "polar vortex", "hurricane", "cyclone", "typhoon", "tropical storm", "storm surge",
  "flooding", "climate emergency", "weather warning", "rising temperatures",
  "hottest", "warmest", "coldest",
];

// Matches on the title only, not the full article body - a body can mention "climate"
// in passing (e.g. "political climate") without the story actually being about climate
// change, which let unrelated op-eds through when the description was included too.
function isClimateRelevant(title) {
  const text = title.toLowerCase();
  return CLIMATE_KEYWORDS.some((keyword) => text.includes(keyword));
}

// rss2json passes some fields through still HTML-entity-escaped (e.g. a thumbnail URL's
// "&" query separators arrive as literal "&amp;", which breaks the URL when used as-is).
function decodeEntities(str) {
  if (!str) return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function sourceName(link) {
  try {
    const host = new URL(link).hostname.replace(/^www\./, "");
    if (host.includes("bbc")) return "BBC News";
    if (host.includes("theguardian")) return "The Guardian";
    return host;
  } catch {
    return "News";
  }
}

async function fetchFeed(feedUrl) {
  const response = await fetch(RSS2JSON_URL + encodeURIComponent(feedUrl));
  if (!response.ok) throw new Error("Feed unavailable");
  const data = await response.json();
  if (data.status !== "ok") throw new Error("Feed unavailable");

  // Both feeds carry loosely-tagged items alongside genuine climate coverage (the
  // Guardian's "climate-crisis" tag also catches general politics op-eds; the BBC
  // science feed also catches archaeology, wildlife policy, etc.), so every item is
  // checked against CLIMATE_KEYWORDS rather than trusting either feed's own tagging.
  const items = data.items.filter((item) => isClimateRelevant(item.title));

  return items.map((item) => ({
    id: item.guid || item.link,
    title: decodeEntities(item.title),
    link: item.link,
    source: sourceName(item.link),
    publishedAt: item.pubDate,
    thumbnail: decodeEntities(item.thumbnail || item.enclosure?.link || null),
  }));
}

// Two feeds can carry the same real-world story under different guids (or the same
// feed can re-list an item after an edit), which would otherwise render the identical
// headline/link twice. Keyed by link first - the one thing guaranteed to point at the
// same actual article - falling back to id only when a link is somehow missing.
function dedupeArticles(articles) {
  const seen = new Map();
  for (const article of articles) {
    const key = article.link || article.id;
    if (!seen.has(key)) seen.set(key, article);
  }
  return Array.from(seen.values());
}

// Fetches every configured feed in parallel and keeps whichever succeed - one flaky
// feed (the free rss2json tier is rate-limited) shouldn't take down the whole section.
// Throws only if every feed failed, so the caller can show a real error state. Called
// on a timer by useWeatherNews, so every call re-derives the current latest-6 from
// scratch - there's no persisted "the 6 articles", just whichever 6 real, deduped,
// climate-relevant items are newest right now.
export async function getWeatherNews() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const articles = results.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);

  if (articles.length === 0) throw new Error("News is currently unavailable.");

  return dedupeArticles(articles)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, MAX_ARTICLES);
}
