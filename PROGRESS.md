# Aurea Maison Floors — Project Voortgang

**Project:** aureamaison (Next.js 14 SaaS platform)  
**Organisatie:** webdesignerstudio  
**Repository:** https://github.com/webdesignerstudio/aureamaison  
**Domein:** www.aureamaisonfloors.nl  
**Laatste update:** 11 juni 2026 — Alle 6 fases voltooid, deployed naar productie

---

## Fase 0: Database & Schema — AFGEROND

- [x] SQL migratie `0002_extended_schema.sql` — 4 nieuwe tabellen (audit_logs, showroom_aanvragen, reviews, abonnementen)
- [x] Bestaande tabellen uitgebreid: orders, leggers, offertes, profiles, companies
- [x] `handle_new_user` trigger bijgewerkt met onboarding velden
- [x] Nieuwe RLS policies: `orders_read_legger`, `orders_read_client`
- [x] Seed data migratie `0002_seed_data.sql`

## Fase 1: Owner Dashboard Uitbreiding — AFGEROND

- [x] Order detail pagina (`/dashboard/orders/[id]`) — legger toewijzen, status workflow, betaald toggle, netto uitbetaling
- [x] Factuur modal component — dynamische instellingen uit Supabase, A4 print preview
- [x] Legger detail pagina (`/dashboard/leggers/[id]`) — contact, business info, stats, toegewezen klussen
- [x] Offerte detail pagina (`/dashboard/offertes/[id]`) — status workflow, omzetten naar order
- [x] Audit timeline component — color-coded audit logs per entity
- [x] Klantenbeheer (`/dashboard/klanten`) — gegroepeerd per email, totale omzet, sorteerbaar
- [x] Navigatie uitgebreid: klanten-item voor owner/keyuser
- [x] Links vanuit lists naar detail pagina's (leggers, offertes)

## Fase 2: Legger Portal — AFGEROND

- [x] LeggerLayout component met eigen navigatie (Klussen, Agenda, Profiel)
- [x] Legger login (`/legger/login`) — role-check + onboarding validatie
- [x] Legger registratie (`/legger/registratie`) — 3-staps, pending onboarding
- [x] Klussenoverzicht (`/legger`) — tabs: Openstaand / Aangenomen / Afgerond
- [x] Klus accepteren/weigeren met modal
- [x] Klus detail (`/legger/klus/[id]`) — starten/afronden, opmerkingen
- [x] Agenda (`/legger/agenda`) — gegroepeerd per maand
- [x] Profiel (`/legger/profiel`) — bewerkbaar

## Fase 3: Klant Portal — AFGEROND

- [x] ClientLayout component met navigatie (Mijn Account, Nieuwe Opdracht, Profiel)
- [x] Client login (`/client/login`) — role-check
- [x] Client registratie (`/client/registratie`) — particulier/zakelijk keuze
- [x] Dashboard (`/client`) — eigen orders + offertes (email filter)
- [x] Nieuwe opdracht (`/client/opdracht`) — volledig formulier
- [x] Publieke offerte (`/offerte`) — geen login vereist

## Fase 4: Publieke Landingspagina — AFGEROND

- [x] USP bar — gratis showroom, 24u reactie, heel NL, Google rating
- [x] Sticky navbar — mobiel hamburger menu, smooth scroll
- [x] Hero sectie — offerte CTA
- [x] Diensten — vloeradvies, levering & installatie, showroom aan huis
- [x] Portaal keuze cards — eigenaar, klant, legger
- [x] Werkwijze — 4 stappen
- [x] FAQ — accordion (5 items)
- [x] Contact — bedrijfsgegevens + CTA
- [x] Footer

## Fase 5: Superadmin Dashboard — AFGEROND

- [x] AdminLayout — role-bescherming (superadmin only)
- [x] Overview KPI's — omzet, open orders, actieve leggers, pending onboarding
- [x] Bedrijven tab — volledige lijst
- [x] Gebruikers tab — met onboarding status
- [x] Orders tab — met betaalstatus
- [x] Audit log tab — laatste 100 events

## Review & Polish — AFGEROND

- [x] Build check — 0 TypeScript errors, 0 build errors
- [x] useAuth error handling + error state
- [x] Auth error display in loading state
- [x] DashboardLayout nav items gefixt
- [x] Mobile UX — hamburger menu, responsive tables, touch-friendly
- [x] ToastProvider met success/error/info
- [x] Global error boundary (`app/error.tsx`)
- [x] Custom 404 page (`app/not-found.tsx`)
- [x] Loading states compleet

---

## Fase 6: Deploy — AFGEROND

- [x] Vercel project gedeployed naar productie
- [x] Domein `www.aureamaisonfloors.nl` gekoppeld
- [x] Supabase production environment variabelen in Vercel
- [x] Build succesvol op productie

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

## Post-MVP Items (Backlog)

- [ ] Zod schema validatie (runtime formulier validatie)
- [ ] Legger goedkeuren/afwijzen via admin UI (nu alleen DB-level)
- [ ] Uitgebreid facturen overzicht in dashboard
- [ ] E2E Playwright smoke tests op live URL
- [ ] Mollie live key toevoegen (nu test-omgeving)
- [ ] Resend API key toevoegen (nu emails niet actief)
- [ ] Google Reviews integratie op landingspagina
- [ ] SEO meta tags + sitemap

---

## Repository Commits

| Commit | Beschrijving |
|--------|-------------|
| `init` | Next.js 14 + TypeScript + Tailwind project setup |
| `feat: project setup` | Types, Supabase client, theme, fonts, utils |
| `feat: UI components, auth hook` | Components, layout, login, orders hooks |
| `feat: landing page, order form` | Landing, order form, invoice print, detail |
| `feat: Supabase schema + seed data` | Database migraties, RLS policies |
| `feat: offertes, leggers, settings` | Modules + dashboard KPIs |
| `feat: Resend + Mollie API` | Email en betaling routes |
| `feat: legger + client portal` | Beide portalen volledig |
| `feat: fase-1` | Owner dashboard uitbreiding |
| `feat: fase-2` | Legger portal |
| `feat: fase-3` | Klant portal |
| `feat: fase-4-5` | Landingpagina + superadmin |

---

## Notities

- AI features (JARVIS) buiten scope — verwijderd
- LocalStorage volledig vervangen door Supabase
- Design 1:1 overgenomen uit origineel prototype (goud/zwart thema)
- Totale doorlooptijd: ~50 uur over 3 weken
- Zie ook: `CHANGELOG.md` en `RELEASE_NOTES.md`
