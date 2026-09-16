import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { PageHeader, PageCta } from "@/components/page-header";
import { CombinerTool } from "@/components/sections/combiner-tool";

const STEPS = [
  { num: "01", key: "step1" },
  { num: "02", key: "step2" },
  { num: "03", key: "step3" },
  { num: "04", key: "step4" },
];

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "HowItWorks" });

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl space-y-5">
          {STEPS.map((step) => (
            <div
              key={step.key}
              className="glass-card glass-card-hover rounded-3xl p-7 sm:p-10 flex flex-col sm:flex-row gap-6 sm:gap-8"
            >
              <div className="flex sm:flex-col items-start gap-3 sm:gap-2 sm:w-32 shrink-0">
                <span className="font-display text-5xl sm:text-6xl font-medium gradient-text-warm tabular-nums">
                  {step.num}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium sm:mt-2">
                  {t(`${step.key}Label`)}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl sm:text-3xl font-medium mb-3 text-balance">
                  {t(`${step.key}Title`)}
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed text-pretty">
                  {t(`${step.key}Body`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CombinerTool />

      <PageCta
        title={t("ctaTitle")}
        body={t("ctaBody")}
        primaryLabel={t("ctaPrimary")}
        secondaryLabel={t("ctaSecondary")}
      />
    </PageShell>
  );
}
