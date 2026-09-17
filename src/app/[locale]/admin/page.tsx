import { setRequestLocale, getTranslations } from "next-intl/server";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    robots: { index: false, follow: false }, // admin pages should not be indexed
  };
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminDashboard />;
}
