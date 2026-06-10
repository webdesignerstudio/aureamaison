"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useOrders } from "@/hooks/use-orders";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

export default function LeggerPortalPage() {
  const { data: orders, isLoading } = useOrders();

  // TODO: Filter orders assigned to current legger
  const myOrders = orders || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Mijn Klussen
        </h1>
        <p className="mt-2 text-muted">
          Overzicht van uw toegewezen klussen.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-gold/10 bg-deep">
          {myOrders.length === 0 ? (
            <div className="p-8 text-center text-muted">
              Geen klussen toegewezen.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Klant</th>
                  <th className="px-4 py-3">Adres</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {myOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gold/5">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {order.client_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {order.straat}, {order.plaats}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {formatDate(order.created_at)}
                    </td>
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
