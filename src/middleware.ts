import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const publicPages = ["/signin", "/signup", "/dashboard"];

// Protected paths that require authentication
const protectedPages = ["/dashboard"];

function isProtectedPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(fr|en|es)(?=\/|$)/, "") || "/";
  return protectedPages.some((p) =>
    p === "/" ? withoutLocale === "/" : withoutLocale.startsWith(p)
  );
}

function isPublicAuthPage(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(fr|en|es)(?=\/|$)/, "") || "/";
  return publicPages
    .filter((p) => p !== "/dashboard")
    .some((p) => withoutLocale.startsWith(p));
}

export default function middleware(req: any) {
  const { pathname } = req.nextUrl;

  // 1. Skip API & static
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Apply next-intl middleware (handles locale routing)
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
