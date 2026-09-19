import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

// GET /api/test-sharp — verify sharp can generate a PNG
export async function GET() {
  try {
    const start = Date.now();
    const sharp = (await import("sharp")).default;
    const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="red"/></svg>`;
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    const durationMs = Date.now() - start;
    return NextResponse.json({
      success: true,
      durationMs,
      pngSize: pngBuffer.length,
      pngBase64Prefix: pngBuffer.toString("base64").substring(0, 50),
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.substring(0, 300) : undefined,
    }, { status: 500 });
  }
}
