"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/** يفصل الرقم عن أي بادئة/لاحقة: "+6.4M" → ["+", "6.4", "M"] */
const NUM = /^([^\d]*)([\d,]+(?:\.\d+)?)([\s\S]*)$/;

/** يعيد تنسيق الرقم بنفس شكل الأصل (فواصل الآلاف وعدد الخانات العشرية) */
function format(n: number, sample: string) {
  const decimals = (sample.split(".")[1] ?? "").length;
  const fixed = n.toFixed(decimals);
  if (!sample.includes(",")) return fixed;
  const [int, dec] = fixed.split(".");
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (dec ? `.${dec}` : "");
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * عدّاد تصاعدي يبدأ أول ما يظهر الرقم على الشاشة.
 * يُكتب النص مباشرة في العنصر (بلا إعادة رسم لكل إطار)، والقيمة النهائية
 * موجودة في HTML من الخادم — فلو تعطّل الجافاسكربت أو فُعّل "تقليل الحركة" يظهر الرقم كما هو.
 */
export function CountUp({ value, className, duration = 1400 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  // نضع الرقم عند الصفر قبل أول رسم حتى لا تظهر قفزة من القيمة النهائية
  useIsoLayoutEffect(() => {
    const el = ref.current;
    const parts = NUM.exec(value);
    if (!el || !parts) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.textContent = parts[1] + format(0, parts[2]) + parts[3];
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    const parts = NUM.exec(value);
    if (!el || !parts) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = Number(parts[2].replace(/,/g, ""));
    if (!Number.isFinite(target)) {
      el.textContent = value;
      return;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = parts[1] + format(target * eased, parts[2]) + parts[3];
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
