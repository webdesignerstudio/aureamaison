# Aurea Maison Floors — Project Voortgang

**Project:** aureamaison (Next.js 14 SaaS platform)  
**Organisatie:** webdesignerstudio  
**Repository:** https://github.com/webdesignerstudio/aureamaison  
**Domein:** aureamaisonfloors.nl  
**Laatste update:** 10 juni 2026

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

## Fase 4: Core Modules — OPEN

- [ ] Offertes module (aanmaken, versturen, accepteren/afwijzen)
- [ ] Leggers module (beheer, tarieven, tier systeem)
- [ ] Facturen module (overzicht, status, betaling koppelen)
- [ ] Settings module (bedrijfsgegevens, factuur instellingen)
- [ ] Dashboard KPI cards (aantallen, omzet, openstaand)

---

## Fase 5: API Integraties — OPEN

- [ ] Resend email API route (`/api/email`) voor transactie-emails
- [ ] Mollie iDEAL betaling API route (`/api/payments`)
- [ ] Mollie webhook handler (`/api/payments/webhook`)
- [ ] Email templates (offerte verstuurd, factuur verstuurd, registratie)

---

## Fase 6: Portals & Rollen — OPEN

- [ ] Legger portal (`/legger`) — eigen klussen, oplevering
- [ ] Klant portal (`/client`) — eigen orders, offertes bekijken
- [ ] Admin/Superadmin portal (`/admin`) — gebruikersbeheer, audit
- [ ] Role-based route guards

---

## Fase 7: Polish & Deploy — OPEN

- [ ] Mobile responsive check
- [ ] Loading & error states compleet
- [ ] Form validatie (Zod schemas)
- [ ] README met setup instructies
- [ ] Vercel project aanmaken en deployen
- [ ] Domein `aureamaisonfloors.nl` koppelen aan Vercel
- [ ] Supabase production environment variabelen in Vercel
- [ ] E2E smoke test op live URL

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
