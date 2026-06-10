export type UserRole = "superadmin" | "owner" | "keyuser" | "office" | "legger" | "client";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  company_id: string | null;
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
  invoice_paid: boolean;
  invoice_paid_at: string | null;
  legger_id: string | null;
  legger_naam: string | null;
  legger_prijs: number | null;
  opmerking: string | null;
  kamers: string | null;
  notes: string | null;
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
  status: "actief" | "inactief";
  company_id: string;
  created_at: string;
}

export interface Offerte {
  id: string;
  client_name: string;
  client_email: string;
  vloer_type: string | null;
  oppervlakte: number | null;
  budget: number | null;
  status: "ingediend" | "verstuurd" | "geaccepteerd" | "afgewezen";
  verstuurd_at: string | null;
  geaccepteerd_at: string | null;
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
