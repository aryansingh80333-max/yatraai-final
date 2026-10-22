const { json, missingCredentials, providerError, badRequest, fetchWithTimeout } = require("./_utils");
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return missingCredentials("Places service (Google Maps Platform)", ["GOOGLE_MAPS_API_KEY"]);
  const { query, lat, lon } = event.queryStringParameters || {};
  if (!query) return badRequest("Provide a ?query= search term, e.g. 'attractions in Jaipur'.");
  try {
    const params = new URLSearchParams({ query, key: apiKey });
    if (lat && lon) params.set("location", `${lat},${lon}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;
    const res = await fetchWithTimeout(url);
    const data = await res.json();
    if (!res.ok || (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS")) {
      return providerError("Google Places", data.error_message || data.status || `HTTP ${res.status}`);
    }
    const results = (data.results || []).slice(0, 8).map(p => ({
      name: p.name, address: p.formatted_address, rating: p.rating ?? null,
      userRatingsTotal: p.user_ratings_total ?? null, lat: p.geometry?.location?.lat ?? null,
      lon: p.geometry?.location?.lng ?? null, types: p.types || []
    }));
    return json(200, { available: true, source: "live", provider: "Google Places", results, fetchedAt: new Date().toISOString() });
  } catch (e) {
    return providerError("Google Places", e.name === "AbortError" ? "the provider timed out" : e.message);
  }
};
