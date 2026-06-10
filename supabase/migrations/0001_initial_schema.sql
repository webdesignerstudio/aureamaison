-- Aurea Maison Floors — Initial Database Schema
-- Supabase PostgreSQL with Row Level Security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────────
-- 1. COMPANIES
-- ───────────────────────────────────────────────
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  naam TEXT NOT NULL,
  adres TEXT,
  postcode TEXT,
  plaats TEXT,
  kvk TEXT,
  btw TEXT,
  iban TEXT,
  telefoon TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────
-- 2. PROFILES ( gekoppeld aan auth.users )
-- ───────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('superadmin','owner','keyuser','office','legger','client')),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', COALESCE(NEW.raw_user_meta_data->>'role', 'client'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ───────────────────────────────────────────────
-- 3. ORDERS
-- ───────────────────────────────────────────────
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uaid TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  straat TEXT,
  postcode TEXT,
  plaats TEXT,
  vloer_type TEXT,
  oppervlakte INTEGER,
  ondergrond TEXT,
  budget NUMERIC(10,2),
  timing TEXT,
  status TEXT NOT NULL DEFAULT 'ingediend' CHECK (status IN ('ingediend','in behandeling','offerte verstuurd','gepland','bezig','ter goedkeuring','afgerond','afgewezen')),
  price NUMERIC(10,2),
  invoice_nr TEXT,
  invoice_paid BOOLEAN DEFAULT FALSE,
  invoice_paid_at TIMESTAMPTZ,
  legger_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  legger_naam TEXT,
  legger_prijs NUMERIC(10,2),
  opmerking TEXT,
  kamers TEXT,
  notes TEXT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────
-- 4. LEGGERS ( uitgebreide profiel voor leggers )
-- ───────────────────────────────────────────────
CREATE TABLE leggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profiel_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  naam TEXT NOT NULL,
  email TEXT NOT NULL,
  telefoon TEXT,
  adres TEXT,
  kvk TEXT,
  btw TEXT,
  iban TEXT,
  tarief NUMERIC(10,2),
  tier INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'actief' CHECK (status IN ('actief','inactief')),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leggers ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────
-- 5. OFFERTES
-- ───────────────────────────────────────────────
CREATE TABLE offertes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  vloer_type TEXT,
  oppervlakte INTEGER,
  budget NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'ingediend' CHECK (status IN ('ingediend','verstuurd','geaccepteerd','afgewezen')),
  verstuurd_at TIMESTAMPTZ,
  geaccepteerd_at TIMESTAMPTZ,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE offertes ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────
-- 6. SETTINGS ( per bedrijf )
-- ───────────────────────────────────────────────
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bedrijf_naam TEXT NOT NULL DEFAULT 'Aurea Maison Floors',
  bedrijf_email TEXT NOT NULL,
  bedrijf_tel TEXT,
  bedrijf_adres TEXT,
  bedrijf_postcode TEXT,
  bedrijf_plaats TEXT,
  kvk TEXT,
  btw TEXT,
  iban TEXT,
  factuur_btw_pct NUMERIC(5,2) DEFAULT 21,
  factuur_betaal_termijn INTEGER DEFAULT 14,
  factuur_voetnoot TEXT,
  offerte_geldigheid INTEGER DEFAULT 30,
  company_id UUID UNIQUE REFERENCES companies(id) ON DELETE CASCADE
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────
-- ROW LEVEL SECURITY POLICIES
-- ───────────────────────────────────────────────

-- Companies: iedereen kan lezen, alleen owner/superadmin kan wijzigen
CREATE POLICY "companies_read_all" ON companies FOR SELECT USING (true);
CREATE POLICY "companies_write_owner" ON companies FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','superadmin'))
);

-- Profiles: iedereen kan eigen profiel lezen, superadmin kan alles
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_read_admin" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'superadmin')
);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());

-- Orders: leden van zelfde company kunnen lezen, owner/keyuser/office kunnen alles in company
CREATE POLICY "orders_read_company" ON orders FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "orders_write_company" ON orders FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','keyuser','office','superadmin'))
);

-- Leggers: leden van zelfde company kunnen lezen, owner kan wijzigen
CREATE POLICY "leggers_read_company" ON leggers FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "leggers_write_company" ON leggers FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','superadmin'))
);

-- Offertes: leden van zelfde company kunnen lezen, owner/keyuser kunnen wijzigen
CREATE POLICY "offertes_read_company" ON offertes FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "offertes_write_company" ON offertes FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','keyuser','office','superadmin'))
);

-- Settings: leden van zelfde company kunnen lezen, owner kan wijzigen
CREATE POLICY "settings_read_company" ON settings FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "settings_write_company" ON settings FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','superadmin'))
);
