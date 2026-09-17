"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  Settings as SettingsIcon,
  Activity,
  Coins,
  TrendingUp,
  Loader2,
  Check,
  Search,
  Shield,
  Ban,
  RotateCcw,
  Crown,
  AlertCircle,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export type Stats = {
  users: { total: number; admins: number; suspended: number; active: number };
  merges: number;
  credits: { spent: number; purchased: number; transactions: number };
  revenue: { estimatedEur: number };
  activity: {
    recentUsers: {
      id: string;
      email: string;
      name: string | null;
      createdAt: string;
      plan: string;
      credits: number;
    }[];
    recentMerges: {
      id: string;
      prompt: string;
      status: string;
      createdAt: string;
      user: { email: string; name: string | null };
    }[];
  };
};

export type Setting = { key: string; value: string; category: string };

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  credits: number;
  suspended: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  _count: { merges: number; transactions: number };
};

export type Tab = "stats" | "users" | "settings";

export function AdminDashboard() {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [search, setSearch] = useState("");
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStats(data.stats);
      setSettings(data.settings || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(usersPagination.limit),
        });
        if (search) params.set("q", search);
        const res = await fetch(`/api/admin/users?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setUsers(data.users);
        setUsersPagination(data.pagination);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("loadError"));
      }
    },
    [search, usersPagination.limit, t]
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/signin?callbackUrl=/${locale}/admin`);
      return;
    }
    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, router, locale, fetchStats]);

  useEffect(() => {
    if (tab === "users" && status === "authenticated") {
      fetchUsers(usersPagination.page);
    }
  }, [tab, status, fetchUsers, usersPagination.page]);

  const updateUser = async (
    userId: string,
    action: "suspend" | "unsuspend" | "setAdmin" | "setUser" | "setCredits",
    value?: number
  ) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(t(`actionSuccess.${action}` as any));
      fetchUsers(usersPagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(t("settingsSaved"));
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("actionError"));
    } finally {
      setSavingSettings(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  if (status === "loading" || (status === "authenticated" && !stats && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const settingsByCategory = settings.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, Setting[]>
  );

  const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
    { id: "stats", label: t("tabStats"), icon: Activity },
    { id: "users", label: t("tabUsers"), icon: Users },
    { id: "settings", label: t("tabSettings"), icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AdminHeader locale={locale} email={session?.user?.email || ""} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display text-3xl sm:text-4xl font-medium leading-tight">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </motion.div>

          <div className="flex gap-1 p-1 rounded-xl border border-border bg-card/40 w-fit overflow-x-auto">
            {tabs.map((tabItem) => {
              const Icon = tabItem.icon;
              const active = tab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "num-badge"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
                  }`}
                >
                  <Icon className="size-4" />
                  {tabItem.label}
                </button>
              );
            })}
          </div>

          {tab === "stats" && (
            <StatsTab stats={stats} locale={locale} t={t} />
          )}

          {tab === "users" && (
            <UsersTab
              users={users}
              pagination={usersPagination}
              search={search}
              setSearch={setSearch}
              onSearch={() => fetchUsers(1)}
              onPage={(p) => fetchUsers(p)}
              onUpdate={updateUser}
              currentUserId={(session?.user as { id?: string })?.id}
              locale={locale}
              t={t}
            />
          )}

          {tab === "settings" && (
            <SettingsTab
              settingsByCategory={settingsByCategory}
              updateSetting={updateSetting}
              saveSettings={saveSettings}
              saving={savingSettings}
              t={t}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function AdminHeader({ locale, email }: { locale: string; email: string }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/dashboard`}
            className="size-9 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center"
            aria-label="Back to user dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="size-9 rounded-xl num-badge flex items-center justify-center">
            <Shield className="size-4.5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-medium">Fusionia</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary">
              Admin
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">{email}</div>
      </div>
    </header>
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

// Sub-components defined in separate file to keep this readable
import { StatsTab, UsersTab, SettingsTab } from "./admin-tabs";
