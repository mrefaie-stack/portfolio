import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "@/components/dashboard/LoginForm";

export const metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-5 text-xl font-bold text-ink">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-ink-3">أدخل كلمة المرور للمتابعة</p>
        </div>
        <LoginForm next={next ?? "/dashboard"} />
      </div>
    </main>
  );
}
