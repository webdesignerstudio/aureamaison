-- Seed data voor Aurea Maison Floors
-- Run na 0001_initial_schema.sql

-- Demo bedrijf
INSERT INTO companies (id, naam, adres, postcode, plaats, kvk, btw, iban, telefoon, email)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Aurea Maison Floors',
  'Zuidwijkstraat 28',
  '2729 KD',
  'Zoetermeer',
  '42032896',
  'NL00544489B03',
  'NL66 KNAB 0800 1498 74',
  '06 28 27 35 70',
  'Aureamaisonfloors@gmail.com'
)
ON CONFLICT (id) DO NOTHING;

-- Default settings
INSERT INTO settings (
  id, bedrijf_naam, bedrijf_email, bedrijf_tel, bedrijf_adres,
  bedrijf_postcode, bedrijf_plaats, kvk, btw, iban,
  factuur_btw_pct, factuur_betaal_termijn, factuur_voetnoot, offerte_geldigheid, company_id
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Aurea Maison Floors',
  'Aureamaisonfloors@gmail.com',
  '06 28 27 35 70',
  'Zuidwijkstraat 28',
  '2729 KD',
  'Zoetermeer',
  '42032896',
  'NL00544489B03',
  'NL66 KNAB 0800 1498 74',
  21,
  14,
  'Bij vragen: Aureamaisonfloors@gmail.com \u00b7 06 28 27 35 70',
  30,
  '11111111-1111-1111-1111-111111111111'
)
ON CONFLICT (id) DO NOTHING;
