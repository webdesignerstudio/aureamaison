"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/landing/colors";
import { useMobile } from "@/hooks/use-mobile";

interface SettingsGearProps {
  userId: string;
  email: string;
  name: string;
}

/** Tandwiel-knop + instellingen-modal (1:1 stijl uit module, wired to Supabase). */
export function SettingsGear({ userId, email, name }: SettingsGearProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Instellingen"
        style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.05)", border: `1px solid ${C.bdr}`, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all .2s", flexShrink: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(198,165,107,.12)"; e.currentTarget.style.color = C.gold; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.color = C.muted; }}
      >
        ⚙
      </button>
      {open && <SettingsModal userId={userId} email={email} name={name} onClose={() => setOpen(false)} />}
    </>
  );
}

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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 99, background: value ? C.green : "rgba(255,255,255,.1)", border: "none", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.white, position: "absolute", top: 3, left: value ? 21 : 3, transition: "left .2s" }} />
    </button>
  );
}

type TabId = "profiel" | "beveiliging" | "notificaties";

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "profiel",       icon: "👤", label: "Mijn gegevens" },
  { id: "beveiliging",   icon: "🔐", label: "Beveiliging" },
  { id: "notificaties",  icon: "🔔", label: "Notificaties" },
];

const NOTIF_ITEMS: [string, string][] = [
  ["Nieuwe opdracht",      "Bij elke nieuwe klantopdracht"],
  ["Status update klant",  "Bij elke statuswijziging van een opdracht"],
  ["Offerte reactie",      "Als klant een offerte accepteert of afwijst"],
  ["Legger toegewezen",    "Als een legger wordt toegewezen"],
  ["Betaalbevestiging",    "Na markeren als betaald"],
];

function SettingsModal({ userId, email, name, onClose }: SettingsGearProps & { onClose: () => void }) {
  const mobile = useMobile();
  const [tab, setTab] = useState<TabId>("profiel");

  // Profiel
  const [naam, setNaam] = useState(name || "");
  const [tel, setTel] = useState("");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profMsg, setProfMsg] = useState("");

  // Beveiliging
  const [pwOud, setPwOud] = useState("");
  const [pwNieuw, setPwNieuw] = useState("");
  const [pwBevestig, setPwBevestig] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwOk, setPwOk] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // Notificaties
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_ITEMS.map(([k]) => [k, true]))
  );

  const handleSave = async () => {
    setSaving(true); setProfMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ name: naam, telefoon: tel }).eq("id", userId);
    setSaving(false);
    if (error) { setProfMsg("Opslaan mislukt: " + error.message); return; }
    setSaved(true); setProfMsg("Profiel opgeslagen ✓");
  };

  const handlePwChange = async () => {
    setPwErr(""); setPwOk("");
    if (!pwOud || !pwNieuw || !pwBevestig) { setPwErr("Vul alle velden in"); return; }
    if (pwNieuw !== pwBevestig) { setPwErr("Wachtwoorden komen niet overeen"); return; }
    if (pwNieuw.length < 8) { setPwErr("Minimaal 8 tekens"); return; }
    setPwSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwNieuw });
    setPwSaving(false);
    if (error) { setPwErr(error.message); return; }
    setPwOud(""); setPwNieuw(""); setPwBevestig("");
    setPwOk("Wachtwoord gewijzigd ✓");
  };

  const inp: React.CSSProperties = { width: "100%", padding: "10px 13px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, fontSize: 13, color: C.white, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: "0.56rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 6, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 5000, background: "rgba(5,5,5,.98)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(8,8,6,.98)", borderBottom: `1px solid ${C.bdr}`, padding: mobile ? "14px 16px" : "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 2 }}>Account</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "1.3rem" : "1.7rem", fontWeight: 300 }}>⚙ Instellingen</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {tab === "profiel" && !saved && (
            <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", background: "rgba(198,165,107,.15)", border: `1px solid ${C.gold}`, color: C.gold, fontSize: "0.62rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 7 }}>
              {saving ? "Opslaan…" : "💾 Opslaan"}
            </button>
          )}
          {tab === "profiel" && saved && profMsg && <span style={{ fontSize: "0.62rem", color: C.green }}>✓ Opgeslagen</span>}
          <button onClick={onClose} style={{ padding: "9px 16px", background: "none", border: `1px solid rgba(255,255,255,.15)`, color: C.muted, fontSize: "0.62rem", cursor: "pointer", borderRadius: 7, fontWeight: 700 }}>✕ Sluiten</button>
        </div>
      </div>

      {/* BODY: zijbalk op desktop, tabbar op mobiel */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* DESKTOP ZIJBALK */}
        {!mobile && (
          <div style={{ width: 200, background: C.deep, borderRight: `1px solid ${C.bdr}`, flexShrink: 0, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: tab === t.id ? "rgba(198,165,107,.08)" : "transparent", border: tab === t.id ? `1px solid rgba(198,165,107,.2)` : "1px solid transparent", color: tab === t.id ? C.gold : C.muted, cursor: "pointer", borderRadius: 7, fontSize: "0.7rem", letterSpacing: 1, textAlign: "left", transition: "all .2s" }}>
                <span style={{ fontSize: 15 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        )}

        {/* MOBIEL TABBAR */}
        {mobile && (
          <div style={{ position: "absolute", top: 72, left: 0, right: 0, background: C.deep, borderBottom: `1px solid ${C.bdr}`, display: "flex", overflowX: "auto", zIndex: 9 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "11px 16px", background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent", color: tab === t.id ? C.gold : C.muted, cursor: "pointer", fontSize: "0.63rem", fontWeight: tab === t.id ? 700 : 400, whiteSpace: "nowrap", flexShrink: 0 }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: mobile ? "56px 16px 24px" : "28px 40px" }}>
          <div style={{ maxWidth: 560 }}>

            {/* MIJN GEGEVENS */}
            {tab === "profiel" && (
              <div style={{ animation: "slideUp .25s ease", display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={lbl}>Volledige naam</label>
                  <input value={naam} onChange={(e) => { setNaam(e.target.value); setSaved(false); setProfMsg(""); }} placeholder="Voor- en achternaam" style={inp} />
                </div>
                <div>
                  <label style={lbl}>E-mailadres</label>
                  <div style={{ padding: "10px 13px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, fontSize: 13, color: C.muted }}>{email}</div>
                  <div style={{ fontSize: "0.56rem", color: C.dim, marginTop: 5 }}>Inlogadres — niet wijzigbaar</div>
                </div>
                <div>
                  <label style={lbl}>Telefoonnummer</label>
                  <input type="tel" value={tel} onChange={(e) => { setTel(e.target.value); setSaved(false); setProfMsg(""); }} placeholder="06 00 00 00 00" style={inp} />
                </div>
                {profMsg && <div style={{ fontSize: "0.65rem", color: profMsg.includes("mislukt") ? C.red : C.green }}>{profMsg}</div>}
              </div>
            )}

            {/* BEVEILIGING */}
            {tab === "beveiliging" && (
              <div style={{ animation: "slideUp .25s ease", display: "flex", flexDirection: "column", gap: 18, maxWidth: 420 }}>
                <div>
                  <label style={lbl}>Huidig wachtwoord</label>
                  <input type="password" value={pwOud} onChange={(e) => setPwOud(e.target.value)} placeholder="••••••••" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Nieuw wachtwoord <span style={{ color: C.dim, textTransform: "none", letterSpacing: 0 }}>— minimaal 8 tekens</span></label>
                  <input type="password" value={pwNieuw} onChange={(e) => setPwNieuw(e.target.value)} placeholder="Minimaal 8 tekens" style={inp} />
                  {pwNieuw && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                        <div style={{ height: "100%", width: `${Math.min(100, pwStrength(pwNieuw) / 5 * 100)}%`, background: pwColor(pwStrength(pwNieuw)), borderRadius: 99, transition: "width .3s" }} />
                      </div>
                      <span style={{ fontSize: "0.58rem", color: pwColor(pwStrength(pwNieuw)) }}>{pwLabel(pwStrength(pwNieuw))}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={lbl}>Bevestig nieuw wachtwoord</label>
                  <input type="password" value={pwBevestig} onChange={(e) => setPwBevestig(e.target.value)} placeholder="Herhaal nieuw wachtwoord" style={inp} />
                </div>
                {pwErr && <div style={{ fontSize: "0.65rem", color: C.red }}>⚠ {pwErr}</div>}
                {pwOk && <div style={{ fontSize: "0.65rem", color: C.green }}>✓ {pwOk}</div>}
                <button onClick={handlePwChange} disabled={!pwOud || !pwNieuw || !pwBevestig || pwSaving}
                  style={{ padding: "11px 20px", background: (!pwOud || !pwNieuw || !pwBevestig) ? "rgba(255,255,255,.04)" : "rgba(198,165,107,.15)", border: `1px solid ${(!pwOud || !pwNieuw || !pwBevestig) ? C.bdr : C.gold}`, color: (!pwOud || !pwNieuw || !pwBevestig) ? C.dim : C.gold, fontSize: "0.62rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: (!pwOud || !pwNieuw || !pwBevestig || pwSaving) ? "not-allowed" : "pointer", borderRadius: 7, width: "fit-content", opacity: (!pwOud || !pwNieuw || !pwBevestig) ? 0.5 : 1 }}>
                  {pwSaving ? "Bezig…" : "🔐 Wachtwoord wijzigen"}
                </button>
              </div>
            )}

            {/* NOTIFICATIES */}
            {tab === "notificaties" && (
              <div style={{ animation: "slideUp .25s ease" }}>
                <div style={{ padding: "12px 16px", background: "rgba(74,158,232,.05)", border: "1px solid rgba(74,158,232,.18)", borderRadius: 8, marginBottom: 20, fontSize: "0.68rem", color: C.muted, lineHeight: 1.8 }}>
                  📬 E-mails worden automatisch verzonden via de geconfigureerde e-mailprovider.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0, background: C.deep, border: `1px solid ${C.bdr}`, borderRadius: 12, overflow: "hidden" }}>
                  {NOTIF_ITEMS.map(([label, sub], i) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 18px", borderTop: i > 0 ? `1px solid ${C.bdr}` : "none" }}>
                      <div>
                        <div style={{ fontSize: "0.72rem", color: C.white, marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: "0.6rem", color: C.dim }}>{sub}</div>
                      </div>
                      <Toggle value={notifs[label]} onChange={(v) => setNotifs((p) => ({ ...p, [label]: v }))} />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
