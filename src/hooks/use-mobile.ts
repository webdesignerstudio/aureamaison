"use client";

import { useState, useEffect } from "react";

export function useMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth <= 768);
    window.addEventListener("resize", fn, { passive: true });
    fn();
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}
