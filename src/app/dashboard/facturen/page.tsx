"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { C } from "@/lib/landing/colors";
import type { Order } from "@/types";

const eur = (v: number | null | undefined) =>
  v && v > 0 ? `€ ${Number(v).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}` : "—";

const statusKleur = (paid: boolean) =>
  paid ? "rgba(60,184,122,.15)" : "rgba(224,90,90,.1)";
const statusTekst = (paid: boolean) => (paid ? C.green : C.red);

export default function FacturenPage() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.company_id);
  const updateOrder = useUpdateOrder();

  const [filter, setFilter] = useState<"alle" | "open" | "betaald">("alle");
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<Order | null>(null);
  const [invoiceNr, setInvoiceNr] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Alleen orders met prijs (factureerbaar)
  const factureerbaar = orders.filter((o) => o.price && Number(o.price) > 0);

  const gefilterd = factureerbaar.filter((o) => {
    if (filter === "open" && o.invoice_paid) return false;
    if (filter === "betaald" && !o.invoice_paid) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![o.client_name, o.invoice_nr, o.vloer_type, o.status].join(" ").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totaalOpen = factureerbaar.filter((o) => !o.invoice_paid).reduce((s, o) => s + (Number(o.price) || 0), 0);
  const totaalBetaald = factureerbaar.filter((o) => o.invoice_paid).reduce((s, o) => s + (Number(o.price) || 0), 0);
  const totaalOmzet = factureerbaar.reduce((s, o) => s + (Number(o.price) || 0), 0);

  const openModal = (o: Order) => {
    setEditModal(o);
    setInvoiceNr(o.invoice_nr || "");
    setInvoiceDate(o.invoice_date || new Date().toISOString().slice(0, 10));
  };

  const saveInvoice = async () => {
    if (!editModal) return;
    setSaving(true);
    await updateOrder.mutateAsync({ id: editModal.id, invoice_nr: invoiceNr, invoice_date: invoiceDate });
    setSaving(false);
    setEditModal(null);
  };

  const toggleBetaald = async (o: Order) => {
    await updateOrder.mutateAsync({ id: o.id, invoice_paid: !o.invoice_paid, invoice_paid_at: !o.invoice_paid ? new Date().toISOString() : null });
  };

  const inp = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", boxSizing: "border-box" as const };

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Financieel</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Facturen <em style={{ fontStyle: "italic", color: C.goldL }}>Beheer</em>
          </h1>
        </div>

        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 20 }}>
          {[
            ["💶", "Totaal omzet", eur(totaalOmzet), C.gold],
            ["✅", "Betaald", eur(totaalBetaald), C.green],
            ["⏳", "Openstaand", eur(totaalOpen), C.red],
            ["📄", "Factuurbaar", factureerbaar.length, C.white],
          ].map(([ic, lbl, val, col]) => (
            <div key={lbl as string} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{ic}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: col as string, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: "0.44rem", letterSpacing: 1.5, color: C.dim, textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Zoek klant, factuurnr, vloertype…"
            style={{ flex: 1, minWidth: 200, padding: "8px 12px", background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.68rem" }} />
          <div style={{ display: "flex", gap: 4 }}>
            {(["alle", "open", "betaald"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ fontSize: "0.58rem", padding: "7px 14px", borderRadius: 6, cursor: "pointer", border: `1px solid ${filter === f ? C.gold + "66" : C.bdr}`, background: filter === f ? "rgba(198,165,107,.1)" : "transparent", color: filter === f ? C.gold : C.dim, textTransform: "capitalize" }}>
                {f === "alle" ? "Alle" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {gefilterd.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📄</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.muted }}>Geen facturen {search ? "gevonden" : "beschikbaar"}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gefilterd.map((o) => (
              <div key={o.id} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.white }}>{o.client_name}</span>
                    <span style={{ fontSize: "0.54rem", padding: "2px 8px", borderRadius: 4, background: statusKleur(o.invoice_paid), color: statusTekst(o.invoice_paid), fontWeight: 700 }}>
                      {o.invoice_paid ? "BETAALD" : "OPEN"}
                    </span>
                    {o.invoice_nr && (
                      <span style={{ fontSize: "0.54rem", color: C.muted, fontFamily: "monospace" }}>#{o.invoice_nr}</span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: C.muted }}>
                    {o.vloer_type && <span style={{ marginRight: 10 }}>🪵 {o.vloer_type}</span>}
                    {o.oppervlakte && <span style={{ marginRight: 10 }}>📐 {o.oppervlakte} m²</span>}
                    {o.invoice_date && <span>📅 {new Date(o.invoice_date).toLocaleDateString("nl-NL")}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.gold }}>{eur(o.price)}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
                    <button onClick={() => openModal(o)}
                      style={{ fontSize: "0.54rem", padding: "4px 10px", background: "rgba(198,165,107,.08)", border: `1px solid ${C.bdr}`, color: C.gold, borderRadius: 6, cursor: "pointer", letterSpacing: 1 }}>
                      ✎ Factuur
                    </button>
                    <button onClick={() => toggleBetaald(o)}
                      style={{ fontSize: "0.54rem", padding: "4px 10px", background: o.invoice_paid ? "rgba(224,90,90,.06)" : "rgba(60,184,122,.08)", border: o.invoice_paid ? "1px solid rgba(224,90,90,.2)" : "1px solid rgba(60,184,122,.2)", color: o.invoice_paid ? C.red : C.green, borderRadius: 6, cursor: "pointer" }}>
                      {o.invoice_paid ? "✗ Betaald" : "✓ Mark betaald"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Invoice Modal */}
      {editModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setEditModal(null)}>
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 16, padding: 24, maxWidth: 440, width: "100%" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem" }}>Factuur bewerken</div>
              <button onClick={() => setEditModal(null)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 22 }}>×</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>Factuur Nr</div>
              <input value={invoiceNr} onChange={(e) => setInvoiceNr(e.target.value)} placeholder="b.v. FAC-2025-001" style={inp} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: "0.52rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>Factuurdatum</div>
              <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={inp} />
            </div>
            <button onClick={saveInvoice} disabled={saving}
              style={{ width: "100%", padding: "11px", background: "rgba(198,165,107,.12)", border: `1px solid ${C.gold}44`, color: C.gold, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 8, opacity: saving ? 0.6 : 1 }}>
              {saving ? "Opslaan…" : "Opslaan"}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes slideUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:translateY(0) } }`}</style>
    </DashboardLayout>
  );
}
