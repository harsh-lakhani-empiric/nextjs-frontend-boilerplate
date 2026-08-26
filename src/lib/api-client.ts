import { apiError } from "@/lib/errors";

function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Server-side (Server Components, Server Actions, Route Handlers): prefer the
    // server-only API_URL so the real backend URL never ships to the browser.
    return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  }
  // Client-side: only NEXT_PUBLIC_* vars are available in the browser bundle.
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

// TODO: type this per your backend's contract. Response types below are `unknown` on purpose —
// this client doesn't assume a shape. Either hand-write types per endpoint, or generate them
// from your backend's OpenAPI spec. The registry's `api-client-typed` pattern provides one
// openapi-typescript-based implementation.
export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw apiError(`Request to ${path} failed with status ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}
