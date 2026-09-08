"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, FolderKanban, LayoutDashboard, LogOut, Settings, Tags } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/cn";

const items = [
  { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/portfolios", label: "ملفات الأعمال", icon: FolderKanban },
  { href: "/dashboard/categories", label: "المجالات", icon: Tags },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar({ logout }: { logout: () => Promise<void> }) {
  const path = usePathname();
  return (
    <aside className="flex w-full flex-col gap-2 border-b border-border-soft bg-surface p-4 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-l lg:p-5">
      <div className="mb-4 hidden items-center gap-3 px-2 lg:flex">
        <Logo />
        <div className="leading-tight">
          <p className="text-sm font-bold text-ink">MilaKnight</p>
          <p className="text-xs text-ink-3">لوحة التحكم</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="قائمة الداشبورد">
        {items.map((it) => {
          const active = it.exact ? path === it.href : path.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors",
                active ? "bg-brand-soft font-semibold text-brand" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon className="size-4.5" strokeWidth={active ? 2.2 : 1.8} />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-1 border-t border-border-soft pt-4 lg:flex">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          <ExternalLink className="size-4.5" strokeWidth={1.8} />
          عرض الموقع
        </a>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            <LogOut className="size-4.5" strokeWidth={1.8} />
            تسجيل الخروج
          </button>
        </form>
      </div>
    </aside>
  );
}
