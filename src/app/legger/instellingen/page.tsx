"use client";

import { useState } from "react";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/landing/colors";

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
  { id: "beveiliging", icon: "🔐", label: "Beveiliging" },
  { id: "voorkeuren", icon: "⚙️", label: "Voorkeuren" },
];

const inp = { width: "100%", padding: "10px 13px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, color: C.white, fontSize: "0.75rem", outline: "none", boxSizing: "border-box" as const };
const lbl = { display: "block", fontSize: "0.48rem", letterSpacing: 2, color: C.muted, textTransform: "uppercase" as const, marginBottom: 5, fontWeight: 600 };

export default function LeggerInstellingenPage() {
  const [subTab, setSubTab] = useState("beveiliging");

  const [pwOud, setPwOud] = useState("");
  const [pwNieuw, setPwNieuw] = useState("");
  const [pwBevestig, setPwBevestig] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwOk, setPwOk] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [emailNotif, setEmailNotif] = useState(true);
  const [klusNotif, setKlusNotif] = useState(true);
  const [compact, setCompact] = useState(false);

  const handlePwChange = async () => {
    setPwErr(""); setPwOk("");
    if (pwNieuw !== pwBevestig) { setPwErr("Wachtwoorden komen niet overeen"); return; }
    if (pwNieuw.length < 8) { setPwErr("Minimaal 8 tekens vereist"); return; }
    setPwSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwNieuw });
    if (error) { setPwErr(error.message); } else { setPwOk("Wachtwoord succesvol gewijzigd ✓"); setPwOud(""); setPwNieuw(""); setPwBevestig(""); }
    setPwSaving(false);
  };

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 99, background: value ? C.green : "rgba(255,255,255,.1)", border: "none", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.white, position: "absolute", top: 3, left: value ? 21 : 3, transition: "left .2s" }} />
    </button>
  );

  return (
    <LeggerLayout>
      <div style={{ animation: "slideUp .3s ease" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Account</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, letterSpacing: -1, margin: 0 }}>
            Mijn <em style={{ fontStyle: "italic", color: C.goldL }}>Instellingen</em>
          </h1>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.bdr}`, marginBottom: 28 }}>
          {SUB_TABS.map((t) => (
            <button key={t.id} onClick={() => setSubTab(t.id)}
              style={{ padding: "10px 16px", background: "none", border: "none", borderBottom: subTab === t.id ? `2px solid ${C.gold}` : "2px solid transparent", color: subTab === t.id ? C.gold : C.muted, cursor: "pointer", fontSize: "0.63rem", fontWeight: subTab === t.id ? 700 : 400, whiteSpace: "nowrap", letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 560 }}>

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
                  style={{ padding: "11px 22px", background: (!pwOud || !pwNieuw || !pwBevestig) ? "rgba(255,255,255,.04)" : "rgba(198,165,107,.12)", border: `1px solid ${(!pwOud || !pwNieuw || !pwBevestig) ? C.bdr : C.gold}`, color: (!pwOud || !pwNieuw || !pwBevestig) ? C.dim : C.gold, fontSize: "0.64rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: (!pwOud || !pwNieuw || !pwBevestig || pwSaving) ? "not-allowed" : "pointer", borderRadius: 8, opacity: (!pwOud || !pwNieuw || !pwBevestig) ? 0.5 : 1 }}>
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
