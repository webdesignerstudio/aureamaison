-- ============================================================
-- AUREA MAISON FLOORS — PRODUCTION FIX
-- Voer dit uit in Supabase SQL Editor
-- ============================================================

-- STAP 1: Zorg dat de company bestaat met het bekende ID
INSERT INTO companies (id, naam, email)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Aurea Maison Floors',
  'Aureamaisonfloors@gmail.com'
)
ON CONFLICT (id) DO NOTHING;

-- STAP 2: Fix het profiel van de test user — zet company_id en role correct
UPDATE profiles
SET
  company_id = '11111111-1111-1111-1111-111111111111',
  role = 'owner'
WHERE email = 'test@test.nl';

-- STAP 3: Fix alle profielen zonder company_id (nieuwe gebruikers via trigger)
UPDATE profiles
SET company_id = '11111111-1111-1111-1111-111111111111'
WHERE company_id IS NULL;

-- STAP 4: Fix de trigger zodat nieuwe gebruikers altijd company_id krijgen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner'),
    COALESCE(
      (NEW.raw_user_meta_data->>'company_id')::UUID,
      '11111111-1111-1111-1111-111111111111'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    company_id = COALESCE(EXCLUDED.company_id, '11111111-1111-1111-1111-111111111111'),
    role = COALESCE(EXCLUDED.role, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STAP 5: Drop en herstel alle RLS policies (schoon slate)
-- WAARSCHUWING: profiles_read_admin met "SELECT FROM profiles" veroorzaakt
-- infinite recursion (42P17). Gebruik SECURITY DEFINER RPC functies voor admin data.
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "profiles_read_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());

-- STAP 6: Verifieer het resultaat
SELECT 
  p.id,
  p.email,
  p.role,
  p.company_id,
  c.naam as company_naam
FROM profiles p
LEFT JOIN companies c ON c.id = p.company_id
ORDER BY p.created_at DESC;
