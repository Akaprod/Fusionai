import { NextResponse } from "next/server";
import zlib from "zlib";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Generate a REAL valid PNG image using only Node.js built-in modules.
 * No sharp dependency — constructs the PNG binary format manually.
 * Creates a simple colored image (e.g., a "portrait" with face-like shapes).
 */
function createRealPng(width: number, height: number, bg: [number, number, number], circle: [number, number, number, number, number, number]): string {
  // PNG signature
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // Helper: create a PNG chunk
  function makeChunk(type: string, data: Buffer): Buffer {
    const typeBuf = Buffer.from(type, "ascii");
    const lengthBuf = Buffer.alloc(4);
    lengthBuf.writeUInt32BE(data.length, 0);
    // CRC32 over type + data
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
  }

  // CRC32 implementation
  function crc32(buf: Buffer): number {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
      }
    }
    return crc ^ 0xFFFFFFFF;
  }

  // IHDR chunk: width, height, bit depth=8, color type=2 (RGB), compression=0, filter=0, interlace=0
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 2;   // color type: RGB
  ihdrData[10] = 0;  // compression
  ihdrData[11] = 0;  // filter
  ihdrData[12] = 0;  // interlace
  const ihdr = makeChunk("IHDR", ihdrData);

  // Build raw pixel data (with filter byte 0 at start of each row)
  const raw = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      // Check if pixel is inside the "circle" (face area)
      const cx = width / 2;
      const cy = height * 0.42;
      const r = Math.min(width, height) * 0.2;
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy < r * r) {
        // Inside face circle — use circle color
        raw[offset++] = circle[0];
        raw[offset++] = circle[1];
        raw[offset++] = circle[2];
      } else {
        // Background
        raw[offset++] = bg[0];
        raw[offset++] = bg[1];
        raw[offset++] = bg[2];
      }
    }
  }

  // Compress with zlib
  const compressed = zlib.deflateSync(raw);
  const idat = makeChunk("IDAT", compressed);

  // IEND
  const iend = makeChunk("IEND", Buffer.alloc(0));

  // Combine
  const png = Buffer.concat([sig, ihdr, idat, iend]);
  return png.toString("base64");
}

type Step = { label: string; ms: number };
const steps: Step[] = [];
function mark(label: string) {
  steps.push({ label, ms: Date.now() });
}

async function diag(label: string, content: unknown[]) {
  steps.length = 0;
  const apiKey = process.env.OPENROUTER_API_KEY!;
  mark("start");

  const body = JSON.stringify({
    model: "google/gemini-3.1-flash-image-preview",
    messages: [{ role: "user", content }],
  });
  mark("body_built");

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
  });
  mark("fetch_done");

  const text = await res.text();
  mark("body_read");

  const t0 = steps[0].ms;
  let responseData: unknown = text.substring(0, 600);
  try {
    responseData = JSON.parse(text);
  } catch {
    // keep as string
  }

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

  // Generate two REAL valid PNG images using Node built-in zlib
  // Image 1: "portrait" — warm dark bg, orange-tan circle (like a face)
  const img1B64 = createRealPng(
    512, 512,
    [40, 30, 25],      // dark warm background
    [230, 180, 130]     // skin-tone circle
  );
  const img1Url = `data:image/png;base64,${img1B64}`;

  // Image 2: "scene" — cool blue bg, green circle (like a landscape element)
  const img2B64 = createRealPng(
    512, 512,
    [20, 40, 50],       // cool blue background
    [30, 80, 50]        // green circle
  );
  const img2Url = `data:image/png;base64,${img2B64}`;

  const results: unknown[] = [];

  // Test 1: text_only — baseline
  try {
    results.push(
      await diag("text_only", [
        { type: "text", text: "Say 'hello' in one word." },
      ])
    );
  } catch (err) {
    results.push({ test: "text_only", error: err instanceof Error ? err.message : String(err) });
  }

  // Test 2: single_image — one REAL PNG
  try {
    results.push(
      await diag("single_image", [
        { type: "text", text: "Place this person in a sunny park. Photorealistic, preserve the face." },
        { type: "image_url", image_url: { url: img1Url } },
      ])
    );
  } catch (err) {
    results.push({ test: "single_image", error: err instanceof Error ? err.message : String(err) });
  }

  // Test 3: two_images — merge scenario with 2 REAL PNGs
  try {
    results.push(
      await diag("two_images", [
        { type: "text", text: "Place the person from image 1 in the scene from image 2. Photorealistic, preserve the face exactly." },
        { type: "image_url", image_url: { url: img1Url } },
        { type: "image_url", image_url: { url: img2Url } },
      ])
    );
  } catch (err) {
    results.push({ test: "two_images", error: err instanceof Error ? err.message : String(err) });
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    model: "google/gemini-3.1-flash-image-preview",
    image_info: {
      img1_size: img1B64.length,
      img2_size: img2B64.length,
      format: "png (generated via Node.js zlib, no sharp)",
    },
    results,
  });
}
