"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleLogout}
        className="text-stone-400 hover:text-[#ba1a1a] transition-colors p-1"
        title="Cerrar sesión"
      >
        <span className="material-symbols-outlined text-sm">logout</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-3 text-[#1c1b1b]/70 hover:bg-[#d4af37]/5 rounded-xl transition-all w-full"
    >
      <span className="material-symbols-outlined">logout</span>
      <span className="text-sm">Cerrar Sesión</span>
    </button>
  );
}
