"use client";

import { motion } from "framer-motion";
import {
  UserCircle,
  Sun,
  Tag,
  Ratio,
  Zap,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FEATURE_IDS } from "@/lib/content";

const ICONS: Record<string, LucideIcon> = {
  faces: UserCircle,
  shadows: Sun,
  labels: Tag,
  ratio: Ratio,
  fast: Zap,
  private: ShieldCheck,
};

export function FeaturesSection() {
  const t = useTranslations("Features");
  return (
    <section
      id="avantages"
      className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border/40"
    >
      <div className="absolute inset-0 aurora-bg-subtle pointer-events-none" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 lg:sticky lg:top-28"
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">
              {t("sectionLabel")}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.05] tracking-tight text-balance">
              {t("sectionTitle1")}{" "}
              <span className="gradient-text-warm italic">
                {t("sectionTitleHighlight")}
              </span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground text-pretty">
              {t("sectionSubtitle")}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("updated")}
            </div>
          </motion.div>

          <div className="lg:col-span-7">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURE_IDS.map((id, idx) => {
                const Icon = ICONS[id] || ShieldCheck;
                return (
                  <motion.li
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (idx % 2) * 0.08 }}
                    className="glass-card glass-card-hover rounded-2xl p-5 sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base sm:text-lg font-medium mb-1.5">
                          {t(`items.${id}.title`)}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                          {t(`items.${id}.description`)}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
