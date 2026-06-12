"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useOffertes } from "@/hooks/use-offertes";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatEuro, formatDate } from "@/lib/utils";
import Link from "next/link";

function KPICard({
  title,
  value,
  sub,
  color = "gold",
}: {
  title: string;
  value: string;
  sub?: string;
  color?: "gold" | "green" | "red" | "blue";
}) {
  const colorClasses = {
    gold: "text-gold",
    green: "text-green-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };
  return (
    <div className="rounded-xl border border-gold/10 bg-deep p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted">
        {title}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${colorClasses[color]}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export default function FinancieelPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: orders, isLoading: ordersLoading } = useOrders(companyId);
  const { data: offertes, isLoading: offertesLoading } = useOffertes(companyId);

  const loading = ordersLoading || offertesLoading;

  // ── FINANCIËLE BEREKENINGEN ──
  const allOrders = orders || [];

  // Omzet: alle orders met een prijs (ongeacht status — dit is de totale contractwaarde)
  const omzetOrders = allOrders.filter((o) => o.price && o.price > 0);
  const totaleOmzet = omzetOrders.reduce((s, o) => s + (o.price || 0), 0);

  // Betaald: gefactureerd EN betaald
  const betaaldOrders = allOrders.filter((o) => o.invoice_paid && o.price);
  const totaalBetaald = betaaldOrders.reduce((s, o) => s + (o.price || 0), 0);

  // Openstaand: gefactureerd maar NIET betaald
  const openOrders = allOrders.filter(
    (o) => o.invoice_nr && !o.invoice_paid && o.price
  );
  const totaalOpen = openOrders.reduce((s, o) => s + (o.price || 0), 0);

  // Prognose: orders met prijs die nog niet gefactureerd zijn (pipeline)
  const prognoseStatuses = ["ingediend", "in behandeling", "offerte verstuurd", "gepland", "bezig", "ter goedkeuring"];
  const prognoseOrders = allOrders.filter(
    (o) => o.price && !o.invoice_nr && prognoseStatuses.includes(o.status)
  );
  const totaalPrognose = prognoseOrders.reduce((s, o) => s + (o.price || 0), 0);

  // Offertes
  const pendingOffertes = (offertes || []).filter((o) => o.status === "ingediend");
  const totaalOfferteBudget = pendingOffertes.reduce((s, o) => s + (o.budget || 0), 0);

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
          Financieel
        </h1>
        <p className="mt-2 text-muted">
          Overzicht van omzet, betalingen en prognoses.
        </p>

        {/* KPI Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Totale omzet"
            value={`€ ${formatEuro(totaleOmzet)}`}
            sub={`${omzetOrders.length} orders`}
            color="gold"
          />
          <KPICard
            title="Betaald"
            value={`€ ${formatEuro(totaalBetaald)}`}
            sub={`${betaaldOrders.length} facturen`}
            color="green"
          />
          <KPICard
            title="Openstaand"
            value={`€ ${formatEuro(totaalOpen)}`}
            sub={`${openOrders.length} facturen`}
            color="red"
          />
          <KPICard
            title="Prognose"
            value={`€ ${formatEuro(totaalPrognose)}`}
            sub={`${prognoseOrders.length} in pipeline`}
            color="blue"
          />
        </div>

        {/* Offertes overzicht */}
        <div className="mt-6 rounded-xl border border-gold/10 bg-deep p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted">
                Open offertes
              </div>
              <div className="mt-1 text-2xl font-semibold text-gold">
                {pendingOffertes.length}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted">Totaal budget</div>
              <div className="text-lg font-semibold text-foreground">
                € {formatEuro(totaalOfferteBudget)}
              </div>
            </div>
          </div>
        </div>

        {/* Openstaande facturen tabel */}
        {openOrders.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Openstaande facturen
            </h2>
            <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Factuurnr</th>
                    <th className="px-4 py-3">Klant</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Bedrag</th>
                    <th className="px-4 py-3">Datum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {openOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gold/5">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        <Link href={`/dashboard/orders/${order.id}`} className="hover:text-gold">
                          {order.invoice_nr}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{order.client_name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-red-400">
                        € {formatEuro(order.price || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {formatDate(order.invoice_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Betaalde facturen tabel */}
        {betaaldOrders.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Betaalde facturen
            </h2>
            <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Factuurnr</th>
                    <th className="px-4 py-3">Klant</th>
                    <th className="px-4 py-3 text-right">Bedrag</th>
                    <th className="px-4 py-3">Betaald op</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {betaaldOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gold/5">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        <Link href={`/dashboard/orders/${order.id}`} className="hover:text-gold">
                          {order.invoice_nr}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{order.client_name}</td>
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

        {/* Pipeline / Prognose */}
        {prognoseOrders.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Pipeline (prognose)
            </h2>
            <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Klant</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Verwachte omzet</th>
                    <th className="px-4 py-3">Vloer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {prognoseOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gold/5">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        <Link href={`/dashboard/orders/${order.id}`} className="hover:text-gold">
                          {order.client_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-blue-400">
                        € {formatEuro(order.price || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {order.vloer_type || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
