-- Mollie iDEAL payment tracking columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mollie_payment_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mollie_checkout_url text;
