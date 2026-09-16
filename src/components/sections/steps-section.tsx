"use client";

import { motion } from "framer-motion";
import { Upload, PenLine, Download } from "lucide-react";
import { useTranslations } from "next-intl";

const STEPS = [
  { n: "01", icon: Upload, key: "step1", accent: "from-amber-400/30 to-orange-500/20" },
  { n: "02", icon: PenLine, key: "step2", accent: "from-rose-400/30 to-amber-500/20" },
  { n: "03", icon: Download, key: "step3", accent: "from-yellow-400/30 to-amber-500/20" },
] as const;

export function StepsSection() {
  const t = useTranslations("Steps");
  return (
    <section className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative glass-card glass-card-hover rounded-3xl p-8 group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${step.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none`}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                    <step.icon className="size-5" />
                  </div>
                  <span className="font-display text-4xl font-medium text-foreground/15 tabular-nums">
                    {step.n}
                  </span>
                </div>
                <h3 className="font-display text-xl font-medium mb-3">
                  {t(`${step.key}Title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {t(`${step.key}Body`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
