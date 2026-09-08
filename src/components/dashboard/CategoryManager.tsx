"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { deleteCategoryAction, moveCategoryAction, saveCategoryAction, type ActionState } from "@/app/dashboard/actions";
import { getIcon, iconNames } from "@/lib/icons";
import { pluralFiles } from "@/lib/format";
import { SubmitButton } from "./SubmitButton";
import { cn } from "@/lib/cn";

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(categories.length === 0);

  return (
    <div className="flex flex-col gap-6">
      <ul className="divide-y divide-border-soft overflow-hidden rounded-2xl border border-border bg-surface">
        {categories.map((c, i) => {
          const Icon = getIcon(c.icon);
          const used = counts[c.slug] ?? 0;
          if (editing === c.slug) {
            return (
              <li key={c.slug} className="p-4">
                <CategoryForm category={c} onDone={() => setEditing(null)} />
              </li>
            );
          }
          return (
            <li key={c.slug} className="flex items-center gap-4 px-4 py-3">
              <div className="flex flex-col">
                <form action={moveCategoryAction}>
                  <input type="hidden" name="slug" value={c.slug} />
                  <input type="hidden" name="dir" value="up" />
                  <button type="submit" disabled={i === 0} className="grid size-6 place-items-center text-ink-3 hover:text-ink disabled:opacity-30" aria-label="أعلى">
                    <ArrowUp className="size-3.5" />
                  </button>
                </form>
                <form action={moveCategoryAction}>
                  <input type="hidden" name="slug" value={c.slug} />
                  <input type="hidden" name="dir" value="down" />
                  <button
                    type="submit"
                    disabled={i === categories.length - 1}
                    className="grid size-6 place-items-center text-ink-3 hover:text-ink disabled:opacity-30"
                    aria-label="أسفل"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </form>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-2">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-ink">{c.title}</p>
                <p className="text-xs text-ink-3" dir="ltr">
                  /category/{c.slug} · <span dir="rtl">{pluralFiles(used)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(c.slug)}
                className="grid size-9 place-items-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
                aria-label="تحرير"
                title="تحرير"
              >
                <Pencil className="size-4" />
              </button>
              <form
                action={deleteCategoryAction}
                onSubmit={(e) => {
                  if (!confirm(`حذف المجال "${c.title}"؟`)) e.preventDefault();
                }}
              >
                <input type="hidden" name="slug" value={c.slug} />
                <button
                  type="submit"
                  disabled={used > 0}
                  title={used > 0 ? "لا يمكن حذف مجال فيه ملفات" : "حذف"}
                  aria-label="حذف"
                  className="grid size-9 place-items-center rounded-lg text-ink-3 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      {adding ? (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-4 text-sm font-bold text-ink">مجال جديد</h3>
          <CategoryForm onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-[#e62d00]"
        >
          <Plus className="size-4" /> إضافة مجال
        </button>
      )}
    </div>
  );
}

function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const [state, action] = useActionState<ActionState, FormData>(
    async (prev, fd) => {
      const r = await saveCategoryAction(prev, fd);
      if (r.ok) onDone();
      return r;
    },
    {},
  );
  const [icon, setIcon] = useState(category?.icon ?? iconNames[0]);
  const [title, setTitle] = useState(category?.title ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const errors = state.errors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="originalSlug" value={category?.slug ?? ""} />
      <input type="hidden" name="icon" value={icon} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">اسم المجال</label>
          <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} className="field" placeholder="المراكز الطبية" required />
          {errors.title && <p className="hint text-red-600">{errors.title}</p>}
        </div>
        <div>
          <label className="label">الرابط (slug)</label>
          <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="field" placeholder="medical" dir="ltr" />
          {errors.slug ? <p className="hint text-red-600">{errors.slug}</p> : <p className="hint">يُولَّد من الاسم إن تُرك فارغاً.</p>}
        </div>
      </div>
      <div>
        <span className="label">الأيقونة</span>
        <div className="flex flex-wrap gap-1.5">
          {iconNames.map((n) => {
            const I = getIcon(n);
            return (
              <button
                key={n}
                type="button"
                title={n}
                onClick={() => setIcon(n)}
                className={cn(
                  "grid size-10 place-items-center rounded-lg border transition-colors",
                  icon === n ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface text-ink-2 hover:bg-surface-2",
                )}
              >
                <I className="size-4.5" strokeWidth={1.75} />
              </button>
            );
          })}
        </div>
        {errors.icon && <p className="hint text-red-600">{errors.icon}</p>}
      </div>
      {state.error && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <SubmitButton>
          <Check className="size-4" /> {category ? "حفظ" : "إضافة"}
        </SubmitButton>
        <button type="button" onClick={onDone} className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm text-ink hover:bg-surface-2">
          <X className="size-4" /> إلغاء
        </button>
      </div>
    </form>
  );
}
