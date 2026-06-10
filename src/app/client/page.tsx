"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useOffertes } from "@/hooks/use-offertes";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

export default function ClientPortalPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data: orders, isLoading: ordersLoading } = useOrders(companyId);
  const { data: offertes, isLoading: offertesLoading } = useOffertes(companyId);

  const loading = ordersLoading || offertesLoading;

  // TODO: Filter by current client email
  const myOrders = orders || [];
  const myOffertes = offertes || [];

  if (loading) {
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
          Mijn Account
        </h1>
        <p className="mt-2 text-muted">
          Overzicht van uw orders en offertes.
        </p>

        <div className="mt-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
            Mijn Orders
          </h2>
          <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
            {myOrders.length === 0 ? (
              <div className="p-8 text-center text-muted">
                Geen orders gevonden.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Vloer</th>
                    <th className="px-4 py-3">Datum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {myOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gold/5">
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {order.vloer_type || "—"}
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

        <div className="mt-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
            Mijn Offertes
          </h2>
          <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
            {myOffertes.length === 0 ? (
              <div className="p-8 text-center text-muted">
                Geen offertes gevonden.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Vloer</th>
                    <th className="px-4 py-3">Datum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {myOffertes.map((offerte) => (
                    <tr key={offerte.id} className="hover:bg-gold/5">
                      <td className="px-4 py-3">
                        <StatusBadge status={offerte.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {offerte.vloer_type || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formatDate(offerte.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
