"use client";

import Link from "next/link";
import { useOrders } from "@/hooks/use-orders";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { formatEuro, formatDate } from "@/lib/utils";

export function OrdersList() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        Er is een fout opgetreden bij het laden van de orders.
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-lg border border-gold/10 bg-deep p-8 text-center">
        <p className="text-muted">Nog geen orders gevonden.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3">Klant</th>
              <th className="px-4 py-3">Vloer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Prijs</th>
              <th className="px-4 py-3">Datum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="cursor-pointer transition-colors hover:bg-gold/5"
              >
                <td className="px-4 py-3">
                  <Link href={`/dashboard/orders/${order.id}`} className="block">
                    <div className="font-medium text-foreground">
                      {order.client_name}
                    </div>
                    <div className="text-xs text-muted">
                      {order.straat}, {order.plaats}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {order.vloer_type || "—"}
                  {order.oppervlakte && (
                    <span className="ml-1 text-xs">
                      ({order.oppervlakte} m²)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                  {order.price ? `€ ${formatEuro(order.price)}` : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {formatDate(order.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
