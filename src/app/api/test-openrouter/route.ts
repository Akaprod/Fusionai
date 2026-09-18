import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// GET /api/test-openrouter — diagnostic endpoint (temporary)
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      OPENROUTER_API_KEY_SET: !!apiKey,
      OPENROUTER_API_KEY_LENGTH: apiKey?.length || 0,
      OPENROUTER_API_KEY_PREFIX: apiKey?.substring(0, 10) + "...",
    },
  };

  if (!apiKey) {
    result.error = "OPENROUTER_API_KEY env var not set";
    return NextResponse.json(result, { status: 500 });
  }

  // Test 1: connectivity to openrouter.ai
  try {
    const start = Date.now();
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15000),
    });
    result.connectivity = {
      status: res.status,
      duration_ms: Date.now() - start,
      ok: res.ok,
    };
  } catch (err) {
    result.connectivity = {
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // Test 2: actual image generation with flux.2-klein-4b
  try {
    const start = Date.now();
    const res = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://allcombiner.online",
        "X-Title": "Fusionia Test",
      },
      body: JSON.stringify({
        model: "black-forest-labs/flux.2-klein-4b",
        prompt: "a simple test image, blue square",
        n: 1,
        response_format: "b64_json",
        size: "1024x1024",
      }),
      signal: AbortSignal.timeout(90000),
    });
    const data = await res.json();
    result.image_generation = {
      status: res.status,
      duration_ms: Date.now() - start,
      has_image: !!data?.data?.[0]?.b64_json,
      image_size: data?.data?.[0]?.b64_json?.length || 0,
      error: data?.error?.message,
    };
  } catch (err) {
    result.image_generation = {
      error: err instanceof Error ? err.message : String(err),
    };
  }

  return NextResponse.json(result, { status: 200 });
}
