# Aurea Maison Floors — Project Voortgang

**Project:** aureamaison (Next.js 14 SaaS platform)  
**Organisatie:** webdesignerstudio  
**Repository:** https://github.com/webdesignerstudio/aureamaison  
**Domein:** aureamaisonfloors.nl  
**Laatste update:** 10 juni 2026 — Fase 1 t/m 6 voltooid, Fase 7 wacht op klant

---

## Fase 1: Project Setup — AFGEROND

- [x] GitHub repository `webdesignerstudio/aureamaison` aangemaakt
- [x] Next.js 14 project geinitialiseerd (TypeScript + TailwindCSS)
- [x] Dependencies geinstalleerd: Supabase, React Query, Zod, Resend, html2pdf
- [x] Folderstructuur aangemaakt (components, lib, types, hooks, routes)
- [x] TypeScript types gedefinieerd (User, Order, Legger, Offerte, Settings, Company)
- [x] Supabase browser + server clients opgezet
- [x] React Query client opgezet
- [x] Dark luxury theme (goud #C6A56B, zwart #050505) in globals.css
- [x] Custom fonts geconfigureerd (Cormorant Garamond, Jost, Rajdhani)
- [x] Utility helpers (cn, formatEuro, formatDate, generateUAID)
- [x] `.env.example` template voor Supabase, Resend, Mollie
- [x] Build succesvol — TypeScript foutloos

---

## Fase 2: UI & Auth — AFGEROND

- [x] StatusBadge component (alle order/status varianten)
- [x] GoldButton component (primary, outline, ghost varianten)
- [x] Spinner component (loading states)
- [x] Navbar component met rolgebaseerde navigatie
- [x] DashboardLayout component met auth redirect
- [x] useAuth hook met Supabase Auth + profiel ophalen
- [x] useOrders hook met React Query + Supabase CRUD
- [x] React Query Providers wrapper in layout
- [x] Login pagina met email/wachtwoord formulier
- [x] Landing page met dark luxury hero design
- [x] OrdersList component met tabelweergave
- [x] OrderForm component (alle velden: klant, vloer, oppervlakte, budget, etc.)
- [x] Order detail pagina (`/dashboard/orders/[id]`)
- [x] Factuur print module geextraheerd uit prototype (A4 HTML layout)
- [x] Orders pagina met "Nieuwe order" knop + toggle form
- [x] Build succesvol — 7 routes, 1 dynamisch

---

## Fase 3: Supabase Database — AFGEROND

- [x] SQL schema migratie schrijven (tables: profiles, companies, orders, leggers, offertes, settings)
- [x] Row Level Security (RLS) policies definieren
- [ ] Supabase project aanmaken en environment variabelen invullen *(wacht op klant)*
- [ ] Database migratie uitvoeren *(wacht op klant)*

---

## Fase 4: Core Modules — AFGEROND

- [x] Offertes module (aanmaken, versturen, accepteren/afwijzen)
- [x] Leggers module (beheer, tarieven, tier systeem)
- [x] Settings module (bedrijfsgegevens, factuur instellingen)
- [x] Dashboard KPI cards (aantallen, omzet, openstaand)
- [ ] Facturen module uitgebreid overzicht *(wacht op live data)*

---

## Fase 5: API Integraties — AFGEROND

- [x] Resend email API route (`/api/email`) voor transactie-emails
- [x] Mollie iDEAL betaling API route (`/api/payments`)
- [x] Mollie webhook handler (`/api/payments/webhook`)
- [x] Email templates (offerte verstuurd, factuur verstuurd)
- [ ] API keys invullen *(wacht op klant)*

---

## Fase 6: Portals & Rollen — AFGEROND

- [x] Legger portal (`/legger`) — eigen klussen
- [x] Klant portal (`/client`) — eigen orders, offertes
- [ ] Admin/Superadmin portal (`/admin`) — uitgebreid beheer *(post-MVP)*
- [x] Role-based route guards (via DashboardLayout + useAuth)

---

## Fase 7: Polish & Deploy — DEELS

- [x] Mobile responsive check (Tailwind responsive classes)
- [x] Loading & error states compleet (Spinner + error boundaries)
- [ ] Form validatie (Zod schemas) *(post-MVP)*
- [x] README met setup instructies
- [ ] Vercel project aanmaken en deployen *(wacht op klant)*
- [ ] Domein `aureamaisonfloors.nl` koppelen aan Vercel *(wacht op klant)*
- [ ] Supabase production environment variabelen in Vercel *(wacht op klant)*
- [ ] E2E smoke test op live URL *(wacht op klant)*

---

## Technische Stack

| Layer | Technologie |
|-------|-------------|
| Framework | Next.js 14 (App Router) |
| Taal | TypeScript |
| Styling | TailwindCSS |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| State | React Query (TanStack) |
| Email | Resend API |
| Betaling | Mollie iDEAL |
| Hosting | Vercel |

---

## Repository Commits

| Commit | Beschrijving |
|--------|-------------|
| `init` | Next.js 14 + TypeScript + Tailwind project setup |
| `feat: project setup` | Types, Supabase client, theme, fonts, utils |
| `feat: UI components, auth hook` | Components, layout, login, orders hooks |
| `feat: landing page, order form` | Landing, order form, invoice print, detail |

---

## Notities

- AI features (JARVIS) buiten scope — verwijderd
- LocalStorage volledig vervangen door Supabase
- Design 1:1 overgenomen uit origineel prototype (goud/zwart thema)
- Geschatte totale doorlooptijd: 50 uur over 3 weken
