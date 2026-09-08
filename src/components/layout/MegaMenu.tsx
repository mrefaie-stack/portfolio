"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import type { CategoryWithCount } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import { pluralFiles } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * القائمة الضخمة (Mega Menu) — شبكة التصنيفات مع عدد الملفات المنشورة في كل منها.
 */
export function MegaMenu({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategoryWithCount[];
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 top-full z-40 origin-top transition-all duration-200",
        open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
      )}
      aria-hidden={!open}
    >
      <div className="mx-auto mt-3 w-full max-w-[1920px] px-4 sm:px-8 xl:px-[140px]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-menu)] lg:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-border-soft pb-5">
            <h3 className="text-lg font-bold text-ink lg:text-xl">تصفّح حسب المجال</h3>
            <Link
              href="/portfolio"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-ink-2 hover:bg-surface-2"
            >
              <LayoutGrid className="size-4" />
              كل ملفات الأعمال
            </Link>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => {
              const Icon = getIcon(c.icon);
              const soon = c.count === 0;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 transition-colors hover:border-brand/40 hover:bg-surface-2/60"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-2 transition-colors group-hover:bg-brand-soft group-hover:text-brand">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[15px] font-bold text-ink">{c.title}</span>
                      <span className="text-xs text-ink-3">{pluralFiles(c.count)}</span>
                    </span>
                    <span
                      className={cn(
                        "tabular grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                        soon ? "bg-surface-2 text-ink-3" : "bg-brand-soft text-brand",
                      )}
                    >
                      {c.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
