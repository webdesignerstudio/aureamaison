"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { OffertesList } from "@/components/modules/offertes/offertes-list";

export default function OffertesPage() {
  const { user } = useAuth();
  return (
    <DashboardLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Offertes
        </h1>
        <p className="mt-2 text-muted">
          Overzicht van alle offertes.
        </p>
        <div className="mt-6">
          <OffertesList companyId={user?.company_id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
