import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function SectionHeader({
  id,
  title,
  subtitle,
  meta,
  href,
  hrefLabel = "عرض الكل",
}: {
  id?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
      <div className="text-right">
        <div className="flex items-center gap-3">
          <h2 id={id} className="text-[28px] font-bold leading-tight text-ink lg:text-[40px]">
            {title}
          </h2>
          {meta && (
            <span className="tabular rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand lg:text-sm">
              {meta}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-ink-3 lg:text-[15px]">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-lg border border-border bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 sm:self-auto"
        >
          {hrefLabel}
          <ArrowLeft className="size-4" />
        </Link>
      )}
    </div>
  );
}
