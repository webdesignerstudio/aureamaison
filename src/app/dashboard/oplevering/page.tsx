"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { C } from "@/lib/landing/colors";
import type { Order } from "@/types";

const CHECKS: { id: string; label: string; cat: string }[] = [
  { id: "schoon", label: "Werkplek achtergelaten zoals gevonden", cat: "Opruimen" },
  { id: "restvlakken", label: "Restvlakken netjes afgewerkt", cat: "Afwerking" },
  { id: "plinten", label: "Plinten gemonteerd en recht", cat: "Afwerking" },
  { id: "overgangen", label: "Overgangen / drempelprofielen geplaatst", cat: "Afwerking" },
  { id: "fotos", label: "Foto's gemaakt van afgewerkte vloer", cat: "Documentatie" },
  { id: "klantakkoord", label: "Klant heeft de vloer geïnspecteerd", cat: "Goedkeuring" },
  { id: "handtekening", label: "Opleverformulier ondertekend", cat: "Goedkeuring" },
  { id: "materiaal", label: "Restmateriaal meegenomen of opgeslagen", cat: "Opruimen" },
  { id: "garantie", label: "Garantiebewijs overhandigd", cat: "Documentatie" },
];

export default function OpleveringPage() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.company_id);
  const updateOrder = useUpdateOrder();

  const [selectedId, setSelectedId] = useState<string>("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const opleverOrders = orders.filter((o) =>
    ["ter goedkeuring", "gepland", "bezig"].includes((o.status || "").toLowerCase())
  );
  const afgOrders = orders.filter((o) => (o.status || "").toLowerCase() === "afgerond");

  const selected = orders.find((o) => o.id === selectedId) as Order | undefined;
  const completedChecks = Object.values(checks).filter(Boolean).length;
  const allDone = CHECKS.length > 0 && completedChecks === CHECKS.length;

  const handleOpleveren = async () => {
    if (!selected || !allDone) return;
    setSaving(true);
    await updateOrder.mutateAsync({ id: selected.id, status: "afgerond", legger_afgerond_at: new Date().toISOString() });
    setSaving(false);
    setDone(true);
    setChecks({});
    setSelectedId("");
    setTimeout(() => setDone(false), 3000);
  };

  const cats = [...new Set(CHECKS.map((c) => c.cat))];

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Kwaliteit</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Oplever <em style={{ fontStyle: "italic", color: C.goldL }}>Formulier</em>
          </h1>
          <p style={{ fontSize: "0.65rem", color: C.dim, marginTop: 6, lineHeight: 1.6 }}>
            Doorloop de checklist en lever de klus formeel op bij de klant.
          </p>
        </div>

        {done && (
          <div style={{ padding: "14px 18px", background: "rgba(60,184,122,.1)", border: "1px solid rgba(60,184,122,.3)", borderRadius: 10, marginBottom: 20, color: C.green, fontSize: "0.72rem" }}>
            ✅ Klus succesvol opgeleverd en status bijgewerkt naar <strong>Afgerond</strong>.
          </div>
        )}

        {/* Order selectie */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.52rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>Selecteer klus</div>
          {opleverOrders.length === 0 ? (
            <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "20px 18px", color: C.muted, fontSize: "0.72rem", textAlign: "center" }}>
              Geen klussen klaar voor oplevering (status: ter goedkeuring, gepland, bezig)
            </div>
          ) : opleverOrders.map((o) => {
            const isSelected = selectedId === o.id;
            return (
              <div key={o.id} onClick={() => { setSelectedId(isSelected ? "" : o.id); setChecks({}); }}
                style={{ background: isSelected ? "rgba(198,165,107,.08)" : C.deep, border: `1px solid ${isSelected ? C.gold + "55" : C.bdr}`, borderRadius: 10, padding: "14px 18px", marginBottom: 8, cursor: "pointer", transition: "all .2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.white, marginBottom: 2 }}>{o.client_name}</div>
                    <div style={{ fontSize: "0.62rem", color: C.muted }}>
                      {o.vloer_type && <span style={{ marginRight: 8 }}>🪵 {o.vloer_type}</span>}
                      {o.oppervlakte && <span style={{ marginRight: 8 }}>📐 {o.oppervlakte} m²</span>}
                      {o.straat && <span>📍 {o.straat}{o.plaats ? `, ${o.plaats}` : ""}</span>}
                    </div>
                    {o.legger_naam && <div style={{ fontSize: "0.6rem", color: C.green, marginTop: 3 }}>🔨 {o.legger_naam}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.56rem", padding: "3px 10px", borderRadius: 99, background: "rgba(198,165,107,.12)", color: C.gold, fontWeight: 700 }}>{o.status}</span>
                    {o.price && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem", color: C.gold, marginTop: 4 }}>€ {Number(o.price).toLocaleString("nl-NL")}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checklist */}
        {selected && (
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase" }}>Oplever checklist — {selected.client_name}</div>
              <div style={{ fontSize: "0.7rem", color: allDone ? C.green : C.muted }}>
                {completedChecks}/{CHECKS.length}
                <div style={{ width: 80, height: 4, background: "rgba(255,255,255,.08)", borderRadius: 99, marginTop: 4 }}>
                  <div style={{ height: "100%", width: `${completedChecks / CHECKS.length * 100}%`, background: allDone ? `linear-gradient(90deg,${C.green},#2da86d)` : `linear-gradient(90deg,${C.gold},${C.gold}aa)`, borderRadius: 99, transition: "width .3s" }} />
                </div>
              </div>
            </div>

            {cats.map((cat) => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>{cat}</div>
                {CHECKS.filter((c) => c.cat === cat).map((c) => (
                  <div key={c.id} onClick={() => setChecks((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", background: checks[c.id] ? "rgba(60,184,122,.06)" : "rgba(255,255,255,.02)", border: `1px solid ${checks[c.id] ? "rgba(60,184,122,.3)" : "rgba(255,255,255,.05)"}`, borderRadius: 7, marginBottom: 6, cursor: "pointer", transition: "all .2s" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checks[c.id] ? C.green : C.bdr}`, background: checks[c.id] ? "rgba(60,184,122,.2)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                      {checks[c.id] && <span style={{ fontSize: 11, color: C.green }}>✓</span>}
                    </div>
                    <span style={{ fontSize: "0.68rem", color: checks[c.id] ? C.white : C.muted, transition: "color .2s" }}>{c.label}</span>
                  </div>
                ))}
              </div>
            ))}

            <button onClick={handleOpleveren} disabled={!allDone || saving}
              style={{ width: "100%", padding: "12px", background: allDone ? "rgba(60,184,122,.12)" : "rgba(255,255,255,.04)", border: `1px solid ${allDone ? "rgba(60,184,122,.4)" : C.bdr}`, color: allDone ? C.green : C.dim, fontSize: "0.62rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: allDone ? "pointer" : "not-allowed", borderRadius: 8, transition: "all .3s", marginTop: 4 }}>
              {saving ? "Opleveren…" : allDone ? "✓ Klus opleveren → Afgerond" : `Vink alle ${CHECKS.length} punten aan om op te leveren`}
            </button>
          </div>
        )}

        {/* Recent afgerond */}
        {afgOrders.length > 0 && (
          <div>
            <div style={{ fontSize: "0.52rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 10 }}>Recent afgerond ({afgOrders.length})</div>
            {afgOrders.slice(0, 5).map((o) => (
              <div key={o.id} style={{ background: C.deep, border: `1px solid rgba(60,184,122,.15)`, borderRadius: 9, padding: "12px 16px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.74rem", color: C.white, marginBottom: 2 }}>{o.client_name}</div>
                  <div style={{ fontSize: "0.6rem", color: C.dim }}>{o.vloer_type}{o.oppervlakte ? ` · ${o.oppervlakte} m²` : ""}{o.legger_naam ? ` · 🔨 ${o.legger_naam}` : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.56rem", padding: "2px 8px", borderRadius: 99, background: "rgba(60,184,122,.12)", color: C.green, fontWeight: 700 }}>AFGEROND</div>
                  {o.legger_afgerond_at && <div style={{ fontSize: "0.52rem", color: C.dim, marginTop: 3 }}>{new Date(o.legger_afgerond_at).toLocaleDateString("nl-NL")}</div>}
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
