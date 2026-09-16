import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

interface MergeBody {
  prompt: string;
  images: string[];
  size?: string;
}

const SUPPORTED_SIZES = new Set([
  "1024x1024",
  "768x1344",
  "864x1152",
  "1344x768",
  "1152x864",
  "1440x720",
  "720x1444",
]);

const RATIO_MAP: Record<string, string> = {
  "1:1": "1024x1024",
  "4:3": "1152x864",
  "3:4": "864x1152",
  "16:9": "1440x720",
  "9:16": "720x1444",
  auto: "1024x1024",
};

const CREDITS_PER_MERGE = 1;

function pickFirstImage(images: string[]): string | null {
  for (const img of images) {
    if (img && (img.startsWith("data:image") || img.startsWith("http"))) {
      return img;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MergeBody;
    const { prompt, images, size } = body || {};

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Une description (prompt) est requise." },
        { status: 400 }
      );
    }
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "Au moins une image source est requise." },
        { status: 400 }
      );
    }

    const primaryImage = pickFirstImage(images);
    if (!primaryImage) {
      return NextResponse.json(
        { success: false, error: "Image source invalide." },
        { status: 400 }
      );
    }

    // Check auth + credits
    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    let chargedUser = false;
    let balanceAfter: number | null = null;

    if (session?.user?.email) {
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
      if (user.credits < CREDITS_PER_MERGE) {
        return NextResponse.json(
          {
            success: false,
            error: "Crédits insuffisants. Achetez-en plus pour continuer.",
            code: "INSUFFICIENT_CREDITS",
            credits: user.credits,
            required: CREDITS_PER_MERGE,
          },
          { status: 402 }
        );
      }
      userId = user.id;
    }
    // If not authenticated, we still allow the merge (anonymous use) — but
    // in a real deployment you'd block it. Here we let it run for demo.

    const finalSize =
      (size && RATIO_MAP[size]) ||
      (size && SUPPORTED_SIZES.has(size) ? size : "1024x1024");

    const composedPrompt =
      images.length > 1
        ? `${prompt}. Compose elements from ${images.length} source images: the first image sets the lighting, camera angle and primary subject. Harmonise colours, shadows and depth of field so the result looks like a single coherent photograph taken at one moment. Preserve faces, logos and labels exactly as they appear in the sources. Avoid visible seams, duplicate subjects, or unnatural edges.`
        : `${prompt}. Render as a single coherent photograph with realistic lighting, shadows and depth of field.`;

    const zai = await ZAI.create();
    const response = await zai.images.generations.edit({
      prompt: composedPrompt,
      images: [{ url: primaryImage }],
      size: finalSize,
    });

    const base64 = response?.data?.[0]?.base64;
    if (!base64) {
      return NextResponse.json(
        { success: false, error: "Le modèle n'a pas retourné d'image. Réessayez." },
        { status: 502 }
      );
    }

    const dataUrl = `data:image/png;base64,${base64}`;

    // Charge the user + log merge + transaction
    if (userId) {
      const freshUser = await db.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });
      if (freshUser && freshUser.credits >= CREDITS_PER_MERGE) {
        const newBalance = freshUser.credits - CREDITS_PER_MERGE;
        await db.$transaction([
          db.user.update({
            where: { id: userId },
            data: { credits: newBalance },
          }),
          db.merge.create({
            data: {
              userId,
              prompt: prompt.slice(0, 500),
              status: "completed",
              creditsUsed: CREDITS_PER_MERGE,
              size: finalSize,
            },
          }),
          db.creditTransaction.create({
            data: {
              userId,
              amount: -CREDITS_PER_MERGE,
              reason: "merge",
              balance: newBalance,
            },
          }),
        ]);
        chargedUser = true;
        balanceAfter = newBalance;
      }
    }

    return NextResponse.json({
      success: true,
      image: dataUrl,
      prompt: composedPrompt,
      size: finalSize,
      chargedUser,
      balanceAfter,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[/api/merge] error:", message);
    return NextResponse.json(
      {
        success: false,
        error:
          "La fusion a échoué. Vérifiez vos images et votre description, puis réessayez.",
        detail: message,
      },
      { status: 500 }
    );
  }
}
