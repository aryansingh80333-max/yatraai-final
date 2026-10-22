import { json, options, missing, providerError, badRequest, readJson, getAmadeusToken } from "./_utils.js";
export async function onRequest({ request, env }) {
  const opt = options(request); if (opt) return opt;
  const u = new URL(request.url), origin = u.searchParams.get("origin"), destination = u.searchParams.get("destination"), date = u.searchParams.get("date"), adults = u.searchParams.get("adults") || "1", returnDate = u.searchParams.get("returnDate"), travelClass = u.searchParams.get("travelClass");
  if (!origin || !destination || !date) return badRequest("Provide origin, destination (IATA codes) and date (YYYY-MM-DD).");
  const auth = await getAmadeusToken(env);
  if (auth.error === "missing_credentials") return missing("Flight service (Amadeus)", ["AMADEUS_API_KEY", "AMADEUS_API_SECRET"]);
  if (auth.error) return providerError("Amadeus auth", auth.detail);
  try {
    const p = new URLSearchParams({ originLocationCode: origin.toUpperCase(), destinationLocationCode: destination.toUpperCase(), departureDate: date, adults, max: "8", currencyCode: "INR" });
    if (returnDate) p.set("returnDate", returnDate); if (travelClass) p.set("travelClass", travelClass.toUpperCase());
    const res = await fetch("https://test.api.amadeus.com/v2/shopping/flight-offers?" + p, { headers: { Authorization: "Bearer " + auth.token } });
    const data = await readJson(res); if (!res.ok) return providerError("Amadeus Flight Offers", data.errors?.[0]?.detail || "HTTP " + res.status);
    const offers = (data.data || []).map(o => { const it = o.itineraries[0], first = it.segments[0], last = it.segments[it.segments.length - 1]; return { airline: o.validatingAirlineCodes?.[0] || first.carrierCode, flightNumber: first.carrierCode + first.number, departure: first.departure.at, arrival: last.arrival.at, durationIso: it.duration, stops: it.segments.length - 1, priceINR: o.price?.total, currency: o.price?.currency }; });
    return json({ available: true, source: "sandbox", provider: "Amadeus (test environment)", offers, fetchedAt: new Date().toISOString() });
  } catch (e) { return providerError("Amadeus Flight Offers", e.message); }
}
