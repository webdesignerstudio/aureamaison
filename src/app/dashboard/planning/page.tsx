"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useLeggers } from "@/hooks/use-leggers";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatEuro } from "@/lib/utils";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function PlanningPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: orders, isLoading: ordersLoading } = useOrders(companyId);
  const { data: leggers } = useLeggers(companyId);

  const [filterStatus, setFilterStatus] = useState<string>("Alles");
  const [filterLegger, setFilterLegger] = useState<string>("Alles");
  const [search, setSearch] = useState("");

  const loading = ordersLoading;

  // Orders die een datum hebben = planningsitems
  const planOrders = useMemo(() => {
    if (!orders) return [];
    return orders
      .filter((o) => o.datum || o.legger_id)
      .sort((a, b) => {
        const da = a.datum ? new Date(a.datum).getTime() : 0;
        const db = b.datum ? new Date(b.datum).getTime() : 0;
        return da - db;
      });
  }, [orders]);

  // Groepeer per maand
  const grouped = useMemo(() => {
    const map = new Map<string, typeof planOrders>();
    for (const o of planOrders) {
      const key = o.datum
        ? new Date(o.datum).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })
        : "Geen datum";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return map;
  }, [planOrders]);

  // Filters toepassen
  const filteredOrders = useMemo(() => {
    return planOrders.filter((o) => {
      const statusMatch = filterStatus === "Alles" || o.status === filterStatus;
      const leggerMatch = filterLegger === "Alles" || o.legger_id === filterLegger;
      const searchMatch =
        !search.trim() ||
        o.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.straat?.toLowerCase().includes(search.toLowerCase()) ||
        o.plaats?.toLowerCase().includes(search.toLowerCase());
      return statusMatch && leggerMatch && searchMatch;
    });
  }, [planOrders, filterStatus, filterLegger, search]);

  const filteredGrouped = useMemo(() => {
    const map = new Map<string, typeof filteredOrders>();
    for (const o of filteredOrders) {
      const key = o.datum
        ? new Date(o.datum).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })
        : "Geen datum";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return map;
  }, [filteredOrders]);

  const statuses = ["Alles", "gepland", "bezig", "ter goedkeuring", "afgerond"];

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
          Planning
        </h1>
        <p className="mt-2 text-muted">
          Overzicht van geplande klussen per maand.
        </p>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          {/* Zoeken */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op klant of adres..."
            className="rounded-lg border border-gold/10 bg-background px-4 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
          />

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s === "Alles" ? "Alle statussen" : s}</option>
            ))}
          </select>

          {/* Legger filter */}
          <select
            value={filterLegger}
            onChange={(e) => setFilterLegger(e.target.value)}
            className="rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
          >
            <option value="Alles">Alle leggers</option>
            {leggers?.map((l) => (
              <option key={l.id} value={l.id}>{l.naam}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gold/10 bg-deep p-4">
            <div className="text-xs text-muted uppercase tracking-wider">Gepland</div>
            <div className="mt-1 text-xl font-semibold text-gold">
              {planOrders.filter((o) => o.status === "gepland").length}
            </div>
          </div>
          <div className="rounded-xl border border-gold/10 bg-deep p-4">
            <div className="text-xs text-muted uppercase tracking-wider">Bezig</div>
            <div className="mt-1 text-xl font-semibold text-blue-400">
              {planOrders.filter((o) => o.status === "bezig").length}
            </div>
          </div>
          <div className="rounded-xl border border-gold/10 bg-deep p-4">
            <div className="text-xs text-muted uppercase tracking-wider">Afgerond</div>
            <div className="mt-1 text-xl font-semibold text-green-400">
              {planOrders.filter((o) => o.status === "afgerond").length}
            </div>
          </div>
        </div>

        {/* Planning per maand */}
        <div className="mt-8 space-y-8">
          {Array.from(filteredGrouped.entries()).map(([month, items]) => (
            <div key={month}>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-gold">
                {month}
              </h2>
              <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                      <th className="px-4 py-3">Datum</th>
                      <th className="px-4 py-3">Klant</th>
                      <th className="px-4 py-3">Adres</th>
                      <th className="px-4 py-3">Vloer</th>
                      <th className="px-4 py-3">Legger</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Prijs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/5">
                    {items.map((order) => (
                      <tr key={order.id} className="hover:bg-gold/5">
                        <td className="px-4 py-3 text-sm text-muted">
                          {order.datum ? formatDate(order.datum) : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          <Link href={`/dashboard/orders/${order.id}`} className="hover:text-gold">
                            {order.client_name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">
                          {order.straat}, {order.plaats}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">
                          {order.vloer_type || "—"}
                          {order.oppervlakte && (
                            <span className="ml-1 text-xs">({order.oppervlakte} m²)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">
                          {order.legger_naam || (
                            <span className="text-red-400/70 text-xs">Niet toegewezen</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-muted">
                          {order.price ? `€ ${formatEuro(order.price)}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="rounded-xl border border-gold/10 bg-deep p-8 text-center text-muted">
              Geen geplande klussen gevonden.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
