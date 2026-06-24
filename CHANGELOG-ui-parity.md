# UI Pariteits-sessie — Aurea Maison Next.js

**Datum:** 24 juni 2026  
**Doel:** 100% UI-consistentie tussen `AureaMaison-MODULES.tsx` (monoliet) en de Next.js app.

---

## Overzicht wijzigingen

### Stap 1 — `src/app/legger/instellingen/page.tsx`
**Volledig herschreven** om te matchen met `LeggerInstellingenTab` uit MODULES.

**Wat toegevoegd:**
- 4 sub-tabs met `C.blue` accent-kleur: **Mijn gegevens**, **Bedrijf**, **Beveiliging**, **Voorkeuren**
- **Mijn gegevens tab**: naam-input, e-mail readonly (`🔒`), telefoonnummer-input — live opslaan naar Supabase `leggers.naam` + `leggers.telefoon`
- **Bedrijf tab**: bedrijfsnaam, KvK, BTW, IBAN, werkstraal (km), bio/beschrijving als textarea, specialisaties-chips (toggle per vloertype, exact zoals MODULES)
- **Beveiliging tab**: huidig wachtwoord, nieuw wachtwoord + kracht-indicator (rood/oranje/groen balk), bevestig wachtwoord — update via `supabase.auth.updateUser`
- **Voorkeuren tab**: ToggleSwitches voor e-mailnotificaties, klus-meldingen, compacte weergave + Weergave-sectie
- Header toont "💾 Wijzigingen opslaan" knop wanneer er onopgeslagen wijzigingen zijn
- Supabase data-fetching via `profiel_id` match op `leggers` tabel
- TypeScript-safe via `str()` helper voor `unknown` veld-conversie

---

### Stap 2 — `src/components/modules/orders/orders-list.tsx`
**Filter bar + badges toegevoegd** om te matchen met `OrdersTab` uit MODULES.

**Wat toegevoegd:**
- **Zoekbalk** (klant, vloertype, adres)
- **Status-filter dropdown** (Alles + alle OrderStatus waarden)
- **Vloertype-filter dropdown** (Alles + 8 vloertypes)
- **Sorteer-dropdown**: datum oplopend/aflopend, nieuwste/oudste, naam A–Z, prijs hoog–laag
- **Refresh-knop** (↻)
- **Vloertype-emoji** per orderrij: 🪵 Laminaat, ⬜ PVC, 🌳 Parket, 🏕 Hout, 🔷 Visgraat, 🪜 Traprenovatie, 📐 Egaliseren, 🟫 Tegelwerk
- **Legger-naam badge** (groen, met 🔨 icoon) of "— Geen legger" (oranje)
- **WEBSITE-badge** (blauw) wanneer `order.bron === "website"`
- `order.legger_naam` gebruikt direct vanuit het `Order` type (geen unsafe cast meer)

---

### Stap 3 — `src/components/modules/settings-gear.tsx`
**Volledig herschreven** om te matchen met `UserSettings` uit MODULES.

**Wat toegevoegd:**
- **Desktop sidebar (200px)** met goud-geaccentueerde actieve tab — identiek aan MODULES `OwnerSettings`
- **Mobiel**: horizontale tab-balk (scrollbaar)
- **Mijn gegevens tab**: naam-input, e-mail readonly (`🔒`), **telefoonnummer**-input — alle opgeslagen via Supabase `profiles`
- **Beveiliging tab**: huidig wachtwoord + nieuw + bevestig + kracht-indicator (5-niveau) + `supabase.auth.updateUser`
- **Notificaties tab**: echte `ToggleSwitch` componenten per type (nieuw order, status, offerte, legger, betaling)
- State beheer per tab (geen globale "saved" — elke tab afzonderlijk)

---

### Stap 4 — `src/components/layout/client-layout.tsx` + `src/app/client/page.tsx`

**`client-layout.tsx`:**
- `isZakelijk` check via `user.onboarding_data.type === "zakelijk"`
- **Dynamisch portaal-label**: "Zakelijk Portaal" of "Particulier Portaal" in sidebar subtitle
- **Gebruikerskaart** in sidebar: avatar-initiaal (goud gradient), naam, "Zakelijk account" badge indien van toepassing — via `statsSlot`
- **Conditionele tabs**: zakelijk krijgt extra tab "🛒 Leggers vinden" + "Bedrijfsprofiel" ipv "Profiel"

**`client/page.tsx`:**
- Dynamische koptekst: zakelijk toont bedrijfsnaam + "Projecten", particulier toont "Welkom, [voornaam]"
- **Abonnement-banner** (blauw) voor zakelijke accounts: "Zakelijk account · Proefperiode" + Beheer-knop
- **Zakelijke stat-kaarten**: Totale waarde (€) + Openstaand (€) ipv telling-kaarten
- **Vloertype-emoji** per orderrij in de orders-tabel
- Oppervlakte getoond naast vloertype (`· 45 m²`)

---

### Bugfixes gevonden tijdens review (tweede ronde)

**`src/components/modules/settings/settings-form.tsx` (Owner dashboard):**
- **Notificaties-tab**: statische groene bolletjes vervangen door echte `ToggleSwitch` componenten (emailNieuwOrder, emailStatusUpdate, emailOfferte, emailLegger) + E-mail configuratie sectie (afzendernaam, reply-to)
- **Factuur-tab**: ontbrekend "Voettekst offerte" veld toegevoegd (staat in MODULES `OwnerSettings`)
- **Account-tab**: naam + telefoonnummer invoervelden toegevoegd (`eig_naam`, `eig_tel`) + huidig wachtwoord veld bij wachtwoord wijzigen
- Wachtwoord validatie: check op `pwOud` toegevoegd (was eerder overgeslagen)

**`src/components/modules/orders/orders-list.tsx`:**
- `legger_naam` via direct `Order` type property ipv `unknown` cast

---

### Build-fix — `dynamic = "force-dynamic"`

**Probleem:** `next build` faalde met prerender-error op `/dashboard/abonnementen` en `/dashboard/taken` omdat Supabase env-vars niet beschikbaar zijn tijdens static generation.

**Oplossing:** Drie nieuwe `layout.tsx` files aangemaakt met `export const dynamic = "force-dynamic"`:
- `src/app/dashboard/layout.tsx` — dekt alle 28 dashboard-routes
- `src/app/client/layout.tsx` — dekt alle client-portaal routes  
- `src/app/legger/layout.tsx` — dekt alle legger-portaal routes

**Resultaat:** Build succesvol (Exit 0), alle protected routes zijn `ƒ (Dynamic)` server-rendered.

---

## TypeScript status
```
npx tsc --noEmit → 0 errors
npx next build   → Exit 0, 30/30 pages gegenereerd
```

## Bestanden gewijzigd
| Bestand | Type |
|---|---|
| `src/app/legger/instellingen/page.tsx` | Herschreven |
| `src/components/modules/orders/orders-list.tsx` | Uitgebreid |
| `src/components/modules/settings-gear.tsx` | Herschreven |
| `src/components/layout/client-layout.tsx` | Uitgebreid |
| `src/app/client/page.tsx` | Uitgebreid |
| `src/components/modules/settings/settings-form.tsx` | Bugfixes |
| `src/app/dashboard/layout.tsx` | Nieuw (dynamic) |
| `src/app/client/layout.tsx` | Nieuw (dynamic) |
| `src/app/legger/layout.tsx` | Nieuw (dynamic) |
