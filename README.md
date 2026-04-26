# ZAVOD

ZAVOD is a static, game-like artist website hosted on GitHub Pages.

## Live

- Repo: `highneken/zavod-site`
- Default branch: `master`
- Pages URL: `https://highneken.github.io/zavod-site/`

## What this site contains

- **Gate** (offline-dino intro)
- **Retro menu** (`INTERFACE`, `SHOP`, `OUTPUT`, `LOG`, `ABOUT`)
- **SHOP / OUTPUT registry experience** for **PERMISSIONLESS**
- **Hidden legacy works** reveal flow

## Important note about the registry

The current registry/claim flow is a **front-end simulation**:

- no wallet connection
- no blockchain transaction
- no mint execution
- no ownership verification

Use it as narrative/prototype UX unless real backend/on-chain integration is added.

## Local development

```bash
git clone https://github.com/highneken/zavod-site.git
cd zavod-site
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy (GitHub Pages)

1. Push to `master`
2. GitHub → **Settings → Pages**
3. Deploy from `master` (root)
4. Optional custom domain via Pages settings + DNS

## Structure

- `index.html` — main app shell + inline UI logic
- `style.css` — main styling
- `psycho.js` — menu typewriter behavior
- `trex-runner.js` / `trex-runner.css` — gate game behavior
- `images/` — artwork assets
- `dino-images/` — gate sprite assets

## Brand rule

Keep claims factual. If something is simulated, label it as simulated.
