"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/lib/landing/colors";
import { useMobile } from "@/hooks/use-mobile";
import { LLabel } from "@/components/landing/llabel";
import { DienstenCarousel } from "@/components/landing/diensten-carousel";
import { GallerySection } from "@/components/landing/gallery-section";

const faqItems = [
  ["Hoe lang duurt het leggen van een vloer?","De meeste projecten worden afgerond in 1 tot 3 dagen. Bij grotere projecten bespreken wij de planning vooraf."],
  ["Komt u ook bij mij thuis langs voor advies?","Ja, wij bieden een gratis showroom aan huis. Wij brengen onze collectie bij u thuis zodat u kunt kiezen in uw eigen interieur."],
  ["Hoe werkt het opdrachtgeversportaal?","U maakt een gratis account aan, geeft uw projectgegevens op en volgt vervolgens de status in real-time. Facturen ontvangt u digitaal via het portaal."],
  ["Zijn uw vloeren geschikt voor vloerverwarming?","Ja, wij installeren vloeren die geschikt zijn voor vloerverwarming. Dit bespreken wij altijd vooraf."],
  ["Wat kost een nieuwe vloer gemiddeld?","De prijs hangt af van het vloertype en de oppervlakte. Vraag een vrijblijvende offerte aan voor een nauwkeurige prijs op maat."],
];

/* ─── SIMPLIFIED QUOTE FORM ─── */
function QuoteForm({ onClose }: { onClose: () => void }) {
  const mobile = useMobile();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ naam: "", email: "", tel: "", adres: "", vloer: "", m2: "", datum: "" });

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: C.bg }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>✓</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", fontWeight: 300, color: C.goldL, marginBottom: 10 }}>Offerte aanvraag ontvangen</h2>
          <p style={{ fontSize: "0.75rem", color: C.muted, lineHeight: 1.8, marginBottom: 24 }}>Bedankt! Wij nemen binnen 24 uur contact met u op.</p>
          <button onClick={onClose} style={{ padding: "12px 28px", background: C.gold, color: C.bg, fontSize: "0.65rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 4 }}>Sluiten</button>
        </div>
      </div>
    );
  }

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "", required = false) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: "0.56rem", letterSpacing: 2.5, textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{label}{required ? " *" : ""}</label>
      <input type={type} value={form[key]} placeholder={placeholder} required={required}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(198,165,107,0.2)", borderRadius: 10, color: C.white, fontSize: 15, outline: "none", colorScheme: "dark" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: mobile ? "80px 5% 40px" : "100px 7% 60px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>Stap {step} van 3</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "1.8rem" : "2.4rem", fontWeight: 300, color: C.white, marginBottom: 28 }}>
          {step === 1 ? "Offerte aanvragen" : step === 2 ? "Projectgegevens" : "Contactgegevens"}
        </h2>
        {step === 1 && (
          <>
            {field("Vloertype", "vloer", "text", "bijv. Visgraat, PVC, Parket", true)}
            {field("Oppervlakte (m²)", "m2", "number", "bijv. 45", true)}
            <button onClick={() => setStep(2)} style={{ width: "100%", padding: "14px", background: C.gold, color: C.bg, fontSize: "0.65rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 4, marginTop: 8 }}>Volgende stap →</button>
          </>
        )}
        {step === 2 && (
          <>
            {field("Adres", "adres", "text", "Straat + huisnummer, postcode, stad", true)}
            {field("Gewenste datum", "datum", "date")}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: "14px", background: "transparent", border: `1px solid ${C.bdr}`, color: C.muted, fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 4 }}>← Terug</button>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: "14px", background: C.gold, color: C.bg, fontSize: "0.65rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 4 }}>Volgende stap →</button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            {field("Naam", "naam", "text", "Uw naam", true)}
            {field("E-mail", "email", "email", "uw@email.nl", true)}
            {field("Telefoon", "tel", "tel", "06 xxxxxxxx")}
            <button onClick={() => setDone(true)} style={{ width: "100%", padding: "14px", background: C.gold, color: C.bg, fontSize: "0.65rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 4, marginTop: 8 }}>Offerte aanvragen →</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── SIMPLIFIED SHOWROOM MODAL ─── */
function ShowroomModal({ onClose }: { onClose: () => void }) {
  const mobile = useMobile();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ naam: "", email: "", tel: "", adres: "" });

  if (done) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(5,5,5,.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderTopLeftRadius: 20, borderTopRightRadius: 20, width: "100%", maxWidth: 500, padding: "32px 20px", animation: "slideUp .3s ease" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🏠</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: C.white, marginBottom: 8 }}>Afspraak ontvangen!</div>
            <p style={{ fontSize: "0.7rem", color: C.muted, marginBottom: 20 }}>Wij bevestigen uw showroombezoek binnen 24 uur.</p>
            <button onClick={onClose} style={{ padding: "10px 24px", background: "none", border: `1px solid ${C.bdr}`, color: C.muted, cursor: "pointer", borderRadius: 7, fontSize: "0.62rem" }}>← Sluiten</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(5,5,5,.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.deep, border: `1px solid ${C.bdr}`, borderTopLeftRadius: 20, borderTopRightRadius: 20, width: "100%", maxWidth: 500, animation: "slideUp .3s ease", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ position: "sticky", top: 0, background: C.deep, borderBottom: `1px solid ${C.bdr}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, zIndex: 2 }}>
          <div style={{ width: 46, height: 46, borderRadius: 10, background: "rgba(198,165,107,.1)", border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>🏠</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.46rem", letterSpacing: 2, color: C.gold, textTransform: "uppercase" }}>Gratis service</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.white }}>Showroom aan Huis</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ padding: "18px 20px 36px" }}>
          <div style={{ padding: "10px 14px", background: "rgba(60,184,122,.05)", border: "1px solid rgba(60,184,122,.2)", borderRadius: 8, marginBottom: 18, fontSize: "0.64rem", color: "#5ad4a2", lineHeight: 1.8 }}>
            ✓ Volledig gratis · Wij brengen 20+ stalen mee · U hoeft niets te doen
          </div>
          {[
            ["Uw naam *", "naam", "text", "Jan de Vries"],
            ["E-mailadres", "email", "email", "jan@email.nl"],
            ["Telefoonnummer *", "tel", "tel", "06 12 34 56 78"],
            ["Bezoekadres *", "adres", "text", "Straat + nr, Postcode, Stad"],
          ].map(([l, k, t, p]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: "0.5rem", letterSpacing: 1.5, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
              <input type={t} value={form[k as keyof typeof form]} placeholder={p}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(198,165,107,0.2)", borderRadius: 10, color: C.white, fontSize: 13, outline: "none", colorScheme: "dark" }} />
            </div>
          ))}
          <button onClick={() => setDone(true)} style={{ width: "100%", padding: "13px", background: C.gold, border: "none", color: "#050505", fontSize: "0.65rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 9, marginTop: 8 }}>
            🏠 Afspraak aanvragen →
          </button>
          <p style={{ fontSize: "0.58rem", color: C.dim, textAlign: "center", marginTop: 8, lineHeight: 1.7 }}>Wij bevestigen uw afspraak binnen 24 uur. Volledig vrijblijvend.</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const router = useRouter();
  const mobile = useMobile();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [faq, setFaq] = useState<number | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [showroomOpen, setShowroomOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const goPortal = () => router.push("/login");
  const goLegger = () => router.push("/legger/login");

  const navLinks = ["diensten", "portaal", "showroom", "werkwijze", "reviews", "galerij", "faq", "contact"];

  return (
    <div style={{ background: C.bg, color: C.white, minHeight: "100vh", paddingBottom: mobile ? 68 : 0 }}>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 998, display: "flex", justifyContent: "space-between", alignItems: "center", padding: scrolled || mobile ? "16px 5%" : "28px 6%", background: scrolled || mobile ? "rgba(5,5,5,.97)" : "transparent", backdropFilter: "blur(30px)", borderBottom: `1px solid ${scrolled || mobile ? C.bdr : "transparent"}`, transition: "all .4s" }}>
        <button onClick={() => scrollTo("hero")} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "1.1rem" : "1.4rem", fontWeight: 500, letterSpacing: 5, color: C.gold, lineHeight: 1 }}>AUREA MAISON</div>
          {!mobile && <div style={{ fontSize: "0.58rem", letterSpacing: 4, color: "rgba(198,165,107,.4)", textTransform: "uppercase" }}>Floors &amp; Interiors</div>}
        </button>
        {!mobile ? (
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {navLinks.map((id) => (
              <button key={id}
                onClick={id === "showroom" ? () => setShowroomOpen(true) : () => scrollTo(id)}
                style={{ color: id === "showroom" ? C.gold : C.white, fontSize: "0.65rem", letterSpacing: 2, textTransform: "uppercase", opacity: id === "showroom" ? 1 : .55, cursor: "pointer", background: "none", border: "none", transition: "opacity .2s" }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = id === "showroom" ? "1" : ".55"; }}>
                {id === "showroom" ? "🏠 Showroom" : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <button onClick={goPortal} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: "rgba(60,184,122,.1)", border: `1px solid ${C.greenBdr}`, color: C.green, fontSize: "0.6rem", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontWeight: 600, borderRadius: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite", display: "block" }} />
              Portaal
            </button>
            <button onClick={() => setQuoteOpen(true)} style={{ padding: "9px 16px", border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "0.62rem", letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", background: "transparent", borderRadius: 4 }}>
              Offerte aanvragen
            </button>
          </div>
        ) : (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 6 }}>
            <span style={{ display: "block", width: 24, height: 1, background: C.gold, transition: "all .3s", transform: menuOpen ? "rotate(45deg) translate(4px,4px)" : "none" }} />
            <span style={{ display: "block", width: 24, height: 1, background: C.gold, transition: "all .3s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: 24, height: 1, background: C.gold, transition: "all .3s", transform: menuOpen ? "rotate(-45deg) translate(4px,-4px)" : "none" }} />
          </button>
        )}
      </nav>

      {/* MOBILE MENU */}
      {mobile && menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 997, background: "rgba(5,5,5,0.99)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
          {navLinks.map((id, i) => (
            <button key={id} onClick={() => { if (id === "showroom") { setMenuOpen(false); setShowroomOpen(true); } else { scrollTo(id); setMenuOpen(false); } }}
              style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.4rem", fontWeight: 300, color: id === "showroom" ? C.goldL : C.white, background: "none", border: "none", cursor: "pointer", letterSpacing: 2, opacity: 0, animation: `slideUp .4s ${i * 0.05}s ease both` }}>
              {id === "showroom" ? "🏠 Showroom" : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
          <button onClick={() => { goPortal(); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 24px", background: "rgba(60,184,122,.1)", border: `1px solid ${C.greenBdr}`, color: C.green, fontSize: "0.68rem", letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 600, borderRadius: 6, opacity: 0, animation: "slideUp .4s .3s ease both" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite", display: "block" }} />
            Portaal &amp; Aanmelden
          </button>
        </div>
      )}

      {/* USP BAR */}
      <div style={{ background: C.gold, padding: "9px 6%", display: "flex", gap: 36, justifyContent: "center", flexWrap: "wrap" }}>
        {[["Gratis Showroom aan Huis", true], ["Reactie binnen 24 uur", false], ["Heel Nederland", false], ["4.9 ★ op Google", false]].map(([u, clickable]) => (
          <div key={u as string} onClick={clickable ? () => setShowroomOpen(true) : undefined}
            style={{ fontSize: "0.6rem", letterSpacing: 2, textTransform: "uppercase", color: C.bg, fontWeight: 600, display: "flex", gap: 8, alignItems: "center", cursor: clickable ? "pointer" : "default", textDecoration: clickable ? "underline" : "none", textUnderlineOffset: 3 }}>
            <span style={{ opacity: .45 }}>✦</span>{u as string}
          </div>
        ))}
      </div>

      {/* HERO */}
      <section id="hero" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: mobile ? "1fr" : "52% 48%", overflow: "hidden" }}>
        <div style={{ background: C.deep, padding: mobile ? "120px 6% 60px" : "0 7% 10%", display: "flex", alignItems: mobile ? "center" : "flex-end", position: "relative", minHeight: mobile ? "100vh" : "auto" }}>
          <div style={{ position: "absolute", right: 0, top: 0, width: 1, height: "100%", background: `linear-gradient(to bottom,transparent,${C.gold},transparent)`, opacity: .3 }} />
          <div style={{ animation: "slideUp .8s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
              <div style={{ width: 36, height: 1, background: C.gold }} />
              <span style={{ fontSize: "0.6rem", letterSpacing: 4, textTransform: "uppercase", color: C.gold }}>Ultra Premium Flooring</span>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "2.8rem" : "5.2rem", lineHeight: .95, fontWeight: 300, letterSpacing: -1, marginBottom: 32 }}>
              Exclusieve<br /><em style={{ fontStyle: "italic", color: C.goldL }}>Vloerprojecten</em><br />voor Luxe<br />Interieurs
            </h1>
            <p style={{ fontSize: "0.78rem", color: C.muted, maxWidth: 380, lineHeight: 2, marginBottom: 40 }}>
              Aurea Maison Floors plaatst premium vloeren voor luxe woningen en exclusieve interieurs.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => setQuoteOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 30px", background: C.gold, color: C.bg, fontSize: "0.66rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", border: "none", cursor: "pointer", width: "fit-content", borderRadius: 2 }}>
                Offerte aanvragen <span>→</span>
              </button>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => scrollTo("diensten")} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", background: "transparent", color: C.white, fontSize: "0.64rem", letterSpacing: 3, textTransform: "uppercase", border: `1px solid ${C.bdr}`, cursor: "pointer", borderRadius: 2 }}>
                  Bekijk diensten
                </button>
                <button onClick={() => setShowroomOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", background: "transparent", color: C.gold, fontSize: "0.64rem", letterSpacing: 2, textTransform: "uppercase", border: "1px solid rgba(198,165,107,.35)", cursor: "pointer", borderRadius: 2 }}>
                  🏠 Showroom
                </button>
              </div>
              <button onClick={goPortal} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "15px 28px", background: "rgba(60,184,122,.08)", border: `1px solid ${C.greenBdr}`, color: C.green, fontSize: "0.66rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer", width: "fit-content", borderRadius: 2, marginTop: 4, transition: "all .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(60,184,122,.16)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(60,184,122,.08)"; }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}`, animation: "pulse 2s infinite", display: "block", flexShrink: 0 }} />
                Portaal &amp; Aanmelden →
              </button>
            </div>
          </div>
        </div>
        {!mobile && (
          <div style={{ position: "relative", overflow: "hidden" }}>
            <img src="https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221278/IMG_0282_qxoyw6.jpg" alt="Luxe vloer" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.45) saturate(.6)", animation: "heroScale 18s ease-in-out infinite alternate" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right,${C.deep} 0%,transparent 35%),linear-gradient(to top,rgba(5,5,5,.7),transparent 55%)` }} />
          </div>
        )}
      </section>

      {/* MARQUEE */}
      <div style={{ background: C.gold, padding: "13px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "marquee 28s linear infinite", whiteSpace: "nowrap" }}>
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ display: "flex" }}>
              {["PVC Vloeren", "Visgraat", "Massief Parket", "Traprenovatie", "Egaliseren", "Showroom aan Huis", "Premium Advies"].map((t, j) => (
                <span key={j}>
                  <span style={{ fontSize: "0.6rem", letterSpacing: 4, textTransform: "uppercase", color: C.bg, fontWeight: 600, padding: "0 30px" }}>{t}</span>
                  <span style={{ color: "rgba(5,5,5,.3)", padding: "0 4px" }}>✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* DIENSTEN */}
      <DienstenCarousel goOfferte={() => setQuoteOpen(true)} />

      {/* PORTAAL SECTIE */}
      <section id="portaal" style={{ padding: mobile ? "60px 5%" : "100px 7%", background: C.bg, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 55% at 50% 50%,rgba(60,184,122,.04),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 36 : 60, alignItems: "center", position: "relative" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 26, height: 1, background: C.green }} />
              <span style={{ fontSize: "0.58rem", letterSpacing: 4, textTransform: "uppercase", color: C.green }}>Opdrachtgevers Portaal</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "2.6rem" : "3.5rem", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-.5px", marginBottom: 18 }}>
              Uw project<br /><em style={{ fontStyle: "italic", color: C.green }}>digitaal</em><br />beheren
            </h2>
            <p style={{ fontSize: "0.78rem", color: C.muted, lineHeight: 2, marginBottom: 32 }}>Geef eenvoudig een opdracht op via ons beveiligde portaal. Volg de status in real-time, bekijk uw facturen en communiceer direct met ons team.</p>
            <div style={{ marginBottom: 32 }}>
              {[["📋", "Opdracht eenvoudig online opgeven"], ["📍", "Real-time status van uw project"], ["🧾", "Facturen digitaal ontvangen"], ["📅", "Planning in één overzicht"], ["🔒", "Beveiligd persoonlijk account"]].map(([ic, t]) => (
                <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: "1px solid rgba(60,184,122,.1)" }}>
                  <div style={{ width: 30, height: 30, border: "1px solid rgba(60,184,122,.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.green, flexShrink: 0, background: C.greenDim }}>{ic as string}</div>
                  <span style={{ fontSize: "0.76rem", color: C.white }}>{t as string}</span>
                </div>
              ))}
            </div>
            <button onClick={goPortal} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 32px", background: C.green, color: "#05200f", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 4 }}>
              Naar het portaal →
            </button>
          </div>
          {!mobile && (
            <div style={{ position: "relative", height: 360 }}>
              <div style={{ position: "absolute", right: -16, top: 18, width: "82%", height: "82%", background: "rgba(60,184,122,.03)", border: "1px solid rgba(60,184,122,.12)", borderRadius: 4 }} />
              <div style={{ position: "absolute", left: 0, top: 0, width: "86%", height: "88%", background: "rgba(10,10,8,.92)", border: "1px solid rgba(60,184,122,.22)", borderRadius: 4, padding: "26px 24px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", color: C.green, marginBottom: 4 }}>Mijn Opdrachten</div>
                <div style={{ fontSize: "0.5rem", letterSpacing: 2, textTransform: "uppercase", color: C.green, background: "rgba(60,184,122,.08)", border: "1px solid rgba(60,184,122,.18)", padding: "3px 8px", display: "inline-block", marginBottom: 18 }}>Live status</div>
                {[["✓", "Opdracht ingediend — Parket 52 m²", true], ["✓", "Offerte ontvangen — € 1.680", true], ["✓", "Afspraak bevestigd — 10 juni 09:00", true], ["4", "Uitvoering gepland", false], ["5", "Oplevering & factuur", false]].map(([n, t, done], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)", opacity: done ? 1 : (n === "5" ? .2 : .4) }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", border: `1px solid ${done ? C.green : "rgba(60,184,122,.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", color: C.green, flexShrink: 0, background: done ? "rgba(60,184,122,.15)" : "transparent" }}>{n as string}</div>
                    <div style={{ fontSize: "0.72rem", color: done ? C.white : C.muted }}>{t as string}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SHOWROOM AAN HUIS SECTIE */}
      <section id="showroom" style={{ padding: mobile ? "70px 5%" : "110px 7%", background: C.bg, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 55% at 80% 50%,rgba(198,165,107,.05),transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 40 : 80, alignItems: "center", position: "relative" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 26, height: 1, background: C.gold }} />
              <span style={{ fontSize: "0.58rem", letterSpacing: 4, textTransform: "uppercase", color: C.gold }}>Gratis Service</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "2.6rem" : "3.5rem", fontWeight: 300, lineHeight: 1.05, letterSpacing: "-.5px", marginBottom: 18 }}>
              Showroom<br /><em style={{ fontStyle: "italic", color: C.goldL }}>aan Huis</em>
            </h2>
            <p style={{ fontSize: "0.78rem", color: C.muted, lineHeight: 2, marginBottom: 32 }}>U hoeft niet naar ons toe te komen — wij komen naar u. Onze adviseur brengt meer dan 20 stalen en samples rechtstreeks bij u thuis, zodat u kunt kiezen in uw eigen interieur en licht.</p>
            <div style={{ marginBottom: 36 }}>
              {[["🎨", "20+ materiaalstalen meegebracht"], ["💡", "Persoonlijk kleur- en materiaaladvies"], ["📐", "Inmeting ter plaatse mogelijk"], ["🕐", "Binnen 2 werkdagen bij u thuis"], ["✓", "Volledig gratis & vrijblijvend"]].map(([ic, t]) => (
                <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: `1px solid ${C.bdr}` }}>
                  <div style={{ width: 30, height: 30, border: `1px solid ${C.bdr}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.gold, flexShrink: 0 }}>{ic as string}</div>
                  <span style={{ fontSize: "0.76rem", color: C.white }}>{t as string}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowroomOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 32px", background: C.gold, color: "#050505", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 4 }}>
              🏠 Showroom boeken →
            </button>
          </div>
          {!mobile && (
            <div style={{ position: "relative" }}>
              <img src="https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221279/IMG_0273_upnb5g.jpg" alt="Showroom aan huis" style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 4, filter: "brightness(.65) saturate(.75)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 40%,rgba(5,5,5,.6))", borderRadius: 4 }} />
              <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: C.white, marginBottom: 6 }}>Gratis &amp; Vrijblijvend</div>
                <div style={{ fontSize: "0.64rem", color: "rgba(248,245,239,.6)", lineHeight: 1.7 }}>Wij brengen onze volledige collectie bij u thuis — geen showroom bezoek nodig</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: mobile ? "50px 5%" : "70px 7%", background: C.deep }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 1, background: C.bdr }}>
          {[["12+", "Jaar Ervaring"], ["850+", "Projecten"], ["4.9★", "Google Rating"], ["100%", "Tevredenheid"]].map(([n, l]) => (
            <div key={l as string} style={{ background: C.deep, padding: mobile ? "32px 20px" : "44px 30px" }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "2.8rem" : "3.6rem", color: C.gold, fontWeight: 300, lineHeight: 1, display: "block", marginBottom: 6 }}>{n as string}</span>
              <div style={{ fontSize: "0.62rem", letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>{l as string}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WERKWIJZE */}
      <section id="werkwijze" style={{ padding: mobile ? "70px 5%" : "120px 7%", background: C.bg }}>
        <LLabel>Onze Werkwijze</LLabel>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "2.6rem" : "4.5rem", fontWeight: 300, lineHeight: 1, letterSpacing: -1, marginBottom: 60 }}>
          Van <em style={{ fontStyle: "italic", color: C.goldL }}>Advies</em><br />tot Oplevering
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(4,1fr)", gap: 0, borderTop: `1px solid ${C.bdr}` }}>
          {[["01", "Showroom aan Huis", "Wij brengen onze collectie bij u thuis. Vrijblijvend advies in uw eigen interieur."],
            ["02", "Inmeting & Offerte", "Professionele inmeting en een transparante offerte zonder verborgen kosten."],
            ["03", "Installatie", "Vakkundige installatie door onze gecertificeerde monteurs. Minimale overlast."],
            ["04", "Oplevering", "Zorgvuldige oplevering en eindcontrole. Factuur ontvangt u digitaal via het portaal."],
          ].map(([n, t, d], i) => (
            <div key={n as string} style={{ padding: mobile ? "28px 0" : "40px 30px 40px 0", borderLeft: !mobile && i > 0 ? `1px solid ${C.bdr}` : "none", borderTop: mobile && i > 0 ? `1px solid ${C.bdr}` : "none", paddingLeft: !mobile && i > 0 ? 30 : 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "3.8rem", color: "rgba(198,165,107,.08)", fontWeight: 300, lineHeight: 1, marginBottom: 18 }}>{n as string}</div>
              <h4 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.25rem", fontWeight: 400, marginBottom: 10 }}>{t as string}</h4>
              <p style={{ fontSize: "0.73rem", color: C.muted, lineHeight: 1.9 }}>{d as string}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" style={{ padding: mobile ? "70px 5%" : "120px 7%", background: C.deep }}>
        <LLabel>Referenties</LLabel>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "2.6rem" : "4.5rem", fontWeight: 300, lineHeight: 1, letterSpacing: -1, marginBottom: 60 }}>
          Wat klanten<br /><em style={{ fontStyle: "italic", color: C.goldL }}>zeggen</em>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: 1, background: C.bdr }}>
          {[["Uitzonderlijk vakmanschap. De visgraatvloer overstijgt al onze verwachtingen — een echte blikvanger.", "Familie de Vries", "Visgraat parket · Amsterdam"],
            ["Van adviesgesprek tot oplevering: perfect georganiseerd. Het portaal maakte het bijzonder prettig om de voortgang te volgen.", "T. van Berkel", "PVC vloer · Rotterdam"],
            ["Showroom aan huis was een geweldige ervaring. Ze dachten mee over elk detail. Het resultaat is prachtig.", "M. Pietersen", "Massief parket · Den Haag"],
          ].map(([q, n, p]) => (
            <div key={n as string} style={{ background: C.deep, padding: "40px 34px", transition: "background .3s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(198,165,107,.03)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = C.deep; }}>
              <div style={{ color: C.gold, fontSize: "0.78rem", letterSpacing: 3, marginBottom: 16 }}>★★★★★</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.8rem", color: C.gold, lineHeight: .7, marginBottom: 18, opacity: .3 }}>&ldquo;</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", fontWeight: 300, fontStyle: "italic", color: "rgba(248,245,239,.82)", lineHeight: 1.8, marginBottom: 24 }}>{q as string}</p>
              <div style={{ fontSize: "0.66rem", letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 3 }}>{n as string}</div>
              <div style={{ fontSize: "0.62rem", color: C.muted }}>{p as string}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GALERIJ */}
      <GallerySection />

      {/* FAQ */}
      <section id="faq" style={{ padding: mobile ? "70px 5%" : "120px 7%", background: C.bg }}>
        <LLabel>Veelgestelde Vragen</LLabel>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "2.6rem" : "4.5rem", fontWeight: 300, lineHeight: 1, letterSpacing: -1, marginBottom: 60 }}>FAQ</h2>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 32 : 80, alignItems: "start" }}>
          <div>
            <p style={{ fontSize: "0.8rem", color: C.muted, lineHeight: 2 }}>Heeft u een vraag die hier niet tussen staat? Neem direct contact op — wij helpen u graag.</p>
            <button onClick={() => scrollTo("contact")} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 30px", background: "transparent", color: C.white, fontSize: "0.64rem", letterSpacing: 3, textTransform: "uppercase", border: `1px solid ${C.bdr}`, cursor: "pointer", marginTop: 24, borderRadius: 2 }}>Contact opnemen</button>
          </div>
          <div>
            {faqItems.map(([q, a], i) => (
              <div key={i} style={{ borderBottom: `1px solid ${C.bdr}` }}>
                <button onClick={() => setFaq(faq === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0", cursor: "pointer", gap: 18, background: "none", border: "none", width: "100%", textAlign: "left", color: faq === i ? C.gold : C.white, transition: "color .3s" }}>
                  <span style={{ fontSize: "0.83rem", lineHeight: 1.5 }}>{q}</span>
                  <span style={{ fontSize: "1.3rem", color: C.gold, flexShrink: 0, fontFamily: "'Cormorant Garamond',serif", transform: faq === i ? "rotate(45deg)" : "none", transition: "transform .4s" }}>+</span>
                </button>
                <div style={{ maxHeight: faq === i ? 220 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(.4,0,.2,1)" }}>
                  <p style={{ fontSize: "0.77rem", color: C.muted, lineHeight: 1.9, paddingBottom: 20 }}>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: mobile ? "70px 5%" : "120px 7%", background: C.deep }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 40 : 90, alignItems: "start" }}>
          <div>
            <LLabel>Contact</LLabel>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "2.6rem" : "3.8rem", fontWeight: 300, lineHeight: 1, letterSpacing: -1, marginBottom: 18 }}>Neem <em style={{ fontStyle: "italic", color: C.goldL }}>Contact</em><br />Op</h2>
            <p style={{ fontSize: "0.79rem", color: C.muted, lineHeight: 2, marginBottom: 40 }}>Heeft u een vraag of wilt u direct een afspraak? Wij reageren binnen 24 uur.</p>
            {[["Telefoon", "06 2827 3570"], ["E-mail", "Aureamaisonfloors@gmail.com"], ["Werkgebied", "Heel Nederland"], ["Openingstijden", "Ma–Vr 08:00–18:00 · Za 09:00–15:00"]].map(([l, v]) => (
              <div key={l as string} style={{ padding: "18px 0", borderBottom: `1px solid ${C.bdr}` }}>
                <div style={{ fontSize: "0.56rem", letterSpacing: 3, textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{l as string}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.25rem", fontWeight: 300 }}>{v as string}</div>
              </div>
            ))}
            <p style={{ fontSize: "0.6rem", color: C.dim, marginTop: 20 }}>KVK 42032896 · Aurea Maison Floors</p>
          </div>
          <div>
            {contactSent ? (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>✓</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", fontWeight: 300, color: C.goldL }}>Bericht ontvangen</h3>
                <p style={{ fontSize: "0.74rem", color: C.muted, marginTop: 10 }}>Wij nemen binnen 24 uur contact op.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setContactSent(true); }}>
                {[["Naam", "text", "Uw naam", true], ["E-mailadres", "email", "uw@email.nl", true], ["Telefoonnummer", "tel", "06 xxxxxxxx", false]].map(([l, t, p, r]) => (
                  <div key={l as string} style={{ borderBottom: `1px solid ${C.bdr}` }}>
                    <label style={{ display: "block", fontSize: "0.56rem", letterSpacing: 3, textTransform: "uppercase", color: C.gold, padding: "16px 0 5px" }}>{l as string}</label>
                    <input type={t as string} placeholder={p as string} required={r as boolean} style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: C.white, fontFamily: "'Cormorant Garamond',serif", fontSize: "1.15rem", fontWeight: 300, padding: "0 0 14px" }} />
                  </div>
                ))}
                <div style={{ borderBottom: `1px solid ${C.bdr}` }}>
                  <label style={{ display: "block", fontSize: "0.56rem", letterSpacing: 3, textTransform: "uppercase", color: C.gold, padding: "16px 0 5px" }}>Bericht</label>
                  <textarea placeholder="Uw vraag of wens…" required style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: C.white, fontFamily: "'Cormorant Garamond',serif", fontSize: "1.15rem", fontWeight: 300, padding: "0 0 14px", minHeight: 90, resize: "none", lineHeight: 1.6 }} />
                </div>
                <button type="submit" style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 36px", background: C.gold, color: C.bg, fontSize: "0.64rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", border: "none", cursor: "pointer", borderRadius: 2 }}>
                  Verstuur bericht →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.deep, padding: mobile ? "50px 5% 30px" : "70px 7% 40px", borderTop: `1px solid ${C.bdr}` }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "2fr 1fr 1fr 1fr", gap: mobile ? 28 : 48, paddingBottom: 40, borderBottom: `1px solid ${C.bdr}`, marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 500, letterSpacing: 5, color: C.gold }}>AUREA MAISON</div>
            <div style={{ fontSize: "0.54rem", letterSpacing: 3, color: "rgba(198,165,107,.4)", textTransform: "uppercase", marginTop: 4, marginBottom: 14 }}>Floors &amp; Interiors</div>
            <p style={{ fontSize: "0.72rem", color: C.muted, lineHeight: 1.9, maxWidth: 240 }}>Premium vloerlegger gespecialiseerd in PVC, parket, visgraat en traprenovaties.</p>
          </div>
          {[["Diensten", ["PVC Vloeren", "Visgraat", "Massief Parket", "Traprenovatie", "Egaliseren"], () => scrollTo("diensten")],
            ["Portaal", ["Opdracht opgeven", "Mijn opdrachten", "Mijn facturen", "Account aanmaken"], goPortal],
            ["Leggers", ["Aanmelden als legger", "Legger dashboard", "Beschikbare klussen"], goLegger],
            ["Contact", ["06 2827 3570", "E-mail sturen", "Showroom aan Huis", "FAQ"], null],
          ].map(([title, items, action]) => (
            <div key={title as string}>
              <h5 style={{ fontSize: "0.54rem", letterSpacing: 3, textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>{title as string}</h5>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                {(items as string[]).map((item: string) => (
                  <li key={item}>
                    <button
                      onClick={item === "Showroom aan Huis" ? () => setShowroomOpen(true) : item === "06 2827 3570" ? () => window.location.href = "tel:0628273570" : item === "E-mail sturen" ? () => window.location.href = "mailto:Aureamaisonfloors@gmail.com" : (action as (() => void) | null) || undefined}
                      style={{ fontSize: "0.72rem", color: item === "Showroom aan Huis" ? C.gold : C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: "0.6rem", color: C.dim }}>© 2025 Aurea Maison Floors · KVK 42032896</p>
          <p style={{ fontSize: "0.6rem", color: C.dim }}>Alle rechten voorbehouden</p>
        </div>
      </footer>

      {/* FLOATING PORTAL BTN (desktop) */}
      {!mobile && (
        <button onClick={goPortal} style={{ position: "fixed", bottom: 28, left: 28, zIndex: 8990, display: "flex", alignItems: "center", gap: 0, boxShadow: "0 6px 22px rgba(60,184,122,.22)", border: "none", cursor: "pointer", background: "transparent" }}>
          <div style={{ width: 50, height: 50, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, borderRadius: "4px 0 0 4px" }}>📋</div>
          <div style={{ background: "rgba(8,8,5,.96)", border: `1px solid ${C.greenBdr}`, borderLeft: "none", padding: "0 14px", height: 50, display: "flex", flexDirection: "column", justifyContent: "center", whiteSpace: "nowrap", borderRadius: "0 4px 4px 0" }}>
            <strong style={{ fontSize: "0.58rem", letterSpacing: 1.5, textTransform: "uppercase", color: C.green, fontWeight: 700, display: "block" }}>Opdracht opgeven</strong>
            <span style={{ fontSize: "0.52rem", color: C.muted, display: "block", marginTop: 2 }}>Opdrachtgeversportaal</span>
          </div>
        </button>
      )}

      {/* WHATSAPP (desktop) */}
      {!mobile && (
        <a href="https://wa.me/31628273570" target="_blank" rel="noopener" style={{ position: "fixed", bottom: 28, right: 28, zIndex: 8999, width: 50, height: 50, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(37,211,102,.38)", textDecoration: "none" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
      )}

      {/* MOBILE STICKY BAR */}
      {mobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 8999, background: "rgba(5,5,5,.98)", backdropFilter: "blur(20px)", borderTop: `1px solid ${C.bdr}`, padding: "10px 10px 14px", display: "flex", gap: 6 }}>
          <a href="tel:0628273570" style={{ flex: 1, padding: "11px 4px", background: C.gold, color: C.bg, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 6 }}>📞 Bellen</a>
          <button onClick={() => setShowroomOpen(true)} style={{ flex: 1, padding: "11px 4px", background: "rgba(198,165,107,.08)", border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 6 }}>🏠 Showroom</button>
          <button onClick={goPortal} style={{ flex: 1, padding: "11px 4px", background: C.greenDim, border: `1px solid ${C.greenBdr}`, color: C.green, fontSize: "0.55rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 6 }}>📋 Opdracht</button>
          <a href="https://wa.me/31628273570" target="_blank" rel="noopener" style={{ width: 44, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0, borderRadius: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>
      )}

      {/* QUOTE MODAL */}
      {quoteOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9500, background: C.bg, overflowY: "auto", animation: "fadeIn .3s ease" }}>
          <button onClick={() => { setQuoteOpen(false); }} style={{ position: "fixed", top: 20, right: 24, zIndex: 9600, fontFamily: "'Cormorant Garamond',serif", fontSize: "2.2rem", color: C.muted, cursor: "pointer", background: "none", border: "none", lineHeight: 1 }}>×</button>
          <QuoteForm onClose={() => { setQuoteOpen(false); }} />
        </div>
      )}

      {/* SHOWROOM MODAL */}
      {showroomOpen && (
        <ShowroomModal onClose={() => setShowroomOpen(false)} />
      )}
    </div>
  );
}
