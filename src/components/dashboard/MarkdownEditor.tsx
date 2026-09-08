"use client";

import { useRef, useState } from "react";
import { Bold, Heading2, Heading3, ImagePlus, Link2, List, ListOrdered, Loader2, Quote } from "lucide-react";
import { Markdown } from "@/components/ui/Markdown";
import { cn } from "@/lib/cn";

/**
 * محرّر المقالة: Markdown مع شريط أدوات بسيط ومعاينة حيّة.
 * زر الصورة يرفع الملف ويُدرج ![وصف](رابط) في مكان المؤشر.
 */
export function MarkdownEditor({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function wrap(before: string, after = before, placeholder = "نص") {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }

  function linePrefix(prefix: string, placeholder = "عنوان") {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const hasText = value.slice(lineStart, el.selectionEnd).trim().length > 0;
    const insert = hasText ? prefix : prefix + placeholder;
    const next = value.slice(0, lineStart) + insert + value.slice(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = lineStart + insert.length;
      el.setSelectionRange(hasText ? pos : lineStart + prefix.length, pos);
    });
  }

  async function insertImage(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("files", f);
      const res = await fetch("/api/upload?kind=image", { method: "POST", body: fd });
      const data = (await res.json()) as { urls?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error);
      const md = (data.urls ?? []).map((u) => `\n![صورة](${u})\n`).join("");
      const el = ref.current;
      const s = el?.selectionStart ?? value.length;
      onChange(value.slice(0, s) + md + value.slice(s));
    } catch (e) {
      alert((e as Error).message || "فشل رفع الصورة");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  type Tool = "h2" | "h3" | "bold" | "ul" | "ol" | "quote" | "link";
  const tools: { id: Tool; title: string; icon: typeof Bold }[] = [
    { id: "h2", title: "عنوان رئيسي", icon: Heading2 },
    { id: "h3", title: "عنوان فرعي", icon: Heading3 },
    { id: "bold", title: "غامق", icon: Bold },
    { id: "ul", title: "قائمة", icon: List },
    { id: "ol", title: "قائمة مرقّمة", icon: ListOrdered },
    { id: "quote", title: "اقتباس", icon: Quote },
    { id: "link", title: "رابط", icon: Link2 },
  ];

  function runTool(id: Tool) {
    switch (id) {
      case "h2":
        return linePrefix("## ");
      case "h3":
        return linePrefix("### ");
      case "bold":
        return wrap("**");
      case "ul":
        return linePrefix("- ", "عنصر");
      case "ol":
        return linePrefix("1. ", "عنصر");
      case "quote":
        return linePrefix("> ", "اقتباس");
      case "link":
        return wrap("[", "](https://)", "نص الرابط");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-soft bg-surface-2/60 px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-0.5">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.title}
                type="button"
                title={t.title}
                aria-label={t.title}
                onClick={() => runTool(t.id)}
                disabled={tab === "preview"}
                className="grid size-8 place-items-center rounded-md text-ink-2 hover:bg-surface hover:text-ink disabled:opacity-40"
              >
                <Icon className="size-4" />
              </button>
            );
          })}
          <button
            type="button"
            title="إدراج صورة"
            aria-label="إدراج صورة"
            onClick={() => fileRef.current?.click()}
            disabled={tab === "preview" || busy}
            className="grid size-8 place-items-center rounded-md text-ink-2 hover:bg-surface hover:text-ink disabled:opacity-40"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => insertImage(e.target.files)} />
        </div>
        <div className="flex rounded-lg bg-surface p-0.5 text-xs">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("rounded-md px-3 py-1.5 transition-colors", tab === t ? "bg-ink text-white dark:bg-white dark:text-black" : "text-ink-2")}
            >
              {t === "write" ? "تحرير" : "معاينة"}
            </button>
          ))}
        </div>
      </div>

      <textarea name={name} value={value} onChange={(e) => onChange(e.target.value)} className="hidden" readOnly hidden />

      {tab === "write" ? (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"## التحدي\n\nاكتب قصة العميل هنا…\n\n## ما قمنا به\n\n- \n\n## النتيجة"}
          className="min-h-[420px] w-full resize-y bg-transparent p-4 text-[15px] leading-8 text-ink outline-none placeholder:text-ink-3"
        />
      ) : (
        <div className="min-h-[420px] p-6">
          {value.trim() ? <Markdown content={value} /> : <p className="text-sm text-ink-3">لا يوجد محتوى للمعاينة.</p>}
        </div>
      )}
    </div>
  );
}
