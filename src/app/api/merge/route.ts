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

// OpenRouter configuration — Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image)
// Cheapest image+image→image model on OpenRouter:
//   $0.25/M input tokens, $1.50/M output text tokens, $30/M image output tokens
//   → ~$0.034 per generated image (1K resolution = 1290 tokens)
//   → 3-4× faster than Gemini 2.5 Flash Image (5s vs 19s)
//   → Takes source images into account (preserves faces, identities, labels)
// NEVER use another model without explicit user authorization.
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const MERGE_MODEL = "google/gemini-3.1-flash-lite-image";

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
 * Build the prompt for Nano Banana 2 Lite.
 * The model accepts an instruction + image input, so we keep the user's intent
 * + a quality directive. Source images are passed as image_url content parts.
 */
function buildPrompt(prompt: string, imageCount: number): string {
  const cleanPrompt = prompt.trim().replace(/\s+/g, " ");
  const qualityDirective =
    "Photorealistic result, single coherent photograph, natural lighting, realistic shadows, depth of field, no visible seams or artifacts, high detail, 4k quality.";
  const preserveDirective =
    imageCount > 1
      ? " Preserve the identity of faces, the exact text of any labels or logos, and the proportions of the subjects."
      : " Preserve the identity of the subject.";
  return `${cleanPrompt}.${preserveDirective} ${qualityDirective}`;
}

/**
 * Call OpenRouter chat/completions with image input → image output.
 * Uses Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image).
 * Returns base64 image data (without the data: prefix).
 */
async function callNanoBanana2Lite(
  prompt: string,
  images: string[]
): Promise<{ base64?: string; error?: string; raw?: unknown }> {
  if (!OPENROUTER_API_KEY) {
    return { error: "OPENROUTER_API_KEY env var not set" };
  }

  // Build message content: text prompt + all source images
  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [{ type: "text", text: prompt }];

  for (const img of images) {
    content.push({
      type: "image_url",
      image_url: { url: img },
    });
  }

  console.log(
    `[merge] calling Nano Banana 2 Lite model=${MERGE_MODEL} images=${images.length} prompt_len=${prompt.length}`
  );

  const start = Date.now();
  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://allcombiner.online",
        "X-Title": "Fusionia Image Combiner",
      },
      body: JSON.stringify({
        model: MERGE_MODEL,
        messages: [{ role: "user", content }],
      }),
      signal: AbortSignal.timeout(100000),
    });

    const durationMs = Date.now() - start;
    console.log(`[merge] response HTTP ${res.status} in ${durationMs}ms`);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[merge] HTTP ${res.status}:`, errText.substring(0, 300));
      return { error: `HTTP ${res.status}: ${errText.substring(0, 200)}` };
    }

    const data = await res.json();
    const message = data?.choices?.[0]?.message;
    if (!message) {
      return { error: "No message in response", raw: data };
    }

    // The response content can be:
    // - an array of items with type "text" or "image_url" (structured)
    // - a string (older format, may contain markdown with image URL)
    const content = message.content;
    if (Array.isArray(content)) {
      for (const item of content) {
        if (item.type === "image_url" && item.image_url?.url) {
          const url = item.image_url.url;
          if (url.startsWith("data:")) {
            const base64 = url.split(",", 2)[1];
            return { base64 };
          }
          // Remote URL — fetch and convert to base64
          console.log("[merge] fetching remote image URL:", url.substring(0, 80));
          const imgRes = await fetch(url);
          if (!imgRes.ok) {
            return { error: `Failed to fetch image URL: HTTP ${imgRes.status}` };
          }
          const buf = Buffer.from(await imgRes.arrayBuffer());
          return { base64: buf.toString("base64") };
        }
      }
      return { error: "No image_url in response content array", raw: content };
    }

    // Fallback: string content
    if (typeof content === "string") {
      const dataMatch = content.match(/data:image\/[a-z]+;base64,([A-Za-z0-9+/=]+)/);
      if (dataMatch) {
        return { base64: dataMatch[1] };
      }
      const urlMatch = content.match(/https?:\/\/[^\s)"']+\.(?:png|jpg|jpeg|webp)/i);
      if (urlMatch) {
        console.log("[merge] found image URL in text content");
        const imgRes = await fetch(urlMatch[0]);
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          return { base64: buf.toString("base64") };
        }
      }
      return { error: "No image in string content", raw: content.substring(0, 200) };
    }

    return { error: "Unrecognized response format", raw: typeof content };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[merge] error:`, msg);
    return { error: msg };
  }
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
      `[merge] user=${session?.user?.email || "anon"} images=${validImages.length} size=${finalSize}`
    );

    // --- Call Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image) ---
    const result = await callNanoBanana2Lite(composedPrompt, validImages);

    if (result.error || !result.base64) {
      console.error("[merge] failed:", result.error);
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

    const dataUrl = `data:image/png;base64,${result.base64}`;
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
      model: MERGE_MODEL,
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
