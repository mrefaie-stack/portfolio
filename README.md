# Mila Knights — Company Portfolio (Web + Dashboard)

موقع ملفات الأعمال لوكالة **ميلا نايتس**، مبني من تصميم Figma "Company Portfolio - Light"، مع **لوحة تحكم** لإدارة المحتوى ورفع الصور.

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** مع Design Tokens من Figma (`src/app/globals.css`)
- RTL بالكامل، متجاوب، وضع Light/Dark
- التخزين على ملفات JSON (بدون قاعدة بيانات) — قابل للاستبدال لاحقاً

## التشغيل

```bash
cp .env.example .env.local   # ثم عدّل ADMIN_PASSWORD و SESSION_SECRET
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # إنتاج
```

لوحة التحكم: **http://localhost:3000/dashboard** — كلمة المرور من `ADMIN_PASSWORD` في `.env.local`.

## الفكرة: نظام موحّد لكل عميل

كل ملف أعمال له نفس البنية بغض النظر عن نوع الخدمة (سوشيال ميديا، موقع، هوية…):

| الجزء | الحقول | أين يظهر |
|---|---|---|
| **الأساسيات** (ثابتة) | اسم العميل، المجال، التاريخ، الملخص، نطاق العمل، الصورة الخارجية، الصور الداخلية، الروابط | الكارت الخارجي + رأس الصفحة + الشريط الجانبي |
| **القصة** (حرّة) | مقالة Markdown (عناوين، قوائم، اقتباسات، صور داخل النص) | جسم الصفحة الداخلية |
| **أرقام سريعة** (اختياري) | حتى 4 أرقام (متابعين، تفاعل…) | داخل الصفحة فقط — **لا تظهر على الكارت أبداً** |

بهذا تبقى كل الكروت متطابقة الشكل، والعميل الذي أخذ موقعاً فقط يظهر بنفس أناقة العميل الذي لديه إحصائيات.

## الصفحات

| المسار | الوصف |
|---|---|
| `/` | Hero + أبرز الأعمال + قسم لكل مجال فيه ملفات |
| `/portfolio` | كل الملفات مع بحث وفلتر بالمجال (`?q=` و `?category=`) |
| `/portfolio/[slug]` | الصفحة الداخلية الموحدة لملف الأعمال |
| `/category/[slug]` | ملفات مجال معيّن |
| `/dashboard` | لوحة التحكم (محمية بكلمة مرور) |
| `/api/upload` | رفع الصور (POST، للأدمن فقط) |
| `/uploads/<file>` | تقديم الصور المرفوعة من `data/uploads/` |

## لوحة التحكم

- **ملفات الأعمال**: إنشاء/تحرير/حذف، نشر أو مسودّة، تمييز كـ "أبرز الأعمال"، بحث وفلترة.
- **المحرّر**: رفع الغلاف (سحب وإفلات)، رفع عدة صور للمعرض مع ترتيب، اختيار نطاق العمل من قائمة موحدة، محرّر Markdown بشريط أدوات ومعاينة وإدراج صور.
- **المجالات**: إضافة/تعديل/ترتيب/حذف مع اختيار أيقونة. العدد يُحسب تلقائياً.
- **الإعدادات**: نص وصورة الـ Hero وإحصائيات الوكالة، قسم أبرز الأعمال، بيانات التواصل (واتساب/هاتف/بريد/إنستجرام)، وقائمة الخدمات الموحدة.
- المسودّات تُعرض للأدمن فقط عبر رابط الصفحة (معاينة قبل النشر).

## هيكل المشروع

```
content/                 # البيانات (JSON) — portfolios.json · categories.json · settings.json
data/uploads/            # الصور المرفوعة من الداشبورد
src/
├─ app/
│  ├─ page.tsx                       # الرئيسية
│  ├─ portfolio/page.tsx             # كل الملفات + بحث
│  ├─ portfolio/[slug]/page.tsx      # الصفحة الداخلية
│  ├─ category/[slug]/page.tsx
│  ├─ dashboard/
│  │  ├─ actions.ts                  # كل Server Actions (حفظ/حذف/نشر/إعدادات/دخول)
│  │  ├─ login/page.tsx
│  │  └─ (admin)/…                   # layout بالشريط الجانبي + الصفحات
│  ├─ api/upload/route.ts            # رفع الصور
│  └─ uploads/[...file]/route.ts     # تقديم الصور المرفوعة
├─ proxy.ts                          # حماية /dashboard (Next 16: Proxy بدل Middleware)
├─ lib/
│  ├─ types.ts                       # النموذج الموحد Portfolio / Category / SiteSettings
│  ├─ store.ts                       # قراءة/كتابة JSON بشكل atomic مع قفل
│  ├─ repo/                          # portfolios.ts · categories.ts · settings.ts
│  ├─ auth/                          # session.ts (HMAC cookie) · server.ts
│  ├─ icons.ts                       # أيقونات المجالات المسموح بها
│  └─ format.ts · contact.ts · cn.ts
└─ components/
   ├─ layout/     SiteHeader · Navbar · MegaMenu · Footer · Logo
   ├─ sections/   Hero
   ├─ portfolio/  PortfolioCard (الكارت الموحد) · PortfolioGrid · Gallery
   ├─ dashboard/  PortfolioForm · ImageUploader · MarkdownEditor · CategoryManager · SettingsForm · Sidebar …
   └─ ui/         Button · Chip · StatTiles · Markdown · SectionHeader · Breadcrumbs · Container
```

## Design tokens (من Figma)

| Token | القيمة | الاستخدام |
|---|---|---|
| `--brand` | `#FF3200` | الأزرار، الأرقام، الشارات |
| `--bg-top / --bg-bottom` | `#FFFDF6 → #FDF4F6` | تدرّج خلفية الصفحة |
| `--surface` / `--surface-2` | `#FFFFFF` / `#F4F1F1` | الكروت / الـ chips |
| `--text / --text-2 / --text-3` | `#1A1A1A / #5C5C5C / #8A8A8A` | النصوص |
| حواف | Hero `40px` · Card `24px` · Tiles `12px` · Buttons `8px` | |

الخط الأصلي في التصميم **Ping AR + LT** (تجاري، غير مضمّن). البديل الحالي **IBM Plex Sans Arabic**. لتفعيل الأصلي: ضع الملفات في `src/fonts/ping-ar/`، أزل التعليق عن `pingFont` في `src/fonts/index.ts`، وأضف `pingFont.variable` إلى `<html>` في `layout.tsx`.

## النشر والنسخ الاحتياطي

- المشروع يعتمد على **نظام ملفات دائم** (`content/` و `data/uploads/`) — مناسب لأي VPS أو Docker أو استضافة Node.
- على منصات بلا تخزين دائم (مثل Vercel) يجب استبدال `src/lib/store.ts` ومسار الرفع بخدمة تخزين (S3 / Vercel Blob / قاعدة بيانات). طبقة `repo/` تجعل ذلك تغييراً محصوراً.
- خذ نسخة احتياطية دورية من `content/` و `data/uploads/`.
- غيّر `ADMIN_PASSWORD` و `SESSION_SECRET` قبل النشر، وشغّل الموقع خلف HTTPS (الكوكي `secure` في الإنتاج).
