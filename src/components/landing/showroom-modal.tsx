// @ts-nocheck
"use client";

import { useState } from "react";
import { C } from "@/lib/landing/colors";
import { useMobile } from "@/hooks/use-mobile";
import { saveShowroomAanvraag, simuleerEmail, inp } from "@/lib/landing/utils";
import { DIENST_PRODUCTS } from "@/lib/landing/data";

function ShowroomModal({ onClose, prefDienst="" }: { onClose: () => void; prefDienst?: string }) {
  const mobile = useMobile();
  const [naam,  setNaam]  = useState("");
  const [email, setEmail] = useState("");
  const [tel,   setTel]   = useState("");
  const [adres, setAdres] = useState("");
  const [datum, setDatum] = useState("");
  const [tijd,  setTijd]  = useState("Ochtend (9-12)");
  const [dienst,setDienst]= useState(prefDienst||Object.keys(DIENST_PRODUCTS)[0]);
  const [done,  setDone]  = useState(false);
  const [err,   setErr]   = useState("");
  const [sending,setSending]=useState(false);

  const doSubmit = async () => {
    if(!naam.trim()||!tel.trim()||!adres.trim()){ setErr("Vul naam, telefoon en adres in."); return; }
    setErr(""); setSending(true);
    const aanvraag = {
      id: "sh-"+Date.now(),
      naam: naam.trim(), email: email.trim(), tel: tel.trim(),
      adres: adres.trim(), datum: datum||"Niet opgegeven",
      tijd, dienst, aangemeldAt: new Date().toISOString(),
      status: "Nieuw", bron: "website",
    };
    await saveShowroomAanvraag(aanvraag);
    await simuleerEmail({ aan:"Aureamaisonfloors@gmail.com",
      onderwerp:`🏠 Showroom aan huis — ${naam} — ${adres}`,
      type:"status_update", orderId:null,
      data:{ naam, email, tel, adres, datum:datum||"Niet opgegeven", tijd, dienst }});
    setSending(false); setDone(true);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:9600,background:"rgba(5,5,5,.95)",backdropFilter:"blur(12px)",display:"flex",alignItems:mobile?"flex-end":"center",justifyContent:"center",padding:mobile?0:"20px"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.deep,border:`1px solid ${C.bdr}`,borderRadius:mobile?"20px 20px 0 0":16,width:"100%",maxWidth:520,animation:"slideUp .3s ease",maxHeight:"95vh",overflowY:"auto",display:"flex",flexDirection:"column"}}>

        {/* Header */}
        <div style={{position:"sticky",top:0,background:C.deep,borderBottom:`1px solid ${C.bdr}`,padding:"18px 22px",display:"flex",alignItems:"center",gap:14,zIndex:2,flexShrink:0}}>
          <div style={{width:46,height:46,borderRadius:12,background:"rgba(198,165,107,.08)",border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",flexShrink:0}}>🏠</div>
          <div style={{flex:1}}>
            <div style={{fontSize:"0.44rem",letterSpacing:3,color:C.gold,textTransform:"uppercase",marginBottom:2}}>Gratis service</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.05rem",color:C.white,lineHeight:1.1}}>Showroom aan Huis</div>
            <div style={{fontSize:"0.58rem",color:C.dim,marginTop:2}}>Wij komen met stalen bij u thuis — volledig vrijblijvend</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",flexShrink:0,lineHeight:1}}>✕</button>
        </div>

        <div style={{padding:"20px 22px 36px",flex:1}}>
          {!done ? (
            <>
              {/* USP banner */}
              <div style={{padding:"10px 14px",background:"rgba(60,184,122,.05)",border:"1px solid rgba(60,184,122,.18)",borderRadius:8,marginBottom:20,fontSize:"0.63rem",color:"#5ad4a2",lineHeight:1.8}}>
                ✓ Volledig gratis &nbsp;·&nbsp; 20+ stalen meegebracht &nbsp;·&nbsp; Geen verplichting
              </div>

              {/* Velden */}
              {[
                ["Uw naam *",       naam,  setNaam,  "Jan de Vries",              "text" ],
                ["E-mailadres",     email, setEmail, "jan@email.nl",              "email"],
                ["Telefoonnummer *",tel,   setTel,   "06 12 34 56 78",            "tel"  ],
                ["Bezoekadres *",   adres, setAdres, "Straat + nr, Postcode, Stad","text"],
              ].map(([l,v,s,p,t])=>(
                <div key={l} style={{marginBottom:12}}>
                  <div style={{fontSize:"0.5rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:5}}>{l}</div>
                  <input type={t} value={v} onChange={e=>s(e.target.value)} placeholder={p}
                    style={{...inp,fontSize:14,padding:"10px 14px"}}/>
                </div>
              ))}

              {/* Datum + Tijd */}
              <div style={{display:"grid",gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",gap:10,marginBottom:12}}>
                <div>
                  <div style={{fontSize:"0.5rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:5}}>Voorkeursdatum</div>
                  <input type="date" value={datum} onChange={e=>setDatum(e.target.value)} min={new Date().toISOString().split("T")[0]}
                    style={{...inp,fontSize:13,padding:"10px 12px"}}/>
                </div>
                <div>
                  <div style={{fontSize:"0.5rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:5}}>Tijdvoorkeur</div>
                  <select value={tijd} onChange={e=>setTijd(e.target.value)} style={{...inp,fontSize:13,padding:"10px 12px"}}>
                    {["Ochtend (9-12)","Middag (12-17)","Avond (17-20)","Gehele dag"].map(t=>(
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dienst */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:"0.5rem",letterSpacing:1.5,color:C.muted,textTransform:"uppercase",marginBottom:5}}>Interesse in</div>
                <select value={dienst} onChange={e=>setDienst(e.target.value)} style={{...inp,fontSize:13,padding:"10px 12px"}}>
                  {Object.keys(DIENST_PRODUCTS).map(d=><option key={d}>{d}</option>)}
                </select>
              </div>

              {err && <div style={{color:C.red,fontSize:"0.65rem",marginBottom:12,padding:"8px 12px",background:"rgba(224,90,90,.07)",borderRadius:6}}>⚠ {err}</div>}

              <button onClick={doSubmit} disabled={sending}
                style={{width:"100%",padding:"14px",background:C.gold,border:"none",color:"#050505",fontSize:"0.66rem",fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",cursor:sending?"not-allowed":"pointer",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {sending ? <><span style={{width:16,height:16,border:"2px solid rgba(5,5,5,.3)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/> Versturen…</> : "🏠 Afspraak aanvragen →"}
              </button>
              <p style={{fontSize:"0.58rem",color:C.dim,textAlign:"center",marginTop:10,lineHeight:1.7}}>Wij bevestigen uw afspraak binnen 24 uur. Geheel vrijblijvend.</p>
            </>
          ) : (
            <div style={{textAlign:"center",padding:"32px 0"}}>
              <div style={{fontSize:54,marginBottom:16}}>🏠</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.7rem",color:C.white,marginBottom:10}}>Aanvraag <em style={{fontStyle:"italic",color:C.goldL}}>ontvangen!</em></div>
              <p style={{fontSize:"0.7rem",color:C.muted,lineHeight:1.9,marginBottom:28}}>
                Bedankt{naam?" "+naam.split(" ")[0]:""}! Wij nemen binnen 24 uur contact op om uw afspraak te bevestigen.
              </p>
              <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:20}}>
                {[["📞 Bellen","tel:0628273570"],["💬 WhatsApp","https://wa.me/31628273570"]].map(([l,h])=>(
                  <a key={l} href={h} target={h.startsWith("http")?"_blank":undefined} rel="noopener"
                    style={{padding:"10px 18px",background:C.deep,border:`1px solid ${C.bdr}`,fontSize:"0.6rem",letterSpacing:2,textTransform:"uppercase",color:C.gold,textDecoration:"none",borderRadius:6}}>
                    {l}
                  </a>
                ))}
              </div>
              <button onClick={onClose} style={{padding:"10px 24px",background:"transparent",border:`1px solid ${C.bdr}`,color:C.muted,cursor:"pointer",borderRadius:7,fontSize:"0.62rem",letterSpacing:2,textTransform:"uppercase"}}>
                ← Sluiten
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShowroomModal;