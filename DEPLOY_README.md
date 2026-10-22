# YatraAI Netlify deployment bundle

This folder combines the provided YatraAI frontend and serverless backend.

## Deploy
1. Put the contents of this folder in the root of a GitHub repository.
2. In Netlify, choose Add new project / Import an existing project and connect that repository.
3. Build command: leave blank (or `echo "Static site"` if the UI requires one).
4. Publish directory: `.`
5. Functions directory: `netlify/functions` (already configured in `netlify.toml`).
6. Deploy the site.
7. After deployment, open `/.netlify/functions/status` on your site's domain.

## Environment variables
Add these in Netlify Site configuration > Environment variables, only when you have obtained the keys:
- ANTHROPIC_API_KEY
- OPENWEATHER_API_KEY
- GOOGLE_MAPS_API_KEY
- AMADEUS_API_KEY
- AMADEUS_API_SECRET

Never put real API keys in `index.html`, GitHub, or `.env.example`.

## Important
Amadeus functions are configured for the test/sandbox host; they do not provide bookable live inventory.
See SETUP_REQUIRED.md for provider-specific setup and verification.
