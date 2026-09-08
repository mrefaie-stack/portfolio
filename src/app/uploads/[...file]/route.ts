import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/store";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

/**
 * GET /uploads/<name> — يقدّم الصور المرفوعة من data/uploads.
 * (لا نستخدم public/ لأن الملفات المضافة بعد البناء لا تُقدَّم بشكل موثوق في الإنتاج)
 */
export async function GET(_req: Request, ctx: { params: Promise<{ file: string[] }> }) {
  const { file } = await ctx.params;
  const name = file.join("/");
  if (!name || name.includes("..") || name.includes("\\") || file.length !== 1) {
    return new Response("Not found", { status: 404 });
  }
  const full = path.join(UPLOADS_DIR, name);
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const data = await fs.readFile(full);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(data.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
