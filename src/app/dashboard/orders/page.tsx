"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { OrdersList } from "@/components/modules/orders/orders-list";

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Orders
        </h1>
        <p className="mt-2 text-muted">
          Overzicht van alle orders.
        </p>
        <div className="mt-6">
          <OrdersList />
        </div>
      </div>
    </DashboardLayout>
  );
}
