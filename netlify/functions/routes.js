const { json, missingCredentials, providerError, badRequest, fetchWithTimeout } = require("./_utils");
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return missingCredentials("Route service (Google Distance Matrix)", ["GOOGLE_MAPS_API_KEY"]);
  const { fromLat, fromLon, toLat, toLon, mode } = event.queryStringParameters || {};
  if (!fromLat || !fromLon || !toLat || !toLon) return badRequest("Provide fromLat, fromLon, toLat, toLon.");
  try {
    const params = new URLSearchParams({ origins: `${fromLat},${fromLon}`, destinations: `${toLat},${toLon}`, mode: mode || "driving", key: apiKey });
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
    const res = await fetchWithTimeout(url);
    const data = await res.json();
    const element = data.rows?.[0]?.elements?.[0];
    if (!res.ok || data.status !== "OK" || !element || element.status !== "OK") {
      return providerError("Google Distance Matrix", data.error_message || element?.status || data.status || `HTTP ${res.status}`);
    }
    return json(200, {
      available: true, source: "live", provider: "Google Distance Matrix",
      distanceKm: Math.round(element.distance.value / 100) / 10, durationMinutes: Math.round(element.duration.value / 60),
      mode: mode || "driving", fetchedAt: new Date().toISOString()
    });
  } catch (e) {
    return providerError("Google Distance Matrix", e.name === "AbortError" ? "the provider timed out" : e.message);
  }
};
