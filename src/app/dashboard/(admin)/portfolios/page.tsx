import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Pencil, Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DeleteButton } from "@/components/dashboard/DeleteButton";
import { getAllPortfolios } from "@/lib/repo/portfolios";
import { getCategories } from "@/lib/repo/categories";
import { toggleFeaturedAction, togglePublishAction } from "@/app/dashboard/actions";
import { formatDateTime, formatMonth } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata = { title: "ملفات الأعمال" };

export default async function PortfoliosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; category?: string; featured?: string }>;
}) {
  const sp = await searchParams;
  const [all, categories] = await Promise.all([getAllPortfolios(), getCategories()]);
  const q = (sp.q ?? "").trim().toLowerCase();
  const items = all.filter(
    (p) =>
      (!sp.status || p.status === sp.status) &&
      (!sp.category || p.category === sp.category) &&
      (!sp.featured || p.featured) &&
      (!q || p.clientName.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)),
  );
  const catTitle = (s: string) => categories.find((c) => c.slug === s)?.title ?? "—";

  const filterLink = (patch: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { ...sp, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, v);
    const s = u.toString();
    return `/dashboard/portfolios${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="ملفات الأعمال"
        subtitle={`${all.length} ملف · ${all.filter((p) => p.status === "published").length} منشور`}
        actions={
          <Link
            href="/dashboard/portfolios/new"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-[#e62d00]"
          >
            <Plus className="size-4" /> ملف أعمال جديد
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg bg-surface-2 p-1 text-sm">
          {[
            { k: undefined, l: "الكل" },
            { k: "published", l: "منشور" },
            { k: "draft", l: "مسودّة" },
          ].map((f) => (
            <Link
              key={f.l}
              href={filterLink({ status: f.k, featured: undefined })}
              className={cn(
                "shrink-0 rounded-md px-3.5 py-1.5 transition-colors",
                (sp.status ?? undefined) === f.k && !sp.featured ? "bg-surface font-semibold text-ink shadow-sm" : "text-ink-2",
              )}
            >
              {f.l}
            </Link>
          ))}
          <Link
            href={filterLink({ featured: "1", status: undefined })}
            className={cn("shrink-0 rounded-md px-3.5 py-1.5 transition-colors", sp.featured ? "bg-surface font-semibold text-ink shadow-sm" : "text-ink-2")}
          >
            أبرز الأعمال
          </Link>
        </div>
        <form className="flex gap-2">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <select name="category" defaultValue={sp.category ?? ""} className="field h-10 w-44">
            <option value="">كل المجالات</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="بحث…" className="field h-10 w-full lg:w-56" />
          <button type="submit" className="h-10 shrink-0 rounded-lg border border-border bg-surface px-4 text-sm hover:bg-surface-2">
            تصفية
          </button>
        </form>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center text-sm text-ink-3">لا توجد ملفات مطابقة.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-surface-2/60 text-xs text-ink-3">
              <tr>
                <th className="px-4 py-3 text-right font-medium">العميل</th>
                <th className="px-4 py-3 text-right font-medium">المجال</th>
                <th className="px-4 py-3 text-right font-medium">التاريخ</th>
                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                <th className="px-4 py-3 text-right font-medium">آخر تعديل</th>
                <th className="px-4 py-3 text-right font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-surface-2/40">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/portfolios/${p.id}`} className="flex items-center gap-3">
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                        {p.cover && <Image src={p.cover} alt="" fill sizes="48px" className="object-cover" />}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 truncate font-semibold text-ink">
                          {p.featured && <Star className="size-3.5 fill-brand text-brand" />}
                          {p.clientName}
                        </span>
                        <span className="block truncate text-xs text-ink-3">{p.services.join(" · ") || "—"}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{catTitle(p.category)}</td>
                  <td className="px-4 py-3 text-ink-2">{formatMonth(p.date)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-3">{formatDateTime(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/portfolios/${p.id}`}
                        className="grid size-8 place-items-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink"
                        title="تحرير"
                        aria-label="تحرير"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <form action={togglePublishAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="grid size-8 place-items-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink disabled:opacity-40"
                          title={p.status === "published" ? "إلغاء النشر" : p.cover ? "نشر" : "أضِف صورة خارجية أولاً"}
                          aria-label={p.status === "published" ? "إلغاء النشر" : "نشر"}
                          disabled={p.status === "draft" && !p.cover}
                        >
                          {p.status === "published" ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </form>
                      <form action={toggleFeaturedAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={cn("grid size-8 place-items-center rounded-md hover:bg-surface-2", p.featured ? "text-brand" : "text-ink-3 hover:text-ink")}
                          title={p.featured ? "إزالة من أبرز الأعمال" : "إضافة لأبرز الأعمال"}
                          aria-label="أبرز الأعمال"
                        >
                          <Star className={cn("size-4", p.featured && "fill-brand")} />
                        </button>
                      </form>
                      <DeleteButton id={p.id} name={p.clientName} compact />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
