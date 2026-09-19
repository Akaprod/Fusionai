import { setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/page-shell";
import { HeroSection } from "@/components/sections/hero-section";
import { CombinerTool } from "@/components/sections/combiner-tool";
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
      <CtaSection />
    </PageShell>
  );
}
