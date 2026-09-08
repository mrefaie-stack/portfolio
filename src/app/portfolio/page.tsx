import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { getPublishedPortfolios } from "@/lib/repo/portfolios";
import { getCategoriesWithCounts } from "@/lib/repo/categories";
import { getSettings } from "@/lib/repo/settings";
import { pluralFiles } from "@/lib/format";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "كل ملفات الأعمال" };

export default async function PortfolioIndex({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const [all, categories, settings] = await Promise.all([
    getPublishedPortfolios(),
    getCategoriesWithCounts(),
    getSettings(),
  ]);

  const term = q.trim().toLowerCase();
  const items = all.filter(
    (p) =>
      (!category || p.category === category) &&
      (!term ||
        p.clientName.toLowerCase().includes(term) ||
        p.summary.toLowerCase().includes(term) ||
        p.services.some((s) => s.toLowerCase().includes(term))),
  );

  const link = (cat: string) => {
    const sp = new URLSearchParams();
    if (term) sp.set("q", q.trim());
    if (cat) sp.set("category", cat);
    const s = sp.toString();
    return `/portfolio${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <SiteHeader />
      <main>
        <Container className="pt-10 lg:pt-14">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[32px] font-bold leading-tight text-ink lg:text-[44px]">
                {term ? (
                  <>
                    نتائج البحث عن <span className="text-brand">&ldquo;{q.trim()}&rdquo;</span>
                  </>
                ) : (
                  "كل ملفات الأعمال"
                )}
              </h1>
              <p className="mt-2 text-sm text-ink-3 lg:text-[15px]">{pluralFiles(items.length)}</p>
            </div>
            <form action="/portfolio" className="flex gap-2">
              {category && <input type="hidden" name="category" value={category} />}
              <input
                name="q"
                defaultValue={q}
                placeholder="ابحث باسم العميل أو الخدمة…"
                className="h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-brand lg:w-80"
              />
              <button type="submit" className="h-11 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-[#e62d00]">
                بحث
              </button>
            </form>
          </div>

          {/* فلتر التصنيفات */}
          <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
            <Link
              href={link("")}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2 text-sm transition-colors",
                !category ? "bg-ink text-white dark:bg-white dark:text-black" : "bg-surface-2 text-ink-2 hover:bg-border-soft",
              )}
            >
              الكل <span className="tabular opacity-70">({all.length})</span>
            </Link>
            {categories
              .filter((c) => c.count > 0)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={link(c.slug)}
                  className={cn(
                    "shrink-0 rounded-lg px-4 py-2 text-sm transition-colors",
                    category === c.slug ? "bg-ink text-white dark:bg-white dark:text-black" : "bg-surface-2 text-ink-2 hover:bg-border-soft",
                  )}
                >
                  {c.title} <span className="tabular opacity-70">({c.count})</span>
                </Link>
              ))}
          </div>

          <div className="mt-8">
            <PortfolioGrid items={items} categories={categories} emptyText="لا توجد نتائج مطابقة." />
          </div>
        </Container>
      </main>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
