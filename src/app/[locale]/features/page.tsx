import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { PageHeader, PageCta } from "@/components/page-header";
import { FeaturesSection } from "@/components/sections/features-section";
import { AudienceSection } from "@/components/sections/audience-section";
import { ComparisonSection } from "@/components/sections/comparison-section";

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Features" });

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("pageEyebrow")}
        title={t("pageTitle")}
        subtitle={t("pageSubtitle")}
      />
      <FeaturesSection />
      <AudienceSection />
      <ComparisonSection />
      <PageCta
        title={t("sectionTitle1")}
        body={t("sectionSubtitle")}
        primaryLabel={t("pageTitle")}
        secondaryLabel={t("pageEyebrow")}
      />
    </PageShell>
  );
}
