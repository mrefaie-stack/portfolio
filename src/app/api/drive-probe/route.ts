import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/server";
import { driveFileId, VIDEO_EXTS } from "@/lib/media";

export const runtime = "nodejs";

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".heic", ".heif", ".bmp", ".tif", ".tiff"];

/**
 * POST /api/drive-probe  { url }
 * يفتح صفحة الملف على Drive ويقرأ اسمه من <title> ليعرف إن كان صورة أو فيديو،
 * حتى لا يضطر المستخدم لاختيار النوع يدوياً.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  const id = driveFileId(String(url ?? ""));
  if (!id) return NextResponse.json({ error: "ليس رابط ملف من Google Drive" }, { status: 400 });

  try {
    const res = await fetch(`https://drive.google.com/file/d/${id}/view`, {
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; MilaKnightPortfolio/1.0)" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return NextResponse.json({ error: "تعذّر فتح الملف على Drive" }, { status: 502 });

    const html = await res.text();
    const title = /<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? "";
    // "tower design 3.mp4 - Google Drive" → "tower design 3.mp4"
    // Drive يستخدم مسافة غير قابلة للكسر داخل "Google Drive"
    const name = title
      .replace(/ /g, " ")
      .replace(/\s*[-–]\s*Google Drive\s*$/i, "")
      .trim();
    const lower = name.toLowerCase();

    // صفحة تسجيل الدخول تعني أن الملف غير مشارَك للعامة
    if (!name || /^sign in|^google drive$/i.test(name)) {
      return NextResponse.json(
        { error: "الملف غير مشارَك. افتح «مشاركة» على Drive واختر «أي شخص لديه الرابط»." },
        { status: 403 },
      );
    }

    const kind = VIDEO_EXTS.some((e) => lower.endsWith(e))
      ? "video"
      : IMAGE_EXTS.some((e) => lower.endsWith(e))
        ? "image"
        : null;

    if (!kind) {
      return NextResponse.json({ error: `«${name}» ليس صورة ولا فيديو مدعوماً`, name }, { status: 415 });
    }

    return NextResponse.json({ kind, name, id });
  } catch {
    return NextResponse.json({ error: "تعذّر الوصول إلى Google Drive" }, { status: 502 });
  }
}
