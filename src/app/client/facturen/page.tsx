"use client";

import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatEuro, formatDate } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

export default function ClientFacturenPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("client_email", user.email)
        .not("invoice_nr", "is", null)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    })();
  }, [user?.email]);

  const openFacturen = orders.filter((o) => !o.invoice_paid);
  const betaaldeFacturen = orders.filter((o) => o.invoice_paid);
  const totaalOpen = openFacturen.reduce((s, o) => s + (o.price || 0), 0);
  const totaalBetaald = betaaldeFacturen.reduce((s, o) => s + (o.price || 0), 0);

  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "11px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (loading) return (
    <ClientLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </ClientLayout>
  );

  const TableBlock = ({ title, color, rows, cols }: { title: string; color: string; rows: React.ReactNode; cols: React.ReactNode }) => (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontSize: "0.54rem", letterSpacing: 2, color, textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{cols}</tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <ClientLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Mijn Facturen</h1>
        </div>

        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 4 }}>
          {[
            { label: "Totaal facturen", val: orders.length, color: C.gold },
            { label: "Openstaand", val: `€ ${formatEuro(totaalOpen)}`, color: C.red },
            { label: "Betaald", val: `€ ${formatEuro(totaalBetaald)}`, color: C.green },
          ].map((k) => (
            <div key={k.label} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>{k.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: k.color, lineHeight: 1.1, marginTop: 6 }}>{k.val}</div>
            </div>
          ))}
        </div>

        {openFacturen.length > 0 && (
          <TableBlock title="Openstaand" color={C.red}
            cols={<><th style={th}>Factuurnr</th><th style={th}>Vloer</th><th style={{ ...th, textAlign: "right" }}>Bedrag</th><th style={th}>Datum</th><th style={th}>Status</th></>}
            rows={openFacturen.map((order) => (
              <tr key={order.id}>
                <td style={td}>{order.invoice_nr}</td>
                <td style={{ ...td, color: C.dim }}>{order.vloer_type || "—"}</td>
                <td style={{ ...td, textAlign: "right", color: C.red }}>€ {formatEuro(order.price || 0)}</td>
                <td style={{ ...td, color: C.dim }}>{formatDate(order.invoice_date || order.created_at)}</td>
                <td style={td}><StatusBadge status={order.status} /></td>
              </tr>
            ))}
          />
        )}

        {betaaldeFacturen.length > 0 && (
          <TableBlock title="Betaald" color={C.green}
            cols={<><th style={th}>Factuurnr</th><th style={th}>Vloer</th><th style={{ ...th, textAlign: "right" }}>Bedrag</th><th style={th}>Betaald op</th></>}
            rows={betaaldeFacturen.map((order) => (
              <tr key={order.id}>
                <td style={td}>{order.invoice_nr}</td>
                <td style={{ ...td, color: C.dim }}>{order.vloer_type || "—"}</td>
                <td style={{ ...td, textAlign: "right", color: C.green }}>€ {formatEuro(order.price || 0)}</td>
                <td style={{ ...td, color: C.dim }}>{formatDate(order.invoice_paid_at)}</td>
              </tr>
            ))}
          />
        )}

        {orders.length === 0 && (
          <div style={{ marginTop: 22, background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "36px", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>
            U heeft nog geen facturen.
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ClientLayout>
  );
}
