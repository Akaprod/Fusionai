// Shared structural data for Fusionia — only IDs, colors, and non-translatable bits.
// All text content lives in /src/messages/{locale}.json and is accessed via useTranslations.

export const PRESETS = [
  { id: "two-people", accent: "from-amber-400/40 to-orange-500/30" },
  { id: "swap-bg", accent: "from-rose-400/40 to-amber-500/30" },
  { id: "product-scene", accent: "from-yellow-400/40 to-amber-600/30" },
  { id: "borrow-style", accent: "from-orange-400/40 to-rose-500/30" },
  { id: "try-outfit", accent: "from-amber-500/40 to-rose-400/30" },
  { id: "restyle-room", accent: "from-orange-500/40 to-amber-400/30" },
  { id: "logo-mockup", accent: "from-amber-400/40 to-orange-500/30" },
  { id: "restore-combine", accent: "from-rose-400/40 to-orange-400/30" },
  { id: "holiday-card", accent: "from-amber-500/40 to-yellow-500/30" },
] as const;

export const FEATURE_IDS = ["faces", "shadows", "labels", "ratio", "fast", "private"] as const;

export const AUDIENCE_IDS = ["ecommerce", "families", "designers", "estate"] as const;

export const COMPARISON_ROWS = [
  "time",
  "skills",
  "lighting",
  "shadows",
  "faces",
  "labels",
  "cost",
  "batch",
] as const;

export const TESTIMONIAL_IDS = ["1", "2", "3", "4"] as const;

export const PLAN_IDS = ["starter", "pro", "credits"] as const;

export const FAQ_IDS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export const RATIOS = ["auto", "1:1", "4:3", "3:4", "16:9", "9:16"] as const;

// Category color mapping for presets (visual only, not translatable)
export const CATEGORY_COLORS: Record<string, string> = {
  "Portraits & Personnes": "text-rose-300",
  "Scènes & Décors": "text-emerald-300",
  "Produit & E-commerce": "text-amber-300",
  "Design & Marque": "text-violet-300",
  "Fun & Social": "text-orange-300",
  // English
  "Portraits & People": "text-rose-300",
  "Scenes & Backgrounds": "text-emerald-300",
  "Product & E-commerce": "text-amber-300",
  "Design & Branding": "text-violet-300",
  // Spanish
  "Retratos y Personas": "text-rose-300",
  "Escenas y Fondos": "text-emerald-300",
  "Producto y E-commerce": "text-amber-300",
  "Diseño y Marca": "text-violet-300",
};
