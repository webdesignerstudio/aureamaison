"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { C } from "@/lib/landing/colors";

const DIENST_CATALOG: { categorie: string; emoji: string; items: { naam: string; label: string; prijs: number; eenheid: string; sub: string }[] }[] = [
  {
    categorie: "Laminaat",
    emoji: "🪵",
    items: [
      { naam: "Laminaat standaard", label: "7–8mm AC4", prijs: 18.5, eenheid: "m²", sub: "Inclusief ondervloer en plinten" },
      { naam: "Laminaat premium", label: "10–12mm AC5", prijs: 24.5, eenheid: "m²", sub: "Waterbestendig, extra duurzaam" },
    ],
  },
  {
    categorie: "PVC / Vinyl",
    emoji: "🔲",
    items: [
      { naam: "PVC click", label: "4–5mm LVT", prijs: 22, eenheid: "m²", sub: "100% waterdicht, verwarming geschikt" },
      { naam: "PVC lijm", label: "2–3mm LVT", prijs: 19.5, eenheid: "m²", sub: "Dun profiel, geschikt voor renovatie" },
    ],
  },
  {
    categorie: "Parket",
    emoji: "✨",
    items: [
      { naam: "Engineered parket", label: "15mm 3-laags", prijs: 38, eenheid: "m²", sub: "Eiken, geschikt voor vloerverwarming" },
      { naam: "Massief parket", label: "18–22mm", prijs: 55, eenheid: "m²", sub: "Meerdere keren schuurbaar" },
    ],
  },
  {
    categorie: "Traprenovatie",
    emoji: "🪜",
    items: [
      { naam: "Traprenovatie compleet", label: "Per trede", prijs: 45, eenheid: "trede", sub: "Inclusief neus en stootbord" },
      { naam: "Trapbekleding stof", label: "Per trede", prijs: 35, eenheid: "trede", sub: "Inclusief aftimmering" },
    ],
  },
  {
    categorie: "Extra",
    emoji: "🛠",
    items: [
      { naam: "Egaliseren", label: "Per m²", prijs: 8, eenheid: "m²", sub: "Cement/anhydriet ondergrond vlak maken" },
      { naam: "Ondervloer", label: "Per m²", prijs: 3.5, eenheid: "m²", sub: "Geluids- en vochtwerend" },
      { naam: "MDF Plinten", label: "Per strekkende meter", prijs: 4.2, eenheid: "m¹", sub: "Inclusief plaatsing en afdichting" },
    ],
  },
];

export default function ProductenPage() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [activeCategorie, setActiveCategorie] = useState<string | null>(null);

  const getPrice = (naam: string, defaultPrijs: number) =>
    prices[naam] !== undefined ? prices[naam] : defaultPrijs;

  const startEdit = (naam: string, current: number) => {
    setEditKey(naam);
    setEditVal(String(current));
  };

  const saveEdit = (naam: string) => {
    const val = parseFloat(editVal);
    if (!isNaN(val) && val > 0) setPrices((p) => ({ ...p, [naam]: val }));
    setEditKey(null);
  };

  const eur = (v: number) => v.toLocaleString("nl-NL", { minimumFractionDigits: 2 });

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Beheer</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
              Product <em style={{ fontStyle: "italic", color: C.goldL }}>Catalogus</em>
            </h1>
            <p style={{ fontSize: "0.65rem", color: C.dim, marginTop: 6 }}>
              Referentieprijzen voor offertes en calculaties. Klik op een prijs om aan te passen.
            </p>
          </div>
        </div>

        {/* Categorie filter pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <button onClick={() => setActiveCategorie(null)}
            style={{ padding: "6px 16px", borderRadius: 99, border: `1px solid ${!activeCategorie ? C.gold : C.bdr}`, background: !activeCategorie ? "rgba(198,165,107,.12)" : "transparent", color: !activeCategorie ? C.gold : C.muted, fontSize: "0.6rem", fontWeight: !activeCategorie ? 700 : 400, cursor: "pointer", letterSpacing: 1.5, textTransform: "uppercase" }}>
            Alles
          </button>
          {DIENST_CATALOG.map((d) => (
            <button key={d.categorie} onClick={() => setActiveCategorie(activeCategorie === d.categorie ? null : d.categorie)}
              style={{ padding: "6px 16px", borderRadius: 99, border: `1px solid ${activeCategorie === d.categorie ? C.gold : C.bdr}`, background: activeCategorie === d.categorie ? "rgba(198,165,107,.12)" : "transparent", color: activeCategorie === d.categorie ? C.gold : C.muted, fontSize: "0.6rem", fontWeight: activeCategorie === d.categorie ? 700 : 400, cursor: "pointer", letterSpacing: 1.5, textTransform: "uppercase" }}>
              {d.emoji} {d.categorie}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {DIENST_CATALOG.filter((d) => !activeCategorie || d.categorie === activeCategorie).map((dienst) => (
            <div key={dienst.categorie} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.2rem" }}>{dienst.emoji}</span>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", color: C.goldL }}>{dienst.categorie}</div>
                <span style={{ fontSize: "0.56rem", color: C.muted }}>{dienst.items.length} product{dienst.items.length !== 1 ? "en" : ""}</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Product", "Specificatie", "Omschrijving", "Eenheid", "Prijs"].map((h, i) => (
                        <th key={h} style={{ padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", fontWeight: 600, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dienst.items.map((item) => {
                      const currentPrice = getPrice(item.naam, item.prijs);
                      const isEditing = editKey === item.naam;
                      const isCustom = prices[item.naam] !== undefined;
                      return (
                        <tr key={item.naam} style={{ borderTop: `1px solid rgba(255,255,255,.04)` }}>
                          <td style={{ padding: "12px 14px", fontSize: "0.72rem", color: C.white, fontWeight: 500 }}>{item.naam}</td>
                          <td style={{ padding: "12px 14px", fontSize: "0.62rem", color: C.gold }}>{item.label}</td>
                          <td style={{ padding: "12px 14px", fontSize: "0.62rem", color: C.dim, maxWidth: 240 }}>{item.sub}</td>
                          <td style={{ padding: "12px 14px", fontSize: "0.62rem", color: C.muted }}>{item.eenheid}</td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            {isEditing ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                                <span style={{ fontSize: "0.7rem", color: C.muted }}>€</span>
                                <input
                                  type="number"
                                  value={editVal}
                                  onChange={(e) => setEditVal(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item.naam); if (e.key === "Escape") setEditKey(null); }}
                                  autoFocus
                                  style={{ width: 70, padding: "4px 8px", background: "rgba(255,255,255,.08)", border: `1px solid ${C.gold}`, borderRadius: 5, color: C.white, fontSize: "0.72rem", outline: "none", textAlign: "right" }}
                                />
                                <button onClick={() => saveEdit(item.naam)} style={{ padding: "3px 8px", background: "rgba(60,184,122,.1)", border: "1px solid rgba(60,184,122,.3)", color: C.green, borderRadius: 5, fontSize: "0.6rem", cursor: "pointer" }}>✓</button>
                                <button onClick={() => setEditKey(null)} style={{ padding: "3px 8px", background: "none", border: `1px solid ${C.bdr}`, color: C.muted, borderRadius: 5, fontSize: "0.6rem", cursor: "pointer" }}>✕</button>
                              </div>
                            ) : (
                              <button onClick={() => startEdit(item.naam, currentPrice)}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 5, transition: "background .15s" }}
                                title="Klik om prijs aan te passen">
                                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: isCustom ? C.green : C.gold }}>
                                  € {eur(currentPrice)}
                                </span>
                                <span style={{ fontSize: "0.52rem", color: C.dim, marginLeft: 4 }}>/{item.eenheid}</span>
                                {isCustom && <span style={{ fontSize: "0.5rem", color: C.green, marginLeft: 6 }}>✎</span>}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(74,158,232,.06)", border: "1px solid rgba(74,158,232,.2)", borderRadius: 8, fontSize: "0.65rem", color: C.dim, lineHeight: 1.7 }}>
          💡 Aangepaste prijzen worden lokaal bijgehouden. Koppel later aan Supabase voor permanente opslag.
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
