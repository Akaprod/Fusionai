"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { TESTIMONIAL_IDS } from "@/lib/content";

export function TestimonialsSection() {
  const t = useTranslations("Testimonials");
  return (
    <section className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border/40">
      <div className="absolute inset-0 aurora-bg-subtle pointer-events-none" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">
            <Quote className="size-3.5" />
            {t("sectionLabel")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.05] tracking-tight text-balance max-w-3xl mx-auto">
            {t("sectionTitle")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TESTIMONIAL_IDS.map((id, idx) => (
            <motion.figure
              key={id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (idx % 2) * 0.12 }}
              className="glass-card glass-card-hover rounded-2xl p-7 sm:p-8 relative"
            >
              <Quote className="size-8 text-primary/40 absolute top-6 right-6" />
              <div className="flex mb-4 gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-3.5 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-base sm:text-lg leading-relaxed font-display italic text-pretty">
                « {t(`items.${id}.quote`)} »
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-border/60">
                <div className="size-10 rounded-full num-badge flex items-center justify-center font-medium">
                  {t(`items.${id}.author`).charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{t(`items.${id}.author`)}</div>
                  <div className="text-xs text-muted-foreground">
                    {t(`items.${id}.role`)}
                  </div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
