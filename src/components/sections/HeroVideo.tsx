"use client";

import { useEffect, useRef } from "react";
import { videoMime } from "@/lib/media";

/**
 * فيديو خلفية الـ Hero: صامت ومتكرر ويبدأ تلقائياً.
 * نضبط `muted` من الكود أيضاً لأن المتصفحات لا تسمح بالتشغيل التلقائي بدونه،
 * ونوقفه إذا كان المستخدم مفعّلاً خيار "تقليل الحركة" في نظامه.
 */
export function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    void v.play().catch(() => {
      /* بعض المتصفحات ترفض التشغيل التلقائي — تبقى صورة الـ poster ظاهرة */
    });
  }, [src]);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster || undefined}
      aria-hidden
      tabIndex={-1}
    >
      <source src={src} type={videoMime(src)} />
    </video>
  );
}
