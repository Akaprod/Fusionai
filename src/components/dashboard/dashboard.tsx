"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Coins,
  TrendingUp,
  Plus,
  Loader2,
  Check,
  Clock,
  Zap,
  CreditCard,
  History,
  AlertCircle,
  Image as ImageIcon,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Txn = {
  id: string;
  amount: number;
  reason: string;
  balance: number;
  createdAt: string;
};

type Merge = {
  id: string;
  prompt: string;
  status: string;
  creditsUsed: number;
  size: string | null;
  createdAt: string;
};

type UserData = {
  user: {
    id: string;
    email: string;
    name: string | null;
    credits: number;
    plan: string;
  };
  transactions: Txn[];
  merges: Merge[];
};

const CREDIT_PACKS = [
  { id: "starter", credits: 20, labelKey: "packStarter" },
  { id: "medium", credits: 100, labelKey: "packMedium" },
  { id: "large", credits: 500, labelKey: "packLarge" },
] as const;

export function Dashboard() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/credits");
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/signin`);
      return;
    }
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, locale, fetchData]);

  const buyCredits = async (packId: string, amount: number) => {
    setBuying(packId);
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packId, amount }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || t("buyError"));
      }
      toast.success(t("buySuccess", { count: json.added }));
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("buyError"));
    } finally {
      setBuying(null);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}` });
  };

  if (status === "loading" || (status === "authenticated" && !data && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { user, transactions, merges } = data;
  const localeStr = locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";

  return (
    <div
      id="top"
      className="relative min-h-screen flex flex-col bg-background text-foreground overflow-x-clip"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 0%, rgba(240, 194, 105, 0.06) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl num-badge flex items-center justify-center">
              <Sparkles className="size-4.5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-medium">Fusionia</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Dashboard
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
              <Coins className="size-4" />
              <span className="tabular-nums">{user.credits}</span>
              <span className="text-xs text-primary/80 hidden sm:inline">
                {t("creditsUnit")}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{t("signOut")}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Welcome */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-primary mb-2">
                <Sparkles className="size-3.5" />
                {t("welcomeEyebrow")}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-medium leading-tight tracking-tight">
                {t("welcomeTitle", { name: user.name || user.email })}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("welcomeSubtitle")}
              </p>
            </div>
            <Link
              href={`/${locale}#combiner`}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl num-badge text-sm font-medium hover:scale-[1.02] transition-transform glow-amber-sm"
            >
              <Sparkles className="size-4" />
              {t("newMerge")}
            </Link>
          </motion.section>

          {/* Stats grid */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              icon={<Coins className="size-5" />}
              label={t("statCredits")}
              value={String(user.credits)}
              accent="num-badge"
            />
            <StatCard
              icon={<ImageIcon className="size-5" />}
              label={t("statMerges")}
              value={String(merges.length)}
            />
            <StatCard
              icon={<TrendingUp className="size-5" />}
              label={t("statPlan")}
              value={user.plan === "free" ? t("planFree") : user.plan.toUpperCase()}
            />
            <StatCard
              icon={<Clock className="size-5" />}
              label={t("statMember")}
              value={new Date().toLocaleDateString(localeStr, {
                month: "short",
                day: "numeric",
              })}
            />
          </motion.section>

          {/* Buy credits */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-3xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 mb-5">
              <Plus className="size-5 text-primary" />
              <h2 className="font-display text-xl font-medium">
                {t("buyTitle")}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6 text-pretty">
              {t("buySubtitle")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="relative rounded-2xl border border-border bg-card/40 p-5 hover:border-primary/40 hover:bg-primary/[0.04] transition-all"
                >
                  {pack.id === "medium" && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 num-badge text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      <Sparkles className="size-3" />
                      {t("bestValue")}
                    </span>
                  )}
                  <div className="text-center">
                    <div className="font-display text-4xl font-medium gradient-text-warm tabular-nums">
                      {pack.credits}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                      {t(pack.labelKey as "packStarter" | "packMedium" | "packLarge")}
                    </div>
                    <div className="mt-3 text-2xl font-medium tabular-nums">
                      {(pack.credits * 0.4)
                        .toFixed(2)
                        .replace(".", locale === "fr" || locale === "es" ? "," : ".")}{" "}
                      €
                    </div>
                    <Button
                      onClick={() => buyCredits(pack.id, pack.credits)}
                      disabled={buying === pack.id}
                      className={`w-full mt-4 h-10 rounded-lg text-sm font-medium ${
                        pack.id === "medium"
                          ? "num-badge glow-amber-sm"
                          : "border border-border bg-card/60 hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      {buying === pack.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="size-4" />
                          {t("buyButton")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <AlertCircle className="size-3.5" />
              {t("buyNote")}
            </p>
          </motion.section>

          {/* Two columns: history + merges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transactions */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="glass-card rounded-3xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-5">
                <History className="size-5 text-primary" />
                <h2 className="font-display text-xl font-medium">
                  {t("transactionsTitle")}
                </h2>
              </div>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  {t("transactionsEmpty")}
                </p>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {transactions.map((txn) => (
                    <li
                      key={txn.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-card/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                            txn.amount > 0
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {txn.amount > 0 ? (
                            <Plus className="size-4" />
                          ) : (
                            <Zap className="size-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {t.has(`reasons.${txn.reason}` as any)
                              ? t(`reasons.${txn.reason}` as any)
                              : txn.reason}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(txn.createdAt).toLocaleString(localeStr, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-semibold tabular-nums ${
                            txn.amount > 0 ? "text-emerald-300" : "text-foreground"
                          }`}
                        >
                          {txn.amount > 0 ? "+" : ""}
                          {txn.amount}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {t("balance")}: {txn.balance}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>

            {/* Recent merges */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-3xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-5">
                <ImageIcon className="size-5 text-primary" />
                <h2 className="font-display text-xl font-medium">
                  {t("mergesTitle")}
                </h2>
              </div>
              {merges.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto size-14 rounded-2xl border border-dashed border-border flex items-center justify-center text-muted-foreground/60 mb-3">
                    <ImageIcon className="size-6" />
                  </div>
                  <p className="text-sm font-medium mb-1">{t("mergesEmpty")}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {t("mergesEmptyHint")}
                  </p>
                  <Link
                    href={`/${locale}#combiner`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary link-underline font-medium"
                  >
                    <Sparkles className="size-4" />
                    {t("newMerge")}
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {merges.map((m) => (
                    <li
                      key={m.id}
                      className="p-3 rounded-xl border border-border/60 bg-card/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="size-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                            <ImageIcon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm line-clamp-2 text-foreground/90">
                              {m.prompt}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Zap className="size-3" />
                                {m.creditsUsed} {t("creditsUnit")}
                              </span>
                              {m.size && (
                                <span className="text-muted-foreground/70">
                                  · {m.size}
                                </span>
                              )}
                              <span className="text-muted-foreground/70">
                                ·{" "}
                                {new Date(m.createdAt).toLocaleDateString(localeStr, {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 size-6 rounded-full bg-emerald-500/15 text-emerald-300 shrink-0 justify-center">
                          <Check className="size-3.5" />
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5">
      <div
        className={`size-10 rounded-xl flex items-center justify-center mb-3 ${
          accent || "bg-primary/15 text-primary"
        }`}
      >
        {icon}
      </div>
      <div className="font-display text-2xl font-medium tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}
