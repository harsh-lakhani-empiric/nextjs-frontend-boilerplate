import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

type CookieOptions = Partial<Omit<ResponseCookie, "name" | "value">>;

export const secureCookieDefaults: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export async function setCookie(name: string, value: string, options?: CookieOptions): Promise<void> {
  const store = await cookies();
  store.set(name, value, { ...secureCookieDefaults, ...options });
}

export async function getCookie(name: string): Promise<string | undefined> {
  const store = await cookies();
  return store.get(name)?.value;
}

export async function deleteCookie(name: string): Promise<void> {
  const store = await cookies();
  store.delete(name);
}
