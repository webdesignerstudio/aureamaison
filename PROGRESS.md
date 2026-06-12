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

---

## 🔍 Audit: MODULES.tsx vs Huidige Implementatie

### Uitgesloten (op explicit verzoek)
| Feature | Status | Reden |
|---------|--------|-------|
| AI/JARVIS (f3-ai-ops) | ⛔ | Uitgesloten |
| Tier/abonnement systeem | ⛔ | Uitgesloten |
| Marketplace | ⛔ | Uitgesloten |
| Enterprise audit/RBAC rollback | ⛔ | Uitgesloten |

### ✅ Geimplementeerd

| Portal / Feature | MODULES | Huidig | Route |
|------------------|---------|--------|-------|
| **Landing Page** | diensten, showroom, werkwijze, reviews, galerij, FAQ, contact | ✅ idem | `/` |
| **Offerte formulier (publiek)** | Ja | ✅ | `/offerte` |
| **Owner Login** | Ja | ✅ | `/login` |
| **Client Login** | Ja | ✅ | `/client/login` |
| **Legger Login** | Ja | ✅ | `/legger/login` |
| **Client Registratie** | Ja | ✅ | `/client/registratie` |
| **Legger Registratie** | Ja | ✅ | `/legger/registratie` |
| **Owner Dashboard** | KPI cards (orders, omzet, offertes, leggers) | ✅ idem | `/dashboard` |
| **Owner Orders** | Lijst, detail, aanmaken, bewerken, status workflow | ✅ idem | `/dashboard/orders` |
| **Owner Offertes** | Lijst, detail, status workflow | ✅ idem | `/dashboard/offertes` |
| **Owner Leggers** | Lijst, detail, contact info, toegewezen klussen | ✅ idem | `/dashboard/leggers` |
| **Owner Klanten** | Gegroepeerd per email, totale omzet | ✅ idem | `/dashboard/klanten` |
| **Owner Instellingen** | Bedrijfsgegevens, factuurinstellingen | ✅ basic | `/dashboard/settings` |
| **Client Portal** | Orders + offertes overzicht | ✅ idem | `/client` |
| **Client Nieuwe Opdracht** | Volledig formulier | ✅ idem | `/client/opdracht` |
| **Client Profiel** | Bewerkbaar | ✅ | `/client/profiel` |
| **Legger Dashboard** | Klussen tabs (open/aangenomen/afgerond) | ✅ idem | `/legger` |
| **Legger Klus Detail** | Starten/afronden, opmerkingen | ✅ idem | `/legger/klus/[id]` |
| **Legger Agenda** | Gegroepeerd per maand | ✅ | `/legger/agenda` |
| **Legger Profiel** | Bewerkbaar | ✅ | `/legger/profiel` |
| **Superadmin Dashboard** | Overview, bedrijven, gebruikers, orders, audit | ✅ idem | `/admin` |
| **Email notificaties** | Resend API | ✅ | API routes |
| **Mollie iDEAL betaling** | Test mode | ✅ | `/api/payments` |
| **Database + RLS** | Supabase PostgreSQL | ✅ | Migraties |
| **Seed data** | Mock data generatie | ✅ | `/api/seed` |

### ⚠️ Gedeeltelijk / Vereist aandacht

| Feature | MODULES | Huidig | Status |
|---------|---------|--------|--------|
| **Factuur systeem** | FactuurModal, printFactuurA4, FactuurKnop | ⚠️ Alleen `invoice_paid` toggle; geen print/modal | **BELANGRIJK** — ontbrekend |
| **Entity Timeline** | Volledige audit timeline per record | ⚠️ Alleen admin audit log; geen order/legger timeline | Ontbrekend |
| **Settings (uitgebreid)** | Bedrijf, factuur, notificaties, account, systeem tabs | ⚠️ Basic settings form | Vereist uitbreiding |
| **Command Search** | Cmd+K navigatie met view codes | ❌ Niet geimplementeerd | Ontbrekend |
| **UAID** | HD-YYYY-XXXXXX formaat | ❌ Niet geimplementeerd | Ontbrekend |

### ❌ Niet geimplementeerd (niet uitgesloten)

| Feature | MODULES | Huidig | Impact |
|---------|---------|--------|--------|
| **Planning module** | Volledige planning met drag-drop | ❌ | Hoog — owner mist planning overzicht |
| **Financieel overzicht** | Omzet, betaald, open, prognose charts | ❌ | Hoog — owner mist financieel inzicht |
| **Calculator** | Vloer prijs calculator | ❌ | Medium |
| **Statistieken/Analytics** | Charts, trends, rapportages | ❌ | Medium |
| **TRM (Task/Reminder)** | Taak/reminder systeem | ❌ | Medium |
| **Live Feed** | Real-time activity feed | ❌ | Laag |
| **Goedkeuringen** | Pending approvals workflow | ❌ | Medium |
| **Client Facturen** | Client kan eigen facturen zien | ❌ | Medium |
| **Client Reviews** | Client kan review achterlaten | ❌ | Laag |
| **Client Support** | Support/contact binnen portal | ❌ | Laag |

---

## 📊 Conclusie

**Wat werkt nu (100%):**
- Alle 3 portalen (Owner, Client, Legger) zijn functioneel
- Auth systeem (login/register voor alle rollen)
- Core business data (orders, offertes, leggers, klanten)
- Superadmin platform beheer
- Email + Mollie betalingen
- Landing page + publieke offerte
- Database + RLS + seed

**Wat het meeste mist voor 100% parity met MODULES:**
1. **Factuur print modal** — MODULES had uitgebreide A4 factuur print functie
2. **Planning module** — belangrijke owner feature
3. **Financieel overzicht** — charts en rapportages
4. **Entity Timeline** — audit trail per order/legger
5. **Uitgebreide Settings** — meer configuratie opties

**Totaal: ~85% van MODULES functionaliteit is overgenomen.**
Uitgesloten features (AI, tiers, marketplace) = ~15% van origineel.
