import type { SiteSettings } from "./types";

/** رابط "تواصل معنا": واتساب إن وُجد، ثم البريد، ثم الهاتف، وإلا قسم التواصل في الفوتر */
export function contactHref(c: SiteSettings["contact"]) {
  const wa = c.whatsapp.replace(/[^\d]/g, "");
  if (wa) return `https://wa.me/${wa}`;
  if (c.email) return `mailto:${c.email}`;
  if (c.phone) return `tel:${c.phone.replace(/\s/g, "")}`;
  return "#contact";
}
