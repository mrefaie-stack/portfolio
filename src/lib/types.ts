/**
 * النموذج الموحد لملفات الأعمال.
 * كل عميل له نفس "الأساسيات" بغض النظر عن نوع الخدمة، والباقي يُكتب كمقالة (Markdown).
 */
export type Stat = { value: string; label: string };

export type PortfolioStatus = "draft" | "published";

export type PortfolioLinks = {
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  other?: string;
};

export type Portfolio = {
  id: string;
  /** يُستخدم في الرابط /portfolio/[slug] */
  slug: string;
  status: PortfolioStatus;
  /** يظهر في قسم "أبرز الأعمال" على الرئيسية */
  featured: boolean;

  /* ---------- الأساسيات (موحدة لكل عميل) ---------- */
  clientName: string;
  /** slug التصنيف من categories */
  category: string;
  /** بصيغة YYYY-MM */
  date: string;
  /** جملة قصيرة تظهر على الكارت وفي رأس الصفحة */
  summary: string;
  /** نطاق العمل (chips) */
  services: string[];
  /** الصورة الخارجية (الكارت + رأس الصفحة) */
  cover: string;
  /** الصور الداخلية (المعرض) */
  gallery: string[];
  /** أرقام اختيارية — لا تظهر على الكارت أبداً، فقط داخل الصفحة إن وُجدت */
  highlights: Stat[];
  links: PortfolioLinks;

  /* ---------- المقالة ---------- */
  body: string;

  createdAt: string;
  updatedAt: string;
};

export type Category = {
  slug: string;
  title: string;
  /** اسم أيقونة من قائمة lucide المسموح بها (انظر lib/icons.ts) */
  icon: string;
  order: number;
};

/** تصنيف مع عدد الملفات المنشورة فيه */
export type CategoryWithCount = Category & { count: number };

export type SiteSettings = {
  hero: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    image: string;
    stats: Stat[];
  };
  featured: { title: string; subtitle: string };
  contact: {
    whatsapp: string;
    phone: string;
    email: string;
    instagram: string;
    address: string;
  };
  /** قائمة الخدمات الموحدة (تظهر كاقتراحات في الداشبورد) */
  services: string[];
};

export const emptyPortfolio = (): Portfolio => ({
  id: "",
  slug: "",
  status: "draft",
  featured: false,
  clientName: "",
  category: "",
  date: new Date().toISOString().slice(0, 7),
  summary: "",
  services: [],
  cover: "",
  gallery: [],
  highlights: [],
  links: {},
  body: "",
  createdAt: "",
  updatedAt: "",
});
