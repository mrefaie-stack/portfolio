/** أدوات مشتركة للصور والفيديو في المعرض — الفيديو يُميَّز بامتداد الملف */
export const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".m4v"];

export function isVideo(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTS.some((e) => clean.endsWith(e));
}

export function videoMime(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".webm")) return "video/webm";
  if (clean.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}
