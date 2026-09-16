import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { PageHeader, PageCta } from "@/components/page-header";
import { FaqSection } from "@/components/sections/faq-section";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Faq" });

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("pageEyebrow")}
        title={t("pageTitle")}
        subtitle={t("pageSubtitle")}
      />
      <FaqSection />
      <PageCta
        title={t("sectionTitle")}
        body={t("pageSubtitle")}
        primaryLabel={t("pageEyebrow")}
        secondaryLabel={t("pageTitle")}
      />
    </PageShell>
  );
}
