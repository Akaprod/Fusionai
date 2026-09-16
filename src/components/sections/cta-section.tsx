"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function CtaSection() {
  const t = useTranslations("Home");
  const locale = useLocale();
  return (
    <section className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/15 to-transparent" />
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div
          aria-hidden
          className="absolute -top-20 -right-20 size-72 rounded-full bg-primary/30 blur-3xl animate-pulse-soft pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-20 size-80 rounded-full bg-accent/25 blur-3xl animate-float-slow pointer-events-none"
        />

        <div className="relative px-6 sm:px-12 py-16 sm:py-20 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary mb-6"
          >
            <Sparkles className="size-3.5" />
            {t("ctaBadge")}
          </motion.span>

          <h2 className="font-display text-3xl sm:text-5xl font-medium leading-[1.05] tracking-tight text-balance max-w-2xl mx-auto">
            {t("ctaTitle")}
          </h2>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
            {t("ctaSubtitle")}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/${locale}#combiner`}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl num-badge font-medium text-sm transition-transform hover:scale-[1.02] active:scale-[0.99] glow-amber"
            >
              <Sparkles className="size-4" />
              {t("ctaPrimary")}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl border border-border bg-card/40 backdrop-blur-sm text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              {t("ctaSecondary")}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {t("ctaFree")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {t("ctaFreeValue")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {t("ctaCancel")}
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
