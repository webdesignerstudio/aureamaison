"use client";

import { useParams, useRouter } from "next/navigation";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { useUpdateOrder } from "@/hooks/use-orders";
import { useToastContext } from "@/components/toast-provider";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

export default function LeggerKlusPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const toast = useToastContext();
  const updateOrder = useUpdateOrder();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [opleverOpmerking, setOpleverOpmerking] = useState("");
  const [showOplever, setShowOplever] = useState(false);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) { console.error(error); }
        else { setOrder(data as Order); }
        setLoading(false);
      });
  }, [id]);

  const handleStart = async () => {
    if (!order) return;
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        status: "bezig",
        legger_gestart_at: new Date().toISOString(),
      });
      setOrder((prev) => prev ? { ...prev, status: "bezig", legger_gestart_at: new Date().toISOString() } : null);
      toast.success("Klus gestart");
    } catch {
      toast.error("Starten mislukt");
    }
  };

  const handleFinish = async () => {
    if (!order) return;
    try {
      await updateOrder.mutateAsync({
        id: order.id,
        status: "ter goedkeuring",
        legger_afgerond_at: new Date().toISOString(),
        opmerking: opleverOpmerking || order.opmerking,
      });
      setOrder((prev) => prev ? { ...prev, status: "ter goedkeuring", legger_afgerond_at: new Date().toISOString() } : null);
      setShowOplever(false);
      toast.success("Klus afgerond, wacht op goedkeuring");
    } catch {
      toast.error("Afronden mislukt");
    }
  };

  if (loading) {
    return (
      <LeggerLayout>
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      </LeggerLayout>
    );
  }

  if (!order) {
    return (
      <LeggerLayout>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">Klus niet gevonden.</div>
      </LeggerLayout>
    );
  }

  return (
    <LeggerLayout>
      <div>
        <button onClick={() => router.push("/legger")} className="mb-4 text-xs text-muted hover:text-gold">← Terug naar overzicht</button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
              Klus {order.uaid || order.id.slice(0, 8)}
            </h1>
            <div className="mt-2"><StatusBadge status={order.status} /></div>
          </div>

          {order.status === "gepland" && (
            <button onClick={handleStart} disabled={updateOrder.isPending}
              className="rounded-lg bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-400 hover:bg-blue-500/20 disabled:opacity-50">
              ▶ Starten
            </button>
          )}
          {order.status === "bezig" && (
            <button onClick={() => setShowOplever(true)} disabled={updateOrder.isPending}
              className="rounded-lg bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-400 hover:bg-green-500/20 disabled:opacity-50">
              ✓ Afronden
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Klant</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Naam:</span> <span className="text-foreground">{order.client_name}</span></div>
              <div><span className="text-muted">Email:</span> <span className="text-foreground">{order.client_email}</span></div>
              <div><span className="text-muted">Adres:</span> <span className="text-foreground">{order.straat}, {order.postcode} {order.plaats}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Project</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Vloertype:</span> <span className="text-foreground">{order.vloer_type || "—"}</span></div>
              <div><span className="text-muted">Oppervlakte:</span> <span className="text-foreground">{order.oppervlakte ? `${order.oppervlakte} m²` : "—"}</span></div>
              <div><span className="text-muted">Ondergrond:</span> <span className="text-foreground">{order.ondergrond || "—"}</span></div>
              {order.datum && <div><span className="text-muted">Datum:</span> <span className="text-foreground">{formatDate(order.datum)}</span></div>}
            </div>
          </div>

          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Financieel</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Uw prijs:</span> <span className="text-foreground">{order.legger_prijs ? `€ ${order.legger_prijs}` : "—"}</span></div>
              <div><span className="text-muted">Gestart:</span> <span className="text-foreground">{order.legger_gestart_at ? formatDate(order.legger_gestart_at) : "—"}</span></div>
              <div><span className="text-muted">Afgerond:</span> <span className="text-foreground">{order.legger_afgerond_at ? formatDate(order.legger_afgerond_at) : "—"}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Opmerking eigenaar</h2>
            <p className="text-sm text-muted">{order.opmerking || "Geen opmerkingen."}</p>
          </div>
        </div>
      </div>

      {/* Oplever modal */}
      {showOplever && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-green-500/20 bg-deep p-6">
            <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-green-400">Klus afronden</h3>
            <p className="mt-2 text-sm text-muted">Bevestig dat de klus volledig is afgerond.</p>
            <textarea
              value={opleverOpmerking}
              onChange={(e) => setOpleverOpmerking(e.target.value)}
              placeholder="Opmerkingen over de klus..."
              rows={3}
              className="mt-4 w-full rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
            />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowOplever(false)} className="flex-1 rounded-lg border border-gold/10 px-4 py-2 text-xs font-bold uppercase text-muted hover:text-foreground">
                Annuleren
              </button>
              <button onClick={handleFinish} disabled={updateOrder.isPending} className="flex-1 rounded-lg bg-green-500/10 px-4 py-2 text-xs font-bold uppercase text-green-400 hover:bg-green-500/20">
                {updateOrder.isPending ? "Bezig..." : "Bevestig afronding"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LeggerLayout>
  );
}
