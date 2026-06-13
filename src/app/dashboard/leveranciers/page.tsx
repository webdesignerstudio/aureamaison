"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import {
  useLeveranciers,
  useCreateLeverancier,
  useUpdateLeverancier,
  useDeleteLeverancier,
} from "@/hooks/use-leveranciers";
import { C } from "@/lib/landing/colors";
import type { Leverancier } from "@/types";

type FormState = {
  naam: string;
  categorie: string;
  lead: string;
  korting: string;
  min_order: string;
  producten: string;
};

const emptyForm: FormState = { naam: "", categorie: "", lead: "", korting: "", min_order: "", producten: "" };

export default function LeveranciersPage() {
  const mobile = useMobile();
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: levs = [], isLoading } = useLeveranciers(companyId);
  const createLev = useCreateLeverancier();
  const updateLev = useUpdateLeverancier();
  const deleteLev = useDeleteLeverancier();

  const [filter, setFilter] = useState("");
  const [sel, setSel] = useState<Leverancier | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = levs.filter(
    (l) => !filter || [l.naam, l.categorie].join(" ").toLowerCase().includes(filter.toLowerCase())
  );

  const actiefCount = levs.filter((l) => l.actief).length;
  const totProducten = levs.reduce((s, l) => s + (l.producten || 0), 0);
  const gemKorting = levs.length ? Math.round(levs.reduce((s, l) => s + (Number(l.korting) || 0), 0) / levs.length) : 0;
  const gemLead = levs.length ? Math.round(levs.reduce((s, l) => s + (l.lead || 0), 0) / levs.length) : 0;

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 13px", background: "rgba(255,255,255,.04)",
    border: `1px solid ${C.bdr}`, borderRadius: 7, fontSize: 13, color: C.white, outline: "none", fontFamily: "inherit",
  };

  const openAdd = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (l: Leverancier) => {
    setEditId(l.id);
    setForm({
      naam: l.naam || "", categorie: l.categorie || "",
      lead: String(l.lead ?? ""), korting: String(l.korting ?? ""),
      min_order: String(l.min_order ?? ""), producten: String(l.producten ?? ""),
    });
    setSel(null);
    setFormOpen(true);
  };

  const submitForm = async () => {
    if (!companyId || !form.naam.trim()) return;
    const payload = {
      naam: form.naam.trim(),
      categorie: form.categorie.trim() || null,
      lead: parseInt(form.lead) || 0,
      korting: parseFloat(form.korting) || 0,
      min_order: parseFloat(form.min_order) || 0,
      producten: parseInt(form.producten) || 0,
    };
    if (editId) {
      await updateLev.mutateAsync({ id: editId, ...payload });
    } else {
      await createLev.mutateAsync({ ...payload, company_id: companyId, actief: true });
    }
    setFormOpen(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const toggleActief = async (l: Leverancier) => {
    await updateLev.mutateAsync({ id: l.id, actief: !l.actief });
    setSel(null);
  };

  const removeLev = async (l: Leverancier) => {
    await deleteLev.mutateAsync(l.id);
    setSel(null);
  };

  const kpis: [string, string, string | number, string][] = [
    ["🔗", "Koppelingen", actiefCount, C.gold],
    ["📦", "Producten", totProducten.toLocaleString("nl-NL"), C.blue],
    ["🏷", "Gem. korting", `${gemKorting}%`, C.green],
    ["⏱", "Gem. levertijd", `${gemLead}d`, C.gold],
  ];

  return (
    <DashboardLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Inkoop</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1 }}>
              Leveranciers <em style={{ fontStyle: "italic", color: C.goldL }}>Koppelingen</em>
            </h1>
          </div>
          <button onClick={openAdd} style={{ padding: "10px 18px", background: "rgba(198,165,107,.12)", border: `1px solid ${C.gold}`, color: C.gold, fontSize: "0.62rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", borderRadius: 7 }}>
            + Leverancier
          </button>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10, marginBottom: 22 }}>
          {kpis.map(([ic, lbl, val, k]) => (
            <div key={lbl} style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: "1.1rem", marginBottom: 6 }}>{ic}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", color: k, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: "0.48rem", letterSpacing: 1, color: C.muted, textTransform: "uppercase", marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="🔍 Zoek leverancier of categorie…"
          style={{ ...inp, marginBottom: 16, fontSize: 13, padding: "10px 14px" }}
        />

        {/* List */}
        {isLoading ? (
          <div style={{ color: C.muted, fontSize: "0.7rem", padding: "24px 0" }}>Laden…</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: C.muted, fontSize: "0.72rem", padding: "32px 0", textAlign: "center" }}>
            Nog geen leveranciers. Voeg er een toe met de knop rechtsboven.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((l) => (
              <div
                key={l.id}
                onClick={() => setSel(l)}
                style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.bdr)}
              >
                <div style={{ width: 44, height: 44, borderRadius: 8, background: "rgba(198,165,107,.08)", border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>🔗</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem", color: C.white, marginBottom: 2 }}>{l.naam}</div>
                  <div style={{ fontSize: "0.58rem", color: C.muted }}>{l.categorie || "—"} · {(l.producten || 0).toLocaleString("nl-NL")} producten · Min. order €{l.min_order}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.green }}>-{l.korting}%</div>
                    <div style={{ fontSize: "0.44rem", color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>Korting</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.blue }}>{l.lead}d</div>
                    <div style={{ fontSize: "0.44rem", color: C.dim, textTransform: "uppercase", letterSpacing: 1 }}>Levertijd</div>
                  </div>
                  <span style={{ fontSize: "0.46rem", padding: "2px 8px", borderRadius: 99, background: l.actief ? "rgba(60,184,122,.1)" : "rgba(224,90,90,.1)", border: `1px solid ${l.actief ? "rgba(60,184,122,.3)" : "rgba(224,90,90,.3)"}`, color: l.actief ? C.green : C.red, fontWeight: 700 }}>
                    {l.actief ? "Actief" : "Inactief"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAIL MODAL */}
        {sel && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 5000, background: "rgba(5,5,5,.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={(e) => { if (e.target === e.currentTarget) setSel(null); }}
          >
            <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 16, width: "100%", maxWidth: 400, padding: 24, animation: "slideUp .3s ease" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", color: C.white, marginBottom: 4 }}>{sel.naam}</div>
              <div style={{ fontSize: "0.62rem", color: C.muted, marginBottom: 18 }}>{sel.categorie || "—"}</div>
              {([["Korting", `${sel.korting}%`], ["Levertijd", `${sel.lead} werkdagen`], ["Minimum order", `€${sel.min_order}`], ["Producten", (sel.producten || 0).toLocaleString("nl-NL")]] as [string, string][]).map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.bdr}`, fontSize: "0.68rem" }}>
                  <span style={{ color: C.muted }}>{l}</span><span style={{ color: C.white }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
                <button onClick={() => toggleActief(sel)} style={{ flex: 1, minWidth: 110, padding: "10px", background: sel.actief ? "rgba(224,90,90,.08)" : "rgba(60,184,122,.08)", border: `1px solid ${sel.actief ? "rgba(224,90,90,.3)" : "rgba(60,184,122,.3)"}`, color: sel.actief ? C.red : C.green, cursor: "pointer", borderRadius: 7, fontSize: "0.6rem", fontWeight: 600 }}>
                  {sel.actief ? "⏸ Deactiveren" : "▶ Activeren"}
                </button>
                <button onClick={() => openEdit(sel)} style={{ padding: "10px 14px", background: "rgba(198,165,107,.1)", border: `1px solid ${C.bdr}`, color: C.gold, cursor: "pointer", borderRadius: 7, fontSize: "0.6rem", fontWeight: 600 }}>✎ Bewerken</button>
                <button onClick={() => removeLev(sel)} style={{ padding: "10px 14px", background: "rgba(224,90,90,.08)", border: `1px solid rgba(224,90,90,.3)`, color: C.red, cursor: "pointer", borderRadius: 7, fontSize: "0.6rem", fontWeight: 600 }}>🗑</button>
                <button onClick={() => setSel(null)} style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${C.bdr}`, color: C.muted, cursor: "pointer", borderRadius: 7, fontSize: "0.6rem" }}>Sluiten</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD/EDIT FORM MODAL */}
        {formOpen && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 5001, background: "rgba(5,5,5,.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}
          >
            <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 16, width: "100%", maxWidth: 440, padding: 24, animation: "slideUp .3s ease" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", color: C.white, marginBottom: 18 }}>
                {editId ? "Leverancier bewerken" : "Nieuwe leverancier"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input value={form.naam} onChange={(e) => setForm({ ...form, naam: e.target.value })} placeholder="Naam *" style={inp} />
                <input value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} placeholder="Categorie (bv. Parket)" style={inp} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input value={form.korting} onChange={(e) => setForm({ ...form, korting: e.target.value })} placeholder="Korting %" type="number" style={inp} />
                  <input value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} placeholder="Levertijd (dagen)" type="number" style={inp} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} placeholder="Min. order €" type="number" style={inp} />
                  <input value={form.producten} onChange={(e) => setForm({ ...form, producten: e.target.value })} placeholder="Aantal producten" type="number" style={inp} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button onClick={submitForm} disabled={!form.naam.trim() || createLev.isPending || updateLev.isPending} style={{ flex: 1, padding: "11px", background: "rgba(198,165,107,.15)", border: `1px solid ${C.gold}`, color: C.gold, cursor: "pointer", borderRadius: 7, fontSize: "0.62rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", opacity: form.naam.trim() ? 1 : 0.5 }}>
                  {editId ? "Opslaan" : "Toevoegen"}
                </button>
                <button onClick={() => setFormOpen(false)} style={{ padding: "11px 18px", background: "transparent", border: `1px solid ${C.bdr}`, color: C.muted, cursor: "pointer", borderRadius: 7, fontSize: "0.6rem" }}>Annuleren</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
