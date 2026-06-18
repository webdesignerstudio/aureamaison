export type UserRole = "superadmin" | "owner" | "keyuser" | "office" | "legger" | "client";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  company_id: string | null;
  onboarding_status: "pending" | "approved" | "rejected";
  onboarding_data: Record<string, unknown>;
  created_at: string;
}

export interface Company {
  id: string;
  naam: string;
  adres: string | null;
  postcode: string | null;
  plaats: string | null;
  kvk: string | null;
  btw: string | null;
  iban: string | null;
  telefoon: string | null;
  email: string | null;
  created_at: string;
}

export type OrderStatus =
  | "ingediend"
  | "in behandeling"
  | "offerte verstuurd"
  | "gepland"
  | "bezig"
  | "ter goedkeuring"
  | "afgerond"
  | "afgewezen";

export interface Order {
  id: string;
  uaid: string | null;
  client_name: string;
  client_email: string;
  straat: string | null;
  postcode: string | null;
  plaats: string | null;
  vloer_type: string | null;
  oppervlakte: number | null;
  ondergrond: string | null;
  budget: number | null;
  timing: string | null;
  status: OrderStatus;
  price: number | null;
  invoice_nr: string | null;
  invoice_date: string | null;  // added via migration 0005
  invoice_paid: boolean;
  invoice_paid_at: string | null;
  legger_id: string | null;
  legger_naam: string | null;
  legger_prijs: number | null;
  legger_geaccepteerd: boolean | null;
  legger_gestart_at: string | null;
  legger_afgerond_at: string | null;
  opmerking: string | null;
  kamers: string | null;
  notes: string | null;
  datum: string | null;
  bedrijf: string | null;
  kvk: string | null;
  btw: string | null;
  mollie_payment_id: string | null;
  mollie_checkout_url: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface Legger {
  id: string;
  profiel_id: string | null;
  naam: string;
  email: string;
  telefoon: string | null;
  adres: string | null;
  kvk: string | null;
  btw: string | null;
  iban: string | null;
  tarief: number | null;
  tier: number;
  stad: string | null;
  beschikbaarheid: unknown;
  status: "actief" | "inactief";
  company_id: string;
  created_at: string;
}

export interface Offerte {
  id: string;
  client_name: string;
  client_email: string;
  order_id: string | null;
  nr: string | null;
  vloer_type: string | null;
  oppervlakte: number | null;
  budget: number | null;
  prijs: number | null;
  geldig_tot: string | null;
  status: "ingediend" | "verstuurd" | "geaccepteerd" | "afgewezen";
  verstuurd_at: string | null;
  geaccepteerd_at: string | null;
  notities: string | null;
  geldigheid_dagen: number | null;
  company_id: string;
  created_at: string;
}

export interface Settings {
  id: string;
  bedrijf_naam: string;
  bedrijf_email: string;
  bedrijf_tel: string | null;
  bedrijf_adres: string | null;
  bedrijf_postcode: string | null;
  bedrijf_plaats: string | null;
  kvk: string | null;
  btw: string | null;
  iban: string | null;
  factuur_btw_pct: number;
  factuur_betaal_termijn: number;
  factuur_voetnoot: string | null;
  offerte_geldigheid: number;
  company_id: string | null;
}

export interface AuditLog {
  id: string;
  actie: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string | null;
  user_naam: string | null;
  user_rol: string | null;
  oude_data: Record<string, unknown> | null;
  nieuwe_data: Record<string, unknown> | null;
  notitie: string | null;
  company_id: string | null;
  created_at: string;
}

export interface ShowroomAanvraag {
  id: string;
  naam: string;
  email: string;
  telefoon: string | null;
  adres: string | null;
  postcode: string | null;
  datum_voorkeur: string | null;
  opmerking: string | null;
  company_id: string | null;
  status: "open" | "afgerond" | "geannuleerd";
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string | null;
  legger_id: string | null;
  sterren: number;
  opmerking: string | null;
  company_id: string;
  created_at: string;
}

export interface Leverancier {
  id: string;
  company_id: string;
  naam: string;
  categorie: string | null;
  lead: number;
  korting: number;
  min_order: number;
  producten: number;
  actief: boolean;
  created_at: string;
}

export interface Abonnement {
  id: string;
  type: "legger" | "bedrijf";
  entity_id: string;
  naam: string;
  email?: string | null;
  tier?: number | null;
  gekozen_tier?: number | null;
  plan?: string | null;
  status: "proefperiode" | "actief" | "gepauzeerd" | "openstaand" | "verlopen";
  betaal_methode?: string;
  start_datum?: string | null;
  volgende_factuur?: string | null;
  notities?: string | null;
  company_id: string;
  aangemaakt_at?: string;
  updated_at?: string;
}
