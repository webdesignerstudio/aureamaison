"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Dashboard
        </h1>
        <p className="mt-2 text-muted">
          Welkom bij Aurea Maison Floors. Selecteer een sectie in het menu.
        </p>
      </div>
    </DashboardLayout>
  );
}
