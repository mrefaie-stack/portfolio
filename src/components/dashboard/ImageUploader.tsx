"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, MoveLeft, MoveRight, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

async function upload(files: FileList | File[]): Promise<string[]> {
  const fd = new FormData();
  for (const f of Array.from(files)) fd.append("files", f);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as { urls?: string[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? "فشل الرفع");
  return data.urls ?? [];
}

/** رفع صورة واحدة (الغلاف / صورة الـ Hero) — يخزّن الرابط في input مخفي بالاسم المعطى */
export function SingleImageUploader({
  name,
  value,
  onChange,
  aspect = "aspect-[530/300]",
  label,
  hint,
  error,
}: {
  name: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
  label: string;
  hint?: string;
  error?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      const [url] = await upload([files[0]]);
      if (url) onChange(url);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={value} />
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed bg-surface-2 transition-colors",
          aspect,
          error ? "border-red-400" : "border-border hover:border-brand/50",
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handle(e.dataTransfer.files);
        }}
      >
        {value ? (
          <Image src={value} alt="" fill sizes="600px" className="object-cover" unoptimized />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-ink-3"
          >
            <ImagePlus className="size-8" strokeWidth={1.5} />
            اسحب صورة هنا أو اضغط للاختيار
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
            <Loader2 className="size-7 animate-spin" />
          </div>
        )}
        {value && !busy && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow hover:bg-white"
            >
              تغيير
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-red-600 shadow hover:bg-white"
            >
              إزالة
            </button>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files)} />
      {(err || error) && <p className="hint text-red-600">{err ?? error}</p>}
      {hint && !err && !error && <p className="hint">{hint}</p>}
    </div>
  );
}

/** رفع عدة صور (المعرض الداخلي) مع ترتيب وحذف وتعيين إحداها كغلاف */
export function MultiImageUploader({
  name,
  value,
  onChange,
  onSetCover,
  label,
  hint,
}: {
  name: string;
  value: string[];
  onChange: (urls: string[]) => void;
  onSetCover?: (url: string) => void;
  label: string;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      const urls = await upload(files);
      onChange([...value, ...urls]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handle(e.dataTransfer.files);
        }}
      >
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-2">
            <Image src={url} alt="" fill sizes="300px" className="object-cover" unoptimized />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-1">
                <IconBtn title="لليمين" onClick={() => move(i, -1)} disabled={i === 0}>
                  <MoveRight className="size-3.5" />
                </IconBtn>
                <IconBtn title="لليسار" onClick={() => move(i, 1)} disabled={i === value.length - 1}>
                  <MoveLeft className="size-3.5" />
                </IconBtn>
              </div>
              <div className="flex gap-1">
                {onSetCover && (
                  <IconBtn title="استخدام كغلاف" onClick={() => onSetCover(url)}>
                    <Star className="size-3.5" />
                  </IconBtn>
                )}
                <IconBtn title="حذف الصورة" onClick={() => onChange(value.filter((_, k) => k !== i))} danger>
                  <Trash2 className="size-3.5" />
                </IconBtn>
              </div>
            </div>
            <span className="tabular absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">{i + 1}</span>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-2 text-xs text-ink-3 transition-colors hover:border-brand/50 disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" strokeWidth={1.5} />}
          {busy ? "جارٍ الرفع…" : "إضافة صور"}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handle(e.target.files)} />
      {err && <p className="hint text-red-600">{err}</p>}
      {hint && !err && <p className="hint">{hint}</p>}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-7 place-items-center rounded-md bg-white/90 text-ink shadow hover:bg-white disabled:opacity-40",
        danger && "text-red-600",
      )}
    >
      {children}
    </button>
  );
}
