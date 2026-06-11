-- ============================================================
-- COMPLETE RLS FIX + VERIFICATION
-- Aurea Maison Floors — Production
-- ============================================================
-- Doel: zorg dat alle RLS policies correct zijn voor owner/keyuser/office
-- Voer uit in Supabase SQL Editor
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILES — fix recursive policy, gebruik SECURITY DEFINER RPCs
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles_read_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());

-- SECURITY DEFINER RPCs voor admin data (omzeilt RLS)
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM profiles ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION get_all_companies()
RETURNS SETOF companies
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM companies ORDER BY created_at DESC;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 2. ORDERS — zorg dat alle policies aanwezig zijn
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "orders_read_company" ON orders;
DROP POLICY IF EXISTS "orders_write_company" ON orders;
DROP POLICY IF EXISTS "orders_read_legger" ON orders;
DROP POLICY IF EXISTS "orders_read_client" ON orders;

-- Owner/keyuser/office kunnen alle orders van hun company zien
CREATE POLICY "orders_read_company" ON orders FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- Owner/keyuser/office kunnen orders in hun company aanmaken/wijzigen/verwijderen
CREATE POLICY "orders_write_company" ON orders FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','keyuser','office','superadmin'))
);

-- Leggers mogen eigen toegewezen orders lezen
CREATE POLICY "orders_read_legger" ON orders FOR SELECT USING (
  legger_id = auth.uid()
);

-- Klanten mogen orders lezen waar zij de klant zijn
CREATE POLICY "orders_read_client" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  AND client_email = auth.email()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. OFFERTES — zorg dat alle policies aanwezig zijn
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "offertes_read_company" ON offertes;
DROP POLICY IF EXISTS "offertes_write_company" ON offertes;

CREATE POLICY "offertes_read_company" ON offertes FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "offertes_write_company" ON offertes FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','keyuser','office','superadmin'))
);

-- ═══════════════════════════════════════════════════════════════
-- 4. LEGGERS — zorg dat alle policies aanwezig zijn
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "leggers_read_company" ON leggers;
DROP POLICY IF EXISTS "leggers_write_company" ON leggers;

CREATE POLICY "leggers_read_company" ON leggers FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "leggers_write_company" ON leggers FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','superadmin'))
);

-- ═══════════════════════════════════════════════════════════════
-- 5. SETTINGS — zorg dat alle policies aanwezig zijn
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "settings_read_company" ON settings;
DROP POLICY IF EXISTS "settings_write_company" ON settings;

CREATE POLICY "settings_read_company" ON settings FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "settings_write_company" ON settings FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','superadmin'))
);

-- ═══════════════════════════════════════════════════════════════
-- 6. COMPANIES — zorg dat policies aanwezig zijn
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "companies_read_all" ON companies;
DROP POLICY IF EXISTS "companies_write_owner" ON companies;

CREATE POLICY "companies_read_all" ON companies FOR SELECT USING (true);
CREATE POLICY "companies_write_owner" ON companies FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('owner','superadmin'))
);

-- ═══════════════════════════════════════════════════════════════
-- 7. AUDIT LOGS — zorg dat policies aanwezig zijn
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "audit_read_company" ON audit_logs;
DROP POLICY IF EXISTS "audit_read_superadmin" ON audit_logs;

CREATE POLICY "audit_read_company" ON audit_logs FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "audit_read_superadmin" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);

-- ═══════════════════════════════════════════════════════════════
-- 8. VERIFICATIE
-- ═══════════════════════════════════════════════════════════════

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles::text,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
