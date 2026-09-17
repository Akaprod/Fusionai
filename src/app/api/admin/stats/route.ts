import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, getAllSettings } from "@/lib/admin";

export const runtime = "nodejs";

// GET /api/admin/stats — global KPIs
export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    );
  }

  const [
    totalUsers,
    totalAdmins,
    totalSuspended,
    totalMerges,
    totalCreditsSpent,
    creditsPurchased,
    totalTransactions,
    recentUsers,
    recentMerges,
    settings,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "admin" } }),
    db.user.count({ where: { suspended: true } }),
    db.merge.count(),
    db.creditTransaction.aggregate({
      where: { amount: { lt: 0 } },
      _sum: { amount: true },
    }),
    db.creditTransaction.aggregate({
      where: { amount: { gt: 0 }, reason: { contains: "purchase" } },
      _sum: { amount: true },
    }),
    db.creditTransaction.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        plan: true,
        credits: true,
      },
    }),
    db.merge.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        prompt: true,
        status: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    }),
    getAllSettings(),
  ]);

  // Revenue estimate: each purchased credit = €0.40
  const revenueEstimate = (creditsPurchased._sum.amount || 0) * 0.4;

  // Daily counts for last 14 days
  const since = new Date();
  since.setDate(since.getDate() - 14);
  const dailyMerges = await db.merge.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: since } },
    _count: true,
  });
  const dailySignups = await db.user.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: since } },
    _count: true,
  });

  return NextResponse.json({
    success: true,
    stats: {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        suspended: totalSuspended,
        active: totalUsers - totalSuspended,
      },
      merges: totalMerges,
      credits: {
        spent: Math.abs(totalCreditsSpent._sum.amount || 0),
        purchased: creditsPurchased._sum.amount || 0,
        transactions: totalTransactions,
      },
      revenue: {
        estimatedEur: Number(revenueEstimate.toFixed(2)),
        creditsValue: creditsPurchased._sum.amount || 0,
      },
      activity: {
        recentUsers,
        recentMerges,
        dailyMergesCount: dailyMerges.length,
        dailySignupsCount: dailySignups.length,
      },
      settingsCount: settings.length,
    },
    settings,
  });
}
