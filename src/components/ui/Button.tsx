"use client";

import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center font-mono font-medium tracking-wider uppercase transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden";

  const variants = {
    primary: [
      "bg-gradient-to-r from-amber-glow/90 to-amber-dim/80 text-[#0a0804]",
      "hover:from-amber-glow hover:to-amber-glow/90",
      "shadow-[0_0_20px_rgba(232,145,42,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]",
      "hover:shadow-[0_0_30px_rgba(232,145,42,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]",
      "border border-amber-glow/30",
    ].join(" "),
    secondary: [
      "bg-teal-glow/5 text-teal-pale border border-teal-glow/20",
      "hover:bg-teal-glow/10 hover:border-teal-glow/40",
      "shadow-[0_0_15px_rgba(0,180,190,0.05)]",
      "hover:shadow-[0_0_25px_rgba(0,180,190,0.15)]",
      "backdrop-blur-sm",
    ].join(" "),
    ghost: [
      "text-[#8a8070] hover:text-amber-pale",
      "hover:bg-amber-glow/5",
      "border border-transparent hover:border-amber-glow/10",
    ].join(" "),
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px] rounded-sm",
    md: "px-5 py-2.5 text-[11px] rounded-sm",
    lg: "px-8 py-3.5 text-xs rounded-sm",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {/* Scanline effect on hover */}
      <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none scanlines" />
      {loading && (
        <span className="mr-2 flex">
          <span className="w-1 h-1 bg-current rounded-full animate-pulse" />
          <span className="w-1 h-1 bg-current rounded-full animate-pulse ml-1" style={{ animationDelay: "0.15s" }} />
          <span className="w-1 h-1 bg-current rounded-full animate-pulse ml-1" style={{ animationDelay: "0.3s" }} />
        </span>
      )}
      {children}
    </button>
  );
}
