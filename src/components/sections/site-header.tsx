"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, Globe, Check, ChevronDown, LayoutDashboard, LogIn, Coins } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const LOCALES = [
  { code: "fr", label: "Français", flag: "FR" },
  { code: "en", label: "English", flag: "US" },
  { code: "es", label: "Español", flag: "ES" },
] as const;

export function SiteHeader() {
  const t = useTranslations("Nav");
  const locale = useLocale() as "fr" | "en" | "es";
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Strip locale prefix from pathname to determine active route
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const navItems = [
    { href: "/how-it-works", label: t("howItWorks") },
    { href: "/features", label: t("features") },
    { href: "/presets", label: t("presets") },
    { href: "/pricing", label: t("pricing") },
    { href: "/faq", label: t("faq") },
  ];

  const changeLocale = (newLocale: string) => {
    setLangOpen(false);
    if (newLocale === locale) return;
    // Replace the locale prefix in the current path
    const newPath = `/${newLocale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
    router.push(newPath);
  };

  const currentLocaleObj = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-2 backdrop-blur-xl bg-background/70 border-b border-border/50"
          : "py-4 bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 group"
            aria-label="Fusionia — accueil"
          >
            <div className="relative size-9 rounded-xl overflow-hidden num-badge flex items-center justify-center transition-transform group-hover:rotate-6">
              <Sparkles className="size-4.5" />
              <div className="absolute inset-0 shimmer-animate opacity-50" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-medium tracking-tight">
                Fusionia
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Image · IA
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((l) => {
              const active = pathWithoutLocale === l.href;
              return (
                <Link
                  key={l.href}
                  href={`/${locale}${l.href}`}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Language switcher — always visible */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card/40 text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors"
                aria-label={t("language")}
                aria-expanded={langOpen}
              >
                <Globe className="size-4 text-primary" />
                <span className="font-medium uppercase">{currentLocaleObj.code}</span>
                <ChevronDown
                  className={`size-3.5 text-muted-foreground transition-transform ${
                    langOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setLangOpen(false)}
                    />
                    <motion.ul
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute z-50 right-0 top-full mt-2 w-44 rounded-xl border border-border bg-popover shadow-2xl backdrop-blur-xl p-1.5 space-y-0.5"
                    >
                      {LOCALES.map((l) => (
                        <li key={l.code}>
                          <button
                            type="button"
                            onClick={() => changeLocale(l.code)}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              l.code === locale
                                ? "bg-primary/15 text-primary"
                                : "hover:bg-accent/10"
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="size-5 rounded text-[10px] font-bold flex items-center justify-center bg-primary/20 text-primary">
                                {l.flag}
                              </span>
                              <span className="font-medium">{l.label}</span>
                            </span>
                            {l.code === locale && (
                              <Check className="size-4 text-primary" />
                            )}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  </>
                )}
              </AnimatePresence>
            </div>

            {status === "authenticated" && session?.user ? (
              <>
                {/* Admin button — only shown to admins */}
                {(session.user as { role?: string }).role === "admin" && (
                  <Link
                    href={`/${locale}/admin`}
                    className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-primary/40 bg-primary/15 text-primary text-sm font-medium hover:border-primary hover:bg-primary/20 transition-colors"
                    title={t("administration")}
                  >
                    <Shield className="size-4" />
                    <span>{t("administration")}</span>
                  </Link>
                )}
                <Link
                  href={`/${locale}/dashboard`}
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm font-medium hover:border-primary/50 transition-colors"
                  title={t("dashboard")}
                >
                  <Coins className="size-4" />
                  <span className="tabular-nums">
                    {(session.user as { credits?: number }).credits ?? 0}
                  </span>
                </Link>
                <Button size="sm" className="hidden sm:inline-flex glow-amber-sm" asChild>
                  <Link href={`/${locale}/dashboard`}>
                    <LayoutDashboard className="size-3.5" />
                    {t("dashboard")}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href={`/${locale}/signin`}>
                    <LogIn className="size-3.5" />
                    {t("signIn")}
                  </Link>
                </Button>
                <Button size="sm" className="hidden sm:inline-flex glow-amber-sm" asChild>
                  <Link href={`/${locale}/signup`}>
                    <Sparkles className="size-3.5" />
                    {t("getStarted")}
                  </Link>
                </Button>
              </>
            )}

            <button
              className="lg:hidden inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card/40 text-foreground"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={t("openMenu")}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-border/40 backdrop-blur-xl bg-background/95"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-1">
              {navItems.map((l) => (
                <Link
                  key={l.href}
                  href={`/${locale}${l.href}`}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm hover:bg-foreground/[0.04] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              {/* Admin link in mobile menu — only for admins */}
              {status === "authenticated" &&
                session?.user &&
                (session.user as { role?: string }).role === "admin" && (
                  <Link
                    href={`/${locale}/admin`}
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 px-3 py-2.5 rounded-lg text-sm bg-primary/15 border border-primary/40 text-primary hover:bg-primary/20 transition-colors flex items-center gap-2"
                  >
                    <Shield className="size-4" />
                    {t("administration")}
                  </Link>
                )}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button variant="outline" asChild>
                  <Link href={`/${locale}`} onClick={() => setMobileOpen(false)}>
                    {t("signIn")}
                  </Link>
                </Button>
                <Button className="glow-amber-sm" asChild>
                  <Link href={`/${locale}`} onClick={() => setMobileOpen(false)}>
                    {t("getStarted")}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
