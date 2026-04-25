interface InsightBannerProps {
  type: "error" | "warning" | "success" | "info";
  icon: string;
  message: string;
}

const styles = {
  error: { bg: "bg-[#ffdad6]", text: "text-[#93000a]", fill: "1" },
  warning: { bg: "bg-[#fff3cd]", text: "text-[#92400e]", fill: "1" },
  success: { bg: "bg-[#d1fae5]", text: "text-[#065f46]", fill: "1" },
  info: { bg: "bg-[#eff6ff]", text: "text-[#1d4ed8]", fill: "0" },
};

export function InsightBanner({ type, icon, message }: InsightBannerProps) {
  const s = styles[type];
  return (
    <div className={`flex items-start gap-3 ${s.bg} ${s.text} rounded-2xl px-5 py-3.5 text-sm font-medium`}>
      <span
        className="material-symbols-outlined text-[18px] shrink-0 mt-px"
        style={{ fontVariationSettings: `'FILL' ${s.fill}` }}
      >
        {icon}
      </span>
      <span>{message}</span>
    </div>
  );
}
