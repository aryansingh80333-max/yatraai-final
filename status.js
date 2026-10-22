const { json } = require("./_utils");
exports.handler = async () => {
  const services = {
    llm: { label: "AI Planning (Anthropic Claude)", configured: !!process.env.ANTHROPIC_API_KEY, requiredEnv: ["ANTHROPIC_API_KEY"] },
    weather: { label: "Weather (OpenWeatherMap)", configured: !!process.env.OPENWEATHER_API_KEY, requiredEnv: ["OPENWEATHER_API_KEY"] },
    maps: { label: "Maps / Places / Routes (Google Maps Platform)", configured: !!process.env.GOOGLE_MAPS_API_KEY, requiredEnv: ["GOOGLE_MAPS_API_KEY"] },
    flights: { label: "Flights (Amadeus)", configured: !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET), requiredEnv: ["AMADEUS_API_KEY", "AMADEUS_API_SECRET"] },
    hotels: { label: "Hotels (Amadeus)", configured: !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET), requiredEnv: ["AMADEUS_API_KEY", "AMADEUS_API_SECRET"] }
  };
  return json(200, { available: true, note: "configured=true means the credential is present server-side.", services, checkedAt: new Date().toISOString() });
};
