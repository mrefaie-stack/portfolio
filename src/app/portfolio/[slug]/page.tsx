import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AtSign, CalendarDays, ExternalLink, FolderOpen, Globe, Link2, Music2, ThumbsUp, User } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Chip } from "@/components/ui/Chip";
import { StatTiles } from "@/components/ui/StatTiles";
import { Markdown } from "@/components/ui/Markdown";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Gallery } from "@/components/portfolio/Gallery";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { getPortfolioBySlug, getPublishedPortfolios } from "@/lib/repo/portfolios";
import { getCategoriesWithCounts } from "@/lib/repo/categories";
import { getSettings } from "@/lib/repo/settings";
import { isAdmin } from "@/lib/auth/server";
import { contactHref } from "@/lib/contact";
import { formatMonth } from "@/lib/format";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPortfolioBySlug(decodeURIComponent(slug));
  if (!p || p.status !== "published") return { title: "ملف الأعمال غير موجود" };
  return {
    title: p.clientName,
    description: p.summary,
    openGraph: { title: p.clientName, description: p.summary, images: p.cover ? [{ url: p.cover }] : undefined },
  };
}

const linkMeta: Record<string, { label: string; icon: typeof Globe }> = {
  website: { label: "الموقع الإلكتروني", icon: Globe },
  instagram: { label: "إنستجرام", icon: AtSign },
  facebook: { label: "فيسبوك", icon: ThumbsUp },
  tiktok: { label: "تيك توك", icon: Music2 },
  other: { label: "رابط إضافي", icon: Link2 },
};

/**
 * الصفحة الداخلية الموحدة لكل ملف أعمال:
 * غلاف ← الأساسيات (جانبي) + أرقام (إن وُجدت) + المقالة + المعرض ← أعمال مشابهة.
 */
export default async function PortfolioPage({ params }: Props) {
  const { slug } = await params;
  const [p, categories, settings, admin] = await Promise.all([
    getPortfolioBySlug(decodeURIComponent(slug)),
    getCategoriesWithCounts(),
    getSettings(),
    isAdmin(),
  ]);
  // المسودّات تظهر للأدمن فقط (معاينة)
  if (!p || (p.status !== "published" && !admin)) notFound();

  const cat = categories.find((c) => c.slug === p.category);
  const links = Object.entries(p.links).filter(([, v]) => v && v.trim()) as [string, string][];
  const gallery = p.gallery.filter((g) => g && g !== p.cover);
  const related = (await getPublishedPortfolios()).filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main>
        <Container className="pt-6 lg:pt-10">
          <Breadcrumbs
            items={[
              { label: "الرئيسية", href: "/" },
              ...(cat ? [{ label: cat.title, href: `/category/${cat.slug}` }] : []),
              { label: p.clientName },
            ]}
          />

          {p.status !== "published" && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
              هذه مسودّة غير منشورة — تراها لأنك مسجّل دخول في لوحة التحكم.{" "}
              <Link href={`/dashboard/portfolios/${p.id}`} className="font-semibold underline">
                تحرير
              </Link>
            </div>
          )}

          {/* الغلاف */}
          <div className="relative mt-6 overflow-hidden rounded-[24px] bg-surface-2 lg:rounded-hero">
            <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[1640/620]">
              {p.cover && (
                <Image src={p.cover} alt={p.clientName} fill priority sizes="(max-width: 1920px) 100vw, 1640px" className="object-cover" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.15)_45%,rgba(0,0,0,0.80)_100%)]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 text-white sm:p-10 lg:p-14">
              <div className="flex flex-wrap items-center gap-2">
                {cat && (
                  <Link
                    href={`/category/${cat.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/25"
                  >
                    <CategoryIcon name={cat.icon} className="size-3.5" />
                    {cat.title}
                  </Link>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs backdrop-blur">
                  <CalendarDays className="size-3.5" />
                  {formatMonth(p.date)}
                </span>
              </div>
              <h1 className="text-[32px] font-bold leading-tight sm:text-5xl lg:text-[64px] lg:leading-[1.15]">{p.clientName}</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-white/85 sm:text-lg lg:text-xl">{p.summary}</p>
            </div>
          </div>

          {/* المحتوى */}
          <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
            <div className="min-w-0">
              {p.highlights.length > 0 && (
                <section aria-labelledby="highlights" className="mb-10">
                  <h2 id="highlights" className="mb-4 text-lg font-bold text-ink">
                    أرقام سريعة
                  </h2>
                  <StatTiles stats={p.highlights} />
                </section>
              )}

              {p.body.trim() ? (
                <Markdown content={p.body} />
              ) : (
                <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-3">لم تُكتب قصة هذا الملف بعد.</p>
              )}

              {gallery.length > 0 && (
                <section aria-labelledby="gallery" className="mt-12">
                  <h2 id="gallery" className="mb-5 text-2xl font-bold text-ink">
                    المعرض
                  </h2>
                  <Gallery images={gallery} alt={p.clientName} />
                </section>
              )}
            </div>

            {/* الأساسيات */}
            <aside className="lg:sticky lg:top-[121px] lg:self-start">
              <div className="rounded-card border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-lg font-bold text-ink">الأساسيات</h2>
                <dl className="mt-5 flex flex-col divide-y divide-border-soft">
                  <Row icon={User} label="العميل">
                    {p.clientName}
                  </Row>
                  <Row icon={FolderOpen} label="المجال">
                    {cat ? (
                      <Link href={`/category/${cat.slug}`} className="hover:text-brand">
                        {cat.title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </Row>
                  <Row icon={CalendarDays} label="التاريخ">
                    {formatMonth(p.date)}
                  </Row>
                  <div className="py-4">
                    <dt className="text-xs text-ink-3">نطاق العمل</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {p.services.length === 0 && <span className="text-sm text-ink-3">—</span>}
                      {p.services.map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </dd>
                  </div>
                  {links.length > 0 && (
                    <div className="py-4">
                      <dt className="text-xs text-ink-3">الروابط</dt>
                      <dd className="mt-2 flex flex-col gap-2">
                        {links.map(([k, v]) => {
                          const m = linkMeta[k] ?? linkMeta.other;
                          const LIcon = m.icon;
                          return (
                            <a
                              key={k}
                              href={v}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2.5 text-sm text-ink hover:bg-border-soft"
                            >
                              <span className="flex items-center gap-2">
                                <LIcon className="size-4 text-ink-2" />
                                {m.label}
                              </span>
                              <ExternalLink className="size-3.5 text-ink-3" />
                            </a>
                          );
                        })}
                      </dd>
                    </div>
                  )}
                </dl>
                <a
                  href={contactHref(settings.contact)}
                  target={contactHref(settings.contact).startsWith("#") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand text-[15px] font-medium text-white hover:bg-[#e62d00]"
                >
                  اطلب نتيجة مشابهة
                </a>
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <section className="mt-20">
              <SectionHeader title="أعمال مشابهة" meta={cat?.title} href={cat ? `/category/${cat.slug}` : "/portfolio"} />
              <div className="mt-8">
                <PortfolioGrid items={related} categories={categories} />
              </div>
            </section>
          )}
        </Container>
      </main>
      <Footer categories={categories} settings={settings} />
    </>
  );
}

function Row({ icon: I, label, children }: { icon: typeof User; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-2">
        <I className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-ink-3">{label}</dt>
        <dd className="truncate text-[15px] font-medium text-ink">{children}</dd>
      </div>
    </div>
  );
}
