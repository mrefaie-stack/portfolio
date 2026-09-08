import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <Container className="py-32 text-center">
          <p className="tabular text-7xl font-bold text-brand">404</p>
          <h1 className="mt-4 text-2xl font-bold text-ink">الصفحة غير موجودة</h1>
          <p className="mt-2 text-sm text-ink-3">ربما تم نقل ملف الأعمال أو تغيير رابطه.</p>
          <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-lg bg-brand px-6 text-[15px] font-medium text-white hover:bg-[#e62d00]">
            العودة للرئيسية
          </Link>
        </Container>
      </main>
    </>
  );
}
