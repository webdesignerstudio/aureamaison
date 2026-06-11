"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { useLeggers } from "@/hooks/use-leggers";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";

export default function LeggerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: leggers, isLoading: leggerLoading } = useLeggers(companyId);
  const { data: orders, isLoading: ordersLoading } = useOrders(companyId);

  const legger = leggers?.find((l) => l.id === id);
  const leggerOrders = orders?.filter((o) => o.legger_id === id) || [];
  const afgerond = leggerOrders.filter((o) => o.status === "afgerond");

  if (leggerLoading || ordersLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!legger) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          Legger niet gevonden.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
            {legger.naam}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={legger.status === "actief" ? "afgerond" : "afgewezen"} />
            <span className="text-sm text-muted">Tier {legger.tier}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Contact</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Email:</span> <span className="text-foreground">{legger.email}</span></div>
              <div><span className="text-muted">Telefoon:</span> <span className="text-foreground">{legger.telefoon || "—"}</span></div>
              <div><span className="text-muted">Adres:</span> <span className="text-foreground">{legger.adres || "—"}</span></div>
              {legger.stad && <div><span className="text-muted">Stad:</span> <span className="text-foreground">{legger.stad}</span></div>}
            </div>
          </div>

          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Bedrijfsgegevens</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">KvK:</span> <span className="text-foreground">{legger.kvk || "—"}</span></div>
              <div><span className="text-muted">BTW:</span> <span className="text-foreground">{legger.btw || "—"}</span></div>
              <div><span className="text-muted">IBAN:</span> <span className="text-foreground">{legger.iban || "—"}</span></div>
              <div><span className="text-muted">Tarief:</span> <span className="text-foreground">{legger.tarief ? `€ ${legger.tarief}/m²` : "—"}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Statistieken</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Totaal klussen:</span> <span className="text-foreground">{leggerOrders.length}</span></div>
              <div><span className="text-muted">Afgerond:</span> <span className="text-foreground">{afgerond.length}</span></div>
              <div className="flex items-center gap-1">
                <span className="text-muted">Beoordeling:</span>
                <span className="text-gold">★★★☆☆</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Klussen</h2>
          <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
            {leggerOrders.length === 0 ? (
              <div className="p-8 text-center text-muted">Geen klussen toegewezen.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Klant</th>
                    <th className="px-4 py-3">Adres</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Prijs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {leggerOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gold/5">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/orders/${o.id}`} className="font-medium text-foreground hover:text-gold">
                          {o.client_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{o.straat}, {o.plaats}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                      <td className="px-4 py-3 text-sm text-muted">{o.price ? `€ ${o.price}` : "—"}</td>
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
