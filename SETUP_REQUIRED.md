# YatraAI — SETUP REQUIRED

Nothing here fabricates data. Every live feature shows an honest "not connected"
state until you complete its setup below. Add credentials one at a time.

## 0. Deploy the backend (do this first)

1. Add `netlify.toml`, `package.json`, and the `netlify/functions/` folder to your
   site's deployed folder/repo (alongside the existing `index.html`).
2. Git-based deploy: commit and push — Netlify auto-detects `netlify.toml`.
   Drag-and-drop deploy: re-upload the whole folder structure, not just index.html.
3. Netlify → Site configuration → Environment variables → add keys as you get them.
   **Never put real keys in index.html or any file sent to the browser.**
4. After adding/changing env vars: Netlify → Deploys → Trigger deploy → Clear cache
   and deploy site. Env var changes need a new deploy to take effect.
5. Verify the backend is live: open `https://bharatyatrai.netlify.app/.netlify/functions/status`
   in a browser. Should show JSON with all services `"configured": false` initially.

## 1. AI Planner + Concierge — Anthropic Claude
- Sign up: https://console.anthropic.com → API Keys → Create Key
- Env var: `ANTHROPIC_API_KEY`
- Billing: pay-as-you-go, small free credit on new accounts
- Test: POST to `/.netlify/functions/llm-plan` with `{"message":"5 days from Delhi, heritage and food","destinationCatalog":[{"key":"rajasthan","name":"Rajasthan","tags":["heritage","food"]}]}`

## 2. Weather — OpenWeatherMap
- Sign up: https://openweathermap.org/api → My API Keys
- Env var: `OPENWEATHER_API_KEY`
- Billing: free tier, 1,000 calls/day, no card. New keys take up to ~2 hrs to activate.
- Test: `/.netlify/functions/weather?name=Jaipur,IN`

## 3. Maps / Places / Routes — Google Maps Platform
- Sign up: https://console.cloud.google.com/google/maps-apis
- Enable BOTH: "Places API" and "Distance Matrix API" (APIs & Services → Library)
- Credentials → Create Credentials → API key
- Env var: `GOOGLE_MAPS_API_KEY`
- Billing: **requires a card on file** (Google gives ~$200/month free credit)
- Security: restrict the key to only those two APIs
- Test: `/.netlify/functions/places?query=attractions in Jaipur`

## 4. Flights + Hotels — Amadeus for Developers
- Sign up: https://developers.amadeus.com/register → create an app
- Env vars: `AMADEUS_API_KEY` and `AMADEUS_API_SECRET` (both required)
- Billing: free test-environment tier, no card
- **Honesty note:** new apps use `test.api.amadeus.com` — realistic but NOT real
  bookable data. Functions already label this `"source":"sandbox"`. Real production
  access requires separate manual approval from Amadeus.
- Test flights: `/.netlify/functions/flights?origin=DEL&destination=BOM&date=2026-06-15`
- Test hotels: `/.netlify/functions/hotels?cityCode=JAI&checkIn=2026-06-15&checkOut=2026-06-18`

## 5. Verify
1. `/.netlify/functions/status` shows `configured:true` for services you've set up.
2. The System Status panel (Smart Tourism page) reads this same endpoint automatically.
3. Actually use each feature once (open a destination page, try the Concierge) to
   confirm real data comes back, not just that the key is present.

## 6. What stays simulated regardless
Destination descriptions, AI Match scores, the Compare tool's 1-5 ratings, and the
Responsible Traveller Score are all illustrative/rule-based by design — not live
data — and should stay labelled as such even once everything above is connected.
