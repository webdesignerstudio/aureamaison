// Admin KPI helpers

export interface Order {
  id: string;
  status: string;
  price?: number;
  totaalInclBTW?: number;
  invoiceNr?: string;
  invoicePaid?: boolean;
}

export interface Abonnement {
  id: string;
  type: "legger" | "bedrijf";
  status: string;
  tier?: number;
  plan?: string;
}

export const LEGGER_TIERS_PRICES: Record<number, number> = {
  1: 180,
  2: 350,
  3: 450,
};

export const BEDRIJF_PLANNEN_PRICES: Record<string, number> = {
  starter: 99,
  pro: 199,
  enterprise: 499,
};

/**
 * Bereken MRR (Monthly Recurring Revenue)
 */
export function calcMRR(abonnementen: Abonnement[]): number {
  return abonnementen
    .filter((a) => a.status === "actief")
    .reduce((sum, a) => {
      if (a.type === "legger") {
        return sum + (LEGGER_TIERS_PRICES[a.tier || 1] || 0);
      }
      if (a.type === "bedrijf") {
        return sum + (BEDRIJF_PLANNEN_PRICES[a.plan || "starter"] || 0);
      }
      return sum;
    }, 0);
}

/**
 * Bereken totale omzet (afgeronde orders)
 */
export function calcTotalOmzet(orders: Order[]): number {
  return orders
    .filter((o) => o.status === "Afgerond")
    .reduce((sum, o) => sum + (parseFloat(String(o.price || 0)) || 0), 0);
}

/**
 * Bereken open facturen
 */
export function calcOpenFacturen(orders: Order[]): { count: number; total: number } {
  const open = orders.filter((o) => o.invoiceNr && !o.invoicePaid);
  return {
    count: open.length,
    total: open.reduce((sum, o) => sum + (parseFloat(String(o.totaalInclBTW || 0)) || 0), 0),
  };
}
