import { PageHeader } from "@/components/dashboard/PageHeader";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { getSettings } from "@/lib/repo/settings";

export const metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="الإعدادات" subtitle="محتوى الصفحة الرئيسية، بيانات التواصل، وقائمة الخدمات الموحدة." />
      <SettingsForm settings={settings} />
    </>
  );
}
