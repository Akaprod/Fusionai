"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-12 sm:pb-16">
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
      <div
        aria-hidden
        className="absolute top-20 left-1/4 size-72 rounded-full bg-primary/10 blur-3xl animate-float-slow pointer-events-none"
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-primary mb-5"
        >
          <Sparkles className="size-3.5" />
          {eyebrow}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-[clamp(2.2rem,6vw,4rem)] font-medium leading-[1.05] tracking-tight text-balance"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}

export function PageCta({
  title,
  body,
  primaryLabel,
  secondaryLabel,
}: {
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  const locale = useLocale();
  return (
    <section className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="relative mx-auto max-w-4xl rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/15 to-transparent" />
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="relative px-6 sm:px-10 py-12 sm:py-16 text-center">
          <h2 className="font-display text-2xl sm:text-4xl font-medium leading-[1.1] tracking-tight text-balance max-w-2xl mx-auto">
            {title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto text-pretty">
            {body}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/${locale}#combiner`}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl num-badge font-medium text-sm transition-transform hover:scale-[1.02] glow-amber"
            >
              <Sparkles className="size-4" />
              {primaryLabel}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-border bg-card/40 backdrop-blur-sm text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              {secondaryLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
