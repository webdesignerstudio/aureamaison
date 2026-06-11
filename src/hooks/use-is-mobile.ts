"use client";

import { useState, useEffect } from "react";

export function useIsMobile() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, width: w };
}
