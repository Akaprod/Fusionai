import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/credits — current user balance + recent transactions
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Non authentifié." },
      { status: 401 }
    );
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      credits: true,
      plan: true,
      name: true,
      email: true,
    },
  });
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Utilisateur introuvable." },
      { status: 404 }
    );
  }
  const transactions = await db.creditTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const merges = await db.merge.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      prompt: true,
      status: true,
      creditsUsed: true,
      size: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      credits: user.credits,
      plan: user.plan,
    },
    transactions,
    merges,
  });
}

// POST /api/credits — buy credits (mock: just adds credits, no payment)
// Blocked until payment integration is ready (set CREDITS_PURCHASE_ENABLED=true to enable)
const CREDITS_PURCHASE_ENABLED = process.env.CREDITS_PURCHASE_ENABLED === "true";

interface BuyBody {
  amount?: number;
  pack?: "starter" | "medium" | "large";
}

const PACKS: Record<string, number> = {
  starter: 20,
  medium: 100,
  large: 500,
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Non authentifié." },
      { status: 401 }
    );
  }

  // Block purchases until payment integration is ready
  if (!CREDITS_PURCHASE_ENABLED) {
    return NextResponse.json(
      {
        success: false,
        error: "L'achat de crédits est temporairement désactivé. Le système de paiement est en cours d'intégration.",
        code: "PURCHASE_DISABLED",
      },
      { status: 403 }
    );
  }

  const body = (await req.json()) as BuyBody;
  const amount =
    body.amount && body.amount > 0
      ? body.amount
      : body.pack
      ? PACKS[body.pack] || 0
      : 0;

  if (amount <= 0) {
    return NextResponse.json(
      { success: false, error: "Montant invalide." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, credits: true },
  });
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Utilisateur introuvable." },
      { status: 404 }
    );
  }

  const newBalance = user.credits + amount;

  // Update user credits + log transaction atomically
  const [updatedUser, _txn] = await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { credits: newBalance },
    }),
    db.creditTransaction.create({
      data: {
        userId: user.id,
        amount,
        reason: `purchase_${body.pack || "custom"}`,
        balance: newBalance,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    credits: updatedUser.credits,
    added: amount,
  });
}
