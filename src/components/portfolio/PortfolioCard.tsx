import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import type { Portfolio } from "@/lib/types";
import { formatMonth } from "@/lib/format";
import { SmartMedia } from "@/components/ui/SmartMedia";
import { cn } from "@/lib/cn";

/**
 * الكارت الخارجي الموحد — نفس الشكل لكل عميل:
 * الغلاف وشارة المجال ← اسم العميل والتاريخ ← نبذة ← شريط الأرقام ← زر واحد.
 *
 * لو لم تكن لدى العميل أرقام (مَن أخذ موقعاً فقط مثلاً) يعرض الشريط نطاق العمل
 * في نفس الصندوق وبنفس الارتفاع، حتى تبقى كل الكروت متطابقة الشكل.
 */
export function PortfolioCard({ portfolio: p, categoryTitle }: { portfolio: Portfolio; categoryTitle: string }) {
  const href = `/portfolio/${p.slug}`;
  const stats = p.highlights.filter((h) => h.value?.trim() && h.label?.trim()).slice(0, 3);
  const services = p.services.slice(0, 3);

  return (
    <article className="reveal group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-menu)] active:scale-[0.99]">
      {/* الغلاف + شارة المجال */}
      <Link href={href} className="relative block aspect-[530/300] w-full overflow-hidden bg-surface-2">
        {p.cover ? (
          <SmartMedia
            src={p.cover}
            alt={p.clientName}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 530px"
            className="transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-ink-3">بدون صورة</div>
        )}
        <span className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur dark:bg-black/60 dark:text-white">
          {categoryTitle}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5 lg:p-6">
        {/* اسم العميل والتاريخ */}
        <div className="min-w-0">
          <h3 className="truncate text-[20px] font-bold leading-tight text-ink lg:text-[22px]">
            <Link href={href} className="transition-colors hover:text-brand">
              {p.clientName}
            </Link>
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-3">
            <CalendarDays className="size-3.5" />
            {formatMonth(p.date)}
          </p>
        </div>

        <hr className="border-border-soft" />

        {/* نبذة */}
        <p className="line-clamp-3 min-h-[4.5rem] text-[15px] leading-relaxed text-ink-2">{p.summary}</p>

        <div className="mt-auto flex flex-col gap-4">
          {/* مجموعة الأرقام */}
          <div className="flex min-h-[88px] items-center overflow-hidden rounded-xl bg-surface-2">
            {stats.length > 0 ? (
              <div
                className="grid w-full"
                style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
              >
                {stats.map((s, i) => (
                  <div
                    key={`${s.label}-${i}`}
                    className={cn(
                      "flex flex-col items-center gap-1.5 px-2 py-4 text-center",
                      i !== 0 && "border-r border-border/70",
                    )}
                  >
                    <span className="tabular text-[18px] font-bold leading-none text-brand lg:text-[20px]">
                      {s.value}
                    </span>
                    <span className="line-clamp-2 text-[11px] leading-tight text-ink-2">{s.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-4 text-center text-[13px] text-ink-2">
                {services.length === 0 && <span className="text-ink-3">—</span>}
                {services.map((s, i) => (
                  <span key={s} className="flex items-center gap-2">
                    {i !== 0 && <span className="text-ink-3">·</span>}
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Link
            href={href}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand text-[15px] font-medium text-white transition-colors hover:bg-[#e62d00]"
          >
            عرض ملف الأعمال
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
