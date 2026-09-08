import { PageHeader } from "@/components/dashboard/PageHeader";
import { CategoryManager } from "@/components/dashboard/CategoryManager";
import { getCategories } from "@/lib/repo/categories";
import { countAllByCategory } from "@/lib/repo/portfolios";

export const metadata = { title: "المجالات" };

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([getCategories(), countAllByCategory()]);
  return (
    <>
      <PageHeader
        title="المجالات"
        subtitle="تظهر في القائمة الضخمة وفلاتر الموقع. العدد يُحسب تلقائياً من الملفات المنشورة."
      />
      <CategoryManager categories={categories} counts={counts} />
    </>
  );
}
