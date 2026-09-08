import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PortfolioForm } from "@/components/dashboard/PortfolioForm";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { getPortfolioById } from "@/lib/repo/portfolios";
import { getCategories } from "@/lib/repo/categories";
import { getSettings } from "@/lib/repo/settings";
import { formatDateTime } from "@/lib/format";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await getPortfolioById((await params).id);
  return { title: p ? `تحرير: ${p.clientName}` : "غير موجود" };
}

export default async function EditPortfolioPage({ params, searchParams }: Props) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const [p, categories, settings] = await Promise.all([getPortfolioById(id), getCategories(), getSettings()]);
  if (!p) notFound();
  return (
    <>
      <PageHeader
        title={p.clientName}
        subtitle={`آخر تعديل: ${formatDateTime(p.updatedAt)}`}
        actions={<StatusBadge status={p.status} />}
      />
      <PortfolioForm portfolio={p} categories={categories} serviceSuggestions={settings.services} created={created === "1"} />
    </>
  );
}
