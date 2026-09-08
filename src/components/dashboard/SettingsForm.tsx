"use client";

import { useActionState, useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { saveSettingsAction, type ActionState } from "@/app/dashboard/actions";
import { SubmitButton } from "./SubmitButton";
import { SingleImageUploader } from "./ImageUploader";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState<ActionState, FormData>(saveSettingsAction, {});
  const [heroImage, setHeroImage] = useState(settings.hero.image);
  const [dismissed, setDismissed] = useState<ActionState | null>(null);
  const flash = state.ok && state.message && dismissed !== state ? state.message : null;

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setDismissed(state), 3500);
    return () => clearTimeout(t);
  }, [flash, state]);

  const stats = [0, 1, 2].map((i) => settings.hero.stats[i] ?? { value: "", label: "" });

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-8">
        <Card title="الواجهة الرئيسية (Hero)" desc="العنوان والوصف والصورة الكبيرة في أعلى الصفحة الرئيسية.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label">السطر الأول</label>
              <input name="hero.titleLine1" defaultValue={settings.hero.titleLine1} className="field" />
            </div>
            <div>
              <label className="label">السطر الثاني</label>
              <input name="hero.titleLine2" defaultValue={settings.hero.titleLine2} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">الوصف</label>
              <textarea name="hero.subtitle" defaultValue={settings.hero.subtitle} rows={2} className="field" />
            </div>
            <div className="sm:col-span-2">
              <SingleImageUploader
                name="hero.image"
                value={heroImage}
                onChange={setHeroImage}
                label="صورة الـ Hero"
                aspect="aspect-[1640/620]"
                hint="مقاس عريض (1640×810 أو أكبر)."
              />
            </div>
          </div>

          <div className="mt-6">
            <span className="label">إحصائيات الوكالة (تظهر أسفل الـ Hero — اتركها فارغة لإخفائها)</span>
            <div className="grid gap-3">
              {stats.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <input name={`hero.stats.${i}.value`} defaultValue={s.value} className="field tabular" placeholder="13,081" dir="ltr" />
                  <input name={`hero.stats.${i}.label`} defaultValue={s.label} className="field" placeholder="المتابعين" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="قسم أبرز الأعمال">
          <div className="grid gap-5">
            <div>
              <label className="label">العنوان</label>
              <input name="featured.title" defaultValue={settings.featured.title} className="field" />
            </div>
            <div>
              <label className="label">الوصف</label>
              <textarea name="featured.subtitle" defaultValue={settings.featured.subtitle} rows={2} className="field" />
            </div>
          </div>
        </Card>

        <Card title="بيانات التواصل" desc="زر «تواصل معنا» يفتح واتساب إن وُجد، وإلا البريد، وإلا الهاتف.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label">واتساب (بالرمز الدولي)</label>
              <input name="contact.whatsapp" defaultValue={settings.contact.whatsapp} className="field" placeholder="9665xxxxxxxx" dir="ltr" />
            </div>
            <div>
              <label className="label">الهاتف</label>
              <input name="contact.phone" defaultValue={settings.contact.phone} className="field" placeholder="+966 5x xxx xxxx" dir="ltr" />
            </div>
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input name="contact.email" type="email" defaultValue={settings.contact.email} className="field" placeholder="hello@milaknights.com" dir="ltr" />
            </div>
            <div>
              <label className="label">إنستجرام (رابط كامل)</label>
              <input name="contact.instagram" defaultValue={settings.contact.instagram} className="field" placeholder="https://instagram.com/milaknights" dir="ltr" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">العنوان</label>
              <input name="contact.address" defaultValue={settings.contact.address} className="field" />
            </div>
          </div>
        </Card>

        <Card title="قائمة الخدمات الموحدة" desc="تظهر كاقتراحات عند إنشاء ملف أعمال حتى تبقى المسمّيات موحدة عبر كل العملاء. خدمة في كل سطر.">
          <textarea name="services" defaultValue={settings.services.join("\n")} rows={8} className="field" dir="rtl" />
        </Card>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="text-sm font-bold text-ink">حفظ</h3>
          <p className="mt-1 text-xs text-ink-3">تُطبَّق التغييرات على الموقع فوراً.</p>
          {state.error && !state.ok && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
          {flash && (
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="size-4" /> {flash}
            </p>
          )}
          <SubmitButton className="mt-5 w-full">حفظ الإعدادات</SubmitButton>
        </div>
      </aside>
    </form>
  );
}

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {desc && <p className="mt-1 text-sm text-ink-3">{desc}</p>}
      </div>
      {children}
    </section>
  );
}
