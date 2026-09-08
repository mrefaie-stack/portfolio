import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/server";
import { UPLOADS_DIR } from "@/lib/store";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB لكل صورة
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/**
 * POST /api/upload  (multipart/form-data, الحقل "files" أو "file")
 * يحفظ الصور في data/uploads ويعيد روابطها /uploads/<name>
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const form = await req.formData();
  const files = [...form.getAll("files"), ...form.getAll("file")].filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "لم يتم اختيار أي ملف" }, { status: 400 });

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const urls: string[] = [];

  for (const file of files) {
    const ext = ALLOWED[file.type];
    if (!ext) return NextResponse.json({ error: `نوع الملف غير مدعوم: ${file.type || file.name}` }, { status: 415 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: `الملف ${file.name} أكبر من 10MB` }, { status: 413 });

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
