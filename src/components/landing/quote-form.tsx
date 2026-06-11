// @ts-nocheck
"use client";

import { useState } from "react";
import { C } from "@/lib/landing/colors";
import { useMobile } from "@/hooks/use-mobile";
import { simuleerEmail } from "@/lib/landing/utils";
import { DIENST_PRODUCTS } from "@/lib/landing/data";
import { useCreateOrder } from "@/hooks/use-orders";

// ── Buiten QuoteForm gedefinieerd zodat focus niet verloren gaat bij re-render ──
function OCard({v, icon, lbl:l, desc, selected, onT, big, mobile}) {
  return (
    <div onClick={onT} style={{position:"relative",cursor:"pointer",background:selected?"rgba(198,165,107,.06)":"#0a0a08",border:`1px solid ${selected?"#C6A56B":"rgba(198,165,107,0.18)"}`,padding:big?mobile?"14px":"28px 24px":mobile?"14px":"20px 18px",transition:"all .25s",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8,borderRadius:4}}>
      {selected && <span style={{position:"absolute",top:12,right:14,color:"#C6A56B",fontSize:"0.72rem"}}>✓</span>}
      {icon && <div style={{fontSize:"1.6rem",opacity:selected?1:.65}}>{icon}</div>}
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:mobile?"0.95rem":"1.1rem",fontWeight:400,color:selected?"#E2C895":"#F8F5EF"}}>{l}</div>
      {desc&&!mobile && <div style={{fontSize:"0.66rem",color:"rgba(248,245,239,0.5)",lineHeight:1.7}}>{desc}</div>}
    </div>
  );
}

function NavRow({onPrev, onNext, nextLabel="Volgende", disabled=false, submitting=false}) {
  return (
    <div style={{display:"flex",justifyContent:onPrev?"space-between":"flex-end",marginTop:32,gap:10}}>
      {onPrev && <button onClick={onPrev} style={{padding:"13px 26px",background:"transparent",color:"rgba(248,245,239,0.5)",fontSize:"0.64rem",letterSpacing:3,textTransform:"uppercase",border:"1px solid rgba(198,165,107,0.18)",cursor:"pointer",borderRadius:6}}>← Terug</button>}
      <button onClick={onNext} disabled={disabled} style={{padding:"13px 32px",background:"#C6A56B",color:"#050505",fontSize:"0.64rem",fontWeight:700,letterSpacing:3,textTransform:"uppercase",border:"none",cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8,borderRadius:6,opacity:disabled?.5:1}}>
        {submitting?<><span style={{width:16,height:16,border:"2px solid rgba(5,5,5,0.3)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>{nextLabel}…</>:<>{nextLabel} →</>}
      </button>
    </div>
  );
}

function QuoteForm({ onClose, onDone }: { onClose: () => void; onDone?: (order: any) => void }) {
  const mobile = useMobile();
  const [step, setStep]       = useState(1);
  const [floorTypes, setFloorTypes] = useState([]);
  const [selectedProds, setSelectedProds] = useState([]); // gekozen catalogusproducten
  const [roomType, setRoomType]   = useState("");
  const [sqm, setSqm]             = useState(50);
  const [budget, setBudget]       = useState(3000);
  const [timing, setTiming]       = useState("");
  const [extras, setExtras]       = useState([]);
  const [notes, setNotes]         = useState("");
  const [fname, setFname]         = useState("");
  const [lname, setLname]         = useState("");
  const [qEmail, setQEmail]       = useState("");
  const [qTel, setQTel]           = useState("");
  const [postcode, setPostcode]   = useState("");
  const [reach, setReach]         = useState("telefoon");
  const [qErr, setQErr]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const createOrder = useCreateOrder();

  const ranges = {pvc:[25,55],visgraat:[45,90],parket:[55,110],traprenovatie:[0,0],egaliseren:[8,18],advies:[0,0]};
  function est() {
    const af=floorTypes.filter(f=>ranges[f]&&ranges[f][0]>0);
    if(!af.length) return {lo:sqm*30,hi:sqm*65,pm:"30—65"};
    const lo=Math.min(...af.map(f=>ranges[f][0])),hi=Math.max(...af.map(f=>ranges[f][1]));
    return {lo:lo*sqm,hi:hi*sqm,pm:`${lo}—${hi}`};
  }
  const e = est();
  const eur = v => `€ ${v.toLocaleString("nl-NL")}`;

  const floorOpts = [["pvc","◼","PVC Vloer","Duurzaam, waterbestendig en eenvoudig onderhoud."],["visgraat","◈","Visgraat","Architectonisch patroon met tijdloze allure."],["parket","◫","Massief Parket","Warme, naturelle uitstraling."],["traprenovatie","◧","Traprenovatie","Volledig geïntegreerd met uw vloer."],["egaliseren","▭","Egaliseren","De perfecte basis voor uw vloer."],["advies","◉","Advies nodig","Showroom aan huis — gratis."]];
  const roomOpts = [["woonkamer","Woonkamer"],["slaapkamer","Slaapkamer"],["keuken","Keuken"],["geheel","Hele woning"]];
  const extraOpts = [["showroom","Showroom aan Huis","Gratis stalen bij u thuis"],["traprenovatie","Traprenovatie","Geïntegreerd met de vloer"],["ondervloer","Ondervloer / Geluidsisolatie","Extra comfort"],["vloerverwarming","Vloerverwarming","Geschikt maken voor vloerverwarming"],["plinten","Plinten plaatsen","Nette afwerking"],["slopen","Oude vloer slopen","Complete sanering"],["egaliseren","Egaliseren","Dekvloer waterpas maken"],["interieuradvies","Interieuradvies","Kleur & materiaaladvies"]];
  const lbl = {pvc:"PVC Vloer",visgraat:"Visgraat",parket:"Massief Parket",traprenovatie:"Traprenovatie",egaliseren:"Egaliseren",advies:"Advies nodig",woonkamer:"Woonkamer",slaapkamer:"Slaapkamer",keuken:"Keuken",geheel:"Hele woning",showroom:"Showroom",ondervloer:"Ondervloer",vloerverwarming:"Vloerverwarming",plinten:"Plinten",slopen:"Slopen & Afvoeren",interieuradvies:"Interieuradvies"};

  const doSubmit = async () => {
    if(!fname.trim()||!lname.trim()||!qTel.trim()){setQErr("⚠ Vul naam en telefoonnummer in.");return;}
    if(qEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(qEmail)){setQErr("⚠ Ongeldig e-mailadres.");return;}
    setQErr(""); setSubmitting(true);

    try {
      const vloerTypeMap = {
        pvc:"PVC / Vinyl", visgraat:"Visgraat", parket:"Parket",
        traprenovatie:"Traprenovatie", egaliseren:"Egaliseren", advies:"Advies"
      };
      const vloerTypes = floorTypes.map(f=>vloerTypeMap[f]||f);
      const extrasList = extras.map(v=>({
        showroom:"Showroom aan Huis", traprenovatie:"Traprenovatie",
        ondervloer:"Ondervloer / Geluidsisolatie", vloerverwarming:"Vloerverwarming",
        plinten:"Plinten plaatsen", slopen:"Oude vloer slopen",
        egaliseren:"Egaliseren", interieuradvies:"Interieuradvies"
      }[v]||v));

      const newOrder = {
        id: "qf-" + Date.now(),
        clientName: `${fname.trim()} ${lname.trim()}`,
        clientEmail: qEmail.trim()||"",
        tel: qTel.trim(),
        postcode: postcode.trim()||"",
        straat: "", plaats: "", adres: "",
        vloerType: vloerTypes.join(", ") || "Nader te bepalen",
        oppervlakte: String(sqm),
        budget: String(budget),
        kamers: lbl[roomType] || "",
        timing: timing || "",
        extras: extrasList,
        opmerking: [
          notes,
          extras.length ? "Extra's: "+extrasList.join(", ") : "",
          timing ? "Planning: "+timing : "",
          `Budget: € ${budget.toLocaleString("nl-NL")}`,
          `Contactvoorkeur: ${reach}`,
          `Ruimte: ${lbl[roomType]||""}`,
          selectedProds.length ? `Voorkeur producten: ${selectedProds.map(k=>{const[ft,idx]=k.split("-");const dk={pvc:"PVC Vloeren",visgraat:"Visgraat",parket:"Massief Parket",traprenovatie:"Traprenovatie"}[ft];return DIENST_PRODUCTS[dk]?.[+idx]?.name||k;}).join(", ")}` : "",
        ].filter(Boolean).join(" | "),
        status: "Ingediend",
        statusHistory: [{status:"Ingediend", date:new Date().toISOString(), door:"Website offerte aanvraag"}],
        createdAt: new Date().toISOString(),
        price: null, invoiceNr: null, invoicePaid: false,
        bron: "website_offerte",
        type: "particulier",
      };

      await createOrder.mutateAsync({
        client_name: newOrder.clientName,
        client_email: newOrder.clientEmail || "",
        straat: "",
        postcode: newOrder.postcode || "",
        plaats: "",
        vloer_type: newOrder.vloerType,
        oppervlakte: Number(newOrder.oppervlakte) || 0,
        budget: Number(budget) || 0,
        timing: newOrder.timing || "",
        status: "ingediend",
        notes: newOrder.opmerking || "",
        company_id: "11111111-1111-1111-1111-111111111111",
      });

      await simuleerEmail({
        aan: "Aureamaisonfloors@gmail.com",
        onderwerp: `Nieuwe offerte aanvraag — ${newOrder.clientName} — ${vloerTypes.join("/")}`,
        type: "offerte_aanvraag_website",
        orderId: newOrder.id,
        data: {
          naam: newOrder.clientName,
          tel: qTel,
          email: qEmail||"—",
          vloerType: newOrder.vloerType,
          oppervlakte: sqm+"m²",
          budget: "€"+budget.toLocaleString("nl-NL"),
          timing,
          extras: extrasList.join(", ")||"Geen",
        },
      });

      setSubmitting(false);
      setSuccess(true);
      if (onDone) onDone(newOrder);

    } catch(err) {
      setSubmitting(false);
      setQErr("⚠ Fout bij versturen. Probeer opnieuw.");
    }
  };



  if (success) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{textAlign:"center",maxWidth:460}}>
        <div style={{width:76,height:76,border:`1px solid ${C.gold}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",margin:"0 auto 28px",color:C.gold,animation:"successPulse 2s ease infinite"}}>✓</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.8rem",fontWeight:300,marginBottom:14}}>Aanvraag <em style={{fontStyle:"italic",color:C.goldL}}>Ontvangen</em></h2>
        <p style={{fontSize:"0.76rem",color:C.muted,lineHeight:2,marginBottom:32}}>Bedankt voor uw aanvraag. Ons team neemt binnen 24 uur contact op voor een persoonlijk gesprek.</p>
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
          {[["📞 06 2827 3570","tel:0628273570"],["💬 WhatsApp","https://wa.me/31628273570"],["✉ E-mail","mailto:Aureamaisonfloors@gmail.com"]].map(([l,h])=>(
            <a key={l} href={h} target={h.startsWith("http")?"_blank":undefined} rel="noopener" style={{padding:"12px 18px",background:C.deep,border:`1px solid ${C.bdr}`,fontSize:"0.62rem",letterSpacing:"1.5px",textTransform:"uppercase",color:C.gold,textDecoration:"none",borderRadius:4}}>{l}</a>
          ))}
        </div>
        <button onClick={onClose} style={{padding:"11px 24px",background:"transparent",border:`1px solid ${C.bdr}`,color:C.muted,fontSize:"0.62rem",letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:6}}>Sluiten</button>
      </div>
    </div>
  );

  const progress = [1,2,3,4];
  return (
    <div style={{minHeight:"100vh",padding:mobile?"90px 20px 40px":"60px 20px"}}>
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse 60% 50% at 20% 20%,rgba(198,165,107,.05),transparent 60%),radial-gradient(ellipse 50% 60% at 80% 80%,rgba(198,165,107,.04),transparent 60%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:860,margin:"0 auto",position:"relative"}}>
        {/* HEADER */}
        <div style={{textAlign:"center",marginBottom:mobile?36:56}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",letterSpacing:6,color:C.gold,marginBottom:8,textTransform:"uppercase"}}>Aurea Maison Floors</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:mobile?"2.2rem":"3.4rem",fontWeight:300,lineHeight:1,letterSpacing:"-.5px",marginBottom:14}}>
            Vrijblijvende <em style={{fontStyle:"italic",color:C.goldL}}>Offerte</em> Aanvragen
          </h1>
          <p style={{fontSize:"0.76rem",color:C.muted,letterSpacing:"1px",lineHeight:1.8}}>Beantwoord 4 eenvoudige vragen — wij sturen u binnen 24 uur een maatwerkoffer</p>
        </div>

        {/* PROGRESS */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:mobile?40:56}}>
          {progress.map((n,i)=>(
            <div key={n} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:30,height:30,borderRadius:"50%",border:`1px solid ${step>n?"rgba(198,165,107,.5)":step===n?C.gold:"rgba(198,165,107,.2)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:"0.9rem",background:step>n?"rgba(198,165,107,.08)":"transparent",color:step>=n?C.gold:"rgba(198,165,107,.25)",boxShadow:step===n?"0 0 20px rgba(198,165,107,.15)":"none",transition:"all .3s"}}>
                  {step>n?"✓":n}
                </div>
                {!mobile && <span style={{fontSize:"0.6rem",letterSpacing:2,textTransform:"uppercase",color:step===n?C.gold:step>n?"rgba(198,165,107,.5)":"rgba(248,245,239,.25)"}}>{["Vloertype","Oppervlakte","Extra's","Gegevens"][i]}</span>}
              </div>
              {n<4 && <div style={{width:mobile?28:60,height:1,background:step>n?"rgba(198,165,107,.35)":"rgba(198,165,107,.1)",margin:"0 8px",transition:"background .3s"}}/>}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step===1 && (
          <div style={{animation:"slideUp .45s ease both"}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:mobile?"1.7rem":"2rem",fontWeight:300,marginBottom:8}}>Welk type <em style={{fontStyle:"italic",color:C.goldL}}>vloer</em> heeft uw voorkeur?</h2>
            <p style={{fontSize:"0.73rem",color:C.muted,letterSpacing:"1px",marginBottom:32}}>Kies één of meerdere opties — wij adviseren u graag</p>
            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(3,1fr)",gap:3,marginBottom:28}}>
              {floorOpts.map(([v,ic,l,d])=><OCard key={v} v={v} icon={ic} lbl={l} desc={d} selected={floorTypes.includes(v)} onT={()=>setFloorTypes(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v])} big mobile={mobile}/>)}
            </div>

            {/* ── CATALOGUS PICKER — zichtbaar zodra vloertype gekozen ── */}
            {floorTypes.filter(f=>f!=="advies"&&f!=="egaliseren").length > 0 && (
              <div style={{marginBottom:28,borderTop:`1px solid ${C.bdr}`,paddingTop:24}}>
                <div style={{fontSize:"0.6rem",letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:6}}>Heeft u al een voorkeur uit onze catalogus?</div>
                <p style={{fontSize:"0.65rem",color:C.dim,marginBottom:16,lineHeight:1.7}}>Optioneel — kies een specifiek product zodat wij een nauwkeurigere offerte kunnen maken.</p>
                {floorTypes.filter(f=>f!=="advies"&&f!=="egaliseren").map(fType=>{
                  const dienstKey = {pvc:"PVC Vloeren",visgraat:"Visgraat",parket:"Massief Parket",traprenovatie:"Traprenovatie"}[fType];
                  const prods = (DIENST_PRODUCTS[dienstKey]||[]);
                  if (!prods.length) return null;
                  return (
                    <div key={fType} style={{marginBottom:16}}>
                      <div style={{fontSize:"0.52rem",letterSpacing:2,color:C.muted,textTransform:"uppercase",marginBottom:8}}>{dienstKey}</div>
                      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"}}>
                        {prods.map((p,pi)=>{
                          const prodKey = fType+"-"+pi;
                          const isChosen = selectedProds.includes(prodKey);
                          return (
                            <div key={pi} onClick={()=>setSelectedProds(prev=>prev.includes(prodKey)?prev.filter(x=>x!==prodKey):[...prev,prodKey])}
                              style={{flexShrink:0,width:140,borderRadius:10,overflow:"hidden",border:`1.5px solid ${isChosen?C.gold:C.bdr}`,cursor:"pointer",transition:"border-color .2s",background:isChosen?"rgba(198,165,107,.05)":"rgba(255,255,255,.02)"}}>
                              <div style={{height:72,background:p.bg,position:"relative",overflow:"hidden"}}>
                                {p.img
                                  ? <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.7)"}}/>
                                  : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem"}}>{p.emoji}</div>
                                }
                                {isChosen && (
                                  <div style={{position:"absolute",top:5,right:5,background:C.gold,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#050505",fontWeight:700}}>✓</div>
                                )}
                              </div>
                              <div style={{padding:"8px 9px"}}>
                                <div style={{fontSize:"0.42rem",letterSpacing:1.5,color:isChosen?C.gold:C.dim,textTransform:"uppercase",marginBottom:2}}>{p.label}</div>
                                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"0.75rem",color:C.white,lineHeight:1.2,marginBottom:3}}>{p.name}</div>
                                {p.price>0 && <div style={{fontSize:"0.55rem",color:C.goldL}}>€ {p.price.toFixed(2).replace(".",",")} /m²</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{marginBottom:20}}>
              <div style={{fontSize:"0.6rem",letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:10}}>Ruimte type</div>
              <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:3}}>
                {roomOpts.map(([v,l])=><OCard key={v} v={v} lbl={l} selected={roomType===v} onT={()=>setRoomType(v)} mobile={mobile}/>)}
              </div>
            </div>
            <NavRow onNext={()=>setStep(2)}/>
          </div>
        )}

        {/* STEP 2 */}
        {step===2 && (
          <div style={{animation:"slideUp .45s ease both"}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:mobile?"1.7rem":"2rem",fontWeight:300,marginBottom:8}}>Wat is de <em style={{fontStyle:"italic",color:C.goldL}}>oppervlakte</em> en uw budget?</h2>
            <p style={{fontSize:"0.73rem",color:C.muted,letterSpacing:"1px",marginBottom:36}}>Dit helpt ons een nauwkeurige prijsindicatie te geven</p>

            {/* SQM SLIDER */}
            <div style={{marginBottom:36}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
                <span style={{fontSize:"0.63rem",letterSpacing:2,textTransform:"uppercase",color:C.muted}}>Oppervlakte</span>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:mobile?"1.8rem":"2.4rem",fontWeight:300,color:C.gold,lineHeight:1}}>
                  {sqm} <sup style={{fontSize:"1rem",color:"#8B6E3E"}}>m²</sup>
                </div>
              </div>
              <input type="range" min={10} max={500} value={sqm} step={5} onChange={e=>setSqm(+e.target.value)}
                style={{WebkitAppearance:"none",width:"100%",height:1,outline:"none",cursor:"pointer",background:`linear-gradient(to right,${C.gold} ${((sqm-10)/490*100)}%,rgba(198,165,107,.15) ${((sqm-10)/490*100)}%)`}}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
                {["10m²","125m²","250m²","375m²","500m²"].map(t=><span key={t} style={{fontSize:"0.58rem",color:"rgba(248,245,239,.2)"}}>{t}</span>)}
              </div>
            </div>

            {/* BUDGET SLIDER */}
            <div style={{marginBottom:32}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
                <span style={{fontSize:"0.63rem",letterSpacing:2,textTransform:"uppercase",color:C.muted}}>Budget indicatie</span>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:mobile?"1.8rem":"2.4rem",fontWeight:300,color:C.gold,lineHeight:1}}>
                  € {budget.toLocaleString("nl-NL")}
                </div>
              </div>
              <input type="range" min={500} max={50000} value={budget} step={500} onChange={e=>setBudget(+e.target.value)}
                style={{WebkitAppearance:"none",width:"100%",height:1,outline:"none",cursor:"pointer",background:`linear-gradient(to right,${C.gold} ${((budget-500)/49500*100)}%,rgba(198,165,107,.15) ${((budget-500)/49500*100)}%)`}}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
                {["€500","€12.5k","€25k","€37.5k","€50k+"].map(t=><span key={t} style={{fontSize:"0.58rem",color:"rgba(248,245,239,.2)"}}>{t}</span>)}
              </div>
            </div>

            {/* ESTIMATE */}
            <div style={{background:"rgba(198,165,107,.05)",border:"1px solid rgba(198,165,107,.2)",padding:mobile?"18px":"26px 30px",marginBottom:28,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14,borderRadius:4}}>
              <div>
                <div style={{fontSize:"0.6rem",letterSpacing:3,textTransform:"uppercase",color:C.muted,marginBottom:6}}>Prijsindicatie (incl. materiaal &amp; plaatsing)</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:mobile?"1.8rem":"2.4rem",fontWeight:300,color:C.gold,lineHeight:1}}>{eur(e.lo)} — {eur(e.hi)}</div>
                <div style={{fontSize:"0.62rem",color:"rgba(248,245,239,.3)",marginTop:4}}>Definitieve prijs na inmeting op locatie</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:"0.6rem",letterSpacing:3,textTransform:"uppercase",color:C.muted,marginBottom:6}}>Prijs per m²</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.5rem",color:C.goldL}}>€ {e.pm}</div>
              </div>
            </div>

            {/* TIMING */}
            <div style={{borderBottom:`1px solid ${C.bdr}`,borderTop:`1px solid ${C.bdr}`,marginBottom:20}}>
              <label style={{display:"block",fontSize:"0.56rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,padding:"14px 0 4px"}}>Wanneer wilt u de vloer laten leggen?</label>
              <select value={timing} onChange={e=>setTiming(e.target.value)} style={{width:"100%",background:"transparent",border:"none",outline:"none",color:C.white,fontFamily:"'Cormorant Garamond',serif",fontSize:"1.15rem",fontWeight:300,padding:"0 0 14px",cursor:"pointer",colorScheme:"dark",WebkitAppearance:"none"}}>
                <option value="">Kies een periode…</option>
                {["Zo snel mogelijk","Binnen 1 maand","Binnen 3 maanden","Binnen 6 maanden","Ik ben aan het oriënteren"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>

            <NavRow onPrev={()=>setStep(1)} onNext={()=>setStep(3)}/>
          </div>
        )}

        {/* STEP 3 */}
        {step===3 && (
          <div style={{animation:"slideUp .45s ease both"}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:mobile?"1.7rem":"2rem",fontWeight:300,marginBottom:8}}>Zijn er <em style={{fontStyle:"italic",color:C.goldL}}>extra's</em> gewenst?</h2>
            <p style={{fontSize:"0.73rem",color:C.muted,letterSpacing:"1px",marginBottom:32}}>Selecteer alles wat van toepassing is — meerdere opties mogelijk</p>
            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:3,marginBottom:28}}>
              {extraOpts.map(([v,name,note])=>(
                <div key={v} onClick={()=>setExtras(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v])} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:extras.includes(v)?"rgba(198,165,107,.04)":C.deep,border:`1px solid ${extras.includes(v)?C.gold:C.bdr}`,cursor:"pointer",transition:"all .25s"}}>
                  <div style={{width:20,height:20,border:`1px solid ${extras.includes(v)?C.gold:C.bdr}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.68rem",color:extras.includes(v)?C.gold:"transparent",background:extras.includes(v)?"rgba(198,165,107,.1)":"transparent",transition:"all .25s"}}>✓</div>
                  <div>
                    <div style={{fontSize:"0.78rem",color:C.white}}>{name}</div>
                    <div style={{fontSize:"0.6rem",color:C.muted,marginTop:2}}>{note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{borderBottom:`1px solid ${C.bdr}`,borderTop:`1px solid ${C.bdr}`,marginBottom:20}}>
              <label style={{display:"block",fontSize:"0.56rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,padding:"14px 0 4px"}}>Aanvullende opmerkingen</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Bijv. nieuwbouw, specifieke kleur, merkvoorkeur…" style={{width:"100%",background:"transparent",border:"none",outline:"none",color:C.white,fontFamily:"'Cormorant Garamond',serif",fontSize:"1.1rem",fontWeight:300,padding:"0 0 14px",minHeight:80,resize:"none",lineHeight:1.6}}/>
            </div>
            <NavRow onPrev={()=>setStep(2)} onNext={()=>setStep(4)}/>
          </div>
        )}

        {/* STEP 4 */}
        {step===4 && (
          <div style={{animation:"slideUp .45s ease both"}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:mobile?"1.7rem":"2rem",fontWeight:300,marginBottom:8}}>Uw <em style={{fontStyle:"italic",color:C.goldL}}>gegevens</em></h2>
            <p style={{fontSize:"0.73rem",color:C.muted,letterSpacing:"1px",marginBottom:28}}>Wij nemen binnen 24 uur contact op — geheel vrijblijvend</p>

            {/* SUMMARY */}
            <div style={{marginBottom:28}}>
              {[[" Vloertype(n)",floorTypes.map(v=>lbl[v]||v).join(", ")||"—"],["Ruimte",lbl[roomType]||"—"],["Oppervlakte",sqm+" m²"],["Budget","€ "+budget.toLocaleString("nl-NL")],["Planning",timing||"—"],["Extra's",extras.map(v=>lbl[v]||v).join(", ")||"Geen"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"13px 0",borderBottom:`1px solid ${C.bdr}`,fontSize:"0.76rem"}}>
                  <span style={{color:C.muted,letterSpacing:1}}>{k}</span>
                  <span style={{color:C.white}}>{v}</span>
                </div>
              ))}
              <div style={{borderTop:`1px solid ${C.bdr}`}}/>
            </div>

            {/* CONTACT FIELDS */}
            <div style={{marginBottom:20}}>
              <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:"0 3px"}}>
                {[["Voornaam *","text","Uw voornaam",fname,setFname],["Achternaam *","text","Uw achternaam",lname,setLname]].map(([l,t,p,v,s])=>(
                  <div key={l} style={{borderBottom:`1px solid ${C.bdr}`,borderTop:`1px solid ${C.bdr}`}}>
                    <label style={{display:"block",fontSize:"0.54rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,padding:"14px 0 4px"}}>{l}</label>
                    <input type={t} value={v} onChange={e=>s(e.target.value)} placeholder={p} required style={{width:"100%",background:"transparent",border:"none",outline:"none",color:C.white,fontFamily:"'Cormorant Garamond',serif",fontSize:"1.15rem",fontWeight:300,padding:"0 0 14px"}}/>
                  </div>
                ))}
              </div>
              {[["E-mailadres","email","uw@emailadres.nl",qEmail,setQEmail],["Telefoonnummer *","tel","06 XX XX XX XX",qTel,setQTel]].map(([l,t,p,v,s])=>(
                <div key={l} style={{borderBottom:`1px solid ${C.bdr}`}}>
                  <label style={{display:"block",fontSize:"0.54rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,padding:"14px 0 4px"}}>{l}</label>
                  <input type={t} value={v} onChange={e=>s(e.target.value)} placeholder={p} style={{width:"100%",background:"transparent",border:"none",outline:"none",color:C.white,fontFamily:"'Cormorant Garamond',serif",fontSize:"1.15rem",fontWeight:300,padding:"0 0 14px"}}/>
                </div>
              ))}
              <div style={{borderBottom:`1px solid ${C.bdr}`}}>
                <label style={{display:"block",fontSize:"0.54rem",letterSpacing:3,textTransform:"uppercase",color:C.gold,padding:"14px 0 4px"}}>Hoe wilt u het liefst benaderd worden?</label>
                <select value={reach} onChange={e=>setReach(e.target.value)} style={{width:"100%",background:"transparent",border:"none",outline:"none",color:C.white,fontFamily:"'Cormorant Garamond',serif",fontSize:"1.15rem",fontWeight:300,padding:"0 0 14px",cursor:"pointer",colorScheme:"dark",WebkitAppearance:"none"}}>
                  {["Telefoon","E-mail","WhatsApp","Geen voorkeur"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <p style={{fontSize:"0.62rem",color:"rgba(248,245,239,.22)",lineHeight:1.9,marginBottom:16}}>
              ✓ Vrijblijvend &nbsp;·&nbsp; ✓ Geen verplichtingen &nbsp;·&nbsp; ✓ Reactie binnen 24 uur &nbsp;·&nbsp; ✓ Gegevens worden niet gedeeld met derden
            </p>
            {qErr && <div style={{fontSize:"0.62rem",color:"#e08080",marginBottom:12}}>{qErr}</div>}
            <NavRow onPrev={()=>setStep(3)} onNext={doSubmit} nextLabel="Offerte Aanvragen" disabled={submitting} submitting={submitting}/>
          </div>
        )}
      </div>
    </div>
  );
}


export default QuoteForm;