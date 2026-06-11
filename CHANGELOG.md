# Changelog

Alle opmerkelijke wijzigingen aan dit project worden in dit document vastgelegd.

Het format is gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/),
en dit project houdt zich aan [Semantic Versioning](https://semver.org/lang/nl/).

---

## [1.0.0] — 2026-06-11

### Toegevoegd

#### Fase 0 — Database & Schema Fundament
- Nieuwe tabellen: `audit_logs`, `showroom_aanvragen`, `reviews`, `abonnementen`
- Bestaande tabellen uitgebreid: `orders` (legger_id, legger_naam, legger_geaccepteerd, legger_prijs, legger_gestart_at, legger_afgerond_at, uaid, invoice_paid), `leggers` (tarief, kvk, btw, iban, type, email, telefoon, adres, stad), `offertes` (budget, oppervlakte, straat, postcode, plaats, ondergrond, timing), `profiles` (company_id, onboarding_status, onboarding_data)
- RLS policies voor alle tabellen inclusief `orders_read_legger` en `orders_read_client`
- `handle_new_user` trigger bijgewerkt met onboarding velden

#### Fase 1 — Owner Dashboard Uitbreiding
- Order detail pagina (`/dashboard/orders/[id]`) met status workflow, legger toewijzing, betaald toggle, netto uitbetaling
- Factuur modal component met dynamische instellingen uit Supabase en print-functionaliteit
- Legger detail pagina (`/dashboard/leggers/[id]`) met contactinfo, stats en toegewezen klussen
- Offerte detail pagina (`/dashboard/offertes/[id]`) met status workflow en "omzetten naar order"
- Audit timeline component voor activiteitenlog op entity niveau
- Klantenbeheer (`/dashboard/klanten`) met groepering per email en totale omzet
- Dashboard navigatie uitgebreid met klanten-item voor owner/keyuser

#### Fase 2 — Legger Portal
- Legger layout component met eigen navigatie (Klussen, Agenda, Profiel)
- Legger login (`/legger/login`) met role-check en onboarding validatie
- Legger registratie (`/legger/registratie`) 3-staps formulier met pending onboarding
- Klussenoverzicht (`/legger`) met tabs: Openstaand / Aangenomen / Afgerond
- Accepteren/weigeren functionaliteit voor toegewezen klussen
- Klus detail (`/legger/klus/[id]`) met starten/afronden knoppen
- Agenda (`/legger/agenda`) gegroepeerd per maand
- Profiel (`/legger/profiel`) bewerkbaar

#### Fase 3 — Klant Portal
- Client layout component met navigatie (Mijn Account, Nieuwe Opdracht, Profiel)
- Client login (`/client/login`) en registratie (`/client/registratie`) met particulier/zakelijk keuze
- Klant dashboard (`/client`) met eigen orders en offertes gefilterd op email
- Nieuwe opdracht formulier (`/client/opdracht`)
- Publieke offerte aanvraag (`/offerte`) zonder login vereist

#### Fase 4 — Publieke Landingspagina
- USP bar (gratis showroom aan huis, 24u reactie, heel NL, Google rating)
- Sticky navbar met mobiel hamburger menu en smooth scroll
- Hero sectie met offerte CTA
- Diensten sectie (vloeradvies, levering & installatie, showroom aan huis)
- Portaal keuze cards (eigenaar, klant, legger)
- Werkwijze 4-stappen
- FAQ accordion
- Contact sectie met bedrijfsgegevens
- Footer

#### Fase 5 — Superadmin Dashboard
- Admin layout met role-bescherming (superadmin only)
- Overview KPI's: totale omzet, open orders, actieve leggers, pending onboarding
- Bedrijven tab met volledige lijst
- Gebruikers tab met onboarding status
- Orders tab met betaalstatus
- Audit log tab met laatste 100 events

#### Overig
- `useUpdateLegger` hook voor legger CRUD
- `useCreateOrder` hook voor order aanmaken
- TypeScript types uitgebreid: `AuditLog`, `ShowroomAanvraag`, `Review`, `Abonnement`

### Gewijzigd
- Fallback profiel in `useAuth` uitgebreid met `onboarding_status` en `onboarding_data`
- `formatEuro` helper nu beschikbaar in utils

### Opgelost
- TypeScript errors bij fallback profiel (missing onboarding velden)
- TypeScript errors bij mogelijk undefined React Query data
- Build errors door incorrecte type casts

---

## [0.9.0] — 2026-06-09

### Toegevoegd
- Vitest test suite
- Auth callback route voor invite/password reset redirects
- `maybeSingle()` gebruik om 406 errors te voorkomen bij ontbrekende profielen
- Duidelijke foutmelding op login als profiel ontbreekt

### Opgelost
- Auth session persistence bug (refresh na profielcreatie)
- CompanyId filtering in data queries
- Type safety issues in hooks
- Verwijderd: platform-specifieke ARM package en deprecated @types/jspdf

---

## [0.8.0] — 2026-06-08

### Toegevoegd
- Legger portal + client portal volledige implementatie
- Resend email API route (`/api/email`)
- Mollie iDEAL API route (`/api/payments`) + webhook handler
- Offertes, leggers, settings modules + dashboard KPI cards
- Supabase database schema migratie + seed data

### Opgelost
- RLS propagatie delays (1s delay na profielcreatie)
- Singleton Supabase client vervangen door per-call instantiatie

---

## [0.7.0] — 2026-06-07

### Toegevoegd
- Landing page, order form, invoice print module, order detail
- PROGRESS.md project tracking
- Professional README met setup instructies
- Vercel deployment (preview + production)

---

## [0.1.0] — 2026-06-05

### Toegevoegd
- Next.js 14 + TypeScript + TailwindCSS project setup
- Dark luxury theme (goud #C6A56B, zwart #050505)
- Custom fonts: Cormorant Garamond, Jost, Rajdhani
- Supabase browser + server clients
- React Query client setup
- TypeScript types: User, Order, Legger, Offerte, Settings, Company
- Utility helpers: cn, formatDate, generateUAID
- `.env.example` template
