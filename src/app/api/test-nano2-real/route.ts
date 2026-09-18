import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// GET /api/test-nano2-real — test Nano Banana 2 Lite with a REAL image
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  // Generate a real PNG image at runtime using sharp (already installed)
  let testPng: string;
  try {
    const sharp = (await import("sharp")).default;
    const svg = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="1024" height="1024" fill="#28201a"/>
        <circle cx="512" cy="450" r="200" fill="#e6b482"/>
        <circle cx="440" cy="400" r="25" fill="#322a24"/>
        <circle cx="580" cy="400" r="25" fill="#322a24"/>
        <path d="M 450 550 Q 512 620 580 550" stroke="#96503c" stroke-width="8" fill="none"/>
      </svg>
    `;
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    testPng = pngBuffer.toString("base64");
  } catch (err) {
    return NextResponse.json({
      error: "Failed to create test image",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

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
      signal: AbortSignal.timeout(100000),
    });

    const durationMs = Date.now() - start;
    const responseText = await res.text();

    let responseData: unknown;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText.substring(0, 500);
    }

    let hasImage = false;
    let imageLength = 0;
    const data = responseData as { choices?: { message?: { content?: unknown } }[] };
    const msgContent = data?.choices?.[0]?.message?.content;
    if (Array.isArray(msgContent)) {
      for (const item of msgContent as { type?: string; image_url?: { url?: string } }[]) {
        if (item.type === "image_url" && item.image_url?.url) {
          hasImage = true;
          imageLength = item.image_url.url.length;
        }
      }
    }

    return NextResponse.json({
      status: res.status,
      durationMs,
      model: "google/gemini-3.1-flash-lite-image",
      hasImage,
      imageLength,
      response: responseData,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    });
  }
}
