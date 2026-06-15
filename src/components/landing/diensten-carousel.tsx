// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { C } from "@/lib/landing/colors";
import { useMobile } from "@/hooks/use-mobile";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { LLabel } from "./llabel";
import { useProducten, simuleerEmail, toast, inp } from "@/lib/landing/utils";
import { DIENST_CALC, DIENST_REVIEWS, DIENST_FAQ, DIENST_PRODUCTS, DEFAULT_PRODUCTS, GALLERY_IMGS, COMPARE_DATA } from "@/lib/landing/data";

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

function ProdDetailView({ prod, dienstCalc, onBack, onKoop, onOfferte }) {
  const { isMobile } = useIsMobile();
  const [calcM2, setCalcM2] = useState(30);
  const [koopNaam, setKoopNaam] = useState("");
  const [koopEmail, setKoopEmail] = useState("");
  const [koopTel, setKoopTel] = useState("");
  const [koopM2, setKoopM2] = useState("");
  const [koopDone, setKoopDone] = useState(false);
  const [koopOpen, setKoopOpen] = useState(false);
  const containerRef = useRef(null);

  // Scroll direct naar boven zodra view opent — fix voor mobiel
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  const sd = dienstCalc || {};
  const matPrice = prod.price > 0 ? prod.price : (sd.matMin != null ? (sd.matMin + sd.matMax) / 2 : null);
  const legPrice = sd.legMin != null ? (sd.legMin + sd.legMax) / 2 : null;
  const fmtK = n => "€ " + Math.round(n).toLocaleString("nl-NL");
  const calcMat = matPrice != null ? fmtK(calcM2 * matPrice) : "—";
  const calcLeg = legPrice != null ? (sd.legMin === 0 ? "Gratis" : fmtK(calcM2 * legPrice)) : "—";
  const calcTot = matPrice != null && legPrice != null ? fmtK(calcM2 * (matPrice + legPrice)) : "—";

  return (
    <div ref={containerRef} style={{position:"fixed",inset:0,zIndex:3500,background:C.bg,display:"flex",flexDirection:"column",overflowY:"auto",animation:"slideUp .3s ease"}}>

      {/* HERO — direct bovenaan, geen header erboven */}
      <div style={{height:260,background:prod.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0,overflow:"hidden"}}>
        {prod.img
          ? <img src={prod.img} alt={prod.name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.6) saturate(.75)"}}/>
          : <div style={{position:"absolute",inset:0,background:prod.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"7rem",filter:"drop-shadow(0 8px 24px rgba(0,0,0,.5))"}}>{prod.emoji}</div>
        }
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(5,5,5,.85) 0%,transparent 55%)"}}/>
        {/* Terug knop over de hero */}
        <button onClick={onBack} style={{position:"absolute",top:16,left:16,background:"rgba(0,0,0,.45)",backdropFilter:"blur(8px)",border:`1px solid rgba(255,255,255,.15)`,color:C.white,cursor:"pointer",borderRadius:"50%",width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",zIndex:2}}>←</button>
        {/* Prijs badge rechts boven */}
        {prod.price > 0 && (
          <div style={{position:"absolute",top:16,right:16,background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)",border:`1px solid ${C.gold}`,borderRadius:8,padding:"6px 12px",zIndex:2,textAlign:"right"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",color:C.goldL,lineHeight:1}}>€ {prod.price.toFixed(2).replace(".",",")}</div>
            <div style={{fontSize:"0.4rem",color:C.dim,letterSpacing:1}}>/m²</div>
          </div>
        )}
        <div style={{position:"absolute",bottom:18,left:20,right:20,zIndex:2}}>
          <div style={{fontSize:"0.44rem",letterSpacing:3,color:"rgba(198,165,107,.8)",textTransform:"uppercase",marginBottom:4}}>{prod.label}</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.8rem",color:C.white,lineHeight:1.15}}>{prod.name}</div>
          <div style={{fontSize:"0.62rem",color:"rgba(248,245,239,.5)",marginTop:4}}>{prod.sub}</div>
        </div>
      </div>

      <div style={{padding:"20px 18px",maxWidth:640,margin:"0 auto",width:"100%"}}>

        {/* OMSCHRIJVING */}
        {prod.longDesc && (
          <p style={{fontSize:"0.76rem",color:C.muted,lineHeight:1.9,marginBottom:22}}>{prod.longDesc}</p>
        )}

        {/* SPECIFICATIES */}
        {prod.specs && prod.specs.length > 0 && (
          <div style={{marginBottom:22}}>
            <div style={{fontSize:"0.5rem",letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:12}}>Specificaties</div>
            <div style={{display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap:8}}>
              {prod.specs.map(([k,v],i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.035)",border:`1px solid ${C.bdr}`,borderRadius:9,padding:"10px 12px"}}>
                  <div style={{fontSize:"0.44rem",letterSpacing:2,color:C.dim,textTransform:"uppercase",marginBottom:3}}>{k}</div>
                  <div style={{fontSize:"0.72rem",color:C.white,fontWeight:500}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KENMERKEN */}
        {prod.features && prod.features.length > 0 && (
          <div style={{marginBottom:22,borderTop:`1px solid ${C.bdr}`,paddingTop:18}}>
            <div style={{fontSize:"0.5rem",letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:12}}>Kenmerken</div>
            {prod.features.map((f,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,paddingBottom:9}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.gold,flexShrink:0,marginTop:5}}/>
                <span style={{fontSize:"0.72rem",color:C.muted,lineHeight:1.65}}>{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── PRIJSCALCULATOR ── */}
        <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:20,marginBottom:22}}>
          <div style={{fontSize:"0.5rem",letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:14}}>Prijscalculator</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.62rem",color:C.muted,marginBottom:8}}>
            <span>Oppervlakte</span>
            <span style={{color:C.goldL,fontWeight:600}}>{calcM2} m²</span>
          </div>
          <input type="range" min={5} max={200} value={calcM2} onChange={e=>setCalcM2(Number(e.target.value))}
            style={{WebkitAppearance:"none",width:"100%",height:4,background:"rgba(198,165,107,.2)",borderRadius:99,outline:"none",cursor:"pointer",marginBottom:16}}/>
          <div style={{display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",gap:8}}>
            {[["Materiaal",calcMat],["Legkosten",calcLeg],["Totaal (est.)",calcTot]].map(([lbl,val])=>(
              <div key={lbl} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${C.bdr}`,borderRadius:10,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontSize:"0.44rem",letterSpacing:1.5,color:C.dim,textTransform:"uppercase",marginBottom:6}}>{lbl}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.1rem",color:C.goldL}}>{val}</div>
              </div>
            ))}
          </div>
          {prod.price > 0 && calcM2 > 0 && (
            <div style={{marginTop:10,padding:"8px 12px",background:"rgba(198,165,107,.05)",borderRadius:7,fontSize:"0.58rem",color:C.dim}}>
              {calcM2} m² × € {prod.price.toFixed(2)}/m² = <strong style={{color:C.goldL}}>€ {(calcM2*prod.price).toLocaleString("nl-NL",{minimumFractionDigits:2})}</strong> materiaal
            </div>
          )}
        </div>

        {/* ── ACTIE KNOPPEN ── */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
          <button onClick={()=>setKoopOpen(true)}
            style={{width:"100%",padding:"15px",background:C.gold,border:"none",color:"#050505",fontSize:"0.68rem",fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",cursor:"pointer",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            🛒 Bestellen / offerte aanvragen
          </button>
          <button onClick={onOfferte}
            style={{width:"100%",padding:"13px",background:"rgba(255,255,255,.04)",border:`1px solid ${C.bdr}`,color:C.muted,fontSize:"0.62rem",fontWeight:600,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:10}}>
            📋 Vrijblijvende offerte aanvragen
          </button>
          <button onClick={onBack}
            style={{width:"100%",padding:"11px",background:"transparent",border:`1px solid rgba(255,255,255,.08)`,color:C.dim,fontSize:"0.58rem",letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",borderRadius:10}}>
            ← Terug naar producten
          </button>
        </div>
      </div>

      {/* ── KOOP / BESTEL MODAL ── */}
      {koopOpen && (
        <div style={{position:"fixed",inset:0,zIndex:4000,background:"rgba(5,5,5,.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={e=>{if(e.target===e.currentTarget)setKoopOpen(false);}}>
          <div style={{background:C.deep,border:`1px solid ${C.bdr}`,borderTopLeftRadius:20,borderTopRightRadius:20,width:"100%",maxWidth:500,padding:"24px 20px 40px",animation:"slideUp .3s ease",maxHeight:"92vh",overflowY:"auto"}}>
            {!koopDone ? (
              <>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20}}>
                  <div style={{width:48,height:48,borderRadius:10,background:prod.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",flexShrink:0}}>{prod.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.46rem",letterSpacing:2,color:C.gold,textTransform:"uppercase"}}>{prod.label}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",color:C.white}}>{prod.name}</div>
                    {prod.price > 0 && <div style={{fontSize:"0.58rem",color:C.muted}}>€ {prod.price.toFixed(2).replace(".",",")} /m²</div>}
                  </div>
                  <button onClick={()=>setKoopOpen(false)} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>✕</button>
                </div>
                {[["Uw naam *",koopNaam,setKoopNaam,"Jan de Vries","text"],
                  ["E-mailadres *",koopEmail,setKoopEmail,"jan@email.nl","email"],
                  ["Telefoonnummer",koopTel,setKoopTel,"06 12 34 56 78","tel"],
                  ["Oppervlakte (m²)",koopM2,setKoopM2,String(calcM2),"number"],
                ].map(([l,v,s,p,t])=>(
                  <div key={l} style={{marginBottom:10}}>
                    <div style={{fontSize:"0.5rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                    <input type={t} value={v} onChange={e=>s(e.target.value)} placeholder={p} style={{...inp,fontSize:14,padding:"10px 14px"}}/>
                  </div>
                ))}
                {prod.price > 0 && koopM2 && Number(koopM2) > 0 && (
                  <div style={{padding:"10px 14px",background:"rgba(198,165,107,.07)",border:`1px solid ${C.bdr}`,borderRadius:8,marginBottom:14,display:"flex",justifyContent:"space-between",fontSize:"0.68rem"}}>
                    <span style={{color:C.muted}}>{koopM2} m² × € {prod.price.toFixed(2)}/m²</span>
                    <span style={{color:C.gold,fontWeight:700}}>€ {(Number(koopM2)*prod.price).toLocaleString("nl-NL",{minimumFractionDigits:2})}</span>
                  </div>
                )}
                <button onClick={async()=>{
                  if(!koopNaam.trim()||!koopEmail.trim()) return;
                  await sendEmail("info@aureamaisonfloors.nl",
                    `🛒 Bestelling — ${prod.name} — ${koopNaam}`,
                    `<p><strong>Nieuwe productbestelling</strong></p><p>Naam: ${koopNaam}<br>Email: ${koopEmail}<br>Tel: ${koopTel}<br>Product: ${prod.name}<br>Hoeveelheid: ${koopM2||calcM2}m²<br>Prijs: ${prod.price>0?`€ ${((Number(koopM2)||calcM2)*prod.price).toLocaleString("nl-NL",{minimumFractionDigits:2})}`:"Offerte gewenst"}</p>`);
                  setKoopDone(true);
                }} style={{width:"100%",padding:"13px",background:C.gold,border:"none",color:"#050505",fontSize:"0.65rem",fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:9}}>
                  Aanvraag versturen →
                </button>
                <p style={{fontSize:"0.58rem",color:C.dim,textAlign:"center",marginTop:8,lineHeight:1.6}}>Wij nemen binnen 24 uur contact op. Geen aanbetaling vereist.</p>
              </>
            ) : (
              <div style={{textAlign:"center",padding:"32px 0"}}>
                <div style={{fontSize:52,marginBottom:14}}>✓</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.6rem",color:C.white,marginBottom:10}}>Aanvraag ontvangen!</div>
                <p style={{fontSize:"0.7rem",color:C.muted,lineHeight:1.8,marginBottom:24}}>Bedankt{koopNaam?" "+koopNaam.split(" ")[0]:""}! Wij nemen binnen 24 uur contact op.</p>
                <button onClick={()=>{ setKoopOpen(false); onBack(); }} style={{padding:"11px 28px",background:"rgba(198,165,107,.12)",border:`1px solid ${C.gold}`,color:C.gold,cursor:"pointer",borderRadius:8,fontSize:"0.62rem",fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>← Terug</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function DienstDetail({ det, onClose, onOfferte, onShowroom, detailRef }) {
  const { isMobile } = useIsMobile();
  // ── Alle hooks bovenaan (Rules of Hooks) ──────────────────────
  const [calcM2, setCalcM2]         = useState(30);
  const [openFaq, setOpenFaq]       = useState(null);
  // Producten
  const [prodIdx, setProdIdx]       = useState(0);
  const [prodInfoOpen, setProdInfoOpen] = useState(false);
  const [prodInfoItem, setProdInfoItem] = useState(null);
  const [prodDetailOpen, setProdDetailOpen] = useState(false);
  const [prodDetailItem, setProdDetailItem] = useState(null);
  const [koopOpen, setKoopOpen]     = useState(false);
  const [koopProd, setKoopProd]     = useState(null);
  const [koopNaam, setKoopNaam]     = useState("");
  const [koopEmail, setKoopEmail]   = useState("");
  const [koopTel, setKoopTel]       = useState("");
  const [koopM2, setKoopM2]         = useState("");
  const [koopDone, setKoopDone]     = useState(false);
  // Terugbelverzoek
  const [tbOpen, setTbOpen]         = useState(false);
  const [tbNaam, setTbNaam]         = useState("");
  const [tbTel, setTbTel]           = useState("");
  const [tbTijd, setTbTijd]         = useState("");
  const [tbVraag, setTbVraag]       = useState("");
  const [tbDone, setTbDone]         = useState(false);
  // Showroom aan huis
  const [shOpen, setShOpen]         = useState(false);
  const [shNaam, setShNaam]         = useState("");
  const [shEmail, setShEmail]       = useState("");
  const [shTel, setShTel]           = useState("");
  const [shAdres, setShAdres]       = useState("");
  const [shDone, setShDone]         = useState(false);

  // ── Data ──────────────────────────────────────────────────────
  const sd    = DIENST_CALC[det.title]     || {};
  const revs  = DIENST_REVIEWS[det.title]  || DEFAULT_REVIEWS;
  const faqs  = DIENST_FAQ[det.title]      || DEFAULT_FAQ;
  // Laad live producten uit storage (eigenaar-beheerd), fallback naar DIENST_PRODUCTS
  const [liveProducten] = useProducten();
  const prods = (liveProducten && liveProducten[det.title]) ? liveProducten[det.title] : (DIENST_PRODUCTS[det.title] || DEFAULT_PRODUCTS);
  const fmtEurCalc = n => "€ " + n.toLocaleString("nl-NL");
  // Use selected product price when available, fallback to service range averages
  const selectedProd = prods[prodIdx];
  const selectedMatPrice = selectedProd && selectedProd.price > 0 ? selectedProd.price : null;
  const calcMatPrice = selectedMatPrice !== null ? selectedMatPrice
    : (sd.matMin != null ? (sd.matMin + sd.matMax) / 2 : null);
  const calcLegPrice = sd.legMin != null ? (sd.legMin + sd.legMax) / 2 : null;
  const calcMat = sd.matMin === 0 && !selectedMatPrice ? "Gratis"
    : (calcMatPrice != null ? fmtEurCalc(Math.round(calcM2 * calcMatPrice)) : "—");
  const calcLeg = sd.legMin === 0 ? "Gratis" : (calcLegPrice != null ? fmtEurCalc(Math.round(calcM2 * calcLegPrice)) : "—");
  const calcTot = (sd.matMin === 0 && !selectedMatPrice) ? "Gratis"
    : (calcMatPrice != null && calcLegPrice != null ? fmtEurCalc(Math.round(calcM2 * (calcMatPrice + calcLegPrice))) : "—");
  const compareKeys = [["prijs","Prijs"],["levensduur","Levensduur"],["onderhoud","Onderhoud"],["geluid","Geluid"],["water","Waterdicht"]];

  const openKoop = (p) => { setKoopProd(p); setKoopDone(false); setKoopNaam(""); setKoopEmail(""); setKoopTel(""); setKoopM2(""); setKoopOpen(true); };
  const openTb   = () => { setTbDone(false); setTbNaam(""); setTbTel(""); setTbTijd(""); setTbVraag(""); setTbOpen(true); };
  const openSh   = () => { setShDone(false); setShNaam(""); setShEmail(""); setShTel(""); setShAdres(""); setShOpen(true); };

  const delen = () => {
    const txt = `Aurea Maison Floors — ${det.title}`;
    if (navigator.share) { navigator.share({ title: txt, url: window.location.href }); }
    else { navigator.clipboard?.writeText(window.location.href); toast("Link gekopieerd ✓","success"); }
  };

  return (
    <div className="amf-det-panel" ref={detailRef}>
      <button className="amf-det-close" onClick={onClose}>✕</button>

      {/* HERO */}
      <div className="amf-det-hero">
        <img src={det.img} alt={det.title}/>
        <div className="amf-det-hero-grad"/>
        <div className="amf-det-hero-content">
          <div className="amf-det-num">{det.num}</div>
          <h2 className="amf-det-title">{det.title}</h2>
        </div>
      </div>

      <div className="amf-det-body">
        {/* TAG */}
        <div className="amf-det-tag">{det.tag}</div>

        {/* GARANTIE BADGE */}
        {sd.guarantee && (
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(60,184,122,.07)",border:"1px solid rgba(60,184,122,.25)",borderRadius:8,padding:"8px 14px",fontSize:"0.62rem",color:"#5ad4a2",marginBottom:20}}>
            <span>🛡</span> {sd.guarantee}
          </div>
        )}

        {/* BESCHRIJVING */}
        <p className="amf-det-desc">{det.desc}</p>

        {/* WAT WIJ BIEDEN */}
        <div className="amf-det-features">
          <div className="amf-det-feat-title">Wat wij bieden</div>
          {det.features.map((f,i) => (
            <div key={i} className="amf-det-feat-item">
              <div className="amf-det-feat-dot"/>
              <span>{f}</span>
            </div>
          ))}
        </div>

        {/* ══ ONZE PRODUCTEN ══ */}
        <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:22,marginBottom:24}}>
          <div style={{fontSize:"0.55rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,marginBottom:14}}>Onze producten</div>
          {/* Scrollbare kaarten */}
          <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:10,scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
            {prods.map((p,i)=>(
              <div key={i}
                style={{flexShrink:0,width:185,background:"rgba(255,255,255,.025)",border:`2px solid ${prodIdx===i?C.gold:C.bdr}`,borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"all .2s",position:"relative"}}
                onClick={()=>{ setProdIdx(i); setProdDetailItem(p); setProdDetailOpen(true); }}>
                {prodIdx===i && (
                  <div style={{position:"absolute",top:7,right:7,background:C.gold,borderRadius:99,padding:"2px 7px",fontSize:"0.42rem",color:"#0a0a08",fontWeight:700,letterSpacing:1,textTransform:"uppercase",zIndex:2}}>Geselecteerd</div>
                )}
                <div style={{height:88,background:p.bg,position:"relative",overflow:"hidden",flexShrink:0}}>
                  {p.img
                    ? <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.75) saturate(.8)"}}/>
                    : <div style={{width:"100%",height:"100%",background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>{p.emoji}</div>
                  }
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(5,5,5,.5) 0%,transparent 60%)"}}/>
                </div>
                <div style={{padding:"10px 12px"}}>
                  <div style={{fontSize:"0.46rem",letterSpacing:2,color:C.gold,textTransform:"uppercase",marginBottom:2}}>{p.label}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"0.9rem",color:C.white,marginBottom:3,lineHeight:1.3}}>{p.name}</div>
                  <div style={{fontSize:"0.54rem",color:C.muted,marginBottom:8,lineHeight:1.5}}>{p.sub}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:8}}>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.1rem",color:C.goldL}}>
                      {p.price>0 ? `€ ${p.price.toFixed(2).replace(".",",")}` : "Gratis"}
                    </span>
                    {p.price>0 && <span style={{fontSize:"0.48rem",color:C.dim}}>/ m²</span>}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={e=>{e.stopPropagation();setProdInfoItem(p);setProdInfoOpen(true);}}
                      style={{flex:1,padding:"6px 4px",background:"rgba(255,255,255,.05)",border:`1px solid ${C.bdr}`,color:C.muted,fontSize:"0.52rem",fontWeight:600,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",borderRadius:6}}>
                      ℹ Info
                    </button>
                    {prodIdx===i ? (
                      <button onClick={e=>{e.stopPropagation();setProdDetailItem(p);setProdDetailOpen(true);}}
                        style={{flex:1,padding:"6px 4px",background:"rgba(198,165,107,.25)",border:`1px solid ${C.gold}`,color:C.gold,fontSize:"0.52rem",fontWeight:700,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",borderRadius:6}}>
                        ✓ Gekozen
                      </button>
                    ) : (
                      <button onClick={e=>{e.stopPropagation();setProdIdx(i);setProdDetailItem(p);setProdDetailOpen(true);}}
                        style={{flex:1,padding:"6px 4px",background:"rgba(198,165,107,.12)",border:`1px solid ${C.bdr}`,color:C.gold,fontSize:"0.52rem",fontWeight:700,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",borderRadius:6}}>
                        Bekijken →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Dots indicator */}
          <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:8}}>
            {prods.map((_,i)=>(
              <div key={i} onClick={()=>setProdIdx(i)}
                style={{width:i===prodIdx?20:6,height:6,borderRadius:99,background:i===prodIdx?C.gold:"rgba(198,165,107,.2)",cursor:"pointer",transition:"all .3s"}}/>
            ))}
          </div>
          {/* Selected product indicator for calculator */}
          {selectedProd && selectedProd.price > 0 && (
            <div style={{marginTop:10,padding:"8px 12px",background:"rgba(198,165,107,.06)",border:`1px solid rgba(198,165,107,.2)`,borderRadius:8,fontSize:"0.56rem",color:C.muted,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:C.gold}}>✓</span>
              <span>Calculator gebaseerd op: <strong style={{color:C.goldL}}>{selectedProd.name}</strong> — € {selectedProd.price.toFixed(2).replace(".",",")} /m²</span>
            </div>
          )}
        </div>

        {/* ══ PRIJSCALCULATOR ══ */}
        <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:22,marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:"0.55rem",letterSpacing:3,textTransform:"uppercase",color:C.gold}}>Prijscalculator</div>
            {selectedProd && selectedProd.price>0 && (
              <div style={{fontSize:"0.5rem",color:C.muted,textAlign:"right"}}>
                <span style={{color:C.gold}}>{selectedProd.emoji}</span> {selectedProd.name}
              </div>
            )}
          </div>
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.6rem",color:C.muted,marginBottom:6}}>
              <span>Oppervlakte</span>
              <span style={{color:C.goldL,fontWeight:600}}>{calcM2} m²</span>
            </div>
            <input type="range" min={5} max={200} value={calcM2}
              onChange={e=>setCalcM2(Number(e.target.value))}
              style={{WebkitAppearance:"none",width:"100%",height:3,background:"rgba(198,165,107,.2)",borderRadius:99,outline:"none",cursor:"pointer"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",gap:7,marginTop:14}}>
            {[["Materiaal",calcMat],["Legkosten",calcLeg],["Totaal (est.)",calcTot]].map(([lbl,val])=>(
              <div key={lbl} style={{background:"rgba(255,255,255,.025)",border:`1px solid ${C.bdr}`,borderRadius:9,padding:10,textAlign:"center"}}>
                <div style={{fontSize:"0.46rem",letterSpacing:1.5,color:C.dim,textTransform:"uppercase",marginBottom:5}}>{lbl}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.1rem",color:C.goldL}}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ PROJECT GALERIJ — VOOR & NA ══ */}
        <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:22,marginBottom:24}}>
          <div style={{fontSize:"0.55rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,marginBottom:14}}>Project galerij — voor &amp; na</div>
          <div style={{display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap:8}}>
            {["Voor","Na","Detail","Sfeer"].map((lbl,i)=>(
              <div key={lbl} style={{borderRadius:8,overflow:"hidden",aspectRatio:"4/3",position:"relative",cursor:"pointer"}}>
                <img src={GALLERY_IMGS[i % GALLERY_IMGS.length]} alt={lbl}
                  style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.6) saturate(.7)",transition:"all .4s",display:"block"}}
                  onMouseEnter={e=>{e.currentTarget.style.filter="brightness(.45) saturate(.6)";e.currentTarget.style.transform="scale(1.05)";}}
                  onMouseLeave={e=>{e.currentTarget.style.filter="brightness(.6) saturate(.7)";e.currentTarget.style.transform="scale(1)";}}
                />
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"6px 8px",background:"linear-gradient(to top,rgba(5,5,5,.9),transparent)",fontSize:"0.48rem",letterSpacing:1.5,textTransform:"uppercase",color:C.gold}}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ KLANTREVIEWS ══ */}
        <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:22,marginBottom:24}}>
          <div style={{fontSize:"0.55rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,marginBottom:14}}>Klantreviews</div>
          {revs.map((r,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,.025)",border:`1px solid ${C.bdr}`,borderRadius:10,padding:14,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,rgba(198,165,107,.3),rgba(198,165,107,.1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",color:C.gold,fontWeight:600,flexShrink:0}}>
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div style={{fontSize:"0.72rem",color:C.white,fontWeight:500}}>{r.name}</div>
                  <div style={{fontSize:"0.52rem",color:C.dim}}>{r.date}</div>
                </div>
                <div style={{marginLeft:"auto",color:C.gold,fontSize:"0.65rem"}}>{"★".repeat(r.stars)}</div>
              </div>
              <div style={{fontSize:"0.68rem",color:C.muted,lineHeight:1.75}}>{r.text}</div>
            </div>
          ))}
        </div>

        {/* ══ VEELGESTELDE VRAGEN ══ */}
        <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:22,marginBottom:24}}>
          <div style={{fontSize:"0.55rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,marginBottom:14}}>Veelgestelde vragen</div>
          {faqs.map((f,i)=>(
            <div key={i} style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
              <div onClick={()=>setOpenFaq(openFaq===i?null:i)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",cursor:"pointer",fontSize:"0.75rem",color:openFaq===i?C.goldL:C.white,gap:12}}>
                <span>{f.q}</span>
                <span style={{flexShrink:0,fontSize:"0.7rem",color:C.gold,transition:"transform .25s",transform:openFaq===i?"rotate(45deg)":"none"}}>+</span>
              </div>
              {openFaq===i && (
                <div style={{fontSize:"0.7rem",color:C.muted,lineHeight:1.75,paddingBottom:12}}>{f.a}</div>
              )}
            </div>
          ))}
        </div>

        {/* ══ VERGELIJKINGSTOOL ══ */}
        {sd.compare && sd.compare.length===2 && (()=>{
          const [c1k,c2k] = sd.compare;
          const c1 = COMPARE_DATA[c1k]||{};
          const c2 = COMPARE_DATA[c2k]||{};
          return (
            <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:22,marginBottom:24}}>
              <div style={{fontSize:"0.55rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,marginBottom:14}}>Vergelijkingstool</div>
              <div style={{display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap:8}}>
                {[{label:c1k,data:c1},{label:c2k,data:c2}].map(({label,data})=>(
                  <div key={label} style={{background:"rgba(255,255,255,.025)",border:`1px solid ${C.bdr}`,borderRadius:10,padding:13}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",marginBottom:10,color:C.white}}>{label}</div>
                    {compareKeys.map(([k,l])=>(
                      <div key={k} style={{display:"flex",flexDirection:"column",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                        <span style={{fontSize:"0.47rem",letterSpacing:2,color:C.dim,textTransform:"uppercase"}}>{l}</span>
                        <span style={{fontSize:"0.68rem",color:C.muted,marginTop:2}}>{data[k]||"—"}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ══ UW AANVRAAG — HOE WERKT HET? ══ */}
        <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:22,marginBottom:24}}>
          <div style={{fontSize:"0.55rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,marginBottom:14}}>Uw aanvraag — hoe werkt het?</div>
          {[
            {num:"✓",state:"done",    label:"Offerte aanvragen",      sub:"Vul uw gegevens in via het formulier"},
            {num:"2",state:"current", label:"Opname ter plaatse",     sub:"Wij komen gratis opnemen binnen 2-3 werkdagen"},
            {num:"3",state:"",        label:"Offerte ontvangen",      sub:"Gedetailleerde offerte binnen 24 uur na opname"},
            {num:"4",state:"",        label:"Uitvoering & oplevering",sub:"Vakkundige leggers, nette oplevering"},
          ].map((s,i,arr)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:13,paddingBottom:16,position:"relative"}}>
              {i<arr.length-1 && <div style={{position:"absolute",left:11,top:24,bottom:0,width:1,background:C.bdr}}/>}
              <div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.55rem",
                background:s.state==="done"?"rgba(60,184,122,.15)":s.state==="current"?"rgba(198,165,107,.15)":"rgba(198,165,107,.08)",
                border:`1px solid ${s.state==="done"?"rgba(60,184,122,.4)":s.state==="current"?C.gold:C.bdr}`,
                color:s.state==="done"?"#5ad4a2":s.state==="current"?C.gold:C.dim}}>
                {s.num}
              </div>
              <div>
                <div style={{fontSize:"0.68rem",color:C.white,marginBottom:2}}>{s.label}</div>
                <div style={{fontSize:"0.58rem",color:C.dim}}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══ CTA KNOPPEN ══ */}
        <div style={{display:"flex",gap:10,flexDirection:"column",marginBottom:8}}>
          <button className="amf-det-btn-gold" onClick={onOfferte}>📋 Offerte aanvragen →</button>
          <button className="amf-det-btn-outline" onClick={onShowroom||openSh}>🏠 Showroom aan huis boeken</button>
          <button className="amf-det-btn-outline" onClick={delen}>↑ Delen via WhatsApp / link</button>
          <button className="amf-det-btn-outline" onClick={openTb}>📞 Terugbelverzoek</button>
          <button className="amf-det-btn-outline" onClick={onClose}>← Terug naar diensten</button>
        </div>
      </div>

      {/* ══ PRODUCT DETAIL VIEW ══ */}
      {prodDetailOpen && prodDetailItem && (
        <ProdDetailView
          prod={prodDetailItem}
          dienstCalc={sd}
          onBack={()=>setProdDetailOpen(false)}
          onOfferte={()=>{ setProdDetailOpen(false); onOfferte(); }}
          onKoop={()=>{}}
        />
      )}

      {/* ══ PRODUCT INFO MODAL ══ */}
      {prodInfoOpen && prodInfoItem && (
        <div style={{position:"fixed",inset:0,zIndex:9500,background:"rgba(5,5,5,.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={e=>{if(e.target===e.currentTarget){setProdInfoOpen(false);}}}>
          <div style={{background:C.deep,border:`1px solid ${C.bdr}`,borderTopLeftRadius:20,borderTopRightRadius:20,width:"100%",maxWidth:500,padding:"0 0 40px",animation:"slideUp .3s ease",maxHeight:"92vh",overflowY:"auto"}}>
            {/* Header met achtergrond */}
            <div style={{height:120,background:prodInfoItem.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0}}>
              <div style={{fontSize:"3.5rem"}}>{prodInfoItem.emoji}</div>
              <button onClick={()=>setProdInfoOpen(false)} style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,.4)",border:"none",color:"rgba(255,255,255,.7)",fontSize:20,cursor:"pointer",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
            </div>
            <div style={{padding:"20px 20px 0"}}>
              {/* Naam & prijs */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:"0.48rem",letterSpacing:2,color:C.gold,textTransform:"uppercase",marginBottom:3}}>{prodInfoItem.label}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem",color:C.white,lineHeight:1.2}}>{prodInfoItem.name}</div>
                  <div style={{fontSize:"0.58rem",color:C.muted,marginTop:4}}>{prodInfoItem.sub}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.6rem",color:C.goldL}}>
                    {prodInfoItem.price>0 ? `€ ${prodInfoItem.price.toFixed(2).replace(".",",")}` : "Gratis"}
                  </div>
                  {prodInfoItem.price>0 && <div style={{fontSize:"0.48rem",color:C.dim}}>per m²</div>}
                </div>
              </div>

              {/* Omschrijving */}
              {prodInfoItem.longDesc && (
                <p style={{fontSize:"0.7rem",color:C.muted,lineHeight:1.75,marginBottom:16}}>{prodInfoItem.longDesc}</p>
              )}

              {/* Specificaties */}
              {prodInfoItem.specs && prodInfoItem.specs.length > 0 && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:"0.48rem",letterSpacing:2.5,color:C.gold,textTransform:"uppercase",marginBottom:8}}>Specificaties</div>
                  <div style={{display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap:6}}>
                    {prodInfoItem.specs.map(([k,v],i)=>(
                      <div key={i} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${C.bdr}`,borderRadius:7,padding:"8px 10px"}}>
                        <div style={{fontSize:"0.44rem",letterSpacing:1.5,color:C.dim,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                        <div style={{fontSize:"0.66rem",color:C.white,fontWeight:500}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {prodInfoItem.features && prodInfoItem.features.length > 0 && (
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:"0.48rem",letterSpacing:2.5,color:C.gold,textTransform:"uppercase",marginBottom:8}}>Kenmerken</div>
                  {prodInfoItem.features.map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,paddingBottom:7}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:C.gold,flexShrink:0,marginTop:5}}/>
                      <span style={{fontSize:"0.66rem",color:C.muted,lineHeight:1.6}}>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actie knoppen */}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <button onClick={()=>{ setProdInfoOpen(false); openKoop(prodInfoItem); }}
                  style={{width:"100%",padding:"12px",background:"rgba(198,165,107,.15)",border:`1px solid ${C.gold}`,color:C.gold,fontSize:"0.65rem",fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:8}}>
                  Kopen / Bestellen →
                </button>
                <button onClick={()=>{ setProdIdx(prods.findIndex(p=>p.name===prodInfoItem.name)); setProdInfoOpen(false); }}
                  style={{width:"100%",padding:"10px",background:"rgba(255,255,255,.04)",border:`1px solid ${C.bdr}`,color:C.muted,fontSize:"0.6rem",fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",borderRadius:8}}>
                  ✓ Selecteer voor calculator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ KOOP MODAL ══ */}
      {koopOpen && koopProd && (
        <div style={{position:"fixed",inset:0,zIndex:9500,background:"rgba(5,5,5,.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={e=>{if(e.target===e.currentTarget)setKoopOpen(false);}}>
          <div style={{background:C.deep,border:`1px solid ${C.bdr}`,borderTopLeftRadius:20,borderTopRightRadius:20,width:"100%",maxWidth:500,padding:"24px 20px 40px",animation:"slideUp .3s ease",maxHeight:"90vh",overflowY:"auto"}}>
            {!koopDone ? (
              <>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:18}}>
                  <div style={{width:50,height:50,borderRadius:10,background:koopProd.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",flexShrink:0}}>{koopProd.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.5rem",letterSpacing:2,color:C.gold,textTransform:"uppercase"}}>{koopProd.label}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",color:C.white}}>{koopProd.name}</div>
                    <div style={{fontSize:"0.58rem",color:C.muted}}>{koopProd.sub}</div>
                  </div>
                  <button onClick={()=>setKoopOpen(false)} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",lineHeight:1,padding:4}}>✕</button>
                </div>
                {[["Uw naam *",koopNaam,setKoopNaam,"Jan de Vries","text"],
                  ["E-mailadres *",koopEmail,setKoopEmail,"jan@email.nl","email"],
                  ["Telefoonnummer",koopTel,setKoopTel,"06 12 34 56 78","tel"],
                  ["Oppervlakte (m²) *",koopM2,setKoopM2,"bijv. 35","number"],
                ].map(([l,v,s,p,t])=>(
                  <div key={l} style={{marginBottom:10}}>
                    <div style={{fontSize:"0.52rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                    <input type={t} value={v} onChange={e=>s(e.target.value)} placeholder={p} style={{...inp,fontSize:13,padding:"9px 12px"}}/>
                  </div>
                ))}
                {koopProd.price>0 && koopM2 && Number(koopM2)>0 && (
                  <div style={{padding:"10px 14px",background:"rgba(198,165,107,.06)",border:`1px solid ${C.bdr}`,borderRadius:8,marginBottom:14,display:"flex",justifyContent:"space-between",fontSize:"0.68rem"}}>
                    <span style={{color:C.muted}}>{koopM2} m² × € {koopProd.price.toFixed(2)}/m²</span>
                    <span style={{color:C.gold,fontWeight:700}}>€ {(Number(koopM2)*koopProd.price).toLocaleString("nl-NL",{minimumFractionDigits:2})}</span>
                  </div>
                )}
                <button onClick={async()=>{
                  if(!koopNaam.trim()||!koopEmail.trim()||!koopM2) return;
                  await simuleerEmail({aan:"Aureamaisonfloors@gmail.com",
                    onderwerp:`🛒 Bestelling — ${koopProd.name} — ${koopNaam}`,
                    type:"status_update",orderId:null,
                    data:{product:koopProd.name,naam:koopNaam,email:koopEmail,tel:koopTel,m2:koopM2,
                      prijs:koopProd.price>0?`€ ${(Number(koopM2)*koopProd.price).toLocaleString("nl-NL",{minimumFractionDigits:2})}`:"Gratis"}});
                  setKoopDone(true);
                }} style={{width:"100%",padding:"12px",background:"rgba(198,165,107,.15)",border:`1px solid ${C.gold}`,color:C.gold,fontSize:"0.65rem",fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:8}}>
                  Bestelling plaatsen →
                </button>
                <p style={{fontSize:"0.58rem",color:C.dim,textAlign:"center",marginTop:8}}>Na uw bestelling nemen wij binnen 24 uur contact op. Geen aanbetaling vereist.</p>
              </>
            ) : (
              <div style={{textAlign:"center",padding:"24px 0"}}>
                <div style={{fontSize:44,marginBottom:12}}>✓</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.5rem",color:C.white,marginBottom:8}}>Bestelling ontvangen!</div>
                <p style={{fontSize:"0.7rem",color:C.muted,marginBottom:20}}>Bedankt, {koopNaam.split(" ")[0]}! Wij nemen binnen 24 uur contact op.</p>
                <button onClick={()=>setKoopOpen(false)} style={{padding:"10px 24px",background:"none",border:`1px solid ${C.bdr}`,color:C.muted,cursor:"pointer",borderRadius:7,fontSize:"0.62rem"}}>← Sluiten</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TERUGBELVERZOEK MODAL ══ */}
      {tbOpen && (
        <div style={{position:"fixed",inset:0,zIndex:9500,background:"rgba(5,5,5,.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={e=>{if(e.target===e.currentTarget)setTbOpen(false);}}>
          <div style={{background:C.deep,border:`1px solid ${C.bdr}`,borderTopLeftRadius:20,borderTopRightRadius:20,width:"100%",maxWidth:500,padding:"24px 20px 40px",animation:"slideUp .3s ease"}}>
            {!tbDone ? (
              <>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:18}}>
                  <div style={{width:50,height:50,borderRadius:10,background:"linear-gradient(135deg,#0a1a2a,#182838)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem",flexShrink:0}}>📞</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.5rem",letterSpacing:2,color:C.gold,textTransform:"uppercase"}}>Snel contact</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",color:C.white}}>Terugbelverzoek</div>
                    <div style={{fontSize:"0.6rem",color:C.muted}}>Wij bellen u terug op uw gewenste moment.</div>
                  </div>
                  <button onClick={()=>setTbOpen(false)} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>✕</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap:10,marginBottom:12}}>
                  {[["Voornaam *",tbNaam,setTbNaam,"Jan"],["Telefoonnummer *",tbTel,setTbTel,"06 12 34 56 78"]].map(([l,v,s,p])=>(
                    <div key={l}>
                      <div style={{fontSize:"0.52rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                      <input value={v} onChange={e=>s(e.target.value)} placeholder={p} style={{...inp,fontSize:13,padding:"9px 12px"}}/>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:"0.52rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:8}}>Gewenst tijdstip</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {[["☀️ Ochtend","Ochtend 09-12"],["🌤 Middag","Middag 12-17"],["🌙 Avond","Avond 17-20"]].map(([lbl,val])=>(
                      <button key={val} onClick={()=>setTbTijd(tbTijd===val?"":val)}
                        style={{padding:"8px 14px",borderRadius:99,background:tbTijd===val?"rgba(198,165,107,.15)":"rgba(255,255,255,.04)",border:`1px solid ${tbTijd===val?C.gold:C.bdr}`,color:tbTijd===val?C.gold:C.muted,fontSize:"0.66rem",cursor:"pointer",transition:"all .2s"}}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:"0.52rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:4}}>Korte vraag (optioneel)</div>
                  <textarea value={tbVraag} onChange={e=>setTbVraag(e.target.value)} placeholder="Bijv. prijs visgraat voor 40m²..." rows={3} style={{...inp,resize:"vertical",fontSize:13,padding:"9px 12px"}}/>
                </div>
                <button onClick={async()=>{
                  if(!tbNaam.trim()||!tbTel.trim()) return;
                  await simuleerEmail({aan:"Aureamaisonfloors@gmail.com",
                    onderwerp:`📞 Terugbelverzoek — ${tbNaam} — ${tbTijd||"Geen voorkeur"}`,
                    type:"status_update",orderId:null,
                    data:{naam:tbNaam,tel:tbTel,tijdstip:tbTijd||"Geen voorkeur",vraag:tbVraag}});
                  setTbDone(true);
                }} style={{width:"100%",padding:"12px",background:"rgba(198,165,107,.15)",border:`1px solid ${C.gold}`,color:C.gold,fontSize:"0.65rem",fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:8}}>
                  Terugbelverzoek indienen →
                </button>
                <p style={{fontSize:"0.58rem",color:C.dim,textAlign:"center",marginTop:8}}>Wij bellen u terug binnen 4 uur tijdens kantoortijden.</p>
              </>
            ) : (
              <div style={{textAlign:"center",padding:"24px 0"}}>
                <div style={{fontSize:44,marginBottom:12}}>📞</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.5rem",color:C.white,marginBottom:8}}>Verzoek ontvangen!</div>
                <p style={{fontSize:"0.7rem",color:C.muted,marginBottom:20}}>Wij bellen u zo snel mogelijk terug{tbTijd?` (${tbTijd})`:""}.</p>
                <button onClick={()=>setTbOpen(false)} style={{padding:"10px 24px",background:"none",border:`1px solid ${C.bdr}`,color:C.muted,cursor:"pointer",borderRadius:7,fontSize:"0.62rem"}}>← Sluiten</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SHOWROOM AAN HUIS MODAL ══ */}
      {shOpen && (
        <div style={{position:"fixed",inset:0,zIndex:9500,background:"rgba(5,5,5,.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={e=>{if(e.target===e.currentTarget)setShOpen(false);}}>
          <div style={{background:C.deep,border:`1px solid ${C.bdr}`,borderTopLeftRadius:20,borderTopRightRadius:20,width:"100%",maxWidth:500,animation:"slideUp .3s ease",maxHeight:"92vh",overflowY:"auto"}}>

            {/* Sticky header */}
            <div style={{position:"sticky",top:0,background:C.deep,borderBottom:`1px solid ${C.bdr}`,padding:"16px 20px",display:"flex",alignItems:"center",gap:14,zIndex:2}}>
              <div style={{width:46,height:46,borderRadius:10,background:"rgba(198,165,107,.1)",border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",flexShrink:0}}>🏠</div>
              <div style={{flex:1}}>
                <div style={{fontSize:"0.46rem",letterSpacing:2,color:C.gold,textTransform:"uppercase"}}>Gratis service</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",color:C.white}}>Showroom aan Huis</div>
              </div>
              <button onClick={()=>setShOpen(false)} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",flexShrink:0}}>✕</button>
            </div>

            <div style={{padding:"18px 20px 36px"}}>
              {!shDone ? (
                <>
                  <div style={{padding:"10px 14px",background:"rgba(60,184,122,.05)",border:"1px solid rgba(60,184,122,.2)",borderRadius:8,marginBottom:18,fontSize:"0.64rem",color:"#5ad4a2",lineHeight:1.8}}>
                    ✓ Volledig gratis &nbsp;·&nbsp; Wij brengen 20+ stalen mee &nbsp;·&nbsp; U hoeft niets te doen
                  </div>

                  {/* Velden */}
                  {[
                    ["Uw naam *",       shNaam,  setShNaam,  "Jan de Vries",         "text"],
                    ["E-mailadres",     shEmail, setShEmail, "jan@email.nl",         "email"],
                    ["Telefoonnummer *",shTel,   setShTel,   "06 12 34 56 78",       "tel"],
                    ["Bezoekadres *",   shAdres, setShAdres, "Straat + nr, Postcode, Stad","text"],
                  ].map(([l,v,s,p,t])=>(
                    <div key={l} style={{marginBottom:10}}>
                      <div style={{fontSize:"0.5rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                      <input type={t} value={v} onChange={e=>s(e.target.value)} placeholder={p} style={{...inp,fontSize:13,padding:"9px 12px"}}/>
                    </div>
                  ))}

                  {/* Voorkeur datum */}
                  <div style={{display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap:10,marginBottom:10}}>
                    <div>
                      <div style={{fontSize:"0.5rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:4}}>Voorkeursdatum</div>
                      <input type="date" style={{...inp,fontSize:13,padding:"9px 12px"}} min={new Date().toISOString().split("T")[0]}
                        onChange={e=>setShNaam(prev=>prev)} /* datum in aparte var — zie hieronder */
                        id="sh-datum"/>
                    </div>
                    <div>
                      <div style={{fontSize:"0.5rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:4}}>Voorkeurstijd</div>
                      <select style={{...inp,fontSize:13,padding:"9px 12px"}} id="sh-tijd">
                        {["Ochtend (9-12)","Middag (12-17)","Avond (17-20)","Gehele dag"].map(t=>(
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dienst van interesse */}
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:"0.5rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:4}}>Dienst van interesse</div>
                    <select style={{...inp,fontSize:13,padding:"9px 12px"}} id="sh-dienst" defaultValue={det.title}>
                      {Object.keys(DIENST_PRODUCTS).map(d=>(
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <button onClick={async()=>{
                    if(!shNaam.trim()||!shTel.trim()||!shAdres.trim()) { toast("Vul naam, telefoon en adres in","error"); return; }
                    const datum = document.getElementById("sh-datum")?.value || "Niet opgegeven";
                    const tijd  = document.getElementById("sh-tijd")?.value  || "Niet opgegeven";
                    const dienst= document.getElementById("sh-dienst")?.value || det.title;
                    const aanvraag = {
                      id:"sh-"+Date.now(), naam:shNaam.trim(), email:shEmail.trim(),
                      tel:shTel.trim(), adres:shAdres.trim(), datum, tijd, dienst,
                      aangemeldAt:new Date().toISOString(), status:"Nieuw", bron:"dienst_detail",
                    };
                    await saveShowroomAanvraag(aanvraag);
                    await sendEmail("info@aureamaisonfloors.nl",
                      `🏠 Showroom aan huis — ${shNaam} — ${shAdres}`,
                      `<p><strong>Nieuwe showroom aan huis aanvraag</strong></p><p>Naam: ${shNaam}<br>Email: ${shEmail}<br>Tel: ${shTel}<br>Adres: ${shAdres}<br>Datum: ${datum}<br>Tijd: ${tijd}<br>Dienst: ${dienst}</p>`);
                    setShDone(true);
                  }} style={{width:"100%",padding:"13px",background:C.gold,border:"none",color:"#050505",fontSize:"0.65rem",fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:9}}>
                    🏠 Afspraak aanvragen →
                  </button>
                  <p style={{fontSize:"0.58rem",color:C.dim,textAlign:"center",marginTop:8,lineHeight:1.7}}>Wij bevestigen uw afspraak binnen 24 uur. Volledig vrijblijvend.</p>
                </>
              ) : (
                <div style={{textAlign:"center",padding:"32px 0"}}>
                  <div style={{fontSize:52,marginBottom:14}}>🏠</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.6rem",color:C.white,marginBottom:10}}>Aanvraag ontvangen!</div>
                  <p style={{fontSize:"0.7rem",color:C.muted,lineHeight:1.8,marginBottom:24}}>
                    Bedankt {shNaam.split(" ")[0] ? `, ${shNaam.split(" ")[0]}` : ""}! Wij nemen binnen 24 uur contact op om uw afspraak te bevestigen.
                  </p>
                  <button onClick={()=>setShOpen(false)} style={{padding:"11px 28px",background:"rgba(198,165,107,.1)",border:`1px solid ${C.gold}`,color:C.gold,cursor:"pointer",borderRadius:8,fontSize:"0.62rem",fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>
                    ← Sluiten
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ─── DIENSTEN CAROUSEL ──────────────────────────────────────── */
export function DienstenCarousel({ goOfferte, goShowroom }: { goOfferte: () => void; goShowroom?: () => void }) {
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
        {det && <DienstDetail det={det} onClose={() => setDetail(null)} onOfferte={() => { setDetail(null); goOfferte(); }} onShowroom={goShowroom} />}
      </div>
    </>
  );
}
