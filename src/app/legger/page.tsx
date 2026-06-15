"use client";

import Link from "next/link";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useUpdateOrder } from "@/hooks/use-orders";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatEuro } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { useToastContext } from "@/components/toast-provider";
import { useState } from "react";

export default function LeggerPortalPage() {
  const { user } = useAuth();
  const toast = useToastContext();
  const updateOrder = useUpdateOrder();
  const [activeTab, setActiveTab] = useState<"open" | "aangenomen" | "afgerond">("open");
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReden, setRejectReden] = useState("");

  const { data: orders, isLoading } = useOrders(user?.company_id);

  const myOrders = orders?.filter((o) => o.legger_id === user?.id) || [];

  const openstaand = myOrders.filter(
    (o) => o.legger_id === user?.id && !o.legger_geaccepteerd && o.status !== "afgerond" && o.status !== "afgewezen"
  );
  const aangenomen = myOrders.filter(
    (o) => o.legger_geaccepteerd && o.status !== "afgerond" && o.status !== "afgewezen"
  );
  const afgerondList = myOrders.filter(
    (o) => o.status === "afgerond" || o.status === "afgewezen"
  );

  const tabOrders =
    activeTab === "open" ? openstaand :
    activeTab === "aangenomen" ? aangenomen :
    afgerondList;

  const handleAccept = async (orderId: string) => {
    try {
      await updateOrder.mutateAsync({ id: orderId, legger_geaccepteerd: true });
      toast.success("Klus geaccepteerd");
    } catch {
      toast.error("Accepteren mislukt");
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await updateOrder.mutateAsync({
        id: rejectModal,
        legger_id: null,
        legger_naam: null,
        legger_geaccepteerd: false,
      });
      toast.success("Klus geweigerd");
      setRejectModal(null);
      setRejectReden("");
    } catch {
      toast.error("Weigeren mislukt");
    }
  };

  const th = { padding: "10px 14px", fontSize: "0.5rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, fontWeight: 600, textAlign: "left" as const };
  const td = { padding: "11px 14px", fontSize: "0.68rem", color: C.white, borderTop: `1px solid rgba(255,255,255,.04)` };

  if (isLoading) return (
    <LeggerLayout>
      <div style={{ padding: "60px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>
    </LeggerLayout>
  );

  return (
    <LeggerLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Portaal</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>Mijn Klussen</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.bdr}`, marginBottom: 16 }}>
          {(["open", "aangenomen", "afgerond"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "10px 14px", fontSize: "0.56rem", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: activeTab === tab ? C.white : C.muted, background: "none", border: "none", cursor: "pointer", borderBottom: activeTab === tab ? `2px solid ${C.gold}` : "2px solid transparent", marginBottom: -1 }}>
              {tab === "open" ? `Openstaand (${openstaand.length})` : tab === "aangenomen" ? `Aangenomen (${aangenomen.length})` : `Afgerond (${afgerondList.length})`}
            </button>
          ))}
        </div>

        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
          {tabOrders.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Geen klussen in deze categorie.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Klant</th><th style={th}>Adres</th><th style={th}>Vloer</th>
                  <th style={th}>Status</th><th style={th}>Prijs</th><th style={th}></th>
                </tr></thead>
                <tbody>
                  {tabOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={td}><Link href={`/legger/klus/${order.id}`} style={{ color: C.white, textDecoration: "none" }}>{order.client_name}</Link></td>
                      <td style={{ ...td, color: C.dim }}>{order.straat}, {order.plaats}</td>
                      <td style={{ ...td, color: C.dim }}>{order.vloer_type || "—"}</td>
                      <td style={td}><StatusBadge status={order.status} /></td>
                      <td style={{ ...td, color: C.dim }}>{order.legger_prijs ? `€ ${formatEuro(order.legger_prijs)}` : "—"}</td>
                      <td style={td}>
                        {activeTab === "open" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => handleAccept(order.id)} disabled={updateOrder.isPending}
                              style={{ padding: "4px 10px", background: C.greenDim, border: `1px solid ${C.greenBdr}`, color: C.green, borderRadius: 6, fontSize: "0.58rem", cursor: "pointer" }}>
                              ✓ Accepteren
                            </button>
                            <button onClick={() => setRejectModal(order.id)}
                              style={{ padding: "4px 10px", background: "rgba(224,90,90,.08)", border: "1px solid rgba(224,90,90,.2)", color: C.red, borderRadius: 6, fontSize: "0.58rem", cursor: "pointer" }}>
                              ✕ Weigeren
                            </button>
                          </div>
                        )}
                        {activeTab === "aangenomen" && (
                          <Link href={`/legger/klus/${order.id}`} style={{ fontSize: "0.6rem", color: C.gold, textDecoration: "none" }}>Details →</Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Weiger modal */}
      {rejectModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.8)", padding: 20 }}
          onClick={() => setRejectModal(null)}>
          <div style={{ background: C.deep, border: `1px solid ${C.red}44`, borderRadius: 14, padding: 24, maxWidth: 440, width: "100%" }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: C.red, margin: "0 0 10px" }}>Klus weigeren</h3>
            <p style={{ fontSize: "0.68rem", color: C.muted, marginBottom: 14 }}>Weet u zeker dat u deze klus wilt weigeren?</p>
            <textarea value={rejectReden} onChange={(e) => setRejectReden(e.target.value)} placeholder="Reden (optioneel)…" rows={3}
              style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", boxSizing: "border-box", resize: "vertical" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: "10px", background: "none", border: `1px solid ${C.bdr}`, color: C.muted, borderRadius: 8, fontSize: "0.6rem", cursor: "pointer" }}>Annuleren</button>
              <button onClick={handleReject} disabled={updateOrder.isPending} style={{ flex: 1, padding: "10px", background: "rgba(224,90,90,.1)", border: "1px solid rgba(224,90,90,.25)", color: C.red, borderRadius: 8, fontSize: "0.6rem", cursor: "pointer" }}>
                {updateOrder.isPending ? "Bezig…" : "Weigeren"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </LeggerLayout>
  );
}
