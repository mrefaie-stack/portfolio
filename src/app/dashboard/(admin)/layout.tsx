import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { logoutAction } from "@/app/dashboard/actions";

export const metadata = { title: { default: "لوحة التحكم | MilaKnight", template: "%s | MilaKnight" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/dashboard/login");
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar logout={logoutAction} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
