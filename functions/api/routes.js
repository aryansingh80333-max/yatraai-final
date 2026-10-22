import { json, options, missing, providerError, badRequest, readJson } from "./_utils.js";
export async function onRequest({ request, env }) {
  const opt = options(request); if (opt) return opt;
  const key = env.GOOGLE_MAPS_API_KEY;
  if (!key) return missing("Route service (Google Distance Matrix)", ["GOOGLE_MAPS_API_KEY"]);
  const u = new URL(request.url), fromLat = u.searchParams.get("fromLat"), fromLon = u.searchParams.get("fromLon"), toLat = u.searchParams.get("toLat"), toLon = u.searchParams.get("toLon"), mode = u.searchParams.get("mode") || "driving";
  if (!fromLat || !fromLon || !toLat || !toLon) return badRequest("Provide fromLat, fromLon, toLat, toLon.");
  try {
    const p = new URLSearchParams({ origins: fromLat + "," + fromLon, destinations: toLat + "," + toLon, mode, key });
    const res = await fetch("https://maps.googleapis.com/maps/api/distancematrix/json?" + p);
    const data = await readJson(res), el = data.rows?.[0]?.elements?.[0];
    if (!res.ok || data.status !== "OK" || !el || el.status !== "OK") return providerError("Google Distance Matrix", data.error_message || el?.status || data.status || "HTTP " + res.status);
    return json({ available: true, source: "live", provider: "Google Distance Matrix", distanceKm: Math.round(el.distance.value / 100) / 10, durationMinutes: Math.round(el.duration.value / 60), mode, fetchedAt: new Date().toISOString() });
  } catch (e) { return providerError("Google Distance Matrix", e.message); }
}
