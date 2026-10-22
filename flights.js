const { json, missingCredentials, providerError, badRequest, fetchWithTimeout } = require("./_utils");
const { getAmadeusToken, AMADEUS_HOST } = require("./_amadeus");
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  const { origin, destination, date, adults, returnDate, travelClass } = event.queryStringParameters || {};
  if (!origin || !destination || !date) return badRequest("Provide origin, destination (IATA codes) and date (YYYY-MM-DD).");
  const auth = await getAmadeusToken();
  if (auth.error === "missing_credentials") return missingCredentials("Flight service (Amadeus)", ["AMADEUS_API_KEY", "AMADEUS_API_SECRET"]);
  if (auth.error) return providerError("Amadeus auth", auth.detail);
  try {
    const params = new URLSearchParams({ originLocationCode: origin.toUpperCase(), destinationLocationCode: destination.toUpperCase(), departureDate: date, adults: adults || "1", max: "8", currencyCode: "INR" });
    if (returnDate) params.set("returnDate", returnDate);
    if (travelClass) params.set("travelClass", travelClass.toUpperCase());
    const res = await fetchWithTimeout(`${AMADEUS_HOST}/v2/shopping/flight-offers?${params.toString()}`, { headers: { Authorization: `Bearer ${auth.token}` } });
    const data = await res.json();
    if (!res.ok) return providerError("Amadeus Flight Offers", data.errors?.[0]?.detail || `HTTP ${res.status}`);
    const offers = (data.data || []).map(offer => {
      const itin = offer.itineraries[0];
      const firstSeg = itin.segments[0];
      const lastSeg = itin.segments[itin.segments.length - 1];
      return {
        airline: offer.validatingAirlineCodes?.[0] || firstSeg.carrierCode, flightNumber: `${firstSeg.carrierCode}${firstSeg.number}`,
        departure: firstSeg.departure.at, arrival: lastSeg.arrival.at, durationIso: itin.duration,
        stops: itin.segments.length - 1, priceINR: offer.price?.total, currency: offer.price?.currency
      };
    });
    return json(200, { available: true, source: "sandbox", provider: "Amadeus (test environment — see SETUP_REQUIRED.md)", offers, fetchedAt: new Date().toISOString() });
  } catch (e) {
    return providerError("Amadeus Flight Offers", e.name === "AbortError" ? "the provider timed out" : e.message);
  }
};
