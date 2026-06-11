"use client";

import Link from "next/link";
import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, formatEuro } from "@/lib/utils";
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

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Mijn Account
        </h1>
        <p className="mt-2 text-muted">Overzicht van uw orders en offertes.</p>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-gold">Mijn Orders</h2>
            <Link href="/client/opdracht" className="text-xs text-gold hover:underline">+ Nieuwe opdracht</Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-muted">Geen orders gevonden.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Vloer</th>
                    <th className="px-4 py-3">Prijs</th>
                    <th className="px-4 py-3">Factuur</th>
                    <th className="px-4 py-3">Datum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gold/5">
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-sm text-muted">{order.vloer_type || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted">{order.price ? `€ ${formatEuro(order.price)}` : "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        {order.invoice_paid ? (
                          <span className="text-green-400">Betaald ✓</span>
                        ) : order.invoice_nr ? (
                          <span className="text-gold">Open</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Mijn Offertes</h2>
          <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
            {offertes.length === 0 ? (
              <div className="p-8 text-center text-muted">Geen offertes gevonden.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Vloer</th>
                    <th className="px-4 py-3">Budget</th>
                    <th className="px-4 py-3">Datum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {offertes.map((offerte) => (
                    <tr key={offerte.id} className="hover:bg-gold/5">
                      <td className="px-4 py-3"><StatusBadge status={offerte.status} /></td>
                      <td className="px-4 py-3 text-sm text-muted">{offerte.vloer_type || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted">{offerte.budget ? `€ ${formatEuro(offerte.budget)}` : "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted">{formatDate(offerte.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
