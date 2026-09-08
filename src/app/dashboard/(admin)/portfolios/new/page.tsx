import { PageHeader } from "@/components/dashboard/PageHeader";
import { PortfolioForm } from "@/components/dashboard/PortfolioForm";
import { getCategories } from "@/lib/repo/categories";
import { getSettings } from "@/lib/repo/settings";
import { emptyPortfolio } from "@/lib/types";

export const metadata = { title: "ملف أعمال جديد" };

export default async function NewPortfolioPage() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  return (
    <>
      <PageHeader title="ملف أعمال جديد" subtitle="ابدأ بالأساسيات، ثم ارفع الصور واكتب القصة." />
      <PortfolioForm portfolio={emptyPortfolio()} categories={categories} serviceSuggestions={settings.services} />
    </>
  );
}
