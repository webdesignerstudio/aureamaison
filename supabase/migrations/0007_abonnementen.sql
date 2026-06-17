-- Aurea Maison Floors — Abonnementen Tabel
-- Tier-systeem voor leggers (Tier 1/2/3) met proefperiode

CREATE TABLE abonnementen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('legger','bedrijf')),
  entity_id UUID NOT NULL,
  naam TEXT NOT NULL,
  email TEXT,
  tier INTEGER DEFAULT 1 CHECK (tier IN (1,2,3)),
  gekozen_tier INTEGER DEFAULT 1 CHECK (gekozen_tier IN (1,2,3)),
  plan TEXT,
  status TEXT NOT NULL DEFAULT 'proefperiode'
    CHECK (status IN ('proefperiode','actief','gepauzeerd','openstaand','verlopen')),
  betaal_methode TEXT DEFAULT 'handmatig',
  start_datum DATE DEFAULT CURRENT_DATE,
  volgende_factuur DATE,
  notities TEXT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  aangemaakt_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE abonnementen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "abo_owner_all" ON abonnementen FOR ALL USING (
  company_id IN (
    SELECT company_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('owner','superadmin','keyuser')
  )
);

-- Index voor snelle lookups
CREATE INDEX idx_abonnementen_entity_id ON abonnementen(entity_id);
CREATE INDEX idx_abonnementen_company_id ON abonnementen(company_id);
CREATE INDEX idx_abonnementen_status ON abonnementen(status);
