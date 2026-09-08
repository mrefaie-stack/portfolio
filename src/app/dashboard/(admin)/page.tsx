import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, Files, Plus, Star, Tags } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { getAllPortfolios } from "@/lib/repo/portfolios";
import { getCategories } from "@/lib/repo/categories";
import { formatDateTime, formatMonth } from "@/lib/format";

export default async function DashboardHome() {
  const [all, categories] = await Promise.all([getAllPortfolios(), getCategories()]);
  const published = all.filter((p) => p.status === "published");
  const drafts = all.filter((p) => p.status === "draft");
  const featured = published.filter((p) => p.featured);
  const recent = [...all].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 6);
  const catTitle = (s: string) => categories.find((c) => c.slug === s)?.title ?? "—";

  const tiles = [
    { label: "ملفات منشورة", value: published.length, icon: Files, href: "/dashboard/portfolios?status=published" },
    { label: "مسودّات", value: drafts.length, icon: FileText, href: "/dashboard/portfolios?status=draft" },
    { label: "أبرز الأعمال", value: featured.length, icon: Star, href: "/dashboard/portfolios?featured=1" },
    { label: "المجالات", value: categories.length, icon: Tags, href: "/dashboard/categories" },
  ];

  return (
    <>
      <PageHeader
        title="نظرة عامة"
        subtitle="كل ملفات الأعمال بنظام موحد: الأساسيات ثابتة، والقصة تُكتب كمقالة."
        actions={
          <Link
            href="/dashboard/portfolios/new"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-[#e62d00]"
          >
            <Plus className="size-4" />
            ملف أعمال جديد
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.label}
              href={t.href}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="tabular text-3xl font-bold text-ink">{t.value}</p>
                <p className="mt-0.5 text-sm text-ink-3">{t.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">آخر التعديلات</h2>
          <Link href="/dashboard/portfolios" className="inline-flex items-center gap-1 text-sm text-brand">
            كل الملفات <ArrowLeft className="size-4" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-ink-3">
            لا توجد ملفات بعد.{" "}
            <Link href="/dashboard/portfolios/new" className="font-medium text-brand">
              أضِف أول ملف أعمال
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border-soft overflow-hidden rounded-2xl border border-border bg-surface">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/portfolios/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-2/60">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    {p.cover && <Image src={p.cover} alt="" fill sizes="56px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{p.clientName}</span>
                    <span className="block text-xs text-ink-3">
                      {catTitle(p.category)} · {formatMonth(p.date)}
                    </span>
                  </span>
                  <StatusBadge status={p.status} />
                  <span className="hidden text-xs text-ink-3 sm:block">{formatDateTime(p.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
