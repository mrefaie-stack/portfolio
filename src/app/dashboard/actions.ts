"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth/server";
import { emptyPortfolio, type Category, type Portfolio, type SiteSettings, type Stat } from "@/lib/types";
import {
  deletePortfolio,
  getPortfolioById,
  isSlugTaken,
  reassignCategory,
  setPortfolioFeatured,
  setPortfolioStatus,
  upsertPortfolio,
  countAllByCategory,
} from "@/lib/repo/portfolios";
import { deleteCategory, getCategories, reorderCategories, upsertCategory } from "@/lib/repo/categories";
import { getSettings, saveSettings } from "@/lib/repo/settings";
import { slugify } from "@/lib/format";
import { iconNames } from "@/lib/icons";

export type ActionState = {
  ok?: boolean;
  error?: string;
  errors?: Record<string, string>;
  message?: string;
};

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function jsonArray<T>(fd: FormData, k: string, guard: (x: unknown) => x is T): T[] {
  try {
    const v = JSON.parse(String(fd.get(k) ?? "[]"));
    return Array.isArray(v) ? v.filter(guard) : [];
  } catch {
    return [];
  }
}
const isString = (x: unknown): x is string => typeof x === "string" && x.trim().length > 0;
const isStat = (x: unknown): x is Stat =>
  typeof x === "object" && x !== null && isString((x as Stat).value) && isString((x as Stat).label);

/** يُعيد بناء كل الصفحات العامة بعد أي تعديل */
function revalidateSite() {
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ Auth */

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = str(formData, "password");
  const next = str(formData, "next") || "/dashboard";
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "لم يتم ضبط ADMIN_PASSWORD في ملف .env.local" };
  }
  await new Promise((r) => setTimeout(r, 350)); // تهدئة بسيطة ضد التخمين
  if (!checkPassword(password)) return { error: "كلمة المرور غير صحيحة" };
  await startSession();
  redirect(next.startsWith("/dashboard") ? next : "/dashboard");
}

export async function logoutAction() {
  await endSession();
  redirect("/dashboard/login");
}

/* ------------------------------------------------------------------ Portfolios */

export async function savePortfolioAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = str(formData, "id");
  const existing = id ? await getPortfolioById(id) : null;
  if (id && !existing) return { error: "ملف الأعمال غير موجود" };

  const categories = await getCategories();
  const errors: Record<string, string> = {};

  const clientName = str(formData, "clientName");
  const category = str(formData, "category");
  const date = str(formData, "date");
  const summary = str(formData, "summary");
  const cover = str(formData, "cover");
  const status: Portfolio["status"] = str(formData, "status") === "published" ? "published" : "draft";
  const featured = formData.get("featured") === "on";
  const services = jsonArray(formData, "services", isString).map((s) => s.trim());
  const gallery = jsonArray(formData, "gallery", isString);
  const highlights = jsonArray(formData, "highlights", isStat)
    .map((h) => ({ value: h.value.trim(), label: h.label.trim() }))
    .slice(0, 4);
  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n");

  let slug = slugify(str(formData, "slug")) || slugify(clientName);

  if (!clientName) errors.clientName = "اسم العميل مطلوب";
  if (!category || !categories.some((c) => c.slug === category)) errors.category = "اختر مجالاً صحيحاً";
  if (!/^\d{4}-\d{2}$/.test(date)) errors.date = "التاريخ بصيغة سنة-شهر";
  if (!summary) errors.summary = "الملخص مطلوب (يظهر على الكارت)";
  if (summary.length > 220) errors.summary = "الملخص طويل — الحد 220 حرفاً";
  if (status === "published" && !cover) errors.cover = "الصورة الخارجية مطلوبة قبل النشر";
  if (!slug) {
    slug = `client-${Date.now().toString(36)}`;
  } else if (await isSlugTaken(slug, existing?.id)) {
    errors.slug = "هذا الرابط مستخدم لملف آخر";
  }

  const links: Portfolio["links"] = {};
  for (const k of ["website", "instagram", "facebook", "tiktok", "other"] as const) {
    const v = str(formData, `links.${k}`);
    if (v) {
      if (!/^https?:\/\//i.test(v)) errors[`links.${k}`] = "الرابط يجب أن يبدأ بـ http:// أو https://";
      links[k] = v;
    }
  }

  if (Object.keys(errors).length) return { errors, error: "راجع الحقول المحددة" };

  const now = new Date().toISOString();
  const portfolio: Portfolio = {
    ...(existing ?? emptyPortfolio()),
    id: existing?.id ?? crypto.randomUUID(),
    slug,
    status,
    featured,
    clientName,
    category,
    date,
    summary,
    services: [...new Set(services)],
    cover,
    gallery,
    highlights,
    links,
    body,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await upsertPortfolio(portfolio);
  revalidateSite();

  if (!existing) redirect(`/dashboard/portfolios/${portfolio.id}?created=1`);
  return { ok: true, message: "تم الحفظ" };
}

export async function deletePortfolioAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) await deletePortfolio(id);
  revalidateSite();
  redirect("/dashboard/portfolios");
}

export async function togglePublishAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const p = id ? await getPortfolioById(id) : null;
  if (!p) return;
  if (p.status === "draft" && !p.cover) return; // لا نشر بدون صورة خارجية
  await setPortfolioStatus(id, p.status === "published" ? "draft" : "published");
  revalidateSite();
}

export async function toggleFeaturedAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const p = id ? await getPortfolioById(id) : null;
  if (!p) return;
  await setPortfolioFeatured(id, !p.featured);
  revalidateSite();
}

/* ------------------------------------------------------------------ Categories */

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const originalSlug = str(formData, "originalSlug");
  const title = str(formData, "title");
  const slug = slugify(str(formData, "slug")) || slugify(title);
  const icon = str(formData, "icon");
  const errors: Record<string, string> = {};

  if (!title) errors.title = "الاسم مطلوب";
  if (!slug) errors.slug = "الرابط مطلوب";
  if (!(iconNames as string[]).includes(icon)) errors.icon = "اختر أيقونة";

  const list = await getCategories();
  if (list.some((c) => c.slug === slug && c.slug !== originalSlug)) errors.slug = "هذا الرابط مستخدم";
  if (Object.keys(errors).length) return { errors, error: "راجع الحقول" };

  const existing = list.find((c) => c.slug === originalSlug);
  const cat: Category = { slug, title, icon, order: existing?.order ?? list.length };
  await upsertCategory(cat, originalSlug || undefined);
  if (existing && existing.slug !== slug) await reassignCategory(existing.slug, slug);
  revalidateSite();
  return { ok: true, message: existing ? "تم تحديث المجال" : "تمت إضافة المجال" };
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const slug = str(formData, "slug");
  const counts = await countAllByCategory();
  if (!slug || (counts[slug] ?? 0) > 0) return; // لا حذف لمجال فيه ملفات
  await deleteCategory(slug);
  revalidateSite();
}

export async function moveCategoryAction(formData: FormData) {
  await requireAdmin();
  const slug = str(formData, "slug");
  const dir = str(formData, "dir") === "up" ? -1 : 1;
  const list = (await getCategories()).map((c) => c.slug);
  const i = list.indexOf(slug);
  const j = i + dir;
  if (i === -1 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await reorderCategories(list);
  revalidateSite();
}

/* ------------------------------------------------------------------ Settings */

export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const current = await getSettings();

  const stats: Stat[] = [];
  for (let i = 0; i < 3; i++) {
    const value = str(formData, `hero.stats.${i}.value`);
    const label = str(formData, `hero.stats.${i}.label`);
    if (value && label) stats.push({ value, label });
  }

  const services = String(formData.get("services") ?? "")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  const next: SiteSettings = {
    hero: {
      titleLine1: str(formData, "hero.titleLine1") || current.hero.titleLine1,
      titleLine2: str(formData, "hero.titleLine2"),
      subtitle: str(formData, "hero.subtitle"),
      image: str(formData, "hero.image") || current.hero.image,
      stats,
    },
    featured: {
      title: str(formData, "featured.title") || current.featured.title,
      subtitle: str(formData, "featured.subtitle"),
    },
    contact: {
      whatsapp: str(formData, "contact.whatsapp"),
      phone: str(formData, "contact.phone"),
      email: str(formData, "contact.email"),
      instagram: str(formData, "contact.instagram"),
      address: str(formData, "contact.address"),
    },
    services: [...new Set(services)],
  };

  await saveSettings(next);
  revalidateSite();
  return { ok: true, message: "تم حفظ الإعدادات" };
}
