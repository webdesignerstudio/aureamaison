/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIENST_PRODUCTS } from "./data";
import { C } from "./colors";

/* ── INPUT STYLE ───────────────────────────────────────────── */
export const inp = {
  width: "100%" as const,
  padding: "13px 16px" as const,
  background: "rgba(255,255,255,0.04)" as const,
  border: "1px solid rgba(198,165,107,0.2)" as const,
  borderRadius: 10 as const,
  color: C.white,
  fontSize: 15 as const,
  outline: "none" as const,
  colorScheme: "dark" as const,
};

/* ── TOAST ─────────────────────────────────────────────────── */
let _toastCb: ((msg: string, type?: string) => void) | null = null;

export function setToastCallback(cb: ((msg: string, type?: string) => void) | null) {
  _toastCb = cb;
}

export function toast(msg: string, type = "success") {
  if (_toastCb) _toastCb(msg, type);
  else console.log(`[toast] ${type}: ${msg}`);
}

/* ── E-MAIL SIMULATIE ────────────────────────────────────── */
export async function simuleerEmail({
  aan,
  onderwerp,
  type = "status_update",
  orderId,
  data,
  tekst,
}: {
  aan: string;
  onderwerp: string;
  type?: string;
  orderId?: string | null;
  data?: Record<string, any>;
  tekst?: string;
}) {
  console.log(`📧 E-mail gesimuleerd → ${aan} | ${onderwerp}`);
  // In productie: backend endpoint aanroepen
  // await fetch("/api/send-email", { method: "POST", body: JSON.stringify({...}) });
}

/* ── SHOWROOM AANVRAAG OPSLAAN ───────────────────────────── */
export async function saveShowroomAanvraag(v: Record<string, any>) {
  try {
    const supabase = createClient();
    await supabase.from("showroom_aanvragen").insert({
      naam: v.naam || "",
      email: v.email || "",
      telefoon: v.tel || "",
      adres: v.adres || "",
      postcode: v.postcode || "",
      datum_voorkeur: v.datum || null,
      opmerking: v.tijd ? `${v.tijd}${v.dienst ? " | " + v.dienst : ""}` : v.dienst || "",
      status: "open",
    });
  } catch (e) {
    console.error("saveShowroomAanvraag error:", e);
  }
}

/* ── PRODUCTEN HOOK ──────────────────────────────────────── */
export function useProducten() {
  const [producten, setProducten] = useState<Record<string, any[]> | null>(null);

  useEffect(() => {
    const base = JSON.parse(JSON.stringify(DIENST_PRODUCTS));
    setProducten(base);
  }, []);

  const refresh = () => {
    const base = JSON.parse(JSON.stringify(DIENST_PRODUCTS));
    setProducten(base);
  };

  return [producten, setProducten, refresh] as const;
}
