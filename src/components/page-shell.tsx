"use client";

import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export function PageShell({ children }: { children: React.ReactNode }) {
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
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
