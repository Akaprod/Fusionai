import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

// GET /api/admin/users — list all users (with pagination + search)
// Query: ?q=search&role=any|admin|user&suspended=any|true|false&page=1&limit=20
export async function GET(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    );
  }
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const role = url.searchParams.get("role") || "any";
  const suspended = url.searchParams.get("suspended") || "any";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { email: { contains: q } },
      { name: { contains: q } },
    ];
  }
  if (role === "admin" || role === "user") {
    where.role = role;
  }
  if (suspended === "true") where.suspended = true;
  if (suspended === "false") where.suspended = false;

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        credits: true,
        suspended: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { merges: true, transactions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// PATCH /api/admin/users — update a user (suspend, change role, set credits)
// Body: { "userId": "abc123", "action": "suspend|unsuspend|setAdmin|setUser|setCredits", "value": 100 }
export async function PATCH(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    );
  }
  const body = await req.json();
  const { userId, action, value } = body || {};

  if (!userId || !action) {
    return NextResponse.json(
      { success: false, error: "userId and action required." },
      { status: 400 }
    );
  }

  const adminUser = check.user;
  if (userId === adminUser.id && (action === "suspend" || action === "setUser")) {
    return NextResponse.json(
      { success: false, error: "You cannot demote or suspend yourself." },
      { status: 400 }
    );
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, credits: true, role: true },
  });
  if (!target) {
    return NextResponse.json(
      { success: false, error: "User not found." },
      { status: 404 }
    );
  }

  let data: Record<string, unknown> = {};
  let logTxn = false;
  let txnAmount = 0;

  switch (action) {
    case "suspend":
      data.suspended = true;
      break;
    case "unsuspend":
      data.suspended = false;
      break;
    case "setAdmin":
      data.role = "admin";
      break;
    case "setUser":
      data.role = "user";
      break;
    case "setCredits": {
      const newCredits = Number(value);
      if (!Number.isFinite(newCredits) || newCredits < 0) {
        return NextResponse.json(
          { success: false, error: "Invalid credits value." },
          { status: 400 }
        );
      }
      data.credits = newCredits;
      logTxn = true;
      txnAmount = newCredits - target.credits;
      break;
    }
    default:
      return NextResponse.json(
        { success: false, error: `Unknown action: ${action}` },
        { status: 400 }
      );
  }

  const updated = await db.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      credits: true,
      suspended: true,
    },
  });

  if (logTxn) {
    await db.creditTransaction.create({
      data: {
        userId,
        amount: txnAmount,
        reason: `admin_adjustment_by_${adminUser.email}`,
        balance: updated.credits,
      },
    });
  }

  return NextResponse.json({
    success: true,
    user: updated,
    action,
    delta: logTxn ? txnAmount : undefined,
  });
}
