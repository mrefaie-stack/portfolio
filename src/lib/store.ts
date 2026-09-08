import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * تخزين بسيط على ملفات JSON داخل مجلد content/.
 * كل الكتابات لملف واحد تتم بالتسلسل (mutex بسيط) وبشكل atomic (tmp ثم rename).
 * لاستبداله بقاعدة بيانات لاحقاً، عدّل هذا الملف فقط.
 */
export const CONTENT_DIR = path.join(process.cwd(), "content");
export const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

const locks = new Map<string, Promise<unknown>>();

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(key, next.catch(() => {}));
  return next;
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  const full = path.join(CONTENT_DIR, file);
  try {
    const raw = await fs.readFile(full, "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
}

export async function writeJson<T>(file: string, data: T): Promise<void> {
  return withLock(file, async () => {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    const full = path.join(CONTENT_DIR, file);
    const tmp = `${full}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, full);
  });
}

/** قراءة → تعديل → كتابة داخل نفس القفل لتفادي سباق الكتابة */
export async function updateJson<T>(file: string, fallback: T, mutate: (current: T) => T | Promise<T>): Promise<T> {
  return withLock(file, async () => {
    const current = await readJson<T>(file, fallback);
    const next = await mutate(current);
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    const full = path.join(CONTENT_DIR, file);
    const tmp = `${full}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(tmp, full);
    return next;
  });
}
