"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useLeggers } from "@/hooks/use-leggers";
import { C } from "@/lib/landing/colors";

const eur = (v: number) =>
  v > 0 ? `€ ${v.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—";

function StatCard({ label, value, color = C.gold, sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: "0.5rem", color: C.dim, letterSpacing: 1, marginTop: 2 }}>{sub}</div>}
      <div style={{ fontSize: "0.46rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function StatistiekenPage() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.company_id);
  const { data: leggers = [] } = useLeggers(user?.company_id);

  const [periode, setPeriode] = useState("6m");
  const [subView, setSubView] = useState("overzicht");

  const days: Record<string, number> = { "1m": 30, "3m": 90, "6m": 180, "1j": 365 };
  const filtered = orders.filter((o) => {
    if (periode === "alles") return true;
    const grens = new Date(Date.now() - (days[periode] || 180) * 86400000);
    return o.created_at ? new Date(o.created_at) >= grens : true;
  });

  const filtOmzet = filtered.filter((o) => (o.status || "").toLowerCase() === "afgerond" && o.price).reduce((s, o) => s + (Number(o.price) || 0), 0);
  const filtBetaald = filtered.filter((o) => o.invoice_paid && o.price).reduce((s, o) => s + (Number(o.price) || 0), 0);
  const filtAfgerond = filtered.filter((o) => (o.status || "").toLowerCase() === "afgerond").length;
  const filtLopend = filtered.filter((o) => ["in behandeling", "gepland", "bezig"].includes((o.status || "").toLowerCase())).length;

  // Maanden grafiek
  const aantalMnd = { "1m": 1, "3m": 3, "6m": 6, "1j": 12, "alles": 12 }[periode] || 6;
  const maanden = Array.from({ length: Math.min(aantalMnd, 12) }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (aantalMnd - 1 - i));
    const k = d.toISOString().slice(0, 7);
    const v = filtered.filter((o) => (o.status || "").toLowerCase() === "afgerond" && (o.created_at || "").startsWith(k)).reduce((s, o) => s + (Number(o.price) || 0), 0);
    return { l: d.toLocaleDateString("nl-NL", { month: "short" }), v };
  });
  const maxM = Math.max(...maanden.map((m) => m.v), 1);

  // Vloertype telling
  const vloerMap: Record<string, number> = {};
  filtered.forEach((o) => { if (o.vloer_type) vloerMap[o.vloer_type] = (vloerMap[o.vloer_type] || 0) + 1; });
  const vloerEntries = Object.entries(vloerMap).sort((a, b) => b[1] - a[1]);
  const maxVloer = Math.max(...vloerEntries.map((e) => e[1]), 1);

  // Legger stats
  const leggerStats = leggers.map((l) => {
    const lOrders = filtered.filter((o) => o.legger_id === l.id && (o.status || "").toLowerCase() === "afgerond");
    const omzet = lOrders.reduce((s, o) => s + (Number(o.price) || 0), 0);
    return { ...l, klussen: lOrders.length, omzet };
  }).filter((l) => l.klussen > 0).sort((a, b) => b.omzet - a.omzet);

  const betaalPct = filtOmzet > 0 ? Math.round((filtBetaald / filtOmzet) * 100) : 0;

  const exportCSV = () => {
    const rows = [
      ["Klant", "Vloertype", "m²", "Status", "Prijs", "Legger", "Datum"],
      ...filtered.map((o) => [
        o.client_name || "", o.vloer_type || "", o.oppervlakte || "", o.status || "",
        o.price || "", o.legger_naam || "", o.created_at ? new Date(o.created_at).toLocaleDateString("nl-NL") : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv);
    a.download = `aurea-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "0.56rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Analyse</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
              Statistieken & <em style={{ fontStyle: "italic", color: C.goldL }}>Inzichten</em>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.52rem", color: C.dim, marginRight: 4, letterSpacing: 1 }}>PERIODE:</span>
            {[["1m", "1 mnd"], ["3m", "3 mnd"], ["6m", "6 mnd"], ["1j", "1 jaar"], ["alles", "Alles"]].map(([v, l]) => (
              <button key={v} onClick={() => setPeriode(v)}
                style={{ padding: "6px 10px", borderRadius: 6, fontSize: "0.54rem", fontWeight: 600, cursor: "pointer", background: periode === v ? "rgba(198,165,107,.15)" : "transparent", border: `1px solid ${periode === v ? C.gold : C.bdr}`, color: periode === v ? C.gold : C.muted, transition: "all .2s" }}>
                {l}
              </button>
            ))}
            <button onClick={exportCSV} style={{ padding: "6px 10px", borderRadius: 6, fontSize: "0.54rem", fontWeight: 600, cursor: "pointer", background: "rgba(60,184,122,.08)", border: "1px solid rgba(60,184,122,.25)", color: C.green, marginLeft: 4 }}>
              ↓ CSV
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.bdr}`, marginBottom: 18 }}>
          {[["overzicht", "📊 Overzicht"], ["leggers", "👷 Leggers"], ["vloertypes", "🪵 Vloertypes"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setSubView(id)}
              style={{ padding: "10px 14px", fontSize: "0.56rem", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: subView === id ? C.white : C.muted, background: "none", border: "none", cursor: "pointer", borderBottom: subView === id ? `2px solid ${C.gold}` : "2px solid transparent", marginBottom: -1 }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* ── OVERZICHT ── */}
        {subView === "overzicht" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 14 }}>
              <StatCard label="Omzet (afgerond)" value={eur(filtOmzet)} color={C.gold} />
              <StatCard label="Ontvangen" value={eur(filtBetaald)} color={C.green} />
              <StatCard label="Totaal orders" value={filtered.length} color={C.white} />
              <StatCard label="Afgerond" value={filtAfgerond} color={C.green} />
              <StatCard label="Lopend" value={filtLopend} color={C.blue} />
            </div>

            {/* Bar chart */}
            <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "20px 22px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase" }}>Omzet per maand</div>
                <div style={{ fontSize: "0.6rem", color: C.muted }}>Totaal: <strong style={{ color: C.goldL }}>{eur(filtOmzet)}</strong></div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
                {maanden.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: "0.48rem", color: C.gold, height: 14, textAlign: "center" }}>{m.v > 0 ? `€${Math.round(m.v / 1000)}k` : ""}</div>
                    <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: m.v > 0 ? `linear-gradient(180deg,${C.gold},${C.gold}66)` : "rgba(255,255,255,.04)", height: Math.max(m.v / maxM * 88, m.v > 0 ? 4 : 2) + "px", transition: "height .5s" }} />
                    <div style={{ fontSize: "0.46rem", color: C.dim, whiteSpace: "nowrap" }}>{m.l}</div>
                  </div>
                ))}
              </div>
              {filtOmzet > 0 && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,.02)", borderRadius: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: C.muted, marginBottom: 5 }}>
                    <span>Betaalpercentage</span><span style={{ color: C.white }}>{betaalPct}%</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,.06)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: betaalPct + "%", background: `linear-gradient(90deg,${C.green},#2da86d)`, borderRadius: 99, transition: "width .6s" }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LEGGERS ── */}
        {subView === "leggers" && (
          <div>
            {leggerStats.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: C.dim }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>👷</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.muted }}>Geen legger-data voor deze periode</div>
              </div>
            ) : leggerStats.map((l, i) => (
              <div key={l.id} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 18px", marginBottom: 8, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(198,165,107,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: C.gold, fontWeight: 700, flexShrink: 0 }}>#{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.78rem", color: C.white, fontWeight: 600, marginBottom: 2 }}>{l.naam}</div>
                  <div style={{ fontSize: "0.6rem", color: C.muted }}>{l.klussen} {l.klussen === 1 ? "klus" : "klussen"} afgerond</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", color: C.gold }}>{eur(l.omzet)}</div>
                  <div style={{ fontSize: "0.5rem", color: C.dim, letterSpacing: 1, textTransform: "uppercase" }}>omzet</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── VLOERTYPES ── */}
        {subView === "vloertypes" && (
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "20px 22px" }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>Opdrachten per vloertype</div>
            {vloerEntries.length === 0 ? (
              <div style={{ color: C.muted, fontSize: "0.72rem", padding: "20px 0" }}>Geen vloertype-data beschikbaar</div>
            ) : vloerEntries.map(([type, count]) => (
              <div key={type} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.66rem", color: C.white, marginBottom: 5 }}>
                  <span>{type}</span>
                  <span style={{ color: C.gold }}>{count}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,.06)", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${count / maxVloer * 100}%`, background: `linear-gradient(90deg,${C.gold},${C.gold}99)`, borderRadius: 99, transition: "width .6s" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes slideUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:translateY(0) } }`}</style>
    </DashboardLayout>
  );
}
