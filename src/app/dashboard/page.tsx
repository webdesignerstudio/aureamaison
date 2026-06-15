"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useOffertes } from "@/hooks/use-offertes";
import { useLeggers } from "@/hooks/use-leggers";
import { C } from "@/lib/landing/colors";
import { formatEuro } from "@/lib/utils";

const STATUS_META: Record<string, { label: string; color: string }> = {
  ingediend: { label: "Ingediend", color: C.blue },
  "in behandeling": { label: "In behandeling", color: C.orange },
  "offerte verstuurd": { label: "Offerte verstuurd", color: C.purple },
  gepland: { label: "Gepland", color: C.blue },
  bezig: { label: "Bezig", color: C.orange },
  "ter goedkeuring": { label: "Ter goedkeuring", color: C.purple },
  afgerond: { label: "Afgerond", color: C.green },
  afgewezen: { label: "Afgewezen", color: C.red },
};

function KPICard({ label, value, sub, color = C.gold }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.9rem", color, lineHeight: 1.1, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: "0.56rem", color: C.dim, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: orders = [], isLoading: ordersLoading } = useOrders(companyId);
  const { data: offertes = [], isLoading: offertesLoading } = useOffertes(companyId);
  const { data: leggers = [], isLoading: leggersLoading } = useLeggers(companyId);

  const loading = ordersLoading || offertesLoading || leggersLoading;

  const totalOrders = orders.length;
  const openOrders = orders.filter((o) => o.status !== "afgerond" && o.status !== "afgewezen").length;
  const totalRevenue = orders.filter((o) => o.status === "afgerond").reduce((sum, o) => sum + (o.price || 0), 0);
  const betaald = orders.filter((o) => o.invoice_paid).reduce((sum, o) => sum + (o.price || 0), 0);
  const pendingOffertes = offertes.filter((o) => o.status === "ingediend").length;
  const activeLeggers = leggers.filter((l) => l.status === "actief").length;

  // Status verdeling
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const statusEntries = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);

  const recente = [...orders].slice(0, 6);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: C.muted, fontSize: "0.8rem" }}>
          Laden…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Overzicht</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Welkom terug{user?.name ? <em style={{ fontStyle: "italic", color: C.goldL }}>, {user.name}</em> : ""}
          </h1>
          <p style={{ fontSize: "0.65rem", color: C.dim, marginTop: 6 }}>Een momentopname van uw bedrijfsprestaties.</p>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 22 }}>
          <KPICard label="Totaal orders" value={totalOrders} sub={`${openOrders} openstaand`} />
          <KPICard label="Omzet (afgerond)" value={`€ ${formatEuro(totalRevenue)}`} color={C.gold} sub={`€ ${formatEuro(betaald)} ontvangen`} />
          <KPICard label="Open offertes" value={pendingOffertes} color={C.blue} />
          <KPICard label="Actieve leggers" value={activeLeggers} color={C.green} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {/* Status overzicht */}
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Status verdeling</div>
            {statusEntries.length === 0 ? (
              <div style={{ color: C.muted, fontSize: "0.72rem" }}>Nog geen orders.</div>
            ) : statusEntries.map(([status, count]) => {
              const meta = STATUS_META[status] || { label: status, color: C.muted };
              const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              return (
                <div key={status} style={{ marginBottom: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", marginBottom: 5 }}>
                    <span style={{ color: C.white }}>{meta.label}</span>
                    <span style={{ color: meta.color }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,.06)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: meta.color, borderRadius: 99, transition: "width .5s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recente orders */}
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase" }}>Recente orders</div>
              <Link href="/dashboard/orders" style={{ fontSize: "0.56rem", color: C.muted, textDecoration: "none" }}>Alle →</Link>
            </div>
            {recente.length === 0 ? (
              <div style={{ color: C.muted, fontSize: "0.72rem" }}>Nog geen orders gevonden.</div>
            ) : recente.map((o) => {
              const meta = STATUS_META[o.status] || { label: o.status, color: C.muted };
              return (
                <Link key={o.id} href={`/dashboard/orders/${o.id}`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid rgba(255,255,255,.04)`, textDecoration: "none" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.72rem", color: C.white, marginBottom: 2 }}>{o.client_name}</div>
                    <div style={{ fontSize: "0.56rem", color: C.dim }}>{o.vloer_type || "—"}{o.oppervlakte ? ` · ${o.oppervlakte} m²` : ""}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                    <span style={{ fontSize: "0.52rem", padding: "2px 8px", borderRadius: 99, background: meta.color + "22", color: meta.color, fontWeight: 700 }}>{meta.label}</span>
                    {o.price ? <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.85rem", color: C.gold, marginTop: 3 }}>€ {formatEuro(o.price)}</div> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:translateY(0) } }`}</style>
    </DashboardLayout>
  );
}
