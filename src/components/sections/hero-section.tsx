"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("Hero");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16 sm:pb-24 noise-bg">
      {/* Background — subtle artistic gradients */}
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />

      {/* Floating orbs — artistic, subtle */}
      <div
        aria-hidden
        className="absolute top-20 -left-10 size-72 rounded-full bg-orange-500/8 blur-3xl animate-float-slow pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute top-40 right-0 size-96 rounded-full bg-neutral-900/4 blur-3xl animate-pulse-soft pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-4xl">
          {/* Badge — minimal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-900/10 bg-white/60 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-neutral-600 mb-8"
          >
            <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
            {t("badge")}
          </motion.div>

          {/* Title — big, artistic, minimal */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
            className="display-hero text-[clamp(2.8rem,8vw,6.5rem)] text-neutral-900"
          >
            {t("title1")}{" "}
            <span className="gradient-text-accent italic">{t("titleHighlight")}</span>
          </motion.h1>

          {/* Subtitle — one line, impactful */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-xl text-pretty"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTAs — minimal, two buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-10 flex flex-col sm:flex-row gap-3"
          >
            <Link
              href={`/${locale}#combiner`}
              className="group inline-flex items-center justify-center gap-2 h-13 px-7 py-3.5 rounded-full bg-neutral-900 text-white font-medium text-sm transition-all hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.99]"
            >
              <Sparkles className="size-4" />
              {t("ctaPrimary")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={`/${locale}/presets`}
              className="inline-flex items-center justify-center gap-2 h-13 px-7 py-3.5 rounded-full border border-neutral-900/10 bg-white/60 backdrop-blur-sm text-sm font-medium text-neutral-700 hover:border-neutral-900/20 hover:bg-white transition-colors"
            >
              {t("ctaSecondary")}
            </Link>
          </motion.div>

          {/* Social proof — minimal, one line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 flex items-center gap-6 text-sm text-neutral-400"
          >
            <span>
              <strong className="text-neutral-900">12 400+</strong> {t("mergesRun")}
            </span>
            <span className="size-1 rounded-full bg-neutral-300" />
            <span>
              <strong className="text-neutral-900">4.9/5</strong>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
