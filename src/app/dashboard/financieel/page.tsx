"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useOffertes } from "@/hooks/use-offertes";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatEuro, formatDate } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import Link from "next/link";

export default function FinancieelPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: orders, isLoading: ordersLoading } = useOrders(companyId);
  const { data: offertes, isLoading: offertesLoading } = useOffertes(companyId);

  const loading = ordersLoading || offertesLoading;

  // ── FINANCIËLE BEREKENINGEN ──
  const allOrders = orders || [];

  // Omzet: alle orders met een prijs (ongeacht status — dit is de totale contractwaarde)
  const omzetOrders = allOrders.filter((o) => o.price && o.price > 0);
  const totaleOmzet = omzetOrders.reduce((s, o) => s + (o.price || 0), 0);

  // Betaald: gefactureerd EN betaald
  const betaaldOrders = allOrders.filter((o) => o.invoice_paid && o.price);
  const totaalBetaald = betaaldOrders.reduce((s, o) => s + (o.price || 0), 0);

  // Openstaand: gefactureerd maar NIET betaald
  const openOrders = allOrders.filter(
    (o) => o.invoice_nr && !o.invoice_paid && o.price
  );
  const totaalOpen = openOrders.reduce((s, o) => s + (o.price || 0), 0);

  // Prognose: orders met prijs die nog niet gefactureerd zijn (pipeline)
  const prognoseStatuses = ["ingediend", "in behandeling", "offerte verstuurd", "gepland", "bezig", "ter goedkeuring"];
  const prognoseOrders = allOrders.filter(
    (o) => o.price && !o.invoice_nr && prognoseStatuses.includes(o.status)
  );
  const totaalPrognose = prognoseOrders.reduce((s, o) => s + (o.price || 0), 0);

  // Offertes
  const pendingOffertes = (offertes || []).filter((o) => o.status === "ingediend");
  const totaalOfferteBudget = pendingOffertes.reduce((s, o) => s + (o.budget || 0), 0);

  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "11px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: C.muted, fontSize: "0.8rem" }}>Laden…</div>
      </DashboardLayout>
    );
  }

  const TableSection = ({ title, rows }: { title: string; rows: React.ReactNode }) => (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>{rows}</div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Overzicht</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Financieel</h1>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Totale omzet", value: `€ ${formatEuro(totaleOmzet)}`, sub: `${omzetOrders.length} orders`, color: C.gold },
            { label: "Betaald", value: `€ ${formatEuro(totaalBetaald)}`, sub: `${betaaldOrders.length} facturen`, color: C.green },
            { label: "Openstaand", value: `€ ${formatEuro(totaalOpen)}`, sub: `${openOrders.length} facturen`, color: C.red },
            { label: "Prognose", value: `€ ${formatEuro(totaalPrognose)}`, sub: `${prognoseOrders.length} in pipeline`, color: C.blue },
          ].map((k) => (
            <div key={k.label} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>{k.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: k.color, lineHeight: 1.1, marginTop: 6 }}>{k.value}</div>
              {k.sub && <div style={{ fontSize: "0.52rem", color: C.dim, marginTop: 3 }}>{k.sub}</div>}
            </div>
          ))}
        </div>

        {/* Offertes */}
        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>Open offertes</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: C.gold, lineHeight: 1.1, marginTop: 4 }}>{pendingOffertes.length}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.52rem", color: C.muted }}>Totaal budget</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", color: C.white, marginTop: 2 }}>€ {formatEuro(totaalOfferteBudget)}</div>
          </div>
        </div>

        {/* Openstaande facturen */}
        {openOrders.length > 0 && (
          <TableSection title="Openstaande facturen" rows={
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Factuurnr</th><th style={th}>Klant</th><th style={th}>Status</th>
                <th style={{ ...th, textAlign: "right" }}>Bedrag</th><th style={th}>Datum</th>
              </tr></thead>
              <tbody>
                {openOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={td}><Link href={`/dashboard/orders/${order.id}`} style={{ color: C.white, textDecoration: "none" }}>{order.invoice_nr}</Link></td>
                    <td style={{ ...td, color: C.dim }}>{order.client_name}</td>
                    <td style={td}><StatusBadge status={order.status} /></td>
                    <td style={{ ...td, textAlign: "right", color: C.red }}>€ {formatEuro(order.price || 0)}</td>
                    <td style={{ ...td, color: C.dim }}>{formatDate(order.invoice_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          } />
        )}

        {/* Betaalde facturen */}
        {betaaldOrders.length > 0 && (
          <TableSection title="Betaalde facturen" rows={
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Factuurnr</th><th style={th}>Klant</th>
                <th style={{ ...th, textAlign: "right" }}>Bedrag</th><th style={th}>Betaald op</th>
              </tr></thead>
              <tbody>
                {betaaldOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={td}><Link href={`/dashboard/orders/${order.id}`} style={{ color: C.white, textDecoration: "none" }}>{order.invoice_nr}</Link></td>
                    <td style={{ ...td, color: C.dim }}>{order.client_name}</td>
                    <td style={{ ...td, textAlign: "right", color: C.green }}>€ {formatEuro(order.price || 0)}</td>
                    <td style={{ ...td, color: C.dim }}>{formatDate(order.invoice_paid_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          } />
        )}

        {/* Pipeline */}
        {prognoseOrders.length > 0 && (
          <TableSection title="Pipeline (prognose)" rows={
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Klant</th><th style={th}>Status</th>
                <th style={{ ...th, textAlign: "right" }}>Verwachte omzet</th><th style={th}>Vloer</th>
              </tr></thead>
              <tbody>
                {prognoseOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={td}><Link href={`/dashboard/orders/${order.id}`} style={{ color: C.white, textDecoration: "none" }}>{order.client_name}</Link></td>
                    <td style={td}><StatusBadge status={order.status} /></td>
                    <td style={{ ...td, textAlign: "right", color: C.blue }}>€ {formatEuro(order.price || 0)}</td>
                    <td style={{ ...td, color: C.dim }}>{order.vloer_type || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          } />
        )}
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
