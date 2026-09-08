import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import type { Portfolio } from "@/lib/types";
import { Chip } from "@/components/ui/Chip";
import { formatMonth } from "@/lib/format";

/**
 * الكارت الخارجي الموحد — نفس الشكل لكل عميل بغض النظر عن الخدمة:
 * الغلاف + شارة المجال ← اسم العميل والتاريخ ← نطاق العمل ← الملخص ← زر واحد.
 * لا إحصائيات هنا إطلاقاً حتى تبقى الكروت متطابقة.
 */
export function PortfolioCard({ portfolio: p, categoryTitle }: { portfolio: Portfolio; categoryTitle: string }) {
  const href = `/portfolio/${p.slug}`;
  const shown = p.services.slice(0, 3);
  const extra = p.services.length - shown.length;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-menu)]">
      <Link href={href} className="relative block aspect-[530/300] w-full overflow-hidden bg-surface-2">
        {p.cover ? (
          <Image
            src={p.cover}
            alt={p.clientName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 530px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-ink-3">بدون صورة</div>
        )}
        <span className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur dark:bg-black/60 dark:text-white">
          {categoryTitle}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5 lg:p-6">
        <div className="min-w-0">
          <h3 className="truncate text-[20px] font-bold leading-tight text-ink lg:text-[22px]">
            <Link href={href} className="hover:text-brand">
              {p.clientName}
            </Link>
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-3">
            <CalendarDays className="size-3.5" />
            {formatMonth(p.date)}
          </p>
        </div>

        <hr className="border-border-soft" />

        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] text-ink-3">نطاق العمل</span>
          <div className="flex min-h-[34px] flex-wrap gap-2">
            {shown.length === 0 && <span className="text-sm text-ink-3">—</span>}
            {shown.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
            {extra > 0 && <Chip className="tabular text-ink-3">+{extra}</Chip>}
          </div>
        </div>

        <p className="line-clamp-3 min-h-[4.5rem] text-[15px] leading-relaxed text-ink-2">{p.summary}</p>

        <div className="mt-auto pt-1">
          <Link
            href={href}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand text-[15px] font-medium text-white transition-colors hover:bg-[#e62d00]"
          >
            عرض ملف الأعمال
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
