import { NextRequest, NextResponse } from "next/server";
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

// OpenRouter configuration — user's API key (set OPENROUTER_API_KEY in Hostinger env vars)
// Primary and fallback models (NEVER use other models)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const PRIMARY_MODEL = "meta/muse-image";
const FALLBACK_MODEL = "black-forest-labs/flux.2-klein-4b";

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
 * Build a focused, high-quality prompt for image generation.
 * Since OpenRouter image generation is text-to-image (no reference image input),
 * we describe the desired result based on the user's prompt.
 */
function buildPrompt(prompt: string, imageCount: number): string {
  const cleanPrompt = prompt.trim().replace(/\s+/g, " ");
  const qualityDirective =
    "Photorealistic result, single coherent photograph, natural lighting, realistic shadows, depth of field, no visible seams or artifacts, high detail, 4k quality.";

  return `${cleanPrompt}. ${qualityDirective}`;
}

/**
 * Call OpenRouter image generation API.
 * Returns base64 image data (without the data: prefix).
 */
async function callOpenRouterImageGen(
  prompt: string,
  model: string,
  size: string
): Promise<{ base64?: string; url?: string; error?: string }> {
  if (!OPENROUTER_API_KEY) {
    return { error: "OPENROUTER_API_KEY env var not set" };
  }

  const body: Record<string, unknown> = {
    model,
    prompt,
    n: 1,
    response_format: "b64_json",
    size,
  };

  console.log(`[merge] calling OpenRouter model=${model} size=${size}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 100000); // 100s timeout

  try {
    const res = await fetch(`${OPENROUTER_BASE}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://allcombiner.online",
        "X-Title": "Fusionia Image Combiner",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[merge] OpenRouter ${model} HTTP ${res.status}:`, errText.substring(0, 300));
      return { error: `HTTP ${res.status}: ${errText.substring(0, 200)}` };
    }

    const data = await res.json();
    const item = data?.data?.[0];
    if (!item) {
      return { error: "No data in response" };
    }

    if (item.b64_json) {
      return { base64: item.b64_json };
    }
    if (item.url) {
      return { url: item.url };
    }
    return { error: "No image in response" };
  } catch (err) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[merge] OpenRouter ${model} error:`, msg);
    return { error: msg };
  }
}

/**
 * If OpenRouter returns a URL, fetch the image and convert to base64.
 */
async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image URL: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString("base64");
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

    console.log(
      `[merge] user=${session?.user?.email || "anon"} images=${validImages.length} size=${finalSize} prompt_len=${composedPrompt.length}`
    );

    // --- Call OpenRouter — try primary model, then fallback ---
    let result = await callOpenRouterImageGen(composedPrompt, PRIMARY_MODEL, finalSize);

    // If primary failed, try fallback
    if (result.error) {
      console.log(`[merge] primary model failed (${result.error.substring(0, 80)}), trying fallback ${FALLBACK_MODEL}`);
      result = await callOpenRouterImageGen(composedPrompt, FALLBACK_MODEL, finalSize);
    }

    if (result.error) {
      console.error("[merge] both models failed");
      return NextResponse.json(
        {
          success: false,
          error:
            "La fusion a échoué. Vérifiez vos images et votre description, puis réessayez.",
          detail: result.error,
        },
        { status: 502 }
      );
    }

    // --- Convert to base64 data URL ---
    let base64: string;
    if (result.base64) {
      base64 = result.base64;
    } else if (result.url) {
      console.log("[merge] fetching image URL from OpenRouter");
      base64 = await urlToBase64(result.url);
    } else {
      return NextResponse.json(
        { success: false, error: "Aucune image retournée par le modèle." },
        { status: 502 }
      );
    }

    const dataUrl = `data:image/png;base64,${base64}`;
    const durationMs = Date.now() - startedAt;

    // --- Charge user + log merge ---
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
