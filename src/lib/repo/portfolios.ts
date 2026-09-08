import "server-only";
import { cache } from "react";
import type { Portfolio } from "@/lib/types";
import { readJson, updateJson } from "@/lib/store";

const FILE = "portfolios.json";

export const getAllPortfolios = cache(async (): Promise<Portfolio[]> => {
  const list = await readJson<Portfolio[]>(FILE, []);
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.updatedAt < b.updatedAt ? 1 : -1));
});

export const getPublishedPortfolios = cache(async (): Promise<Portfolio[]> => {
  const all = await getAllPortfolios();
  return all.filter((p) => p.status === "published");
});

export async function getPortfolioById(id: string) {
  const all = await getAllPortfolios();
  return all.find((p) => p.id === id) ?? null;
}

export async function getPortfolioBySlug(slug: string) {
  const all = await getAllPortfolios();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function isSlugTaken(slug: string, exceptId?: string) {
  const all = await getAllPortfolios();
  return all.some((p) => p.slug === slug && p.id !== exceptId);
}

export async function upsertPortfolio(p: Portfolio) {
  await updateJson<Portfolio[]>(FILE, [], (list) => {
    const i = list.findIndex((x) => x.id === p.id);
    if (i === -1) return [...list, p];
    const next = [...list];
    next[i] = p;
    return next;
  });
}

export async function deletePortfolio(id: string) {
  await updateJson<Portfolio[]>(FILE, [], (list) => list.filter((x) => x.id !== id));
}

export async function setPortfolioStatus(id: string, status: Portfolio["status"]) {
  await updateJson<Portfolio[]>(FILE, [], (list) =>
    list.map((x) => (x.id === id ? { ...x, status, updatedAt: new Date().toISOString() } : x)),
  );
}

export async function setPortfolioFeatured(id: string, featured: boolean) {
  await updateJson<Portfolio[]>(FILE, [], (list) =>
    list.map((x) => (x.id === id ? { ...x, featured, updatedAt: new Date().toISOString() } : x)),
  );
}

/** عدد كل الملفات (بما فيها المسودّات) لكل تصنيف — يُستخدم في الداشبورد قبل حذف تصنيف */
export async function countAllByCategory(): Promise<Record<string, number>> {
  const all = await getAllPortfolios();
  return all.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
}

/** عند تغيير slug تصنيف، ننقل الملفات المرتبطة به */
export async function reassignCategory(from: string, to: string) {
  if (from === to) return;
  await updateJson<Portfolio[]>(FILE, [], (list) => list.map((p) => (p.category === from ? { ...p, category: to } : p)));
}
