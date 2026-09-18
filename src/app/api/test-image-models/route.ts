import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// GET /api/test-image-models — find a working image+image→image model on Hostinger
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  // Minimal test PNG (small red square)
  const testPng = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gQIDAAAAJUlEQVR4nO3OAQ0AAAjAoNc/9CzjAcZoAQ0cghkBmTENCgB8LgQQoGMh0QAAAABJRU5ErkJggg==";

  const modelsToTest = [
    "google/gemini-3.1-flash-image",
    "google/gemini-3-pro-image",
    "google/gemini-3.1-flash-image-preview",
    "google/gemini-3-pro-image-preview",
    "google/gemini-2.5-flash-image",
    "openai/gpt-5-image",
    "openai/gpt-5-image-mini",
    "openrouter/auto",
    "openrouter/auto-beta",
  ];

  const results: Array<{ model: string; status: string; hasImage?: boolean; error?: string; durationMs?: number }> = [];

  for (const model of modelsToTest) {
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
          model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Place this person in a sunny park. Photorealistic." },
                { type: "image_url", image_url: { url: `data:image/png;base64,${testPng}` } },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await res.json();
      const durationMs = Date.now() - start;

      if (data.error) {
        results.push({
          model,
          status: `error ${data.error.code || res.status}`,
          error: data.error.message?.substring(0, 100),
          durationMs,
        });
      } else {
        const content = data.choices?.[0]?.message?.content;
        let hasImage = false;
        if (Array.isArray(content)) {
          hasImage = content.some(
            (item: { type?: string }) => item.type === "image_url"
          );
        }
        results.push({
          model,
          status: `ok ${res.status}`,
          hasImage,
          durationMs,
        });
      }
    } catch (err) {
      results.push({
        model,
        status: "exception",
        error: err instanceof Error ? err.message.substring(0, 100) : String(err),
        durationMs: Date.now() - start,
      });
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results,
    workingModels: results
      .filter((r) => r.hasImage)
      .map((r) => `${r.model} (${r.durationMs}ms)`),
  });
}
