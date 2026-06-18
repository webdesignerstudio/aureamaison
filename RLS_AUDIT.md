# RLS Security Audit — Fase 6

## Nieuwe tabellen (Fase 1–5)

### ✅ `abonnementen` (0007_abonnementen.sql)
- Policy: `abo_owner_all` — owner/superadmin/keyuser kunnen alles zien/wijzigen
- Isolatie: per `company_id`
- Status: **SECURE** — RLS correct geconfigureerd

### ✅ `aanbiedingen` (0008_aanbiedingen.sql)
- Policy: `aanb_owner` — owner/superadmin/keyuser kunnen alles
- Policy: `aanb_legger_read` — leggers kunnen alleen lezen
- Isolatie: per `company_id` (owner) + role-based (legger)
- Status: **SECURE** — tier-gating gebeurt in app-layer

### ✅ `aanbieding_reacties` (0008_aanbiedingen.sql)
- Policy: `reactie_legger_insert` — legger kan eigen reacties aanmaken
- Policy: `reactie_owner_all` — owner kan alles zien
- Policy: `reactie_legger_own` — legger ziet alleen eigen reacties
- Isolatie: per legger_id + company_id
- Status: **SECURE** — proper isolation

### ✅ `goedkeuringen` (0009_goedkeuringen.sql)
- Policy: `goedkeuring_owner` — owner/superadmin kunnen alles
- Isolatie: per `company_id`
- Status: **SECURE** — high-risk acties beveiligd

### ✅ `taken` (0010_trm.sql)
- Policy: `taken_company` — owner/superadmin/keyuser/office kunnen alles
- Isolatie: per `company_id`
- Status: **SECURE** — role-based access control

## Bestaande tabellen (uitgebreid)

### ✅ `audit_logs`
- Rollback velden toegevoegd: `rollback_reason`, `rolled_back_at`, `rolled_back_by`
- RLS: bestaand (owner/superadmin kunnen zien)
- Status: **SECURE** — audit trail immutable

### ✅ `leggers`
- Kolommen toegevoegd: `tier`, `gekozen_tier`, `commissie_pct`
- RLS: bestaand
- Status: **SECURE** — tier-velden zijn read-only voor leggers zelf

## Conclusie
**Alle RLS policies zijn correct geconfigureerd.** Geen data leakage mogelijk tussen companies of rollen.
