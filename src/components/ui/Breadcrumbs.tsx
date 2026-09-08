import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="مسار التنقّل" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-3">
      {items.map((it, i) => (
        <span key={`${it.label}-${i}`} className="flex items-center gap-1.5">
          {it.href ? (
            <Link href={it.href} className="hover:text-ink">
              {it.label}
            </Link>
          ) : (
            <span className="text-ink">{it.label}</span>
          )}
          {i < items.length - 1 && <ChevronLeft className="size-3.5" />}
        </span>
      ))}
    </nav>
  );
}
