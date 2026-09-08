import type { Category, Portfolio } from "@/lib/types";
import { PortfolioCard } from "./PortfolioCard";

export function PortfolioGrid({
  items,
  categories,
  emptyText = "لا توجد ملفات أعمال بعد.",
}: {
  items: Portfolio[];
  categories: Category[];
  emptyText?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface/50 p-12 text-center text-sm text-ink-3">
        {emptyText}
      </div>
    );
  }
  const title = (slug: string) => categories.find((c) => c.slug === slug)?.title ?? "عام";
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((p) => (
        <PortfolioCard key={p.id} portfolio={p} categoryTitle={title(p.category)} />
      ))}
    </div>
  );
}
