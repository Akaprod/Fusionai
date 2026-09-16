"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Images } from "lucide-react";
import { useTranslations } from "next-intl";
import { PRESETS, CATEGORY_COLORS } from "@/lib/content";

export function PresetsSection() {
  const t = useTranslations("Presets");
  return (
    <section
      id="presets"
      className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border/40"
    >
      <div className="absolute inset-0 dot-overlay opacity-20 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">
            <Images className="size-3.5" />
            {t("sectionLabel")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.05] tracking-tight text-balance max-w-3xl mx-auto">
            {t("sectionTitle")}
          </h2>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t("sectionSubtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRESETS.map((preset, idx) => {
            const category = t(`items.${preset.id}.category`);
            return (
              <motion.a
                key={preset.id}
                href="#combiner"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: (idx % 3) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                className="group relative glass-card glass-card-hover rounded-2xl p-6 overflow-hidden block"
              >
                <div
                  className={`absolute -top-20 -right-20 size-40 rounded-full bg-gradient-to-br ${preset.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none`}
                />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        CATEGORY_COLORS[category] || "text-amber-300"
                      }`}
                    >
                      {category}
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:rotate-12 transition-all" />
                  </div>

                  <h3 className="font-display text-xl font-medium leading-tight mb-3">
                    {t(`items.${preset.id}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 text-pretty min-h-[60px]">
                    {t(`items.${preset.id}.description`)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs">
                    <span className="text-muted-foreground tabular-nums">
                      {t("imageCount", { count: "2–4" })}
                    </span>
                    <span className="inline-flex items-center gap-1 num-badge px-2 py-0.5 rounded-md font-medium">
                      {t("credits", { count: 1 })}
                    </span>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
