"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useOffertes } from "@/hooks/use-offertes";
import { useLeggers } from "@/hooks/use-leggers";
import { Spinner } from "@/components/ui/spinner";
import { formatEuro } from "@/lib/utils";

function KPICard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-gold/10 bg-deep p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold text-gold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: orders, isLoading: ordersLoading } = useOrders(companyId);
  const { data: offertes, isLoading: offertesLoading } = useOffertes(companyId);
  const { data: leggers, isLoading: leggersLoading } = useLeggers(companyId);

  const loading = ordersLoading || offertesLoading || leggersLoading;

  const totalOrders = orders?.length || 0;
  const openOrders = orders?.filter((o) => o.status !== "afgerond" && o.status !== "afgewezen").length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;
  const pendingOffertes = offertes?.filter((o) => o.status === "ingediend").length || 0;
  const activeLeggers = leggers?.filter((l) => l.status === "actief").length || 0;

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
          Dashboard
        </h1>
        <p className="mt-2 text-muted">
          Overzicht van uw bedrijfsprestaties.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Totaal orders" value={totalOrders} sub={`${openOrders} openstaand`} />
          <KPICard title="Omzet" value={`€ ${formatEuro(totalRevenue)}`} />
          <KPICard title="Open offertes" value={pendingOffertes} />
          <KPICard title="Actieve leggers" value={activeLeggers} />
        </div>
      </div>
    </DashboardLayout>
  );
}
