const { fetchWithTimeout } = require("./_utils");
const AMADEUS_HOST = "https://test.api.amadeus.com";
async function getAmadeusToken() {
  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;
  if (!apiKey || !apiSecret) return { error: "missing_credentials" };
  try {
    const res = await fetchWithTimeout(`${AMADEUS_HOST}/v1/security/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "client_credentials", client_id: apiKey, client_secret: apiSecret }).toString()
    });
    if (!res.ok) return { error: "auth_failed", detail: `HTTP ${res.status}` };
    const data = await res.json();
    return { token: data.access_token };
  } catch (e) {
    return { error: "auth_failed", detail: e.message };
  }
}
module.exports = { getAmadeusToken, AMADEUS_HOST };
