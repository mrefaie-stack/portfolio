import Link from "next/link";
import { AtSign, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { CategoryWithCount, SiteSettings } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

export function Footer({ categories, settings }: { categories: CategoryWithCount[]; settings: SiteSettings }) {
  const c = settings.contact;
  const items = [
    c.whatsapp && { icon: MessageCircle, label: "واتساب", value: c.whatsapp, href: `https://wa.me/${c.whatsapp.replace(/[^\d]/g, "")}` },
    c.phone && { icon: Phone, label: "الهاتف", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    c.email && { icon: Mail, label: "البريد", value: c.email, href: `mailto:${c.email}` },
    c.instagram && { icon: AtSign, label: "إنستجرام", value: c.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@"), href: c.instagram },
    c.address && { icon: MapPin, label: "العنوان", value: c.address, href: "" },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string }[];

  return (
    <footer id="contact" className="mt-24 border-t border-border-soft bg-surface/60">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-2">{settings.hero.subtitle}</p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink">المجالات</h4>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {categories
                .filter((x) => x.count > 0)
                .map((x) => (
                  <li key={x.slug}>
                    <Link href={`/category/${x.slug}`} className="text-sm text-ink-2 hover:text-brand">
                      {x.title}
                    </Link>
                  </li>
                ))}
              <li>
                <Link href="/portfolio" className="text-sm font-medium text-brand">
                  كل ملفات الأعمال
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink">تواصل معنا</h4>
            {items.length === 0 ? (
              <p className="mt-4 text-sm text-ink-3">أضِف بيانات التواصل من لوحة التحكم → الإعدادات.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {items.map((it) => {
                  const Icon = it.icon;
                  const inner = (
                    <>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-2">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-xs text-ink-3">{it.label}</span>
                        <span className="text-sm text-ink" dir="ltr">
                          {it.value}
                        </span>
                      </span>
                    </>
                  );
                  return (
                    <li key={it.label}>
                      {it.href ? (
                        <a href={it.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-brand">
                          {inner}
                        </a>
                      ) : (
                        <div className="flex items-center gap-3">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-border-soft pt-6 text-center text-xs text-ink-3 sm:text-right">
          © {new Date().getFullYear()} Mila Knights. جميع الحقوق محفوظة.
        </div>
      </Container>
    </footer>
  );
}
