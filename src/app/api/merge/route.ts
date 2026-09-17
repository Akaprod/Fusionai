import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 120;

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
  "720x1440",
]);

const RATIO_MAP: Record<string, string> = {
  "1:1": "1024x1024",
  "4:3": "1152x864",
  "3:4": "864x1152",
  "16:9": "1440x720",
  "9:16": "720x1440",
  auto: "1024x1024",
};

const CREDITS_PER_MERGE = 1;

/**
 * Valid images only — must be data URLs or http(s) URLs.
 * Returns at most 4 images.
 */
function pickValidImages(images: string[]): string[] {
  const valid: string[] = [];
  for (const img of images) {
    if (img && (img.startsWith("data:image") || img.startsWith("http"))) {
      valid.push(img);
      if (valid.length >= 4) break;
    }
  }
  return valid;
}

/**
 * Normalize image to PNG data URL when possible (better preservation
 * of source details than JPEG).
 */
function normalizeToPng(dataUrl: string): string {
  // Already PNG — keep as is
  if (dataUrl.startsWith("data:image/png")) return dataUrl;
  // JPEG or other — try to convert via sharp
  // For now, we keep it as-is (sharp conversion can be added if needed)
  return dataUrl;
}

/**
 * Build a focused, high-quality prompt that respects the user's intent.
 *
 * Strategy:
 * - Keep the user's prompt as the PRIMARY instruction
 * - Add a concise quality directive at the end (not at the start)
 * - Mention "preserve" instructions only for specific elements
 * - Don't repeat the source image count — the API gets that from `images`
 */
function buildPrompt(prompt: string, imageCount: number): string {
  const cleanPrompt = prompt.trim().replace(/\s+/g, " ");
  const qualityDirective =
    "Photorealistic result, single coherent photograph, natural lighting, realistic shadows, depth of field, no visible seams or artifacts, high detail, 4k quality.";

  if (imageCount === 1) {
    return `${cleanPrompt}. ${qualityDirective}`;
  }

  // Multi-image: keep the user's intent, add a short composition hint
  return `${cleanPrompt}. Preserve the identity of faces, the exact text of any labels or logos, and the proportions of the subjects. ${qualityDirective}`;
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    const body = (await req.json()) as MergeBody;
    const { prompt, images, size } = body || {};

    // --- Validate inputs ---
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

    const validImages = pickValidImages(images);
    if (validImages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Image source invalide." },
        { status: 400 }
      );
    }

    // --- Check auth + credits BEFORE calling the API ---
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

    // --- Resolve output size ---
    const finalSize =
      (size && RATIO_MAP[size]) ||
      (size && SUPPORTED_SIZES.has(size) ? size : "1024x1024");

    // --- Build focused prompt ---
    const composedPrompt = buildPrompt(prompt, validImages.length);

    // --- Call Z.AI image edit API ---
    // Strategy:
    // - Pass ALL valid images (the API supports multiple reference images)
    // - The first image is treated as the primary subject/lighting reference
    // - Additional images provide context (background, style, garment, etc.)
    const zai = await ZAI.create();
    const apiImages = validImages.map((url) => ({ url }));

    console.log(
      `[merge] user=${session?.user?.email || "anon"} images=${validImages.length} size=${finalSize} prompt_len=${composedPrompt.length}`
    );

    const response = await zai.images.generations.edit({
      prompt: composedPrompt,
      images: apiImages,
      size: finalSize as
        | "1024x1024"
        | "768x1344"
        | "864x1152"
        | "1344x768"
        | "1152x864"
        | "1440x720"
        | "720x1440",
    });

    const base64 = response?.data?.[0]?.base64;
    if (!base64) {
      console.error("[merge] No image data returned by the API");
      return NextResponse.json(
        {
          success: false,
          error:
            "Le modèle n'a pas retourné d'image. Vérifiez vos images et réessayez.",
        },
        { status: 502 }
      );
    }

    const dataUrl = `data:image/png;base64,${base64}`;
    const durationMs = Date.now() - startedAt;

    // --- Charge user + log merge ---
    if (userId) {
      // Re-check credits to avoid race conditions
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

    console.log(
      `[merge] ✓ success user=${session?.user?.email || "anon"} duration=${durationMs}ms charged=${chargedUser}`
    );

    return NextResponse.json({
      success: true,
      image: dataUrl,
      prompt: composedPrompt,
      size: finalSize,
      chargedUser,
      balanceAfter,
      durationMs,
      imageCount: validImages.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[merge] error:", message);
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
