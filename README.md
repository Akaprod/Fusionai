# Fusionia — AI Image Combiner

A creative, professional multilingual (FR/EN/ES) web app to merge 2–4 images into one realistic photo using AI. Inspired by [bestimagecombiner.com](https://bestimagecombiner.com/), rebuilt with a distinct dark editorial design.

## Features

- **AI image fusion** — upload 2–4 photos, describe the result, get one coherent image (~10s)
- **9 presets** — two-people photo, background swap, product in scene, style transfer, outfit try-on, room restyle, logo mockup, restore & combine, holiday card
- **Multi-page site** — home, how-it-works, features, presets, pricing, FAQ (each translated)
- **3 languages** — Français, English, Español with always-visible language switcher
- **Authentication** — signup / signin with NextAuth (JWT + bcrypt)
- **Credit system** — 5 free credits on signup, 1 credit per merge, buy packs (20/100/500)
- **Dashboard** — credit balance, transaction history, recent merges, top-up packs

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **i18n**: next-intl (routing `[locale]`)
- **Auth**: NextAuth.js v4 (Credentials + JWT)
- **Database**: Prisma ORM + SQLite
- **AI**: z-ai-web-dev-sdk (image-edit endpoint)
- **Animations**: Framer Motion

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment variables
echo "DATABASE_URL=file:/path/to/dev.db" > .env
echo "AUTH_SECRET=$(openssl rand -hex 32)" >> .env

# Push database schema
bun run db:push

# Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/fr`.

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # NextIntlClientProvider + AuthProvider
│   │   ├── page.tsx            # Home (hero + combiner + sections)
│   │   ├── how-it-works/
│   │   ├── features/
│   │   ├── presets/
│   │   ├── pricing/
│   │   ├── faq/
│   │   ├── signin/             # Auth form (signin mode)
│   │   ├── signup/             # Auth form (signup mode)
│   │   └── dashboard/          # Protected user dashboard
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── signup/             # User registration
│   │   ├── credits/            # GET balance + POST buy packs
│   │   └── merge/              # AI merge + credit debit
│   └── layout.tsx              # Root layout (nuclear dark CSS)
├── components/
│   ├── sections/               # Hero, Combiner, Steps, Presets, etc.
│   ├── dashboard/              # Dashboard UI
│   ├── auth-form.tsx           # Reusable signin/signup form
│   ├── auth-provider.tsx      # SessionProvider wrapper
│   └── page-shell.tsx          # Header + footer wrapper
├── i18n/
│   ├── routing.ts              # Locales config
│   └── request.ts              # getRequestConfig
├── messages/                   # Translation JSONs
│   ├── fr.json
│   ├── en.json
│   └── es.json
└── lib/
    ├── auth.ts                 # NextAuth config
    ├── db.ts                   # Prisma client
    └── content.ts              # Structural data (IDs, colors)
```

## License

Proprietary — © Fusionia
