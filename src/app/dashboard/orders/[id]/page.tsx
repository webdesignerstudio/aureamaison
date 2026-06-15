"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { GoldButton } from "@/components/ui/gold-button";
import { formatEuro, formatDate } from "@/lib/utils";
import { C } from "@/lib/landing/colors";
import { FactuurModal } from "@/components/modules/orders/factuur-modal";
import { AuditTimeline } from "@/components/modules/audit-timeline";
import { useSettings } from "@/hooks/use-settings";
import { useLeggers } from "@/hooks/use-leggers";
import { useUpdateOrder } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { useToastContext } from "@/components/toast-provider";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";
import { sendStatusUpdate, sendLeggerAssigned } from "@/lib/email";

const STATUS_FLOW: Record<string, string[]> = {
  ingediend: ["in behandeling"],
  "in behandeling": ["offerte verstuurd"],
  "offerte verstuurd": ["gepland"],
  gepland: ["bezig"],
  bezig: ["ter goedkeuring"],
  "ter goedkeuring": ["afgerond", "afgewezen"],
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const companyId = user?.company_id;
  const toast = useToastContext();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFactuur, setShowFactuur] = useState(false);

  const { data: settings } = useSettings(companyId);
  const { data: leggers } = useLeggers(companyId);
  const updateOrder = useUpdateOrder();

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error: fetchError }: { data: Order | null; error: { message: string } | null }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setOrder(data);
        }
        setLoading(false);
      });
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    try {
      await updateOrder.mutateAsync({ id: order.id, status: newStatus as Order["status"] });
      setOrder((prev) => prev ? { ...prev, status: newStatus as Order["status"] } : null);
      toast.success(`Status gewijzigd naar: ${newStatus}`);

      // Send email notification to client
      if (order.client_email) {
        sendStatusUpdate({
          to: order.client_email,
          clientName: order.client_name,
          orderId: order.uaid || order.id.slice(0, 8),
          status: newStatus,
          vloerType: order.vloer_type || "vloer",
        }).catch(() => {}); // silently fail — don't block UX
      }
    } catch {
      toast.error("Status wijzigen mislukt");
    }
  };

  const handleLeggerAssign = async (leggerId: string) => {
    if (!order || !leggers) return;
    const legger = leggers.find((l) => l.id === leggerId);
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        legger_id: leggerId,
        legger_naam: legger?.naam || null,
      });
      setOrder((prev) =>
        prev ? { ...prev, legger_id: leggerId, legger_naam: legger?.naam || null } : null
      );
      toast.success("Legger toegewezen");

      // Send email notification to client
      if (order.client_email && legger) {
        sendLeggerAssigned({
          to: order.client_email,
          clientName: order.client_name,
          leggerNaam: legger.naam,
          orderId: order.uaid || order.id.slice(0, 8),
          datum: order.datum ? new Date(order.datum).toLocaleDateString("nl-NL") : undefined,
        }).catch(() => {});
      }
    } catch {
      toast.error("Legger toewijzen mislukt");
    }
  };

  const handleBetaaldToggle = async () => {
    if (!order) return;
    const newPaid = !order.invoice_paid;
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        invoice_paid: newPaid,
        invoice_paid_at: newPaid ? new Date().toISOString() : null,
      });
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              invoice_paid: newPaid,
              invoice_paid_at: newPaid ? new Date().toISOString() : null,
            }
          : null
      );
      toast.success(newPaid ? "Gemarkeerd als betaald" : "Betaaldstatus ongedaan gemaakt");
    } catch {
      toast.error("Betaalstatus wijzigen mislukt");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: C.muted, fontSize: "0.8rem" }}>Laden…</div>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout>
        <div style={{ padding: "14px 16px", borderRadius: 8, background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, color: C.red, fontSize: "0.72rem" }}>
          {error || "Order niet gevonden."}
        </div>
      </DashboardLayout>
    );
  }

  const nextStatuses = STATUS_FLOW[order.status] || [];
  const COMMISSIE_PCT_LEGGER = 0.12;
  const nettoLegger = order.legger_prijs ? Math.round(order.legger_prijs * (1 - COMMISSIE_PCT_LEGGER) * 100) / 100 : null;
  const card = { background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "18px 20px" };
  const label = { fontSize: "0.58rem", color: C.dim, marginBottom: 2 };
  const val = { fontSize: "0.72rem", color: C.white };
  const sel = { width: "100%", padding: "8px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.7rem", outline: "none" };

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
          <div>
            <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Order</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
              {order.uaid || order.id.slice(0, 8)}
            </h1>
            <div style={{ marginTop: 8 }}><StatusBadge status={order.status} /></div>
          </div>
          <GoldButton variant="outline" size="sm" onClick={() => setShowFactuur(true)}>🖨 Factuur</GoldButton>
        </div>

        {/* Status workflow */}
        {nextStatuses.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {nextStatuses.map((s) => (
              <button key={s} onClick={() => handleStatusUpdate(s)} disabled={updateOrder.isPending}
                style={{ padding: "7px 14px", borderRadius: 7, background: C.goldD, border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "0.6rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", opacity: updateOrder.isPending ? 0.5 : 1 }}>
                → {s}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {/* Klantgegevens */}
          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Klantgegevens</div>
            {[
              ["Naam", order.client_name],
              ["E-mail", order.client_email],
              ["Adres", `${order.straat || "—"}, ${order.postcode || ""} ${order.plaats || ""}`.trim()],
              order.bedrijf ? ["Bedrijf", order.bedrijf] : null,
              order.kvk ? ["KvK", order.kvk] : null,
            ].filter((x): x is string[] => x !== null).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={label}>{k}</div>
                <div style={val}>{v}</div>
              </div>
            ))}
          </div>

          {/* Projectdetails */}
          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Project</div>
            {[
              ["Vloertype", order.vloer_type || "—"],
              ["Oppervlakte", order.oppervlakte ? `${order.oppervlakte} m²` : "—"],
              ["Ondergrond", order.ondergrond || "—"],
              ["Timing", order.timing || "—"],
              order.datum ? ["Datum", formatDate(order.datum)] : null,
            ].filter((x): x is string[] => x !== null).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={label}>{k}</div>
                <div style={val}>{v}</div>
              </div>
            ))}
          </div>

          {/* Financieel */}
          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Financieel</div>
            <div style={{ marginBottom: 8 }}><div style={label}>Prijs</div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: C.gold }}>{order.price ? `€ ${formatEuro(order.price)}` : "—"}</div></div>
            <div style={{ marginBottom: 8 }}><div style={label}>Budget klant</div><div style={val}>{order.budget ? `€ ${formatEuro(order.budget)}` : "—"}</div></div>
            <div style={{ marginBottom: 8 }}><div style={label}>Factuurnr.</div><div style={val}>{order.invoice_nr || "—"}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={label}>Betaald</div>
              <button onClick={handleBetaaldToggle} disabled={updateOrder.isPending}
                style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.56rem", fontWeight: 700, textTransform: "uppercase", cursor: "pointer", background: order.invoice_paid ? C.greenDim : "rgba(224,90,90,.12)", color: order.invoice_paid ? C.green : C.red, border: `1px solid ${order.invoice_paid ? C.greenBdr : C.red + "44"}` }}>
                {order.invoice_paid ? "Betaald ✓" : "Openstaand"}
              </button>
            </div>
          </div>

          {/* Legger */}
          <div style={card}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Legger</div>
            <div style={{ marginBottom: 12 }}>
              <div style={label}>Toewijzen</div>
              <select value={order.legger_id || ""} onChange={(e) => e.target.value && handleLeggerAssign(e.target.value)}
                disabled={updateOrder.isPending || !leggers?.length} style={sel}>
                <option value="">— Kies legger —</option>
                {leggers?.map((l) => <option key={l.id} value={l.id}>{l.naam} (€{l.tarief}/m²)</option>)}
              </select>
            </div>
            {order.legger_naam && (
              <>
                <div style={{ marginBottom: 8 }}><div style={label}>Naam</div><div style={val}>{order.legger_naam}</div></div>
                <div style={{ marginBottom: 8 }}><div style={label}>Prijs</div><div style={val}>{order.legger_prijs ? `€ ${formatEuro(order.legger_prijs)}` : "—"}</div></div>
                {nettoLegger !== null && <div style={{ marginBottom: 8 }}><div style={label}>Netto uitbetaling</div><div style={{ fontSize: "0.72rem", color: C.green }}>€ {formatEuro(nettoLegger)}</div></div>}
                <div><div style={label}>Geaccepteerd</div><div style={val}>{order.legger_geaccepteerd ? "Ja" : "Nee"}</div></div>
              </>
            )}
          </div>
        </div>

        {order.opmerking && (
          <div style={{ ...card, marginTop: 14 }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: 2.5, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>Opmerking</div>
            <p style={{ fontSize: "0.72rem", color: C.dim, lineHeight: 1.6 }}>{order.opmerking}</p>
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: "0.56rem", color: C.dim }}>
          Aangemaakt: {formatDate(order.created_at)} · Bijgewerkt: {formatDate(order.updated_at)}
        </div>

        <AuditTimeline entityId={order.id} entityType="order" />
      </div>

      <FactuurModal order={order} settings={settings} open={showFactuur} onClose={() => setShowFactuur(false)} />
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}
