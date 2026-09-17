import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/settings — public endpoint returning all site settings
// Used by the marketing pages to display dynamic pricing, credits, etc.
export async function GET() {
  try {
    const rows = await db.setting.findMany();
    // Merge DB values over defaults
    const merged: Record<string, { value: string; category: string }> = {
      ...DEFAULT_SETTINGS,
    };
    for (const r of rows) {
      merged[r.key] = { value: r.value, category: r.category };
    }
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(merged)) {
      result[k] = v.value;
    }
    return NextResponse.json({ success: true, settings: result });
  } catch (err) {
    console.error("[/api/settings] error:", err);
    // Fall back to defaults only (no DB read)
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      result[k] = v.value;
    }
    return NextResponse.json({ success: true, settings: result });
  }
}
