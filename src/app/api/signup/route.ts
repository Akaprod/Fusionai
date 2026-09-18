import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const runtime = "nodejs";

interface SignupBody {
  email?: string;
  password?: string;
  name?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Toggle signup via env var (set SIGNUP_ENABLED=false on Hostinger to block registrations)
const SIGNUP_ENABLED = process.env.SIGNUP_ENABLED !== "false";

export async function POST(req: NextRequest) {
  // Block registrations if disabled
  if (!SIGNUP_ENABLED) {
    return NextResponse.json(
      {
        success: false,
        error: "Les inscriptions sont temporairement désactivées. Le service est en version bêta. Revenez bientôt !",
        code: "SIGNUP_DISABLED",
      },
      { status: 403 }
    );
  }

  try {
    const body = (await req.json()) as SignupBody;
    const email = body.email?.toLowerCase().trim();
    const password = body.password;
    const name = body.name?.trim() || null;

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: "Email invalide." },
        { status: 400 }
      );
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Le mot de passe doit contenir au moins 6 caractères.",
        },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        credits: 5, // welcome bonus
        plan: "free",
      },
    });

    // Log the welcome bonus
    await db.creditTransaction.create({
      data: {
        userId: user.id,
        amount: 5,
        reason: "welcome_bonus",
        balance: 5,
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[/api/signup] error:", msg);
    // Return detailed error for debugging (remove sensitive info in production later)
    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'inscription.",
        detail: process.env.NODE_ENV === "production" ? undefined : msg,
        code: (err as { code?: string }).code,
      },
      { status: 500 }
    );
  }
}
