import { setRequestLocale, getTranslations } from "next-intl/server";
import { Dashboard } from "@/components/dashboard/dashboard";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Dashboard />;
}
