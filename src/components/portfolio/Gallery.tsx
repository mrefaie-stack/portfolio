"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";

/** معرض الصور الداخلية: شبكة + عارض ملء الشاشة بالأسهم ولوحة المفاتيح */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className={cn("grid gap-4", images.length === 1 ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            className={cn(
              "relative overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-border transition hover:opacity-95",
              images.length === 1 ? "aspect-[16/9]" : i === 0 && images.length >= 3 ? "col-span-2 aspect-[16/9] lg:col-span-2" : "aspect-[4/3]",
            )}
            aria-label={`عرض الصورة ${i + 1}`}
          >
            <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="(max-width: 1024px) 50vw, 600px" className="object-cover" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="إغلاق"
            onClick={() => setOpen(null)}
          >
            <X className="size-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="السابقة"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
                }}
              >
                <ChevronRight className="size-5" />
              </button>
              <button
                type="button"
                className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="التالية"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? i : (i + 1) % images.length));
                }}
              >
                <ChevronLeft className="size-5" />
              </button>
            </>
          )}
          <div className="relative h-[85vh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[open]} alt={`${alt} ${open + 1}`} fill sizes="100vw" className="object-contain" priority />
          </div>
          <span className="tabular absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
            {open + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
