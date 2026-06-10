"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { OrdersList } from "@/components/modules/orders/orders-list";
import { OrderForm } from "@/components/modules/orders/order-form";
import { GoldButton } from "@/components/ui/gold-button";

export default function OrdersPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
              Orders
            </h1>
            <p className="mt-2 text-muted">
              Overzicht van alle orders.
            </p>
          </div>
          <GoldButton onClick={() => setShowForm(true)}>
            + Nieuwe order
          </GoldButton>
        </div>

        {showForm && (
          <div className="mb-8 rounded-xl border border-gold/10 bg-deep p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wider text-gold">
                Nieuwe order aanmaken
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-xs text-muted hover:text-foreground"
              >
                Annuleren
              </button>
            </div>
            <OrderForm
              companyId="temp-company-id"
              onSuccess={() => setShowForm(false)}
            />
          </div>
        )}

        <OrdersList />
      </div>
    </DashboardLayout>
  );
}
