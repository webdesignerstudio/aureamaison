"use client";

import { C } from "@/lib/landing/colors";

interface GoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function GoldButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  className,
}: GoldButtonProps) {
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: C.gold, color: C.bg, border: "1px solid transparent" },
    outline: { background: "transparent", color: C.gold, border: `1px solid ${C.bdrH}` },
    ghost: { background: "transparent", color: C.muted, border: "1px solid transparent" },
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 12px", fontSize: "0.6rem" },
    md: { padding: "9px 20px", fontSize: "0.68rem" },
    lg: { padding: "12px 32px", fontSize: "0.78rem" },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 8,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all .2s",
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
