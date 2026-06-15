"use client";

import { useState } from "react";
import { useCreateOrder } from "@/hooks/use-orders";
import { GoldButton } from "@/components/ui/gold-button";
import { generateUAID } from "@/lib/utils";
import { useToastContext } from "@/components/toast-provider";
import { sendOrderConfirmation } from "@/lib/email";
import { C } from "@/lib/landing/colors";

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

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)",
    border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white,
    fontSize: "0.72rem", outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: "0.5rem", letterSpacing: 2, color: C.gold,
    textTransform: "uppercase", marginBottom: 5, fontWeight: 600,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        {/* Vloer type dropdown — spans full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={lbl}>Vloertype</label>
          <select value={form.vloer_type} onChange={(e) => handleChange("vloer_type", e.target.value)} style={inp}>
            <option value="">Selecteer vloertype…</option>
            {VLOER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {fields.map(({ label, field, type = "text", required }) => (
          <div key={field}>
            <label style={lbl}>
              {label}{required && <span style={{ color: C.red }}> *</span>}
            </label>
            <input
              type={type}
              value={form[field as keyof typeof form]}
              onChange={(e) => handleChange(field, e.target.value)}
              required={required}
              style={inp}
            />
          </div>
        ))}
      </div>

      <div>
        <label style={lbl}>Opmerking</label>
        <textarea value={form.opmerking} onChange={(e) => handleChange("opmerking", e.target.value)}
          rows={3} style={{ ...inp, resize: "vertical" }} />
      </div>

      <div>
        <GoldButton type="submit" variant="primary" size="md" disabled={createOrder.isPending}>
          {createOrder.isPending ? "Bezig…" : "Order aanmaken"}
        </GoldButton>
      </div>
    </form>
  );
}
