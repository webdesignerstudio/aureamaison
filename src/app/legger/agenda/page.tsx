"use client";

import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { StatusBadge } from "@/components/ui/status-badge";
import { C } from "@/lib/landing/colors";
import Link from "next/link";

export default function LeggerAgendaPage() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders(user?.company_id);

  const myOrders = orders?.filter((o) => o.legger_id === user?.id && o.legger_geaccepteerd) || [];

  // Group by month
  const byMonth = new Map<string, typeof myOrders>();
  myOrders.forEach((o) => {
    const date = o.datum || o.created_at;
    const key = new Date(date).toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    const existing = byMonth.get(key) || [];
    existing.push(o);
    byMonth.set(key, existing);
  });

  if (isLoading) return (
    <LeggerLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </LeggerLayout>
  );

  return (
    <LeggerLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Agenda</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Array.from(byMonth.entries()).map(([month, items]) => (
            <div key={month} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>{month}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((o) => (
                  <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,.02)", border: `1px solid rgba(255,255,255,.04)` }}>
                    <div>
                      <Link href={`/legger/klus/${o.id}`} style={{ fontSize: "0.74rem", color: C.white, textDecoration: "none" }}>{o.client_name}</Link>
                      <div style={{ fontSize: "0.6rem", color: C.muted, marginTop: 2 }}>{o.straat}, {o.plaats} · {o.vloer_type || "—"}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <StatusBadge status={o.status} />
                      <span style={{ fontSize: "0.58rem", color: C.dim }}>{o.datum ? new Date(o.datum).toLocaleDateString("nl-NL", { day: "2-digit" }) : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {byMonth.size === 0 && (
            <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "36px", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>
              Geen aangenomen klussen gevonden.
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </LeggerLayout>
  );
}
