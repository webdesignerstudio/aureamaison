"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SettingsForm } from "@/components/modules/settings/settings-form";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Instellingen
        </h1>
        <p className="mt-2 text-muted">
          Bedrijfsgegevens en factuurinstellingen beheren.
        </p>
        <div className="mt-6 rounded-xl border border-gold/10 bg-deep p-6">
          <SettingsForm companyId="11111111-1111-1111-1111-111111111111" />
        </div>
      </div>
    </DashboardLayout>
  );
}
