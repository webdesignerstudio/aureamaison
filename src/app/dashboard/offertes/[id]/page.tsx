"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { GoldButton } from "@/components/ui/gold-button";
import { Spinner } from "@/components/ui/spinner";
import { formatEuro, formatDate } from "@/lib/utils";
import { useUpdateOfferte } from "@/hooks/use-offertes";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToastContext } from "@/components/toast-provider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Offerte } from "@/types";

export default function OfferteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const toast = useToastContext();
  const router = useRouter();
  const updateOfferte = useUpdateOfferte();
  const createOrder = useCreateOrder();

  const [offerte, setOfferte] = useState<Offerte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase
      .from("offertes")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error: fetchError }: { data: Offerte | null; error: { message: string } | null }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setOfferte(data);
        }
        setLoading(false);
      });
  }, [id]);

  const handleStatus = async (newStatus: Offerte["status"]) => {
    if (!offerte) return;
    try {
      await updateOfferte.mutateAsync({ id: offerte.id, status: newStatus });
      setOfferte((prev) => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Status: ${newStatus}`);
    } catch {
      toast.error("Status wijzigen mislukt");
    }
  };

  const handleConvertToOrder = async () => {
    if (!offerte) return;
    try {
      const newOrder = await createOrder.mutateAsync({
        client_name: offerte.client_name,
        client_email: offerte.client_email,
        vloer_type: offerte.vloer_type,
        oppervlakte: offerte.oppervlakte,
        budget: offerte.budget,
        status: "ingediend",
        company_id: offerte.company_id,
      });
      toast.success("Offerte omgezet naar order");
      router.push(`/dashboard/orders/${newOrder.id}`);
    } catch {
      toast.error("Omzetten mislukt");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  if (error || !offerte) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error || "Offerte niet gevonden."}
        </div>
      </DashboardLayout>
    );
  }

  const statusActions: Record<string, Offerte["status"][]> = {
    ingediend: ["verstuurd"],
    verstuurd: ["geaccepteerd", "afgewezen"],
  };
  const nextStatuses = statusActions[offerte.status] || [];

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
              Offerte
            </h1>
            <div className="mt-2"><StatusBadge status={offerte.status} /></div>
          </div>
          {offerte.status === "geaccepteerd" && (
            <GoldButton onClick={handleConvertToOrder}>
              Omzetten naar order
            </GoldButton>
          )}
        </div>

        {nextStatuses.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                disabled={updateOfferte.isPending}
                className="rounded-lg bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold transition hover:bg-gold/20 disabled:opacity-50"
              >
                → {s}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Klant</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Naam:</span> <span className="text-foreground">{offerte.client_name}</span></div>
              <div><span className="text-muted">Email:</span> <span className="text-foreground">{offerte.client_email}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-gold/10 bg-deep p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gold">Project</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted">Vloertype:</span> <span className="text-foreground">{offerte.vloer_type || "—"}</span></div>
              <div><span className="text-muted">Oppervlakte:</span> <span className="text-foreground">{offerte.oppervlakte ? `${offerte.oppervlakte} m²` : "—"}</span></div>
              <div><span className="text-muted">Budget:</span> <span className="text-foreground">{offerte.budget ? `€ ${formatEuro(offerte.budget)}` : "—"}</span></div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-muted/50">
          Aangemaakt: {formatDate(offerte.created_at)}
        </div>
      </div>
    </DashboardLayout>
  );
}
