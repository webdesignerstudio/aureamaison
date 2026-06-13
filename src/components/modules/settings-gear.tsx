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

function SettingsModal({ userId, email, name, onClose }: SettingsGearProps & { onClose: () => void }) {
  const mobile = useMobile();
  const [tab, setTab] = useState<"profiel" | "beveiliging">("profiel");

  const [naam, setNaam] = useState(name || "");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profMsg, setProfMsg] = useState("");

  const [pwNieuw, setPwNieuw] = useState("");
  const [pwBevestig, setPwBevestig] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwOk, setPwOk] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setProfMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ name: naam }).eq("id", userId);
    setSaving(false);
    if (error) { setProfMsg("Opslaan mislukt: " + error.message); return; }
    setSaved(true);
    setProfMsg("Profiel opgeslagen ✓");
  };

  const handlePwChange = async () => {
    setPwErr(""); setPwOk("");
    if (!pwNieuw || !pwBevestig) { setPwErr("Vul beide velden in"); return; }
    if (pwNieuw !== pwBevestig) { setPwErr("Wachtwoorden komen niet overeen"); return; }
    if (pwNieuw.length < 8) { setPwErr("Minimaal 8 tekens"); return; }
    setPwSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwNieuw });
    setPwSaving(false);
    if (error) { setPwErr(error.message); return; }
    setPwNieuw(""); setPwBevestig("");
    setPwOk("Wachtwoord gewijzigd ✓");
  };

  const tabs: { id: "profiel" | "beveiliging"; icon: string; label: string }[] = [
    { id: "profiel", icon: "👤", label: "Mijn gegevens" },
    { id: "beveiliging", icon: "🔐", label: "Beveiliging" },
  ];

  const inp: React.CSSProperties = { width: "100%", padding: "10px 13px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, fontSize: 13, color: C.white, outline: "none", fontFamily: "inherit" };
  const lbl: React.CSSProperties = { fontSize: "0.56rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 6, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 5000, background: "rgba(5,5,5,.98)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(8,8,6,.98)", borderBottom: `1px solid ${C.bdr}`, padding: mobile ? "14px 16px" : "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
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
          {tab === "profiel" && saved && <span style={{ fontSize: "0.62rem", color: C.green }}>✓ Opgeslagen</span>}
          <button onClick={onClose} style={{ padding: "9px 16px", background: "none", border: `1px solid rgba(255,255,255,.15)`, color: C.muted, fontSize: "0.62rem", cursor: "pointer", borderRadius: 7, fontWeight: 700 }}>✕ Sluiten</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: C.deep, borderBottom: `1px solid ${C.bdr}`, display: "flex", overflowX: "auto", flexShrink: 0 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "11px 18px", background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent", color: tab === t.id ? C.gold : C.muted, cursor: "pointer", fontSize: "0.63rem", fontWeight: tab === t.id ? 700 : 400, whiteSpace: "nowrap", flexShrink: 0, transition: "color .2s" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: mobile ? "16px" : "28px 40px", maxWidth: 700, width: "100%" }}>
        {tab === "profiel" && (
          <div style={{ animation: "slideUp .25s ease", display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={lbl}>Volledige naam</label>
              <input value={naam} onChange={(e) => { setNaam(e.target.value); setSaved(false); }} placeholder="Voor- en achternaam" style={inp} />
            </div>
            <div>
              <label style={lbl}>E-mailadres</label>
              <div style={{ padding: "10px 13px", background: "rgba(255,255,255,.04)", border: `1px solid ${C.bdr}`, borderRadius: 7, fontSize: 13, color: C.muted }}>{email}</div>
              <div style={{ fontSize: "0.56rem", color: C.dim, marginTop: 5 }}>Inlogadres — niet wijzigbaar</div>
            </div>
            {profMsg && <div style={{ fontSize: "0.65rem", color: profMsg.includes("mislukt") ? C.red : C.green }}>{profMsg}</div>}
          </div>
        )}

        {tab === "beveiliging" && (
          <div style={{ animation: "slideUp .25s ease", display: "flex", flexDirection: "column", gap: 18, maxWidth: 420 }}>
            <div>
              <label style={lbl}>Nieuw wachtwoord</label>
              <input type="password" value={pwNieuw} onChange={(e) => setPwNieuw(e.target.value)} placeholder="Minimaal 8 tekens" style={inp} />
            </div>
            <div>
              <label style={lbl}>Bevestig wachtwoord</label>
              <input type="password" value={pwBevestig} onChange={(e) => setPwBevestig(e.target.value)} placeholder="Herhaal nieuw wachtwoord" style={inp} />
            </div>
            {pwErr && <div style={{ fontSize: "0.65rem", color: C.red }}>{pwErr}</div>}
            {pwOk && <div style={{ fontSize: "0.65rem", color: C.green }}>{pwOk}</div>}
            <button onClick={handlePwChange} disabled={pwSaving} style={{ padding: "11px 20px", background: "rgba(198,165,107,.15)", border: `1px solid ${C.gold}`, color: C.gold, fontSize: "0.62rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 7, width: "fit-content" }}>
              {pwSaving ? "Bezig…" : "🔐 Wachtwoord wijzigen"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
