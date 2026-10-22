const { json, missingCredentials, providerError, badRequest, fetchWithTimeout } = require("./_utils");
const SYSTEM_PROMPT = `You are YatraAI's trip-planning assistant. You convert a traveller's natural-language request into structured preferences AND pick the best-matching destination(s) from the catalog provided to you.

Rules:
- ONLY recommend destinations that appear in the provided catalog, using their exact "key" field.
- NEVER invent flight prices, hotel prices, live availability, live weather, or bookings.
- If required information is missing, ask ONE short clarifying question instead of guessing.
- Respond with ONLY a single JSON object, no prose, no markdown fences, matching exactly this shape:
{
  "needsClarification": boolean,
  "clarifyingQuestion": string or null,
  "destinationKey": string or null,
  "duration": one of ["weekend","3-5","6-8","9-14","15+"] or null,
  "budget": one of ["5-10k","10-25k","25-50k","50k+"] or null,
  "styles": array of any of ["heritage","adventure","nature","food","relaxation","spiritual","wildlife","culture","photography"],
  "group": one of ["solo","couple","family","friends","group"] or null,
  "pace": one of ["relaxed","balanced","packed"] or null,
  "explanation": a short (1-2 sentence) human-readable explanation of the recommendation
}`;
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST") return badRequest("Use POST with a JSON body.");
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return missingCredentials("AI planning service (Anthropic Claude)", ["ANTHROPIC_API_KEY"]);
  let payload;
  try { payload = JSON.parse(event.body || "{}"); } catch { return badRequest("Body must be valid JSON."); }
  const { message, destinationCatalog } = payload;
  if (!message) return badRequest("Provide a 'message' field.");
  if (!Array.isArray(destinationCatalog) || !destinationCatalog.length) return badRequest("Provide 'destinationCatalog'.");
  try {
    const res = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 500, system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Destination catalog:\n${JSON.stringify(destinationCatalog)}\n\nTraveller request:\n${message}` }]
      })
    }, 15000);
    const data = await res.json();
    if (!res.ok) return providerError("Anthropic Claude API", data.error?.message || `HTTP ${res.status}`);
    const textBlock = (data.content || []).find(b => b.type === "text");
    if (!textBlock) return providerError("Anthropic Claude API", "no text response returned");
    let parsed;
    try { parsed = JSON.parse(textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "")); }
    catch { return providerError("Anthropic Claude API", "response was not valid JSON"); }
    return json(200, { available: true, source: "live", provider: "Anthropic Claude", ...parsed, fetchedAt: new Date().toISOString() });
  } catch (e) {
    return providerError("Anthropic Claude API", e.name === "AbortError" ? "the provider timed out" : e.message);
  }
};
