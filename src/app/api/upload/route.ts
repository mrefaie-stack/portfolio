import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/server";
import { UPLOADS_DIR } from "@/lib/store";

export const runtime = "nodejs";

const MAX_IMAGE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO = 100 * 1024 * 1024; // 100MB (حد Cloudflare للطلب الواحد)

const IMAGES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const VIDEOS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
};

/**
 * POST /api/upload  (multipart/form-data، الحقل "files")
 * يحفظ الصور/الفيديو في data/uploads ويعيد روابطها /uploads/<name>
 * ?kind=image يقصر القبول على الصور (للغلاف وصور المقالة)
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const imagesOnly = new URL(req.url).searchParams.get("kind") === "image";
  const form = await req.formData();
  const files = [...form.getAll("files"), ...form.getAll("file")].filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "لم يتم اختيار أي ملف" }, { status: 400 });

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const urls: string[] = [];

  for (const file of files) {
    const isImage = file.type in IMAGES;
    const isVideoFile = !imagesOnly && file.type in VIDEOS;
    if (!isImage && !isVideoFile) {
      return NextResponse.json(
        { error: imagesOnly ? `مسموح بالصور فقط هنا (${file.name})` : `نوع الملف غير مدعوم: ${file.type || file.name}` },
        { status: 415 },
      );
    }
    const max = isImage ? MAX_IMAGE : MAX_VIDEO;
    if (file.size > max) {
      return NextResponse.json({ error: `الملف ${file.name} أكبر من ${isImage ? "10MB" : "100MB"}` }, { status: 413 });
    }

    const ext = isImage ? IMAGES[file.type] : VIDEOS[file.type];
    const base = path
      .basename(file.name, path.extname(file.name))
      .toLowerCase()
      .replace(/[^a-z0-9؀-ۿ]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${base ? `-${base}` : ""}.${ext}`;
    await fs.writeFile(path.join(UPLOADS_DIR, name), Buffer.from(await file.arrayBuffer()));
    urls.push(`/uploads/${name}`);
  }

  return NextResponse.json({ urls });
}
