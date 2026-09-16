"use client";

import { motion } from "framer-motion";
import { Check, X, Clock, TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { COMPARISON_ROWS } from "@/lib/content";

function Cell({ value, kind }: { value: string | boolean; kind: "us" | "them" }) {
  if (typeof value === "boolean") {
    return value ? (
      <span
        className={`inline-flex size-7 items-center justify-center rounded-full ${
          kind === "us"
            ? "bg-primary/20 text-primary"
            : "bg-emerald-500/15 text-emerald-300"
        }`}
      >
        <Check className="size-4" />
      </span>
    ) : (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <X className="size-4" />
      </span>
    );
  }
  return (
    <span
      className={`text-sm ${
        kind === "us" ? "text-foreground font-medium" : "text-muted-foreground"
      }`}
    >
      {value}
    </span>
  );
}

export function ComparisonSection() {
  const t = useTranslations("Comparison");
  return (
    <section className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-border/40">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">
            {t("sectionLabel")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.05] tracking-tight text-balance">
            {t("sectionTitle")}
          </h2>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t("sectionSubtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-5 px-5 sm:px-7 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {t("headerCriterion")}
                  </th>
                  <th className="py-5 px-5 sm:px-7 bg-primary/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary animate-pulse" />
                      <span className="font-display text-base font-medium">
                        {t("headerUs")}
                      </span>
                    </div>
                  </th>
                  <th className="py-5 px-5 sm:px-7">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="size-4" />
                      <span className="font-display text-base font-medium">
                        {t("headerThem")}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((rowKey) => {
                  const usVal = t.raw(`rows.${rowKey}.us`);
                  const themVal = t.raw(`rows.${rowKey}.them`);
                  const label = t(`rows.${rowKey}.label`);
                  // highlight is optional — only `time` and `cost` rows are highlighted
                  const highlight = rowKey === "time" || rowKey === "cost";
                  return (
                    <tr
                      key={rowKey}
                      className={`border-b border-border/60 last:border-0 ${
                        highlight ? "bg-primary/[0.04]" : ""
                      }`}
                    >
                      <td className="py-4 px-5 sm:px-7 text-sm font-medium">{label}</td>
                      <td className="py-4 px-5 sm:px-7 bg-primary/[0.06]">
                        <Cell value={usVal as string | boolean} kind="us" />
                      </td>
                      <td className="py-4 px-5 sm:px-7">
                        <Cell value={themVal as string | boolean} kind="them" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 sm:px-7 py-4 bg-card/40 border-t border-border flex items-center justify-between gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingDown className="size-3.5 text-primary" />
              {t("footerHint")}
            </div>
            <a href="#combiner" className="text-xs font-medium text-primary link-underline">
              {`→`}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
