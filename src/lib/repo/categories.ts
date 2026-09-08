import "server-only";
import { cache } from "react";
import type { Category, CategoryWithCount } from "@/lib/types";
import { readJson, updateJson } from "@/lib/store";
import { getPublishedPortfolios } from "./portfolios";

const FILE = "categories.json";

export const getCategories = cache(async (): Promise<Category[]> => {
  const list = await readJson<Category[]>(FILE, []);
  return [...list].sort((a, b) => a.order - b.order);
});

export async function getCategoryBySlug(slug: string) {
  const list = await getCategories();
  return list.find((c) => c.slug === slug) ?? null;
}

/** التصنيفات مع عدد الملفات المنشورة في كل منها (يُحسب من البيانات — لا يُكتب يدوياً) */
export const getCategoriesWithCounts = cache(async (): Promise<CategoryWithCount[]> => {
  const [cats, published] = await Promise.all([getCategories(), getPublishedPortfolios()]);
  return cats.map((c) => ({ ...c, count: published.filter((p) => p.category === c.slug).length }));
});

export async function upsertCategory(c: Category, previousSlug?: string) {
  await updateJson<Category[]>(FILE, [], (list) => {
    const key = previousSlug ?? c.slug;
    const i = list.findIndex((x) => x.slug === key);
    if (i === -1) return [...list, c];
    const next = [...list];
    next[i] = c;
    return next;
  });
}

export async function deleteCategory(slug: string) {
  await updateJson<Category[]>(FILE, [], (list) => list.filter((x) => x.slug !== slug));
}

export async function reorderCategories(slugs: string[]) {
  await updateJson<Category[]>(FILE, [], (list) =>
    list.map((c) => ({ ...c, order: slugs.indexOf(c.slug) === -1 ? c.order : slugs.indexOf(c.slug) })),
  );
}
