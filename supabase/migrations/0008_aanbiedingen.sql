-- Aurea Maison Floors — Aanbiedingen (Marketplace)
-- Orders kunnen naar marktplaats, leggers kunnen reageren

CREATE TABLE aanbiedingen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  klus_titel TEXT NOT NULL,
  klus_locatie TEXT,
  soort TEXT,
  oppervlakte NUMERIC,
  aangeboden_prijs NUMERIC,
  spoed BOOLEAN DEFAULT false,
  deadline TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','in_behandeling','gegund','verlopen','geannuleerd')),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE aanbieding_reacties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aanbieding_id UUID REFERENCES aanbiedingen(id) ON DELETE CASCADE,
  legger_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  legger_naam TEXT,
  prijs NUMERIC NOT NULL,
  bericht TEXT,
  status TEXT DEFAULT 'wachtend' CHECK (status IN ('wachtend','geaccepteerd','afgewezen')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE aanbiedingen ENABLE ROW LEVEL SECURITY;
ALTER TABLE aanbieding_reacties ENABLE ROW LEVEL SECURITY;

-- Owner: alles
CREATE POLICY "aanb_owner" ON aanbiedingen FOR ALL USING (
  company_id IN (
    SELECT company_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('owner','superadmin','keyuser')
  )
);

-- Legger: alleen SELECT (lezen, tier-check gebeurt in app)
CREATE POLICY "aanb_legger_read" ON aanbiedingen FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'legger')
);

CREATE POLICY "reactie_legger_insert" ON aanbieding_reacties FOR INSERT WITH CHECK (
  legger_id = auth.uid()
);

CREATE POLICY "reactie_owner_all" ON aanbieding_reacties FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN aanbiedingen a ON a.company_id = p.company_id
    WHERE p.id = auth.uid() AND p.role IN ('owner','superadmin')
  )
);

CREATE POLICY "reactie_legger_own" ON aanbieding_reacties FOR SELECT USING (legger_id = auth.uid());

-- Indexen
CREATE INDEX idx_aanbiedingen_order_id ON aanbiedingen(order_id);
CREATE INDEX idx_aanbiedingen_company_id ON aanbiedingen(company_id);
CREATE INDEX idx_aanbiedingen_status ON aanbiedingen(status);
CREATE INDEX idx_reacties_aanbieding_id ON aanbieding_reacties(aanbieding_id);
CREATE INDEX idx_reacties_legger_id ON aanbieding_reacties(legger_id);
