"use client";

import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatEuro } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order, Offerte } from "@/types";

export default function ClientPortalPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("orders").select("*").eq("client_email", user.email).order("created_at", { ascending: false }),
      supabase.from("offertes").select("*").eq("client_email", user.email).order("created_at", { ascending: false }),
    ]).then(([ordersRes, offertesRes]) => {
      setOrders((ordersRes.data as Order[]) || []);
      setOffertes((offertesRes.data as Offerte[]) || []);
      setLoading(false);
    });
  }, [user?.email]);

  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "11px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (loading) return (
    <ClientLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </ClientLayout>
  );

  return (
    <ClientLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Mijn Account</h1>
        </div>

        {/* Orders */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase" }}>Mijn Orders</div>
            <Link href="/client/opdracht" style={{ fontSize: "0.6rem", color: C.gold, textDecoration: "none" }}>+ Nieuwe opdracht</Link>
          </div>
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
            {orders.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Geen orders gevonden.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={th}>Status</th><th style={th}>Vloer</th><th style={th}>Prijs</th>
                    <th style={th}>Factuur</th><th style={th}>Datum</th>
                  </tr></thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td style={td}><StatusBadge status={order.status} /></td>
                        <td style={{ ...td, color: C.dim }}>{order.vloer_type || "—"}</td>
                        <td style={{ ...td, color: C.dim }}>{order.price ? `€ ${formatEuro(order.price)}` : "—"}</td>
                        <td style={td}>
                          {order.invoice_paid ? <span style={{ color: C.green }}>Betaald ✓</span>
                            : order.invoice_nr ? <span style={{ color: C.gold }}>Open</span>
                            : <span style={{ color: C.dim }}>—</span>}
                        </td>
                        <td style={{ ...td, color: C.dim }}>{formatDate(order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Offertes */}
        <div>
          <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>Mijn Offertes</div>
          <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
            {offertes.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Geen offertes gevonden.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={th}>Status</th><th style={th}>Vloer</th><th style={th}>Budget</th><th style={th}>Datum</th>
                  </tr></thead>
                  <tbody>
                    {offertes.map((offerte) => (
                      <tr key={offerte.id}>
                        <td style={td}><StatusBadge status={offerte.status} /></td>
                        <td style={{ ...td, color: C.dim }}>{offerte.vloer_type || "—"}</td>
                        <td style={{ ...td, color: C.dim }}>{offerte.budget ? `€ ${formatEuro(offerte.budget)}` : "—"}</td>
                        <td style={{ ...td, color: C.dim }}>{formatDate(offerte.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ClientLayout>
  );
}
