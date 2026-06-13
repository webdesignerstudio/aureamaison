-- ═══════════════════════════════════════════════════════════════
-- LEVERANCIERS — inkoop-/groothandelregister
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS leveranciers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  naam TEXT NOT NULL,
  categorie TEXT,
  lead INTEGER DEFAULT 0,          -- levertijd in werkdagen
  korting NUMERIC(5,2) DEFAULT 0,  -- inkoopkorting in %
  min_order NUMERIC(10,2) DEFAULT 0,
  producten INTEGER DEFAULT 0,
  actief BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leveranciers ENABLE ROW LEVEL SECURITY;

-- Leden van dezelfde company kunnen lezen
CREATE POLICY "leveranciers_read_company" ON leveranciers FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- Owner/superadmin van dezelfde company kunnen wijzigen
CREATE POLICY "leveranciers_write_company" ON leveranciers FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','superadmin'))
);
