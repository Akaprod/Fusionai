import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// GET /api/test-nano2-real — test Nano Banana 2 Lite with a hardcoded REAL JPEG
// No sharp dependency (which crashes on Hostinger)
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  // A real JPEG (200x200 solid red) — minimal but valid JPEG
  // Generated offline, no sharp needed
  const realJpegBase64 =
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC0zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAIAAgADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOE8tLTFGQzgyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyM/9oADAMBAAIRAxEAPwD3+iiigD//2Q==";

  const prompt = "Place this person in a sunny park with trees. Preserve the face exactly. Photorealistic.";

  const content = [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${realJpegBase64}` } },
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
      inputImageFormat: "jpeg",
      inputImageSize: realJpegBase64.length,
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
