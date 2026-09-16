import { setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { HeroSection } from "@/components/sections/hero-section";
import { CombinerTool } from "@/components/sections/combiner-tool";
import { StepsSection } from "@/components/sections/steps-section";
import { PresetsSection } from "@/components/sections/presets-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { AudienceSection } from "@/components/sections/audience-section";
import { ComparisonSection } from "@/components/sections/comparison-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaSection } from "@/components/sections/cta-section";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageShell>
      <HeroSection />
      <CombinerTool />
      <StepsSection />
      <PresetsSection />
      <FeaturesSection />
      <AudienceSection />
      <ComparisonSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </PageShell>
  );
}
