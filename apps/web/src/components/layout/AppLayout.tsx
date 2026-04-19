"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/session";
import LogoutButton from "@/components/auth/LogoutButton";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
}

const rootNavItems: NavItem[] = [
  { href: "/dashboard", label: "Panel", icon: "dashboard", roles: ["Root"] },
  { href: "/admin/usuarios", label: "Usuarios", icon: "group", roles: ["Root"] },
  { href: "/admin/roles", label: "Roles y Permisos", icon: "verified_user", roles: ["Root"] },
  { href: "/admin/ajustes", label: "Ajustes del Sistema", icon: "settings", roles: ["Root"] },
  { href: "/admin/logs", label: "Registros", icon: "history", roles: ["Root"] },
];

const operationalNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ["Administrador", "Secretaria", "Domiciliario"] },
  { href: "/secretaria/inventario", label: "Inventario", icon: "inventory_2", roles: ["Administrador", "Secretaria"] },
  { href: "/ventas", label: "Ventas", icon: "receipt_long", roles: ["Administrador", "Secretaria", "Domiciliario"] },
  { href: "/clientes", label: "Clientes", icon: "group", roles: ["Administrador", "Secretaria"] },
  { href: "/pagos", label: "Pagos", icon: "payments", roles: ["Administrador", "Secretaria", "Domiciliario"] },
  { href: "/reportes", label: "Reportes", icon: "analytics", roles: ["Administrador", "Secretaria"] },
];

export default function AppLayout({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRoot = user.role === "Root";
  const navItems = isRoot ? rootNavItems : operationalNavItems;
  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isRoot) {
    return (
      <div className="flex min-h-screen bg-[#fcf9f8]">
        {/* Root Sidebar */}
        <aside className="h-screen w-72 rounded-r-[2rem] sticky top-0 left-0 flex flex-col gap-2 p-6 bg-[#fcf9f8] shadow-2xl shadow-stone-200/40 z-40 shrink-0">
          <div className="mb-8 px-4">
            <h1 className="text-xl font-black tracking-tighter text-[#735c00]" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>ORO CAMPO</h1>
            <p className="text-xs font-medium text-stone-500 tracking-tight" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Gestión de Administrador</p>
          </div>
          <nav className="flex flex-col gap-2 flex-grow">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                    isActive
                      ? "bg-stone-200/50 text-[#735c00] font-bold"
                      : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/30"
                  }`}
                >
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {item.icon}
                  </span>
                  <span className="text-sm tracking-tight" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-6 border-t border-stone-100">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 ring-2 ring-[#d4af37]/30 flex items-center justify-center">
                <span className="text-sm font-bold text-[#735c00]">{initials}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-on-surface truncate">{user.name ?? user.email}</p>
                <p className="text-[10px] uppercase tracking-widest text-stone-500">{user.role}</p>
              </div>
              <LogoutButton iconOnly />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-grow flex flex-col min-h-screen overflow-auto">
          {/* TopAppBar */}
          <header className="w-full sticky top-0 z-50 bg-[#fcf9f8]/80 backdrop-blur-xl flex items-center justify-between px-10 py-4 border-b border-[#1c1b1b]/5">
            <div className="flex items-center gap-6 flex-grow">
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
                <input
                  className="w-full bg-[#f6f3f2] border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  placeholder="Buscar recursos del sistema..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-stone-400 ml-6">
              <button className="hover:text-stone-900 transition-colors relative p-2">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="hover:text-stone-900 transition-colors p-2">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
          </header>
          <div className="p-10 flex flex-col gap-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Operational sidebar for Admin, Secretaria, Domiciliario
  return (
    <div className="flex min-h-screen bg-[#fcf9f8]">
      {/* Sidebar */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 flex-col bg-[#fcf9f8] border-r border-[#1c1b1b]/5 z-50">
        <div className="flex flex-col gap-2 p-6 h-full">
          <div className="mb-8">
            <h1 className="font-bold text-xl text-[#735c00]" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>ORO CAMPO</h1>
            <p className="text-xs opacity-60">Distribución Premium</p>
          </div>
          <nav className="flex-1 flex flex-col gap-1">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20 font-bold"
                      : "text-[#1c1b1b]/70 hover:bg-[#d4af37]/5 hover:translate-x-1"
                  }`}
                >
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-[#1c1b1b]/5">
            {["Administrador", "Secretaria"].includes(user.role) && (
              <Link
                href="/ventas/nueva"
                className="w-full bg-[#735c00] text-white rounded-full py-3 font-bold text-sm mb-4 shadow-md hover:opacity-90 active:scale-95 transition-all text-center block"
              >
                Nueva Venta
              </Link>
            )}
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#735c00]">{initials}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-[#1c1b1b] truncate">{user.name ?? user.email}</p>
                <p className="text-[10px] text-[#1c1b1b]/50">{user.role}</p>
              </div>
              <LogoutButton iconOnly />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen flex-1">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-8 h-16 bg-[#fcf9f8]/80 backdrop-blur-md shadow-sm border-b border-[#1c1b1b]/5">
          <div className="flex items-center gap-4">
            <span className="md:hidden material-symbols-outlined text-[#735c00]">menu</span>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#1c1b1b]/40 text-lg">search</span>
              <input
                className="bg-[#f6f3f2] border-none rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] w-64"
                placeholder="Buscar..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-[#1c1b1b]/60 hover:text-[#735c00] transition-colors p-2">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
            </button>
            <button className="text-[#1c1b1b]/60 hover:text-[#735c00] transition-colors p-2">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center border border-[#d4af37]/30">
              <span className="text-xs font-bold text-[#735c00]">{initials}</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#fcf9f8] shadow-2xl flex items-center justify-around px-4 z-50 border-t border-[#1c1b1b]/5">
          <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${pathname === "/dashboard" ? "text-[#d4af37]" : "text-[#1c1b1b]/40"}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-bold">Panel</span>
          </Link>
          <Link href="/secretaria/inventario" className={`flex flex-col items-center gap-1 ${pathname.startsWith("/secretaria/inventario") ? "text-[#d4af37]" : "text-[#1c1b1b]/40"}`}>
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-[10px] font-medium">Stock</span>
          </Link>
          <Link href="/ventas" className={`flex flex-col items-center gap-1 ${pathname.startsWith("/ventas") ? "text-[#d4af37]" : "text-[#1c1b1b]/40"}`}>
            <span className="material-symbols-outlined">add_circle</span>
            <span className="text-[10px] font-medium">Venta</span>
          </Link>
          <Link href="/pagos" className={`flex flex-col items-center gap-1 ${pathname.startsWith("/pagos") ? "text-[#d4af37]" : "text-[#1c1b1b]/40"}`}>
            <span className="material-symbols-outlined">payments</span>
            <span className="text-[10px] font-medium">Pagos</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#1c1b1b]/40">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-medium">Perfil</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
