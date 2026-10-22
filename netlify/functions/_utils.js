const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};
function json(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}
function missingCredentials(serviceName, envVarNames) {
  return json(503, {
    available: false,
    reason: `${serviceName} is not configured on the server. Missing environment variable(s): ${envVarNames.join(", ")}. See SETUP_REQUIRED.md.`,
    configured: false
  });
}
function providerError(serviceName, detail) {
  return json(502, { available: false, reason: `${serviceName} request failed: ${detail || "the provider returned an error"}.`, configured: true });
}
function badRequest(message) {
  return json(400, { available: false, reason: message });
}
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}
module.exports = { json, missingCredentials, providerError, badRequest, fetchWithTimeout, CORS_HEADERS };
