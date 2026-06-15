"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/lib/landing/colors";
import { useMobile } from "@/hooks/use-mobile";

const ROLLEN = [
  {
    id: "eigenaar",
    icon: "⚙️",
    label: "Eigenaar",
    title: "Eigenaar Dashboard",
    desc: "Beheer opdrachten, leggers, facturen en instellingen. Volledig operationeel systeem.",
    kleur: C.gold,
    kleurBg: "rgba(198,165,107,.07)",
    kleurBdr: "rgba(198,165,107,.3)",
    href: "/login",
    hint: "eigenaar@aurea.nl",
  },
  {
    id: "opdrachtgever",
    icon: "🏠",
    label: "Opdrachtgever",
    title: "Opdrachtgever Portaal",
    desc: "Geef een opdracht op, volg de status en ontvang uw facturen digitaal.",
    kleur: C.green,
    kleurBg: "rgba(60,184,122,.07)",
    kleurBdr: "rgba(60,184,122,.3)",
    href: "/client/login",
    hint: "Particulier of zakelijk",
  },
  {
    id: "legger",
    icon: "🔨",
    label: "Legger",
    title: "Legger Portaal",
    desc: "Bekijk beschikbare klussen, neem aan en beheer uw eigen agenda en verdiensten.",
    kleur: C.blue,
    kleurBg: "rgba(74,158,232,.07)",
    kleurBdr: "rgba(74,158,232,.3)",
    href: "/legger/login",
    hint: "Freelance vakman",
  },
];

export default function PortaalKeuzePage() {
  const router = useRouter();
  const mobile = useMobile();
  const [hov, setHov] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: mobile ? "24px 20px" : "40px 24px", position: "relative" }}>

      {/* Achtergrond accent */}
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(198,165,107,.06) 0%, transparent 65%)`, pointerEvents: "none" }} />

      {/* Terug knop */}
      {mobile ? (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: "rgba(5,5,5,.97)", borderBottom: `1px solid ${C.bdr}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => router.push("/")} style={{ background: "none", border: `1px solid ${C.bdr}`, color: C.muted, cursor: "pointer", borderRadius: 6, padding: "6px 12px", fontSize: "0.65rem", letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            ← Terug
          </button>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", fontWeight: 500, letterSpacing: 4, color: C.gold }}>AUREA MAISON</div>
        </div>
      ) : (
        <button onClick={() => router.push("/")} style={{ position: "absolute", top: 24, left: 24, background: "none", border: `1px solid ${C.bdr}`, color: C.muted, cursor: "pointer", borderRadius: 8, padding: "8px 14px", fontSize: "0.6rem", letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
          ← Terug
        </button>
      )}

      {/* Logo + header */}
      <div style={{ textAlign: "center", marginBottom: mobile ? 36 : 48, marginTop: mobile ? 52 : 0, animation: "slideUp .5s ease both" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "1.4rem" : "1.8rem", fontWeight: 500, letterSpacing: 6, color: C.gold, marginBottom: 6 }}>AUREA MAISON</div>
        <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: "rgba(198,165,107,.4)", textTransform: "uppercase", marginBottom: 20 }}>Floors &amp; Interiors</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "1.8rem" : "2.6rem", fontWeight: 300, color: C.white, marginBottom: 10 }}>
          Welkom — <em style={{ fontStyle: "italic", color: C.goldL }}>Wie bent u?</em>
        </h1>
        <p style={{ fontSize: "0.7rem", color: C.dim, lineHeight: 1.8 }}>Kies uw rol om door te gaan naar het juiste aanmeld- of inlogscherm.</p>
      </div>

      {/* Rol-kaarten */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 480 }}>
        {ROLLEN.map((r, i) => (
          <button key={r.id}
            onClick={() => router.push(r.href)}
            onMouseEnter={() => setHov(r.id)}
            onMouseLeave={() => setHov(null)}
            style={{
              display: "flex", alignItems: "center", gap: 18,
              padding: "20px 22px",
              background: hov === r.id ? r.kleurBg.replace(".07", ".13") : r.kleurBg,
              border: `1px solid ${hov === r.id ? r.kleur : r.kleurBdr}`,
              borderRadius: 12, cursor: "pointer", textAlign: "left",
              transition: "all .2s",
              animation: `slideUp .45s ${i * 0.08}s ease both`,
              width: "100%",
            }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `${r.kleur}18`, border: `1px solid ${r.kleur}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0, transition: "transform .2s", transform: hov === r.id ? "scale(1.08)" : "scale(1)" }}>
              {r.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.46rem", letterSpacing: 3, color: r.kleur, textTransform: "uppercase", marginBottom: 3, fontWeight: 600 }}>{r.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.05rem", color: C.white, marginBottom: 4, lineHeight: 1.2 }}>{r.title}</div>
              <div style={{ fontSize: "0.62rem", color: C.dim, lineHeight: 1.6 }}>{r.desc}</div>
              <div style={{ fontSize: "0.52rem", color: r.kleur, opacity: .6, marginTop: 5, letterSpacing: 1 }}>{r.hint}</div>
            </div>
            <div style={{ color: r.kleur, fontSize: "1.3rem", flexShrink: 0, transition: "transform .2s", transform: hov === r.id ? "translateX(4px)" : "none" }}>→</div>
          </button>
        ))}
      </div>

      <p style={{ fontSize: "0.58rem", color: C.dim, marginTop: 32, textAlign: "center", lineHeight: 1.8, animation: "slideUp .5s .3s ease both" }}>
        Nog geen account? U kunt zich aanmaken via het opdrachtgever- of leggerportaal.
      </p>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
