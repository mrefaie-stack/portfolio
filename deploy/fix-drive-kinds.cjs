/**
 * يصلّح روابط Google Drive التي حُفظت بنوع خاطئ (فيديو خُزّن كصورة مصغّرة ثابتة).
 * يفحص كل رابط Drive في content/portfolios.json و settings.json، يقرأ اسم الملف
 * من Drive ليعرف نوعه الحقيقي، ثم يعيد كتابة الرابط بالشكل الصحيح.
 *
 *   node deploy/fix-drive-kinds.cjs          # عرض ما سيتغيّر فقط
 *   node deploy/fix-drive-kinds.cjs --apply  # تطبيق التغييرات
 */
const fs = require("fs");
const path = require("path");

const APPLY = process.argv.includes("--apply");
const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".m4v"];
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".heic", ".heif", ".bmp", ".tif", ".tiff"];

function driveId(url) {
  if (typeof url !== "string") return null;
  if (!/(?:drive|lh3)\.google(?:usercontent)?\.com/.test(url)) return null;
  if (/\/folders\//.test(url)) return null;
  const m =
    /\/file\/d\/([\w-]{10,})/.exec(url) ||
    /lh3\.googleusercontent\.com\/d\/([\w-]{10,})/.exec(url) ||
    /[?&]id=([\w-]{10,})/.exec(url);
  return m ? m[1] : null;
}

const cache = new Map();
async function kindOf(id) {
  if (cache.has(id)) return cache.get(id);
  const res = await fetch(`https://drive.google.com/file/d/${id}/view`, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; MilaKnightPortfolio/1.0)" },
  });
  const html = await res.text();
  const title = (/<title>([^<]*)<\/title>/i.exec(html) || [, ""])[1];
  const name = title.replace(/\s*-\s*Google Drive\s*$/i, "").trim();
  const lower = name.toLowerCase();
  const kind = VIDEO_EXTS.some((e) => lower.endsWith(e))
    ? "video"
    : IMAGE_EXTS.some((e) => lower.endsWith(e))
      ? "image"
      : null;
  const out = { kind, name };
  cache.set(id, out);
  return out;
}

const urlFor = (id, kind) =>
  kind === "video"
    ? `https://drive.google.com/file/d/${id}/preview`
    : `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;

let changes = 0;
let skipped = 0;

async function fixUrl(url, where) {
  const id = driveId(url);
  if (!id) return url;
  const { kind, name } = await kindOf(id);
  if (!kind) {
    console.log(`  ?  ${where}: «${name || id}» نوع غير معروف — تُرك كما هو`);
    skipped++;
    return url;
  }
  const next = urlFor(id, kind);
  if (next !== url) {
    console.log(`  ✓  ${where}: «${name}» → ${kind === "video" ? "فيديو (مشغّل)" : "صورة"}`);
    changes++;
  }
  return next;
}

async function fixPortfolios() {
  const file = path.join(process.cwd(), "content/portfolios.json");
  const list = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const p of list) {
    if (p.cover) {
      const fixed = await fixUrl(p.cover, `${p.clientName} / الغلاف`);
      // الغلاف لا يصلح أن يكون مشغّل فيديو
      if (fixed.includes("/preview")) {
        const id = driveId(fixed);
        console.log(`  !  ${p.clientName} / الغلاف: فيديو لا يصلح غلافاً — استُخدمت صورته المصغّرة`);
        p.cover = urlFor(id, "image");
      } else {
        p.cover = fixed;
      }
    }
    if (Array.isArray(p.gallery)) {
      const out = [];
      for (let i = 0; i < p.gallery.length; i++) {
        out.push(await fixUrl(p.gallery[i], `${p.clientName} / المعرض ${i + 1}`));
      }
      p.gallery = out;
    }
    if (typeof p.body === "string" && p.body.includes("drive.google.com")) {
      const links = [...p.body.matchAll(/!\[([^\]]*)\]\((https:\/\/[^)\s]*drive\.google\.com[^)\s]*)\)/g)];
      for (const [full, alt, url] of links) {
        const fixed = await fixUrl(url, `${p.clientName} / المقالة`);
        if (fixed !== url) {
          const label = fixed.includes("/preview") ? "فيديو" : alt || "صورة";
          p.body = p.body.replace(full, `![${label}](${fixed})`);
        }
      }
    }
  }
  if (APPLY) fs.writeFileSync(file, JSON.stringify(list, null, 2));
}

async function fixSettings() {
  const file = path.join(process.cwd(), "content/settings.json");
  if (!fs.existsSync(file)) return;
  const s = JSON.parse(fs.readFileSync(file, "utf8"));
  if (s.hero?.image) {
    const fixed = await fixUrl(s.hero.image, "الإعدادات / صورة الـ Hero");
    s.hero.image = fixed.includes("/preview") ? urlFor(driveId(fixed), "image") : fixed;
  }
  // خلفية الـ Hero لا تقبل مشغّل Drive
  if (s.hero?.video && driveId(s.hero.video)) {
    console.log("  !  الإعدادات / فيديو الـ Hero: رابط Drive لا يصلح خلفية — أُفرغ");
    s.hero.video = "";
    changes++;
  }
  if (APPLY) fs.writeFileSync(file, JSON.stringify(s, null, 2));
}

(async () => {
  console.log(APPLY ? "== تطبيق الإصلاح ==" : "== فحص فقط (بلا تغيير) ==");
  await fixPortfolios();
  await fixSettings();
  console.log(`\nتغييرات: ${changes}${skipped ? ` · متروك: ${skipped}` : ""}`);
  if (!APPLY && changes) console.log("أعد التشغيل بـ --apply للتطبيق.");
})().catch((e) => {
  console.error("فشل:", e.message);
  process.exit(1);
});
