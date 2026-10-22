import { json, options, missing, providerError, badRequest, readJson } from "./_utils.js";
const SYSTEM_PROMPT = `You are YatraAI's trip-planning assistant. Convert the traveller's request into structured preferences and select only destinations from the provided catalog. Never invent live prices, availability, weather, or bookings. If information is missing, ask one short clarifying question. Return only JSON with fields needsClarification, clarifyingQuestion, destinationKey, duration, budget, styles, group, pace, explanation. duration: weekend|3-5|6-8|9-14|15+; budget: 5-10k|10-25k|25-50k|50k+; styles: heritage, adventure, nature, food, relaxation, spiritual, wildlife, culture, photography; group: solo, couple, family, friends, group; pace: relaxed, balanced, packed.`;
export async function onRequest({ request, env }) {
  const opt = options(request); if (opt) return opt;
  if (request.method !== "POST") return badRequest("Use POST with a JSON body.");
  if (!env.ANTHROPIC_API_KEY) return missing("AI planning service (Anthropic Claude)", ["ANTHROPIC_API_KEY"]);
  let payload; try { payload = await request.json(); } catch { return badRequest("Body must be valid JSON."); }
  const { message, destinationCatalog } = payload;
  if (!message) return badRequest("Provide a message field.");
  if (!Array.isArray(destinationCatalog) || !destinationCatalog.length) return badRequest("Provide destinationCatalog.");
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 500, system: SYSTEM_PROMPT, messages: [{ role: "user", content: "Destination catalog:\n" + JSON.stringify(destinationCatalog) + "\n\nTraveller request:\n" + message }] }) });
    const data = await readJson(res);
    if (!res.ok) return providerError("Anthropic Claude API", data.error?.message || "HTTP " + res.status);
    const block = (data.content || []).find(x => x.type === "text");
    if (!block) return providerError("Anthropic Claude API", "no text response returned");
    let parsed; try { parsed = JSON.parse(block.text.trim().replace(/^\x60\x60\x60json\s*|\s*\x60\x60\x60$/g, "")); } catch { return providerError("Anthropic Claude API", "response was not valid JSON"); }
    return json({ available: true, source: "live", provider: "Anthropic Claude", ...parsed, fetchedAt: new Date().toISOString() });
  } catch (e) { return providerError("Anthropic Claude API", e.message); }
}
