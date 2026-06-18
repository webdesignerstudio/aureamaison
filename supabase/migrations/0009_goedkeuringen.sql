-- Aurea Maison Floors — Goedkeuringen & Audit Uitbreiding
-- High-risk acties vereisen goedkeuring

CREATE TABLE goedkeuringen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  omschrijving TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  aangevraagd_door UUID REFERENCES profiles(id),
  aangevraagd_door_naam TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','goedgekeurd','afgewezen')),
  beoordeeld_door UUID REFERENCES profiles(id),
  beoordeeld_op TIMESTAMPTZ,
  reden TEXT,
  data JSONB DEFAULT '{}',
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goedkeuringen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goedkeuring_owner" ON goedkeuringen FOR ALL USING (
  company_id IN (
    SELECT company_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('owner','superadmin')
  )
);

-- Audit log uitbreiding: rollback velden
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS rollback_reason TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS rolled_back_at TIMESTAMPTZ;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS rolled_back_by UUID;

-- Index
CREATE INDEX idx_goedkeuringen_company_id ON goedkeuringen(company_id);
CREATE INDEX idx_goedkeuringen_status ON goedkeuringen(status);
