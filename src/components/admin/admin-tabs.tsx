"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  Coins,
  TrendingUp,
  Check,
  Search,
  Ban,
  RotateCcw,
  Crown,
  Shield,
  AlertCircle,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Stats, Setting, AdminUser, Tab } from "./admin-dashboard";

type TFunc = (key: string, params?: Record<string, string | number | Date>) => string;

export function StatsTab({
  stats,
  locale,
  t,
}: {
  stats: Stats;
  locale: string;
  t: TFunc;
}) {
  const localeStr = locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Users className="size-5" />}
          label={t("kpiUsers")}
          value={String(stats.users.total)}
          hint={`${stats.users.active} ${t("active")} · ${stats.users.admins} ${t("admins")}`}
        />
        <KpiCard
          icon={<Sparkles className="size-5" />}
          label={t("kpiMerges")}
          value={stats.merges.toLocaleString()}
          hint={`${stats.activity.recentMerges.length} ${t("recent")}`}
        />
        <KpiCard
          icon={<Coins className="size-5" />}
          label={t("kpiCredits")}
          value={stats.credits.purchased.toLocaleString()}
          hint={`${stats.credits.spent.toLocaleString()} ${t("spent")}`}
        />
        <KpiCard
          icon={<TrendingUp className="size-5" />}
          label={t("kpiRevenue")}
          value={`${stats.revenue.estimatedEur.toLocaleString(localeStr, { minimumFractionDigits: 2 })} €`}
          hint={`${stats.credits.transactions} ${t("transactions")}`}
          accent="num-badge"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="glass-card rounded-3xl p-6">
          <h2 className="font-display text-xl font-medium mb-4 flex items-center gap-2">
            <Users className="size-5 text-primary" />
            {t("recentUsers")}
          </h2>
          <ul className="space-y-2">
            {stats.activity.recentUsers.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-card/30"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {u.name || u.email}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {u.email} · {u.plan} · {u.credits} {t("credits")}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {new Date(u.createdAt).toLocaleDateString(localeStr, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h2 className="font-display text-xl font-medium mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            {t("recentMerges")}
          </h2>
          <ul className="space-y-2">
            {stats.activity.recentMerges.map((m) => (
              <li
                key={m.id}
                className="p-3 rounded-xl border border-border/60 bg-card/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm line-clamp-2 flex-1">{m.prompt}</p>
                  <span className="inline-flex size-5 rounded-full bg-emerald-500/15 text-emerald-300 shrink-0 justify-center items-center">
                    <Check className="size-3" />
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {m.user.name || m.user.email} ·{" "}
                  {new Date(m.createdAt).toLocaleString(localeStr, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </motion.div>
  );
}

export function UsersTab({
  users,
  pagination,
  search,
  setSearch,
  onSearch,
  onPage,
  onUpdate,
  currentUserId,
  locale,
  t,
}: {
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  search: string;
  setSearch: (v: string) => void;
  onSearch: () => void;
  onPage: (p: number) => void;
  onUpdate: (userId: string, action: "suspend" | "unsuspend" | "setAdmin" | "setUser" | "setCredits", value?: number) => void;
  currentUserId?: string;
  locale: string;
  t: TFunc;
}) {
  const localeStr = locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder={t("searchPlaceholder")}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <Button onClick={onSearch} variant="outline" size="sm">
          {t("search")}
        </Button>
        <span className="text-xs text-muted-foreground">
          {pagination.total} {t("usersFound")}
        </span>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-border">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">{t("colUser")}</th>
                <th className="py-3 px-4">{t("colPlan")}</th>
                <th className="py-3 px-4 text-right">{t("colCredits")}</th>
                <th className="py-3 px-4">{t("colActivity")}</th>
                <th className="py-3 px-4">{t("colStatus")}</th>
                <th className="py-3 px-4 text-right">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.02]"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full num-badge flex items-center justify-center text-xs font-medium shrink-0">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate flex items-center gap-1">
                          {u.name || u.email}
                          {u.role === "admin" && (
                            <Crown className="size-3 text-primary" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 rounded-md bg-card/60 border border-border">
                      {u.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium">
                    {u.credits}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {u._count.merges} {t("merges")} · {u._count.transactions} {t("txns")}
                    <div className="text-[10px] opacity-70">
                      {new Date(u.createdAt).toLocaleDateString(localeStr, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {u.suspended ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-destructive/15 text-destructive">
                        <Ban className="size-3" />
                        {t("suspended")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300">
                        <Check className="size-3" />
                        {t("active")}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      {u.role === "admin" ? (
                        <button
                          onClick={() => onUpdate(u.id, "setUser")}
                          disabled={u.id === currentUserId}
                          className="p-1.5 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={t("demoteUser")}
                        >
                          <Crown className="size-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdate(u.id, "setAdmin")}
                          className="p-1.5 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5"
                          title={t("promoteAdmin")}
                        >
                          <Shield className="size-3.5" />
                        </button>
                      )}
                      {u.suspended ? (
                        <button
                          onClick={() => onUpdate(u.id, "unsuspend")}
                          className="p-1.5 rounded-md border border-border hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-300"
                          title={t("unsuspend")}
                        >
                          <RotateCcw className="size-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdate(u.id, "suspend")}
                          disabled={u.id === currentUserId}
                          className="p-1.5 rounded-md border border-border hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                          title={t("suspend")}
                        >
                          <Ban className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const input = prompt(t("setCreditsPrompt", { current: u.credits }));
                          if (input !== null) {
                            const n = parseInt(input, 10);
                            if (!Number.isNaN(n) && n >= 0) {
                              onUpdate(u.id, "setCredits", n);
                            } else {
                              toast.error(t("invalidNumber"));
                            }
                          }
                        }}
                        className="p-1.5 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5"
                        title={t("setCredits")}
                      >
                        <Coins className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-border text-xs">
            <span className="text-muted-foreground">
              {t("page")} {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                →
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function SettingsTab({
  settingsByCategory,
  updateSetting,
  saveSettings,
  saving,
  t,
}: {
  settingsByCategory: Record<string, Setting[]>;
  updateSetting: (key: string, value: string) => void;
  saveSettings: () => void;
  saving: boolean;
  t: TFunc;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <AlertCircle className="size-4" />
          {t("settingsHint")}
        </p>
        <Button onClick={saveSettings} disabled={saving} className="glow-amber-sm">
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Save className="size-4" />
              {t("save")}
            </>
          )}
        </Button>
      </div>

      {Object.entries(settingsByCategory).map(([category, items]) => (
        <section key={category} className="glass-card rounded-3xl p-6">
          <h2 className="font-display text-xl font-medium mb-4 capitalize flex items-center gap-2">
            <Coins className="size-5 text-primary" />
            {t(`category.${category}`)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((s) => (
              <div key={s.key}>
                <label
                  htmlFor={`setting-${s.key}`}
                  className="text-xs font-mono text-muted-foreground mb-1.5 block"
                >
                  {s.key}
                </label>
                <input
                  id={`setting-${s.key}`}
                  type="text"
                  value={s.value}
                  onChange={(e) => updateSetting(s.key, e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card/60 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </motion.div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
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
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
