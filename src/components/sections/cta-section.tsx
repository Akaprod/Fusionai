"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function CtaSection() {
  const t = useTranslations("Home");
  const locale = useLocale();

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
      <div className="relative mx-auto max-w-5xl">
        {/* Big artistic CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative rounded-[2.5rem] overflow-hidden noise-bg"
        >
          {/* Background — black gradient with orange accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800" />
          <div className="absolute inset-0 aurora-bg opacity-40" />

          {/* Floating accent */}
          <div
            aria-hidden
            className="absolute -top-20 -right-20 size-72 rounded-full bg-orange-500/20 blur-3xl animate-pulse-soft"
          />

          <div className="relative px-6 sm:px-12 py-16 sm:py-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="display-hero text-[clamp(2rem,5vw,4rem)] text-white max-w-2xl mx-auto text-balance"
            >
              {t("ctaTitle")}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-white/60 max-w-lg mx-auto text-pretty"
            >
              {t("ctaSubtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10"
            >
              <Link
                href={`/${locale}#combiner`}
                className="group inline-flex items-center justify-center gap-2 h-13 px-8 py-3.5 rounded-full bg-white text-neutral-900 font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.99]"
              >
                {t("ctaPrimary")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Minimal trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/40"
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {t("ctaFree")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {t("ctaFreeValue")}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
