const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};
export function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}
export function badRequest(reason) { return json({ available: false, reason }, 400); }
export function missing(service, names) {
  return json({ available: false, configured: false, reason: service + " is not configured. Missing environment variable(s): " + names.join(", ") }, 503);
}
export function providerError(service, detail) {
  return json({ available: false, configured: true, reason: service + " request failed: " + (detail || "provider returned an error") }, 502);
}
export async function readJson(response) {
  return response.json().catch(() => ({}));
}
export async function getAmadeusToken(env) {
  const key = env.AMADEUS_API_KEY, secret = env.AMADEUS_API_SECRET;
  if (!key || !secret) return { error: "missing_credentials" };
  try {
    const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "client_credentials", client_id: key, client_secret: secret })
    });
    const data = await readJson(res);
    if (!res.ok) return { error: "auth_failed", detail: data.error_description || "HTTP " + res.status };
    return { token: data.access_token };
  } catch (e) { return { error: "auth_failed", detail: e.message }; }
}
export function options(request) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  return null;
}
