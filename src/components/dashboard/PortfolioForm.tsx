"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Plus, X } from "lucide-react";
import type { Category, Portfolio, Stat } from "@/lib/types";
import { savePortfolioAction, type ActionState } from "@/app/dashboard/actions";
import { slugify } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SubmitButton } from "./SubmitButton";
import { MultiImageUploader, SingleImageUploader } from "./ImageUploader";
import { MarkdownEditor } from "./MarkdownEditor";
import { DeleteButton, DeleteForm } from "./DeleteButton";

const linkFields: {
  key: keyof Portfolio["links"];
  label: string;
  placeholder: string;
}[] = [
  {
    key: "website",
    label: "الموقع الإلكتروني",
    placeholder: "https://example.com",
  },
  {
    key: "instagram",
    label: "إنستجرام",
    placeholder: "https://instagram.com/…",
  },
  { key: "facebook", label: "فيسبوك", placeholder: "https://facebook.com/…" },
  { key: "tiktok", label: "تيك توك", placeholder: "https://tiktok.com/@…" },
  { key: "other", label: "رابط إضافي", placeholder: "https://" },
];

/**
 * نموذج ملف الأعمال — القسم الأول "الأساسيات" موحّد لكل العملاء،
 * والقسم الثاني "القصة" مقالة حرة، والثالث أرقام اختيارية.
 */
export function PortfolioForm({
  portfolio,
  categories,
  serviceSuggestions,
  created,
}: {
  portfolio: Portfolio;
  categories: Category[];
  serviceSuggestions: string[];
  created?: boolean;
}) {
  const isNew = !portfolio.id;
  const [state, action] = useActionState<ActionState, FormData>(
    savePortfolioAction,
    {},
  );
  const errors = state.errors ?? {};

  const [clientName, setClientName] = useState(portfolio.clientName);
  const [slug, setSlug] = useState(portfolio.slug);
  const [slugTouched, setSlugTouched] = useState(!!portfolio.slug);
  const [cover, setCover] = useState(portfolio.cover);
  const [gallery, setGallery] = useState<string[]>(portfolio.gallery);
  const [services, setServices] = useState<string[]>(portfolio.services);
  const [newService, setNewService] = useState("");
  const [highlights, setHighlights] = useState<Stat[]>(portfolio.highlights);
  const [body, setBody] = useState(portfolio.body);
  const [status, setStatus] = useState<Portfolio["status"]>(portfolio.status);
  const [summary, setSummary] = useState(portfolio.summary);
  // الحقول التالية controlled أيضاً: React 19 يعيد ضبط الحقول غير الـ controlled بعد كل إرسال،
  // فلا تضيع قيمها عند رجوع أخطاء التحقق من الخادم.
  const [category, setCategory] = useState(portfolio.category);
  const [date, setDate] = useState(portfolio.date);
  const [featured, setFeatured] = useState(portfolio.featured);
  const [links, setLinks] = useState<Portfolio["links"]>(portfolio.links);
  // React يعيد ضبط <select> بعد إرسال النموذج ولا يعيد تطبيق القيمة الـ controlled دائماً — نعيد مزامنتها يدوياً
  const categoryRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (categoryRef.current && categoryRef.current.value !== category) categoryRef.current.value = category;
  }, [state, category]);
  // رسالة النجاح: تُشتق من حالة الإجراء وتختفي بعد ثوانٍ (setState داخل المؤقّت فقط)
  const [dismissed, setDismissed] = useState<ActionState | "created" | null>(
    null,
  );
  const flash =
    state.ok && state.message && dismissed !== state
      ? state.message
      : created && dismissed !== "created" && !state.ok
        ? "تم إنشاء ملف الأعمال"
        : null;

  useEffect(() => {
    if (!flash) return;
    const target: ActionState | "created" = state.ok ? state : "created";
    const t = setTimeout(() => setDismissed(target), 3500);
    return () => clearTimeout(t);
  }, [flash, state]);

  const suggestions = [...new Set([...serviceSuggestions, ...services])];

  function addService(s: string) {
    const v = s.trim();
    if (!v) return;
    if (!services.includes(v)) setServices([...services, v]);
    setNewService("");
  }

  return (
    <>
      <form
        action={action}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <input type="hidden" name="id" value={portfolio.id} />
        <input type="hidden" name="services" value={JSON.stringify(services)} />
        <input
          type="hidden"
          name="highlights"
          value={JSON.stringify(highlights)}
        />
        <input type="hidden" name="status" value={status} />

        {/* ------------------------------------------------ العمود الرئيسي */}
        <div className="flex min-w-0 flex-col gap-8">
          <Section
            title="الأساسيات"
            desc="هذه الحقول موحّدة لكل عميل وتظهر على الكارت الخارجي وفي رأس الصفحة."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="اسم العميل"
                error={errors.clientName}
                className="sm:col-span-2"
              >
                <input
                  name="clientName"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  className="field"
                  placeholder="مثال: DermaCare Clinic"
                  required
                />
              </Field>

              <Field label="المجال" error={errors.category}>
                <select
                  ref={categoryRef}
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="field"
                  required
                >
                  <option value="" disabled>
                    اختر المجال…
                  </option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="تاريخ العمل" error={errors.date}>
                <input
                  name="date"
                  type="month"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="field"
                  dir="ltr"
                  required
                />
              </Field>

              <Field
                label="الملخص (يظهر على الكارت)"
                error={errors.summary}
                className="sm:col-span-2"
                hint={`${summary.length}/220 — جملة أو جملتان تلخّصان ما قدّمناه للعميل`}
              >
                <textarea
                  name="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  maxLength={220}
                  className="field"
                  placeholder="إدارة كاملة للحضور الرقمي: محتوى شهري، تصوير، وحملات ممولة…"
                  required
                />
              </Field>

              <Field
                label="نطاق العمل"
                className="sm:col-span-2"
                hint="اختر من القائمة الموحدة أو أضِف خدمة جديدة."
              >
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => {
                    const on = services.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setServices(
                            on
                              ? services.filter((x) => x !== s)
                              : [...services, s],
                          )
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                          on
                            ? "border-brand bg-brand-soft text-brand"
                            : "border-border bg-surface text-ink-2 hover:bg-surface-2",
                        )}
                      >
                        {on && <Check className="size-3.5" />}
                        {s}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addService(newService);
                      }
                    }}
                    className="field"
                    placeholder="خدمة أخرى…"
                  />
                  <button
                    type="button"
                    onClick={() => addService(newService)}
                    className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-surface text-ink hover:bg-surface-2"
                    aria-label="إضافة خدمة"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </Field>
            </div>
          </Section>

          <Section
            title="الصور"
            desc="الصورة الخارجية تظهر على الكارت ورأس الصفحة، والصور الداخلية تظهر في المعرض."
          >
            <div className="grid gap-6">
              <SingleImageUploader
                name="cover"
                value={cover}
                onChange={setCover}
                label="الصورة الخارجية (الغلاف)"
                hint="المقاس المفضّل 1060×600 أو أعرض. JPG/PNG/WebP حتى 10MB."
                error={errors.cover}
              />
              <MultiImageUploader
                name="gallery"
                value={gallery}
                onChange={setGallery}
                onSetCover={setCover}
                label="الصور الداخلية (المعرض)"
                hint="يمكنك سحب عدة صور مرة واحدة. مرّر على الصورة للترتيب أو الحذف أو استخدامها كغلاف."
              />
            </div>
          </Section>

          <Section
            title="القصة"
            desc="اكتب ملف الأعمال كمقالة: التحدي، ما قمنا به، النتيجة. يمكنك إدراج صور داخل النص."
          >
            <MarkdownEditor name="body" value={body} onChange={setBody} />
          </Section>

          <Section
            title="أرقام سريعة (اختياري)"
            desc="فقط للعملاء الذين لديهم نتائج رقمية. لا تظهر على الكارت الخارجي، بل داخل الصفحة."
          >
            <div className="grid gap-3">
              {highlights.map((h, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    value={h.value}
                    onChange={(e) =>
                      setHighlights(
                        highlights.map((x, k) =>
                          k === i ? { ...x, value: e.target.value } : x,
                        ),
                      )
                    }
                    className="field tabular"
                    placeholder="96,540"
                    dir="ltr"
                  />
                  <input
                    value={h.label}
                    onChange={(e) =>
                      setHighlights(
                        highlights.map((x, k) =>
                          k === i ? { ...x, label: e.target.value } : x,
                        ),
                      )
                    }
                    className="field"
                    placeholder="الظهور التراكمي"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setHighlights(highlights.filter((_, k) => k !== i))
                    }
                    className="grid size-11 place-items-center rounded-lg border border-border text-ink-3 hover:bg-surface-2 hover:text-red-600"
                    aria-label="حذف الرقم"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              {highlights.length < 4 && (
                <button
                  type="button"
                  onClick={() =>
                    setHighlights([...highlights, { value: "", label: "" }])
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-ink-2 hover:bg-surface-2"
                >
                  <Plus className="size-4" /> إضافة رقم ({highlights.length}/4)
                </button>
              )}
            </div>
          </Section>

          <Section title="الروابط (اختياري)">
            <div className="grid gap-4 sm:grid-cols-2">
              {linkFields.map((f) => (
                <Field
                  key={f.key}
                  label={f.label}
                  error={errors[`links.${f.key}`]}
                >
                  <input
                    name={`links.${f.key}`}
                    value={links[f.key] ?? ""}
                    onChange={(e) => setLinks({ ...links, [f.key]: e.target.value })}
                    className="field"
                    placeholder={f.placeholder}
                    dir="ltr"
                  />
                </Field>
              ))}
            </div>
          </Section>
        </div>

        {/* ------------------------------------------------ الشريط الجانبي */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-ink">النشر</h3>

            <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1 text-sm">
              {(["draft", "published"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "rounded-md py-2 transition-colors",
                    status === s
                      ? "bg-surface font-semibold text-ink shadow-sm"
                      : "text-ink-2",
                  )}
                >
                  {s === "draft" ? "مسودّة" : "منشور"}
                </button>
              ))}
            </div>

            <label className="mt-4 flex items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                name="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="size-4 accent-brand"
              />
              إظهار في &ldquo;أبرز الأعمال&rdquo;
            </label>

            <Field
              label="رابط الصفحة"
              error={errors.slug}
              className="mt-4"
              hint="يمكن تركه ليُولَّد من اسم العميل."
            >
              <div
                className="flex items-center gap-1 text-xs text-ink-3"
                dir="ltr"
              >
                <span className="shrink-0">/portfolio/</span>
                <input
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  onBlur={() => setSlug(slugify(slug))}
                  className="field h-10 min-w-0 text-left"
                />
              </div>
            </Field>

            {state.error && !state.ok && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {state.error}
              </p>
            )}
            {flash && (
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Check className="size-4" /> {flash}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <SubmitButton className="w-full">
                {isNew ? "إنشاء ملف الأعمال" : "حفظ التغييرات"}
              </SubmitButton>
              {!isNew && (
                <Link
                  href={`/portfolio/${portfolio.slug}`}
                  target="_blank"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface text-sm text-ink hover:bg-surface-2"
                >
                  <ExternalLink className="size-4" /> معاينة الصفحة
                </Link>
              )}
            </div>
          </div>

          {!isNew && (
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 dark:border-red-900 dark:bg-red-950/30">
              <h3 className="text-sm font-bold text-red-700 dark:text-red-300">
                حذف ملف الأعمال
              </h3>
              <p className="mt-1 text-xs text-ink-3">
                لا يمكن التراجع عن الحذف. الصور المرفوعة تبقى في المجلد.
              </p>
              <DeleteButton
                id={portfolio.id}
                name={portfolio.clientName}
                className="mt-3"
                standalone={false}
              />
            </div>
          )}
        </aside>
      </form>
      {!isNew && <DeleteForm id={portfolio.id} />}
    </>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
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

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      {children}
      {error ? (
        <p className="hint text-red-600">{error}</p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  );
}
