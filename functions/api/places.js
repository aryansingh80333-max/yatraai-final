import { json, options, missing, providerError, badRequest, readJson } from "./_utils.js";
export async function onRequest({ request, env }) {
  const opt = options(request); if (opt) return opt;
  const key = env.GOOGLE_MAPS_API_KEY;
  if (!key) return missing("Places service (Google Maps Platform)", ["GOOGLE_MAPS_API_KEY"]);
  const u = new URL(request.url), query = u.searchParams.get("query"), lat = u.searchParams.get("lat"), lon = u.searchParams.get("lon");
  if (!query) return badRequest("Provide a ?query= search term, e.g. attractions in Jaipur.");
  try {
    const p = new URLSearchParams({ query, key }); if (lat && lon) p.set("location", lat + "," + lon);
    const res = await fetch("https://maps.googleapis.com/maps/api/place/textsearch/json?" + p);
    const data = await readJson(res);
    if (!res.ok || (data.status && !["OK", "ZERO_RESULTS"].includes(data.status))) return providerError("Google Places", data.error_message || data.status || "HTTP " + res.status);
    const results = (data.results || []).slice(0, 8).map(x => ({ name: x.name, address: x.formatted_address, rating: x.rating ?? null, userRatingsTotal: x.user_ratings_total ?? null, lat: x.geometry?.location?.lat ?? null, lon: x.geometry?.location?.lng ?? null, types: x.types || [] }));
    return json({ available: true, source: "live", provider: "Google Places", results, fetchedAt: new Date().toISOString() });
  } catch (e) { return providerError("Google Places", e.message); }
}
