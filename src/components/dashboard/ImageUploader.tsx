"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Check, Clapperboard, ImagePlus, Link2, Loader2, MoveLeft, MoveRight, Play, Star, Trash2, X } from "lucide-react";
import { drivePoster, isEmbed, isExternal, isVideo, resolveMediaLink } from "@/lib/media";
import { cn } from "@/lib/cn";

async function upload(files: FileList | File[], kind: "image" | "media" = "image"): Promise<string[]> {
  const fd = new FormData();
  for (const f of Array.from(files)) fd.append("files", f);
  const res = await fetch(kind === "image" ? "/api/upload?kind=image" : "/api/upload", { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as { urls?: string[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? "فشل الرفع");
  return data.urls ?? [];
}

/**
 * لوحة لصق رابط خارجي (Google Drive أو رابط مباشر) — بديل الرفع لتوفير مساحة السيرفر.
 */
function LinkPanel({
  allowVideo,
  onAdd,
  onClose,
}: {
  allowVideo: boolean;
  onAdd: (url: string) => void;
  onClose: () => void;
}) {
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { url, kind } = await resolveMediaLink(link);
      if (kind !== "image" && !allowVideo) {
        setError(kind === "doc" ? "هذا مستند — استخدمه في المعرض، أما هنا فصورة فقط." : "هذا الملف فيديو — استخدمه في المعرض، أما هنا فصورة فقط.");
        return;
      }
      onAdd(url);
      setLink("");
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-2/60 p-3">
      <div className="flex gap-2">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submit();
            }
          }}
          dir="ltr"
          autoFocus
          placeholder="https://drive.google.com/file/d/…/view"
          className="field h-10 min-w-0 flex-1 text-left"
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy || !link.trim()}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-sm font-medium text-white hover:bg-[#e62d00] disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {busy ? "جارٍ الفحص…" : "إضافة"}
        </button>
      </div>
      {error ? (
        <p className="hint text-red-600">{error}</p>
      ) : (
        <p className="hint">
          الصق رابط الملف من Drive — يتعرّف تلقائياً إن كان صورة أو فيديو أو PDF. تأكد أنه مشارَك بـ «أي شخص لديه الرابط».
        </p>
      )}
    </div>
  );
}

/** معاينة عنصر داخل الداشبورد: إطار Drive، فيديو، أو صورة */
function Preview({ url, alt = "" }: { url: string; alt?: string }) {
  if (isEmbed(url)) {
    const poster = drivePoster(url);
    return (
      <>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 bg-black" />
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/30">
          <span className="grid size-9 place-items-center rounded-full bg-white/90 text-ink">
            <Play className="ms-0.5 size-4 fill-current" />
          </span>
        </span>
      </>
    );
  }
  if (isVideo(url)) {
    return (
      <>
        <video src={`${url}#t=0.1`} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-0 grid place-items-center bg-black/25">
          <span className="grid size-9 place-items-center rounded-full bg-white/90 text-ink">
            <Play className="ms-0.5 size-4 fill-current" />
          </span>
        </span>
      </>
    );
  }
  if (isExternal(url)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt} className="absolute inset-0 h-full w-full object-cover" />;
  }
  return <Image src={url} alt={alt} fill sizes="600px" className="object-cover" unoptimized />;
}

/**
 * رفع ملف واحد (الغلاف / صورة أو فيديو الـ Hero) — يخزّن الرابط في input مخفي بالاسم المعطى.
 * `kind="media"` يسمح بالفيديو إضافة إلى الصور.
 */
export function SingleImageUploader({
  name,
  value,
  onChange,
  aspect = "aspect-[530/300]",
  label,
  hint,
  error,
  kind = "image",
}: {
  name: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
  label: string;
  hint?: string;
  error?: string;
  kind?: "image" | "media";
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      const [url] = await upload([files[0]], kind);
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
          <Preview url={value} />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-ink-3"
          >
            {kind === "media" ? <Clapperboard className="size-8" strokeWidth={1.5} /> : <ImagePlus className="size-8" strokeWidth={1.5} />}
            {kind === "media" ? "اسحب صورة أو فيديو هنا أو اضغط للاختيار" : "اسحب صورة هنا أو اضغط للاختيار"}
          </button>
        )}
        {!value && !busy && (
          <button
            type="button"
            onClick={() => setLinking((v) => !v)}
            className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-ink-2 hover:bg-surface-2"
          >
            <Link2 className="size-3.5" />
            أو الصق رابط Drive
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
      <input
        ref={inputRef}
        type="file"
        accept={kind === "media" ? "image/*,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v" : "image/*"}
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
      {linking && !value && (
        <LinkPanel allowVideo={kind === "media"} onAdd={(url) => onChange(url)} onClose={() => setLinking(false)} />
      )}
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
  const [linking, setLinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      const urls = await upload(files, "media");
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
            <Preview url={url} />
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
                {onSetCover && !isVideo(url) && !isEmbed(url) && (
                  <IconBtn title="استخدام كغلاف" onClick={() => onSetCover(url)}>
                    <Star className="size-3.5" />
                  </IconBtn>
                )}
                <IconBtn title="حذف العنصر" onClick={() => onChange(value.filter((_, k) => k !== i))} danger>
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
          {busy ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <span className="flex items-center gap-1.5 text-ink-3">
              <ImagePlus className="size-6" strokeWidth={1.5} />
              <Clapperboard className="size-5" strokeWidth={1.5} />
            </span>
          )}
          {busy ? "جارٍ الرفع…" : "إضافة صور أو فيديو"}
        </button>
        <button
          type="button"
          onClick={() => setLinking((v) => !v)}
          className={cn(
            "flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-xs transition-colors",
            linking ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface-2 text-ink-3 hover:border-brand/50",
          )}
        >
          {linking ? <X className="size-6" strokeWidth={1.5} /> : <Link2 className="size-6" strokeWidth={1.5} />}
          رابط Drive
        </button>
      </div>
      {linking && (
        <LinkPanel allowVideo onAdd={(url) => onChange([...value, url])} onClose={() => setLinking(false)} />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
        multiple
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
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
