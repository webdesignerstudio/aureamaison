"use client";

import { useState, useEffect, useRef } from "react";
import { C } from "@/lib/landing/colors";
import { useMobile } from "@/hooks/use-mobile";
import { LLabel } from "./llabel";

/* ─── DATA ────────────────────────────────────────────────────── */
const DIENSTEN_DATA = [
  { num: "01", title: "Visgraat", img: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221276/IMG_0277_md6tii.jpg", tag: "✦ Architectonisch · Tijdloos", desc: "Het visgraatpatroon is een architectonisch statement dat elke ruimte direct karakter geeft. Onze ambachtelijke leggers plaatsen elk plankje met millimeterprecisie voor een resultaat dat generaties meegaat.", short: "Architectonisch visgraatpatroon met tijdloze allure. Ambachtelijk gelegd.", features: ["Ambachtelijk handgelegd met millimeterprecisie", "Beschikbaar in parket, laminaat en PVC", "45° en 90° patroonomstelling mogelijk", "Inclusief passende plinten en afwerklijsten", "Advies op maat voor uw interieur"] },
  { num: "02", title: "Hongaars Punt", img: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221276/IMG_0278_s5wnip.jpg", tag: "✦ Geometrisch · Exclusief", desc: "Het Hongaars puntpatroon — ook wel 'double herringbone' — geeft een ruimte een dynamisch en geometrisch karakter dat direct opvalt. Een verfijnde keuze voor wie wil opvallen met stijl.", short: "Een verfijnd puntlegpatroon met een dynamisch, geometrisch karakter.", features: ["Verfijnd puntpatroon met V-vorming", "Beschikbaar in massief hout en laminaat", "Uniek resultaat in elke ruimte", "Gecombineerd met vloerverwarming mogelijk", "Persoonlijk adviesgesprek inbegrepen"] },
  { num: "03", title: "Massief Parket", img: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221278/IMG_0282_qxoyw6.jpg", tag: "✦ Naturel · Luxe · Duurzaam", desc: "Massief parket is de ultieme vloerkeuze voor een warm, authentiek interieur. Elke plank vertelt een verhaal van natuurlijke schoonheid — en kan decennialang worden opgeschuurd en vernieuwd.", short: "Warme, naturelle uitstraling voor premium interieurs. Levenslang meegaand.", features: ["Echt massief hout — levenslang meegaand", "Keuze uit eiken, walnoot, essen en meer", "Kan meerdere malen worden opgeschuurd", "Diverse afwerkingen: olie, lak, naturel", "Exclusieve breedte- en lengtematen beschikbaar"] },
  { num: "04", title: "PVC Vloeren", img: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221279/IMG_0281_muwa9p.jpg", tag: "✦ Waterbestendig · Onderhoudsvriendelijk", desc: "Onze premium PVC vloeren combineren esthetische schoonheid met praktische duurzaamheid. Waterbestendig, sterk en in talloze decors beschikbaar — ideaal voor élke ruimte inclusief badkamers en keukens.", short: "Duurzame premium PVC vloeren, waterbestendig en eenvoudig onderhoud.", features: ["100% waterbestendig — perfect voor natte ruimtes", "Zachte onderlaag voor comfort en isolatie", "Geschikt voor vloerverwarming", "Snel legbaar met click-systeem", "Verkrijgbaar in hout-, steen- en betonlooks"] },
  { num: "05", title: "Laminaat", img: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221278/IMG_0286_nb3mus.jpg", tag: "✦ Betaalbaar · Sterk · Stijlvol", desc: "Kwalitatief hoogwaardig laminaat dat er uitziet als echt hout, maar bestand is tegen dagelijks gebruik. Ideaal voor drukke huishoudens die niet willen inleveren op uitstraling.", short: "Betaalbaar en stijlvol — sterk laminaat in diverse decors voor elke ruimte.", features: ["Krasvast en slijtvast oppervlak", "Brede keuze in decors en plankbreedtes", "Eenvoudig te reinigen en te onderhouden", "Snelle installatie met weinig overlast", "Geschikt voor vloerverwarming (tot 29°C)"] },
  { num: "06", title: "Vloerverwarming", img: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221279/IMG_0283_n6l13n.jpg", tag: "✦ Comfort · Energiezuinig", desc: "Vloerverwarming gecombineerd met uw nieuwe vloer: wij adviseren, installeren en stemmen alles op elkaar af voor maximaal wooncomfort en energiezuinigheid — zonder zichtbare radiatoren.", short: "Gecombineerde installatie van vloer en verwarming voor maximaal comfort.", features: ["Advies over geschikte vloer + verwarmingscombinatie", "Elektrisch en water-gevoed systeem mogelijk", "Inclusief thermostaat en vloersensor", "Geschikt onder PVC, laminaat en parket", "Energiezuinig alternatief voor radiatoren"] },
  { num: "07", title: "Traprenovatie", img: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221279/IMG_0271_jbpfyq.jpg", tag: "✦ Compleet · Geïntegreerd", desc: "Een nieuwe vloer verdient een bijpassende trap. Onze traprenovaties worden naadloos geïntegreerd met uw nieuwe vloer voor een compleet en coherent interieur — van begane grond tot bovenverdieping.", short: "Complete traprenovatie geïntegreerd met uw nieuwe vloer.", features: ["Volledige vernieuwing van treden en stootborden", "Passend bij uw gekozen vloermateriaal", "Leuning- en balusteropties beschikbaar", "Anti-slip afwerking optioneel", "Snelle uitvoering met minimale overlast"] },
  { num: "08", title: "Egaliseren", img: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221278/IMG_0279_z51tgy.jpg", tag: "✦ Voorbereiding · Precisie", desc: "Een perfecte vloer begint bij een perfecte ondergrond. Onze egalisatieservice zorgt voor een volledig vlakke basis — onmisbaar voor hoogwaardige vloerinstallaties die er over 20 jaar nog even mooi uitzien.", short: "De perfecte basis voor hoogwaardige vloerinstallaties.", features: ["Professionele vlakheidscontrole met meetlat", "Zelf-nivellerend egaline op waterbasis", "Geschikt voor alle vloersoorten erboven", "Droogtijd van slechts 24–48 uur", "Inclusief primer en vloeropbouwadvies"] },
  { num: "09", title: "Showroom aan Huis", img: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221279/IMG_0272_djuf9p.jpg", tag: "✦ Gratis · Vrijblijvend", desc: "U hoeft niet naar ons toe te komen — wij komen naar u. Met onze unieke showroom aan huis brengen wij een ruime collectie stalen en samples rechtstreeks bij u, zodat u kunt kiezen in uw eigen interieur en licht.", short: "Wij brengen onze collectie bij u thuis — gratis en vrijblijvend.", features: ["Volledig gratis en geheel vrijblijvend", "Ruime collectie stalen en materialen", "Persoonlijk vloeradvies ter plaatse", "Directe offerteberekening mogelijk", "Beschikbaar door heel Nederland"] },
];

/* ─── STYLES (injected once) ─────────────────────────────────── */
function injectStyles() {
  const id = "amf-svc-styles-injected";
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    .amf-svc-track-wrap { overflow: hidden; }
    .amf-svc-track { display: flex; gap: 14px; overflow-x: scroll; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; scroll-padding-left: 10%; padding-left: 10%; padding-right: 10%; touch-action: pan-x; }
    .amf-svc-track::-webkit-scrollbar { display: none; }
    .amf-svc-track:active { cursor: grabbing; }
    .amf-svc-card { flex: 0 0 80%; max-width: 340px; scroll-snap-align: start; position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 3/4; cursor: pointer; flex-shrink: 0; user-select: none; transition: transform .35s cubic-bezier(.25,.1,.25,1), box-shadow .35s; }
    .amf-svc-card:hover { transform: scale(1.025); box-shadow: 0 24px 64px rgba(0,0,0,.65); }
    .amf-svc-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; transition: transform .6s ease, filter .4s; filter: brightness(.5) saturate(.65); }
    .amf-svc-card:hover img { transform: scale(1.07); filter: brightness(.4) saturate(.6); }
    .amf-svc-overlay { position: absolute; inset: 0; background: linear-gradient(to top,rgba(5,5,5,.96) 0%,rgba(5,5,5,.5) 50%,rgba(5,5,5,.08) 100%); }
    .amf-svc-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 24px 20px; }
    .amf-svc-num { font-family: 'Cormorant Garamond',serif; font-size: 2.8rem; color: rgba(198,165,107,.12); font-weight: 300; line-height: 1; margin-bottom: 6px; transition: color .3s; }
    .amf-svc-card:hover .amf-svc-num { color: rgba(198,165,107,.3); }
    .amf-svc-title { font-family: 'Cormorant Garamond',serif; font-size: 1.45rem; font-weight: 400; color: #F8F5EF; margin-bottom: 9px; line-height: 1.2; }
    .amf-svc-desc { font-size: .7rem; color: rgba(248,245,239,.5); line-height: 1.8; margin-bottom: 16px; }
    .amf-svc-cta { display: inline-flex; align-items: center; gap: 8px; font-size: .57rem; letter-spacing: 2.5px; text-transform: uppercase; color: #C6A56B; font-weight: 600; transition: gap .25s; }
    .amf-svc-card:hover .amf-svc-cta { gap: 14px; }
    .amf-svc-cta-line { width: 22px; height: 1px; background: #C6A56B; transition: width .3s; }
    .amf-svc-card:hover .amf-svc-cta-line { width: 34px; }
    .amf-svc-dots { display: flex; justify-content: center; gap: 7px; margin-top: 28px; }
    .amf-svc-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(198,165,107,.18); border: 1px solid rgba(198,165,107,.28); cursor: pointer; transition: all .3s; flex-shrink: 0; }
    .amf-svc-dot.active { background: #C6A56B; width: 22px; border-radius: 3px; }
    .amf-svc-arrows { display: flex; justify-content: flex-end; gap: 10px; padding: 0 6%; margin-bottom: 20px; }
    .amf-svc-arrow { width: 44px; height: 44px; border-radius: 50%; background: rgba(198,165,107,.08); border: 1px solid rgba(198,165,107,.18); color: #C6A56B; font-size: 1.3rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .25s; line-height: 1; }
    .amf-svc-arrow:hover { background: rgba(198,165,107,.18); border-color: rgba(198,165,107,.55); }
    .amf-det-overlay { position: fixed; inset: 0; z-index: 2500; display: flex; align-items: stretch; opacity: 0; pointer-events: none; transition: opacity .4s ease; }
    .amf-det-overlay.open { opacity: 1; pointer-events: all; }
    .amf-det-backdrop { position: absolute; inset: 0; background: rgba(5,5,5,.9); backdrop-filter: blur(12px); }
    .amf-det-panel { position: relative; width: 100%; max-width: 500px; margin-left: auto; background: #0a0a08; border-left: 1px solid rgba(198,165,107,.18); display: flex; flex-direction: column; transform: translateX(100%); transition: transform .45s cubic-bezier(.25,.1,.25,1); overflow-y: auto; }
    .amf-det-overlay.open .amf-det-panel { transform: translateX(0); }
    .amf-det-hero { position: relative; height: 300px; overflow: hidden; flex-shrink: 0; }
    .amf-det-hero img { width: 100%; height: 100%; object-fit: cover; filter: brightness(.48) saturate(.6); }
    .amf-det-hero-grad { position: absolute; inset: 0; background: linear-gradient(to top,#0a0a08 0%,transparent 65%); }
    .amf-det-hero-content { position: absolute; bottom: 22px; left: 26px; right: 26px; }
    .amf-det-num { font-family: 'Cormorant Garamond',serif; font-size: 4.5rem; color: rgba(198,165,107,.1); font-weight: 300; line-height: 1; margin-bottom: -8px; }
    .amf-det-title { font-family: 'Cormorant Garamond',serif; font-size: 2rem; font-weight: 400; color: #F8F5EF; line-height: 1.15; }
    .amf-det-close { position: absolute; top: 16px; right: 16px; width: 38px; height: 38px; border-radius: 50%; background: rgba(5,5,5,.65); border: 1px solid rgba(198,165,107,.18); color: #F8F5EF; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all .2s; }
    .amf-det-close:hover { background: rgba(198,165,107,.15); color: #C6A56B; }
    .amf-det-body { padding: 28px 26px; flex: 1; }
    .amf-det-tag { display: inline-flex; align-items: center; gap: 6px; font-size: .57rem; letter-spacing: 2.5px; text-transform: uppercase; color: #C6A56B; background: rgba(198,165,107,.07); border: 1px solid rgba(198,165,107,.2); border-radius: 99px; padding: 5px 14px; margin-bottom: 20px; }
    .amf-det-desc { font-size: .83rem; color: rgba(248,245,239,.5); line-height: 1.95; margin-bottom: 26px; }
    .amf-det-features { border-top: 1px solid rgba(198,165,107,.18); padding-top: 22px; margin-bottom: 28px; }
    .amf-det-feat-title { font-size: .55rem; letter-spacing: 3px; text-transform: uppercase; color: #C6A56B; margin-bottom: 14px; }
    .amf-det-feat-item { display: flex; align-items: flex-start; gap: 11px; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .75rem; color: #F8F5EF; line-height: 1.55; }
    .amf-det-feat-dot { width: 5px; height: 5px; border-radius: 50%; background: #C6A56B; flex-shrink: 0; margin-top: 6px; }
    .amf-det-cta { display: flex; gap: 10px; flex-direction: column; }
    .amf-det-btn-gold { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 22px; background: #C6A56B; color: #050505; font-size: .63rem; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; border: none; border-radius: 4px; cursor: pointer; transition: background .25s; font-family: 'Jost',sans-serif; }
    .amf-det-btn-gold:hover { background: #E2C895; }
    .amf-det-btn-outline { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 13px 22px; background: transparent; color: #F8F5EF; font-size: .63rem; letter-spacing: 2.5px; text-transform: uppercase; border: 1px solid rgba(198,165,107,.18); border-radius: 4px; cursor: pointer; transition: border-color .25s,color .25s; font-family: 'Jost',sans-serif; }
    .amf-det-btn-outline:hover { border-color: rgba(198,165,107,.55); color: #C6A56B; }
    @media(max-width:768px){ .amf-svc-track { padding-left: 8%; padding-right: 8%; scroll-padding-left: 8%; } .amf-svc-card { flex: 0 0 84%; max-width: none; } }
  `;
  document.head.appendChild(s);
}

/* ─── DIENST DETAIL (simplified — visual only) ───────────────── */
function DienstDetail({ det, onClose, onOfferte }: { det: typeof DIENSTEN_DATA[0]; onClose: () => void; onOfferte: () => void }) {
  return (
    <div className="amf-det-panel">
      <button className="amf-det-close" onClick={onClose}>✕</button>
      <div className="amf-det-hero">
        <img src={det.img} alt={det.title} />
        <div className="amf-det-hero-grad" />
        <div className="amf-det-hero-content">
          <div className="amf-det-num">{det.num}</div>
          <h2 className="amf-det-title">{det.title}</h2>
        </div>
      </div>
      <div className="amf-det-body">
        <div className="amf-det-tag">{det.tag}</div>
        <p className="amf-det-desc">{det.desc}</p>
        <div className="amf-det-features">
          <div className="amf-det-feat-title">Wat wij bieden</div>
          {det.features.map((f, i) => (
            <div key={i} className="amf-det-feat-item">
              <div className="amf-det-feat-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="amf-det-cta">
          <button className="amf-det-btn-gold" onClick={onOfferte}>📋 Offerte aanvragen →</button>
          <button className="amf-det-btn-outline" onClick={onClose}>← Terug naar diensten</button>
        </div>
      </div>
    </div>
  );
}

/* ─── DIENSTEN CAROUSEL ──────────────────────────────────────── */
export function DienstenCarousel({ goOfferte }: { goOfferte: () => void }) {
  const mobile = useMobile();
  const [activeIdx, setActiveIdx] = useState(0);
  const [detail, setDetail] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const trackEl = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, scrollStart: 0, moved: false });

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => { document.body.style.overflow = detail !== null ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [detail]);

  function scrollToIdx(i: number) {
    const el = trackEl.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".amf-svc-card");
    if (!card) return;
    const cardW = card.offsetWidth + 14;
    el.scrollTo({ left: i * cardW, behavior: "smooth" });
    setActiveIdx(i);
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const card = el.querySelector<HTMLElement>(".amf-svc-card");
    if (!card) return;
    const cardW = card.offsetWidth + 14;
    const idx = Math.round(el.scrollLeft / cardW);
    setActiveIdx(Math.max(0, Math.min(DIENSTEN_DATA.length - 1, idx)));
  }

  function onMouseDown(e: React.MouseEvent) {
    drag.current = { active: true, startX: e.pageX, scrollStart: trackEl.current?.scrollLeft || 0, moved: false };
    if (trackEl.current) trackEl.current.style.userSelect = "none";
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!drag.current.active) return;
    const dx = Math.abs(e.pageX - drag.current.startX);
    if (dx > 5) drag.current.moved = true;
    if (drag.current.moved && trackEl.current) {
      trackEl.current.scrollLeft = drag.current.scrollStart - (e.pageX - drag.current.startX);
    }
  }
  function onMouseUp() {
    drag.current.active = false;
    if (trackEl.current) trackEl.current.style.userSelect = "";
  }

  function onCardClick(i: number) {
    if (drag.current.moved) return;
    setSelected(i);
    setDetail(i);
    document.getElementById("diensten")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const det = detail !== null ? DIENSTEN_DATA[detail] : null;

  return (
    <>
      <section id="diensten" style={{ padding: mobile ? "70px 0 55px" : "100px 0 80px", background: C.deep, overflow: "hidden" }}>
        <div style={{ padding: mobile ? "0 5%" : "0 6%", marginBottom: mobile ? 32 : 48 }}>
          <LLabel>Onze Diensten</LLabel>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "2.6rem" : "4.5rem", fontWeight: 300, lineHeight: 1, letterSpacing: -1, marginBottom: 16 }}>
            Premium<br /><em style={{ fontStyle: "italic", color: C.goldL }}>Services</em>
          </h2>
          <p style={{ fontSize: "0.8rem", color: C.muted, lineHeight: 2, maxWidth: 500 }}>
            Van architectonische visgraatpatronen tot complete high-end renovaties. Elk project begeleiden wij persoonlijk van eerste adviesgesprek tot finale oplevering.
          </p>
        </div>
        <div className="amf-svc-arrows" style={{ padding: mobile ? "0 5%" : "0 6%" }}>
          <button className="amf-svc-arrow" onClick={() => scrollToIdx(Math.max(0, activeIdx - 1))}>‹</button>
          <button className="amf-svc-arrow" onClick={() => scrollToIdx(Math.min(DIENSTEN_DATA.length - 1, activeIdx + 1))}>›</button>
        </div>
        <div className="amf-svc-track-wrap">
          <div className="amf-svc-track" ref={trackEl} onScroll={handleScroll} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
            {DIENSTEN_DATA.map((s, i) => (
              <div key={s.num} className="amf-svc-card" onClick={() => onCardClick(i)} style={{ outline: selected === i ? `2px solid ${C.gold}` : "2px solid transparent", outlineOffset: -2, transition: "outline-color .2s", cursor: "pointer" }}>
                <img src={s.img} alt={s.title} loading="lazy" />
                <div className="amf-svc-overlay" />
                <div className="amf-svc-content">
                  <div className="amf-svc-num">{s.num}</div>
                  <h3 className="amf-svc-title">{s.title}</h3>
                  <p className="amf-svc-desc">{s.short}</p>
                  <div className="amf-svc-cta">
                    <div className="amf-svc-cta-line" />
                    {selected === i ? "✓ Geselecteerd" : "Meer info"}
                  </div>
                </div>
                {selected === i && (
                  <div style={{ position: "absolute", top: 10, right: 10, background: C.gold, borderRadius: 99, padding: "2px 10px", fontSize: "0.44rem", color: "#050505", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", zIndex: 2 }}>Geselecteerd</div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="amf-svc-dots">
          {DIENSTEN_DATA.map((_, i) => (
            <div key={i} className={"amf-svc-dot" + (i === activeIdx ? " active" : "")} onClick={() => scrollToIdx(i)} />
          ))}
        </div>
      </section>
      <div className={"amf-det-overlay" + (detail !== null ? " open" : "")} onClick={(e) => { if (e.target === e.currentTarget) setDetail(null); }}>
        <div className="amf-det-backdrop" onClick={() => setDetail(null)} />
        {det && <DienstDetail det={det} onClose={() => setDetail(null)} onOfferte={() => { setDetail(null); goOfferte(); }} />}
      </div>
    </>
  );
}
