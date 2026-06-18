// Tier-systeem voor leggers (1:1 MODULES 1354–1569)

export const LEGGER_TIERS = {
  1: {
    naam: "Tier 1",
    prijs: 180,
    kleur: "#8B8B8B",
    maxKlussen: 3,
    markt: false,
    commissiePct: 0.05,
    features: ["Basis klussenbeheer", "Agenda", "Profiel"],
  },
  2: {
    naam: "Tier 2",
    prijs: 350,
    kleur: "#4A9EE8",
    maxKlussen: 6,
    markt: true,
    commissiePct: 0.05,
    features: ["Alles van Tier 1", "Marktplaats toegang", "Meer klussen"],
  },
  3: {
    naam: "Tier 3",
    prijs: 450,
    kleur: "#C6A56B",
    maxKlussen: 999,
    markt: true,
    commissiePct: 0.05,
    features: ["Alles van Tier 2", "Onbeperkte klussen", "Premium support"],
  },
} as const;

export const GRACE_PERIOD_DAGEN = 3;
export const PROEF_PERIODE_DAGEN = 30;

export interface Abonnement {
  id: string;
  type: "legger" | "bedrijf";
  entity_id: string;
  naam: string;
  email?: string;
  tier: 1 | 2 | 3;
  gekozen_tier: 1 | 2 | 3;
  plan?: string;
  status: "proefperiode" | "actief" | "gepauzeerd" | "openstaand" | "verlopen";
  betaal_methode: string;
  start_datum: string;
  volgende_factuur?: string;
  notities?: string;
  company_id: string;
  aangemaakt_at: string;
  updated_at: string;
}

/**
 * Bepaalt het effectieve tier op basis van abonnement-status
 * - Proefperiode → Tier 3 (volledige toegang)
 * - Actief → gekozen tier
 * - Anders → Tier 1 (laagste)
 */
export function effectiefLeggerTier(abo: Abonnement | null): 1 | 2 | 3 {
  if (!abo) return 1;
  if (abo.status === "proefperiode") return 3;
  if (abo.status === "actief") return (abo.tier || 1) as 1 | 2 | 3;
  return 1;
}

/**
 * Check of proefperiode verlopen is
 */
export function proefVerlopen(abo: Abonnement | null): boolean {
  if (!abo || abo.status !== "proefperiode") return false;
  if (!abo.volgende_factuur) return false;
  return new Date(abo.volgende_factuur) < new Date();
}

/**
 * Haal vervaldatum van abonnement op
 */
export function getAboVerloopdatum(abo: Abonnement | null): Date | null {
  if (!abo?.volgende_factuur) return null;
  return new Date(abo.volgende_factuur);
}

/**
 * Check of tier marktplaats-toegang heeft
 */
export function tierHeeftMarkt(tier: number): boolean {
  return tier >= 2;
}

/**
 * Haal max klussen per maand voor tier
 */
export function tierMaxKlussen(tier: number): number {
  const t = LEGGER_TIERS[tier as 1 | 2 | 3];
  return t?.maxKlussen || 3;
}
