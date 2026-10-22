import { json, options, missing, providerError, badRequest, readJson, getAmadeusToken } from "./_utils.js";
export async function onRequest({ request, env }) {
  const opt = options(request); if (opt) return opt;
  const u = new URL(request.url), cityCode = u.searchParams.get("cityCode"), checkIn = u.searchParams.get("checkIn"), checkOut = u.searchParams.get("checkOut"), adults = u.searchParams.get("adults") || "1";
  if (!cityCode || !checkIn || !checkOut) return badRequest("Provide cityCode, checkIn, checkOut (YYYY-MM-DD).");
  const auth = await getAmadeusToken(env);
  if (auth.error === "missing_credentials") return missing("Hotel service (Amadeus)", ["AMADEUS_API_KEY", "AMADEUS_API_SECRET"]);
  if (auth.error) return providerError("Amadeus auth", auth.detail);
  try {
    const base = "https://test.api.amadeus.com", headers = { Authorization: "Bearer " + auth.token };
    const listRes = await fetch(base + "/v1/reference-data/locations/hotels/by-city?cityCode=" + encodeURIComponent(cityCode.toUpperCase()), { headers });
    const list = await readJson(listRes); if (!listRes.ok) return providerError("Amadeus Hotel List", list.errors?.[0]?.detail || "HTTP " + listRes.status);
    const ids = (list.data || []).slice(0, 10).map(h => h.hotelId).join(",");
    if (!ids) return json({ available: true, source: "sandbox", provider: "Amadeus (test environment)", offers: [], note: "No hotels found in test dataset for this city code." });
    const offersRes = await fetch(base + "/v3/shopping/hotel-offers?" + new URLSearchParams({ hotelIds: ids, checkInDate: checkIn, checkOutDate: checkOut, adults }), { headers });
    const data = await readJson(offersRes); if (!offersRes.ok) return providerError("Amadeus Hotel Offers", data.errors?.[0]?.detail || "HTTP " + offersRes.status);
    const offers = (data.data || []).map(h => ({ property: h.hotel?.name, hotelId: h.hotel?.hotelId, lat: h.hotel?.latitude, lon: h.hotel?.longitude, priceTotal: h.offers?.[0]?.price?.total, currency: h.offers?.[0]?.price?.currency, roomType: h.offers?.[0]?.room?.typeEstimated?.category || null, cancellation: h.offers?.[0]?.policies?.cancellations?.[0]?.description?.text || null }));
    return json({ available: true, source: "sandbox", provider: "Amadeus (test environment)", offers, fetchedAt: new Date().toISOString() });
  } catch (e) { return providerError("Amadeus Hotels", e.message); }
}
