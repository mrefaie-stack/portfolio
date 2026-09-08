import { getCategoriesWithCounts } from "@/lib/repo/categories";
import { getSettings } from "@/lib/repo/settings";
import { contactHref } from "@/lib/contact";
import { Navbar } from "./Navbar";

/** غلاف خادمي للـ Navbar: يجلب التصنيفات وأعدادها وبيانات التواصل */
export async function SiteHeader() {
  const [categories, settings] = await Promise.all([getCategoriesWithCounts(), getSettings()]);
  return <Navbar categories={categories} contactHref={contactHref(settings.contact)} />;
}
