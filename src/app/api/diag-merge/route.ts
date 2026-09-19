import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — let the request complete fully
export const dynamic = "force-dynamic";

// Hardcoded valid JPEG (200x200 solid red) — minimal but real
const REAL_JPEG =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC0zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAIAAgADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOE8tLTFGQzgyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyM/9oADAMBAAIRAxEAPwD3+iiigD//2Q==";

type Step = { label: string; ms: number };
const steps: Step[] = [];
function mark(label: string) {
  steps.push({ label, ms: Date.now() });
}

async function diag(label: string, content: unknown[]) {
  steps.length = 0;
  const apiKey = process.env.OPENROUTER_API_KEY!;
  mark("start");

  // Step 1: prepare fetch (no I/O)
  const body = JSON.stringify({
    model: "google/gemini-3.1-flash-lite-image",
    messages: [{ role: "user", content }],
  });
  mark("body_built");

  // Step 2: open connection + send request
  const fetchStart = Date.now();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://allcombiner.online",
      "X-Title": "Fusionia Diag",
    },
    body,
    // No AbortSignal — let it complete naturally
  });
  mark("fetch_done");

  // Step 3: read body
  const text = await res.text();
  mark("body_read");

  // Measurements
  const t0 = steps[0].ms;
  const timings = steps.slice(1).map((s) => ({
    label: s.label,
    delta_ms: s.ms - t0,
  }));

  let responseData: unknown = text.substring(0, 600);
  try {
    responseData = JSON.parse(text);
  } catch {
    // keep as string preview
  }

  // Check for image
  let hasImage = false;
  let imageLen = 0;
  let imagePrefix = "";
  const data = responseData as { choices?: { message?: { content?: unknown } }[] };
  const c = data?.choices?.[0]?.message?.content;
  if (Array.isArray(c)) {
    for (const item of c as { type?: string; image_url?: { url?: string } }[]) {
      if (item.type === "image_url" && item.image_url?.url) {
        hasImage = true;
        imageLen = item.image_url.url.length;
        imagePrefix = item.image_url.url.substring(0, 80);
      }
    }
  }

  return {
    test: label,
    openrouter_status: res.status,
    openrouter_status_text: res.statusText,
    response_bytes: text.length,
    has_image: hasImage,
    image_length: imageLen,
    image_prefix: imagePrefix,
    timings_ms: {
      body_built: (steps[1].ms - t0),
      fetch_done: (steps[2].ms - t0),
      fetch_duration: (steps[2].ms - fetchStart),
      body_read: (steps[3].ms - t0),
      read_duration: (steps[3].ms - steps[2].ms),
      total: (steps[3].ms - t0),
    },
    response_preview:
      typeof responseData === "string"
        ? responseData
        : JSON.stringify(responseData).substring(0, 800),
  };
}

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  const results: unknown[] = [];

  // Test 1: minimal — text only, no image
  try {
    results.push(
      await diag("text_only", [
        { type: "text", text: "Say 'hello' in one word." },
      ])
    );
  } catch (err) {
    results.push({
      test: "text_only",
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Test 2: single image
  try {
    results.push(
      await diag("single_image", [
        { type: "text", text: "Describe this image in one sentence." },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${REAL_JPEG}` } },
      ])
    );
  } catch (err) {
    results.push({
      test: "single_image",
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Test 3: two images (merge scenario)
  try {
    results.push(
      await diag("two_images", [
        { type: "text", text: "Place the person from the first image next to the person from the second image. Photorealistic." },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${REAL_JPEG}` } },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${REAL_JPEG}` } },
      ])
    );
  } catch (err) {
    results.push({
      test: "two_images",
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    maxDuration_configured: 300,
    results,
  });
}
