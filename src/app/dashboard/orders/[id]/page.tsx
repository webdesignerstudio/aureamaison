"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { GoldButton } from "@/components/ui/gold-button";
import { Spinner } from "@/components/ui/spinner";
import { formatEuro, formatDate } from "@/lib/utils";
import { printInvoice } from "@/lib/invoice";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setOrder(data as Order);
        }
        setLoading(false);
      });
  }, [id]);

  const handlePrint = () => {
    if (!order) return;
    const settings = {
      bedrijf_naam: "Aurea Maison Floors",
      bedrijf_adres: "Zuidwijkstraat 28",
      bedrijf_postcode: "2729 KD",
      bedrijf_plaats: "Zoetermeer",
      bedrijf_tel: "06 28 27 35 70",
      bedrijf_email: "Aureamaisonfloors@gmail.com",
      kvk: "42032896",
      btw: "NL00544489B03",
      iban: "NL66 KNAB 0800 1498 74",
      factuur_btw_pct: 21,
      factuur_betaal_termijn: 14,
      factuur_voetnoot: "",
    };
    printInvoice(order, settings);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error || "Order niet gevonden."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
              Order {order.uaid || order.id.slice(0, 8)}
            </h1>
            <div className="mt-2">
              <StatusBadge status={order.status} />
            </div>
          </div>
          <GoldButton variant="outline" onClick={handlePrint}>
            Factuur printen
          </GoldButton>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Klantgegevens
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted">Naam:</span>{" "}
                <span className="text-foreground">{order.client_name}</span>
              </div>
              <div>
                <span className="text-muted">E-mail:</span>{" "}
                <span className="text-foreground">{order.client_email}</span>
              </div>
              <div>
                <span className="text-muted">Adres:</span>{" "}
                <span className="text-foreground">
                  {order.straat}, {order.postcode} {order.plaats}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Projectdetails
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted">Vloertype:</span>{" "}
                <span className="text-foreground">{order.vloer_type || "—"}</span>
              </div>
              <div>
                <span className="text-muted">Oppervlakte:</span>{" "}
                <span className="text-foreground">
                  {order.oppervlakte ? `${order.oppervlakte} m²` : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted">Ondergrond:</span>{" "}
                <span className="text-foreground">{order.ondergrond || "—"}</span>
              </div>
              <div>
                <span className="text-muted">Timing:</span>{" "}
                <span className="text-foreground">{order.timing || "—"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Financieel
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted">Prijs:</span>{" "}
                <span className="text-foreground">
                  {order.price ? `€ ${formatEuro(order.price)}` : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted">Budget:</span>{" "}
                <span className="text-foreground">
                  {order.budget ? `€ ${formatEuro(order.budget)}` : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted">Factuurnr:</span>{" "}
                <span className="text-foreground">{order.invoice_nr || "—"}</span>
              </div>
              <div>
                <span className="text-muted">Betaald:</span>{" "}
                <span className="text-foreground">
                  {order.invoice_paid ? "Ja" : "Nee"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Legger
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted">Naam:</span>{" "}
                <span className="text-foreground">{order.legger_naam || "—"}</span>
              </div>
              <div>
                <span className="text-muted">Prijs:</span>{" "}
                <span className="text-foreground">
                  {order.legger_prijs
                    ? `€ ${formatEuro(order.legger_prijs)}`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {order.opmerking && (
          <div className="mt-6 rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">
              Opmerking
            </h2>
            <p className="text-sm text-muted">{order.opmerking}</p>
          </div>
        )}

        <div className="mt-6 text-xs text-muted/50">
          Aangemaakt: {formatDate(order.created_at)} | Laatst bijgewerkt:{" "}
          {formatDate(order.updated_at)}
        </div>
      </div>
    </DashboardLayout>
  );
}
