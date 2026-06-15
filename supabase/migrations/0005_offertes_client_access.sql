-- ═══════════════════════════════════════════════════════════════
-- 0005: Offertes uitbreiden + client-toegang + invoice_date
-- ═══════════════════════════════════════════════════════════════

-- ── orders: voeg invoice_date toe ────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS invoice_date DATE;

-- ── offertes: velden voor OfferteKlantView ───────────────────
ALTER TABLE offertes
  ADD COLUMN IF NOT EXISTS order_id   UUID REFERENCES orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS prijs      NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS geldig_tot TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nr         TEXT;

-- ── RLS: klanten mogen eigen offertes lezen ──────────────────
-- (op basis van client_email, los van company_id)
CREATE POLICY "offertes_read_client" ON offertes FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  AND client_email = auth.email()
);

-- ── RLS: klanten mogen eigen offertes accepteren / afwijzen ──
-- Alleen als status 'verstuurd' is en niet verlopen
CREATE POLICY "offertes_update_client" ON offertes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  AND client_email = auth.email()
  AND status = 'verstuurd'
) WITH CHECK (
  status IN ('geaccepteerd', 'afgewezen')
);
