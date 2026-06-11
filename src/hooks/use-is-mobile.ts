"use client";

import { useState, useEffect } from "react";

export function useIsMobile() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn, { passive: true });
    fn();
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w <= 768, width: w };
}
