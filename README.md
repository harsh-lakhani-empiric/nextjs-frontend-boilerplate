# nextjs-frontend-boilerplate

Frontend-only Next.js starter — App Router, TypeScript, Turbopack. Assumes zero backend
ownership: the backend can be a separate Node/Express service, a third-party API, or another
team's service.

This is one piece of a 3-part boilerplate system:

1. **This repo (Starter Repo A)** — frontend-only baseline. No UI components, no forms setup,
   no optional modules pre-installed.
2. **Starter Repo B** (`nextjs-fullstack-boilerplate`) — everything here, plus Next.js's own
   Route Handlers/Server Actions used as the backend.
3. **Component & Module Registry + Docs** (`nextjs/registry`, `nextjs/docs`) — every UI
   primitive, form setup, and optional infra module (auth, db, i18n, storage, email, analytics,
   monitoring, payments, redis) lives there, pulled à la carte via
   `pnpm dlx shadcn@latest add @boilerplate/<item>` against a custom `registry.json`. See the
   [documentation](https://nextjs-docusauras-six.vercel.app/docs/getting-started/install-steps)
   for exact installation steps.

`components/ui/` in this repo starts empty on purpose — it's the landing spot for registry
pulls, not a place to hand-write primitives.

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in real values
pnpm dev
```

Node version is pinned in `.nvmrc` (20.18.0+). Package manager is pnpm (documented/tested
default — npm works too via the registry CLI's auto-detect, just isn't the verified path here).

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Generate Next.js route types, then run `tsc --noEmit` |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | E2E tests (Playwright) |

`pnpm typecheck` is safe on a fresh clone: it generates the gitignored Next.js route helpers in
`.next/types/` before TypeScript checks the project.

## Environment variables

Validated at runtime via `src/lib/env.ts` (Zod) — the app fails loud at boot if a required var
is missing or malformed. See `.env.example` for the full list; `NEXT_PUBLIC_*` vars are exposed
to the browser, everything else is server-only.

## Folder structure

```
src/
  app/               # routes
  components/ui/     # empty — registry pulls land here
  components/shared/ # hand-written, app-specific components
  lib/                # api-client, utils, env, dal
  hooks/
  types/
  config/
```

## Backend compatibility (implementation)

- `lib/api-client.ts` — `apiFetch<T>()`, a typed fetch wrapper. Base URL comes from `API_URL`
  (server-only, preferred server-side) or `NEXT_PUBLIC_API_URL` (browser-side, only option
  client-side). Response types are dev-supplied (`T` defaults to `unknown`) — see the `TODO`
  comment in the file for hand-writing vs. OpenAPI-codegen options.
- `app/api/proxy/[...path]/route.ts` — **example-only** pass-through proxy (GET only), defaults to
  `https://httpbin.org` as a development endpoint. Replace `EXTERNAL_API_URL` with your real
  backend, or delete the file if you're using direct client fetch instead.
- `lib/auth/` — intentionally empty (`.gitkeep` only). This repo doesn't ship Better Auth (that's
  Repo B, since it needs Next.js to own auth). Pull the registry's `external-auth-adapter` item
  (cookie-based or token-based variant) into this folder once you know which one your backend
  needs.
- `BACKEND-REQUIREMENTS.md` at the repo root — hand this to whoever owns the backend: CORS
  origins, credentials flag, cookie settings, base URL contract.

### Two connection patterns

1. **Direct client fetch** — simplest. Call `apiFetch()` (or plain `fetch`) straight from a
   Client Component. Requires the backend to allow CORS (`Access-Control-Allow-Origin` for your
   frontend origin, plus `Access-Control-Allow-Credentials` if using cookies).
2. **Proxy via Route Handler** — call your own `/api/proxy/...` instead. The browser sees a
   same-origin request (no CORS needed, cookies can use `SameSite=Lax`), and the real backend URL
   never reaches the client. This is infra glue living in the frontend, not backend business
   logic — see `app/api/proxy/[...path]/route.ts`.

## Backend compatibility (architecture)

No backend tech is dictated, but connecting to whatever backend you have is documented:

- **Direct client fetch** — simplest; backend must allow CORS (with credentials if using
  cookies).
- **Proxy via Route Handler** — a couple of thin pass-through Route Handlers can hide the real
  backend URL from the browser and sidestep CORS (same-origin from the browser's view). Infra
  glue, not business logic.
- **Auth** — if the backend owns login/sessions, pull the `external-auth-adapter` registry item
  (cookie-based or token-based variant) instead of a full auth module.

CORS/cookie configuration (`Access-Control-Allow-Origin`, `Allow-Credentials`, cookie
`SameSite`/`Secure`) is a backend-side requirement — this repo can't solve it from the frontend
alone.

## Error handling

- `app/error.tsx` / `app/global-error.tsx` — route-level and root-layout error boundaries.
- `app/not-found.tsx`, `app/loading.tsx` — 404 and Suspense fallback.
- `lib/errors.ts` — typed `AppError`/`ValidationError`/`ApiError` classes plus
  `toErrorResponse()`, a mapper for Route Handlers/Server Actions to turn thrown errors into a
  consistent response shape.
- `lib/logger.ts` — console-backed logger with a swappable sink (`setLogSink`) so the registry's
  `sentry-monitoring` integration can be plugged in later without touching call sites.

## Security

- `proxy.ts` — Next 16 native CSP nonce support. A fresh nonce is generated per request, set on
  the `Content-Security-Policy` header, and auto-injected into framework/page scripts and any
  `<Script nonce>`. No third-party CSP library used.
- **Tradeoff**: nonce-based CSP requires dynamic rendering for any page that needs the nonce
  applied (see `connection()` in Next's docs) — this disables ISR/PPR and CDN caching for those
  pages. For static-heavy apps that can't afford that, the alternative is Next's experimental
  Subresource Integrity (SRI) mode (`experimental.sri.algorithm` in `next.config.ts`), which
  keeps static generation intact by hashing script files at build time instead of using nonces.
  Not implemented here — pick one based on how much of the app needs to stay static.
- `lib/cookies.ts` — cookie helpers defaulting to `httpOnly: true`, `secure` in production,
  `sameSite: "lax"`.
- `.github/dependabot.yml` — zero-config weekly dependency updates (npm + GitHub Actions). Swap
  for [Renovate](https://docs.renovatebot.com/) if you need custom scheduling/grouping.

## UI config

Tailwind v4 (CSS-first, `@theme` in `src/app/globals.css`) and `lib/utils.ts`'s `cn()` helper are
set up, but **no components are installed** — `components/ui/` stays empty on purpose. This repo
is already initialized for shadcn and configured to use the deployed registry. Do not run
`shadcn init` or `shadcn registry add` in this starter; add the items you need directly:

```bash
pnpm dlx shadcn@latest add @boilerplate/button @boilerplate/input
```

`components.json` holds the config that makes this work — path aliases, the Tailwind CSS entry
point, and the deployed `@boilerplate` registry namespace. Keep it in the project because every
future `shadcn add` command reads that file.

Pulled components land in `components/ui/` (and `components/forms/`, `lib/`) and are rethemed
onto the OKLCH tokens in `globals.css` — change `--primary` there and every pulled component
follows. Transitive registry dependencies resolve automatically: pulling `form-rhf-zod` also
brings `form-field`, `button`, `input`, `label` and the rest.

## SEO

- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.json` — working templates, driven by
  `config/site.ts`.
- `lib/metadata.ts` — `buildMetadata()` builds a consistent `Metadata` object (title, description,
  canonical, Open Graph, Twitter card) so pages don't hand-roll each field. Root layout sets the
  title template (`%s | ${siteConfig.name}`); pages just pass a `title`. Note: Next.js doesn't
  apply a layout's title template to a page in the *same* route segment — see `app/about/page.tsx`
  for a working example (`app/page.tsx` shows the untemplated case, since it shares the root
  segment with the layout).
- `app/opengraph-image.tsx` — generated OG image example via `next/og`.

## Testing

- **Vitest + React Testing Library** — unit/component tests. Config in `vitest.config.mts`,
  examples in `__tests__/` (`utils.test.ts` for a plain function, `not-found.test.tsx` for a
  synchronous component). Vitest can't render `async` Server Components — that's what Playwright
  is for.
- **Playwright** — E2E, default tier (not optional) since it's the only way to cover `async`
  Server Components. Config in `playwright.config.ts`, example in `e2e/smoke.spec.ts`. Starts its
  own dev server against `pnpm dev`.

```bash
pnpm test        # vitest
pnpm test:e2e    # playwright (needs browsers: pnpm exec playwright install)
```

## Code quality

No Git-hook manager is installed. Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` explicitly
before opening a pull request; CI runs the same checks for every change.

## CI/CD

`.github/workflows/ci.yml` — `lint`, `typecheck`, and `test` run in parallel; `build` runs once
those three pass (caches `.next/cache` keyed on the lockfile + `src/`); `e2e` runs after `build`,
rebuilds (cache-assisted) and runs Playwright against the production `output: standalone` server,
uploading the HTML report as an artifact on failure. Provider-agnostic in spirit — porting to
GitLab CI or Azure DevOps means translating the same 5 jobs and the pnpm/Node caching step; both
have first-party pnpm+Node cache actions/templates, no fundamental blocker either way.

## Docker

3-stage `Dockerfile` (`deps` → `builder` → `runner`), `node:20-alpine`, `output: "standalone"` in
`next.config.ts`. `pnpm build` auto-copies `public/` and `.next/static` into `.next/standalone`
via a `postbuild` script, so `node .next/standalone/server.js` (the `start` script) and the Docker
image both boot the same way — **not** `next start`, which doesn't work once `output: "standalone"`
is set.

```bash
docker build -t nextjs-frontend-boilerplate .
docker run -p 3000:3000 nextjs-frontend-boilerplate
```

`docker-compose.yml` runs the app alone by default; DB/Redis services are stubbed out in comments,
ready to uncomment once those registry modules are pulled in.

Note: `next/font/google` fetches font files at build time, so both CI and Docker builds need
network access during `pnpm build` — no way around this without switching to local/self-hosted
fonts.

**Package manager pin**: `packageManager` is pinned to `pnpm@10.x`, not the newest pnpm major —
pnpm 11 requires Node 22.13+, and this repo's baseline is Node 20 (`.nvmrc`, Dockerfile base
image). If you bump `.nvmrc`/Dockerfile to Node 22+, pnpm 11 becomes usable again.
