"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "@/lib/landing/colors";
import { useMobile } from "@/hooks/use-mobile";

const photos = [
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221279/IMG_0271_jbpfyq.jpg", label: "Trap renovatie", cat: "Traprenovatie" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221279/IMG_0272_djuf9p.jpg", label: "Slaapkamer", cat: "Parket" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221279/IMG_0273_upnb5g.jpg", label: "Woonkamer", cat: "Parket" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221279/IMG_0283_n6l13n.jpg", label: "Luxe interieur", cat: "Massief Parket" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221279/IMG_0281_muwa9p.jpg", label: "Badkamer", cat: "PVC Vloer" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221278/IMG_0288_wvksoq.jpg", label: "Afwerking", cat: "PVC Vloer" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221278/IMG_0282_qxoyw6.jpg", label: "Luxe woning", cat: "Massief Parket" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221278/IMG_0279_z51tgy.jpg", label: "Entree", cat: "Parket" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221278/IMG_0285_x0hylx.jpg", label: "Project", cat: "Parket" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221278/IMG_0274_khegpg.jpg", label: "Eetkamer", cat: "PVC Vloer" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221278/IMG_0286_nb3mus.jpg", label: "Renovatie", cat: "Laminaat" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221277/IMG_0275_z9mzdw.jpg", label: "Gang", cat: "PVC Vloer" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221277/IMG_0276_q7m57j.jpg", label: "Hal", cat: "Laminaat" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221276/IMG_0284_zh5sjg.jpg", label: "Detail", cat: "Visgraat" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221276/IMG_0277_md6tii.jpg", label: "Visgraat detail", cat: "Visgraat" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221276/IMG_0278_s5wnip.jpg", label: "Woonkamer visgraat", cat: "Visgraat" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221276/IMG_0287_vd1kya.jpg", label: "Kantoor", cat: "Laminaat" },
  { url: "https://res.cloudinary.com/dqnmlaijc/image/upload/v1779221276/IMG_0280_akidjh.jpg", label: "Open keuken", cat: "Parket" },
];

export function GallerySection() {
  const mobile = useMobile();
  const cats = ["Alle", ...Array.from(new Set(photos.map((p) => p.cat)))];
  const [activecat, setActivecat] = useState("Alle");
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const carouselEl = useRef<HTMLDivElement | null>(null);
  const carouselRef = useCallback((node: HTMLDivElement | null) => { carouselEl.current = node; }, []);

  const filtered = activecat === "Alle" ? photos : photos.filter((p) => p.cat === activecat);

  useEffect(() => {
    setActiveIdx(0);
    if (carouselEl.current) carouselEl.current.scrollTo({ left: 0, behavior: "instant" as any });
  }, [activecat]);

  useEffect(() => {
    const id = "gallery-carousel-styles";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      .amf-carousel { display:flex; align-items:center; gap:14px; overflow-x:scroll; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none; padding-left:11%; padding-right:11%; cursor:grab; }
      .amf-carousel:active { cursor:grabbing; }
      .amf-carousel::-webkit-scrollbar { display:none; }
      .amf-slide { flex:0 0 78%; scroll-snap-align:center; position:relative; overflow:hidden; border-radius:6px; aspect-ratio:4/3; background:#111; cursor:pointer; transition: transform .35s cubic-bezier(.25,.1,.25,1), opacity .35s cubic-bezier(.25,.1,.25,1), box-shadow .35s; transform:scale(0.86); opacity:0.5; }
      .amf-slide.amf-active { transform:scale(1); opacity:1; box-shadow:0 18px 52px rgba(0,0,0,.55); }
      .amf-slide img { width:100%; height:100%; display:block; object-fit:cover; pointer-events:none; -webkit-user-drag:none; }
      .amf-slide-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(5,5,5,.85) 0%,transparent 55%); opacity:0; transition:opacity .3s; display:flex; flex-direction:column; justify-content:flex-end; padding:16px 14px; }
      .amf-slide.amf-active:hover .amf-slide-overlay { opacity:1; }
    `;
    document.head.appendChild(s);
  }, []);

  function handleCarouselScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const slideW = el.querySelector<HTMLElement>(".amf-slide")?.offsetWidth;
    if (!slideW) return;
    const idx = Math.round(el.scrollLeft / (slideW + 14));
    if (idx !== activeIdx) setActiveIdx(Math.max(0, Math.min(filtered.length - 1, idx)));
  }

  function scrollToIdx(idx: number) {
    const el = carouselEl.current;
    if (!el) return;
    const slideW = el.querySelector<HTMLElement>(".amf-slide")?.offsetWidth || 0;
    el.scrollTo({ left: idx * (slideW + 14), behavior: "smooth" });
  }

  return (
    <section id="galerij" style={{ padding: mobile ? "70px 0" : "120px 0", background: C.bg }}>
      <div style={{ padding: mobile ? "0 5%" : "0 7%", marginBottom: 36 }}>
        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: "0.54rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 8 }}>Ons Werk</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: mobile ? "2.6rem" : "4.5rem", fontWeight: 300, lineHeight: 1, letterSpacing: -1 }}>
              Onze <em style={{ fontStyle: "italic", color: C.goldL }}>Projecten</em>
            </h2>
          </div>
          <p style={{ fontSize: "0.76rem", color: C.muted, lineHeight: 1.9, maxWidth: 340 }}>
            Een selectie van onze premium vloerprojecten — van strakke PVC vloeren tot tijdloze visgraat en massief parket.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {cats.map((c) => (
            <button key={c} onClick={() => setActivecat(c)}
              style={{ padding: "7px 18px", border: `1px solid ${activecat === c ? C.gold : "rgba(198,165,107,0.2)"}`, background: activecat === c ? "rgba(198,165,107,0.12)" : "transparent", color: activecat === c ? C.gold : C.muted, fontSize: "0.62rem", letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 3, fontFamily: "'Jost',sans-serif", transition: "all .2s" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div ref={carouselRef} className="amf-carousel" onScroll={handleCarouselScroll}>
        {filtered.map((p, i) => (
          <div key={p.url} className={`amf-slide${i === activeIdx ? " amf-active" : ""}`}
            onClick={() => { if (i === activeIdx) setLightbox(i); else scrollToIdx(i); }}>
            <img src={p.url} alt={p.label} loading="lazy" />
            <div className="amf-slide-overlay">
              <div style={{ fontSize: "0.58rem", letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>{p.cat}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.white }}>{p.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, padding: mobile ? "0 5%" : "0 7%" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => scrollToIdx(Math.max(0, activeIdx - 1))} disabled={activeIdx <= 0}
            style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid rgba(198,165,107,${activeIdx <= 0 ? .15 : .35})`, background: "rgba(198,165,107,0.08)", color: C.gold, fontSize: "1.4rem", cursor: activeIdx <= 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: activeIdx <= 0 ? .25 : 1, transition: "all .2s" }}>‹</button>
          <button onClick={() => scrollToIdx(Math.min(filtered.length - 1, activeIdx + 1))} disabled={activeIdx >= filtered.length - 1}
            style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid rgba(198,165,107,${activeIdx >= filtered.length - 1 ? .15 : .35})`, background: "rgba(198,165,107,0.08)", color: C.gold, fontSize: "1.4rem", cursor: activeIdx >= filtered.length - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: activeIdx >= filtered.length - 1 ? .25 : 1, transition: "all .2s" }}>›</button>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", maxWidth: "60%" }}>
          {filtered.map((_, i) => (
            <div key={i} onClick={() => scrollToIdx(i)}
              style={{ width: i === activeIdx ? 18 : 5, height: 5, borderRadius: i === activeIdx ? 3 : "50%", background: i === activeIdx ? C.gold : "rgba(198,165,107,0.25)", cursor: "pointer", transition: "all .25s", flexShrink: 0 }} />
          ))}
        </div>
        <div style={{ fontSize: "0.62rem", color: "rgba(248,245,239,.35)", letterSpacing: 1, whiteSpace: "nowrap" }}>
          {activeIdx + 1} / {filtered.length}
        </div>
      </div>

      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 4000, background: "rgba(5,5,5,0.97)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: mobile ? 8 : 24, animation: "fadeIn .2s ease" }}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox((l) => (l !== null && l > 0 ? l - 1 : filtered.length - 1)); }}
            style={{ position: "fixed", left: mobile ? 8 : 24, top: "50%", transform: "translateY(-50%)", background: "rgba(198,165,107,.12)", border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "1.5rem", cursor: "pointer", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4001 }}>‹</button>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh", position: "relative", textAlign: "center" }}>
            <img src={filtered[lightbox].url} alt={filtered[lightbox].label}
              style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 4, display: "block", margin: "0 auto" }} />
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: "0.6rem", letterSpacing: 2, textTransform: "uppercase", color: C.gold }}>{filtered[lightbox].cat}</span>
              <span style={{ color: C.dim, margin: "0 10px" }}>·</span>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", color: C.white }}>{filtered[lightbox].label}</span>
              <span style={{ color: C.dim, margin: "0 10px" }}>·</span>
              <span style={{ fontSize: "0.62rem", color: C.muted }}>{lightbox + 1} / {filtered.length}</span>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setLightbox((l) => (l !== null && l < filtered.length - 1 ? l + 1 : 0)); }}
            style={{ position: "fixed", right: mobile ? 8 : 24, top: "50%", transform: "translateY(-50%)", background: "rgba(198,165,107,.12)", border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "1.5rem", cursor: "pointer", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4001 }}>›</button>
          <button onClick={() => setLightbox(null)}
            style={{ position: "fixed", top: mobile ? 8 : 20, right: mobile ? 8 : 20, background: "rgba(198,165,107,.12)", border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "1.2rem", cursor: "pointer", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4001 }}>×</button>
        </div>
      )}
    </section>
  );
}
