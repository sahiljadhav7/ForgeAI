---
name: run-app
description: Launch this Next.js app (production build on port 3100) and drive it with headless Chromium to take screenshots and check landmarks per route. Use when running, screenshotting, or visually verifying a change, including viewport and reduced-motion checks.
---

# Run the app

Work from the repo root. `$SCRATCH` is the session scratchpad directory.

## 1. Build and start

```bash
npm run build
npx next start -p 3100 > "$SCRATCH/server.log" 2>&1 &
timeout 40 bash -c 'until curl -s -o /dev/null http://localhost:3100; do sleep 1; done'
```

The server is up once the curl loop exits. Port 3100 keeps clear of a dev server the user may have on 3000.

If the build fails with `.next/dev/types/validator.ts ... Cannot find module '../../../app/.../page.js'`, a dev server's stale route types still point at a moved or deleted page. Run `rm -rf .next/dev/types` and build again.

## 2. Drive

Set up the driver once per session:

```bash
cp .claude/skills/run-app/drive.mjs "$SCRATCH/"
(cd "$SCRATCH" && npm init -y >/dev/null && npm i playwright-core@1.57 >/dev/null)
```

Run it with the routes to visit:

```bash
(cd "$SCRATCH" && node drive.mjs --size 1440x900 / /sign-in /sign-up)
```

- Flags: `--size WxH` sets the viewport, `--reduced-motion` emulates `prefers-reduced-motion: reduce`, `--base URL` points it at another server, and `--out DIR` sets where screenshots go.
- Output: one JSON line per route with the final URL, HTTP status, `<main>`/`<header>` counts, nested `<main>` count, `main` top offset, page errors, and 4xx/5xx responses.
- Screenshots are saved as `shot_<route>_<WxH>.png` in `$SCRATCH`.

The run is done when every route has its JSON line and you have **looked at** every screenshot with Read. A blank frame means the page failed to render, not that it passed.

## 3. Stop

```bash
fuser -k 3100/tcp; sleep 1; fuser 3100/tcp || echo "port 3100 free"
```

Stopping is done when it prints `port 3100 free`. Run the same command before step 1 too. A leftover server keeps serving the old build, and the new one then dies with `EADDRINUSE` in `server.log` while the curl loop still succeeds against the old server. `lsof` misses the listener on this WSL machine, so use `fuser`.

## Gotchas

- **Clerk keys.** `.env` holds production `pk_live` keys, which Clerk only accepts on `forgeai.lol`. `.env.local` overrides them with development `pk_test` keys, so Clerk's forms, modals and `<PricingTable>` render locally (the build log lists `Environments: .env.local, .env`). If `.env.local` is missing, those widgets render blank and every route's `failed` list shows two `400 https://clerk.forgeai.lol/v1/...` entries. The publishable key is baked in at build time, so rebuild after changing keys.
- **Signing in writes real data.** The first sign-in makes `checkUser` write a user row to the database in `.env`'s `DATABASE_URL` (not overridden in `.env.local`), and a `/workspace` generation spends Gemini credits. Get the user's go-ahead before signing in. Until then, report signed-in routes (`/workspace`, `/projects` always 307 to `/sign-in` when signed out) as unverified.
- **Clerk modals survive hash navigation.** `page.goto("/#pricing")` from `/` keeps the page and any open modal. Use a fresh page or context per check.
- **Arcjet bot detection** (`proxy.ts`) returns 403 to curl's default user agent. For a quick HTML check with curl, pass a browser UA: `-A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"`.
- **Playwright/Chromium version skew.** The cached browser (`~/.cache/ms-playwright/chromium-*`) may not match the installed `playwright-core`. `drive.mjs` launches the cached binary via `executablePath`, so leave `npx playwright install` alone.
