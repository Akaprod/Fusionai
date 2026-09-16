import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/health — diagnostic endpoint (no auth required)
export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      DATABASE_URL_FORMAT: process.env.DATABASE_URL?.startsWith("mysql://")
        ? "mysql"
        : process.env.DATABASE_URL?.startsWith("file:")
        ? "sqlite"
        : "unknown",
      AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "(not set)",
    },
  };

  // Test DB connection
  try {
    // Simple raw query to test connection
    const result = await db.$queryRaw`SELECT 1 AS ok, NOW() AS server_time, VERSION() AS version`;
    checks.database = {
      status: "connected",
      info: result,
    };

    // Count tables
    const tables = await db.$queryRaw`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()` as { TABLE_NAME: string }[];
    checks.database.tables = tables.map((t) => t.TABLE_NAME);
  } catch (err) {
    checks.database = {
      status: "error",
      error: err instanceof Error ? err.message : String(err),
      code: (err as { code?: string }).code,
    };
  }

  return NextResponse.json(checks, { status: 200 });
}
