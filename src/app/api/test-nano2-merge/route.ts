import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// GET /api/test-nano2-merge — test Nano Banana 2 Lite with image input (like /api/merge does)
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  const testPng = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gQIDAAAAJUlEQVR4nO3OAQ0AAAjAoNc/9CzjAcZoAQ0cghkBmTENCgB8LgQQoGMh0QAAAABJRU5ErkJggg==";

  const prompt = "Place this person in a sunny park with trees. Preserve the face exactly. Photorealistic.";

  const content = [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: `data:image/png;base64,${testPng}` } },
  ];

  const start = Date.now();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://allcombiner.online",
        "X-Title": "Fusionia Test",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite-image",
        messages: [{ role: "user", content }],
      }),
      signal: AbortSignal.timeout(90000),
    });

    const durationMs = Date.now() - start;
    const responseText = await res.text();

    let responseData: unknown;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText.substring(0, 500);
    }

    return NextResponse.json({
      status: res.status,
      durationMs,
      model: "google/gemini-3.1-flash-lite-image",
      response: responseData,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    });
  }
}
