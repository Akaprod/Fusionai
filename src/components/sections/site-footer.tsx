"use client";

import { useState } from "react";
import { Sparkles, Mail, Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  const [email, setEmail] = useState("");

  const l = (path: string) => `/${locale}${path}`;

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(t("newsletterError"));
      return;
    }
    toast.success(t("newsletterSuccess"));
    setEmail("");
  };

  const cols: { title: string; items: { label: string; href: string }[] }[] = [
    {
      title: t("product"),
      items: [
        { label: t("howItWorks"), href: "/how-it-works" },
        { label: t("features"), href: "/features" },
        { label: t("allTools"), href: "/presets" },
        { label: t("pricing"), href: "/pricing" },
        { label: t("workspace"), href: "/" },
      ],
    },
    {
      title: t("popularPresets"),
      items: [
        { label: t("twoPeople"), href: "/presets" },
        { label: t("backgroundSwap"), href: "/presets" },
        { label: t("productScene"), href: "/presets" },
        { label: t("virtualOutfit"), href: "/presets" },
        { label: t("restoreCombine"), href: "/presets" },
      ],
    },
    {
      title: t("company"),
      items: [
        { label: t("about"), href: "/" },
        { label: t("blog"), href: "/" },
        { label: t("faq"), href: "/faq" },
        { label: t("contact"), href: "/" },
      ],
    },
    {
      title: t("legal"),
      items: [
        { label: t("privacy"), href: "/" },
        { label: t("terms"), href: "/" },
        { label: t("acceptableUse"), href: "/" },
      ],
    },
  ];

  return (
    <footer className="relative mt-24 border-t border-border/60 overflow-hidden">
      <div className="absolute inset-0 aurora-bg-subtle pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px shimmer-line" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Brand + newsletter */}
          <div className="lg:col-span-4 space-y-6">
            <Link href={l("/")} className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl num-badge flex items-center justify-center">
                <Sparkles className="size-4.5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg font-medium">Fusionia</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Image · IA
                </span>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground text-pretty max-w-sm">
              {t("tagline")}
            </p>

            <form onSubmit={subscribe} className="space-y-2">
              <label
                htmlFor="footer-email"
                className="text-xs uppercase tracking-wider text-muted-foreground block"
              >
                {t("newsletterLabel")}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("newsletterPlaceholder")}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg num-badge text-sm font-medium hover:scale-[1.02] transition-transform"
                >
                  {t("newsletterCta")}
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 pt-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Réseau social"
                  className="size-9 inline-flex items-center justify-center rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {cols.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.items.map((item, idx) => (
                    <li key={idx}>
                      <Link
                        href={l(item.href)}
                        className="text-sm text-foreground/80 hover:text-primary link-underline transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Fusionia. {t("copyright")}
          </p>
          <p className="text-xs text-muted-foreground">{t("madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
