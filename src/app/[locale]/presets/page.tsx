import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { PageHeader, PageCta } from "@/components/page-header";
import { PresetsSection } from "@/components/sections/presets-section";
import { CombinerTool } from "@/components/sections/combiner-tool";

export default async function PresetsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Presets" });

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("pageEyebrow")}
        title={t("pageTitle")}
        subtitle={t("pageSubtitle")}
      />
      <PresetsSection />
      <CombinerTool />
      <PageCta
        title={t("pageTitle")}
        body={t("pageSubtitle")}
        primaryLabel={t("pageCtaPrimary")}
        secondaryLabel={t("pageCtaSecondary")}
      />
    </PageShell>
  );
}
