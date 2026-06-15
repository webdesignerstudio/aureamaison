"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { formatEuro } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { C } from "@/lib/landing/colors";
import type { Order } from "@/types";

export default function KlantenPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data: orders = [], isLoading } = useOrders(companyId);
  const [search, setSearch] = useState("");

  const klantenMap = new Map<string, { naam: string; email: string; orders: Order[]; totaal: number }>();
  orders.forEach((o) => {
    const existing = klantenMap.get(o.client_email);
    if (existing) {
      existing.orders.push(o);
      if (o.price) existing.totaal += o.price;
    } else {
      klantenMap.set(o.client_email, { naam: o.client_name, email: o.client_email, orders: [o], totaal: o.price || 0 });
    }
  });
  const klanten = Array.from(klantenMap.values())
    .filter((k) => !search || k.naam.toLowerCase().includes(search.toLowerCase()) || k.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.totaal - a.totaal);

  const inp = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", boxSizing: "border-box" as const, outline: "none" };

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Beheer</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Klanten</h1>
        </div>

        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Totaal klanten", value: klantenMap.size, color: C.gold },
            { label: "Totale omzet", value: `€ ${formatEuro(orders.reduce((s, o) => s + (o.price || 0), 0))}`, color: C.gold },
          ].map((k) => (
            <div key={k.label} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>{k.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.7rem", color: k.color, lineHeight: 1.1, marginTop: 6 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 14 }}>
          <input placeholder="Zoek op naam of email…" value={search} onChange={(e) => setSearch(e.target.value)} style={inp} />
        </div>

        {/* List */}
        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
          ) : klanten.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Geen klanten gevonden.</div>
          ) : klanten.map((k, i) => (
            <div key={k.email} style={{ display: "flex", alignItems: "center", padding: "13px 18px", borderBottom: i < klanten.length - 1 ? `1px solid rgba(255,255,255,.04)` : undefined, gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.goldD, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.gold }}>{k.naam[0]?.toUpperCase()}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.72rem", color: C.white, fontWeight: 600 }}>{k.naam}</div>
                <div style={{ fontSize: "0.58rem", color: C.dim }}>{k.email}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.gold }}>€ {formatEuro(k.totaal)}</div>
                <div style={{ fontSize: "0.55rem", color: C.muted }}>{k.orders.length} order{k.orders.length !== 1 ? "s" : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
