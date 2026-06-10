"use client";

import { cn } from "@/lib/utils";

interface GoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export function GoldButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className,
}: GoldButtonProps) {
  const variants = {
    primary:
      "bg-gold text-background hover:bg-gold-light border-transparent",
    outline:
      "bg-transparent text-gold border-gold/50 hover:bg-gold/10 hover:border-gold",
    ghost:
      "bg-transparent text-gold/70 border-transparent hover:text-gold hover:bg-gold/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-wide transition-all duration-200 border disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}
