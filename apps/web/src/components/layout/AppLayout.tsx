"use client";

import { useState } from "react";
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

const adminNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ["Administrador"] },
  { href: "/secretaria/inventario", label: "Inventario", icon: "inventory_2", roles: ["Administrador"] },
  { href: "/ventas", label: "Ventas", icon: "receipt_long", roles: ["Administrador"] },
  { href: "/clientes", label: "Clientes", icon: "group", roles: ["Administrador"] },
  { href: "/pagos", label: "Pagos", icon: "payments", roles: ["Administrador"] },
  { href: "/reportes", label: "Reportes", icon: "analytics", roles: ["Administrador"] },
];

const secretariaNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ["Secretaria"] },
  { href: "/secretaria/inventario", label: "Inventario", icon: "inventory_2", roles: ["Secretaria"] },
  { href: "/secretaria/movimientos", label: "Movimientos", icon: "swap_horiz", roles: ["Secretaria"] },
  { href: "/ventas", label: "Ventas", icon: "receipt_long", roles: ["Secretaria"] },
  { href: "/clientes", label: "Clientes", icon: "group", roles: ["Secretaria"] },
  { href: "/pagos", label: "Pagos", icon: "payments", roles: ["Secretaria"] },
];

const domiciliarioNavItems: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: "home", roles: ["Domiciliario"] },
  { href: "/ventas", label: "Registrar Venta", icon: "receipt_long", roles: ["Domiciliario"] },
  { href: "/pagos", label: "Registrar Pago", icon: "payments", roles: ["Domiciliario"] },
];

function getInitials(user: SessionUser) {
  return (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AppLayout({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRoot = user.role === "Root";
  const navItems = isRoot ? rootNavItems
    : user.role === "Administrador" ? adminNavItems
    : user.role === "Secretaria" ? secretariaNavItems
    : domiciliarioNavItems;
  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));
  const initials = getInitials(user);

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  if (isRoot) {
    return (
      <div className="flex min-h-screen bg-[#fcf9f8]">
        {/* Root Sidebar */}
        <aside className="h-screen w-72 rounded-r-[2rem] sticky top-0 left-0 flex flex-col gap-2 p-6 bg-[#fcf9f8] shadow-2xl shadow-stone-200/40 z-40 shrink-0">
          <div className="mb-8 px-4">
            <h1
              className="text-xl font-black tracking-tighter text-[#735c00]"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              ORO CAMPO
            </h1>
            <p
              className="text-xs font-medium text-stone-500 tracking-tight"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              Gestión de Administrador
            </p>
          </div>

          <nav className="flex flex-col gap-1 flex-grow">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-stone-200/50 text-[#735c00] font-bold"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/30"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive(item.href) ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-sm tracking-tight" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-stone-100">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 ring-2 ring-[#d4af37]/30 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-[#735c00]">{initials}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-[#1c1b1b] truncate">{user.name ?? user.email}</p>
                <p className="text-[10px] uppercase tracking-widest text-stone-500">{user.role}</p>
              </div>
              <LogoutButton iconOnly />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-grow flex flex-col min-h-screen overflow-auto">
          <header className="w-full sticky top-0 z-50 bg-[#fcf9f8]/80 backdrop-blur-xl flex items-center justify-between px-10 py-4 border-b border-[#1c1b1b]/5">
            <div className="flex items-center gap-6 flex-grow">
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" style={{ fontSize: "1.125rem" }}>
                  search
                </span>
                <input
                  className="w-full bg-[#f6f3f2] border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  placeholder="Buscar recursos del sistema..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-stone-400 ml-6">
              <button className="hover:text-stone-900 transition-colors p-2 rounded-xl hover:bg-stone-100">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="hover:text-stone-900 transition-colors p-2 rounded-xl hover:bg-stone-100">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
          </header>
          <div className="p-10 flex flex-col gap-8">{children}</div>
        </main>
      </div>
    );
  }

  // ── Operational Layout ──────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex flex-col gap-2 p-6 h-full">
      <div className="mb-8">
        <h1
          className="font-black text-xl text-[#735c00]"
          style={{ fontFamily: "var(--font-manrope), sans-serif" }}
        >
          ORO CAMPO
        </h1>
        <p className="text-xs text-[#1c1b1b]/40 font-medium">Distribución Premium</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive(item.href)
                ? "bg-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20 font-bold"
                : "text-[#1c1b1b]/70 hover:bg-[#d4af37]/10 hover:text-[#1c1b1b]"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive(item.href) ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-[#1c1b1b]/5">
        {["Administrador", "Secretaria"].includes(user.role) && (
          <Link
            href="/ventas"
            onClick={() => setMobileOpen(false)}
            className="w-full bg-[#735c00] text-white rounded-full py-3 font-bold text-sm mb-3 shadow-md hover:opacity-90 active:scale-95 transition-all text-center block"
          >
            Nueva Venta
          </Link>
        )}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 ring-1 ring-[#d4af37]/30 flex items-center justify-center shrink-0">
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
  );

  return (
    <div className="flex min-h-screen bg-[#fcf9f8]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 flex-col bg-[#fcf9f8] border-r border-[#1c1b1b]/5 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-72 h-full bg-[#fcf9f8] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen flex-1">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-6 md:px-8 h-16 bg-[#fcf9f8]/80 backdrop-blur-md shadow-sm border-b border-[#1c1b1b]/5">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-xl text-[#735c00] hover:bg-[#d4af37]/10 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative hidden sm:flex items-center">
              <span
                className="material-symbols-outlined absolute left-3 text-[#1c1b1b]/40"
                style={{ fontSize: "1.125rem" }}
              >
                search
              </span>
              <input
                className="input pl-10 py-1.5 w-56"
                placeholder="Buscar..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative text-[#1c1b1b]/50 hover:text-[#735c00] transition-colors p-2 rounded-xl hover:bg-[#d4af37]/10">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full" />
            </button>
            <button className="text-[#1c1b1b]/50 hover:text-[#735c00] transition-colors p-2 rounded-xl hover:bg-[#d4af37]/10">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 ring-1 ring-[#d4af37]/30 flex items-center justify-center ml-1">
              <span className="text-xs font-bold text-[#735c00]">{initials}</span>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#fcf9f8]/95 backdrop-blur-md shadow-2xl flex items-center justify-around px-2 z-50 border-t border-[#1c1b1b]/5">
          {visibleItems.slice(0, 5).map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${active ? "text-[#d4af37]" : "text-[#1c1b1b]/40"}`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={active ? { fontVariationSettings: "'FILL' 1", fontSize: "1.375rem" } : { fontSize: "1.375rem" }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[9px] font-bold">{item.label}</span>
                </Link>
              );
            })}
        </nav>
      </main>
    </div>
  );
}
