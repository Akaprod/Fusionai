import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// GET /api/test-nano2-real — test Nano Banana 2 Lite with a minimal REAL JPEG
// JPEG is generated via sharp from a simple SVG (no transparency, simpler format)
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  // Generate a real JPEG image (1024x1024) using sharp
  let testImg: string;
  let testImgFormat: string;
  try {
    const sharp = (await import("sharp")).default;
    const svg = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="1024" height="1024" fill="#28201a"/>
        <circle cx="512" cy="450" r="200" fill="#e6b482"/>
        <circle cx="440" cy="400" r="25" fill="#322a24"/>
        <circle cx="580" cy="400" r="25" fill="#322a24"/>
      </svg>
    `;
    const jpgBuffer = await sharp(Buffer.from(svg))
      .jpeg({ quality: 90 })
      .toBuffer();
    testImg = jpgBuffer.toString("base64");
    testImgFormat = "jpeg";
  } catch (err) {
    return NextResponse.json({
      error: "Failed to create test image",
      detail: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }

  const prompt = "Place this person in a sunny park with trees. Preserve the face exactly. Photorealistic.";

  const content = [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: `data:image/${testImgFormat};base64,${testImg}` } },
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
    let imagePrefix = "";
    const data = responseData as { choices?: { message?: { content?: unknown } }[] };
    const msgContent = data?.choices?.[0]?.message?.content;
    if (Array.isArray(msgContent)) {
      for (const item of msgContent as { type?: string; image_url?: { url?: string } }[]) {
        if (item.type === "image_url" && item.image_url?.url) {
          hasImage = true;
          imageLength = item.image_url.url.length;
          imagePrefix = item.image_url.url.substring(0, 60);
        }
      }
    }

    return NextResponse.json({
      status: res.status,
      durationMs,
      model: "google/gemini-3.1-flash-lite-image",
      inputImageFormat: testImgFormat,
      inputImageSize: testImg.length,
      hasImage,
      imageLength,
      imagePrefix,
      response: responseData,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    });
  }
}
