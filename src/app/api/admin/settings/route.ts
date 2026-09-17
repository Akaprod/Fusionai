import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, getAllSettings, DEFAULT_SETTINGS } from "@/lib/admin";

export const runtime = "nodejs";

// GET /api/admin/settings — list all settings
export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    );
  }
  const settings = await getAllSettings();
  return NextResponse.json({ success: true, settings });
}

// PUT /api/admin/settings — bulk update settings
// Body: { "settings": [{ "key": "site.name", "value": "New Name" }, ...] }
export async function PUT(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    );
  }
  const body = await req.json();
  const { settings } = body || {};

  if (!Array.isArray(settings)) {
    return NextResponse.json(
      { success: false, error: "settings must be an array." },
      { status: 400 }
    );
  }

  const results: { key: string; success: boolean; error?: string }[] = [];
  for (const item of settings) {
    const { key, value } = item;
    if (!key || typeof value !== "string") {
      results.push({ key: String(key), success: false, error: "Invalid entry" });
      continue;
    }
    const category = DEFAULT_SETTINGS[key]?.category || "general";
    try {
      await db.setting.upsert({
        where: { key },
        update: { value, category },
        create: { key, value, category },
      });
      results.push({ key, success: true });
    } catch (err) {
      results.push({
        key,
        success: false,
        error: err instanceof Error ? err.message : "DB error",
      });
    }
  }

  return NextResponse.json({ success: true, results });
}
