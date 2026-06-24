"use client";

import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useToastContext } from "@/components/toast-provider";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/landing/colors";
import type { Settings } from "@/types";

interface SettingsFormProps {
  companyId: string;
  user?: { id: string; email: string; name?: string | null; role?: string };
}

function SInp({ value, onChange, type = "text", placeholder, rows }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; rows?: number }) {
  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  if (rows) return <textarea rows={rows} value={String(value || "")} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...inp, resize: "vertical" }} />;
  return <input type={type} value={String(value || "")} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inp} />;
}

function SSelect({ value, onChange, options }: { value: string | number; onChange: (v: string) => void; options: [string | number, string][] }) {
  return (
    <select value={String(value)} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", outline: "none", cursor: "pointer" }}>
      {options.map(([v, l]) => <option key={v} value={String(v)}>{l}</option>)}
    </select>
  );
}

function SettingSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid rgba(255,255,255,.06)` }}>
        <span style={{ fontSize: "1rem" }}>{icon}</span>
        <div style={{ fontSize: "0.6rem", letterSpacing: 2, color: C.white, textTransform: "uppercase", fontWeight: 600 }}>{title}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>{children}</div>
    </div>
  );
}

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "10px 0", borderBottom: `1px solid rgba(255,255,255,.04)`, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ fontSize: "0.68rem", color: C.white }}>{label}</div>
        {sub && <div style={{ fontSize: "0.56rem", color: C.dim, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flex: 1, minWidth: 200, maxWidth: 340 }}>{children}</div>
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 99, background: value ? C.green : "rgba(255,255,255,.1)", border: "none", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: value ? 21 : 3, transition: "left .2s" }} />
    </button>
  );
}

function pwStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const pwLabel = (s: number) => ["", "Zwak", "Matig", "Redelijk", "Sterk", "Zeer sterk"][s] || "";
const pwColor = (s: number) => ["", C.red, C.orange, C.gold, C.green, "#22c55e"][s] || C.dim;

const SUBTABS = [
  { id: "bedrijf", icon: "🏢", label: "Bedrijfsgegevens" },
  { id: "factuur", icon: "🧾", label: "Factuur & Offerte" },
  { id: "notif",   icon: "📧", label: "Notificaties" },
  { id: "account", icon: "👤", label: "Account" },
  { id: "systeem", icon: "⚙️", label: "Systeem" },
];

const NOTIF_KEYS = ["emailNieuwOrder", "emailStatusUpdate", "emailOfferte", "emailLegger"] as const;
const NOTIF_LABELS: Record<string, [string, string]> = {
  emailNieuwOrder:    ["Nieuw order",       "Klant dient een nieuwe opdracht in"],
  emailStatusUpdate:  ["Status update",     "Statuswijziging naar klant"],
  emailOfferte:       ["Offerte reacties",  "Klant accepteert of wijst af"],
  emailLegger:        ["Legger updates",    "Legger start of rondt klus af"],
};

export function SettingsForm({ companyId, user }: SettingsFormProps) {
  const { data: settings, isLoading } = useSettings(companyId);
  const updateSettings = useUpdateSettings();
  const { success, error } = useToastContext();

  const [subTab, setSubTab] = useState("bedrijf");
  const [form, setForm] = useState<Partial<Settings>>({});
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notifs, setNotifs] = useState<Record<string, boolean>>(Object.fromEntries(NOTIF_KEYS.map((k) => [k, true])));

  const [pwOud, setPwOud] = useState("");
  const [pwNieuw, setPwNieuw] = useState("");
  const [pwBevestig, setPwBevestig] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwOk, setPwOk] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (settings) { setForm(settings); setSaved(true); }
  }, [settings]);

  const upd = (field: keyof Settings, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!settings?.id) return;
    setSaving(true);
    try {
      await updateSettings.mutateAsync({ id: settings.id, ...form });
      setSaved(true);
      success("Instellingen opgeslagen ✓");
    } catch {
      error("Opslaan mislukt.");
    }
    setSaving(false);
  };

  const handlePwChange = async () => {
    setPwErr(""); setPwOk("");
    if (!pwOud || !pwNieuw || !pwBevestig) { setPwErr("Vul alle velden in"); return; }
    if (pwNieuw !== pwBevestig) { setPwErr("Wachtwoorden komen niet overeen"); return; }
    if (pwNieuw.length < 8) { setPwErr("Minimaal 8 tekens vereist"); return; }
    setPwSaving(true);
    try {
      const supabase = createClient();
      const { error: authErr } = await supabase.auth.updateUser({ password: pwNieuw });
      if (authErr) { setPwErr(authErr.message); } else {
        setPwNieuw(""); setPwBevestig(""); setPwOud("");
        setPwOk("Wachtwoord succesvol gewijzigd ✓");
        success("Wachtwoord gewijzigd ✓");
      }
    } catch { setPwErr("Onbekende fout."); }
    setPwSaving(false);
  };

  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.72rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  if (isLoading) return <div style={{ padding: "40px 0", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>Laden…</div>;

  const s = form;

  return (
    <div style={{ animation: "slideUp .3s ease" }}>
      {/* Save bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 18, minHeight: 36 }}>
        {!saved ? (
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "9px 22px", background: "rgba(198,165,107,.12)", border: `1px solid ${C.gold}`, color: C.gold, fontSize: "0.63rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
            {saving ? "Opslaan…" : "💾 Wijzigingen opslaan"}
          </button>
        ) : (
          <div style={{ fontSize: "0.62rem", color: C.green }}>✓ Alles opgeslagen</div>
        )}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.bdr}`, marginBottom: 28, overflowX: "auto" }}>
        {SUBTABS.map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            style={{ padding: "10px 18px", background: "none", border: "none", borderBottom: subTab === t.id ? `2px solid ${C.gold}` : "2px solid transparent", color: subTab === t.id ? C.gold : C.muted, cursor: "pointer", fontSize: "0.64rem", fontWeight: subTab === t.id ? 700 : 400, whiteSpace: "nowrap", letterSpacing: 1, transition: "color .2s", display: "flex", alignItems: "center", gap: 6 }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 700 }}>

        {/* ══ BEDRIJFSGEGEVENS ══ */}
        {subTab === "bedrijf" && (
          <div style={{ animation: "slideUp .2s ease" }}>
            <SettingSection title="Bedrijfsprofiel" icon="🏢">
              <SettingRow label="Bedrijfsnaam" sub="Staat op alle facturen en offertes">
                <SInp value={s.bedrijf_naam || ""} onChange={(v) => upd("bedrijf_naam", v)} placeholder="Aurea Maison Floors" />
              </SettingRow>
              <SettingRow label="E-mailadres" sub="Contactadres voor klanten">
                <SInp value={s.bedrijf_email || ""} onChange={(v) => upd("bedrijf_email", v)} type="email" placeholder="info@bedrijf.nl" />
              </SettingRow>
              <SettingRow label="Telefoonnummer">
                <SInp value={s.bedrijf_tel || ""} onChange={(v) => upd("bedrijf_tel", v)} type="tel" placeholder="06 00 00 00 00" />
              </SettingRow>
              <SettingRow label="Straat + huisnummer">
                <SInp value={s.bedrijf_adres || ""} onChange={(v) => upd("bedrijf_adres", v)} placeholder="Zuidwijkstraat 28" />
              </SettingRow>
              <SettingRow label="Postcode">
                <SInp value={s.bedrijf_postcode || ""} onChange={(v) => upd("bedrijf_postcode", v)} placeholder="2729 KD" />
              </SettingRow>
              <SettingRow label="Stad">
                <SInp value={s.bedrijf_plaats || ""} onChange={(v) => upd("bedrijf_plaats", v)} placeholder="Zoetermeer" />
              </SettingRow>
            </SettingSection>

            <SettingSection title="Juridische gegevens" icon="📋">
              <SettingRow label="KvK-nummer">
                <SInp value={s.kvk || ""} onChange={(v) => upd("kvk", v)} placeholder="12345678" />
              </SettingRow>
              <SettingRow label="BTW-nummer">
                <SInp value={s.btw || ""} onChange={(v) => upd("btw", v)} placeholder="NL000000000B01" />
              </SettingRow>
              <SettingRow label="IBAN" sub="Verschijnt op elke factuur als betaalrekening">
                <SInp value={s.iban || ""} onChange={(v) => upd("iban", v)} placeholder="NL00 BANK 0000 0000 00" />
              </SettingRow>
            </SettingSection>

            <div style={{ background: "rgba(255,255,255,.02)", border: `1px solid ${C.bdr}`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: "0.54rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>📄 Live preview — factuurkop</div>
              <div style={{ fontFamily: "Arial,sans-serif", background: "#fff", color: "#1a1a1a", padding: "20px 24px", borderRadius: 8, fontSize: 12, lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{s.bedrijf_naam || "—"}</div>
                <div style={{ color: "#444" }}>{s.bedrijf_adres} · {s.bedrijf_postcode} {s.bedrijf_plaats}</div>
                <div style={{ color: "#444" }}>Tel: {s.bedrijf_tel} · {s.bedrijf_email}</div>
                <div style={{ color: "#666", marginTop: 4, fontSize: 11 }}>KvK: {s.kvk} · BTW: {s.btw} · IBAN: {s.iban}</div>
              </div>
            </div>
          </div>
        )}

        {/* ══ FACTUUR & OFFERTE ══ */}
        {subTab === "factuur" && (
          <div style={{ animation: "slideUp .2s ease" }}>
            <SettingSection title="Factuurinstellingen" icon="🧾">
              <SettingRow label="Standaard betaaltermijn" sub="Aantal dagen na factuurdatum">
                <SSelect value={s.factuur_betaal_termijn ?? 14} onChange={(v) => upd("factuur_betaal_termijn", parseInt(v))}
                  options={[[7,"7 dagen"],[14,"14 dagen"],[21,"21 dagen"],[30,"30 dagen"],[45,"45 dagen"],[60,"60 dagen"]]} />
              </SettingRow>
              <SettingRow label="BTW-percentage" sub="Toegepast op alle facturen">
                <SSelect value={s.factuur_btw_pct ?? 21} onChange={(v) => upd("factuur_btw_pct", parseFloat(v))}
                  options={[[0,"0% — Vrijgesteld"],[9,"9% — Laag tarief"],[21,"21% — Standaard tarief"]]} />
              </SettingRow>
              <SettingRow label="Voettekst factuur" sub="Extra tekst onderaan elke factuur">
                <SInp value={s.factuur_voetnoot || ""} onChange={(v) => upd("factuur_voetnoot", v)} rows={3}
                  placeholder="Bijv: Bij vragen, neem contact op via info@bedrijf.nl" />
              </SettingRow>
            </SettingSection>

            <SettingSection title="Offerte-instellingen" icon="📄">
              <SettingRow label="Standaard geldigheid offerte" sub="Aantal dagen geldig na aanmaken">
                <SSelect value={s.offerte_geldigheid ?? 14} onChange={(v) => upd("offerte_geldigheid", parseInt(v))}
                  options={[[7,"7 dagen"],[14,"14 dagen"],[21,"21 dagen"],[30,"30 dagen"]]} />
              </SettingRow>
              <SettingRow label="Voettekst offerte" sub="Voorwaarden / toelichting onderaan offerte">
                <SInp value={(s as Record<string, unknown>).offerte_voetnoot as string || ""} onChange={(v) => setForm((p) => ({ ...p, offerte_voetnoot: v } as Partial<Settings>))} rows={3}
                  placeholder="Deze offerte is vrijblijvend…" />
              </SettingRow>
            </SettingSection>

            <div style={{ padding: "12px 16px", background: "rgba(198,165,107,.04)", border: `1px solid ${C.bdr}`, borderRadius: 8, fontSize: "0.68rem", color: C.muted, lineHeight: 1.8 }}>
              💡 Wijzigingen gelden direct voor <strong style={{ color: C.white }}>nieuwe</strong> facturen en offertes. Bestaande documenten worden niet aangepast.
            </div>
          </div>
        )}

        {/* ══ NOTIFICATIES ══ */}
        {subTab === "notif" && (
          <div style={{ animation: "slideUp .2s ease" }}>
            <div style={{ padding: "12px 16px", background: "rgba(74,158,232,.05)", border: "1px solid rgba(74,158,232,.18)", borderRadius: 8, marginBottom: 24, fontSize: "0.68rem", color: C.muted, lineHeight: 1.8 }}>
              📬 E-mails worden gelogd in <strong style={{ color: C.white }}>E-mail log</strong>. Koppel aan Resend of SendGrid voor echte verzending.<br />
              Afzender: <strong style={{ color: C.white }}>{s.bedrijf_naam || "—"}</strong> · <strong style={{ color: C.white }}>{s.bedrijf_email || "—"}</strong>
            </div>
            <SettingSection title="E-mail notificaties" icon="📧">
              {NOTIF_KEYS.map((k) => {
                const [label, sub] = NOTIF_LABELS[k];
                return (
                  <SettingRow key={k} label={label} sub={sub}>
                    <ToggleSwitch value={notifs[k] !== false} onChange={(v) => setNotifs((p) => ({ ...p, [k]: v }))} />
                  </SettingRow>
                );
              })}
            </SettingSection>
            <SettingSection title="E-mail configuratie" icon="⚙️">
              <SettingRow label="Afzendernaam" sub="Naam in inbox van klant">
                <SInp value={s.bedrijf_naam || ""} onChange={(v) => upd("bedrijf_naam", v)} />
              </SettingRow>
              <SettingRow label="Reply-to adres">
                <SInp value={s.bedrijf_email || ""} onChange={(v) => upd("bedrijf_email", v)} type="email" />
              </SettingRow>
            </SettingSection>
          </div>
        )}

        {/* ══ ACCOUNT ══ */}
        {subTab === "account" && (
          <div style={{ animation: "slideUp .2s ease" }}>
            <SettingSection title="Accountgegevens" icon="👤">
              <SettingRow label="Naam">
                <SInp value={(form as Record<string, unknown>).eig_naam as string || user?.name || ""} onChange={(v) => setForm((p) => ({ ...p, eig_naam: v } as Partial<Settings>))} placeholder="Uw naam" />
              </SettingRow>
              <SettingRow label="E-mailadres" sub="Inlogadres — niet wijzigbaar">
                <div style={{ padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, fontSize: "0.72rem", color: C.muted, display: "flex", alignItems: "center", gap: 8 }}>
                  🔒 {user?.email || "—"}
                </div>
              </SettingRow>
              <SettingRow label="Telefoonnummer">
                <SInp value={(form as Record<string, unknown>).eig_tel as string || ""} onChange={(v) => setForm((p) => ({ ...p, eig_tel: v } as Partial<Settings>))} type="tel" placeholder="06 00 00 00 00" />
              </SettingRow>
              <SettingRow label="Rol">
                <div style={{ padding: "9px 12px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, fontSize: "0.72rem", color: C.muted }}>
                  {user?.role || "owner"}
                </div>
              </SettingRow>
            </SettingSection>

            <SettingSection title="Wachtwoord wijzigen" icon="🔐">
              <SettingRow label="Huidig wachtwoord">
                <input type="password" value={pwOud} onChange={(e) => setPwOud(e.target.value)} placeholder="••••••••" style={inp} />
              </SettingRow>
              <SettingRow label="Nieuw wachtwoord" sub="Minimaal 8 tekens">
                <div>
                  <input type="password" value={pwNieuw} onChange={(e) => setPwNieuw(e.target.value)} placeholder="••••••••" style={inp} />
                  {pwNieuw && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: 99, marginBottom: 5, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, pwStrength(pwNieuw) / 5 * 100)}%`, background: pwColor(pwStrength(pwNieuw)), borderRadius: 99, transition: "width .3s" }} />
                      </div>
                      <span style={{ fontSize: "0.62rem", color: pwColor(pwStrength(pwNieuw)) }}>{pwLabel(pwStrength(pwNieuw))}</span>
                    </div>
                  )}
                </div>
              </SettingRow>
              <SettingRow label="Bevestig nieuw wachtwoord">
                <input type="password" value={pwBevestig} onChange={(e) => setPwBevestig(e.target.value)} placeholder="••••••••" style={inp} />
              </SettingRow>
              {pwErr && <div style={{ padding: "10px 14px", background: "rgba(224,90,90,.08)", border: "1px solid rgba(224,90,90,.25)", borderRadius: 7, fontSize: "0.68rem", color: C.red, margin: "8px 0" }}>⚠ {pwErr}</div>}
              {pwOk && <div style={{ padding: "10px 14px", background: "rgba(60,184,122,.08)", border: "1px solid rgba(60,184,122,.25)", borderRadius: 7, fontSize: "0.68rem", color: C.green, margin: "8px 0" }}>✓ {pwOk}</div>}
              <div style={{ paddingTop: 14 }}>
                <button onClick={handlePwChange} disabled={!pwOud || !pwNieuw || !pwBevestig || pwSaving}
                  style={{ padding: "10px 22px", background: (!pwOud || !pwNieuw || !pwBevestig) ? "rgba(255,255,255,.04)" : "rgba(198,165,107,.12)", border: `1px solid ${(!pwOud || !pwNieuw || !pwBevestig) ? C.bdr : C.gold}`, color: (!pwOud || !pwNieuw || !pwBevestig) ? C.dim : C.gold, fontSize: "0.63rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: (!pwOud || !pwNieuw || !pwBevestig || pwSaving) ? "not-allowed" : "pointer", borderRadius: 8, opacity: (!pwOud || !pwNieuw || !pwBevestig) ? 0.5 : 1 }}>
                  {pwSaving ? "Opslaan…" : "🔐 Wachtwoord wijzigen"}
                </button>
              </div>
            </SettingSection>
          </div>
        )}

        {/* ══ SYSTEEM ══ */}
        {subTab === "systeem" && (
          <div style={{ animation: "slideUp .2s ease" }}>
            <SettingSection title="Systeem informatie" icon="🖥">
              <SettingRow label="Platform">
                <div style={{ fontSize: "0.72rem", color: C.muted }}>Aurea Maison Floors — Eigenaar Dashboard</div>
              </SettingRow>
              <SettingRow label="Valuta">
                <div style={{ fontSize: "0.72rem", color: C.muted }}>€ Euro (EUR)</div>
              </SettingRow>
              <SettingRow label="Taal">
                <div style={{ fontSize: "0.72rem", color: C.muted }}>🇳🇱 Nederlands</div>
              </SettingRow>
              <SettingRow label="Datumnotatie">
                <div style={{ fontSize: "0.72rem", color: C.muted }}>dd-mm-yyyy</div>
              </SettingRow>
            </SettingSection>
            <div style={{ padding: "12px 16px", background: "rgba(60,184,122,.04)", border: `1px solid rgba(60,184,122,.18)`, borderRadius: 8, fontSize: "0.68rem", color: C.muted, lineHeight: 1.8 }}>
              ✓ Systeem functioneert normaal. Alle gegevens worden opgeslagen in Supabase.
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
