-- ============================================================
-- FIX: Infinite Recursion in profiles RLS Policy
-- ============================================================
-- Probleem: profiles_read_admin doet SELECT FROM profiles
-- binnen een policy op profiles zelf → 42P17 infinite recursion
-- Dit breekt ALLE queries met profiles subqueries (orders, audit, etc.)
-- ============================================================

-- STAP 1: Drop de recursive policy
DROP POLICY IF EXISTS "profiles_read_admin" ON profiles;

-- STAP 2: Zorg dat alleen de veilige policies overblijven
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());

-- STAP 3: Maak SECURITY DEFINER functie voor admin profiel opvragen
-- Deze functie omzeilt RLS (SECURITY DEFINER) zodat superadmin
-- alle profielen kan zien zonder recursive policy.
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM profiles ORDER BY created_at DESC;
$$;

-- STAP 4: Maak SECURITY DEFINER functie voor admin bedrijven opvragen
CREATE OR REPLACE FUNCTION get_all_companies()
RETURNS SETOF companies
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM companies ORDER BY created_at DESC;
$$;

-- STAP 5: Verifieer dat policies correct zijn
SELECT 
  schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';
