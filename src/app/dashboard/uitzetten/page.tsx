"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { useLeggers } from "@/hooks/use-leggers";
import { C } from "@/lib/landing/colors";
import type { Order, Legger } from "@/types";

export default function UitzettenPage() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.company_id);
  const { data: leggers = [] } = useLeggers(user?.company_id);
  const updateOrder = useUpdateOrder();

  const [step, setStep] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedLegger, setSelectedLegger] = useState<Legger | null>(null);
  const [vergoeding, setVergoeding] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const openOrders = orders.filter((o) =>
    !o.legger_id && !["afgerond", "afgewezen"].includes((o.status || "").toLowerCase())
  );
  const assignedOrders = orders.filter((o) =>
    o.legger_id && !["afgerond", "afgewezen"].includes((o.status || "").toLowerCase())
  );
  const activeLeggers = leggers.filter((l) => l.status === "actief");

  const handleConfirm = async () => {
    if (!selectedOrder || !selectedLegger) return;
    setSaving(true);
    await updateOrder.mutateAsync({
      id: selectedOrder.id,
      legger_id: selectedLegger.id,
      legger_naam: selectedLegger.naam,
      legger_prijs: vergoeding ? parseFloat(vergoeding) : undefined,
      notes: note || undefined,
      status: "gepland",
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setStep(1);
      setSelectedOrder(null);
      setSelectedLegger(null);
      setVergoeding("");
      setNote("");
    }, 3000);
  };

  const stepStyle = (s: number) => ({
    display: "flex" as const, alignItems: "center" as const, gap: 8, padding: "8px 12px", borderRadius: 8,
    background: step === s ? "rgba(74,158,232,.12)" : step > s ? "rgba(60,184,122,.08)" : "transparent",
    border: `1px solid ${step === s ? "rgba(74,158,232,.4)" : step > s ? "rgba(60,184,122,.3)" : "rgba(255,255,255,.08)"}`,
    cursor: step > s ? "pointer" as const : "default" as const, flexShrink: 0, transition: "all .2s",
  });

  const inp = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", boxSizing: "border-box" as const };

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.56rem", letterSpacing: 4, color: C.blue, textTransform: "uppercase", marginBottom: 4 }}>Klus toewijzing</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            🔨 Klus <em style={{ fontStyle: "italic", color: C.goldL }}>Uitzetten</em>
          </h1>
          <p style={{ fontSize: "0.72rem", color: C.muted, marginTop: 6 }}>Kies een opdracht en wijs een legger toe.</p>
        </div>

        {success && (
          <div style={{ padding: "14px 18px", background: "rgba(60,184,122,.1)", border: "1px solid rgba(60,184,122,.3)", borderRadius: 10, marginBottom: 20, color: C.green, fontSize: "0.72rem" }}>
            ✅ <strong>{selectedOrder?.client_name}</strong> is toegewezen aan <strong>{selectedLegger?.naam}</strong> en status is bijgewerkt naar <strong>Gepland</strong>.
          </div>
        )}

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
          {["Kies klus", "Kies legger", "Details & bevestigen"].map((lbl, i) => {
            const s = i + 1;
            const done = step > s;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : undefined }}>
                <div style={stepStyle(s)} onClick={() => { if (done) setStep(s); }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: step === s ? C.blue : done ? C.green : "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                    {done ? "✓" : s}
                  </div>
                  <span style={{ fontSize: "0.58rem", color: step === s ? C.blue : done ? C.green : C.dim, letterSpacing: 1, whiteSpace: "nowrap" }}>{lbl}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, background: done ? "rgba(60,184,122,.3)" : "rgba(255,255,255,.08)", margin: "0 4px" }} />}
              </div>
            );
          })}
        </div>

        {/* ── STAP 1 ── */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: "0.58rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Stap 1 — Kies een klus om uit te zetten</div>

            {openOrders.length > 0 && (
              <>
                <div style={{ fontSize: "0.54rem", letterSpacing: 2, color: C.orange, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 20, height: 1, background: C.bdr, display: "block" }} />⏳ Zonder legger ({openOrders.length})
                </div>
                {openOrders.map((o) => (
                  <div key={o.id} onClick={() => { setSelectedOrder(o); setVergoeding(o.budget ? String(o.budget * 0.4) : ""); setStep(2); }}
                    style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "16px 18px", marginBottom: 8, cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = C.gold}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = C.bdr}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.white, marginBottom: 3 }}>{o.client_name}</div>
                        <div style={{ fontSize: "0.62rem", color: C.muted }}>{o.straat}{o.plaats ? `, ${o.plaats}` : ""}</div>
                        <div style={{ fontSize: "0.62rem", color: C.dim, marginTop: 2 }}>{o.vloer_type}{o.oppervlakte ? ` · ${o.oppervlakte} m²` : ""}</div>
                        {o.datum && <div style={{ fontSize: "0.6rem", color: C.muted, marginTop: 2 }}>📅 {new Date(o.datum).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</div>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.52rem", padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,.06)", color: C.muted }}>{o.status}</span>
                        {o.price && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem", color: C.gold, marginTop: 4 }}>€ {Number(o.price).toLocaleString("nl-NL")}</div>}
                      </div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: "0.6rem", color: C.blue, fontWeight: 600 }}>Kies deze opdracht →</div>
                  </div>
                ))}
              </>
            )}

            {assignedOrders.length > 0 && (
              <>
                <div style={{ fontSize: "0.54rem", letterSpacing: 2, color: C.green, textTransform: "uppercase", marginBottom: 10, marginTop: openOrders.length > 0 ? 16 : 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 20, height: 1, background: C.bdr, display: "block" }} />🔨 Al toegewezen — herplaatsen ({assignedOrders.length})
                </div>
                {assignedOrders.map((o) => (
                  <div key={o.id} onClick={() => { setSelectedOrder(o); setVergoeding(o.legger_prijs ? String(o.legger_prijs) : ""); setStep(2); }}
                    style={{ background: C.deep, border: `1px solid rgba(60,184,122,.2)`, borderRadius: 10, padding: "16px 18px", marginBottom: 8, cursor: "pointer", transition: "all .2s", opacity: 0.85 }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.opacity = "1"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(60,184,122,.2)"; e.currentTarget.style.opacity = ".85"; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.white, marginBottom: 3 }}>{o.client_name}</div>
                        <div style={{ fontSize: "0.62rem", color: C.muted }}>{o.straat}{o.plaats ? `, ${o.plaats}` : ""}</div>
                        <div style={{ fontSize: "0.6rem", color: C.green, marginTop: 3 }}>🔨 {o.legger_naam}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.52rem", padding: "2px 8px", borderRadius: 4, background: "rgba(60,184,122,.1)", color: C.green }}>{o.status}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: "0.6rem", color: C.blue, fontWeight: 600 }}>Legger wijzigen →</div>
                  </div>
                ))}
              </>
            )}

            {openOrders.length === 0 && assignedOrders.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: C.muted, fontSize: "0.76rem" }}>Geen openstaande klussen om uit te zetten.</div>
            )}
          </div>
        )}

        {/* ── STAP 2 ── */}
        {step === 2 && selectedOrder && (
          <div>
            <div style={{ fontSize: "0.58rem", letterSpacing: 2.5, color: C.blue, textTransform: "uppercase", marginBottom: 14 }}>Stap 2 — Kies een legger</div>

            <div style={{ background: "rgba(198,165,107,.06)", border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.white, marginBottom: 3 }}>{selectedOrder.client_name}</div>
                <div style={{ fontSize: "0.62rem", color: C.muted }}>{selectedOrder.vloer_type}{selectedOrder.oppervlakte ? ` · ${selectedOrder.oppervlakte} m²` : ""}</div>
              </div>
              {selectedOrder.price && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.gold }}>€ {Number(selectedOrder.price).toLocaleString("nl-NL")}</div>}
            </div>

            {activeLeggers.length === 0 ? (
              <div style={{ color: C.muted, fontSize: "0.72rem", padding: "20px 0" }}>Geen actieve leggers beschikbaar.</div>
            ) : activeLeggers.map((l) => {
              const isSelected = selectedLegger?.id === l.id;
              return (
                <div key={l.id} onClick={() => { setSelectedLegger(l); setStep(3); }}
                  style={{ background: isSelected ? "rgba(74,158,232,.1)" : C.deep, border: `1px solid ${isSelected ? "rgba(74,158,232,.4)" : C.bdr}`, borderRadius: 10, padding: "14px 18px", marginBottom: 8, cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = C.blue}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = isSelected ? "rgba(74,158,232,.4)" : C.bdr}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.8rem", color: C.white, fontWeight: 600, marginBottom: 2 }}>{l.naam}</div>
                      <div style={{ fontSize: "0.6rem", color: C.muted }}>{l.stad || l.adres || "—"}</div>
                      {l.tarief && <div style={{ fontSize: "0.6rem", color: C.gold, marginTop: 2 }}>€ {l.tarief}/m²</div>}
                    </div>
                    <span style={{ fontSize: "0.54rem", padding: "3px 9px", borderRadius: 6, background: "rgba(60,184,122,.1)", color: C.green, fontWeight: 700 }}>ACTIEF</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── STAP 3 ── */}
        {step === 3 && selectedOrder && selectedLegger && (
          <div>
            <div style={{ fontSize: "0.58rem", letterSpacing: 2.5, color: C.blue, textTransform: "uppercase", marginBottom: 14 }}>Stap 3 — Details & bevestigen</div>

            <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
              {/* Samenvatting */}
              <div style={{ background: "rgba(198,165,107,.06)", border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>Samenvatting</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    ["Klant", selectedOrder.client_name],
                    ["Vloertype", selectedOrder.vloer_type || "—"],
                    ["Oppervlakte", selectedOrder.oppervlakte ? `${selectedOrder.oppervlakte} m²` : "—"],
                    ["Legger", selectedLegger.naam],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: "0.48rem", letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: "0.72rem", color: C.white }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vergoeding + notitie */}
              <div>
                <label style={{ display: "block", fontSize: "0.52rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>Vergoeding legger (€)</label>
                <input type="number" value={vergoeding} onChange={(e) => setVergoeding(e.target.value)}
                  placeholder={selectedLegger.tarief && selectedOrder.oppervlakte ? String(Math.round(selectedLegger.tarief * selectedOrder.oppervlakte)) : "b.v. 850"}
                  style={inp} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.52rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>Notitie voor legger (optioneel)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                  placeholder="Instructies, bijzonderheden…"
                  style={{ ...inp, resize: "none" as const, fontFamily: "inherit" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)}
                style={{ flex: 1, padding: "10px", background: "transparent", border: `1px solid ${C.bdr}`, color: C.muted, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 8 }}>
                ← Terug
              </button>
              <button onClick={handleConfirm} disabled={saving}
                style={{ flex: 2, padding: "10px", background: "rgba(60,184,122,.1)", border: "1px solid rgba(60,184,122,.3)", color: C.green, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 8, opacity: saving ? 0.6 : 1 }}>
                {saving ? "Toewijzen…" : "✓ Toewijzen & bevestigen"}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:translateY(0) } }`}</style>
    </DashboardLayout>
  );
}
