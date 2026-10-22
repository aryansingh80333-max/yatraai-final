# YatraAI live integration deployment

This package contains the updated single-page frontend and the Netlify Functions backend.

## Repository layout

- `index.html` — updated frontend with API tests, live Places results on destination pages, live route-distance checks, and AI-assisted preference interpretation when the AI provider is configured.
- `netlify.toml` — Netlify build/function settings.
- `netlify/functions/` — backend API endpoints.
- `.env.example` — names of the required environment variables only; it contains no credentials.

## Netlify settings

- Branch: `main`
- Base directory: blank
- Build command: blank
- Publish directory: `.`
- Functions directory: `netlify/functions`

These settings match the included `netlify.toml`.

## After deployment

1. Add provider credentials through Netlify's Environment variables UI. Never commit real keys to GitHub or put them in `index.html`.
2. Redeploy after adding/changing variables.
3. Open `/.netlify/functions/status` on the new site.
4. Open the Smart Tourism section and use **Test all endpoints**. It tests status, weather, places, routes, flights, hotels and AI planning.
5. Open a destination detail page to see live nearby places (if Google Places is configured). Use **Check live road distances** in the route builder to query live route distances (if Google Distance Matrix is configured).

## Important limitations

- The daily itinerary structure is built from YatraAI's curated destination data. When the configured AI service responds, it helps interpret preferences and select a destination; this does not mean each attraction/time/price is generated from live data.
- Flight and hotel functions use Amadeus's test environment and do not provide guaranteed live, bookable inventory.
- Destination scores, sustainability scores and some route ordering remain rule-based estimates and are labelled accordingly.
