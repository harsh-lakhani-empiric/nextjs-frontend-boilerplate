# Backend Requirements

Hand this file to whoever owns the backend this frontend talks to. This frontend makes zero
assumptions about backend tech (REST/GraphQL, language, hosting) — these are the pieces it
actually needs from you.

## CORS

- **Allowed origin(s)**: the deployed frontend origin(s), e.g. `https://app.example.com`, plus
  `http://localhost:3000` for local dev. Avoid `Access-Control-Allow-Origin: *` if cookies are
  used — wildcard origins can't be combined with credentials per the CORS spec.
- **Allow credentials**: `true` if using cookie-based auth (required for the browser to send
  cookies on cross-origin requests made with `credentials: "include"`).
- **Allowed methods**: `GET, POST, PUT, PATCH, DELETE, OPTIONS` — narrow to what's actually
  exposed.
- **Allowed headers**: `Content-Type, Authorization` at minimum.

## Cookies (only if the backend owns session cookies)

- `SameSite=None; Secure` — required if frontend and backend are on different origins
  (cross-site), otherwise the browser won't send the cookie at all.
- `SameSite=Lax` is only safe if frontend and backend share a top-level domain, or requests are
  proxied through the frontend's own origin (see "Proxy pattern" below).
- `HttpOnly` always, unless there's a specific reason the frontend needs to read the cookie value
  in JS (session tokens shouldn't be readable from JS).

## Base URL

The frontend expects one backend base URL, available to it as:

- `API_URL` — server-only (Server Components, Server Actions, Route Handlers)
- `NEXT_PUBLIC_API_URL` — exposed to the browser, used for direct client-side fetches

Both should point at the same backend.

## Proxy pattern (optional, frontend-side)

The frontend can proxy requests through its own origin (`app/api/proxy/[...path]/route.ts`) to
hide the real backend URL and make requests same-origin from the browser's perspective — this
sidesteps CORS and lets cookies use `SameSite=Lax`. This is frontend infra, not something the
backend needs to implement, but it's worth knowing it's an option so cross-origin CORS/cookie
configuration isn't the only path considered.

## Auth handoff

If this backend owns login/sessions (rather than Next.js owning auth), the frontend integrates
via the `external-auth-adapter` registry item (cookie-based or token-based variant) — no backend
changes needed beyond what's already listed above.

## Response shape

Not dictated here — the frontend's `lib/api-client.ts` doesn't hardcode response types. If this
backend exposes an OpenAPI spec, we can generate frontend types from it instead of hand-writing
them; let us know if one exists.
