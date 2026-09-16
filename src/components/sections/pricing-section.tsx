"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { PLAN_IDS } from "@/lib/content";

export function PricingSection() {
  const t = useTranslations("Pricing");
  const locale = useLocale();
  return (
    <section
      id="tarifs"
      className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border/40"
    >
      <div className="absolute inset-0 dot-overlay opacity-15 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">
            {t("sectionLabel")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.05] tracking-tight text-balance max-w-3xl mx-auto">
            {t("sectionTitle")}
          </h2>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t("sectionSubtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {PLAN_IDS.map((planId, idx) => {
            const isHighlight = planId === "pro";
            const features = t.raw(`plans.${planId}.features`) as string[];
            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col ${
                  isHighlight
                    ? "glass-card border-2 border-primary/40 glow-amber"
                    : "glass-card glass-card-hover"
                }`}
              >
                {isHighlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 num-badge text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                    <Sparkles className="size-3" />
                    {t("badge")}
                  </span>
                )}

                <div className="mb-5">
                  <h3 className="font-display text-xl font-medium">
                    {t(`plans.${planId}.name`)}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground min-h-[36px] text-pretty">
                    {t(`plans.${planId}.description`)}
                  </p>
                </div>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-medium tabular-nums">
                    {t(`plans.${planId}.price`)} €
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {planId === "credits" ? t("perFusion") : t("perMonth")}
                  </span>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className="size-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/${locale}#combiner`}
                  className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] ${
                    isHighlight
                      ? "num-badge glow-amber-sm"
                      : "border border-border bg-card/60 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  {t(`plans.${planId}.cta`)}
                  <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground max-w-xl mx-auto">
          {t("featuresInclude")}
        </p>
      </div>
    </section>
  );
}
