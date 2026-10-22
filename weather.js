const { json, missingCredentials, providerError, badRequest, fetchWithTimeout } = require("./_utils");
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return missingCredentials("Weather service (OpenWeatherMap)", ["OPENWEATHER_API_KEY"]);
  const { lat, lon, name } = event.queryStringParameters || {};
  if ((!lat || !lon) && !name) return badRequest("Provide either lat & lon, or a place name (e.g. ?name=Jaipur,IN).");
  try {
    const url = (lat && lon)
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=metric&appid=${apiKey}`
      : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(name)}&units=metric&appid=${apiKey}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return providerError("OpenWeatherMap", errBody.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return json(200, {
      available: true, source: "live", provider: "OpenWeatherMap", place: data.name,
      tempC: Math.round(data.main?.temp), feelsLikeC: Math.round(data.main?.feels_like),
      condition: data.weather?.[0]?.description || "", humidityPct: data.main?.humidity,
      windKph: data.wind?.speed != null ? Math.round(data.wind.speed * 3.6) : null,
      fetchedAt: new Date().toISOString()
    });
  } catch (e) {
    return providerError("OpenWeatherMap", e.name === "AbortError" ? "the provider timed out" : e.message);
  }
};
