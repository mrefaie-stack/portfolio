/**
 * أدوات الوسائط: ملفات مرفوعة على السيرفر، أو روابط خارجية (Google Drive)
 * تُعرض مباشرة من مصدرها بلا رفع — فنوفّر مساحة السيرفر.
 */
export const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".m4v"];

export type MediaKind = "image" | "video" | "doc";

export const DOC_EXTS = [".pdf"];

export function isExternal(url: string) {
  return /^https?:\/\//i.test(url.trim());
}

/** فيديو بامتداد ملف معروف (سواء مرفوع عندنا أو رابط مباشر) */
export function isVideo(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTS.some((e) => clean.endsWith(e));
}

/** امتداد مستند في رابط مباشر */
export function isDocFile(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  return DOC_EXTS.some((e) => clean.endsWith(e));
}

export function videoMime(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".webm")) return "video/webm";
  if (clean.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

/* ------------------------------------------------------------------
   Google Drive
   ------------------------------------------------------------------ */

/** يستخرج معرّف الملف من أي صيغة رابط Drive (ما عدا المجلدات) */
export function driveFileId(url: string): string | null {
  const u = url.trim();
  if (!/(?:drive|lh3)\.google(?:usercontent)?\.com/.test(u)) return null;
  if (/\/folders\//.test(u)) return null;
  const m =
    /\/file\/d\/([\w-]{10,})/.exec(u) ??
    /lh3\.googleusercontent\.com\/d\/([\w-]{10,})/.exec(u) ??
    /[?&]id=([\w-]{10,})/.exec(u);
  return m ? m[1] : null;
}

/** رابط يحتاج إطاراً مضمّناً (iframe) — مشغّل Drive للفيديو أو المستند */
export function isEmbed(url: string) {
  return /^https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/preview/.test(url.trim());
}

/** مستند (PDF) معروض داخل إطار Drive — نميّزه بعلامة في الرابط */
export function isDoc(url: string) {
  return isEmbed(url) && /[?&]mk=doc\b/.test(url);
}

/** صورة مصغّرة من Drive — تُستخدم كغلاف لمشغّل الفيديو داخل الشبكة */
export function drivePoster(url: string, width = 800): string | null {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w${width}` : null;
}

/**
 * يحوّل الرابط الملصوق إلى رابط عرض مباشر:
 * - صورة Drive → رابط الصورة المصغّرة بعرض كبير (يعمل مع "أي شخص لديه الرابط")
 * - فيديو Drive → رابط المشغّل المضمّن
 * - أي رابط مباشر آخر (jpg/mp4/…) → كما هو
 * يعيد null إذا لم يكن رابطاً صالحاً.
 */
export function normalizeMediaUrl(input: string, kind: MediaKind): string | null {
  const url = input.trim();
  if (!url) return null;

  const id = driveFileId(url);
  if (id) {
    if (kind === "video") return `https://drive.google.com/file/d/${id}/preview`;
    // المستند يُعرض بمعاينة Drive أيضاً، ونضيف علامة لنميّزه عن الفيديو
    if (kind === "doc") return `https://drive.google.com/file/d/${id}/preview?mk=doc`;
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
  }

  if (/drive\.google\.com|docs\.google\.com/.test(url)) return null; // رابط Drive غير صالح (مجلد مثلاً)
  if (!isExternal(url)) return null;
  return url;
}

/**
 * يحوّل رابطاً ملصوقاً إلى رابط عرض جاهز، ويكتشف نوع ملف Drive تلقائياً
 * (صورة أم فيديو) بسؤال الخادم عن اسم الملف. يرمي خطأً برسالة عربية عند الفشل.
 */
export async function resolveMediaLink(input: string): Promise<{ url: string; kind: MediaKind }> {
  const raw = input.trim();
  if (!raw) throw new Error(LINK_ERROR);

  const id = driveFileId(raw);
  if (!id) {
    const kind: MediaKind = isVideo(raw) ? "video" : isDocFile(raw) ? "doc" : "image";
    const url = normalizeMediaUrl(raw, kind);
    if (!url) throw new Error(LINK_ERROR);
    return { url, kind };
  }

  const res = await fetch("/api/drive-probe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: raw }),
  });
  const data = (await res.json().catch(() => ({}))) as { kind?: MediaKind; error?: string };
  if (!res.ok || !data.kind) throw new Error(data.error ?? "تعذّر التعرّف على الملف");

  const url = normalizeMediaUrl(raw, data.kind);
  if (!url) throw new Error(LINK_ERROR);
  return { url, kind: data.kind };
}

/** رسالة الخطأ الموحّدة عند رابط غير مفهوم */
export const LINK_ERROR =
  "الرابط غير مفهوم. الصق رابط ملف من Google Drive (مشارَك بـ «أي شخص لديه الرابط») أو رابطاً مباشراً لصورة أو فيديو أو PDF.";
