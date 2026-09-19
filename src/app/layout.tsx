// Root layout — minimal. Locale-aware layout lives in [locale]/layout.tsx.
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body style={{ backgroundColor: "#ffffff", color: "#0a0a0a" }}>
        {children}
      </body>
    </html>
  );
}
