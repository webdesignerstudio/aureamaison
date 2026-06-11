"use client";

import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";

export default function LeggerAgendaPage() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders(user?.company_id);

  const myOrders = orders?.filter((o) => o.legger_id === user?.id && o.legger_geaccepteerd) || [];

  // Group by month
  const byMonth = new Map<string, typeof myOrders>();
  myOrders.forEach((o) => {
    const date = o.datum || o.created_at;
    const key = new Date(date).toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    const existing = byMonth.get(key) || [];
    existing.push(o);
    byMonth.set(key, existing);
  });

  if (isLoading) {
    return (
      <LeggerLayout>
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      </LeggerLayout>
    );
  }

  return (
    <LeggerLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Agenda
        </h1>
        <p className="mt-2 text-muted">Overzicht van uw aangenomen klussen per maand.</p>

        <div className="mt-6 space-y-6">
          {Array.from(byMonth.entries()).map(([month, items]) => (
            <div key={month} className="rounded-xl border border-gold/10 bg-deep p-6">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">{month}</h2>
              <div className="space-y-3">
                {items.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border border-gold/5 bg-background/50 p-4">
                    <div>
                      <Link href={`/legger/klus/${o.id}`} className="font-medium text-foreground hover:text-gold">
                        {o.client_name}
                      </Link>
                      <div className="text-xs text-muted">{o.straat}, {o.plaats} · {o.vloer_type || "—"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={o.status} />
                      <span className="text-xs text-muted">
                        {o.datum ? new Date(o.datum).toLocaleDateString("nl-NL", { day: "2-digit" }) : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {byMonth.size === 0 && (
            <div className="rounded-xl border border-gold/10 bg-deep p-8 text-center text-muted">
              Geen aangenomen klussen gevonden.
            </div>
          )}
        </div>
      </div>
    </LeggerLayout>
  );
}
