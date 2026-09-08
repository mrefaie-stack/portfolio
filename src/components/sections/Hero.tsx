import Image from "next/image";
import type { SiteSettings } from "@/lib/types";

/**
 * قسم الـ Hero — 1640×810 في Figma، حواف 40px، صورة مع تدرّج داكن،
 * عنوان أبيض في المنتصف، وبطاقات إحصائيات تستقر على "فتحة" بلون خلفية الصفحة.
 * الإحصائيات هنا عامة للوكالة (تُحرَّر من الإعدادات) وليست لعميل معيّن.
 */
export function Hero({ hero }: { hero: SiteSettings["hero"] }) {
  const stats = hero.stats.filter((s) => s.value && s.label);
  return (
    <section className="mx-auto w-full max-w-[1920px] px-4 pt-6 sm:px-8 lg:pt-[60px] xl:px-[140px]">
      <div className="relative overflow-hidden rounded-[24px] lg:rounded-hero">
        <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[1640/810]">
          <Image
            src={hero.image}
            alt=""
            fill
            priority
            sizes="(max-width: 1920px) 100vw, 1640px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.20)_55%,rgba(0,0,0,0.75)_100%)]" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-24 pt-10 text-center text-white sm:pb-28 lg:pb-16 lg:pt-[190px]">
          <h1 className="max-w-[777px] text-[34px] font-bold leading-[1.25] sm:text-5xl lg:text-[64px] lg:leading-[80px]">
            {hero.titleLine1}
            <span className="text-brand">.</span>
            <br />
            {hero.titleLine2}
          </h1>
          <p className="mt-4 max-w-[777px] text-base leading-relaxed text-white/90 sm:text-lg lg:mt-5 lg:text-2xl lg:leading-9">
            {hero.subtitle}
          </p>
        </div>

        {stats.length > 0 && (
          <>
            <div
              className="hero-notch hidden w-[min(760px,80%)] sm:block"
              style={{ ["--bg-bottom-hero" as string]: "var(--bg-top)" }}
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-center px-4">
              <ul className="flex w-full max-w-[699px] items-end justify-center gap-2 sm:gap-3">
                {stats.map((s, i) => (
                  <li
                    key={`${s.label}-${i}`}
                    className="hero-stat flex flex-1 flex-col items-center gap-1 px-2 pb-4 pt-4 text-center sm:pb-5 sm:pt-5"
                  >
                    <span className="tabular text-xl font-bold leading-none text-brand sm:text-[28px] lg:text-[32px]">
                      {s.value}
                    </span>
                    <span className="text-[11px] text-white sm:text-sm sm:text-ink-2">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
