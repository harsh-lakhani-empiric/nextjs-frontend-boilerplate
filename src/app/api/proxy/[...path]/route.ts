import type { NextRequest } from "next/server";

/**
 * EXAMPLE-ONLY pass-through proxy. Hides the real backend URL from the browser and sidesteps
 * CORS (the request looks same-origin to the client). Forwards GET only — add the other HTTP
 * methods the same way if you need them.
 *
 * Defaults to https://httpbin.org for the smoke test acceptance check in step 07 of the build
 * sequence (httpbin.org is occasionally flaky/down — https://httpbingo.org is an API-compatible
 * mirror if you need a live target to test against). Replace EXTERNAL_API_URL with your real
 * backend before shipping, and delete this comment block.
 */
const EXTERNAL_API_URL = process.env.API_URL ?? "https://httpbin.org";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${EXTERNAL_API_URL}/${path.join("/")}${request.nextUrl.search}`;

  const response = await fetch(url);

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
