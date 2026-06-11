"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { GoldButton } from "@/components/ui/gold-button";
import { Spinner } from "@/components/ui/spinner";
import { formatEuro, formatDate } from "@/lib/utils";
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
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setOrder(data as Order);
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
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error || "Order niet gevonden."}
        </div>
      </DashboardLayout>
    );
  }

  const nextStatuses = STATUS_FLOW[order.status] || [];
  const COMMISSIE_PCT_LEGGER = 0.12;
  const nettoLegger = order.legger_prijs
    ? Math.round(order.legger_prijs * (1 - COMMISSIE_PCT_LEGGER) * 100) / 100
    : null;

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
              Order {order.uaid || order.id.slice(0, 8)}
            </h1>
            <div className="mt-2">
              <StatusBadge status={order.status} />
            </div>
          </div>
          <GoldButton variant="outline" onClick={() => setShowFactuur(true)}>
            Factuur bekijken
          </GoldButton>
        </div>

        {/* Status workflow */}
        {nextStatuses.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusUpdate(s)}
                disabled={updateOrder.isPending}
                className="rounded-lg bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold transition hover:bg-gold/20 disabled:opacity-50"
              >
                → {s}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Klantgegevens */}
          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Klantgegevens
            </h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Naam:</span> <span className="text-foreground">{order.client_name}</span></div>
              <div><span className="text-muted">E-mail:</span> <span className="text-foreground">{order.client_email}</span></div>
              <div><span className="text-muted">Adres:</span> <span className="text-foreground">{order.straat}, {order.postcode} {order.plaats}</span></div>
              {order.bedrijf && <div><span className="text-muted">Bedrijf:</span> <span className="text-foreground">{order.bedrijf}</span></div>}
              {order.kvk && <div><span className="text-muted">KvK:</span> <span className="text-foreground">{order.kvk}</span></div>}
            </div>
          </div>

          {/* Projectdetails */}
          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Projectdetails
            </h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Vloertype:</span> <span className="text-foreground">{order.vloer_type || "—"}</span></div>
              <div><span className="text-muted">Oppervlakte:</span> <span className="text-foreground">{order.oppervlakte ? `${order.oppervlakte} m²` : "—"}</span></div>
              <div><span className="text-muted">Ondergrond:</span> <span className="text-foreground">{order.ondergrond || "—"}</span></div>
              <div><span className="text-muted">Timing:</span> <span className="text-foreground">{order.timing || "—"}</span></div>
              {order.datum && <div><span className="text-muted">Datum:</span> <span className="text-foreground">{formatDate(order.datum)}</span></div>}
            </div>
          </div>

          {/* Financieel */}
          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Financieel
            </h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Prijs:</span> <span className="text-foreground">{order.price ? `€ ${formatEuro(order.price)}` : "—"}</span></div>
              <div><span className="text-muted">Budget:</span> <span className="text-foreground">{order.budget ? `€ ${formatEuro(order.budget)}` : "—"}</span></div>
              <div><span className="text-muted">Factuurnr:</span> <span className="text-foreground">{order.invoice_nr || "—"}</span></div>
              <div className="flex items-center gap-2">
                <span className="text-muted">Betaald:</span>
                <button
                  onClick={handleBetaaldToggle}
                  disabled={updateOrder.isPending}
                  className={`rounded px-2 py-0.5 text-xs font-bold uppercase transition ${
                    order.invoice_paid
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {order.invoice_paid ? "Ja ✓" : "Nee"}
                </button>
              </div>
            </div>
          </div>

          {/* Legger */}
          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Legger
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs text-muted">Toewijzen</label>
                <select
                  value={order.legger_id || ""}
                  onChange={(e) => e.target.value && handleLeggerAssign(e.target.value)}
                  disabled={updateOrder.isPending || !leggers?.length}
                  className="w-full rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
                >
                  <option value="">— Kies legger —</option>
                  {leggers?.map((l) => (
                    <option key={l.id} value={l.id}>{l.naam} (€{l.tarief}/m²)</option>
                  ))}
                </select>
              </div>
              {order.legger_naam && (
                <>
                  <div><span className="text-muted">Naam:</span> <span className="text-foreground">{order.legger_naam}</span></div>
                  <div><span className="text-muted">Prijs:</span> <span className="text-foreground">{order.legger_prijs ? `€ ${formatEuro(order.legger_prijs)}` : "—"}</span></div>
                  {nettoLegger !== null && (
                    <div><span className="text-muted">Netto uitbetaling:</span> <span className="text-green-400">€ {formatEuro(nettoLegger)}</span></div>
                  )}
                  <div><span className="text-muted">Geaccepteerd:</span> <span className="text-foreground">{order.legger_geaccepteerd ? "Ja" : "Nee"}</span></div>
                </>
              )}
            </div>
          </div>
        </div>

        {order.opmerking && (
          <div className="mt-6 rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Opmerking</h2>
            <p className="text-sm text-muted">{order.opmerking}</p>
          </div>
        )}

        <div className="mt-6 text-xs text-muted/50">
          Aangemaakt: {formatDate(order.created_at)} | Laatst bijgewerkt: {formatDate(order.updated_at)}
        </div>

        <AuditTimeline entityId={order.id} entityType="order" />
      </div>

      <FactuurModal
        order={order}
        settings={settings}
        open={showFactuur}
        onClose={() => setShowFactuur(false)}
      />
    </DashboardLayout>
  );
}
