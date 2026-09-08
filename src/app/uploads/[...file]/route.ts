import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { UPLOADS_DIR } from "@/lib/store";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

/**
 * GET /uploads/<name> — يقدّم الصور والفيديو من data/uploads مع دعم Range (ضروري للفيديو وخاصة Safari).
 * (لا نستخدم public/ لأن الملفات المضافة بعد البناء لا تُقدَّم بشكل موثوق في الإنتاج)
 */
export async function GET(req: Request, ctx: { params: Promise<{ file: string[] }> }) {
  const { file } = await ctx.params;
  if (file.length !== 1) return new Response("Not found", { status: 404 });
  const name = file[0];
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    return new Response("Not found", { status: 404 });
  }
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  const full = path.join(UPLOADS_DIR, name);
  let size: number;
  try {
    const st = await fs.stat(full);
    if (!st.isFile()) throw new Error("not file");
    size = st.size;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = req.headers.get("range");
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!m) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
    const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    const stream = Readable.toWeb(createReadStream(full, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const stream = Readable.toWeb(createReadStream(full)) as ReadableStream;
  return new Response(stream, { headers: { ...headers, "Content-Length": String(size) } });
}
