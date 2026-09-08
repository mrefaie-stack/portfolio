"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, Menu, Moon, Search, Sun, X } from "lucide-react";
import type { CategoryWithCount } from "@/lib/types";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { cn } from "@/lib/cn";

function NavPill({
  children,
  active,
  onClick,
  href,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const cls = cn(
    "inline-flex h-10 items-center gap-2 rounded-lg bg-surface-2 px-3.5 text-sm text-ink transition-colors hover:bg-border-soft",
    active && "bg-border-soft",
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-expanded={active}>
      {children}
    </button>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span className="tabular grid size-5 place-items-center rounded-full bg-surface text-[11px] font-semibold text-ink-2 ring-1 ring-border">
      {n}
    </span>
  );
}

/**
 * شريط التنقّل — يستلم التصنيفات (مع الأعداد) من الخادم.
 * يعرض أول 3 تصنيفات فيها ملفات كروابط سريعة، والباقي في الـ Mega Menu.
 */
export function Navbar({ categories, contactHref }: { categories: CategoryWithCount[]; contactHref: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const { theme, setTheme } = useTheme();
  const ref = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const quickLinks = categories.filter((c) => c.count > 0).slice(0, 3);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(term ? `/portfolio?q=${encodeURIComponent(term)}` : "/portfolio");
  }

  return (
    <header
      ref={ref}
      className="sticky top-0 z-50 border-b border-border-soft bg-surface-nav/90 backdrop-blur supports-[backdrop-filter]:bg-surface-nav/80"
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-8 lg:h-[97px] xl:px-[140px]">
        <div className="flex items-center gap-6 lg:gap-8">
          <Logo />
          <nav className="hidden items-center gap-2 lg:flex" aria-label="التنقّل الرئيسي">
            {quickLinks.map((c) => (
              <NavPill key={c.slug} href={`/category/${c.slug}`}>
                {c.title}
                <CountBadge n={c.count} />
              </NavPill>
            ))}
            <NavPill active={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
              <LayoutGrid className="size-4" />
              كل المجالات
            </NavPill>
          </nav>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <div
            className="hidden h-10 items-center gap-1 rounded-full bg-surface-2 p-1 sm:flex"
            role="group"
            aria-label="وضع العرض"
          >
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-label="الوضع الفاتح"
              className={cn(
                "grid size-8 place-items-center rounded-full transition-colors",
                theme === "light" ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink",
              )}
            >
              <Sun className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-label="الوضع الداكن"
              className={cn(
                "grid size-8 place-items-center rounded-full transition-colors",
                theme === "dark" ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink",
              )}
            >
              <Moon className="size-4" />
            </button>
          </div>

          {/* البحث */}
          <form
            onSubmit={submitSearch}
            className={cn(
              "flex items-center overflow-hidden rounded-full bg-surface-2 transition-all",
              searchOpen ? "w-56 pr-1 sm:w-72" : "w-10",
            )}
          >
            <button
              type="button"
              aria-label="بحث"
              onClick={() => (searchOpen && q.trim() ? submitSearch(new Event("submit") as unknown as React.FormEvent) : setSearchOpen((v) => !v))}
              className="grid size-10 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink"
            >
              <Search className="size-5" strokeWidth={1.75} />
            </button>
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث باسم العميل…"
              className={cn("h-10 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3", !searchOpen && "hidden")}
            />
          </form>

          <Link
            href={contactHref}
            className="hidden h-11 items-center justify-center rounded-lg bg-brand px-6 text-[15px] font-medium text-white transition-colors hover:bg-[#e62d00] sm:inline-flex lg:h-12 lg:w-[176px]"
          >
            تواصل معنا
          </Link>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg bg-surface-2 text-ink lg:hidden"
            aria-label="القائمة"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <MegaMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} />
      </div>

      {mobileOpen && (
        <div className="border-t border-border-soft bg-surface px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-2" aria-label="التنقّل (موبايل)">
            {categories
              .filter((c) => c.count > 0)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  {c.title}
                  <CountBadge n={c.count} />
                </Link>
              ))}
            <Link
              href="/portfolio"
              className="flex items-center gap-2 rounded-lg bg-surface-2 px-4 py-3 text-sm"
              onClick={() => setMobileOpen(false)}
            >
              <LayoutGrid className="size-4" /> كل ملفات الأعمال
            </Link>
            <Link
              href={contactHref}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-brand text-[15px] font-medium text-white"
            >
              تواصل معنا
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
