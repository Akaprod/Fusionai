import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// POST /api/admin/init
// One-time endpoint to promote a user to admin role.
// Protected by ADMIN_INIT_KEY env var (set it in Hostinger env once, then delete it after init).
//
// Body: { "email": "akaprodsarl@gmail.com", "key": "your-ADMIN_INIT_KEY-value" }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, key } = body || {};

    const expectedKey = process.env.ADMIN_INIT_KEY;
    if (!expectedKey || expectedKey.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ADMIN_INIT_KEY env var not set. Set it in Hostinger env vars first.",
        },
        { status: 500 }
      );
    }

    if (key !== expectedKey) {
      return NextResponse.json(
        { success: false, error: "Invalid init key." },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email required." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: `No user found with email ${email}` },
        { status: 404 }
      );
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: { role: "admin" },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: `User ${updated.email} is now admin. You can delete ADMIN_INIT_KEY env var for security.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/admin/init] error:", msg);
    return NextResponse.json(
      { success: false, error: "Init failed.", detail: msg },
      { status: 500 }
    );
  }
}
