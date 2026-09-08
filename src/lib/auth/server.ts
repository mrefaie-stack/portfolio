import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createToken, verifyToken, SESSION_COOKIE, SESSION_DAYS } from "./session";

export async function isAdmin() {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

/** يُستخدم داخل كل Server Action وكل Route Handler خاص بالداشبورد */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/dashboard/login");
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (expected.length !== input.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ input.charCodeAt(i);
  return diff === 0;
}

export async function startSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
