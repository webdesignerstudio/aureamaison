-- Aurea Maison Floors — Extended Database Schema
-- Supabase PostgreSQL — nieuwe tabellen + uitbreidingen

-- ═══════════════════════════════════════════════════════════════
-- 1. NIEUWE TABELLEN
-- ═══════════════════════════════════════════════════════════════

-- ── AUDIT LOGS ────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actie TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_naam TEXT,
  user_rol TEXT,
  oude_data JSONB,
  nieuwe_data JSONB,
  notitie TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_read_company" ON audit_logs FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "audit_read_superadmin" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);

-- ── SHOWROOM AANVRAGEN ──────────────────────────────────────
CREATE TABLE showroom_aanvragen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  naam TEXT NOT NULL,
  email TEXT NOT NULL,
  telefoon TEXT,
  adres TEXT,
  postcode TEXT,
  datum_voorkeur DATE,
  opmerking TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','afgerond','geannuleerd')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE showroom_aanvragen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "showroom_insert_open" ON showroom_aanvragen FOR INSERT WITH CHECK (true);
CREATE POLICY "showroom_read_company" ON showroom_aanvragen FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "showroom_write_company" ON showroom_aanvragen FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','keyuser','office','superadmin'))
);

-- ── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  legger_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sterren INTEGER NOT NULL CHECK (sterren BETWEEN 1 AND 5),
  opmerking TEXT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_read_company" ON reviews FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "reviews_write_owner" ON reviews FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','superadmin'))
);
CREATE POLICY "reviews_insert_client" ON reviews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  AND company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- ── ABONNEMENTEN ────────────────────────────────────────────
CREATE TABLE abonnementen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bedrijf','legger')),
  plan TEXT NOT NULL CHECK (plan IN ('starter','professional','business')),
  tier INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'proefperiode' CHECK (status IN ('proefperiode','actief','verlopen','bevroren','openstaand')),
  start_datum DATE,
  maanden INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE abonnementen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "abonnementen_read_company" ON abonnementen FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "abonnementen_read_superadmin" ON abonnementen FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);

-- ═══════════════════════════════════════════════════════════════
-- 2. BESTAANDE TABELLEN UITBREIDEN
-- ═══════════════════════════════════════════════════════════════

-- ── orders ───────────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS legger_geaccepteerd BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS legger_gestart_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legger_afgerond_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS datum DATE,
  ADD COLUMN IF NOT EXISTS bedrijf TEXT,
  ADD COLUMN IF NOT EXISTS kvk TEXT,
  ADD COLUMN IF NOT EXISTS btw TEXT;

-- ── leggers ──────────────────────────────────────────────────
ALTER TABLE leggers
  ADD COLUMN IF NOT EXISTS stad TEXT,
  ADD COLUMN IF NOT EXISTS beschikbaarheid JSONB DEFAULT '[]';

-- ── offertes ─────────────────────────────────────────────────
ALTER TABLE offertes
  ADD COLUMN IF NOT EXISTS notities TEXT,
  ADD COLUMN IF NOT EXISTS geldigheid_dagen INTEGER DEFAULT 30;

-- ── profiles ──────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'approved' CHECK (onboarding_status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';

-- ═══════════════════════════════════════════════════════════════
-- 3. HERSTEL handle_new_user TRIGGER
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, role, company_id, onboarding_status
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(
      (NEW.raw_user_meta_data->>'company_id')::UUID,
      '11111111-1111-1111-1111-111111111111'
    ),
    COALESCE(NEW.raw_user_meta_data->>'onboarding_status', 'approved')
  )
  ON CONFLICT (id) DO UPDATE SET
    company_id = COALESCE(EXCLUDED.company_id, '11111111-1111-1111-1111-111111111111'),
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Extra RLS: leggers mogen eigen toegewezen orders lezen ──
CREATE POLICY "orders_read_legger" ON orders FOR SELECT USING (
  legger_id = auth.uid()
);

-- ── Extra RLS: klanten mogen orders lezen waar zij de klant zijn ──
CREATE POLICY "orders_read_client" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  AND client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- ═══════════════════════════════════════════════════════════════
-- 4. HUIDIGE PROFIELEN BIJWERKEN
-- ═══════════════════════════════════════════════════════════════

-- Zorg dat test@test.nl en alle profielen company_id hebben
UPDATE profiles
SET
  company_id = COALESCE(company_id, '11111111-1111-1111-1111-111111111111'),
  onboarding_status = COALESCE(onboarding_status, 'approved')
WHERE company_id IS NULL OR onboarding_status IS NULL;

-- Verifieer
SELECT COUNT(*) as profielen_zonder_company FROM profiles WHERE company_id IS NULL;
SELECT COUNT(*) as totaal_profilen FROM profiles;
