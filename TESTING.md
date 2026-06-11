# E2E Testing — Aurea Maison Floors

## Overzicht

De E2E tests draaien met **Playwright** en dekken alle functionaliteiten van het platform.

## Omgeving

Standaard draaien tests tegen **productie** (`https://www.aureamaisonfloors.nl`).

Om lokaal te testen:

```bash
E2E_BASE_URL=http://localhost:3000 npx playwright test
```

## Credentials

- **Email:** `test@test.nl`
- **Wachtwoord:** `test123`
- **Rol:** `owner`
- **Company:** `11111111-1111-1111-1111-111111111111`

## Commands

```bash
# Alle tests draaien (productie)
npx playwright test

# Specifieke suite
npx playwright test e2e/orders.spec.ts

# Met browser zichtbaar (niet headless)
E2E_HEADLESS=false npx playwright test

# Lokaal testen
E2E_BASE_URL=http://localhost:3000 npx playwright test

# Met UI mode (handig voor debuggen)
npx playwright test --ui

# Alleen smoke tests
npx playwright test e2e/smoke.spec.ts
```

## Test Suites

| Bestand | Dekking |
|---------|---------|
| `auth.spec.ts` | Inloggen, uitloggen, ongeldige credentials, redirects |
| `dashboard.spec.ts` | KPI cards, navigatie, menu items per rol |
| `orders.spec.ts` | Orders lijst, aanmaken, detail, validatie |
| `offertes.spec.ts` | Offertes lijst, detail, publieke offerte pagina |
| `leggers.spec.ts` | Leggers lijst, detail |
| `klanten.spec.ts` | Klanten overzicht (afgeleid van orders) |
| `settings.spec.ts` | Instellingen laden, formulier, opslaan |
| `admin.spec.ts` | Alle 5 tabs: Overview, Bedrijven, Gebruikers, Orders, Audit |
| `public.spec.ts` | Homepage, offerte pagina, login pagina |
| `roles.spec.ts` | Cross-role toegang: legger portal, client portal |
| `smoke.spec.ts` | Basis smoke tests |
| `deep.spec.ts` | Diepgaande data & CRUD tests |

## Debug Helpers

`e2e/debug-helpers.ts` biedt:

- `captureErrors(page)` — vangt console, page, HTTP en Supabase errors
- `assertNoCriticalErrors(result)` — faalt bij 42P17, infinite recursion, 500/403
- `assertNoSupabaseErrors(result)` — faalt bij elke Supabase error
- `assertNoConsoleErrors(result)` — faalt bij `[error]` console logs
- `printErrorSummary(result)` — print samenvatting naar stdout

## Test Helpers

`e2e/test-helpers.ts` biedt:

- `login(page)` — inloggen met test account
- `logout(page)` — uitloggen
- `openOrderForm(page)` — open order formulier
- `fillOrderForm(page, data)` — vul order formulier
- `navigateTo(page, label, pathRegex)` — klik nav link en wacht op URL

## Belangrijke Fixes

### 403 bij orders

De 403 kwam door een auth synchronisatie probleem. `src/lib/supabase/client.ts` is gewijzigd van bare `@supabase/supabase-js` naar `@supabase/ssr`'s `createBrowserClient`, zodat client en server dezelfde cookie-gebaseerde sessie delen.

### RLS Policies

`supabase/fix_rls_complete.sql` bevat een complete set van alle benodigde RLS policies. Voer dit uit in de Supabase SQL Editor als er twijfel is over de huidige policy staat.
