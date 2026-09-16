"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

type Mode = "signin" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || t("signupError"));
        }
        // Auto sign in after signup
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          throw new Error(t("signinError"));
        }
        toast.success(t("welcomeBonus"));
        router.push(`/${locale}/dashboard`);
        router.refresh();
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          throw new Error(t("signinError"));
        }
        toast.success(t("signinSuccess"));
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("genericError");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
      <div
        aria-hidden
        className="absolute top-20 left-1/4 size-72 rounded-full bg-primary/10 blur-3xl animate-float-slow pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 glow-amber-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex size-14 rounded-2xl num-badge items-center justify-center mb-4">
            <Sparkles className="size-7" />
          </div>
          <h1 className="font-display text-3xl font-medium mb-2">
            {mode === "signup" ? t("signupTitle") : t("signinTitle")}
          </h1>
          <p className="text-sm text-muted-foreground text-pretty">
            {mode === "signup" ? t("signupSubtitle") : t("signinSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                {t("nameLabel")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-card/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
              {t("emailLabel")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@exemple.com"
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-card/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-card/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            {mode === "signup" && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t("passwordHint")}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl num-badge font-medium text-sm transition-transform hover:scale-[1.02] active:scale-[0.99] glow-amber-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("loading")}
              </>
            ) : (
              <>
                {mode === "signup" ? t("signupButton") : t("signinButton")}
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        {mode === "signup" && (
          <div className="mt-6 p-3 rounded-xl border border-primary/30 bg-primary/5 text-center">
            <p className="text-xs text-primary font-medium inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              {t("bonusOffer")}
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? t("haveAccount") : t("noAccount")}{" "}
          <a
            href={`/${locale}/${mode === "signup" ? "signin" : "signup"}`}
            className="text-primary link-underline font-medium"
          >
            {mode === "signup" ? t("signinLink") : t("signupLink")}
          </a>
        </p>
      </motion.div>
    </div>
  );
}
