"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { isVideo, videoMime } from "@/lib/media";
import { cn } from "@/lib/cn";

export type MediaItem = { src: string; alt: string };

/**
 * وسائط داخل المقالة بإطار موحّد (16:9، حواف دائرية، خلفية هادئة، بلا قصّ).
 * عنصر واحد → إطار ثابت مع تعليق. أكثر من عنصر → سلايدر بأسهم ونقاط.
 * الفيديو يُدرج بنفس صيغة الصورة ![وصف](رابط.mp4) ويُعرض بمشغّل.
 */
export function ArticleMedia({ items }: { items: MediaItem[] }) {
  const [i, setI] = useState(0);
  if (items.length === 0) return null;
  const many = items.length > 1;
  const cur = items[Math.min(i, items.length - 1)];
  const go = (d: 1 | -1) => setI((x) => (x + d + items.length) % items.length);

  return (
    <figure className="not-prose mx-auto my-8 w-full max-w-[680px]">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-2">
        <div className="relative aspect-[16/9] w-full">
          {isVideo(cur.src) ? (
            <video key={cur.src} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full bg-black object-contain">
              <source src={cur.src} type={videoMime(cur.src)} />
            </video>
          ) : (
            <Image
              key={cur.src}
              src={cur.src}
              alt={cur.alt}
              fill
              sizes="(max-width: 768px) 100vw, 680px"
              className="object-contain"
            />
          )}
        </div>

        {many && (
          <>
            <button
              type="button"
              aria-label="السابق"
              onClick={() => go(-1)}
              className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow backdrop-blur transition hover:bg-white dark:bg-black/60 dark:text-white"
            >
              <ChevronRight className="size-4" />
            </button>
            <button
              type="button"
              aria-label="التالي"
              onClick={() => go(1)}
              className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow backdrop-blur transition hover:bg-white dark:bg-black/60 dark:text-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="tabular absolute right-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white">
              {i + 1} / {items.length}
            </span>
          </>
        )}
      </div>

      {many && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {items.map((it, k) => (
            <button
              key={`${it.src}-${k}`}
              type="button"
              aria-label={`العنصر ${k + 1}`}
              onClick={() => setI(k)}
              className={cn(
                "relative size-12 overflow-hidden rounded-lg border transition",
                k === i ? "border-brand ring-2 ring-brand/30" : "border-border opacity-70 hover:opacity-100",
              )}
            >
              {isVideo(it.src) ? (
                <span className="grid h-full w-full place-items-center bg-black/80 text-white">
                  <Play className="size-4 fill-current" />
                </span>
              ) : (
                <Image src={it.src} alt="" fill sizes="48px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {cur.alt && cur.alt !== "صورة" && cur.alt !== "فيديو" && (
        <figcaption className="mt-2 text-center text-[13px] text-ink-3">{cur.alt}</figcaption>
      )}
    </figure>
  );
}
