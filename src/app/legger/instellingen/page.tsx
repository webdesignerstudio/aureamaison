"use client";

import { useState, useEffect } from "react";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/landing/colors";

const SPECS = ["Laminaat", "PVC / Vinyl", "Parket", "Hout", "Visgraat", "Traprenovatie", "Egaliseren", "Tegelwerk"];

function pwStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s += 20;
  if (pw.length >= 12) s += 10;
  if (/[A-Z]/.test(pw)) s += 20;
  if (/[0-9]/.test(pw)) s += 20;
  if (/[^A-Za-z0-9]/.test(pw)) s += 30;
  return s;
}
function pwColor(s: number) { return s < 40 ? C.red : s < 70 ? C.orange : C.green; }
function pwLabel(s: number) { return s < 40 ? "Zwak" : s < 70 ? "Redelijk" : "Sterk"; }

const SUB_TABS = [
  { id: "profiel",     icon: "👤", label: "Mijn gegevens" },
  { id: "bedrijf",     icon: "🏢", label: "Bedrijf" },
  { id: "beveiliging", icon: "🔐", label: "Beveiliging" },
  { id: "voorkeuren",  icon: "⚙️", label: "Voorkeuren" },
];

const inp: React.CSSProperties = { width: "100%", padding: "10px 13px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.75rem", outline: "none", boxSizing: "border-box" };
const lbl: React.CSSProperties = { display: "block", fontSize: "0.48rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 5, fontWeight: 600 };

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 99, background: value ? C.green : "rgba(255,255,255,.1)", border: "none", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.white, position: "absolute", top: 3, left: value ? 21 : 3, transition: "left .2s" }} />
    </button>
  );
}

export default function LeggerInstellingenPage() {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState("profiel");
  const [leggerId, setLeggerId] = useState<string | null>(null);

  // Profiel
  const [profiel, setProfiel] = useState({ naam: "", tel: "" });
  const [profielSaved, setProfielSaved] = useState(true);
  const [profielSaving, setProfielSaving] = useState(false);
  const [profielMsg, setProfielMsg] = useState("");

  // Bedrijf
  const [bedrijf, setBedrijf] = useState({ bedrijfsnaam: "", kvk: "", btw: "", iban: "", straal: "", beschrijving: "", specialisaties: [] as string[] });
  const [bedrijfSaved, setBedrijfSaved] = useState(true);
  const [bedrijfSaving, setBedrijfSaving] = useState(false);
  const [bedrijfMsg, setBedrijfMsg] = useState("");

  // Beveiliging
  const [pwOud, setPwOud] = useState("");
  const [pwNieuw, setPwNieuw] = useState("");
  const [pwBevestig, setPwBevestig] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwOk, setPwOk] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // Voorkeuren
  const [emailNotif, setEmailNotif] = useState(true);
  const [klusNotif, setKlusNotif] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase.from("leggers").select("*").eq("profiel_id", user.id).single().then(({ data }: { data: Record<string, unknown> | null }) => {
      if (!data) return;
      const str = (v: unknown): string => (v != null && v !== "" ? String(v) : "");
      setLeggerId(str(data.id) || null);
      setProfiel({ naam: str(data.naam), tel: str(data.telefoon) });
      setBedrijf({
        bedrijfsnaam: str(data.bedrijfsnaam),
        kvk: str(data.kvk),
        btw: str(data.btw),
        iban: str(data.iban),
        straal: data.straal != null ? String(data.straal) : "",
        beschrijving: str(data.beschrijving),
        specialisaties: Array.isArray(data.specialisaties) ? (data.specialisaties as string[]) : [],
      });
    });
  }, [user?.id]);

  const handleProfielSave = async () => {
    if (!leggerId) return;
    setProfielSaving(true); setProfielMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("leggers").update({ naam: profiel.naam, telefoon: profiel.tel }).eq("id", leggerId);
    setProfielSaving(false);
    if (error) { setProfielMsg("Opslaan mislukt: " + error.message); return; }
    setProfielSaved(true); setProfielMsg("Profiel opgeslagen ✓");
  };

  const handleBedrijfSave = async () => {
    if (!leggerId) return;
    setBedrijfSaving(true); setBedrijfMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("leggers").update({
      bedrijfsnaam: bedrijf.bedrijfsnaam,
      kvk: bedrijf.kvk,
      btw: bedrijf.btw,
      iban: bedrijf.iban,
      straal: bedrijf.straal ? parseFloat(bedrijf.straal) : null,
      beschrijving: bedrijf.beschrijving,
      specialisaties: bedrijf.specialisaties,
    }).eq("id", leggerId);
    setBedrijfSaving(false);
    if (error) { setBedrijfMsg("Opslaan mislukt: " + error.message); return; }
    setBedrijfSaved(true); setBedrijfMsg("Bedrijfsgegevens opgeslagen ✓");
  };

  const toggleSpec = (sp: string) => {
    setBedrijf((prev) => ({
      ...prev,
      specialisaties: prev.specialisaties.includes(sp)
        ? prev.specialisaties.filter((x) => x !== sp)
        : [...prev.specialisaties, sp],
    }));
    setBedrijfSaved(false);
  };

  const handlePwChange = async () => {
    setPwErr(""); setPwOk("");
    if (!pwOud || !pwNieuw || !pwBevestig) { setPwErr("Vul alle velden in"); return; }
    if (pwNieuw !== pwBevestig) { setPwErr("Wachtwoorden komen niet overeen"); return; }
    if (pwNieuw.length < 8) { setPwErr("Minimaal 8 tekens vereist"); return; }
    setPwSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwNieuw });
    if (error) { setPwErr(error.message); } else { setPwOk("Wachtwoord succesvol gewijzigd ✓"); setPwOud(""); setPwNieuw(""); setPwBevestig(""); }
    setPwSaving(false);
  };

  return (
    <LeggerLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.blue, textTransform: "uppercase", marginBottom: 4 }}>Account</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
              Mijn <em style={{ fontStyle: "italic", color: C.goldL }}>Instellingen</em>
            </h1>
          </div>
          {subTab === "profiel" && !profielSaved && (
            <button onClick={handleProfielSave} disabled={profielSaving}
              style={{ padding: "10px 22px", background: "rgba(74,158,232,.15)", border: "1px solid rgba(74,158,232,.5)", color: C.blue, fontSize: "0.64rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 8 }}>
              {profielSaving ? "Opslaan…" : "💾 Wijzigingen opslaan"}
            </button>
          )}
          {subTab === "profiel" && profielSaved && profielMsg && <span style={{ fontSize: "0.62rem", color: C.green }}>✓ Alles opgeslagen</span>}
          {subTab === "bedrijf" && !bedrijfSaved && (
            <button onClick={handleBedrijfSave} disabled={bedrijfSaving}
              style={{ padding: "10px 22px", background: "rgba(74,158,232,.15)", border: "1px solid rgba(74,158,232,.5)", color: C.blue, fontSize: "0.64rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 8 }}>
              {bedrijfSaving ? "Opslaan…" : "💾 Wijzigingen opslaan"}
            </button>
          )}
          {subTab === "bedrijf" && bedrijfSaved && bedrijfMsg && <span style={{ fontSize: "0.62rem", color: C.green }}>✓ Alles opgeslagen</span>}
        </div>

        {/* Sub-tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.bdr}`, marginBottom: 28, overflowX: "auto" }}>
          {SUB_TABS.map((t) => (
            <button key={t.id} onClick={() => setSubTab(t.id)}
              style={{ padding: "10px 16px", background: "none", border: "none", borderBottom: subTab === t.id ? `2px solid ${C.blue}` : "2px solid transparent", color: subTab === t.id ? C.blue : C.muted, cursor: "pointer", fontSize: "0.63rem", fontWeight: subTab === t.id ? 700 : 400, whiteSpace: "nowrap", letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 560 }}>

          {/* MIJN GEGEVENS */}
          {subTab === "profiel" && (
            <div style={{ animation: "slideUp .2s ease" }}>
              <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ fontSize: "0.5rem", letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 18 }}>Persoonlijke gegevens</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Volledige naam</label>
                  <input value={profiel.naam} onChange={(e) => { setProfiel((p) => ({ ...p, naam: e.target.value })); setProfielSaved(false); setProfielMsg(""); }} placeholder="Voor- en achternaam" style={inp} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>E-mailadres</label>
                  <div style={{ padding: "10px 13px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, fontSize: "0.75rem", color: C.muted }}>🔒 {user?.email}</div>
                  <div style={{ fontSize: "0.56rem", color: C.dim, marginTop: 4 }}>Inlogadres — niet wijzigbaar</div>
                </div>
                <div style={{ marginBottom: 0 }}>
                  <label style={lbl}>Telefoonnummer</label>
                  <input type="tel" value={profiel.tel} onChange={(e) => { setProfiel((p) => ({ ...p, tel: e.target.value })); setProfielSaved(false); setProfielMsg(""); }} placeholder="06 00 00 00 00" style={inp} />
                </div>
                {profielMsg && <div style={{ fontSize: "0.65rem", color: profielMsg.includes("mislukt") ? C.red : C.green, marginTop: 12 }}>{profielMsg}</div>}
              </div>
            </div>
          )}

          {/* BEDRIJF */}
          {subTab === "bedrijf" && (
            <div style={{ animation: "slideUp .2s ease" }}>
              <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "22px 24px", marginBottom: 14 }}>
                <div style={{ fontSize: "0.5rem", letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 18 }}>Bedrijfsgegevens</div>
                {[
                  { key: "bedrijfsnaam" as const, label: "Bedrijfsnaam", placeholder: "Jouw Bedrijf BV" },
                  { key: "kvk" as const, label: "KvK-nummer", placeholder: "12345678" },
                  { key: "btw" as const, label: "BTW-nummer", placeholder: "NL000000000B01" },
                  { key: "iban" as const, label: "IBAN", placeholder: "NL00 BANK 0000 0000 00" },
                  { key: "straal" as const, label: "Werkstraal (km)", placeholder: "50" },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <label style={lbl}>{f.label}</label>
                    <input value={bedrijf[f.key]} onChange={(e) => { setBedrijf((p) => ({ ...p, [f.key]: e.target.value })); setBedrijfSaved(false); setBedrijfMsg(""); }} placeholder={f.placeholder} style={inp} />
                  </div>
                ))}
                <div style={{ marginBottom: 0 }}>
                  <label style={lbl}>Bio / omschrijving <span style={{ color: C.dim }}>— zichtbaar voor eigenaar</span></label>
                  <textarea value={bedrijf.beschrijving} onChange={(e) => { setBedrijf((p) => ({ ...p, beschrijving: e.target.value })); setBedrijfSaved(false); setBedrijfMsg(""); }} placeholder="Korte omschrijving van uw werkzaamheden…" rows={3} style={{ ...inp, resize: "vertical" }} />
                </div>
                {bedrijfMsg && <div style={{ fontSize: "0.65rem", color: bedrijfMsg.includes("mislukt") ? C.red : C.green, marginTop: 12 }}>{bedrijfMsg}</div>}
              </div>
              <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ fontSize: "0.5rem", letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>🔨 Specialisaties</div>
                <div style={{ fontSize: "0.68rem", color: C.muted, marginBottom: 12 }}>Klik om vloertypes te selecteren:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SPECS.map((sp) => {
                    const on = bedrijf.specialisaties.includes(sp);
                    return (
                      <button key={sp} onClick={() => toggleSpec(sp)}
                        style={{ padding: "8px 16px", borderRadius: 99, background: on ? "rgba(74,158,232,.15)" : "rgba(255,255,255,.04)", border: `1px solid ${on ? "rgba(74,158,232,.5)" : C.bdr}`, color: on ? C.blue : C.muted, fontSize: "0.66rem", cursor: "pointer", fontWeight: on ? 700 : 400, transition: "all .2s" }}>
                        {on ? "✓ " : ""}{sp}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* BEVEILIGING */}
          {subTab === "beveiliging" && (
            <div style={{ animation: "slideUp .2s ease" }}>
              <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ fontSize: "0.5rem", letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 18 }}>Wachtwoord wijzigen</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Huidig wachtwoord</label>
                  <input type="password" value={pwOud} onChange={(e) => setPwOud(e.target.value)} placeholder="••••••••" style={inp} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Nieuw wachtwoord <span style={{ color: C.dim }}>— minimaal 8 tekens</span></label>
                  <input type="password" value={pwNieuw} onChange={(e) => setPwNieuw(e.target.value)} placeholder="••••••••" style={inp} />
                  {pwNieuw && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                        <div style={{ height: "100%", width: `${Math.min(100, pwStrength(pwNieuw) / 5 * 100)}%`, background: pwColor(pwStrength(pwNieuw)), borderRadius: 99, transition: "width .3s" }} />
                      </div>
                      <span style={{ fontSize: "0.58rem", color: pwColor(pwStrength(pwNieuw)) }}>{pwLabel(pwStrength(pwNieuw))}</span>
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={lbl}>Bevestig nieuw wachtwoord</label>
                  <input type="password" value={pwBevestig} onChange={(e) => setPwBevestig(e.target.value)} placeholder="••••••••" style={inp} />
                </div>
                {pwErr && <div style={{ padding: "10px 14px", background: "rgba(224,90,90,.08)", border: `1px solid ${C.red}44`, borderRadius: 7, fontSize: "0.68rem", color: C.red, marginBottom: 12 }}>⚠ {pwErr}</div>}
                {pwOk && <div style={{ padding: "10px 14px", background: "rgba(60,184,122,.08)", border: "1px solid rgba(60,184,122,.25)", borderRadius: 7, fontSize: "0.68rem", color: C.green, marginBottom: 12 }}>✓ {pwOk}</div>}
                <button onClick={handlePwChange} disabled={!pwOud || !pwNieuw || !pwBevestig || pwSaving}
                  style={{ padding: "11px 22px", background: (!pwOud || !pwNieuw || !pwBevestig) ? "rgba(255,255,255,.04)" : "rgba(74,158,232,.12)", border: `1px solid ${(!pwOud || !pwNieuw || !pwBevestig) ? C.bdr : "rgba(74,158,232,.4)"}`, color: (!pwOud || !pwNieuw || !pwBevestig) ? C.dim : C.blue, fontSize: "0.64rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: (!pwOud || !pwNieuw || !pwBevestig || pwSaving) ? "not-allowed" : "pointer", borderRadius: 8, opacity: (!pwOud || !pwNieuw || !pwBevestig) ? 0.5 : 1 }}>
                  {pwSaving ? "Opslaan…" : "🔐 Wachtwoord wijzigen"}
                </button>
              </div>
            </div>
          )}

          {/* VOORKEUREN */}
          {subTab === "voorkeuren" && (
            <div style={{ animation: "slideUp .2s ease" }}>
              <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "22px 24px", marginBottom: 12 }}>
                <div style={{ fontSize: "0.5rem", letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 18 }}>Notificaties</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: C.white, marginBottom: 2 }}>E-mail notificaties</div>
                    <div style={{ fontSize: "0.6rem", color: C.dim }}>Status updates en bevestigingen per e-mail</div>
                  </div>
                  <ToggleSwitch value={emailNotif} onChange={setEmailNotif} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: C.white, marginBottom: 2 }}>Nieuwe klus meldingen</div>
                    <div style={{ fontSize: "0.6rem", color: C.dim }}>Alert bij nieuwe beschikbare klus</div>
                  </div>
                  <ToggleSwitch value={klusNotif} onChange={setKlusNotif} />
                </div>
              </div>
              <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ fontSize: "0.5rem", letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 18 }}>Weergave</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: C.white, marginBottom: 2 }}>Compacte weergave</div>
                    <div style={{ fontSize: "0.6rem", color: C.dim }}>Minder witruimte in overzichten</div>
                  </div>
                  <ToggleSwitch value={compact} onChange={setCompact} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </LeggerLayout>
  );
}
