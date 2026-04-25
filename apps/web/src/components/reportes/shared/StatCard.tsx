interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  status?: "success" | "warning" | "error";
}

const statusStyle = {
  success: "text-[#065f46]",
  warning: "text-[#92400e]",
  error: "text-[#ba1a1a]",
};

export function StatCard({ label, value, sub, status }: StatCardProps) {
  return (
    <div className="bg-[#f6f3f2] rounded-2xl px-5 py-4">
      <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[#7f7663]">{label}</p>
      <p className={`text-2xl font-extrabold tracking-tighter mt-1 ${status ? statusStyle[status] : "text-[#1c1b1b]"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-[#4d4635] mt-0.5">{sub}</p>}
    </div>
  );
}
