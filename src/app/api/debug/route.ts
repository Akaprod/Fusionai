import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/debug — diagnostic endpoint (no auth, but only shows non-sensitive info)
export async function GET() {
  const cwd = process.cwd();
  const home = os.homedir();
  const configPaths = [
    path.join(cwd, ".z-ai-config"),
    path.join(home, ".z-ai-config"),
    "/etc/.z-ai-config",
  ];

  const checks = {
    timestamp: new Date().toISOString(),
    cwd,
    home,
    env: {
      ZAI_CONFIG_JSON_SET: !!process.env.ZAI_CONFIG_JSON,
      ZAI_CONFIG_JSON_LENGTH: process.env.ZAI_CONFIG_JSON?.length || 0,
      ZAI_BASE_URL_SET: !!process.env.ZAI_BASE_URL,
      ZAI_API_KEY_SET: !!process.env.ZAI_API_KEY,
      ZAI_TOKEN_SET: !!process.env.ZAI_TOKEN,
      ZAI_USER_ID_SET: !!process.env.ZAI_USER_ID,
      ADMIN_INIT_KEY_SET: !!process.env.ADMIN_INIT_KEY,
      AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
    },
    configFiles: configPaths.map((p) => {
      try {
        const content = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(content);
        return {
          path: p,
          exists: true,
          hasBaseUrl: !!parsed.baseUrl,
          hasApiKey: !!parsed.apiKey,
          hasToken: !!parsed.token,
          hasUserId: !!parsed.userId,
        };
      } catch {
        return { path: p, exists: false };
      }
    }),
  };

  return NextResponse.json(checks, { status: 200 });
}
