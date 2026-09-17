import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Check if current user is admin. Returns user record or null.
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false as const, status: 401, error: "Non authentifié." };
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, role: true, suspended: true },
  });
  if (!user) {
    return { ok: false as const, status: 404, error: "Utilisateur introuvable." };
  }
  if (user.suspended) {
    return { ok: false as const, status: 403, error: "Compte suspendu." };
  }
  if (user.role !== "admin") {
    return { ok: false as const, status: 403, error: "Accès refusé." };
  }
  return { ok: true as const, user };
}

// Default settings (used if Setting table is empty)
export const DEFAULT_SETTINGS: Record<string, { value: string; category: string }> = {
  "site.name": { value: "Fusionia", category: "general" },
  "site.tagline": {
    value:
      "Un outil de fusion d'images qui ne ressemble pas à un outil de fusion.",
    category: "general",
  },
  "credits.welcome_bonus": { value: "5", category: "credits" },
  "credits.cost_per_merge": { value: "1", category: "credits" },
  "pricing.starter_price": { value: "0", category: "pricing" },
  "pricing.pro_price": { value: "19", category: "pricing" },
  "pricing.credits_pack_price": { value: "0.40", category: "pricing" },
  "pricing.pack_starter_credits": { value: "20", category: "pricing" },
  "pricing.pack_medium_credits": { value: "100", category: "pricing" },
  "pricing.pack_large_credits": { value: "500", category: "pricing" },
  "merge.max_images": { value: "4", category: "merge" },
  "merge.max_file_size_mb": { value: "12", category: "merge" },
  "stats.total_merges": { value: "12400", category: "stats" },
  "stats.rating": { value: "4.9", category: "stats" },
};

export async function getSetting(key: string): Promise<string> {
  const s = await db.setting.findUnique({ where: { key } });
  return s?.value ?? DEFAULT_SETTINGS[key]?.value ?? "";
}

export async function getAllSettings(): Promise<
  { key: string; value: string; category: string }[]
> {
  const rows = await db.setting.findMany();
  // Merge with defaults (DB wins if present)
  const merged: Record<string, { value: string; category: string }> = {
    ...DEFAULT_SETTINGS,
  };
  for (const r of rows) {
    merged[r.key] = { value: r.value, category: r.category };
  }
  return Object.entries(merged).map(([key, v]) => ({ key, ...v }));
}
