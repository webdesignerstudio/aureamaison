"use client";

import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { formatEuro, formatDate } from "@/lib/utils";
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

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Mijn Facturen
        </h1>
        <p className="mt-2 text-muted">
          Overzicht van al uw facturen.
        </p>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gold/10 bg-deep p-5">
            <div className="text-xs text-muted uppercase tracking-wider">Totaal facturen</div>
            <div className="mt-1 text-2xl font-semibold text-gold">{orders.length}</div>
          </div>
          <div className="rounded-xl border border-gold/10 bg-deep p-5">
            <div className="text-xs text-muted uppercase tracking-wider">Openstaand</div>
            <div className="mt-1 text-2xl font-semibold text-red-400">
              € {formatEuro(totaalOpen)}
            </div>
          </div>
          <div className="rounded-xl border border-gold/10 bg-deep p-5">
            <div className="text-xs text-muted uppercase tracking-wider">Betaald</div>
            <div className="mt-1 text-2xl font-semibold text-green-400">
              € {formatEuro(totaalBetaald)}
            </div>
          </div>
        </div>

        {/* Openstaande facturen */}
        {openFacturen.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-red-400">
              Openstaand
            </h2>
            <div className="overflow-hidden rounded-xl border border-red-500/10 bg-deep">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Factuurnr</th>
                    <th className="px-4 py-3">Vloer</th>
                    <th className="px-4 py-3 text-right">Bedrag</th>
                    <th className="px-4 py-3">Datum</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {openFacturen.map((order) => (
                    <tr key={order.id} className="hover:bg-gold/5">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {order.invoice_nr}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {order.vloer_type || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-red-400">
                        € {formatEuro(order.price || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formatDate(order.invoice_date || order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Betaalde facturen */}
        {betaaldeFacturen.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-green-400">
              Betaald
            </h2>
            <div className="overflow-hidden rounded-xl border border-green-500/10 bg-deep">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Factuurnr</th>
                    <th className="px-4 py-3">Vloer</th>
                    <th className="px-4 py-3 text-right">Bedrag</th>
                    <th className="px-4 py-3">Betaald op</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {betaaldeFacturen.map((order) => (
                    <tr key={order.id} className="hover:bg-gold/5">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {order.invoice_nr}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {order.vloer_type || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-green-400">
                        € {formatEuro(order.price || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formatDate(order.invoice_paid_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {orders.length === 0 && (
          <div className="mt-8 rounded-xl border border-gold/10 bg-deep p-8 text-center text-muted">
            U heeft nog geen facturen.
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
