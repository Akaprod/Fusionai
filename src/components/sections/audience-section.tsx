"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Users, PenTool, Home, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { AUDIENCE_IDS } from "@/lib/content";

const ICONS: Record<string, LucideIcon> = {
  ecommerce: ShoppingBag,
  family: Users,
  designers: PenTool,
  estate: Home,
};

export function AudienceSection() {
  const t = useTranslations("Audience");
  return (
    <section className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border/40">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AUDIENCE_IDS.map((id, idx) => {
            const Icon = ICONS[id] || Users;
            return (
              <motion.article
                key={id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: idx * 0.1 }}
                className="glass-card glass-card-hover rounded-2xl p-6 group relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 size-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="size-12 rounded-xl num-badge flex items-center justify-center mb-5">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-display text-lg font-medium mb-2">
                    {t(`items.${id}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    {t(`items.${id}.description`)}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
