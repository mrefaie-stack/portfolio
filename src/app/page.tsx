import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { getPublishedPortfolios } from "@/lib/repo/portfolios";
import { getCategoriesWithCounts } from "@/lib/repo/categories";
import { getSettings } from "@/lib/repo/settings";
import { pluralFiles } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [portfolios, categories, settings] = await Promise.all([
    getPublishedPortfolios(),
    getCategoriesWithCounts(),
    getSettings(),
  ]);

  const featured = portfolios.filter((p) => p.featured).slice(0, 3);
  const featuredList = featured.length > 0 ? featured : portfolios.slice(0, 3);
  const withItems = categories.filter((c) => c.count > 0);

  return (
    <>
      <SiteHeader />
      <main className="pb-10">
        <Hero hero={settings.hero} />

        {/* أبرز الأعمال */}
        <Container className="pt-14 lg:pt-[72px]">
          <SectionHeader
            id="featured"
            title={settings.featured.title}
            subtitle={settings.featured.subtitle}
            meta={pluralFiles(portfolios.length)}
            href="/portfolio"
          />
          <div className="mt-8 lg:mt-10">
            <PortfolioGrid items={featuredList} categories={categories} emptyText="أضِف أول ملف أعمال من لوحة التحكم." />
          </div>
        </Container>

        {/* قسم لكل مجال فيه ملفات */}
        {withItems.map((c) => {
          const items = portfolios.filter((p) => p.category === c.slug).slice(0, 3);
          return (
            <Container key={c.slug} className="pt-14 lg:pt-[72px]">
              <SectionHeader
                id={c.slug}
                title={c.title}
                meta={pluralFiles(c.count)}
                href={c.count > 3 ? `/category/${c.slug}` : undefined}
                hrefLabel={`كل ${c.title}`}
              />
              <div className="mt-8 lg:mt-10">
                <PortfolioGrid items={items} categories={categories} />
              </div>
            </Container>
          );
        })}
      </main>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
