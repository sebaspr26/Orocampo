import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  footer?: ReactNode;
  variant?: "white" | "gold";
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  footer,
  variant = "white",
  className = "",
}: StatCardProps) {
  const isGold = variant === "gold";

  return (
    <div
      className={`${isGold ? "card-gold" : "card"} p-8 flex flex-col gap-4 relative overflow-hidden group ${className}`}
    >
      {icon && (
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isGold ? "bg-white/20" : "bg-[#d4af37]/10"
          }`}
        >
          <span
            className={`material-symbols-outlined ${isGold ? "text-white" : "text-[#735c00]"}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
      )}

      <div>
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${
            isGold ? "text-white/80" : "text-[#1c1b1b]/50"
          }`}
        >
          {label}
        </p>
        <h3
          className={`text-3xl font-black tracking-tighter mt-1 ${
            isGold ? "text-white" : "text-[#1c1b1b]"
          }`}
        >
          {value}
        </h3>
      </div>

      {footer && <div>{footer}</div>}

      {icon && (
        <span
          className={`material-symbols-outlined absolute -bottom-8 -right-8 text-[140px] pointer-events-none group-hover:scale-110 transition-transform duration-700 ${
            isGold ? "text-white/5" : "text-[#d4af37]/5"
          }`}
        >
          {icon}
        </span>
      )}
    </div>
  );
}
