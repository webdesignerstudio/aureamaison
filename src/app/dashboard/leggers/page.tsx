"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LeggersList } from "@/components/modules/leggers/leggers-list";

export default function LeggersPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Leggers
        </h1>
        <p className="mt-2 text-muted">
          Overzicht van alle vloerenleggers.
        </p>
        <div className="mt-6">
          <LeggersList />
        </div>
      </div>
    </DashboardLayout>
  );
}
