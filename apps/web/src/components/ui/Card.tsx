import type { ReactNode } from "react";

export type CardVariant = "white" | "gold" | "surface";

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

const variantClass: Record<CardVariant, string> = {
  white: "card",
  gold: "card-gold",
  surface: "card-surface",
};

export default function Card({
  variant = "white",
  children,
  className = "",
  onClick,
  padding = true,
}: CardProps) {
  return (
    <div
      className={`${variantClass[variant]} ${padding ? "p-8" : ""} ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
