-- Aurea Maison Floors — Enterprise Foundation
-- Voorbereiding voor tier-systeem, abonnementen en commissies
-- Veilig: alleen ADD COLUMN IF NOT EXISTS

-- ── leggers: tier-velden ──────────────────────────────────────
ALTER TABLE leggers ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 1;
ALTER TABLE leggers ADD COLUMN IF NOT EXISTS gekozen_tier INTEGER DEFAULT 1;
ALTER TABLE leggers ADD COLUMN IF NOT EXISTS commissie_pct NUMERIC(4,3) DEFAULT 0.05;

-- ── settings: commissie-percentages ──────────────────────────
ALTER TABLE settings ADD COLUMN IF NOT EXISTS commissie_pct_klant NUMERIC(4,3) DEFAULT 0.05;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS commissie_pct_legger NUMERIC(4,3) DEFAULT 0.05;

-- Bestaande leggers op tier 1 zetten (default starter)
UPDATE leggers SET tier = 1, gekozen_tier = 1 WHERE tier IS NULL;

-- Verificeer
SELECT COUNT(*) as leggers_met_tier FROM leggers WHERE tier IS NOT NULL;
