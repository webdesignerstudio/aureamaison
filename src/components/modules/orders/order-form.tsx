"use client";

import { useState } from "react";
import { useCreateOrder } from "@/hooks/use-orders";
import { GoldButton } from "@/components/ui/gold-button";
import { Spinner } from "@/components/ui/spinner";
import { generateUAID } from "@/lib/utils";
import { useToastContext } from "@/components/toast-provider";
import { sendOrderConfirmation } from "@/lib/email";

interface OrderFormProps {
  onSuccess?: () => void;
  companyId: string;
}

export function OrderForm({ onSuccess, companyId }: OrderFormProps) {
  const createOrder = useCreateOrder();
  const { success, error } = useToastContext();
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    straat: "",
    postcode: "",
    plaats: "",
    vloer_type: "",
    oppervlakte: "",
    ondergrond: "",
    budget: "",
    timing: "",
    opmerking: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newOrder = await createOrder.mutateAsync({
        uaid: generateUAID(),
        client_name: form.client_name,
        client_email: form.client_email,
        straat: form.straat || null,
        postcode: form.postcode || null,
        plaats: form.plaats || null,
        vloer_type: form.vloer_type || null,
        oppervlakte: form.oppervlakte ? parseInt(form.oppervlakte) : null,
        ondergrond: form.ondergrond || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        timing: form.timing || null,
        opmerking: form.opmerking || null,
        status: "ingediend",
        company_id: companyId,
      });
      success("Order succesvol aangemaakt!");

      // Send confirmation email to client
      if (form.client_email) {
        sendOrderConfirmation({
          to: form.client_email,
          clientName: form.client_name,
          orderId: newOrder.uaid || newOrder.id.slice(0, 8),
          vloerType: form.vloer_type || "vloer",
          oppervlakte: form.oppervlakte ? parseInt(form.oppervlakte) : null,
        }).catch(() => {});
      }

      onSuccess?.();
    } catch (err) {
      error("Er is een fout opgetreden bij het aanmaken van de order.");
    }
  };

  const VLOER_TYPES = [
    "Visgraat", "Laminaat", "PVC Vloeren", "Massief Parket",
    "Hongaars Punt", "Traprenovatie", "Egaliseren"
  ];

  const fields = [
    { label: "Klantnaam", field: "client_name", required: true },
    { label: "E-mail", field: "client_email", type: "email", required: true },
    { label: "Straat", field: "straat" },
    { label: "Postcode", field: "postcode" },
    { label: "Plaats", field: "plaats" },
    { label: "Oppervlakte (m²)", field: "oppervlakte", type: "number" },
    { label: "Ondergrond", field: "ondergrond" },
    { label: "Budget (€)", field: "budget", type: "number" },
    { label: "Gewenste timing", field: "timing" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Vloer type dropdown */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gold">
            Vloertype
          </label>
          <select
            value={form.vloer_type}
            onChange={(e) => handleChange("vloer_type", e.target.value)}
            className="w-full rounded-lg border border-gold/10 bg-background px-4 py-2.5 text-sm text-foreground focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20"
          >
            <option value="">Selecteer vloertype...</option>
            {VLOER_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {fields.map(({ label, field, type = "text", required }) => (
          <div key={field}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gold">
              {label}
              {required && <span className="text-red-400"> *</span>}
            </label>
            <input
              type={type}
              value={form[field as keyof typeof form]}
              onChange={(e) => handleChange(field, e.target.value)}
              required={required}
              className="w-full rounded-lg border border-gold/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gold">
          Opmerking
        </label>
        <textarea
          value={form.opmerking}
          onChange={(e) => handleChange("opmerking", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gold/10 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20"
        />
      </div>

      <GoldButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={createOrder.isPending}
      >
        {createOrder.isPending ? <Spinner size="sm" /> : "Order aanmaken"}
      </GoldButton>
    </form>
  );
}
