"use client";

import { useEffect, type ReactNode } from "react";

export type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
}

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export default function Modal({ title, onClose, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-white rounded-[2rem] shadow-2xl shadow-black/10 w-full ${sizeClass[size]} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-8 pb-6">
          <h3
            className="text-xl font-bold text-[#1c1b1b]"
            style={{ fontFamily: "var(--font-manrope), sans-serif" }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f0eded] hover:bg-[#eae7e7] flex items-center justify-center transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[#7f7663]" style={{ fontSize: "1.125rem" }}>
              close
            </span>
          </button>
        </div>
        <div className="px-8 pb-8">{children}</div>
      </div>
    </div>
  );
}
