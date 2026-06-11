"use client";

import Link from "next/link";
import { useLeggers } from "@/hooks/use-leggers";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";

interface LeggersListProps {
  companyId?: string | null;
}

export function LeggersList({ companyId }: LeggersListProps) {
  const { data: leggers, isLoading, error } = useLeggers(companyId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        Er is een fout opgetreden bij het laden van de leggers.
      </div>
    );
  }

  if (!leggers || leggers.length === 0) {
    return (
      <div className="rounded-lg border border-gold/10 bg-deep p-8 text-center">
        <p className="text-muted">Nog geen leggers gevonden.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3">Naam</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3 text-right">Tarief</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {leggers.map((legger) => (
              <tr
                key={legger.id}
                className="transition-colors hover:bg-gold/5"
              >
                <td className="px-4 py-3">
                  <Link href={`/dashboard/leggers/${legger.id}`} className="font-medium text-foreground hover:text-gold">
                    {legger.naam}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  <div>{legger.email}</div>
                  {legger.telefoon && (
                    <div className="text-xs">{legger.telefoon}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={legger.status} />
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {legger.tier}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                  {legger.tarief ? `€ ${legger.tarief.toLocaleString("nl-NL")}/m²` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
