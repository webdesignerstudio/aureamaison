"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useLeggers } from "@/hooks/use-leggers";
import { C } from "@/lib/landing/colors";

const eur = (v: number) => v > 0 ? `€ ${v.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

export default function UitbetalingenPage() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.company_id);
  const { data: leggers = [] } = useLeggers(user?.company_id);
  const [selectedLegger, setSelectedLegger] = useState<string | null>(null);

  const getLeggerStats = (leggerId: string) => {
    const afgOrders = orders.filter(
      (o) => o.legger_id === leggerId && (o.status || "").toLowerCase() === "afgerond" && o.legger_prijs
    );
    const bruto = afgOrders.reduce((s, o) => s + (Number(o.legger_prijs) || 0), 0);
    return { bruto, klussen: afgOrders.length, orders: afgOrders };
  };

  const totaalVerschuldigd = leggers.reduce((s, l) => s + getLeggerStats(l.id).bruto, 0);
  const leggersMet = leggers.filter((l) => getLeggerStats(l.id).klussen > 0);
  const selected = leggersMet.find((l) => l.id === selectedLegger);
  const selectedStats = selected ? getLeggerStats(selected.id) : null;

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Financieel</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Legger <em style={{ fontStyle: "italic", color: C.goldL }}>Uitbetalingen</em>
          </h1>
        </div>

        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "rgba(224,90,90,.06)", border: "1px solid rgba(224,90,90,.2)", borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: "0.52rem", letterSpacing: 1, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>Totaal verschuldigd</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color: C.red, fontWeight: 300 }}>{eur(totaalVerschuldigd)}</div>
          </div>
          <div style={{ background: "rgba(60,184,122,.06)", border: "1px solid rgba(60,184,122,.2)", borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: "0.52rem", letterSpacing: 1, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>Actieve leggers met klussen</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color: C.green, fontWeight: 300 }}>{leggersMet.length}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* Legger lijst */}
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ fontSize: "0.52rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>Leggers</div>
            {leggers.length === 0 ? (
              <div style={{ color: C.muted, fontSize: "0.72rem", padding: "12px 0" }}>Geen leggers gevonden</div>
            ) : leggers.map((l) => {
              const stats = getLeggerStats(l.id);
              const isSelected = selectedLegger === l.id;
              return (
                <div key={l.id} onClick={() => setSelectedLegger(isSelected ? null : l.id)}
                  style={{ background: isSelected ? "rgba(198,165,107,.08)" : C.deep, border: `1px solid ${isSelected ? C.gold + "44" : C.bdr}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8, cursor: "pointer", transition: "all .2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.78rem", color: C.white, fontWeight: 600, marginBottom: 2 }}>{l.naam}</div>
                      <div style={{ fontSize: "0.6rem", color: C.muted }}>{stats.klussen} klus{stats.klussen !== 1 ? "sen" : ""} afgerond</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: stats.bruto > 0 ? C.orange : C.dim }}>{eur(stats.bruto)}</div>
                      <div style={{ fontSize: "0.48rem", letterSpacing: 1, color: C.dim, textTransform: "uppercase" }}>vergoeding</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail */}
          {selected && selectedStats && (
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>Detail — {selected.naam}</div>
              <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    ["Bruto vergoeding", eur(selectedStats.bruto), C.orange],
                    ["Klussen", selectedStats.klussen, C.white],
                    ["Tarief", selected.tarief ? `€ ${selected.tarief}/m²` : "—", C.muted],
                    ["IBAN", selected.iban || "—", C.muted],
                  ].map(([l, v, c]) => (
                    <div key={l as string} style={{ padding: "8px 10px", background: "rgba(255,255,255,.02)", borderRadius: 6 }}>
                      <div style={{ fontSize: "0.48rem", letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: "0.78rem", color: c as string, fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "0.52rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 8 }}>Afgeronde klussen</div>
                {selectedStats.orders.map((o) => (
                  <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,.04)`, fontSize: "0.64rem" }}>
                    <div>
                      <div style={{ color: C.white }}>{o.client_name}</div>
                      <div style={{ color: C.dim, marginTop: 1 }}>{o.vloer_type}{o.oppervlakte ? ` · ${o.oppervlakte} m²` : ""}</div>
                    </div>
                    <div style={{ color: C.gold, fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem" }}>{eur(Number(o.legger_prijs))}</div>
                  </div>
                ))}
              </div>
              {selected.telefoon && (
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={`tel:${selected.telefoon}`} style={{ flex: 1, padding: "9px 0", background: "rgba(198,165,107,.08)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.gold, fontSize: "0.6rem", textAlign: "center", textDecoration: "none", letterSpacing: 1 }}>📞 Bel</a>
                  {selected.email && <a href={`mailto:${selected.email}`} style={{ flex: 1, padding: "9px 0", background: "rgba(74,158,232,.06)", border: "1px solid rgba(74,158,232,.2)", borderRadius: 7, color: C.blue, fontSize: "0.6rem", textAlign: "center", textDecoration: "none", letterSpacing: 1 }}>✉ E-mail</a>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:translateY(0) } }`}</style>
    </DashboardLayout>
  );
}
