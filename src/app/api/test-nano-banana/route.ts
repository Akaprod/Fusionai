import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// GET /api/test-nano-banana — test gemini-2.5-flash-image (Nano Banana) with real image
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  const testPng = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gQIDAAAAJUlEQVR4nO3OAQ0AAAjAoNc/9CzjAcZoAQ0cghkBmTENCgB8LgQQoGMh0QAAAABJRU5ErkJggg==";

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
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Place this person in a sunny park with trees. Photorealistic, preserve the face exactly." },
              { type: "image_url", image_url: { url: `data:image/png;base64,${testPng}` } },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(90000),
    });

    const data = await res.json();
    const durationMs = Date.now() - start;

    return NextResponse.json({
      status: res.status,
      durationMs,
      model: data.model,
      error: data.error,
      choices: data.choices?.[0]?.message
        ? {
            role: data.choices[0].message.role,
            contentType: typeof data.choices[0].message.content,
            contentPreview:
              typeof data.choices[0].message.content === "string"
                ? data.choices[0].message.content.substring(0, 200)
                : Array.isArray(data.choices[0].message.content)
                ? data.choices[0].message.content.map((item: { type?: string; image_url?: { url?: string } }) => ({
                    type: item.type,
                    hasImageUrl: !!item.image_url?.url,
                    urlLength: item.image_url?.url?.length || 0,
                    urlPrefix: item.image_url?.url?.substring(0, 50),
                  }))
                : "unknown",
          }
        : null,
      usage: data.usage,
      rawResponseKeys: Object.keys(data),
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    });
  }
}
