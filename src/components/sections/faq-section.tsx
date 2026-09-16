"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { FAQ_IDS } from "@/lib/content";

export function FaqSection() {
  const t = useTranslations("Faq");
  const locale = useLocale();
  const [open, setOpen] = useState<string | null>(FAQ_IDS[0]);

  return (
    <section
      id="faq"
      className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border/40"
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">
            <HelpCircle className="size-3.5" />
            {t("sectionLabel")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.05] tracking-tight text-balance">
            {t("sectionTitle")}
          </h2>
          <p className="mt-4">
            <Link href={`/${locale}/faq`} className="text-sm text-primary link-underline">
              {t("directContact")}
            </Link>
          </p>
        </motion.div>

        <ul className="space-y-3">
          {FAQ_IDS.map((id, idx) => {
            const isOpen = open === id;
            return (
              <motion.li
                key={id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(idx, 3) * 0.06 }}
                className={`glass-card rounded-2xl overflow-hidden transition-colors ${
                  isOpen ? "border-primary/40" : ""
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : id)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-base sm:text-lg font-medium text-pretty">
                    {t(`items.${id}.question`)}
                  </span>
                  <ChevronDown
                    className={`size-5 text-primary shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty">
                        {t(`items.${id}.answer`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
