"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { useLeggers } from "@/hooks/use-leggers";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";

export default function LeggerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: leggers, isLoading: leggerLoading } = useLeggers(companyId);
  const { data: orders, isLoading: ordersLoading } = useOrders(companyId);

  const legger = leggers?.find((l) => l.id === id);
  const leggerOrders = orders?.filter((o) => o.legger_id === id) || [];
  const afgerond = leggerOrders.filter((o) => o.status === "afgerond");

  if (leggerLoading || ordersLoading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: C.muted, fontSize: "0.8rem" }}>Laden…</div>
      </DashboardLayout>
    );
  }

  if (!legger) {
    return (
      <DashboardLayout>
        <div style={{ padding: "14px 16px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>
          Legger niet gevonden.
        </div>
      </DashboardLayout>
    );
  }

  const card = { background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "18px 20px" };
  const lbl = { fontSize: "0.58rem", color: C.dim, marginBottom: 2 };
  const val = { fontSize: "0.72rem", color: C.white };
  const th = { padding: "10px 16px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "11px 16px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Legger</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>{legger.naam}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <StatusBadge status={legger.status} />
            <span style={{ fontSize: "0.58rem", color: C.muted }}>Tier {legger.tier}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Contact</div>
            {[
              ["Email", legger.email],
              ["Telefoon", legger.telefoon || "—"],
              ["Adres", legger.adres || "—"],
              legger.stad ? ["Stad", legger.stad] : null,
            ].filter((x): x is string[] => x !== null).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}><div style={lbl}>{k}</div><div style={val}>{v}</div></div>
            ))}
          </div>

          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Bedrijf</div>
            {[
              ["KvK", legger.kvk || "—"],
              ["BTW", legger.btw || "—"],
              ["IBAN", legger.iban || "—"],
              ["Tarief", legger.tarief ? `€ ${legger.tarief}/m²` : "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}><div style={lbl}>{k}</div><div style={val}>{v}</div></div>
            ))}
          </div>

          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Statistieken</div>
            <div style={{ marginBottom: 8 }}><div style={lbl}>Totaal klussen</div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", color: C.gold }}>{leggerOrders.length}</div></div>
            <div style={{ marginBottom: 8 }}><div style={lbl}>Afgerond</div><div style={{ ...val, color: C.green }}>{afgerond.length}</div></div>
            <div><div style={lbl}>Beoordeling</div><div style={{ color: C.gold, fontSize: "0.9rem" }}>★★★☆☆</div></div>
          </div>
        </div>

        {/* Klussen tabel */}
        <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Klussen</div>
        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
          {leggerOrders.length === 0 ? (
            <div style={{ padding: "36px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Geen klussen toegewezen.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Klant</th>
                  <th style={th}>Adres</th>
                  <th style={th}>Status</th>
                  <th style={th}>Prijs</th>
                </tr>
              </thead>
              <tbody>
                {leggerOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={td}>
                      <Link href={`/dashboard/orders/${o.id}`} style={{ color: C.white, textDecoration: "none" }}>
                        {o.client_name}
                      </Link>
                    </td>
                    <td style={{ ...td, color: C.dim }}>{o.straat}, {o.plaats}</td>
                    <td style={td}><StatusBadge status={o.status} /></td>
                    <td style={{ ...td, color: C.gold }}>{o.price ? `€ ${o.price}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
