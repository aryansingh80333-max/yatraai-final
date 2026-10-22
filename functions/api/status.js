import { json, options } from "./_utils.js";
export async function onRequest({ request, env }) {
  const opt = options(request); if (opt) return opt;
  const services = {
    llm: { label: "AI Planning (Anthropic Claude)", configured: !!env.ANTHROPIC_API_KEY, requiredEnv: ["ANTHROPIC_API_KEY"] },
    weather: { label: "Weather (OpenWeatherMap)", configured: !!env.OPENWEATHER_API_KEY, requiredEnv: ["OPENWEATHER_API_KEY"] },
    maps: { label: "Maps / Places / Routes (Google Maps Platform)", configured: !!env.GOOGLE_MAPS_API_KEY, requiredEnv: ["GOOGLE_MAPS_API_KEY"] },
    flights: { label: "Flights (Amadeus)", configured: !!(env.AMADEUS_API_KEY && env.AMADEUS_API_SECRET), requiredEnv: ["AMADEUS_API_KEY", "AMADEUS_API_SECRET"] },
    hotels: { label: "Hotels (Amadeus)", configured: !!(env.AMADEUS_API_KEY && env.AMADEUS_API_SECRET), requiredEnv: ["AMADEUS_API_KEY", "AMADEUS_API_SECRET"] }
  };
  return json({ available: true, note: "configured=true means the credential is present server-side.", services, checkedAt: new Date().toISOString() });
}
