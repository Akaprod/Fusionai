"use client";

import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="top"
      className="relative min-h-screen flex flex-col bg-white text-neutral-900 overflow-x-clip"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(249, 115, 22, 0.04) 0%, transparent 60%)",
        }}
      />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
