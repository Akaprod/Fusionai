"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("Hero");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 sm:pb-20">
      {/* Background aurora */}
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />

      {/* Floating orbs */}
      <div
        aria-hidden
        className="absolute top-32 -left-10 size-72 rounded-full bg-primary/10 blur-3xl animate-float-slow pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute top-20 right-0 size-80 rounded-full bg-accent/10 blur-3xl animate-pulse-soft pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary mb-6"
            >
              <Sparkles className="size-3.5" />
              {t("badge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
              className="font-display text-[clamp(2.4rem,7vw,5rem)] font-medium leading-[0.98] tracking-tight text-balance"
            >
              {t("title1")}{" "}
              <span className="gradient-text-warm italic">{t("titleHighlight")}</span>{" "}
              {t("title2")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 text-pretty"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Link
                href={`/${locale}#combiner`}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl num-badge font-medium text-sm transition-transform hover:scale-[1.02] active:scale-[0.99] glow-amber-sm"
              >
                <Sparkles className="size-4" />
                {t("ctaPrimary")}
              </Link>
              <Link
                href={`/${locale}/presets`}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-border bg-card/40 backdrop-blur-sm text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {t("ctaSecondary")}
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start text-sm text-muted-foreground"
            >
              <div className="inline-flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="size-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/80 to-accent/80"
                    />
                  ))}
                </div>
                <span>
                  <strong className="text-foreground">12 400+</strong>{" "}
                  {t("mergesRun")}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <div className="flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="size-3.5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <span>
                  <strong className="text-foreground">{t("rating")}</strong>
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                {t("noAccount")}
              </div>
            </motion.div>
          </div>

          {/* Right: preview visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:col-span-5"
          >
            <HeroPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  const t = useTranslations("Hero");
  return (
    <div className="relative aspect-[4/5] sm:aspect-square max-w-md mx-auto">
      {/* Glow behind */}
      <div className="absolute -inset-8 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-3xl rounded-full opacity-70" />

      {/* Card stack */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3 p-3 glass-card rounded-3xl">
        {/* Top-left source */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-200/80 via-orange-300/60 to-rose-300/70 border border-border">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-16 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 opacity-80 blur-[2px]" />
            <div className="absolute bottom-2 left-2 text-[10px] font-medium text-amber-950/80 bg-amber-100/60 backdrop-blur px-1.5 py-0.5 rounded">
              {t("imageLabel1")}
            </div>
          </div>
        </div>

        {/* Top-right source */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-200/70 via-emerald-300/60 to-cyan-300/70 border border-border">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-80 blur-[2px]" />
            <div className="absolute bottom-2 left-2 text-[10px] font-medium text-emerald-950/80 bg-emerald-100/60 backdrop-blur px-1.5 py-0.5 rounded">
              {t("imageLabel2")}
            </div>
          </div>
        </div>

        {/* Bottom: result */}
        <div className="relative col-span-2 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-300/60 via-orange-400/50 to-rose-400/60 border border-primary/30 glow-amber-sm">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex -space-x-3">
              <div className="size-20 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 opacity-90 blur-[1px]" />
              <div className="size-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-90 blur-[1px]" />
            </div>
          </div>
          <div className="absolute top-2 left-2 num-badge text-[10px] font-semibold px-1.5 py-0.5 rounded">
            {t("previewBadge")}
          </div>
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 num-badge text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap">
            <Sparkles className="size-3" />
            {t("previewBadgeAI")}
          </div>
        </div>
      </div>

      {/* Floating chip */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-4 -right-4 rounded-xl px-3 py-2 flex items-center gap-2 glow-amber-sm"
        style={{ backgroundColor: "rgb(48, 42, 34)", border: "1px solid rgba(240, 194, 105, 0.4)" }}
      >
        <div className="size-8 rounded-full num-badge flex items-center justify-center shrink-0">
          <Sparkles className="size-4" />
        </div>
        <div className="whitespace-nowrap">
          <div className="text-[10px] uppercase tracking-wider text-amber-200/80">
            {t("previewTime")}
          </div>
          <div className="text-sm font-semibold tabular-nums text-amber-50">
            {t("previewTimeValue")}
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -top-3 -left-3 rounded-xl px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: "rgb(48, 42, 34)", border: "1px solid rgba(120, 108, 92, 0.4)" }}
      >
        <div className="size-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
          ✓
        </div>
        <div className="whitespace-nowrap">
          <div className="text-[10px] uppercase tracking-wider text-emerald-200/80">
            {t("previewFaces")}
          </div>
          <div className="text-sm font-semibold text-emerald-50">
            {t("previewFacesValue")}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
