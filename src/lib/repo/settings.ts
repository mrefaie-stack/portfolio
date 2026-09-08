import "server-only";
import { cache } from "react";
import type { SiteSettings } from "@/lib/types";
import { readJson, writeJson } from "@/lib/store";

const FILE = "settings.json";

export const defaultSettings: SiteSettings = {
  hero: {
    titleLine1: "كل علامة تجارية",
    titleLine2: 'قصة "ميلا نايت" الكاملة',
    subtitle:
      "وكالة تسويق رقمية تولّد الظهور، التفاعل، والمتابعين، وتوثّق أثر كل ملف أعمال كقضية ناجحة موثّقة.",
    image: "/images/hero.jpg",
    stats: [
      { value: "13,081", label: "المتابعين" },
      { value: "190,619", label: "التفاعلات" },
      { value: "15,973,979", label: "إجمالي الأداء التراكمي" },
    ],
  },
  featured: {
    title: "أبرز الأعمال",
    subtitle: "مختارات من ملفات أعمالنا، بتوثيق موحد لكل عميل: الأساسيات ثم القصة كاملة.",
  },
  contact: {
    whatsapp: "",
    phone: "",
    email: "",
    instagram: "",
    address: "",
  },
  services: [
    "سوشيال ميديا",
    "تصميمات",
    "التصوير وإنتاج الفيديو",
    "موقع إلكتروني",
    "هوية بصرية",
    "إعلانات ممولة",
    "كتابة محتوى",
    "إدارة الحملات",
  ],
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const saved = await readJson<Partial<SiteSettings>>(FILE, {});
  return {
    ...defaultSettings,
    ...saved,
    hero: { ...defaultSettings.hero, ...(saved.hero ?? {}) },
    featured: { ...defaultSettings.featured, ...(saved.featured ?? {}) },
    contact: { ...defaultSettings.contact, ...(saved.contact ?? {}) },
    services: saved.services ?? defaultSettings.services,
  };
});

export async function saveSettings(s: SiteSettings) {
  await writeJson(FILE, s);
}
