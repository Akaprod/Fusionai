import fs from "fs";
import path from "path";

/**
 * Ensures the .z-ai-config file exists in the project root.
 *
 * The z-ai-web-dev-sdk reads config from one of:
 *   1. process.cwd()/.z-ai-config
 *   2. ~/.z-ai-config
 *   3. /etc/.z-ai-config
 *
 * On Hostinger (and most production hosts), none of these exist by default.
 * We create the file at startup using environment variables so the SDK can
 * authenticate.
 *
 * Required env vars:
 *   ZAI_BASE_URL  — e.g. https://internal-api.z.ai/v1
 *   ZAI_API_KEY   — your Z.ai API key
 *   ZAI_TOKEN     — JWT token from Z.ai
 *   ZAI_USER_ID   — your Z.ai user id
 *   ZAI_CHAT_ID   — chat id (optional)
 *
 * If ZAI_CONFIG_JSON is set, it's written verbatim (takes precedence).
 */
export function ensureZaiConfig(): void {
  const configPath = path.join(process.cwd(), ".z-ai-config");

  // Already exists — nothing to do
  if (fs.existsSync(configPath)) {
    return;
  }

  // Option A: full JSON provided verbatim
  if (process.env.ZAI_CONFIG_JSON) {
    try {
      JSON.parse(process.env.ZAI_CONFIG_JSON); // validate
      fs.writeFileSync(configPath, process.env.ZAI_CONFIG_JSON, { mode: 0o600 });
      console.log("[z-ai-config] written from ZAI_CONFIG_JSON env var");
      return;
    } catch (e) {
      console.error("[z-ai-config] ZAI_CONFIG_JSON is invalid JSON:", e);
    }
  }

  // Option B: build from individual env vars
  const baseUrl = process.env.ZAI_BASE_URL;
  const apiKey = process.env.ZAI_API_KEY;
  const token = process.env.ZAI_TOKEN;
  const userId = process.env.ZAI_USER_ID;
  const chatId = process.env.ZAI_CHAT_ID;

  if (baseUrl && apiKey && token && userId) {
    const config = JSON.stringify({ baseUrl, apiKey, token, userId, chatId });
    fs.writeFileSync(configPath, config, { mode: 0o600 });
    console.log("[z-ai-config] written from individual env vars");
    return;
  }

  // Last resort: try to copy from /etc/.z-ai-config (dev environment)
  try {
    const etcConfig = fs.readFileSync("/etc/.z-ai-config", "utf-8");
    JSON.parse(etcConfig); // validate
    fs.writeFileSync(configPath, etcConfig, { mode: 0o600 });
    console.log("[z-ai-config] copied from /etc/.z-ai-config");
    return;
  } catch {
    // /etc/.z-ai-config doesn't exist either — no-op
  }

  console.warn(
    "[z-ai-config] NOT created. Set ZAI_CONFIG_JSON or ZAI_BASE_URL+ZAI_API_KEY+ZAI_TOKEN+ZAI_USER_ID env vars."
  );
}
