"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { isVideo, videoMime } from "@/lib/media";
import { cn } from "@/lib/cn";

/** معرض الوسائط الداخلية (صور + فيديو): شبكة + عارض ملء الشاشة بالأسهم ولوحة المفاتيح */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const total = images.length;

  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i + 1) % total));
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i - 1 + total) % total));
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, total]);

  if (total === 0) return null;

  return (
    <>
      <div className={cn("grid gap-4", total === 1 ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
        {images.map((src, i) => {
          const video = isVideo(src);
          return (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setOpen(i)}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-border transition hover:opacity-95",
                total === 1 ? "aspect-[16/9]" : i === 0 && total >= 3 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]",
              )}
              aria-label={video ? `تشغيل الفيديو ${i + 1}` : `عرض الصورة ${i + 1}`}
            >
              {video ? (
                <>
                  <video
                    src={`${src}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/25 transition-colors group-hover:bg-black/35">
                    <span className="grid size-14 place-items-center rounded-full bg-white/90 text-ink shadow-lg backdrop-blur transition-transform group-hover:scale-105">
                      <Play className="ms-1 size-6 fill-current" />
                    </span>
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white">فيديو</span>
                </>
              ) : (
                <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="(max-width: 1024px) 50vw, 600px" className="object-cover" />
              )}
            </button>
          );
        })}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="إغلاق"
            onClick={() => setOpen(null)}
          >
            <X className="size-5" />
          </button>
          {total > 1 && (
            <>
              <button
                type="button"
                className="absolute right-4 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="السابقة"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? i : (i - 1 + total) % total));
                }}
              >
                <ChevronRight className="size-5" />
              </button>
              <button
                type="button"
                className="absolute left-4 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="التالية"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? i : (i + 1) % total));
                }}
              >
                <ChevronLeft className="size-5" />
              </button>
            </>
          )}
          <div className="relative h-[85vh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            {isVideo(images[open]) ? (
              <video
                key={images[open]}
                controls
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full rounded-xl bg-black object-contain"
              >
                <source src={images[open]} type={videoMime(images[open])} />
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            ) : (
              <Image src={images[open]} alt={`${alt} ${open + 1}`} fill sizes="100vw" className="object-contain" priority />
            )}
          </div>
          <span className="tabular absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
            {open + 1} / {total}
          </span>
        </div>
      )}
    </>
  );
}
