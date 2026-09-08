/**
 * جلسة الأدمن: كوكي HttpOnly موقّع بـ HMAC-SHA256 عبر Web Crypto.
 * هذا الملف خالٍ من واجهات Node حتى يعمل في proxy.ts (Edge) وفي الخادم معاً.
 */
export const SESSION_COOKIE = "mk_admin";
export const SESSION_DAYS = 7;

const enc = new TextEncoder();

function secret() {
  return process.env.SESSION_SECRET || "dev-only-secret-change-me-in-env-local";
}

function toB64url(bytes: ArrayBuffer) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return toB64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export async function createToken(days = SESSION_DAYS) {
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload = `${exp}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifyToken(token: string | undefined | null) {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await sign(payload);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
