const { json, missingCredentials, providerError, badRequest, fetchWithTimeout } = require("./_utils");
const { getAmadeusToken, AMADEUS_HOST } = require("./_amadeus");
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  const { cityCode, checkIn, checkOut, adults } = event.queryStringParameters || {};
  if (!cityCode || !checkIn || !checkOut) return badRequest("Provide cityCode, checkIn, checkOut (YYYY-MM-DD).");
  const auth = await getAmadeusToken();
  if (auth.error === "missing_credentials") return missingCredentials("Hotel service (Amadeus)", ["AMADEUS_API_KEY", "AMADEUS_API_SECRET"]);
  if (auth.error) return providerError("Amadeus auth", auth.detail);
  try {
    const listRes = await fetchWithTimeout(`${AMADEUS_HOST}/v1/reference-data/locations/hotels/by-city?cityCode=${encodeURIComponent(cityCode.toUpperCase())}`, { headers: { Authorization: `Bearer ${auth.token}` } });
    const listData = await listRes.json();
    if (!listRes.ok) return providerError("Amadeus Hotel List", listData.errors?.[0]?.detail || `HTTP ${listRes.status}`);
    const hotelIds = (listData.data || []).slice(0, 10).map(h => h.hotelId).join(",");
    if (!hotelIds) return json(200, { available: true, source: "sandbox", provider: "Amadeus (test environment)", offers: [], note: "No hotels found in test dataset for this city code." });
    const offersRes = await fetchWithTimeout(`${AMADEUS_HOST}/v3/shopping/hotel-offers?hotelIds=${hotelIds}&checkInDate=${checkIn}&checkOutDate=${checkOut}&adults=${adults || "1"}`, { headers: { Authorization: `Bearer ${auth.token}` } });
    const offersData = await offersRes.json();
    if (!offersRes.ok) return providerError("Amadeus Hotel Offers", offersData.errors?.[0]?.detail || `HTTP ${offersRes.status}`);
    const offers = (offersData.data || []).map(h => ({
      property: h.hotel?.name, hotelId: h.hotel?.hotelId, lat: h.hotel?.latitude, lon: h.hotel?.longitude,
      priceTotal: h.offers?.[0]?.price?.total, currency: h.offers?.[0]?.price?.currency,
      roomType: h.offers?.[0]?.room?.typeEstimated?.category || null,
      cancellation: h.offers?.[0]?.policies?.cancellations?.[0]?.description?.text || null
    }));
    return json(200, { available: true, source: "sandbox", provider: "Amadeus (test environment — see SETUP_REQUIRED.md)", offers, fetchedAt: new Date().toISOString() });
  } catch (e) {
    return providerError("Amadeus Hotels", e.name === "AbortError" ? "the provider timed out" : e.message);
  }
};
