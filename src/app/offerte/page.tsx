"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoldButton } from "@/components/ui/gold-button";

export default function OffertePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    vloer_type: "",
    oppervlakte: "",
    budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("offertes").insert({
      client_name: form.client_name,
      client_email: form.client_email,
      vloer_type: form.vloer_type || null,
      oppervlakte: form.oppervlakte ? parseInt(form.oppervlakte) : null,
      budget: form.budget ? parseFloat(form.budget) : null,
      company_id: "11111111-1111-1111-1111-111111111111",
    });

    if (error) {
      console.error(error);
    }

    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
            Offerte aangevraagd
          </h1>
          <p className="mt-4 text-sm text-muted leading-relaxed">
            Bedankt! Wij nemen binnen 24 uur contact met u op.
          </p>
          <div className="mt-6">
            <Link href="/" className="text-sm text-gold hover:underline">← Terug naar homepage</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
            Offerte aanvragen
          </h1>
          <p className="mt-2 text-sm text-muted">Vrijblijvende offerte voor uw vloerproject</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Naam *</label>
            <input value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} required
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="Uw naam" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">E-mail *</label>
            <input type="email" value={form.client_email} onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))} required
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="uw@email.nl" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Vloertype</label>
            <input value={form.vloer_type} onChange={(e) => setForm((f) => ({ ...f, vloer_type: e.target.value }))}
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="Bijv. PVC, laminaat, hout" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Oppervlakte (m²)</label>
              <input type="number" value={form.oppervlakte} onChange={(e) => setForm((f) => ({ ...f, oppervlakte: e.target.value }))}
                className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="50" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">Budget (€)</label>
              <input type="number" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                className="w-full rounded-lg border border-gold/10 bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none" placeholder="2500" />
            </div>
          </div>
          <GoldButton type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Bezig..." : "Offerte aanvragen"}
          </GoldButton>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="text-gold hover:underline">← Terug naar homepage</Link>
        </div>
      </div>
    </div>
  );
}
