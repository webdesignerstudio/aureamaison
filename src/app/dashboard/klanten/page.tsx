"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Spinner } from "@/components/ui/spinner";
import { formatEuro, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import type { Order } from "@/types";

export default function KlantenPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data: orders, isLoading } = useOrders(companyId);

  // Group orders by client email
  const klantenMap = new Map<string, { naam: string; email: string; orders: Order[]; totaal: number }>();
  orders?.forEach((o) => {
    const existing = klantenMap.get(o.client_email);
    if (existing) {
      existing.orders.push(o);
      if (o.price) existing.totaal += o.price;
    } else {
      klantenMap.set(o.client_email, {
        naam: o.client_name,
        email: o.client_email,
        orders: [o],
        totaal: o.price || 0,
      });
    }
  });
  const klanten = Array.from(klantenMap.values()).sort((a, b) => b.totaal - a.totaal);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Klanten
        </h1>
        <p className="mt-2 text-muted">Overzicht van alle klanten.</p>

        <div className="mt-6 overflow-hidden rounded-xl border border-gold/10 bg-deep">
          {klanten.length === 0 ? (
            <div className="p-8 text-center text-muted">Geen klanten gevonden.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Naam</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Totale omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {klanten.map((k) => (
                  <tr key={k.email} className="hover:bg-gold/5">
                    <td className="px-4 py-3 font-medium text-foreground">{k.naam}</td>
                    <td className="px-4 py-3 text-sm text-muted">{k.email}</td>
                    <td className="px-4 py-3 text-sm text-muted">{k.orders.length}</td>
                    <td className="px-4 py-3 text-sm text-gold">€ {formatEuro(k.totaal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
