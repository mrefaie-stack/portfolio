"use client";

import { Trash2 } from "lucide-react";
import { deletePortfolioAction } from "@/app/dashboard/actions";
import { cn } from "@/lib/cn";

const formId = (id: string) => `delete-portfolio-${id}`;

/**
 * نموذج الحذف — يُعرض خارج أي نموذج آخر (لا يجوز تداخل <form>).
 * الزر قد يكون في مكان آخر ويشير إليه عبر خاصية form.
 */
export function DeleteForm({ id }: { id: string }) {
  return (
    <form id={formId(id)} action={deletePortfolioAction} className="hidden">
      <input type="hidden" name="id" value={id} />
    </form>
  );
}

/**
 * زر حذف مع تأكيد.
 * - `standalone` (افتراضي): يرسم النموذج والزر معاً (للاستخدام في الجداول).
 * - `standalone={false}`: زر فقط يشير إلى <DeleteForm id /> المرسوم خارج النموذج الأب.
 */
export function DeleteButton({
  id,
  name,
  className,
  compact,
  standalone = true,
}: {
  id: string;
  name: string;
  className?: string;
  compact?: boolean;
  standalone?: boolean;
}) {
  const confirmDelete = (e: React.SyntheticEvent) => {
    if (!confirm(`حذف ملف الأعمال "${name}" نهائياً؟`)) e.preventDefault();
  };

  const button = (
    <button
      type="submit"
      form={standalone ? undefined : formId(id)}
      onClick={standalone ? undefined : confirmDelete}
      className={cn(
        compact
          ? "grid size-8 place-items-center rounded-md text-ink-3 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          : "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700",
        !standalone && className,
      )}
      aria-label="حذف"
      title="حذف"
    >
      <Trash2 className="size-4" />
      {!compact && "حذف"}
    </button>
  );

  if (!standalone) return button;

  return (
    <form action={deletePortfolioAction} onSubmit={confirmDelete} className={cn(compact ? "inline" : "block", className)}>
      <input type="hidden" name="id" value={id} />
      {button}
    </form>
  );
}
