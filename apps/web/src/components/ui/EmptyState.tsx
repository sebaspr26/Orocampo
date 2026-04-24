import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
          <span
            className="material-symbols-outlined text-[#735c00]"
            style={{ fontSize: "1.75rem" }}
          >
            {icon}
          </span>
        </div>
      )}
      <h5 className="font-bold text-[#1c1b1b] mb-1">{title}</h5>
      {description && (
        <p className="text-sm text-[#7f7663] max-w-xs mx-auto mt-1">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
