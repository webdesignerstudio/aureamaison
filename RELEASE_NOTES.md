# Release Notes — Aurea Maison Floors v1.1.0

**Releasedatum:** 17 juni 2026
**Omgeving:** Productie (`https://www.aureamaisonfloors.nl`)
**Branch:** `main`

## Samenvatting
Start van de enterprise uitbouw — het platform wordt uitgebreid met tier-abonnementen voor leggers, een marktplaats voor klussen, een volledig admin control center, goedkeuringen-workflow, RBAC en TRM-taakbeheer. In deze release is het fundament gelegd en zijn beveiligingsbugs opgelost.

## Wat is nieuw
- Beveiligingsfix owner login: alleen eigenaar/admin-rollen kunnen nu het dashboard bereiken
- Database voorbereid voor tier-systeem (kolommen toegevoegd aan `leggers` en `settings`)
- Enterprise roadmap gedocumenteerd in `PROGRESS.md` en `CHANGELOG.md`

## Actie vereist (voor beheerder)
1. Voer migratie `0006_enterprise_foundation.sql` uit in Supabase SQL Editor
2. Verifieer `RESEND_API_KEY` in Vercel environment variables

---

# Release Notes — Aurea Maison Floors v1.0.0

**Releasedatum:** 11 juni 2026  
**Omgeving:** Productie (`https://www.aureamaisonfloors.nl`)  
**Git commit:** `HEAD` op `main` branch  
**Supabase migratie:** `0002_extended_schema.sql`

---

## Samenvatting

Volledige implementatie van het Aurea Maison Floors SaaS platform. Alle 6 fases zijn afgerond, getest, gebouwd en naar productie gedeployed. Het platform ondersteunt nu meerdere rollen (superadmin, owner, keyuser, office, legger, client) met aparte portals, RLS-beveiligde data, en een professionele publieke landingspagina.

---

## Wat is nieuw

### Multi-tenant Rolgebaseerde Portalen
- **Eigenaar dashboard** (`/dashboard/*`) — orders, leggers, offertes, klanten, instellingen, facturen
- **Legger portal** (`/legger/*`) — klussen accepteren/weigeren, starten/afronden, agenda, profiel
- **Klant portal** (`/client/*`) — eigen orders volgen, nieuwe opdracht indienen, offertes bekijken
- **Superadmin dashboard** (`/admin`) — platform overzicht, bedrijven, gebruikers, audit logs

### Publieke Landingspagina
- Professionele one-page website met USP bar, diensten, FAQ, werkwijze, contact
- Publieke offerte aanvraag zonder account
- Mobile-first responsive design met hamburger menu

### Database & Security
- Uitgebreid PostgreSQL schema met audit logging, reviews, showroom aanvragen, abonnementen
- RLS policies per rol — data isolatie tussen bedrijven en gebruikers
- Onboarding workflow voor nieuwe leggers (pending → approved)

---

## Bekende Beperkingen

| # | Beperking | Impact | Oplossing |
|---|-----------|--------|-----------|
| 1 | Mollie API key niet ingevuld (productie) | Betalingen werken niet live | Klant moet Mollie live key toevoegen in Vercel env vars |
| 2 | Resend API key niet ingevuld | Transactionele emails worden niet verstuurd | Klant moet Resend API key toevoegen in Vercel env vars |
| 3 | Zod schemas nog niet geimplementeerd | Native HTML5 validatie werkt, maar geen runtime schema validatie | Post-MVP item |
| 4 | Admin/Superadmin portal basis-versie | Geen gebruiker goedkeuren/afwijzen via UI (DB-level wel mogelijk) | Post-MVP item |
| 5 | Geen E2E smoke tests uitgevoerd op live URL | Mogelijk ongedetecteerde productie-issues | Handmatige verificatie door klant |

---

## Deploy Instructies

### Stap 1 — Environment Variabelen (Vercel)
Controleer of deze variabelen correct zijn ingesteld in Vercel → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
RESEND_API_KEY=<resend-key>           # verplicht voor emails
MOLLIE_API_KEY=<mollie-live-key>    # verplicht voor live betalingen
NEXT_PUBLIC_APP_URL=https://www.aureamaisonfloors.nl
```

### Stap 2 — Supabase Migratie
Voer `0002_extended_schema.sql` uit in de Supabase SQL Editor (of via CLI):
```bash
supabase migration up
```

### Stap 3 — Verificie
- [ ] Homepage laadt (`/`)
- [ ] Offerte formulier werkt (`/offerte`)
- [ ] Owner login werkt (`/login`)
- [ ] Legger login + registratie werken (`/legger/login`, `/legger/registratie`)
- [ ] Client login + registratie werken (`/client/login`, `/client/registratie`)
- [ ] Dashboard KPI's tonen data
- [ ] Order aanmaken + factuur print werkt
- [ ] Legger kan klus accepteren en afronden

---

## Rollback Plan

Mocht productie problemen vertonen:
1. Vercel → Deployments → selecteer vorige stabiele deployment → Promote to Production
2. Supabase → SQL Editor → `0002_extended_schema.sql` herstellen (back-up raadzaam)

---

## Support

- **Repository:** `https://github.com/webdesignerstudio/aureamaison`
- **Productie URL:** `https://www.aureamaisonfloors.nl`
- **Supabase Project:** dashboard.supabase.com
- **Vercel Project:** vercel.com/dashboard
