"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useState } from "react";
import { formatEuro } from "@/lib/utils";
import { C } from "@/lib/landing/colors";

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

  const inp = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", outline: "none", boxSizing: "border-box" as const };
  const lbl = { display: "block", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, marginBottom: 5 };
  const row = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", fontSize: "0.68rem" };
  const card = { background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "20px 22px" };

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Tool</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Calculator</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {/* Inputs */}
          <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase" }}>Projectgegevens</div>

            <div><label style={lbl}>Vloertype</label>
              <select value={vloerType} onChange={(e) => setVloerType(e.target.value)} style={inp}>
                {Object.entries(VLOER_TARIEVEN).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>

            <div><label style={lbl}>Oppervlakte (m²)</label>
              <input type="number" value={oppervlakte} onChange={(e) => setOppervlakte(e.target.value)} placeholder="Bijv. 45" style={inp} />
            </div>

            <div><label style={lbl}>Ondergrond</label>
              <select value={ondergrond} onChange={(e) => setOndergrond(e.target.value)} style={inp}>
                <option value="beton">Beton (+€0/m²)</option>
                <option value="hout">Houten ondergrond (+€0/m²)</option>
                <option value="tegels">Tegels (+€8/m²)</option>
                <option value="oude_vloer">Oude vloer verwijderen (+€12/m²)</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
              {[
                { label: "Egalisatie noodzakelijk (+€12/m²)", checked: egalisatie, set: setEgalisatie },
                { label: "Plinten inclusief (+€4,50/m²)", checked: plinten, set: setPlinten },
                { label: "Traprenovatie", checked: trap, set: setTrap },
              ].map(({ label, checked, set }) => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.68rem", color: C.white, cursor: "pointer" }}>
                  <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)}
                    style={{ accentColor: C.gold, width: 14, height: 14 }} />
                  {label}
                </label>
              ))}
            </div>

            {trap && (
              <div><label style={lbl}>Aantal treden</label>
                <input type="number" value={aantalTreden} onChange={(e) => setAantalTreden(e.target.value)} placeholder="Bijv. 14" style={inp} />
              </div>
            )}
          </div>

          {/* Resultaat */}
          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>Berekening</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={row}><span style={{ color: C.dim }}>Vloer ({VLOER_TARIEVEN[vloerType].label})</span><span style={{ color: C.white }}>€ {formatEuro(basisPrijs)}</span></div>
              {ondergrondToeslag > 0 && <div style={row}><span style={{ color: C.dim }}>Ondergrond toeslag</span><span style={{ color: C.white }}>€ {formatEuro(ondergrondPrijs)}</span></div>}
              {egalisatie && <div style={row}><span style={{ color: C.dim }}>Egalisatie</span><span style={{ color: C.white }}>€ {formatEuro(egalisatiePrijs)}</span></div>}
              {plinten && <div style={row}><span style={{ color: C.dim }}>Plinten</span><span style={{ color: C.white }}>€ {formatEuro(plintenPrijs)}</span></div>}
              {trap && <div style={row}><span style={{ color: C.dim }}>Traprenovatie</span><span style={{ color: C.white }}>€ {formatEuro(trapPrijs)}</span></div>}

              <div style={{ borderTop: `1px solid ${C.bdr}`, marginTop: 8, paddingTop: 10 }}>
                <div style={row}><span style={{ color: C.dim }}>Subtotaal excl. BTW</span><span style={{ color: C.white }}>€ {formatEuro(totaal)}</span></div>
                <div style={row}><span style={{ color: C.dim }}>BTW (21%)</span><span style={{ color: C.white }}>€ {formatEuro(btw)}</span></div>
              </div>
              <div style={{ borderTop: `1px solid ${C.bdr}`, marginTop: 8, paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.6rem", letterSpacing: 1.5, color: C.gold, textTransform: "uppercase" }}>Totaal incl. BTW</span>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", color: C.gold }}>€ {formatEuro(totaalIncl)}</span>
                </div>
              </div>
            </div>

            <p style={{ marginTop: 16, fontSize: "0.56rem", color: C.dim }}>
              Dit is een indicatie. Neem contact op voor een exacte offerte op maat.
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
