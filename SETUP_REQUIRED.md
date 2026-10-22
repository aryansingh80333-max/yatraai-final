# YatraAI — Cloudflare Pages deployment and API setup

The frontend and server-side API functions now live in this repository. The site uses same-origin routes under `/api/*`; API keys must be saved as encrypted secrets in Cloudflare and must never be added to HTML or committed to Git.

## 1. Create the Cloudflare Pages project

1. Sign in to the Cloudflare dashboard: https://dash.cloudflare.com/
2. Open **Workers & Pages** and choose **Create application → Pages → Connect to Git**.
3. Connect GitHub and select `aryansingh80333-max/yatraai-final`.
4. Use the repository's production branch (usually `main`).
5. Set **Framework preset** to **None**.
6. Leave **Build command** empty and set **Build output directory** to `.` (the repository root).
7. Deploy. Cloudflare Pages should serve `index.html` and build the files in `functions/api/` as Pages Functions.
8. Open the `*.pages.dev` URL shown in the Cloudflare dashboard. Do not delete the old site until the new deployment is tested.

Cloudflare Pages Git integration: https://developers.cloudflare.com/pages/configuration/git-integration/

## 2. Add encrypted API secrets

In **Workers & Pages → your Pages project → Settings → Variables and Secrets**, add each key under the **Production** environment. Choose **Encrypt** for each secret, save, then trigger a new deployment if the dashboard requests it.

| Secret name | Enables | Provider |
|---|---|---|
| `ANTHROPIC_API_KEY` | AI trip planning | https://console.anthropic.com/settings/keys |
| `OPENWEATHER_API_KEY` | Live weather | https://home.openweathermap.org/api_keys |
| `GOOGLE_MAPS_API_KEY` | Places and route-distance lookups | https://console.cloud.google.com/apis/credentials |
| `AMADEUS_API_KEY` | Flight and hotel search | https://developers.amadeus.com/ |
| `AMADEUS_API_SECRET` | Amadeus authentication | https://developers.amadeus.com/ |

Set only the secrets you have obtained. The website should still load when none are configured, but live API features will report that the corresponding provider is not connected. Provider accounts may require enabling products, billing, or approval.

**Security:** Never paste secret values into this repository, `index.html`, screenshots, or chat messages. Keep keys in Cloudflare's encrypted secrets settings only.

Cloudflare secret setup: https://developers.cloudflare.com/pages/functions/bindings/

## 3. Verify the new deployment

Replace `YOUR-PROJECT.pages.dev` with the exact hostname shown by Cloudflare:

- Status: `https://YOUR-PROJECT.pages.dev/api/status`
- Weather test: `https://YOUR-PROJECT.pages.dev/api/weather?name=Jaipur%2CIN`
- Places test: `https://YOUR-PROJECT.pages.dev/api/places?query=attractions%20in%20Jaipur`

The status endpoint should return JSON. Each `configured` flag becomes `true` when the corresponding secret is present in the production runtime. This confirms presence only; it does not prove that the key is valid. Test each service and check its response before treating it as operational.

## 4. Important limits

- Amadeus requests use the **test/sandbox** API host; results are not live bookable inventory.
- Places and route lookup use Google Maps Platform APIs. Enable the APIs required by your Google project and check their current availability and billing requirements.
- Destination descriptions, match scores, comparison ratings, and sustainability scores are illustrative/rule-based features, not live provider data.
- The old Netlify site and GitHub Pages site are not automatically removed. Keep them until the Cloudflare URL and all intended features have been checked.
