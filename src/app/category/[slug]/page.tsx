import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { getPublishedPortfolios } from "@/lib/repo/portfolios";
import { getCategoriesWithCounts } from "@/lib/repo/categories";
import { getSettings } from "@/lib/repo/settings";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { pluralFiles } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cats = await getCategoriesWithCounts();
  const c = cats.find((x) => x.slug === slug);
  return { title: c ? c.title : "المجال غير موجود" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [all, categories, settings] = await Promise.all([
    getPublishedPortfolios(),
    getCategoriesWithCounts(),
    getSettings(),
  ]);
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const items = all.filter((p) => p.category === cat.slug);

  return (
    <>
      <SiteHeader />
      <main>
        <Container className="pt-10 lg:pt-14">
          <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "المجالات", href: "/portfolio" }, { label: cat.title }]} />
          <div className="mt-6 flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
              <CategoryIcon name={cat.icon} className="size-7" />
            </span>
            <div>
              <h1 className="text-[32px] font-bold leading-tight text-ink lg:text-[44px]">{cat.title}</h1>
              <p className="mt-1 text-sm text-ink-3 lg:text-[15px]">{pluralFiles(items.length)}</p>
            </div>
          </div>
          <div className="mt-10">
            <PortfolioGrid items={items} categories={categories} emptyText="لا توجد ملفات أعمال منشورة في هذا المجال بعد." />
          </div>
        </Container>
      </main>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
