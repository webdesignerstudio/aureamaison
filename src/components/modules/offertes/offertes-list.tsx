"use client";

import { useOffertes } from "@/hooks/use-offertes";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

export function OffertesList() {
  const { data: offertes, isLoading, error } = useOffertes();

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
        Er is een fout opgetreden bij het laden van de offertes.
      </div>
    );
  }

  if (!offertes || offertes.length === 0) {
    return (
      <div className="rounded-lg border border-gold/10 bg-deep p-8 text-center">
        <p className="text-muted">Nog geen offertes gevonden.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gold/10 bg-deep">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3">Klant</th>
              <th className="px-4 py-3">Vloer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Budget</th>
              <th className="px-4 py-3">Datum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {offertes.map((offerte) => (
              <tr
                key={offerte.id}
                className="transition-colors hover:bg-gold/5"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">
                    {offerte.client_name}
                  </div>
                  <div className="text-xs text-muted">{offerte.client_email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {offerte.vloer_type || "—"}
                  {offerte.oppervlakte && (
                    <span className="ml-1 text-xs">({offerte.oppervlakte} m²)</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={offerte.status} />
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                  {offerte.budget ? `€ ${offerte.budget.toLocaleString("nl-NL")}` : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {formatDate(offerte.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
