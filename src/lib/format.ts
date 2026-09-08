const months = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/** "2026-02" → "فبراير 2026" */
export function formatMonth(ym: string) {
  const m = /^(\d{4})-(\d{2})/.exec(ym ?? "");
  if (!m) return ym ?? "";
  const month = months[Number(m[2]) - 1] ?? "";
  return `${month} ${m[1]}`.trim();
}

export function pluralFiles(n: number) {
  if (n === 0) return "قريباً";
  if (n === 1) return "ملف أعمال واحد";
  if (n === 2) return "ملفا أعمال";
  if (n <= 10) return `${n} ملفات أعمال`;
  return `${n} ملف أعمال`;
}

/** تحويل الاسم إلى slug صالح للرابط (يسمح بالعربية) */
export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDateTime(iso: string) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
