# Aurea Maison Floors — Vloerenleggers Platform

Professioneel SaaS platform voor vloerenleggers. Offertes, planning, facturen en klantbeheer — alles op een plek.

**Live:** https://aureamaisonfloors.nl  
**Repository:** https://github.com/webdesignerstudio/aureamaison

---

## Technische Stack

| Layer | Technologie |
|-------|-------------|
| Framework | Next.js 14 (App Router) |
| Taal | TypeScript |
| Styling | TailwindCSS |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| State Management | React Query (TanStack) |
| Email | Resend API |
| Betalingen | Mollie iDEAL |
| Hosting | Vercel |

---

## Lokale Ontwikkeling

### 1. Vereisten

- Node.js 18+
- npm
- Supabase account (gratis tier)
- Resend account (voor email)
- Mollie account (voor betalingen)

### 2. Clone & Install

```bash
git clone https://github.com/webdesignerstudio/aureamaison.git
cd aureamaison
npm install
```

### 3. Environment Variabelen

Kopieer `.env.example` naar `.env.local` en vul in:

```bash
cp .env.example .env.local
```

| Variabele | Waar te vinden |
|-----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings > API (beheer) |
| `RESEND_API_KEY` | Resend Dashboard > API Keys |
| `MOLLIE_API_KEY` | Mollie Dashboard > Developers > API Keys |
| `MOLLIE_WEBHOOK_SECRET` | Zelf bedenken (min. 32 karakters) |

### 4. Database Setup

Voer de migraties uit in de Supabase SQL Editor:

1. Open `supabase/migrations/0001_initial_schema.sql`
2. Kopieer inhoud naar Supabase SQL Editor
3. Voer uit
4. Herhaal voor `0002_seed_data.sql`

### 5. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Projectstructuur

```
src/
  app/                    # Next.js App Router paginas
    (routes)/             # Groep routes
    api/                  # API routes (serverless functions)
  components/
    ui/                   # Herbruikbare UI primitives
    layout/               # Layout componenten
    modules/              # Domein-specifieke componenten
  hooks/                  # React Query + Supabase hooks
  lib/                    # Helpers, clients, utilities
  types/                  # TypeScript interfaces
supabase/
  migrations/             # SQL schema migraties
```

---

## Belangrijke Routes

| Route | Beschrijving | Rol |
|-------|-------------|-----|
| `/` | Landing page | Iedereen |
| `/login` | Inloggen | Iedereen |
| `/dashboard` | Eigenaar dashboard | owner, keyuser, office |
| `/dashboard/orders` | Orders beheren | owner, keyuser, office |
| `/dashboard/offertes` | Offertes beheren | owner, keyuser, office |
| `/dashboard/leggers` | Leggers beheren | owner |
| `/dashboard/settings` | Instellingen | owner |
| `/legger` | Legger portal | legger |
| `/client` | Klant portal | client |
| `/api/email` | Email versturen | Server |
| `/api/payments` | iDEAL betaling aanmaken | Server |
| `/api/payments/webhook` | Betaling status updates | Server (Mollie) |

---

## Deploy naar Vercel

### 1. Vercel Project Aanmaken

```bash
npx vercel
```

Of via [Vercel Dashboard](https://vercel.com) > Import Git Repository

### 2. Environment Variabelen Invoeren

Ga naar Project Settings > Environment Variables en voer alle variabelen uit `.env.local` in.

### 3. Domein Koppelen

Ga naar Project Settings > Domains en voeg toe:
- `aureamaisonfloors.nl`

Werk DNS bij bij domeinregistrar (A-record naar Vercel IP of CNAME naar `cname.vercel-dns.com`).

### 4. Supabase Whitelisten

Voeg Vercel deploy URL toe aan Supabase Authentication > URL Configuration > Redirect URLs.

---

## Licentie

Privé eigendom — Webdesigner Studio.
