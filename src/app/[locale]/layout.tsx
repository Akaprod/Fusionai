import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { routing } from "@/i18n/routing";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const localeCode = hasLocale(routing.locales, locale) ? locale : "fr";

  const pageKeys: Record<string, { title: string; desc: string }> = {
    fr: { title: t("title"), desc: t("description") },
    en: { title: t("title"), desc: t("description") },
    es: { title: t("title"), desc: t("description") },
  };
  void localeCode;

  return {
    title: pageKeys[locale as string]?.title ?? t("title"),
    description: pageKeys[locale as string]?.desc ?? t("description"),
    keywords: [
      "fusionner images",
      "combiner photos",
      "IA image",
      "image combiner",
      "AI image",
    ],
    authors: [{ name: "Fusionia" }],
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Fusionia",
      type: "website",
      locale: locale === "en" ? "en_US" : locale === "es" ? "es_ES" : "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <AuthProvider>
        <div
          className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
        >
          {children}
          <Toaster />
        </div>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
