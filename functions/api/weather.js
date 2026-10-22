import { json, options, missing, providerError, badRequest, readJson } from "./_utils.js";
export async function onRequest({ request, env }) {
  const opt = options(request); if (opt) return opt;
  if (request.method !== "GET") return badRequest("Use GET with lat/lon or a place name.");
  const key = env.OPENWEATHER_API_KEY;
  if (!key) return missing("Weather service (OpenWeatherMap)", ["OPENWEATHER_API_KEY"]);
  const u = new URL(request.url), lat = u.searchParams.get("lat"), lon = u.searchParams.get("lon"), name = u.searchParams.get("name");
  if ((!lat || !lon) && !name) return badRequest("Provide lat & lon, or a place name such as ?name=Jaipur,IN.");
  try {
    const q = lat && lon ? "lat=" + encodeURIComponent(lat) + "&lon=" + encodeURIComponent(lon) : "q=" + encodeURIComponent(name);
    const res = await fetch("https://api.openweathermap.org/data/2.5/weather?" + q + "&units=metric&appid=" + encodeURIComponent(key));
    const data = await readJson(res);
    if (!res.ok) return providerError("OpenWeatherMap", data.message || "HTTP " + res.status);
    return json({ available: true, source: "live", provider: "OpenWeatherMap", place: data.name, tempC: Math.round(data.main?.temp), feelsLikeC: Math.round(data.main?.feels_like), condition: data.weather?.[0]?.description || "", humidityPct: data.main?.humidity, windKph: data.wind?.speed != null ? Math.round(data.wind.speed * 3.6) : null, fetchedAt: new Date().toISOString() });
  } catch (e) { return providerError("OpenWeatherMap", e.message); }
}
