// Root layout — minimal. Locale-aware layout lives in [locale]/layout.tsx.
// The nuclear dark-theme CSS stays here so it applies before React hydration.
import "./globals.css";

const NUCLEAR_CSS = `
:root, html, body, .dark, #__next {
  --background: #15120f !important;
  --foreground: #f8f5f0 !important;
  --card: #26211b !important;
  --card-foreground: #f8f5f0 !important;
  --popover: #28231c !important;
  --popover-foreground: #f8f5f0 !important;
  --primary: #f0c269 !important;
  --primary-foreground: #1c1814 !important;
  --secondary: #312b23 !important;
  --secondary-foreground: #f8f5f0 !important;
  --muted: #312b23 !important;
  --muted-foreground: #a89f94 !important;
  --accent: #e27749 !important;
  --accent-foreground: #1c1814 !important;
  --destructive: #dc4646 !important;
  --border: rgba(120, 108, 92, 0.35) !important;
  --input: rgba(60, 52, 42, 0.8) !important;
  --ring: rgba(240, 194, 105, 0.6) !important;
  color-scheme: dark !important;
  background-color: #15120f !important;
  color: #f8f5f0 !important;
}
html, body {
  background-color: #15120f !important;
  color: #f8f5f0 !important;
  min-height: 100vh !important;
}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body style={{ backgroundColor: "#15120f", color: "#f8f5f0" }}>
        <style dangerouslySetInnerHTML={{ __html: NUCLEAR_CSS }} />
        {children}
      </body>
    </html>
  );
}
