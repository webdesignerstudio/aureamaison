"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useState } from "react";
import { formatEuro } from "@/lib/utils";

const VLOER_TARIEVEN: Record<string, { prijs: number; label: string }> = {
  laminaat: { prijs: 28, label: "Laminaat" },
  pvc: { prijs: 35, label: "PVC / Vinyl" },
  parket: { prijs: 65, label: "Parket (massief)" },
  hout: { prijs: 55, label: "Houten vloer" },
  visgraat: { prijs: 75, label: "Visgraat" },
  trap: { prijs: 120, label: "Traprenovatie (per trede)" },
};

const ONDERGROND_TOESLAG: Record<string, number> = {
  beton: 0,
  hout: 0,
  tegels: 8,
  oude_vloer: 12,
};

export default function CalculatorPage() {
  const [vloerType, setVloerType] = useState<string>("laminaat");
  const [oppervlakte, setOppervlakte] = useState<string>("");
  const [ondergrond, setOndergrond] = useState<string>("beton");
  const [egalisatie, setEgalisatie] = useState(false);
  const [plinten, setPlinten] = useState(false);
  const [trap, setTrap] = useState(false);
  const [aantalTreden, setAantalTreden] = useState<string>("");

  const opp = parseFloat(oppervlakte) || 0;
  const tarief = VLOER_TARIEVEN[vloerType]?.prijs || 0;
  const ondergrondToeslag = ONDERGROND_TOESLAG[ondergrond] || 0;

  // Basis prijs
  const basisPrijs = opp * tarief;

  // Ondergrond toeslag
  const ondergrondPrijs = opp * ondergrondToeslag;

  // Egalisatie
  const egalisatiePrijs = egalisatie ? opp * 12 : 0;

  // Plinten
  const plintenPrijs = plinten ? opp * 4.5 : 0;

  // Trap
  const trapPrijs = trap ? (parseFloat(aantalTreden) || 0) * 120 : 0;

  // Totaal
  const totaal = basisPrijs + ondergrondPrijs + egalisatiePrijs + plintenPrijs + trapPrijs;

  // BTW
  const btw = totaal * 0.21;
  const totaalIncl = totaal + btw;

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Calculator
        </h1>
        <p className="mt-2 text-muted">
          Schat de kosten van uw vloerproject.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-4 rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-gold">
              Projectgegevens
            </h2>

            {/* Vloertype */}
            <div>
              <label className="mb-1 block text-xs text-muted">Vloertype</label>
              <select
                value={vloerType}
                onChange={(e) => setVloerType(e.target.value)}
                className="w-full rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
              >
                {Object.entries(VLOER_TARIEVEN).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Oppervlakte */}
            <div>
              <label className="mb-1 block text-xs text-muted">Oppervlakte (m²)</label>
              <input
                type="number"
                value={oppervlakte}
                onChange={(e) => setOppervlakte(e.target.value)}
                placeholder="Bijv. 45"
                className="w-full rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
              />
            </div>

            {/* Ondergrond */}
            <div>
              <label className="mb-1 block text-xs text-muted">Ondergrond</label>
              <select
                value={ondergrond}
                onChange={(e) => setOndergrond(e.target.value)}
                className="w-full rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
              >
                <option value="beton">Beton (+€0/m²)</option>
                <option value="hout">Houten ondergrond (+€0/m²)</option>
                <option value="tegels">Tegels (+€8/m²)</option>
                <option value="oude_vloer">Oude vloer verwijderen (+€12/m²)</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={egalisatie}
                  onChange={(e) => setEgalisatie(e.target.checked)}
                  className="rounded border-gold/30"
                />
                Egalisatie noodzakelijk (+€12/m²)
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={plinten}
                  onChange={(e) => setPlinten(e.target.checked)}
                  className="rounded border-gold/30"
                />
                Plinten inclusief (+€4,50/m²)
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={trap}
                  onChange={(e) => setTrap(e.target.checked)}
                  className="rounded border-gold/30"
                />
                Traprenovatie
              </label>
            </div>

            {/* Aantal treden (alleen als trap checked) */}
            {trap && (
              <div>
                <label className="mb-1 block text-xs text-muted">Aantal treden</label>
                <input
                  type="number"
                  value={aantalTreden}
                  onChange={(e) => setAantalTreden(e.target.value)}
                  placeholder="Bijv. 14"
                  className="w-full rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Resultaat */}
          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-gold">
              Berekening
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Vloer ({VLOER_TARIEVEN[vloerType].label})</span>
                <span>€ {formatEuro(basisPrijs)}</span>
              </div>
              {ondergrondToeslag > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Ondergrond toeslag</span>
                  <span>€ {formatEuro(ondergrondPrijs)}</span>
                </div>
              )}
              {egalisatie && (
                <div className="flex justify-between">
                  <span className="text-muted">Egalisatie</span>
                  <span>€ {formatEuro(egalisatiePrijs)}</span>
                </div>
              )}
              {plinten && (
                <div className="flex justify-between">
                  <span className="text-muted">Plinten</span>
                  <span>€ {formatEuro(plintenPrijs)}</span>
                </div>
              )}
              {trap && (
                <div className="flex justify-between">
                  <span className="text-muted">Traprenovatie</span>
                  <span>€ {formatEuro(trapPrijs)}</span>
                </div>
              )}
              <div className="border-t border-gold/10 pt-2">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotaal excl. BTW</span>
                  <span className="font-medium">€ {formatEuro(totaal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">BTW (21%)</span>
                  <span>€ {formatEuro(btw)}</span>
                </div>
              </div>
              <div className="border-t border-gold/10 pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gold">Totaal incl. BTW</span>
                  <span className="text-gold">€ {formatEuro(totaalIncl)}</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted/60">
              Dit is een indicatie. Neem contact op voor een exacte offerte op maat.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
